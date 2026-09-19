# Contributing

## For humans and AI agents alike

1. Open or claim an issue.
2. Branch: `feat/<slug>` or `fix/<slug>` from `main`.
3. Small, focused PRs. One concern per PR.
4. CI must pass (lint, typecheck, tests).
5. Update docs when behavior or architecture changes:
   - `docs/ARCHITECTURE.md` for structural changes
   - `docs/adr/NNNN-*.md` for constraining decisions
   - `docs/memory/` at end of every agent session

## Parallel agent workflow (spec-driven)

For non-trivial work:

1. **Research** — an agent (or human) studies the problem, writes a short spec
   into the issue (goal, constraints, files touched, done-when).
2. **Branch/worktree** — create `feat/<slug>` in a worktree (`docs/WORKTREES.md`).
3. **Execute** — one or more agents implement. Racing two approaches is fine;
   keep the best branch.
4. **Verify** — `make check` + runtime check by the agent; CI failures are fed
   back as fix prompts.
5. **Review** — human reviews the diff in the worktree. Optional: a second AI
   review pass (e.g. PR code review) before the human.
6. **Merge & push** — **human only.** Clean up the worktree afterwards.

## Commit convention

Conventional Commits: `type(scope): subject`
Types: feat, fix, docs, style, refactor, test, chore, adr

## Rules for AI agents

See [AGENTS.md](./AGENTS.md). Highlights: never push without human approval,
never touch secrets, verify changes by running tests before claiming done.
