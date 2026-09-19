---
name: Agent task (contract)
about: Work scoped for an AI agent — fill all 9 fields before delegating
labels: agent-task
---

## 1. Objective

<The user or system outcome. One sentence.>

## 2. In scope

<Components and behavior allowed to change.>

## 3. Out of scope

<Tempting adjacent work that must NOT be touched.>

## 4. Constraints

<Compatibility, performance, policy, style, deadline, rollout limits.>

## 5. Sources of truth

<Exact docs, schemas, tests, tickets, or owners that resolve ambiguity.>

## 6. Acceptance criteria (observable)

<Visible behavior and bounds, incl. negative/edge cases. Not implementation.>
- <e.g. "A 503 is retried at most 3× with bounded backoff; 4xx is not retried">

## 7. Required evidence

<Commands and artifacts that establish acceptance.>
- [ ] `make check` passes (paste command + exit code)
- [ ] <task-specific check>

## 8. Risk & approvals

<Blast radius, data class, external effects. Named approver if high risk.>

## 9. Stop conditions

Stop and escalate to a human when: requirements stay ambiguous after reading
sources of truth, the same failure repeats twice, a destructive action is
needed, or the change budget (files/diff size) would be exceeded:
<limits or "none defined">
