# Architecture

> Keep this file current. Agents read it before every change.

## Overview

<One paragraph: what this project does and for whom.>

## Stack

| Layer     | Technology | Why |
|-----------|------------|-----|
| Language  | <TBD>      |     |
| Framework | <TBD>      |     |
| Storage   | <TBD>      |     |
| Testing   | <TBD>      |     |

## Directory Layout

```
src/           # application source
tests/         # mirrors src/ structure
docs/
  adr/         # architecture decision records
  memory/      # agent session handoff (summary, decisions, next-steps)
.github/       # CI + PR/issue templates
```

## Data Flow

```
input → <component> → <component> → output
```

<Describe the main flow with real component names once they exist.>

## Key Invariants

- <Invariant 1: e.g. "polling never runs on the UI thread">
- <Invariant 2>

## Constraints

- <e.g. OBS compatibility, offline mode, platform support>
