# Summary

<What and why. Link the issue: Closes #NN>

## AI Disclosure

- [ ] This PR is **human-written**
- [ ] This PR is **AI-assisted** (agent drafted, human reviewed line-by-line)
- [ ] Branch created with `git worktree` — see `docs/WORKTREES.md`

## Scope

- **In**: <what this PR changes>
- **Out**: <what it deliberately does not touch>

## Evidence

| Acceptance item | Command / artifact | Result (pass/fail + commit) |
|---|---|---|
| <criterion 1 from task contract> | `make check` | ✅ pass @ <sha> |
| <criterion 2> | <command or link> | |

## Verification

- [ ] `make check` passes (lint + typecheck + tests)
- [ ] Verified at runtime — describe what you ran and saw:
      <...>
- [ ] CI green; if it failed, failure output was fed back to the agent and fixed

## Review checklist (reviewer)

- [ ] Scope is one concern; if too large, ask to split the PR
- [ ] Docs updated if behavior/architecture changed
- [ ] No secrets, no `.env` files, no generated artifacts
- [ ] `docs/memory/` updated at agent session end

## Risk

<What could break? Rollback plan?>
