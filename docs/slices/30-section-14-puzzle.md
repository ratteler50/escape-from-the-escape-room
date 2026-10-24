# Slice 30 — Section 14: a Handbook puzzle

**Status:** spec awaiting the developer's approval, not built · **Milestone:** M4, its last slice
(added after slice 29, 2026-10-23) · built on slice 29 (PR #37); rebased onto `main` once it merges

## Why

Getting Kyle's price gun isn't really a puzzle. Once Mordecai complains about his teapot, a new
option appears in Kyle's dialogue and Dana quotes Handbook §14 from memory: the player only has to
talk to Kyle again. Slice 29 gave Dana the Handbook as an item, so the price gun can be won by
**using the Handbook on Kyle**, with hints pointing at it. It also gives the Handbook a job.

Decisions from the slice 30 questions (2026-10-23).

## Spec

1. **The solution:** the Handbook used on Kyle, after Mordecai's teapot complaint
   (`heardTeapotComplaint`) and before Dana has had the price gun, gives Dana the Price Gun. Dana
   finds the revised §14 (item 2) and reads it out; Kyle answers with their existing lines ("..." / "Re-pricing is my
   department. Technically." / "Bring it back. It's got my name on it.").
2. **Why Dana never thought of it:** Dana memorised the **old §14**, which says the opposite: "Staff
   may not borrow equipment from other departments." Last week head office stapled a **revised §14**
   over it: "Staff may borrow equipment for re-pricing." Dana hasn't learned the revision. Using the
   Handbook on Kyle is when Dana finds it: "Section 14: no borrowing from other departments. Everyone
   knows that. But there's an insert stapled over it: REVISED. 'Staff may borrow equipment for
   re-pricing.' I haven't learned the new one yet!" §14.1 ("but not for personal gain") goes with
   the revised rule.
3. **Kyle's §14 dialogue option is removed.** Nothing else in Kyle's tree changes.
4. **The Handbook on Kyle, by state:**

   | When | What happens |
   |---|---|
   | Before the teapot complaint | Kyle: "Not my department." "Mine's propping the stockroom door open." (as now) |
   | After the complaint, never had the gun | Item 1: Dana reads §14, Kyle hands over the Price Gun |
   | While Dana holds the gun | Kyle: "You've already got it. It's got my name on it." |
   | After it's been handed back (`teapotRepriced`) | Kyle: "Not my department." |

5. **Hints**, all after the complaint:
   - **Mordecai** ends his teapot speech with Dana: "Re-pricing is done with a price gun. Kyle has
     the price gun. There's a Handbook section about borrowing equipment. I'll have to look it up."
   - **The Handbook on the Bargain Bin:** "Re-pricing needs the price gun, and the price gun is
     Kyle's department. There's a section on borrowing equipment somewhere…"
   - **⚙ Ring something up on the till**, before Dana has had the gun: Kyle's "That's my department."
     is followed by Dana: "Kyle's department. The Handbook must say how to borrow from other
     departments."
6. **The old §14 joins the random readings** and the loading screen, as a fourth hint: `Section 14:
   "Staff may not borrow equipment from other departments." Something has been stapled over it.
   I don't have time for inserts. I'm a bit cursed at the moment.` (the loading screen quotes just the rule). The revised §14 never appears
   there: finding it is the moment. §14.1 stays in them too.
7. **Records:** the M3 puzzle chart in `docs/design.md` (the "Kyle dialogue, unlocked by Mordecai"
   step becomes "Handbook on Kyle"), and the Handbook table's §14 row (the old rule and the revised insert). The slice
   14 tests that check the option (`giftShop.test.ts`) move to the new solution.
8. **No new flags or items.** The states in item 4 come from `heardTeapotComplaint`,
   `teapotRepriced` and whether Dana holds the Price Gun. Saves stay at format 3: a save from
   slice 29 still loads and plays on with the new solution.

## Play-testing

- **Agent:** all tests green; the always-winnable test and e2e find and play the new solution on
  their own. In the browser: the four Handbook-on-Kyle states, each hint, and that Kyle's dialogue no
  longer offers §14.
- **Developer:** whether the hints are enough to find it without being told.

## Notes for later

(Filled in while building.)

## Build notes

(Filled in while building.)
