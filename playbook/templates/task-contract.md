# Task Contract — <title> (RaaS)

1. **Objective**: <user/system outcome>
2. **In scope**: <services/files, e.g. retrieve/, one prompt template>
3. **Out of scope**: <esp. chunking params, embedding model, tenant schemas>
4. **Constraints**: p95 ≤ <ms> | $/query ≤ <budget> | provider limits | residency
5. **Sources of truth**: <API schema, golden set vX, ADR-000N, tenant config schema>
6. **Acceptance criteria (observable)**:
   - hit-rate@5 ≥ <0.85> on golden <vX>
   - faithfulness ≥ <0.90>; hallucination ≤ <2%>
   - cross-tenant leak = 0 (hard)
   - <behavior-specific criterion>
7. **Evidence required**: eval report before/after, cost delta, `make check`
   output with exit codes, leak-test result
8. **Risk & approvals**: tier <L/M/H> per PLAYBOOK §5; approver: <name>
9. **Stop conditions**: eval regression below gate; leak-test failure;
   same failure twice; destructive operation proposed
