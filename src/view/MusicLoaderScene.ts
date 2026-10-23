import * as Phaser from 'phaser';
import type { TrackId, WorldAudio } from '../core/types';
import { gameAudio, queueAudio } from './GameAudio';

/**
 * Loads the room music in the background, one track after another, while the game is played. It
 * draws nothing and runs alongside the other scenes (its own loader, so scene changes don't cancel
 * it). Each track tells the audio player when it arrives, so a room entered early fades its music
 * in as soon as it's there.
 */
export class MusicLoaderScene extends Phaser.Scene {
  constructor() {
    super('MusicLoaderScene');
  }

  create(data: { tracks: readonly TrackId[]; audio: WorldAudio | undefined }): void {
    // One at a time, in the order the rooms come (the Lair's first), so the next room's track
    // arrives as soon as it can instead of sharing the connection with the others.
    this.load.maxParallelDownloads = 1;
    queueAudio(this, data.audio, data.tracks);
    this.load.on(Phaser.Loader.Events.FILE_COMPLETE, () => gameAudio(this).trackLoaded());
    this.load.start();
  }
}
