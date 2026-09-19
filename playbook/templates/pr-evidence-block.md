# PR Evidence Block (Result-as-a-Service)

**Outcome**: <what changed in delivered results>
**Tier**: <L/M/H> — reason: <autonomy? pricing? verifier? none>
**Scope**: In: <...> / Out: <...>

| Requirement | Command / artifact | Result (pass/fail + commit) |
|---|---|---|
| make check | `make check` | ✅ @ <sha> |
| gold re-run | outcomes/reports/<file> | 150 cases · ≥95% verified-correct |
| billing replay | outcomes/reports/<file> | 0 mis-billed |
| p95 / cost | outcomes/reports/<file> | ≤1h · ≤+5% |
| canary client (H only) | <client/ID> | ✅ |

**Rollback**: re-pin <prompts/models/rules> · **Approvals**: <names/status>
**AI-assisted**: <yes/no + worktree flag>
