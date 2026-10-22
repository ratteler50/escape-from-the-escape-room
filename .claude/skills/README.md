# Project skills

Skills here are available to every Claude Code session on this repo, local or cloud, as
`/<name>`.

All 27 are the published set of [mattpocock/skills](https://github.com/mattpocock/skills) (its
`.claude-plugin/plugin.json`) at commit `5beb35b`, MIT, © 2026 Matt Pocock: the `engineering` and
`productivity` folders, copied unchanged except that each skill's `agents/` folder (OpenAI
Codex metadata) is left out. The developer uses the same set locally, so behaviour matches.

To update, copy the newer skill folders from that repo, or run
`npx skills@latest add mattpocock/skills --agent claude-code --copy` in the repo root.

Where a skill and this repo's own rules disagree, `CLAUDE.md` wins (for example, PR bodies
follow `.github/pull_request_template.md`, and slice specs live in `docs/slices/`).
