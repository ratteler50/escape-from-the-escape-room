import * as Phaser from 'phaser';
import type { CharacterWalk, WalkFrames, WalkPart, WalkParts } from '../core/types';
import { artKey, SPRITE_SCALE } from './RoomView';

/** How a walk is drawn: a sprite sheet, cutout parts swung in code, or the hop and lean (slice 19). */
export type WalkStyle = 'frames' | 'parts' | 'hop';

/**
 * Slice 27's comparison switch: `?walk=frames|parts|hop` forces one style, where the character has
 * it. Without it, a character walks with frames, then parts, then the hop: the first they have.
 */
const FORCED_STYLE = ((): WalkStyle | undefined => {
  const style = new URLSearchParams(globalThis.location?.search ?? '').get('walk');
  return style === 'frames' || style === 'parts' || style === 'hop' ? style : undefined;
})();

/** Slice 27's comparison: `?fps=N` overrides a walk sheet's frame rate. */
const FORCED_FPS = Number(new URLSearchParams(globalThis.location?.search ?? '').get('fps')) || undefined;

export function walkStyle(walk: CharacterWalk | undefined): WalkStyle {
  if (FORCED_STYLE) return FORCED_STYLE === 'hop' || walk?.[FORCED_STYLE] ? FORCED_STYLE : 'hop';
  return walk?.frames ? 'frames' : walk?.parts ? 'parts' : 'hop';
}

/** The hop and lean: a small hop per step and a lean into the walk, on the standing sprite. */
const HOP = { height: 5, periodMs: 150, leanDegrees: 3 };

/**
 * Cutout walk, in degrees and sheet pixels. One step covers STRIDE on-screen pixels, so the feet keep
 * pace with the floor at any walk speed. A foot keeps only `footRoll` of its leg's tilt, so it stays
 * nearly flat instead of digging its toe into the floor.
 */
const CUTOUT = { stride: 72, thigh: 18, knee: 35, arm: 16, bob: 2, footRoll: 0.3 };

/** The cutout's far limbs are drawn this much darker (a multiply tint). */
const FAR_TINT = 0xb4b4b4;

/** Texture keys of a walk's sprite sheet and its animation. */
export const walkSheetKey = (sheet: string) => `walk:${sheet}`;
const walkAnimKey = (sheet: string) => `walk-anim:${sheet}`;

/** A part on screen: the container that turns at its joint, and what it is. */
interface Joint {
  part: WalkPart;
  turn: Phaser.GameObjects.Container;
}

/**
 * A character's sprite as it walks and stands, in a container whose origin is their feet. Drawn
 * facing right, mirrored to face left. Knows nothing about where they go: the caller moves the
 * container and says when the walk starts and stops.
 */
export class Walker {
  readonly root: Phaser.GameObjects.Container;
  /** The standing sprite's height on screen, for speech anchors. */
  readonly height: number;
  readonly style: WalkStyle;
  /** The standing sprite (hop), or the sheet played frame by frame (frames). */
  private readonly image: Phaser.GameObjects.Sprite | undefined;
  private readonly joints: Joint[] = [];
  /** The cutout's body, which bobs (every part hangs from it). */
  private readonly bodyParts: Phaser.GameObjects.Container[] = [];
  /** How far the hips sit above the feet, in sheet pixels (the cutout drops them as the legs spread). */
  private hipHeight = 0;
  private motion: Phaser.Tweens.Tween | undefined;
  /** The frames style's animation key. */
  private anim: string | undefined;

  constructor(
    private readonly scene: Phaser.Scene,
    standing: string,
    walk: CharacterWalk | undefined,
  ) {
    this.style = walkStyle(walk);
    this.root = scene.add.container(0, 0);
    if (this.style === 'frames' && walk?.frames) {
      this.image = this.framesSprite(walk.frames);
    } else if (this.style === 'parts' && walk?.parts) {
      this.buildParts(walk.parts);
    } else {
      this.image = scene.add.sprite(0, 0, artKey(standing)).setOrigin(0.5, 1);
      this.root.add(this.image);
    }
    this.root.setScale(SPRITE_SCALE);
    this.height = (this.image?.height ?? scene.textures.getFrame(artKey(standing))?.height ?? 0) * SPRITE_SCALE;
  }

  get walking(): boolean {
    return this.motion !== undefined || this.image?.anims.isPlaying === true;
  }

  face(direction: 'left' | 'right'): void {
    this.root.scaleX = (direction === 'left' ? -1 : 1) * SPRITE_SCALE;
  }

  /** Starts the walk cycle (the caller moves the root). `speed` is in logical pixels per second. */
  start(speed: number): void {
    this.stop();
    if (this.style === 'frames') {
      this.image!.play(this.anim!);
      return;
    }
    if (this.style === 'parts') {
      // One cycle is two steps. It starts at "passing" (legs together), the pose nearest standing.
      this.motion = this.scene.tweens.addCounter({
        from: 0,
        to: Math.PI * 2,
        duration: ((2 * CUTOUT.stride) / speed) * 1000,
        repeat: -1,
        onUpdate: (t) => this.pose(t.getValue() ?? 0),
      });
      return;
    }
    // The lean is drawn facing right; mirroring the root mirrors it too.
    this.image!.setAngle(HOP.leanDegrees);
    this.motion = this.scene.tweens.add({
      targets: this.image,
      y: -HOP.height / SPRITE_SCALE,
      duration: HOP.periodMs / 2,
      ease: 'Sine.easeOut',
      yoyo: true,
      repeat: -1,
    });
  }

  /** Back to the standing pose at once: arriving, skipping, or entering a room. */
  stop(): void {
    this.motion?.remove();
    this.motion = undefined;
    if (this.style === 'frames') this.image!.stop().setFrame(0);
    else if (this.style === 'parts') this.pose(undefined);
    else this.image!.setPosition(0, 0).setAngle(0);
  }

  destroy(): void {
    this.stop();
    this.root.destroy();
  }

  private framesSprite(frames: WalkFrames): Phaser.GameObjects.Sprite {
    const key = walkSheetKey(frames.sheet);
    const anim = walkAnimKey(frames.sheet);
    this.anim = anim;
    if (!this.scene.anims.exists(anim)) {
      this.scene.anims.create({
        key: anim,
        frames: this.scene.anims.generateFrameNumbers(key, { start: 1, end: frames.frames }),
        frameRate: FORCED_FPS ?? frames.fps,
        repeat: -1,
      });
    }
    const sprite = this.scene.add.sprite(0, 0, key, 0).setOrigin(0.5, 1);
    this.root.add(sprite);
    return sprite;
  }

  /** Cuts each part out of the sheet (as a named frame of its texture) and pins it at its joint. */
  private buildParts(parts: WalkParts): void {
    const key = artKey(parts.sheet);
    const texture = this.scene.textures.get(key);
    const body = this.scene.add.container(0, 0);
    this.root.add(body);
    this.bodyParts.push(body);
    const byId = new Map<string, Phaser.GameObjects.Container>();
    for (const part of parts.parts) {
      const frame = `part:${part.id}`;
      if (!texture.has(frame)) texture.add(frame, 0, part.crop.x, part.crop.y, part.crop.width, part.crop.height);
      const image = this.scene.add
        .image(0, 0, key, frame)
        .setOrigin((part.pivot.x - part.crop.x) / part.crop.width, (part.pivot.y - part.crop.y) / part.crop.height);
      // Far limbs are a shade darker, so the legs read as taking turns.
      if (part.side === 'far') image.setTint(FAR_TINT);
      const turn = this.scene.add.container(part.at.x, part.at.y, [image]);
      // A lower limb tucks in behind the one it hangs from, so the thigh's hem covers the knee.
      if (part.parent) byId.get(part.parent)!.addAt(turn, 0);
      else body.add(turn);
      byId.set(part.id, turn);
      this.joints.push({ part, turn });
      if (part.role === 'thigh' && !part.parent) this.hipHeight = Math.max(this.hipHeight, -part.at.y);
    }
  }

  /**
   * The cutout at phase `phase` of its two-step cycle (0 and π: passing, legs together), or standing
   * when undefined. Angles are clockwise, so a negative angle swings a leg forward (to the right).
   */
  private pose(phase: number | undefined): void {
    let spread = 0;
    // Each leg's tilt so far (thigh, then knee), which its foot mostly undoes.
    const tilt = { near: 0, far: 0 };
    for (const { part, turn } of this.joints) {
      if (phase === undefined) {
        turn.setAngle(0);
        continue;
      }
      const side = part.side ?? 'near';
      const s = (part.side === 'far' ? -1 : 1) * Math.sin(phase);
      const c = (part.side === 'far' ? -1 : 1) * Math.cos(phase);
      if (part.role === 'thigh') {
        turn.setAngle(-CUTOUT.thigh * s);
        tilt[side] = turn.angle;
        spread = Math.max(spread, Math.abs(CUTOUT.thigh * s));
      } else if (part.role === 'shin') {
        // The knee bends while the leg swings forward through the air (passing), straight on the ground.
        turn.setAngle(CUTOUT.knee * Math.max(0, c));
        tilt[side] += turn.angle;
      } else if (part.role === 'foot') {
        turn.setAngle(-(1 - CUTOUT.footRoll) * tilt[side]);
      } else if (part.role === 'arm') {
        turn.setAngle(CUTOUT.arm * s);
      }
    }
    // Spread legs reach less far down, so the hips drop to keep the feet on the floor; plus a little
    // bounce, highest when passing.
    const drop = phase === undefined ? 0 : this.hipHeight * (1 - Math.cos((spread * Math.PI) / 180));
    const bounce = phase === undefined ? 0 : (CUTOUT.bob / SPRITE_SCALE) * Math.abs(Math.cos(phase));
    for (const body of this.bodyParts) body.y = drop - bounce;
  }
}
