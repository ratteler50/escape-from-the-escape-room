# The Gift Shop background

`public/assets/rooms/gift-shop.webp`, 1280×720. Generated 2026-10-22 in ChatGPT by the developer, from
the prompt in `docs/art/prompts-gift-shop.md` (section 1), first attempt, approved as is (slice 22).

**References:**
1. Layout: `docs/art/gift-shop-layout.svg`, redrawn in the Lair sketch's style with its notes group
   hidden in the copy attached.
2. Style: the Lair background (`public/assets/rooms/lair.webp`).

It came out 16:9, so nothing was cropped. Props drifted 10–80 px from the sketch, and the front door
ended up on the right-hand wall, standing open: the hotspot bounds, interaction points, the floor
polygon, both entries and the doorway walks were fitted to the painting (`src/content/giftShop.ts`).

**Fixes,** each a ChatGPT edit of an enlarged crop, patched into the painting permanently:
- **The front door's sign** (§3c): the CLOSED FOR REFURBISHMENT notice became the shop's hanging
  OPEN/CLOSED sign, staff side out, CLOSED.
- **The sign over the Lair door** (§3d): EXIT THROUGH THE GIFT SHOP became THE LICH'S LAIR / ENTER IF
  YOU DARE, since from the shop that door is the attraction's entrance.

**Pipeline:** scaled with Pillow (Lanczos), converted with `cwebp -q 85` (118 KB).
