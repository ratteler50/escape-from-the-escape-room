/**
 * Texture keys and the sprite scale, shared by the views that draw art. No imports, so any view can
 * use it without an import cycle (RoomView draws Walkers, and Walkers need these).
 */

/** The texture key any art file (a sprite, an overlay) is loaded under, by its path. */
export const artKey = (path: string) => `art:${path}`;

/** The texture key a walk's sprite sheet is loaded under, by its path. */
export const walkSheetKey = (sheet: string) => `walk:${sheet}`;

/** Sprites are stored at twice their on-screen size (see `CharacterSprites`). */
export const SPRITE_SCALE = 0.5;
