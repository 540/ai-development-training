---
predictable: overview
---
## Project overview

`base` is made of 1 area — src — plus the project root, described area by area below. At run time it is built on `react` (imported by 1 of its modules) and `react-dom` (1), as `./package.json` lists them. Written by the run of 2026-10-27T15:14:37+00:00[UTC].

`base` — “Comparador de coches sobre la API de [fueleconomy.gov](https://www.fueleconomy.gov/feg/ws/) (EPA): listado por año y marca con buscador y filtros, ficha de cada versión y comparación lado a lado de hasta tres coches.” 5 modules. 2 carry an inferred requirement, 13 requirements: 13 violated. 1 stated failure.

Needs attention: 13 violated requirements, 8 in `src`. 11 obligations were never reached by this run, so nothing is known about them. The analysis produced 9 obligations in all: 2 not known to be reached by any caller and 7 the deciders each state a trigger for. The requirements and the observed behaviours are on the specification pages themselves, and Needs attention below lists one finding per class of defect, so a class with several findings gets one row and the rest are on the pages below.

`obligation` — one thing this run had to settle about one operation, most often that a particular failure cannot be reached. The 85 above are counted in these, and an obligation is not a finding: one the run could not settle reaches a page only when it can be stated as something a caller could act on.
`class of defect` — the family a row stands for, not one occurrence. A class can hold several distinct checks, so one row can stand for several findings. The module list further down gives each file's own counts.
`decider` — a rule that recognises one named class of defect by reading the code directly, rather than by following values along a path to ask whether a failure is possible. The two never claim the same class, which is why the observed behaviours are counted apart from the requirements.

### Needs attention

Each of these is stated in full on its own page. They are ordered by how much of the system each CLASS of defect takes with it when it happens. Within one class the order is not a ranking — this run recorded the same reading priority for all of them. That order is this page's own, from a fixed table of defect classes: the run itself recorded the same severity for every finding, so the ordering here is ours and not a measurement, and which of them matters most in your code is your judgement rather than one this analysis made. Whether a caller can reach any of them is undecided too — nothing in this run settled that.
- [A failure is answered as an empty result](src/App.tsx.spec.md)
- [`localStorage.setItem` throws when the browser denies storage access or storage is full, and no handler catches it](src/App.tsx.spec.md)

### How these numbers reconcile

1 of the stated failures on those pages comes from the deterministic inference rather than from this analysis, so it is counted in the module census at the top of this page and not in the obligation total above. The rest name a throw and the condition that reaches it, and no caller this analysis can see is known to meet that condition — so they are counted here and are on no page rather than stated as something a caller must do; they are in the run's machine-readable results (`.predictable-code/verification/.analysis-results.json`).

2 of 5 modules produced an inferred requirement. The other 3 produced none — that is not evidence they are correct. Here, a module is a translated source file with at least one declaration; test files are not counted. This analysis looked at 32 functions: 2 carry an obligation it could not discharge, 29 came back clean, and 1 it began and did not finish. 1 of those 2 do not reach a page: an obligation this analysis cannot state in a way a reader could act on is counted here and withheld there. Every one of the 29 had no recorded obligation, so nothing was established about any of them. Here `clean` means this analysis refuted nothing, never that nothing is wrong. 6 of those are the subject of an observed behaviour on the pages below, which a different engine decided. No requirement was proved in this run: `verified` means the operation performs the check in its own code, read from that code, and nothing here was discharged as a theorem.

### project root

Modules: Tsconfig · Vite

1 of 2 modules carries an inferred requirement, 5 requirements: 5 violated. Not every row below repeats its requirement as a count, so the tallies there add up to fewer than this.

- `tsconfig.json` — 5 requirements: 5 violated.

### `src`

Modules: App · Main · Vite-env

1 of 3 modules carries an inferred requirement, 8 requirements: 8 violated. 1 stated failure. Not every row below repeats its requirement as a count, so the tallies there add up to fewer than this.

- `App.tsx` — Provides `App`, `pedir.lambda` and `Home.onChange`. Requires for `lambda_162_76`: the `ok` of `r` is present and is not falsy [violated] and 10 more rules. `lambda_162_76` can fail with the error `fallo` when the `ok` of `r` is not true. 8 requirements: 8 violated. 1 stated failure.
- `main.tsx` —

A requirement is a condition an operation needs in order not to fail in the way its own row names — an operation with several failures carries a row for each, and meeting one says nothing about the others. Some a caller supplies, others the operation establishes and checks itself. Nobody has checked the callers.

**violated** — the analysis found a case where the condition fails.

`falsy` is JavaScript's word for a value that counts as false in a condition: `false`, `0`, an empty string, `null`, `undefined` or `NaN`.

**stated failure** — the operation is stated to fail with a named error — a behaviour it has, and one this analysis did not settle as prevented.
