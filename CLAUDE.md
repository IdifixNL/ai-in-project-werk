@AGENTS.md

## For Claude Code

The contract above is shared with GitHub Copilot, so it lives in `AGENTS.md`. Put new rules there,
not here, unless they only make sense for Claude Code.

- Your roles are in `.claude/agents/`. When the user names a role ("use the builder"), use that agent.
- When you add a role, also write its Copilot copy in `.github/agents/` (see "Team roles" above).
