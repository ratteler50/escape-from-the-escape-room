import * as Phaser from 'phaser';
import type { SoundId, TrackId, WorldAudio } from '../core/types';
import { settings } from './storage';

// Sound effects and music. One player per game (not per scene), so music carries on from the
// title screen into the rooms and across room changes.
//
// Browsers won't play sound until the player has clicked or tapped (autoplay rules). Phaser starts
// "locked" and unlocks on the first click; until then effects are skipped and the music that should
// be playing is remembered and started on unlock.

const CROSSFADE_MS = 1000;

const soundKey = (id: SoundId) => `sound:${id}`;
const musicKey = (id: TrackId) => `music:${id}`;

/** A playing sound whose volume can be set (Phaser's WebAudio and HTML5 sounds both can). */
type Playing = Phaser.Sound.BaseSound & { volume: number };

interface Fade {
  sound: Playing;
  from: number;
  to: number;
  elapsed: number;
  onDone?: () => void;
}

/** Queues every sound and track for loading. Call from a scene's `preload`. */
export function preloadAudio(scene: Phaser.Scene, audio: WorldAudio | undefined): void {
  if (!audio) return;
  const load = (key: string, path: string) => {
    if (!scene.cache.audio.exists(key)) scene.load.audio(key, path);
  };
  for (const [id, path] of Object.entries(audio.sounds)) load(soundKey(id), path);
  for (const [id, path] of Object.entries(audio.music)) load(musicKey(id), path);
}

/** The game's audio player, kept in the game's registry (where the e2e tests read it too). */
export function gameAudio(scene: Phaser.Scene): GameAudio {
  const registry = scene.game.registry;
  if (!registry.has('audio')) registry.set('audio', new GameAudio(scene.game));
  return registry.get('audio') as GameAudio;
}

export class GameAudio {
  private music: { track: TrackId; sound: Playing } | undefined;
  /** The track that should be playing: it may be waiting for the browser to unlock audio. */
  private wanted: TrackId | undefined;
  private fades: Fade[] = [];
  /** How often each effect has been asked for, heard or not (for tests: the agent can't hear). */
  readonly requested: Record<SoundId, number> = {};

  constructor(private readonly game: Phaser.Game) {
    game.sound.mute = settings.muted;
    game.sound.on(Phaser.Sound.Events.UNLOCKED, () => this.startWanted());
    // Fades run on the game's clock, not a scene's, so a scene shutting down can't strand one.
    game.events.on(Phaser.Core.Events.STEP, (_time: number, delta: number) => this.step(delta));
  }

  /** Plays a sound effect once, at the effects volume. Skipped while audio is locked. */
  play(id: SoundId): void {
    this.requested[id] = (this.requested[id] ?? 0) + 1;
    if (this.game.sound.locked || !this.game.cache.audio.exists(soundKey(id))) return;
    this.game.sound.play(soundKey(id), { volume: settings.effectsVolume / 100 });
  }

  /** Crossfades to a track, looping. `undefined` (a room with no music yet) keeps the current one. */
  playMusic(track: TrackId | undefined): void {
    if (track === undefined) return;
    this.wanted = track;
    this.startWanted();
  }

  /** The track playing now, if any. */
  get track(): TrackId | undefined {
    return this.music?.track;
  }

  /** Applies the volume settings to what's playing (after the player changes them). */
  applyVolumes(): void {
    if (!this.music) return;
    this.fades = this.fades.filter((f) => f.sound !== this.music!.sound);
    this.music.sound.volume = settings.musicVolume / 100;
  }

  /** Mutes or unmutes everything, and remembers it. Returns whether it's now muted. */
  toggleMute(): boolean {
    settings.muted = !settings.muted;
    this.game.sound.mute = settings.muted;
    return settings.muted;
  }

  private startWanted(): void {
    const track = this.wanted;
    if (track === undefined || this.music?.track === track) return;
    if (this.game.sound.locked || !this.game.cache.audio.exists(musicKey(track))) return;
    const old = this.music;
    const next = this.game.sound.add(musicKey(track), { loop: true }) as Playing;
    next.play();
    this.music = { track, sound: next };
    this.fade(next, settings.musicVolume / 100, 0);
    if (old) this.fade(old.sound, 0, old.sound.volume, () => old.sound.destroy());
  }

  /** Fades from `from` (default: where it is now) to `to` over the crossfade time. */
  private fade(sound: Playing, to: number, from = sound.volume, onDone?: () => void): void {
    this.fades = this.fades.filter((f) => f.sound !== sound);
    sound.volume = from;
    this.fades.push({ sound, from, to, elapsed: 0, ...(onDone && { onDone }) });
  }

  private step(delta: number): void {
    if (this.fades.length === 0) return;
    for (const f of this.fades) {
      f.elapsed = Math.min(f.elapsed + delta, CROSSFADE_MS);
      f.sound.volume = f.from + (f.to - f.from) * (f.elapsed / CROSSFADE_MS);
    }
    const done = this.fades.filter((f) => f.elapsed >= CROSSFADE_MS);
    this.fades = this.fades.filter((f) => f.elapsed < CROSSFADE_MS);
    done.forEach((f) => f.onDone?.());
  }
}
