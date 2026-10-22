# The Break Room background

`public/assets/rooms/break-room.webp`, 1280×720. Generated 2026-10-22 in ChatGPT by the developer,
from the prompt in `docs/art/prompts-break-room.md` (section 1), first attempt.

**References** (attached in this order):
1. Layout: `docs/art/break-room-layout.svg`, rendered letterboxed to 1536×1024 (every prop at its
   hotspot's bounds).
2. Style: the Lair background (`public/assets/rooms/lair.webp`).
3. The item icon sheet, so the painted time cards match the Time Card icon.

ChatGPT returned 1672×941 (16:9) rather than the letterboxed 3:2, so it was scaled straight to
1280×720 with no crop. Everything sat where the sketch put it left to right, but about 40 px lower,
so the hotspot bounds and the floor were fitted to the painting (`src/content/breakRoom.ts`).

**Fix:** the first painting put the cent in the snack bin. An edit of an enlarged crop of the
vending machine (section 1b) moved it into the coin return; `scripts/make-overlay.py` blended the
changed patch (131×185 px at the original size) into the painting permanently.

**Pipeline:** scaled with Pillow (Lanczos), converted with `cwebp -q 85` (108 KB).
