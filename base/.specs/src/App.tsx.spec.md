---
predictable: spec
---
## Specification Details
- **ID:** SPEC-001
- **Name:** src/App.tsx

### Description
`App.tsx` — App. This project's call graph records DIRECT calls only, so a function passed to a container, destructured into an exported binding, or reached through a dynamic lookup is not one it can see. Within that limit it records no call to this module. At least one of its operations is exported. `App` builds `cambiarComparar`, and no requirement here is about what runs inside it. A throw was noticed in `pedir` that this analysis could not decide, so no requirement here says when it happens. REFUTED: “`lambda` throws `Error` unless the `ok` of `r` is present and is not falsy.” 8 requirements: 8 violated. 1 stated failure.

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
- `kwh`(`x`) — internal; requires KM_POR_MILLA is not zero. Not exercised by this run — either our generated inputs did not reach it, or they could not be run — so this is unknown rather than satisfied [unexercised]
- `km`(`millas`) — internal, no requirement inferred
- `convertir`(`d`) — internal; requires KM_POR_MILLA is not zero. Not exercised by this run — either our generated inputs did not reach it, or they could not be run — so this is unknown rather than satisfied [unexercised]; the key is confirmed to be one of `nombresCombustible`'s own entries. Not exercised by this run — either our generated inputs did not reach it, or they could not be run — so this is unknown rather than satisfied [unexercised]; at line 212: `nombresCombustible` is asked about a key that was not checked against its own entries
- `leerComparar`() — internal; requires a caller of this function can tell a failure from an empty result. Not exercised by this run — either our generated inputs did not reach it, or they could not be run — so this is unknown rather than satisfied [unexercised]; a failure is answered as an empty result
- `App`() — requires `localStorage.setItem` at this line does not let an exception escape when the browser denies storage access or the quota is full. Not exercised by this run — either our generated inputs did not reach it, or they could not be run — so this is unknown rather than satisfied [unexercised]; `localStorage.setItem` throws when the browser denies storage access or storage is full, and no handler catches it
- `Home`(`props`) — internal; requires some branch of the 4-way chain matches. Not exercised by this run — either our generated inputs did not reach it, or they could not be run — so this is unknown rather than satisfied [unexercised]; the key is confirmed to be one of `nombresCombustible`'s own entries. Not exercised by this run — either our generated inputs did not reach it, or they could not be run — so this is unknown rather than satisfied [unexercised]; the key is confirmed to be one of `colores`'s own entries. Not exercised by this run — either our generated inputs did not reach it, or they could not be run — so this is unknown rather than satisfied [unexercised]; at line 444: `nombresCombustible` is asked about a key that was not checked against its own entries; at line 481: `colores` is asked about a key that was not checked against its own entries
- `Esqueleto`(`props`) — internal, no requirement inferred
- `Detalle`(`props`) — internal; requires the key is confirmed to be one of `colores`'s own entries. Not exercised by this run — either our generated inputs did not reach it, or they could not be run — so this is unknown rather than satisfied [unexercised]; at line 602: `colores` is asked about a key that was not checked against its own entries
- `Comparar`(`props`) — internal; requires the key is confirmed to be one of `colores`'s own entries. Not exercised by this run — either our generated inputs did not reach it, or they could not be run — so this is unknown rather than satisfied [unexercised]; at line 774: `colores` is asked about a key that was not checked against its own entries

An `[unexercised]` one was never reached by this run, so nothing is known about it.

`pedir` — Declares 1 operation: `lambda_162`(`r`).

Requires of its callers (4) — an `[unexercised]` one was never reached, so nothing is known about it, a `[violated]` one has a case where it fails:
- for `lambda_162_76`: the `ok` of `r` is present and is not empty, zero or false [violated]
- for `kwh`: KM_POR_MILLA is not zero. Not exercised by this run — either our generated inputs did not reach it, or they could not be run — so this is unknown rather than satisfied [unexercised]
- for `convertir`: KM_POR_MILLA is not zero. Not exercised by this run — either our generated inputs did not reach it, or they could not be run — so this is unknown rather than satisfied [unexercised]
- for `Home`: some branch of the 4-way chain matches. Not exercised by this run — either our generated inputs did not reach it, or they could not be run — so this is unknown rather than satisfied [unexercised]

`Home` — Declares 1 operation: `onChange`(`e`).

Requires of its callers (3) — an `[unexercised]` one was never reached, so nothing is known about it:
- for `kwh`: KM_POR_MILLA is not zero. Not exercised by this run — either our generated inputs did not reach it, or they could not be run — so this is unknown rather than satisfied [unexercised]
- for `convertir`: KM_POR_MILLA is not zero. Not exercised by this run — either our generated inputs did not reach it, or they could not be run — so this is unknown rather than satisfied [unexercised]
- for `Home`: some branch of the 4-way chain matches. Not exercised by this run — either our generated inputs did not reach it, or they could not be run — so this is unknown rather than satisfied [unexercised]

### Notation

A requirement is a condition an operation needs in order not to fail in the way its own row names — an operation with several failures carries a row for each, and meeting one says nothing about the others. Some a caller supplies, others the operation establishes and checks itself. Nobody has checked the callers.

`implemented` — the operation exists in the code; every machine-written row carries it.

Tags: `[implemented, unexercised]` — execution never reached this, so nothing is known about it: either our generated inputs did not reach it, or they could not be run.
`[implemented, violated]` — the analysis found a case where the condition fails.
`[implemented, stated-failure]` — the operation is stated to fail with a named error — a behaviour it has, and one this analysis did not settle as prevented.
`[violated]` on the card above and `[implemented, violated]` on a row below are one state;
likewise for the other 2.

On the cards: `internal` — nothing outside this file can reach the operation (a `private` member, or a declaration the module does not export), so a requirement here is not addressed to anybody outside it. `no requirement inferred` — no requirement on this page is about the operation. Either nothing was decided about it, or what was decided is not addressed to a caller (see `internal`); neither means nothing is needed. Where the analysis could not finish, the description above says so by name.

`falsy` is JavaScript's word for a value that counts as false in a condition: `false`, `0`, an empty string, `null`, `undefined` or `NaN`. Ids in the machine-managed sections below are assigned per run and are not stable references; cite the requirement's sentence.

### Requirements

#### pedir.lambda_162_76 <!-- predictable:group -->

##### REQ-0001 [implemented, stated-failure]
When the `ok` of `r` is not true, `pedir.lambda_162_76` fails saying "fallo".

<!-- predictable:inferred -->

<!-- predictable:subject=pedir.lambda_162_76 -->

- **Code locations:** [code location](../../.predictable-code/specs/locations/SPEC-001/REQ-0001.md)

### Analysis

#### pedir.lambda_162_76 <!-- predictable:group -->

##### ANL-0001 [implemented, violated]
`lambda` throws `Error` unless the `ok` of `r` is present and is not falsy.

<!-- predictable:analysis -->

<!-- predictable:subject=pedir.lambda_162_76 -->

<!-- predictable:vc=il1.self-guard -->

<!-- predictable:throws=Error -->

<!-- predictable:canonical=`pedir.lambda_162_76` requires that the `ok` of `r` is present and is not empty, zero or false. -->

- **Code locations:** [code location](../../.predictable-code/specs/locations/SPEC-001/ANL-0001.md)

### Witnessed

#### kwh <!-- predictable:group -->

##### WIT-0001 [implemented, unexercised]
`kwh` requires that KM_POR_MILLA is not zero. Not exercised by this run — either our generated inputs did not reach it, or they could not be run — so this is unknown rather than satisfied.

<!-- predictable:witnessed -->

<!-- predictable:subject=kwh -->

<!-- predictable:vc=divisor-nonzero:src/App.tsx:182:22 -->

- **Code locations:** [code location](../../.predictable-code/specs/locations/SPEC-001/WIT-0001.md)

#### convertir <!-- predictable:group -->

##### WIT-0002 [implemented, unexercised]
`convertir` requires that KM_POR_MILLA is not zero. Not exercised by this run — either our generated inputs did not reach it, or they could not be run — so this is unknown rather than satisfied.

<!-- predictable:witnessed -->

<!-- predictable:subject=convertir -->

<!-- predictable:vc=divisor-nonzero:src/App.tsx:203:23 -->

- **Code locations:** [code location](../../.predictable-code/specs/locations/SPEC-001/WIT-0002.md)

#### src.App.convertir <!-- predictable:group -->

##### WIT-0003 [implemented, unexercised]
`src.App.convertir` requires that the key is confirmed to be one of `nombresCombustible`'s own entries. Not exercised by this run — either our generated inputs did not reach it, or they could not be run — so this is unknown rather than satisfied.

<!-- predictable:witnessed -->

<!-- predictable:subject=src.App.convertir -->

<!-- predictable:vc=table-key-not-checked:1 -->

- **Code locations:** [code location](../../.predictable-code/specs/locations/SPEC-001/WIT-0003.md)

#### src.App.leerComparar <!-- predictable:group -->

##### WIT-0004 [implemented, unexercised]
`src.App.leerComparar` requires that a caller of this function can tell a failure from an empty result. Not exercised by this run — either our generated inputs did not reach it, or they could not be run — so this is unknown rather than satisfied.

<!-- predictable:witnessed -->

<!-- predictable:subject=src.App.leerComparar -->

<!-- predictable:vc=failure-answered-as-empty:6 -->

- **Code locations:** [code location](../../.predictable-code/specs/locations/SPEC-001/WIT-0004.md)

#### src.App.App <!-- predictable:group -->

##### WIT-0005 [implemented, unexercised]
`src.App.App` requires that `localStorage.setItem` at this line does not let an exception escape when the browser denies storage access or the quota is full. Not exercised by this run — either our generated inputs did not reach it, or they could not be run — so this is unknown rather than satisfied.

<!-- predictable:witnessed -->

<!-- predictable:subject=src.App.App -->

<!-- predictable:vc=environment-throw-unguarded:0 -->

- **Code locations:** [code location](../../.predictable-code/specs/locations/SPEC-001/WIT-0005.md)

#### Home <!-- predictable:group -->

##### WIT-0006 [implemented, unexercised]
`Home` requires that some branch of the 4-way chain matches. Not exercised by this run — either our generated inputs did not reach it, or they could not be run — so this is unknown rather than satisfied.

<!-- predictable:witnessed -->

<!-- predictable:subject=Home -->

<!-- predictable:vc=unmatched-chain:src/App.tsx:382:7 -->

- **Code locations:** [code location](../../.predictable-code/specs/locations/SPEC-001/WIT-0006.md)

#### src.App.Home <!-- predictable:group -->

##### WIT-0007 [implemented, unexercised]
`src.App.Home` requires that the key is confirmed to be one of `nombresCombustible`'s own entries. Not exercised by this run — either our generated inputs did not reach it, or they could not be run — so this is unknown rather than satisfied.

<!-- predictable:witnessed -->

<!-- predictable:subject=src.App.Home -->

<!-- predictable:vc=table-key-not-checked:2 -->

- **Code locations:** [code location](../../.predictable-code/specs/locations/SPEC-001/WIT-0007.md)

##### WIT-0008 [implemented, unexercised]
`src.App.Home` requires that the key is confirmed to be one of `colores`'s own entries. Not exercised by this run — either our generated inputs did not reach it, or they could not be run — so this is unknown rather than satisfied.

<!-- predictable:witnessed -->

<!-- predictable:subject=src.App.Home -->

<!-- predictable:vc=table-key-not-checked:3 -->

- **Code locations:** [code location](../../.predictable-code/specs/locations/SPEC-001/WIT-0008.md)

#### src.App.Detalle <!-- predictable:group -->

##### WIT-0009 [implemented, unexercised]
`src.App.Detalle` requires that the key is confirmed to be one of `colores`'s own entries. Not exercised by this run — either our generated inputs did not reach it, or they could not be run — so this is unknown rather than satisfied.

<!-- predictable:witnessed -->

<!-- predictable:subject=src.App.Detalle -->

<!-- predictable:vc=table-key-not-checked:4 -->

- **Code locations:** [code location](../../.predictable-code/specs/locations/SPEC-001/WIT-0009.md)

#### src.App.Comparar <!-- predictable:group -->

##### WIT-0010 [implemented, unexercised]
`src.App.Comparar` requires that the key is confirmed to be one of `colores`'s own entries. Not exercised by this run — either our generated inputs did not reach it, or they could not be run — so this is unknown rather than satisfied.

<!-- predictable:witnessed -->

<!-- predictable:subject=src.App.Comparar -->

<!-- predictable:vc=table-key-not-checked:5 -->

- **Code locations:** [code location](../../.predictable-code/specs/locations/SPEC-001/WIT-0010.md)

### Behaviours

#### App.convertir <!-- predictable:group -->

##### BEH-0001 [implemented, violated]
At line 212: `nombresCombustible` is asked about a key that was not checked against its own entries. `nombresCombustible` is a table of fixed entries, and this asks it about a key the code did not choose. Indexing answers "what does this name resolve to", which on an ordinary object includes everything the language put there before the author's own keys — so a key like `constructor` comes back with a value, and it is neither absent nor falsy. Testing the RESULT cannot separate the two cases; only asking whether the key is one of the table's OWN can. Use a presence test, or a map that holds only what was put in it. Safe to rely on when the key is confirmed to be one of `nombresCombustible`'s own entries.

<!-- predictable:behaviour -->

<!-- predictable:subject=App.convertir -->

<!-- predictable:vc=site.table-key-not-checked.nombresCombustible.6c88b033 -->

- **Code locations:** [code location](../../.predictable-code/specs/locations/SPEC-001/BEH-0001.md)

#### App.leerComparar <!-- predictable:group -->

##### BEH-0002 [implemented, violated]
A failure is answered as an empty result. When the work inside this `try` fails, the handler catches every failure and returns an empty collection, which is what this function also returns when there is genuinely nothing. A caller cannot tell a failure from an empty result, so it shows or stores "none" where it should have reported that the work did not happen. Return something the success path never returns, or let the failure out. Safe to rely on when a caller of this function can tell a failure from an empty result.

<!-- predictable:behaviour -->

<!-- predictable:subject=App.leerComparar -->

<!-- predictable:vc=site.failure-answered-as-empty.-.3faac660 -->

- **Code locations:** [code location](../../.predictable-code/specs/locations/SPEC-001/BEH-0002.md)

#### App.App <!-- predictable:group -->

##### BEH-0003 [implemented, violated]
`localStorage.setItem` throws when the browser denies storage access or storage is full, and no handler catches it. `localStorage.setItem` throws when the browser refuses storage access (site data blocked in its settings, or a sandboxed frame) and when the storage quota is full. The arguments cannot prevent this, and a browser with storage allowed and space free will never show it. No `try`/`catch` covers this call, so the exception propagates out of this function. Safe to rely on when `localStorage.setItem` at this line does not let an exception escape when the browser denies storage access or the quota is full.

<!-- predictable:behaviour -->

<!-- predictable:subject=App.App -->

<!-- predictable:vc=site.environment-throw-unguarded.localStorage.139da5bd -->

- **Code locations:** [code location](../../.predictable-code/specs/locations/SPEC-001/BEH-0003.md)

#### App.Home <!-- predictable:group -->

##### BEH-0004 [implemented, violated]
At line 444: `nombresCombustible` is asked about a key that was not checked against its own entries. `nombresCombustible` is a table of fixed entries, and this asks it about a key the code did not choose. Indexing answers "what does this name resolve to", which on an ordinary object includes everything the language put there before the author's own keys — so a key like `constructor` comes back with a value, and it is neither absent nor falsy. Testing the RESULT cannot separate the two cases; only asking whether the key is one of the table's OWN can. Use a presence test, or a map that holds only what was put in it. Safe to rely on when the key is confirmed to be one of `nombresCombustible`'s own entries.

<!-- predictable:behaviour -->

<!-- predictable:subject=App.Home -->

<!-- predictable:vc=site.table-key-not-checked.nombresCombustible.6c88b033 -->

- **Code locations:** [code location](../../.predictable-code/specs/locations/SPEC-001/BEH-0004.md)

##### BEH-0005 [implemented, violated]
At line 481: `colores` is asked about a key that was not checked against its own entries. `colores` is a table of fixed entries, and this asks it about a key the code did not choose. Indexing answers "what does this name resolve to", which on an ordinary object includes everything the language put there before the author's own keys — so a key like `constructor` comes back with a value, and it is neither absent nor falsy. Testing the RESULT cannot separate the two cases; only asking whether the key is one of the table's OWN can. Use a presence test, or a map that holds only what was put in it. Safe to rely on when the key is confirmed to be one of `colores`'s own entries.

<!-- predictable:behaviour -->

<!-- predictable:subject=App.Home -->

<!-- predictable:vc=site.table-key-not-checked.colores.46dc58b2 -->

- **Code locations:** [code location](../../.predictable-code/specs/locations/SPEC-001/BEH-0005.md)

#### App.Detalle <!-- predictable:group -->

##### BEH-0006 [implemented, violated]
At line 602: `colores` is asked about a key that was not checked against its own entries. `colores` is a table of fixed entries, and this asks it about a key the code did not choose. Indexing answers "what does this name resolve to", which on an ordinary object includes everything the language put there before the author's own keys — so a key like `constructor` comes back with a value, and it is neither absent nor falsy. Testing the RESULT cannot separate the two cases; only asking whether the key is one of the table's OWN can. Use a presence test, or a map that holds only what was put in it. Safe to rely on when the key is confirmed to be one of `colores`'s own entries.

<!-- predictable:behaviour -->

<!-- predictable:subject=App.Detalle -->

<!-- predictable:vc=site.table-key-not-checked.colores.46dc58b2 -->

- **Code locations:** [code location](../../.predictable-code/specs/locations/SPEC-001/BEH-0006.md)

#### App.Comparar <!-- predictable:group -->

##### BEH-0007 [implemented, violated]
At line 774: `colores` is asked about a key that was not checked against its own entries. `colores` is a table of fixed entries, and this asks it about a key the code did not choose. Indexing answers "what does this name resolve to", which on an ordinary object includes everything the language put there before the author's own keys — so a key like `constructor` comes back with a value, and it is neither absent nor falsy. Testing the RESULT cannot separate the two cases; only asking whether the key is one of the table's OWN can. Use a presence test, or a map that holds only what was put in it. Safe to rely on when the key is confirmed to be one of `colores`'s own entries.

<!-- predictable:behaviour -->

<!-- predictable:subject=App.Comparar -->

<!-- predictable:vc=site.table-key-not-checked.colores.46dc58b2 -->

- **Code locations:** [code location](../../.predictable-code/specs/locations/SPEC-001/BEH-0007.md)
