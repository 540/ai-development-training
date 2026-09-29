---
name: rpi-plan
description: Fase 2 de RPI. Convierte research.md en un plan técnico por fases (ficheros, piezas, flujo de datos y verificación) y lo guarda en plan.md.
disable-model-invocation: true
argument-hint: @research.md
---

# Plan

La entrada es el research que acompaña a la invocación de la skill, normalmente `research.md`.

Eres quien firma el plano antes de que entre la obra: dices qué ficheros se crean y cuáles se tocan, qué piezas hay en cada uno y en qué orden se construyen, de modo que la fase de implementación, en otra conversación, solo tenga que seguirlo. Aquí no se toca el código; el único fichero que escribes es `plan.md`.

## Pasos

1. **Lee el research entero.** Comprueba en el código que las referencias `fichero:línea` en las que se apoya el plan siguen siendo ciertas. Terminas cuando has confirmado cada una o has apuntado las que han cambiado.

2. **Fija los supuestos.** Para cada pregunta abierta del research elige la opción que mejor encaja con la petición y con lo que el research encontró. Terminas cuando cada pregunta tiene su supuesto en una línea, con su motivo.

3. **Diseña la solución en el código.** Decide:
   - **Ficheros**: cuáles se crean y cuáles se modifican, y por qué cada uno.
   - **Piezas**: cada función o componente nuevo con su firma (qué recibe y qué devuelve) y el fichero donde vive; y cada pieza existente que cambia, con `fichero:línea`.
   - **Flujo de datos**: para cada dato nuevo que se enseña, de qué campo de la API sale, qué transformaciones sufre y dónde se pinta.
   - **Reutilización**: qué funciones, estilos o componentes que ya existen se aprovechan.

   Terminas cuando cada supuesto del paso 2 se ve reflejado en al menos una pieza, y cada pieza tiene fichero y firma.

4. **Ordena las fases.** Cada fase es un corte vertical: al terminarla, la app arranca y enseña algo que antes no enseñaba. Para cada fase, los cambios por fichero y pieza, la verificación automática (los comandos de `package.json`) y la verificación manual (qué mirar en el navegador y con qué coche). Terminas cuando cada pieza del paso 3 está en una fase.

5. **Elige los casos de prueba.** Tres o cuatro coches reales de la API que recorran las ramas distintas de la solución (por ejemplo, un gasolina, un eléctrico y un enchufable), cada uno con el valor que la app debe enseñar, calculado a mano. Terminas cuando cada rama tiene su coche.

6. **Entrega.** Enseña el plan en el chat y pregunta: **"¿Quieres que lo guarde en `plan.md`?"**. Si la respuesta es sí, escríbelo en la raíz del repo con la plantilla de abajo y recuerda el siguiente paso: abrir una conversación nueva y lanzar `/rpi-implement @plan.md`.

## Plantilla de `plan.md`

````markdown
# Plan: <petición en una frase>

## Objetivo
<qué verá la persona usuaria cuando esté hecho>

## Supuestos
- <pregunta> → <opción elegida> — <por qué>

## Fuera de alcance
- <lo que no se hace>

## Diseño

### Ficheros
| fichero | nuevo / modificado | para qué |
|---|---|---|

### Piezas
```ts
// <fichero>
function <nombre>(<parámetros>): <retorno> // <qué hace>
```
- `<fichero>:<línea>` <pieza existente>: <qué cambia>

### Flujo de datos
- <dato en pantalla> ← <transformación> ← `<campo de la API>`

### Reutilización
- `<pieza existente>`: <para qué se usa>

## Fases

### Fase 1: <nombre>
Cambios:
- `<fichero>` · `<pieza>`: <qué se hace>

Verificación automática:
- [ ] <comando>

Verificación manual:
- [ ] <qué mirar, con qué coche y qué debe salir>

## Casos de prueba
| coche (id de la API) | dato | valor esperado | cálculo |
|---|---|---|---|
````
