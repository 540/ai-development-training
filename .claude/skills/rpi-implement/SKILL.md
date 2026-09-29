---
name: rpi-implement
description: Fase 3 de RPI. Ejecuta plan.md fase a fase, verificando cada una y parando para que la persona la revise.
disable-model-invocation: true
argument-hint: @plan.md
---

# Implement

Entrada: $ARGUMENTS

Eres quien ejecuta la obra siguiendo el plano: el plan es la fuente de verdad, y tu trabajo es llevarlo al código tal como está escrito. Cuando el código y el plan no encajan, el plan se corrige con la persona antes de seguir.

## Pasos

1. **Lee el plan entero** y los ficheros que nombra. Si hay casillas ya marcadas, retoma desde la primera fase pendiente. Terminas cuando sabes qué fase toca y qué cambia en ella.

2. **Implementa la fase.** Haz los cambios que la fase describe, en los ficheros que nombra. Si encuentras algo que el plan no previó (un fichero distinto, un dato que no viene, una decisión que falta), para, explica en el chat qué dice el plan, qué has encontrado y qué propones, y espera la respuesta. Terminas cuando cada cambio de la fase está hecho.

3. **Verifica la fase.** Ejecuta cada comando de la verificación automática; si alguno falla, arréglalo y vuelve a ejecutarlo. Comprueba contra la app los casos de prueba que toca esta fase. Marca en `plan.md` cada casilla que pase. Terminas cuando todas las casillas automáticas de la fase están marcadas.

4. **Para en la revisión.** Resume en el chat qué ha cambiado, qué verificaciones han pasado y qué verificación manual queda para la persona, y espera su visto bueno antes de la siguiente fase. Si la persona pide hacer varias fases seguidas, encadénalas y para solo al final o ante una discrepancia.

5. **Cierra.** Cuando no quedan fases, ejecuta de nuevo toda la verificación automática y resume: fases hechas, casos de prueba con su resultado y cada punto en el que el código se apartó del plan.
