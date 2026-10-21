# Slice 8 — Deploy to GitHub Pages

**Status:** built, agent-verified at the sub-path · awaiting Pages switch-on, PR, and merge · **Milestone:** M2 (tooling) · **Branch:** `slice-8-deploy`

Runs in parallel with slice 7 (rooms), in its own session. To keep the two from colliding, this
slice touches nothing in `src/`, `docs/design.md`, `CLAUDE.md`, or the other slice docs. Anything
those files should say about deploying is noted at the bottom of this doc instead.

## Why

Right now the only way to play the game is to clone the repo and run `npm run dev`. A public URL
means anyone (play-testers, friends) can play the latest `main` in a browser with no setup, and
every merged slice shows up there automatically. The code stays private; only the built game is
public. Draft jokes going out publicly is fine.

Game-dev note: a Phaser game is a static site. `npm run build` produces `dist/` (an `index.html`, a
JS bundle, and later the art and sound files), and any static file host can serve it. GitHub Pages
is the free one that lives next to the repo.

## Spec

1. **Workflow** `.github/workflows/pages.yml`, triggered on pushes to `main` (which only happen
   through merged PRs) and by hand (`workflow_dispatch`, for redeploying without a new commit).
   - **build** job: checkout → set up Node (from `.nvmrc`, npm cache) → `npm ci` → `npm test` →
     `npm run build` → `actions/configure-pages` → `actions/upload-pages-artifact` with `dist/`.
   - **deploy** job (needs build): `actions/deploy-pages`, in the `github-pages` environment, so
     the run links to the live URL.
   - Permissions are the minimum Pages needs: `contents: read`, `pages: write`, `id-token: write`.
   - Concurrency group `pages`, not cancelling a deploy already in progress (two quick merges
     deploy in order; the later one wins).
   - Action versions are the current majors, looked up from each action's latest release:
     `checkout@v7`, `setup-node@v7`, `configure-pages@v6`, `upload-pages-artifact@v5`,
     `deploy-pages@v5`.
   - The existing CI workflow is unchanged; it still runs on PRs and pushes.
2. **Sub-path.** Pages serves the game at
   `https://ratteler50.github.io/escape-from-the-escape-room/`, not at the domain root. By default
   Vite writes absolute paths (`/assets/index-abc.js`) into the built `index.html`, which would
   404 there. Set Vite's `base` to `'./'` in `vite.config.ts`, so the built page loads its files
   relative to wherever it is served. This works at the Pages sub-path, at the root (`vite
   preview`, slice 11's Playwright runs), and anywhere else, and it needs no repo name in the
   config. It's safe because the game is a single page with no URL routing. The dev server
   ignores a relative base, so `npm run dev` is unchanged.
3. **Turn on Pages** with "GitHub Actions" as the source. This is a repo settings change, so I'll
   ask for your OK separately before doing it.
4. **README**: the live URL in the "Running it" section.

Out of scope: a custom domain, PR preview deploys, Playwright against the deployed site (slice 11
tests the production build locally), caching headers, a 404 page.

## Open question: does your GitHub plan allow Pages on a private repo?

The repo is private and owned by a personal account. GitHub Pages on a **private** repo needs
GitHub Pro (or Team/Enterprise for orgs); on GitHub Free, Pages only works for public repos. I
couldn't read the account's plan with the CLI's token, and the repo has no Pages site yet (the API
returns 404, which just means "not set up").

- **If you have Pro:** go ahead as specced; the site is public, the code stays private.
- **If you're on Free:** the options are (a) upgrade to Pro, (b) make the repo public, or
  (c) keep the code here and deploy to a separate public repo or another host (Netlify,
  Cloudflare Pages, itch.io), which is a different slice. Everything in this spec except step 3
  still applies to (a) and (b).

## Acceptance checks

- `npm run build`, then `npx vite preview --base /escape-from-the-escape-room/`: the game loads at
  `http://localhost:4173/escape-from-the-escape-room/` with no 404s or console errors, and it is
  playable (walk, verb coin, pick something up), checked in the browser pane at 1280×720.
- The same build also loads at the root with plain `npx vite preview`.
- `npm run dev` still serves the game at http://localhost:5173.
- CI is green on the PR (it runs on the PR; the Pages workflow does not, since it only deploys
  from `main`).
- After you squash-merge: the Pages workflow run on `main` succeeds, and the live URL serves the
  game and is playable.

## Plan

1. Branch `slice-8-deploy` from `main`.
2. Set `base: './'` in `vite.config.ts`; build; verify with `vite preview` at the sub-path and at
   the root in the browser pane, and check `npm run dev`.
3. Add `.github/workflows/pages.yml`.
4. Add the live URL to the README.
5. Ask to turn on Pages (source: GitHub Actions).
6. Commit; ask to push and open the PR; CI green.
7. You review and squash-merge; I confirm the deploy run and the live game.

## Notes

- Spec approved; the developer is on GitHub Pro, so Pages works on the private repo.
- Built `index.html` now references `./assets/index-….js` instead of `/assets/…`.
- Verified in the browser pane at `http://localhost:4174/escape-from-the-escape-room/` (1280×720):
  both requests 200, no console errors; with real clicks Dana walked, the verb coin opened on the
  coffin, and opening it put Reginald's Script in the inventory. The same build at the root and
  `npm run dev` were checked with curl (the page and its script load).
- `.claude/launch.json` gained a `preview-pages` entry (serves `dist/` at the Pages sub-path on
  port 4174), so the agent can re-run this check. Rewriting the file also reformatted the `dev`
  entry's arguments onto separate lines; its settings didn't change.
- Vite warns that the bundle is over 500 kB (it's mostly Phaser). Harmless for now; code-splitting
  is a later concern if load time matters.

## Notes for the shared docs (left for slice 7 / later, not edited here)

- `CLAUDE.md` → Commands / Git and GitHub: "Merging to `main` deploys to GitHub Pages
  (`.github/workflows/pages.yml`); the live game is at
  https://ratteler50.github.io/escape-from-the-escape-room/."
- `docs/design.md` → M2 row: could list "deployed to GitHub Pages" once this lands.
- Prod builds don't expose `window.__game` (it's dev-only in `src/main.ts`), so play-testing the
  deployed site is by real clicks only. Slice 11's `?e2e` flag is where that changes.
