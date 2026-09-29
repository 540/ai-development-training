# Comparador de coches

Comparador de coches sobre la API de [fueleconomy.gov](https://www.fueleconomy.gov/feg/ws/) (EPA): listado por año y marca con buscador y filtros, ficha de cada versión y comparación lado a lado de hasta tres coches.

## Arrancar

```bash
pnpm install
pnpm dev
```

## Práctica

La misma petición de la rama `base`, ahora en tres fases: investigar, planificar e implementar. Cada fase se lanza en una conversación nueva y le pasa a la siguiente un único fichero.

1. **Research**: investiga el código, los datos de la API y el negocio, y termina con las preguntas que la petición deja abiertas.

   ```
   /rpi-research Añade al comparador cuál de los coches sale más barato en España.
   ```

   Al final pregunta si lo guarda en `research.md`.

2. **Plan**: en una conversación nueva, decide cada pregunta abierta, deja escrito el porqué y reparte el trabajo en fases con su verificación.

   ```
   /rpi-plan @research.md
   ```

   Al final pregunta si lo guarda en `plan.md`.

3. **Implement**: en otra conversación nueva, ejecuta el plan fase a fase y para al final de cada una para que la revises.

   ```
   /rpi-implement @plan.md
   ```

Las skills están en `.agents/skills/`, que leen Cursor, Codex y Copilot; `.claude/skills` es un enlace a esa carpeta para Claude Code. En Claude Code, Cursor y Copilot se lanzan con `/rpi-research`; en Codex, con `$rpi-research`.
