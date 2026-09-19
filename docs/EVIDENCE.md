# Evidence System

Distilled from [The Agentic Engineering Playbook](https://www.agenticamit.com/resources/agentic-engineering-playbook)
(local copy: `docs/research/`).

## Verification ≠ self-report

- "Tests pass" is a **claim**. The captured command, environment, exit code,
  and artifact are **evidence**.
- "The issue is fixed" is a claim. A reproducer that fails before and passes
  after is evidence.
- For stateful systems, grade the final environment state, not the final message.

## Evidence ladder (cheapest high-signal first)

1. format + static syntax
2. targeted unit / contract tests
3. type + lint checks
4. integration tests
5. migration / compatibility checks (if changed)
6. security, dependency, and secret scans
7. full build + broader regression suite
8. runtime smoke / performance checks

A failure at a lower rung stops the climb. Fix, then restart from rung 1.

## Recovery ladder (when a run fails)

1. **Stop new side effects** — cancel dependent work, revoke temp credentials.
2. **Classify**: spec | context | route | tool | environment | permission |
   verification | integration | operations.
3. **Return to known state** — restore last verified commit/checkpoint.
4. **Preserve evidence** — logs, diff, test output, failure signature.
5. **Choose one recovery** — narrow the task, repair env, change route, add
   context, or escalate to a human.
6. **Re-run from a clean boundary.** Never continue on partial side effects.
7. **Update the system** — add the test/instruction/policy that would have
   caught it earlier.

## Risk-tiered gates

| Gate | Low risk | Moderate | High |
|---|---|---|---|
| format/lint/type | ✅ | ✅ | ✅ |
| targeted tests | ✅ | ✅ | ✅ |
| full regression | if risky | ✅ | ✅ |
| dependency/secret scan | if changed | ✅ | ✅ |
| security review | — | triggered | independent review |
| human approval | diff owner | code owner | named approver |
| deployment | normal | staged | staged + abort criteria |

Tier derives from data class, criticality, permission/dependency changes,
external effects, reversibility. **The agent never self-lowers the tier.**

## Non-delegable approvals (human-only)

- ambiguous product/legal decisions
- auth, cryptography, billing, privacy, safety controls
- destructive or hard-to-reverse data changes
- new privileged dependencies or tool permissions
- access to secrets or production data
- external messages, purchases, deletions, publishing
- disabling or weakening any gate
- accepting residual risk after a material finding
