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

// Stings duck the music: it dips while one plays and comes back when it ends.
const STINGS: ReadonlySet<SoundId> = new Set(['finale']);
const DUCK_LEVEL = 0.25;
const DUCK_MS = 300;

const soundKey = (id: SoundId) => `sound:${id}`;
const musicKey = (id: TrackId) => `music:${id}`;

/** A playing sound whose volume can be set (Phaser's WebAudio and HTML5 sounds both can). */
type Playing = Phaser.Sound.BaseSound & { volume: number };

interface Fade {
  sound: Playing;
  from: number;
  to: number;
  elapsed: number;
  ms: number;
  onDone?: () => void;
}

/**
 * Queues audio on a scene's loader: every sound effect, and the given tracks. The loading screen
 * loads the effects and the title track; the room tracks (most of the download) load in the
 * background afterwards (`MusicLoaderScene`), so nothing waits for them.
 */
export function queueAudio(scene: Phaser.Scene, audio: WorldAudio | undefined, tracks: readonly TrackId[] = []): void {
  if (!audio) return;
  const load = (key: string, path: string) => {
    if (!scene.cache.audio.exists(key)) scene.load.audio(key, path);
  };
  for (const [id, path] of Object.entries(audio.sounds)) load(soundKey(id), path);
  for (const track of tracks) {
    const path = audio.music[track];
    if (path) load(musicKey(track), path);
  }
}

/** The tracks that load in the background: all of them except the title's. */
export function backgroundTracks(audio: WorldAudio | undefined): TrackId[] {
  return audio ? Object.keys(audio.music).filter((track) => track !== audio.title) : [];
}

/** The game's audio player, kept in the game's registry (where the e2e tests read it too). */
export function gameAudio(scene: Phaser.Scene): GameAudio {
  const registry = scene.game.registry;
  if (!registry.has('audio')) registry.set('audio', new GameAudio(scene.game));
  return registry.get('audio') as GameAudio;
}

export class GameAudio {
  private music: { track: TrackId; sound: Playing } | undefined;
  /** The track that should be playing: it may be waiting for the browser to unlock audio, or to load. */
  private wanted: TrackId | undefined;
  /** The last wanted track that was loaded: it stands in while the wanted one is still downloading. */
  private standIn: TrackId | undefined;
  private fades: Fade[] = [];
  /** How many stings are playing: while any are, the music sits at DUCK_LEVEL. */
  private ducks = 0;
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
    if (!STINGS.has(id)) {
      this.game.sound.play(soundKey(id), { volume: settings.effectsVolume / 100 });
      return;
    }
    const sting = this.game.sound.add(soundKey(id), { volume: settings.effectsVolume / 100 });
    sting.once(Phaser.Sound.Events.COMPLETE, () => {
      sting.destroy();
      this.ducks--;
      this.fadeMusic(DUCK_MS);
    });
    this.ducks++;
    this.fadeMusic(DUCK_MS);
    sting.play();
  }

  /** Crossfades to a track, looping. `undefined` (a room with no music yet) keeps the current one. */
  playMusic(track: TrackId | undefined): void {
    if (track === undefined) return;
    this.wanted = track;
    this.startWanted();
  }

  /** A track finished loading in the background: if it's the one wanted, it can start now. */
  trackLoaded(): void {
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
    this.music.sound.volume = this.musicLevel();
  }

  /** Mutes or unmutes everything, and remembers it. Returns whether it's now muted. */
  toggleMute(): boolean {
    settings.muted = !settings.muted;
    this.game.sound.mute = settings.muted;
    return settings.muted;
  }

  private startWanted(): void {
    const wanted = this.wanted;
    if (wanted === undefined) return;
    const loaded = (t: TrackId) => this.game.cache.audio.exists(musicKey(t));
    if (loaded(wanted)) this.standIn = wanted;
    if (this.game.sound.locked) return;
    // Still downloading (room music loads in the background): keep playing what's playing, or the
    // last track that was loaded, rather than silence.
    const track = loaded(wanted) ? wanted : this.music ? undefined : this.standIn;
    if (track === undefined || this.music?.track === track) return;
    const old = this.music;
    const next = this.game.sound.add(musicKey(track), { loop: true }) as Playing;
    next.play();
    this.music = { track, sound: next };
    this.fade(next, this.musicLevel(), 0);
    if (old) this.fade(old.sound, 0, old.sound.volume, () => old.sound.destroy());
  }

  /** The music's volume: the setting, ducked while a sting plays. */
  private musicLevel(): number {
    return (settings.musicVolume / 100) * (this.ducks > 0 ? DUCK_LEVEL : 1);
  }

  /** Fades the current track to where it should be now (after a sting starts or ends). */
  private fadeMusic(ms: number): void {
    if (this.music) this.fade(this.music.sound, this.musicLevel(), this.music.sound.volume, undefined, ms);
  }

  /** Fades from `from` (default: where it is now) to `to`, over the crossfade time by default. */
  private fade(sound: Playing, to: number, from = sound.volume, onDone?: () => void, ms = CROSSFADE_MS): void {
    this.fades = this.fades.filter((f) => f.sound !== sound);
    sound.volume = from;
    this.fades.push({ sound, from, to, elapsed: 0, ms, ...(onDone && { onDone }) });
  }

  private step(delta: number): void {
    if (this.fades.length === 0) return;
    for (const f of this.fades) {
      f.elapsed = Math.min(f.elapsed + delta, f.ms);
      f.sound.volume = f.from + (f.to - f.from) * (f.elapsed / f.ms);
    }
    const done = this.fades.filter((f) => f.elapsed >= f.ms);
    this.fades = this.fades.filter((f) => f.elapsed < f.ms);
    done.forEach((f) => f.onDone?.());
  }
}
