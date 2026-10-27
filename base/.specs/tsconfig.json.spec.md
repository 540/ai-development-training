---
predictable: spec
---
## Specification Details
- **ID:** SPEC-005
- **Name:** tsconfig.json

### Description
`tsconfig.json` — Tsconfig. 5 requirements: 5 violated.

### Notation

A requirement is a condition an operation needs in order not to fail in the way its own row names — an operation with several failures carries a row for each, and meeting one says nothing about the others. Some a caller supplies, others the operation establishes and checks itself. Nobody has checked the callers.

`implemented` — the operation exists in the code; every machine-written row carries it.

Tags: `[implemented, violated]` — the analysis found a case where the condition fails. Ids in the machine-managed sections below are assigned per run and are not stable references; cite the requirement's sentence.

### Witnessed

#### noImplicitAny <!-- predictable:group -->

##### WIT-0012 [implemented, violated]
The project's configuration must turn `noImplicitAny` on. `noImplicitAny` is off, so the compiler assumes an untyped value is `any`, which silently switches off every check that follows it — 18 sites in the scanned sources inherit that assumption. This is read from the project's configuration: a setting is not a path in the code, so there is nothing for a test to reach.

<!-- predictable:witnessed -->

<!-- predictable:subject=noImplicitAny -->

<!-- predictable:vc=unsound-compiler-flag:tsconfig.json:noImplicitAny -->

- **Code locations:** [code location](../.predictable-code/specs/locations/SPEC-005/WIT-0012.md)

#### strictNullChecks <!-- predictable:group -->

##### WIT-0013 [implemented, violated]
The project's configuration must turn `strictNullChecks` on. `strictNullChecks` is off, so the compiler assumes every value of type `T` is present, while `null` and `undefined` are assignable to it — so the type system says nothing at all about absence — 275 sites in the scanned sources inherit that assumption. This is read from the project's configuration: a setting is not a path in the code, so there is nothing for a test to reach.

<!-- predictable:witnessed -->

<!-- predictable:subject=strictNullChecks -->

<!-- predictable:vc=unsound-compiler-flag:tsconfig.json:strictNullChecks -->

- **Code locations:** [code location](../.predictable-code/specs/locations/SPEC-005/WIT-0013.md)

#### noUncheckedIndexedAccess <!-- predictable:group -->

##### WIT-0014 [implemented, violated]
The project's configuration must turn `noUncheckedIndexedAccess` on. `noUncheckedIndexedAccess` is off, so the compiler assumes `arr[i]` and `map[k]` have type `T`, while an out-of-range index gives `undefined`, typed as if it were a value, so the mistake surfaces later, far from its cause — 44 sites in the scanned sources inherit that assumption. This is read from the project's configuration: a setting is not a path in the code, so there is nothing for a test to reach.

<!-- predictable:witnessed -->

<!-- predictable:subject=noUncheckedIndexedAccess -->

<!-- predictable:vc=unsound-compiler-flag:tsconfig.json:noUncheckedIndexedAccess -->

- **Code locations:** [code location](../.predictable-code/specs/locations/SPEC-005/WIT-0014.md)

#### strictPropertyInitialization <!-- predictable:group -->

##### WIT-0015 [implemented, violated]
The project's configuration must turn `strictPropertyInitialization` on. `strictPropertyInitialization` is off, so the compiler assumes a declared field has its type before any constructor assigns it, so a read during construction can see `undefined`. This is read from the project's configuration: a setting is not a path in the code, so there is nothing for a test to reach.

<!-- predictable:witnessed -->

<!-- predictable:subject=strictPropertyInitialization -->

<!-- predictable:vc=unsound-compiler-flag:tsconfig.json:strictPropertyInitialization -->

- **Code locations:** [code location](../.predictable-code/specs/locations/SPEC-005/WIT-0015.md)

#### useUnknownInCatchVariables <!-- predictable:group -->

##### WIT-0016 [implemented, violated]
The project's configuration must turn `useUnknownInCatchVariables` on. `useUnknownInCatchVariables` is off, so the compiler assumes a `catch` binder is `any` rather than `unknown`, so reading `e.message` off a thrown string or plain object is unchecked — 1 site in the scanned sources inherits that assumption. This is read from the project's configuration: a setting is not a path in the code, so there is nothing for a test to reach.

<!-- predictable:witnessed -->

<!-- predictable:subject=useUnknownInCatchVariables -->

<!-- predictable:vc=unsound-compiler-flag:tsconfig.json:useUnknownInCatchVariables -->

- **Code locations:** [code location](../.predictable-code/specs/locations/SPEC-005/WIT-0016.md)
