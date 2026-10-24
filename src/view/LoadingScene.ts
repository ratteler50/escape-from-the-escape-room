import * as Phaser from 'phaser';
import { screens } from '../content/screens';
import { queueArt } from './assets';
import { backgroundTracks, queueAudio } from './GameAudio';
import type { GameData } from './TitleScene';
import { pickLine } from './pickLine';
import { font, UI } from './ui';

const BAR = { width: 520, height: 26 };
/** How long each Handbook line stays up; the screen only shows one if loading takes that long. */
const LINE_MS = 2200;

/**
 * The first scene: loads what's needed to play (all the art, the sound effects, the title music)
 * behind a progress bar, then hands over to the title screen and starts the room music loading in
 * the background (`MusicLoaderScene`). Draws only shapes and text, so it needs nothing loaded itself.
 */
export class LoadingScene extends Phaser.Scene {
  private data_!: GameData;

  constructor() {
    super('LoadingScene');
  }

  init(data: GameData): void {
    this.data_ = data;
  }

  preload(): void {
    const { width, height } = this.scale;
    const { world } = this.data_;
    this.add.rectangle(0, 0, width, height, 0x0d0a14).setOrigin(0, 0);
    this.add.text(width / 2, height / 2 - 90, 'ESCAPE-O-RAMA', { ...font(this, 44, { heading: true }), color: UI.accent }).setOrigin(0.5);
    this.add.text(width / 2, height / 2 - 45, screens.loadingCaption, { ...font(this, 20), color: UI.muted }).setOrigin(0.5);

    // A tray-purple bar in a darker inset, like the inventory tray's slots.
    const left = width / 2 - BAR.width / 2;
    this.add.rectangle(width / 2, height / 2 + 10, BAR.width + 10, BAR.height + 10, UI.inset).setStrokeStyle(3, UI.edge);
    const fill = this.add.rectangle(left, height / 2 + 10, 0, BAR.height, UI.border).setOrigin(0, 0.5);
    this.load.on(Phaser.Loader.Events.PROGRESS, (progress: number) => fill.setSize(BAR.width * progress, BAR.height));

    // Handbook quotes, one at a time while it takes long enough to read them, in random order: most
    // players only see the first one or two.
    const lines = world.loadingLines ?? [];
    let shown = pickLine(lines.length, undefined);
    const line = this.add
      .text(width / 2, height / 2 + 80, lines[shown] ?? '', { ...font(this, 20), color: '#ffffff', align: 'center', wordWrap: { width: 760 } })
      .setOrigin(0.5, 0);
    if (lines.length > 1) {
      this.time.addEvent({
        delay: LINE_MS,
        loop: true,
        callback: () => {
          shown = pickLine(lines.length, shown);
          line.setText(lines[shown]!);
        },
      });
    }

    queueArt(this, world);
    queueAudio(this, world.audio, world.audio ? [world.audio.title] : []);
  }

  create(): void {
    this.scene.launch('MusicLoaderScene', { tracks: backgroundTracks(this.data_.world.audio), audio: this.data_.world.audio });
    this.scene.start('TitleScene', this.data_);
  }
}
