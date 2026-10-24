# Slice 3 — Inventory: use items on things, combine items

**Status:** done, committed directly to `main` (before pull requests), 2026-10-21 · **Milestone:** M1

## Why

Two of M1's four puzzles are item puzzles (combine arm + gum; use the sticky arm on the grate). This
slice builds the mechanics and proves them on that real content, so the final Lair slice is mostly
writing.

## Interaction design

Same principles as the verb coin (decision 0004): no drag, no hidden gestures, works on trackpad
and touch.

- **Select, then click.** Clicking an item in the inventory bar opens the coin for that item:
  👁 Look and ✋ **"Use with…"**. Choosing "Use with…" makes it the **held item**: its slot is
  highlighted, and a "Use Gary's Arm with…" caption follows the pointer.
- While holding an item:
  - click a **hotspot**: Dana walks there and uses the item on it (no coin);
  - click **another item**: combine them (no walking; it happens in Dana's hands);
  - click the **held item again**, the floor, or press **Escape**: put it away. Clicking the floor
    doesn't also walk.
  - The hover caption reads "Use Gary's Arm with Door".
- Looking at an item makes Dana describe it without walking anywhere.
- The held item is **view state**, not game state: it isn't saved, and the core never sees it. The
  core only receives the final command.

## Spec

1. **Inventory bar.** A bar along the bottom (the floor moves up to make room) with a slot per item:
   a placeholder box with the item name, at least 72 logical px square. Replaces the text strip.
2. **Look at an item** (coin → 👁): Dana says the item's look line.
3. **Use item on hotspot.** Content says what happens for a specific item on a specific hotspot.
   With no matching rule, Dana says a fallback line: the hotspot's own fallback if it has one,
   otherwise a generic line chosen from a small pool ("I don't think the Gary's Arm goes with the
   Door.").
4. **Combine.** Content lists combinations as an unordered pair → responses (arm + gum is the same
   as gum + arm). A successful combination typically removes both items and adds the result. An
   unlisted pair gets a generic fallback line.
5. **New effect `removeItem`.**
6. **Content (real M1 puzzles):**
   - Throne gains ✋ "Check under the cushion" → **Pre-Owned Gum**. *Temporarily ungated*: in slice 4
     it gets gated behind Reginald leaving the throne.
   - Combine **Gary's Arm + Pre-Owned Gum → Sticky Arm**.
   - New **floor grate** hotspot. Looking hints that something shiny is down there. Using the Sticky
     Arm on it → **Display Case Key** (the Sticky Arm stays in the inventory, so nothing is lost).
     Using Gary's Arm on it alone → "Not sticky enough" hint line.
   - A few joke item-on-hotspot lines (e.g. Gary's Arm on Gary: "He doesn't want it back. He's
     moved on.").
   - The display case and keypad come in the final Lair slice.

Out of scope: dialogue, Reginald, the display case/scroll/keypad, the win state, save/load, item art.

## Acceptance checks

- `npm test` passes, including:
  - core: use item on hotspot runs the matching rule; otherwise the hotspot fallback, otherwise a
    generic line;
  - core: combine is order-independent, removes/adds items, and falls back for unknown pairs;
  - core: using or combining an item not in the inventory throws;
  - core: look at an item returns its look line;
  - content validation: every item referenced by a use rule or combination exists; combinations
    don't list the same pair twice or pair an item with itself; use-rule responses end with an
    unconditional fallback, like verb responses;
  - architecture guard green.
- `npm run typecheck` and `npm run build` pass.
- Agent play-test: take the arm, take the gum, combine them (both orders), use the sticky arm on
  the grate, get the key; held-item put-away paths; fallback lines; item look.
- Developer play-test on the trackpad.

## Plan

1. Core types: `removeItem` effect; commands `lookItem`, `useItemOn`, `combine`; hotspot
   `itemUses?: Partial<Record<ItemId, Response[]>>` and `itemFallback?: string`;
   `World.combinations: { items: [ItemId, ItemId]; responses: Response[] }[]`.
2. Core, test-first: the three commands, the fallbacks, order-independence, and the guards.
3. Content: gum, sticky arm, key items; throne Take; grate hotspot; the combination; joke lines;
   floor raised for the bar. Extend content validation.
4. View: `InventoryBar` component (own file); held-item state and caption; routing clicks to
   use / combine / put away; item coin through `VerbCoin` (generalised to accept any options).
5. Play-test, fix, update docs (glossary: held item, combination, fallback line), hand over.

## Notes / out-of-scope ideas

- Generic fallback lines live in content (`world.fallbacks`), not the engine: they're jokes. The
  engine picks one by hashing the item/target ids, so it stays pure and the same attempt always
  gets the same line. Combine sorts the ids first so order doesn't change the line.
- Templates avoid "the" before `{item}`/`{target}` because names like "Gary's Arm" and "Gary"
  don't take an article. A content test rejects unknown placeholders.
- Verbs, item uses, and combinations now share one `respond()` in the engine and one
  `expectValidResponses()` in the content test.
- `VerbCoin` was generalised to `CoinOption { id, icon, label }`; verb icons moved to `RoomScene`.
- Right-click on an item = Look; right-click while holding an item puts it away.
- Bug found in play-test and fixed: re-rendering the bar destroys the hovered slot without a
  `pointerout`, leaving a stale caption. `InventoryBar.render` now ends the hover itself.
- Play-test harness gotcha: Phaser registers newly created interactive objects on the next frame,
  so automated clicks need a short wait between opening the coin and picking a button. One
  unexplained misfire early on (a throne click ignored) didn't reproduce in later step-by-step runs.
- The inventory bar shows names only; item art and overflow (more items than fit) wait for M4/M3.
