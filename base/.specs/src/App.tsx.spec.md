---
predictable: spec
---
## Specification Details
- **ID:** SPEC-001
- **Name:** src/App.tsx

### Description
`App.tsx` — App. This project's call graph records DIRECT calls only, so a function passed to a container, destructured into an exported binding, or reached through a dynamic lookup is not one it can see. Within that limit it records no call to this module. At least one of its operations is exported. `App` builds `cambiarComparar`, and no requirement here is about what runs inside it. A throw was noticed in `pedir` that this analysis could not decide, so no requirement here says when it happens. REFUTED: “`lambda` throws `Error` unless the `ok` of `r` is present and is not falsy.” 9 requirements: 9 violated. 1 stated failure.

### Declarations

`App` — Declares 18 functions:
- `traducirClase`(`v`) — internal, no requirement inferred
- `traducirCambio`(`v`) — internal, no requirement inferred
- `traducirVersion`(`v`) — internal, no requirement inferred
- `num`(`x`) — internal, no requirement inferred
- `dec`(`x`) — internal, no requirement inferred
- `sacarRuta`() — internal, no requirement inferred
- `aLista`(`x`) — internal, no requirement inferred
- `pedir`(`url`) — internal, no requirement inferred
- `litros`(`mpg`) — internal, no requirement inferred
- `kwh`(`x`) — internal, no requirement inferred
- `km`(`millas`) — internal, no requirement inferred
- `convertir`(`d`) — internal; at line 212: Lookup in `nombresCombustible` can hit a built-in property
- `leerComparar`() — internal; a failure is answered as an empty result
- `App`() — `localStorage.setItem` can throw
- `Home`(`props`) — internal; at line 444: Lookup in `nombresCombustible` can hit a built-in property; at line 481: Lookup in `colores` can hit a built-in property
- `Esqueleto`(`props`) — internal, no requirement inferred
- `Detalle`(`props`) — internal; at line 602: Lookup in `colores` can hit a built-in property
- `Comparar`(`props`) — internal; at line 774: Lookup in `colores` can hit a built-in property; `valores` is a lazy sequence and is consumed twice

`pedir` — Declares 1 operation: `lambda_162`(`r`).

Requires of its callers (1) — a `[violated]` one has a case where it fails:
- for `lambda_162_76`: the `ok` of `r` is present and is not empty, zero or false [violated]

`Home` — Declares 1 operation: `onChange`(`e`).

### Notation

A requirement is a condition an operation needs in order not to fail in the way its own row names — an operation with several failures carries a row for each, and meeting one says nothing about the others. Some a caller supplies, others the operation establishes and checks itself. Nobody has checked the callers.

`implemented` — the operation exists in the code; every machine-written row carries it.

Tags: `[implemented, violated]` — the analysis found a case where the condition fails.
`[implemented, stated-failure]` — the operation is stated to fail with a named error — a behaviour it has, and one this analysis did not settle as prevented.
`[violated]` on the card above and `[implemented, violated]` on a row below are one state;
likewise for the other one.

On the cards: `internal` — nothing outside this file can reach the operation (a `private` member, or a declaration the module does not export), so a requirement here is not addressed to anybody outside it. `no requirement inferred` — no requirement on this page is about the operation. Either nothing was decided about it, or what was decided is not addressed to a caller (see `internal`); neither means nothing is needed. Where the analysis could not finish, the description above says so by name.

`falsy` is JavaScript's word for a value that counts as false in a condition: `false`, `0`, an empty string, `null`, `undefined` or `NaN`. Ids in the machine-managed sections below are assigned per run and are not stable references; cite the requirement's sentence.

### Requirements

#### pedir.lambda_162_76 <!-- predictable:group -->

##### REQ-0001 [implemented, stated-failure]
When the `ok` of `r` is not true, `pedir.lambda_162_76` fails saying "fallo".

<!-- predictable:inferred -->

<!-- predictable:subject=pedir.lambda_162_76 -->

- **Code locations:** [src/App.tsx:162-165](../../src/App.tsx#L162-L165)

<!-- predictable:code-locations=.predictable-code/specs/locations/SPEC-001/REQ-0001.md -->

### Analysis

#### pedir.lambda_162_76 <!-- predictable:group -->

##### ANL-0001 [implemented, violated]
`lambda` throws `Error` unless the `ok` of `r` is present and is not falsy.

<!-- predictable:analysis -->

<!-- predictable:subject=pedir.lambda_162_76 -->

<!-- predictable:vc=il1.self-guard -->

<!-- predictable:throws=Error -->

<!-- predictable:canonical=`pedir.lambda_162_76` only works when the `ok` of `r` is present and is not empty, zero or false. -->

- **Code locations:** [src/App.tsx:162-165](../../src/App.tsx#L162-L165)

<!-- predictable:code-locations=.predictable-code/specs/locations/SPEC-001/ANL-0001.md -->

### Behaviours

#### App.convertir <!-- predictable:group -->

##### BEH-0001 [implemented, violated]
At line 212: Lookup in `nombresCombustible` can hit a built-in property. A key such as `constructor` returns a value that `nombresCombustible` never held, and it is neither absent nor falsy. Safe to rely on when the key is confirmed to be one of `nombresCombustible`'s own entries.

<!-- predictable:behaviour -->

<!-- predictable:subject=App.convertir -->

<!-- predictable:vc=site.table-key-not-checked.nombresCombustible.6c88b033 -->

- **Code locations:** [src/App.tsx:212](../../src/App.tsx#L212)

<!-- predictable:code-locations=.predictable-code/specs/locations/SPEC-001/BEH-0001.md -->

#### App.leerComparar <!-- predictable:group -->

##### BEH-0002 [implemented, violated]
A failure is answered as an empty result. The handler catches every failure and returns an empty collection. Callers cannot tell a failure from "nothing found". Safe to rely on when a caller of this function can tell a failure from an empty result.

<!-- predictable:behaviour -->

<!-- predictable:subject=App.leerComparar -->

<!-- predictable:vc=site.failure-answered-as-empty.-.3faac660 -->

- **Code locations:** [src/App.tsx:242](../../src/App.tsx#L242)

<!-- predictable:code-locations=.predictable-code/specs/locations/SPEC-001/BEH-0002.md -->

#### App.App <!-- predictable:group -->

##### BEH-0003 [implemented, violated]
`localStorage.setItem` can throw. Browsers that block storage throw here, as does a full storage quota, and nothing catches it. Safe to rely on when `localStorage.setItem` at this line does not let an exception escape when the browser denies storage access or the quota is full.

<!-- predictable:behaviour -->

<!-- predictable:subject=App.App -->

<!-- predictable:vc=site.environment-throw-unguarded.localStorage.139da5bd -->

- **Code locations:** [src/App.tsx:271](../../src/App.tsx#L271)

<!-- predictable:code-locations=.predictable-code/specs/locations/SPEC-001/BEH-0003.md -->

#### App.Home <!-- predictable:group -->

##### BEH-0004 [implemented, violated]
At line 444: Lookup in `nombresCombustible` can hit a built-in property. A key such as `constructor` returns a value that `nombresCombustible` never held, and it is neither absent nor falsy. Safe to rely on when the key is confirmed to be one of `nombresCombustible`'s own entries.

<!-- predictable:behaviour -->

<!-- predictable:subject=App.Home -->

<!-- predictable:vc=site.table-key-not-checked.nombresCombustible.6c88b033 -->

- **Code locations:** [src/App.tsx:444](../../src/App.tsx#L444)

<!-- predictable:code-locations=.predictable-code/specs/locations/SPEC-001/BEH-0004.md -->

##### BEH-0005 [implemented, violated]
At line 481: Lookup in `colores` can hit a built-in property. A key such as `constructor` returns a value that `colores` never held, and it is neither absent nor falsy. Safe to rely on when the key is confirmed to be one of `colores`'s own entries.

<!-- predictable:behaviour -->

<!-- predictable:subject=App.Home -->

<!-- predictable:vc=site.table-key-not-checked.colores.46dc58b2 -->

- **Code locations:** [src/App.tsx:481](../../src/App.tsx#L481)

<!-- predictable:code-locations=.predictable-code/specs/locations/SPEC-001/BEH-0005.md -->

#### App.Detalle <!-- predictable:group -->

##### BEH-0006 [implemented, violated]
At line 602: Lookup in `colores` can hit a built-in property. A key such as `constructor` returns a value that `colores` never held, and it is neither absent nor falsy. Safe to rely on when the key is confirmed to be one of `colores`'s own entries.

<!-- predictable:behaviour -->

<!-- predictable:subject=App.Detalle -->

<!-- predictable:vc=site.table-key-not-checked.colores.46dc58b2 -->

- **Code locations:** [src/App.tsx:602](../../src/App.tsx#L602)

<!-- predictable:code-locations=.predictable-code/specs/locations/SPEC-001/BEH-0006.md -->

#### App.Comparar <!-- predictable:group -->

##### BEH-0007 [implemented, violated]
At line 774: Lookup in `colores` can hit a built-in property. A key such as `constructor` returns a value that `colores` never held, and it is neither absent nor falsy. Safe to rely on when the key is confirmed to be one of `colores`'s own entries.

<!-- predictable:behaviour -->

<!-- predictable:subject=App.Comparar -->

<!-- predictable:vc=site.table-key-not-checked.colores.46dc58b2 -->

- **Code locations:** [src/App.tsx:774](../../src/App.tsx#L774)

<!-- predictable:code-locations=.predictable-code/specs/locations/SPEC-001/BEH-0007.md -->

##### BEH-0008 [implemented, violated]
`valores` is a lazy sequence and is consumed twice. `valores` produces its elements only when consumed, and it is consumed more than once. The second pass throws, sees nothing, or repeats all the work. Safe to rely on when `valores` is consumed at most once, or collected before it is used again.

<!-- predictable:behaviour -->

<!-- predictable:subject=App.Comparar -->

<!-- predictable:vc=site.single-pass-sequence-reused.valores.b0baff2c -->

- **Code locations:** [src/App.tsx:789](../../src/App.tsx#L789)

<!-- predictable:code-locations=.predictable-code/specs/locations/SPEC-001/BEH-0008.md -->
