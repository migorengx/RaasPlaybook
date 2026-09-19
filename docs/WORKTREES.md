# Worktrees — Parallel Agent Sessions

One git worktree per agent session. Sessions never touch each other's files.

## Why

A worktree is a separate working directory with its own checked-out branch,
sharing repository history with the main checkout. Each agent works in its own
directory; changes cannot collide.

## Start a session

```bash
# one command per agent, in separate terminals
git worktree add .worktrees/feat-auth -b feat/auth
cd .worktrees/feat-auth && ./scripts/bootstrap   # set up env (deps, hooks)
claude   # or: codex / gemini — the agent lands in this worktree
```

Or with Claude Code's native flag: `claude --worktree feat-auth`
(creates `.claude/worktrees/feat-auth`, already gitignored).

## Parallel agents, different approaches

```bash
git worktree add .worktrees/approach-a -b spike/approach-a
git worktree add .worktrees/approach-b -b spike/approach-b
```

Run both, compare the results, keep the best branch, delete the rest.

## Clean up

```bash
git worktree remove .worktrees/feat-auth
git branch -d feat/auth          # only after the PR is merged or dropped
git worktree prune
```

## Rules

- Branch names mirror the issue: `feat/<slug>`, `fix/<slug>`, `spike/<slug>`.
- **The human reviews and pushes.** Agents never push, from worktrees or anywhere.
- `.worktreeinclude` lists gitignored files (e.g. `.env.local`) to copy into a
  fresh worktree — never real secrets.
- A fresh worktree has no dependencies: always run `./scripts/bootstrap` first.
