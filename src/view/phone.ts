import * as Phaser from 'phaser';
import { screens } from '../content/screens';
import { TOUCH } from './touch';

// Phones and tablets (slice 32): the sideways screen, fullscreen, and the home-screen tip.

/**
 * Covers the game with "turn your phone sideways" while a touch device is held upright, pausing the
 * game and its sound behind it; it carries on where it was when the phone turns. An HTML layer over
 * the canvas, so it's there from the first frame, before any scene has started.
 */
export function watchOrientation(game: Phaser.Game): void {
  if (!TOUCH) return;
  const cover = document.createElement('div');
  cover.id = 'sideways';
  const skull = document.createElement('img');
  skull.src = 'assets/app/icon-192.png';
  skull.alt = '';
  const line = document.createElement('p');
  line.textContent = screens.sideways;
  cover.append(skull, line);
  document.body.append(cover);

  const upright = window.matchMedia('(orientation: portrait)');
  const apply = () => {
    cover.hidden = !upright.matches;
    if (upright.matches) {
      game.pause();
      game.sound.pauseAll();
    } else if (game.isPaused) {
      game.resume();
      game.sound.resumeAll();
    }
  };
  upright.addEventListener('change', apply);
  // The game isn't running its loop until it boots; pause it then if the phone is already upright.
  game.events.once(Phaser.Core.Events.READY, apply);
  cover.hidden = !upright.matches;
}

/** Whether this browser lets the game go fullscreen (not iPhone Safari; not inside some frames). */
export function canFullscreen(scene: Phaser.Scene): boolean {
  return scene.scale.fullscreen.available;
}

/**
 * Fullscreen on or off. On a phone, going fullscreen also keeps the screen sideways where the
 * browser allows it (Android Chrome). Call it from a button's press.
 */
export function toggleFullscreen(scene: Phaser.Scene): void {
  // Buttons act when pressed, but a browser allows fullscreen only once a finger lifts (a touch
  // starting doesn't count as a user gesture), so this waits for the pointer to come up.
  scene.input.once(Phaser.Input.Events.POINTER_UP, () => switchFullscreen(scene));
}

function switchFullscreen(scene: Phaser.Scene): void {
  if (scene.scale.isFullscreen) return scene.scale.stopFullscreen();
  scene.scale.startFullscreen();
  if (TOUCH) {
    const orientation = screen.orientation as ScreenOrientation & { lock?: (o: string) => Promise<void> };
    orientation.lock?.('landscape').catch(() => undefined);
  }
}

/**
 * True in Safari on an iPhone or iPad, opened from the browser rather than from the home screen:
 * where fullscreen isn't allowed, and "Add to Home Screen" is the way to play without the bars.
 */
export function wantsHomeScreen(): boolean {
  const standalone = (navigator as Navigator & { standalone?: boolean }).standalone === true;
  const apple = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.userAgent.includes('Macintosh') && TOUCH);
  return apple && !standalone && !window.matchMedia('(display-mode: fullscreen), (display-mode: standalone)').matches;
}
