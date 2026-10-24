/**
 * True on a device whose main pointer is a finger (a phone or tablet), not a mouse or trackpad.
 * A laptop with a touch screen still counts as a mouse device. Read once at start-up (slice 32).
 */
export const TOUCH = globalThis.matchMedia?.('(pointer: coarse)').matches ?? false;
