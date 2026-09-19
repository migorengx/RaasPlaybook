## PR Evidence Block (RaaS)

**Outcome**: <user-visible behavior changed>
**Tier**: <L/M/H> — reason: <quality-affecting? tenant data? billing?>
**Scope**: In: <...> / Out: <...>

| Requirement | Command / artifact | Result (pass/fail + commit) |
|---|---|---|
| `make check` | `make check` | ✅ @ <sha> |
| Eval suite (golden vX) | `evals/reports/<file>` | hit@5: a→b · faith: a→b · hall: a→b |
| Cross-tenant leak test | `pytest tests/isolation` | ✅ 0 leaks |
| Cost/latency benchmark | `evals/reports/<file>` | $: a→b · p95: a→b |
| Canary tenant (H only) | <link/ID> | ✅ |

**Rollback**: re-pin <model/config version> + <index action>
**Approvals**: <names/status> · **AI-assisted**: <yes/no + worktree flag>
