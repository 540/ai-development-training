---
name: rpi-plan
description: Fase 2 de RPI. Convierte research.md en un plan por fases, con cada pregunta abierta decidida y justificada, y lo guarda en plan.md.
disable-model-invocation: true
argument-hint: @research.md
---

# Plan

La entrada es el research que acompaña a la invocación de la skill, normalmente `research.md`.

Eres quien firma el plano antes de que entre la obra: cada decisión queda tomada y escrita, de modo que la fase de implementación, en otra conversación, solo tenga que seguirlo. Aquí no se toca el código; el único fichero que escribes es `plan.md`.

## Pasos

1. **Lee el research entero.** Comprueba en el código que las referencias `fichero:línea` en las que se apoya el plan siguen siendo ciertas. Terminas cuando has confirmado cada una o has apuntado las que han cambiado.

2. **Decide cada pregunta abierta.** Para cada pregunta del research elige la opción que mejor encaja con la petición y con lo que el research encontró, y escribe por qué en una frase. Cada decisión queda como un supuesto a la vista, para que quien lea el plan pueda cambiarla antes de implementar. Terminas cuando cada pregunta del research tiene su supuesto y su motivo.

3. **Diseña las fases.** Cada fase es un corte vertical: al terminarla, la app arranca y enseña algo que antes no enseñaba. Para cada fase escribe qué ficheros cambian y qué cambia en cada uno, la verificación automática (los comandos de `package.json`) y la verificación manual (qué mirar en el navegador, con coches concretos). Terminas cuando cada supuesto del paso 2 está en al menos una fase o en "Fuera de alcance".

4. **Fija los casos de prueba.** Elige coches reales de la API que cubran cada rama de los supuestos (un eléctrico, un enchufable, un diésel…) y escribe, para cada uno, el resultado que la app debe mostrar, calculado a mano a partir de los supuestos. Terminas cuando cada supuesto que afecta a un número o a una etiqueta tiene al menos un caso con su valor esperado.

5. **Entrega.** Enseña el plan en el chat y pregunta: **"¿Quieres que lo guarde en `plan.md`?"**. Si la respuesta es sí, escríbelo en la raíz del repo con la plantilla de abajo y recuerda el siguiente paso: abrir una conversación nueva y lanzar `/rpi-implement @plan.md`.

## Plantilla de `plan.md`

```markdown
# Plan: <petición en una frase>

## Objetivo
<qué verá la persona usuaria cuando esté hecho>

## Supuestos
- <pregunta> → <opción elegida> — <por qué>

## Fuera de alcance
- <lo que se decidió no hacer>

## Fases

### Fase 1: <nombre>
Cambios:
- `<fichero>`: <qué cambia>

Verificación automática:
- [ ] <comando>

Verificación manual:
- [ ] <qué mirar y qué debe salir>

## Casos de prueba
| coche (id de la API) | dato | valor esperado | de dónde sale |
|---|---|---|---|
```
