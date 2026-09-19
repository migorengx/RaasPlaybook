# Task Contract — <title> (Result-as-a-Service)

1. **Objective**: <the outcome improvement, in user terms>
2. **In scope**: <services/files; e.g. one pipeline step, one prompt template>
3. **Out of scope**: <esp. autonomy level, acceptance rules, pricing — those are tier-H>
4. **Constraints**: p95 turnaround ≤ <1h> | cost/result ≤ +<5>% | no new deps
5. **Sources of truth**: <acceptance rules, gold set vX, ADR-000N, billing config>
6. **Acceptance criteria (observable)**:
   - gold re-run: ≥ <95>% verified-correct on <150> cases
   - billing replay: 0 mis-billed results
   - <behavior-specific criterion>
7. **Required evidence**: commands + exit codes, gold re-run report, billing replay report
8. **Risk & approvals**: tier <L/M/H> per PLAYBOOK §4; approver: <name>
9. **Stop conditions**: accuracy below gate · billing mismatch · same failure twice · tier-H action needed
