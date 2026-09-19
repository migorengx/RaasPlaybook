# 0002. Pivot: RaaS means Result-as-a-Service, not RAG-as-a-Service

- **Status**: accepted · **Date**: <fill>
- **Deciders**: project owner

## Context

The generator was originally built assuming RaaS = RAG-as-a-Service, with
retrieval-quality gates (hit-rate@k, faithfulness, chunking risk tiers). The
owner clarified RaaS = **Result-as-a-Service**: products where AI agents deliver
finished, verifiable outcomes and customers pay per result (Sierra outcome-based
pricing; Deloitte on outcome-based agentic AI; withallo.com RaaS analysis).

## Decision

Rebuild the interview, playbook template, and generated scaffold on
outcome-delivery foundations:

- Unit of value: one delivered result (resolved case / report / transaction / dataset)
- Gates: verified-correct rate, verification coverage, **billing integrity
  (0 mis-billed, hard)**, client isolation, side-effect audit, SLA, cost per result
- Tier-H changes: autonomy expansion, outcome-definition/pricing changes,
  verifier swaps, new external-action channels
- Scaffold: outcomes/ (acceptance rules, gold set, reports), billing/ replay
  tests, tests/isolation, CI wired to outcome gates

RAG remains an internal implementation detail some products use, not the
product definition.

## Consequences

**Positive**: the playbook protects what RaaS actually sells — verified,
billable outcomes — including the billing/quality coupling unique to this model.

**Negative**: v1 RAG-specific interview content was discarded; teams with
pure-RAG internal products can use the generic agentic template instead.
