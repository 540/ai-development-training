# PokéApp — un repo con la red de verificación montada

Explorador de los 151 Pokémon de Kanto sobre [PokéAPI](https://pokeapi.co) v2, construido como
vehículo de la [PokéKata de 540](https://github.com/540/pokekata/blob/main/katayuno-completo.md).

La app es el pretexto. Lo que aquí se enseña es la **red de verificación**: seis gates deterministas
que rompen el build, montados *antes* que las funcionalidades, para responder a una pregunta
concreta — ¿puedo dejar de leer el código que escribe un agente si una red lo verifica por mí?

## Scorecard del gauntlet

La escalera de madurez de cada campo va de 0 a 4. Este es el estado real del repo, con los ceros
incluidos:

| # | campo | nivel | |
|---|---|---|---|
| 1 | aceptación (comportamiento) | **0** | |
| 2 | mutación de la especificación | **0** | |
| 3 | proceso spec-first | **0** | |
| 4 | test-first | **0** | |
| 5 | mutation testing del código | **3** | gate que rompe el build |
| 6 | cobertura con umbral | **3** | gate que rompe el build |
| 7 | calidad del código de test | **3** | gate que rompe el build |
| 8 | riesgo CRAP | **3** | gate que rompe el build |
| 9 | duplicación estructural | **3** | gate que rompe el build |
| 10 | arquitectura y dependencias | **3** | gate que rompe el build |

| métrica | valor |
|---|---|
| **score auditado** | **18/40** |
| subtotal especificación (campos 1-4) | 0/16 |
| subtotal tests (campos 5-7) | 9/12 |
| subtotal código (campos 8-10) | 9/12 |
| score de arnés | no declarado |

## Por qué los campos 1 a 4 están a 0

**Por decisión, no por descuido.** Un 18 ganado vale más como material de formación que un 25
inflado, y los ceros enseñan algo que un scorecard maquillado esconde: el score mide la distancia
al gauntlet completo, no al gauntlet cómodo.

Este repo construye la mitad de abajo de la pirámide — la que verifica el **código**. La mitad de
arriba verifica la **especificación**, y no está montada. La consecuencia es honesta y hay que
decirla en voz alta: los gates de aquí garantizan que el código hace bien lo que hace, y no
garantizan en absoluto que haga lo que el negocio pidió. Un agente puede dejar los seis en verde
implementando la funcionalidad equivocada.

Lo que haría falta para subirlos:

- **Campo 1 · aceptación.** Tests de comportamiento escritos en el lenguaje del dominio, que
  puedan fallar por una regla de negocio mal entendida y no solo por un bug. Hoy los tests de
  `tests/app` se acercan (conducen la app por lo que ve la persona usuaria), pero nacen del código,
  no de una especificación acordada antes.
- **Campo 2 · mutación de la especificación.** Un mecanismo que altere las reglas declaradas y
  compruebe que algún test de aceptación se entera. Sin esto no se sabe si la aceptación verifica
  o decora.
- **Campo 3 · spec-first.** Que la especificación exista y esté acordada *antes* que el código, y
  que el proceso lo imponga en vez de confiarlo a la disciplina.
- **Campo 4 · test-first.** Que el test se escriba antes que la implementación, con evidencia de
  que falló primero.

Los campos 3 y 4 son de **proceso**: no hay herramienta que los verifique sola, y por eso el
`CLAUDE.md` de este repo no los menciona. Declararlos sin gate que los sostenga inflaría el score
sin cambiar nada de lo que ocurre de verdad al escribir código.

El **score de arnés** (quién arregla lo que falla, gate humano, decisiones de diseño) no se declara
aquí: se pregunta al lead en la auditoría, no se lee del repo.

## Los seis gates

| # | gate | herramienta | umbral |
|---|---|---|---|
| 5 | mutación | StrykerJS | 100 % de mutantes muertos en `domain` y `application` |
| 6 | cobertura | Vitest + istanbul | 100 % en `domain`, `application` y `tools`; 90 % en `infrastructure`; 60 % en `ui` |
| 7 | calidad de tests | eslint-plugin-vitest | sin tests enfocados, desactivados, sin aserción o con título repetido |
| 8 | riesgo CRAP | script propio (`tools/crap`) | ninguna función por encima de CRAP 8 |
| 9 | duplicación | jscpd | cero duplicación estructural por encima de 50 tokens |
| 10 | arquitectura | dependency-cruiser | dependencia hacia dentro, sin ciclos ni huérfanos |

Los umbrales son distintos por capa a propósito: el 100 % se exige donde no hay excusa — reglas
puras, sin React ni red — y no se falsea con tests de render.

No existe herramienta de CRAP de referencia en TypeScript, así que el gate 8 es un script propio
que cruza complejidad ciclomática por función con su cobertura y aplica
`CRAP = CC² × (1-cov)³ + CC`. Es código de producción de este repo y pasa por los mismos gates que
el resto.

## Cómo se ejecuta

```bash
pnpm install   # instala también los hooks de git
pnpm verify    # tipos, lint y los seis gates
```

`pnpm verify` es el **único** comando que ejecuta la red entera, y es el mismo que invoca el hook
de pre-push: no hay dos listas que puedan divergir. Cada gate por separado:

```bash
pnpm typecheck     pnpm lint        pnpm arch
pnpm duplication   pnpm coverage    pnpm crap    pnpm mutation
```

`pnpm crap` lee el informe de `pnpm coverage`, así que necesita uno reciente.

### Los gates como condición para empujar código

- **pre-commit** — lo barato: tipos, lint sobre los ficheros preparados y tests relacionados con lo
  modificado. Un commit que solo toca Markdown no dispara nada.
- **pre-push** — el conjunto completo. Ningún check vive en otro sitio.

Los hooks están en `.githooks/` y se instalan solos al instalar dependencias.

## Alcance funcional

Solo F-01 (listado paginado), F-02 (detalle con dirección propia) y F-03 (búsqueda por fragmento)
de la kata. F-04 a F-15 quedan fuera.

La suite corre **offline y determinista**: MSW intercepta en la frontera HTTP y sirve respuestas
reales de PokéAPI capturadas como fixtures. Se asume el riesgo de no detectar drift del contrato —
un smoke contra la API real no cabe en la regla de pre-push.
