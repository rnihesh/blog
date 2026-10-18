@AGENTS.md

## Claude Code

Repo-wide instructions live in `AGENTS.md` so every harness reads the same file.
Only Claude-specific behavior belongs below.

- Enforcement lives in hooks (`.claude/settings.json`), not in this file. CLAUDE.md is
  context, not configuration. If a rule must always hold, write it as a hook or a test.
- Run `npm run verify` before claiming a change works.
