import * as Phaser from 'phaser';
import type { Point } from '../core/geometry';
import { isExit } from '../core/engine';
import type { CharacterId, Hotspot, Pose, Room, RoomOverlay, World } from '../core/types';
import { Walker, walkSheetKey } from './Walker';

const COLORS = {
  wall: 0x2b2238,
  floor: 0x3d3328,
  floorOutline: 0x5c4d3c,
  hotspot: 0x6b5b8c,
  character: 0x4f8a5b,
  text: '#ffffff',
  highlight: 0xffe28a,
};

/** `?art=off` in the URL draws placeholder shapes everywhere, painted rooms included (debugging). */
export const ART_ENABLED = new URLSearchParams(globalThis.location?.search ?? '').get('art') !== 'off';

/** The texture key a room's background painting is loaded under (RoomScene preloads them). */
export const roomArtKey = (room: Room) => `room-art:${room.id}`;

/** The texture key any other art file (a sprite, an overlay) is loaded under, by its path. */
export const artKey = (path: string) => `art:${path}`;

/** Sprites are stored at twice their on-screen size (see `CharacterSprites`). */
export const SPRITE_SCALE = 0.5;

/** How far below a hotspot's top edge its label's top sits. */
const LABEL_OFFSET = 3;

/**
 * Drawing order. Character sprites stand in front of every hotspot box (the solid placeholders in
 * unpainted rooms included); clicks still reach the boxes, since sprites aren't interactive. Labels
 * go on top of everything so revealed names stay readable.
 */
const DEPTH = { overlay: 1, hotspot: 10, sprite: 12, label: 13 };

/** A floating character bobs this many pixels up and back, once per period. */
const BOB = { height: 8, periodMs: 2400 };
/** Floating characters are ghosts (Mordecai): their sprites are drawn a little see-through. */
const GHOST_ALPHA = 0.8;

interface Drawn {
  hotspot: Hotspot;
  objects: Phaser.GameObjects.GameObject[];
  /** Drawn over a painting: no fill or label unless hovered or revealed. */
  invisible: boolean;
  /** The bob, for characters who float. */
  bob?: Phaser.Tweens.Tween | undefined;
  /** The character's painted sprite, under the invisible clickable box. */
  sprite?: Phaser.GameObjects.Image | undefined;
}

export interface RoomViewHandlers {
  onHover: (hotspot: Hotspot | undefined, pointer: Phaser.Input.Pointer) => void;
  onClick: (hotspot: Hotspot, pointer: Phaser.Input.Pointer) => void;
}

/**
 * Draws a room and its hotspots, and reports hotspot hovers and clicks. Knows nothing about rules:
 * it draws the hotspots it's given. A room with a painting (`room.art`) shows it, with its hotspots
 * as invisible areas that glow when hovered; other rooms get placeholder shapes.
 */
export class RoomView {
  private background: Phaser.GameObjects.Graphics | Phaser.GameObjects.Image | undefined;
  private painted = false;
  private overlays: Phaser.GameObjects.Image[] = [];
  private drawn: Drawn[] = [];
  private highlighted: Drawn | undefined;
  /** "Show everything clickable": from the ☰ menu (sticky) or holding H (while held). */
  private reveal = { toggled: false, held: false };

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly handlers: RoomViewHandlers,
    private readonly characters: World['characters'],
  ) {}

  /** Draws a room's background. Call again with another room to switch, then `showHotspots`. */
  showRoom(room: Room): void {
    this.background?.destroy();
    const key = roomArtKey(room);
    this.painted = ART_ENABLED && room.art !== undefined && this.scene.textures.exists(key);
    if (this.painted) {
      const { width, height } = this.scene.scale;
      this.background = this.scene.add.image(0, 0, key).setOrigin(0, 0).setDisplaySize(width, height).setDepth(0);
      return;
    }
    const floor = room.walkable.map((p) => new Phaser.Math.Vector2(p.x, p.y));
    const g = this.scene.add.graphics().setDepth(0);
    g.fillStyle(COLORS.wall).fillRect(0, 0, this.scene.scale.width, this.scene.scale.height);
    g.fillStyle(COLORS.floor).fillPoints(floor, true);
    g.lineStyle(2, COLORS.floorOutline).strokePoints(floor, true);
    this.background = g;
  }

  /** Replaces the painting's overlays (Gary missing an arm). Drawn only over a painting. */
  showOverlays(overlays: readonly RoomOverlay[]): void {
    this.overlays.forEach((o) => o.destroy());
    this.overlays = this.painted
      ? overlays
          .filter((o) => this.scene.textures.exists(artKey(o.image)))
          .map((o) => this.scene.add.image(o.at.x, o.at.y, artKey(o.image)).setOrigin(0, 0).setDepth(DEPTH.overlay))
      : [];
  }

  /** Turns "show everything clickable" on or off from the menu. Returns the new setting. */
  toggleReveal(): boolean {
    this.reveal.toggled = !this.reveal.toggled;
    this.drawn.forEach((d) => this.style(d));
    return this.reveal.toggled;
  }

  get revealOn(): boolean {
    return this.reveal.toggled;
  }

  /** Holding H shows everything clickable while it's held. */
  holdReveal(held: boolean): void {
    this.reveal.held = held;
    this.drawn.forEach((d) => this.style(d));
  }

  /** Replaces the drawn hotspots. Hotspots can appear, vanish, or move with game state. */
  showHotspots(hotspots: readonly Hotspot[]): void {
    this.clearHighlight();
    this.drawn.forEach(({ objects, bob }) => {
      bob?.remove();
      objects.forEach((o) => o.destroy());
    });
    this.drawn = hotspots.map((hotspot) => {
      const spriteKey = this.spriteKey(hotspot);
      // A character with a sprite is drawn as the sprite, with an invisible box on top to click.
      const drawn: Drawn = { hotspot, objects: [], invisible: (this.painted && !hotspot.character) || spriteKey !== undefined };
      drawn.objects = this.draw(drawn);
      if (spriteKey) {
        const { x, y, width, height } = hotspot.bounds;
        // A pose with a walk sheet stands in the sheet's first frame, so walking and standing match.
        const walk = this.walkSheet(hotspot);
        drawn.sprite = this.scene.add
          .image(x + width / 2, y + height, walk ?? spriteKey, walk ? 0 : undefined)
          .setOrigin(0.5, 1)
          .setScale(SPRITE_SCALE)
          .setDepth(DEPTH.sprite);
        drawn.objects.push(drawn.sprite);
      }
      const floats = hotspot.character !== undefined && this.characters[hotspot.character]?.floats;
      // Painted, Mordecai's tail sits in his teapot's spout, so only his placeholder bobs.
      if (floats && !spriteKey) drawn.bob = this.bob(drawn.objects);
      if (floats) drawn.sprite?.setAlpha(GHOST_ALPHA);
      this.style(drawn);
      return drawn;
    });
  }

  /** The texture of a character hotspot's sprite in its pose, if art is on and it has one. */
  private spriteKey(hotspot: Hotspot, pose: Pose = hotspot.pose ?? 'standing'): string | undefined {
    if (!ART_ENABLED || hotspot.character === undefined) return undefined;
    const path = this.characters[hotspot.character]?.sprites?.[pose];
    return path !== undefined && this.scene.textures.exists(artKey(path)) ? artKey(path) : undefined;
  }

  /** The loaded walk sheet for a character hotspot's pose, if it has one. */
  private walkSheet(hotspot: Hotspot): string | undefined {
    if (hotspot.character === undefined) return undefined;
    const walk = this.characters[hotspot.character]?.walks?.[hotspot.pose ?? 'standing'];
    return walk && this.scene.textures.exists(walkSheetKey(walk.sheet)) ? walkSheetKey(walk.sheet) : undefined;
  }

  /** Where a character's lines go: above the hotspot that is that character, if one is drawn. */
  speakerAnchor(character: CharacterId): Point | undefined {
    const entry = this.drawn.find(({ hotspot }) => hotspot.character === character);
    if (!entry) return undefined;
    // From the drawn shape, not the content's bounds: a cutscene walk may have moved it (the finale
    // walks Reginald in from the doorway and he speaks from where he stands).
    const shape = entry.objects[0] as Phaser.GameObjects.Rectangle;
    return { x: shape.x + entry.hotspot.bounds.width / 2, y: shape.y - 12 };
  }

  /** Removes the hover outline (pointer left, coin opened, a scene started). */
  clearHighlight(): void {
    const was = this.highlighted;
    this.highlighted = undefined;
    if (was) this.style(was);
  }

  /** Fill, outline and label for a drawn hotspot, from its state: hovered, revealed, or at rest. */
  private style(d: Drawn): void {
    const [shape, label] = d.objects as [Phaser.GameObjects.Rectangle, Phaser.GameObjects.Text];
    const hovered = this.highlighted === d;
    const revealed = this.reveal.toggled || this.reveal.held;
    if (!d.invisible) {
      // Placeholder rectangles: solid, labelled, a yellow outline on hover.
      if (hovered) shape.setStrokeStyle(3, COLORS.highlight);
      else shape.setStrokeStyle();
      return;
    }
    // Over a painting: nothing at rest; a soft glow on hover; a dashed-looking outline when revealed.
    shape.setFillStyle(COLORS.highlight, hovered ? 0.12 : 0);
    if (hovered) shape.setStrokeStyle(3, COLORS.highlight, 0.9);
    else if (revealed) shape.setStrokeStyle(2, COLORS.highlight, 0.55);
    else shape.setStrokeStyle();
    label.setVisible(revealed);
  }

  get hotspotIds(): string[] {
    return this.drawn.map(({ hotspot }) => hotspot.id);
  }

  /**
   * Slides a character's drawn hotspot so its feet (bottom-centre) end at `to`, then calls
   * `onDone`. Returns a function that finishes the walk immediately. Presentation only: the next
   * hotspot redraw puts the character wherever the content says.
   */
  walkCharacter(character: CharacterId, to: Point, speed: number, onDone: () => void): () => void {
    const entry = this.drawn.find(({ hotspot }) => hotspot.character === character);
    if (!entry) {
      onDone();
      return () => {};
    }
    const { bounds } = entry.hotspot;
    const targets = entry.objects as unknown as { x: number; y: number }[];
    // A floating character stops bobbing for the walk, back at rest height, and bobs again after.
    if (entry.bob) {
      entry.bob.remove();
      entry.bob = undefined;
      targets[0]!.y = bounds.y;
      targets[1]!.y = bounds.y + LABEL_OFFSET;
      if (entry.sprite) entry.sprite.y = bounds.y + bounds.height;
    }
    const dx = to.x - (bounds.x + bounds.width / 2);
    const dy = to.y - (bounds.y + bounds.height);
    if (entry.sprite) {
      // He gets up off the throne to walk, and faces where he's going.
      const standing = entry.hotspot.pose === 'seated' ? this.spriteKey(entry.hotspot, 'standing') : undefined;
      if (standing) entry.sprite.setTexture(standing);
      if (Math.abs(dx) > 1) entry.sprite.setFlipX(dx < 0);
    }
    const walker = this.startWalker(entry, character, dx);
    const starts = targets.map((o) => ({ x: o.x, y: o.y }));
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      tween.stop();
      walker?.stop();
      targets.forEach((o, i) => ((o.x = starts[i]!.x + dx), (o.y = starts[i]!.y + dy)));
      const floats = this.characters[character]?.floats;
      if (floats && !entry.sprite && this.drawn.includes(entry)) entry.bob = this.bob(entry.objects);
      onDone();
    };
    const tween = this.scene.tweens.addCounter({
      from: 0,
      to: 1,
      duration: (Math.hypot(dx, dy) / speed) * 1000,
      onUpdate: (t) => {
        const k = t.getValue() ?? 0;
        targets.forEach((o, i) => ((o.x = starts[i]!.x + dx * k), (o.y = starts[i]!.y + dy * k)));
      },
      onComplete: finish,
    });
    return finish;
  }

  /**
   * A walking character's sprite gives way to a Walker for the pose they walk in (Reginald gets up
   * off the throne to walk as the standing lich), which plays their walk sheet, or hops without
   * one. It joins the drawn objects, so it moves with them and goes at the next redraw, standing.
   * Floating characters glide instead.
   */
  private startWalker(entry: Drawn, character: CharacterId, dx: number): Walker | undefined {
    const info = this.characters[character];
    if (!entry.sprite || info?.floats) return undefined;
    const pose: Pose = entry.hotspot.pose === 'human' ? 'human' : 'standing';
    const path = info?.sprites?.[pose];
    if (path === undefined || !this.scene.textures.exists(artKey(path))) return undefined;
    const walker = new Walker(this.scene, path, info?.walks?.[pose]);
    walker.root.setPosition(entry.sprite.x, entry.sprite.y).setDepth(DEPTH.sprite);
    walker.face(dx < 0 ? 'left' : 'right');
    entry.sprite.setVisible(false);
    entry.objects.push(walker.root);
    walker.start();
    return walker;
  }

  /** Floats a character's drawn objects gently up and down, forever. Presentation only. */
  private bob(objects: Phaser.GameObjects.GameObject[]): Phaser.Tweens.Tween {
    return this.scene.tweens.add({
      targets: objects,
      y: `-=${BOB.height}`,
      duration: BOB.periodMs / 2,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });
  }

  private draw(d: Drawn): Phaser.GameObjects.GameObject[] {
    const { hotspot } = d;
    const { x, y, width, height } = hotspot.bounds;
    // A labelled placeholder rectangle, or (over a painting) an invisible area styled by `style()`.
    const color = hotspot.character ? COLORS.character : COLORS.hotspot;
    // Exits get an arrow cursor pointing toward their side of the screen; everything else the hand.
    const cursor = isExit(hotspot) ? (x + width / 2 < this.scene.scale.width / 2 ? 'w-resize' : 'e-resize') : 'pointer';
    const shape = this.scene.add.rectangle(x, y, width, height, color).setOrigin(0, 0).setDepth(DEPTH.hotspot).setInteractive({ cursor });
    // Labels sit at the top edge so a character standing in front of a hotspot doesn't hide its name.
    const label = this.scene.add
      // Wrapped to the hotspot's width, so a long name ("Cardboard Reginald") stays inside its box.
      .text(x + width / 2, y + LABEL_OFFSET, hotspot.character ? hotspot.name.toUpperCase() : hotspot.name, {
        fontSize: '18px',
        color: COLORS.text,
        align: 'center',
        wordWrap: { width: Math.max(width - 4, 40) },
      })
      .setOrigin(0.5, 0)
      .setDepth(DEPTH.label);

    shape.on('pointerover', (pointer: Phaser.Input.Pointer) => {
      this.clearHighlight();
      this.highlighted = d;
      this.style(d);
      this.handlers.onHover(hotspot, pointer);
    });
    shape.on('pointerout', (pointer: Phaser.Input.Pointer) => {
      if (this.highlighted === d) this.clearHighlight();
      this.handlers.onHover(undefined, pointer);
    });
    shape.on('pointerdown', (pointer: Phaser.Input.Pointer, _x: number, _y: number, event: Phaser.Types.Input.EventData) => {
      event.stopPropagation();
      this.handlers.onClick(hotspot, pointer);
    });
    return [shape, label];
  }
}
