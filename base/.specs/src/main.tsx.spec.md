---
predictable: spec
---
## Specification Details
- **ID:** SPEC-004
- **Name:** src/main.tsx

### Description
`main.tsx` — Main. This project's call graph records DIRECT calls only, so a function passed to a container, destructured into an exported binding, or reached through a dynamic lookup is not one it can see. Within that limit it records no call to this module.

### Notation

`implemented` — the operation exists in the code; every machine-written row carries it.

Tags: `[implemented, unexercised]` — execution never reached this, so nothing is known about it: either our generated inputs did not reach it, or they could not be run. Ids in the machine-managed sections below are assigned per run and are not stable references; cite the requirement's sentence.

### Witnessed

#### WIT-0011 [implemented, unexercised]
`document.getElementById('root')` is neither null nor undefined at line 6, as its `!` asserts. Not exercised by this run — either our generated inputs did not reach it, or they could not be run — so this is unknown rather than satisfied.

<!-- predictable:witnessed -->

<!-- predictable:vc=non-null-assertion:src/main.tsx:6:21 -->

- **Code locations:** [code location](../../.predictable-code/specs/locations/SPEC-004/WIT-0011.md)
