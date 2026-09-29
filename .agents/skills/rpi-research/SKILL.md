---
name: rpi-research
description: Fase 1 de RPI. Investiga una petición en el código, los datos y el negocio, y la deja documentada en research.md.
disable-model-invocation: true
argument-hint: <petición>
---

# Research

La petición es el texto que acompaña a la invocación de la skill.

Eres un cartógrafo: describes el terreno tal como está para que otra persona decida el camino. El resultado es un mapa de hechos con su fuente y una lista de preguntas abiertas. Las decisiones y el diseño llegan en la fase de plan, en otra conversación; aquí solo lees, y el único fichero que escribes es `research.md`.

## Pasos

1. **Desmonta la petición.** Escríbela en una frase y subraya cada palabra que admite más de una lectura ("barato", "coche", "en España"...). Terminas cuando cada palabra ambigua tiene al menos dos lecturas posibles apuntadas.

2. **Recorre el código.** Localiza todo lo que la petición toca: dónde se piden los datos, cómo se transforman, dónde se pintan, qué convenciones y rarezas tiene el código a su alrededor. Terminas cuando cada afirmación sobre el código cita `fichero:línea` y has leído entera cada función que citas.

3. **Mira los datos reales.** Pide a la API los datos que la petición necesita, con al menos un coche de cada tipo de combustible que aparezca (gasolina, diésel, híbrido, enchufable, eléctrico). Anota qué campos existen, en qué unidades vienen, qué formas raras toman y qué dato hace falta y la API no da. Terminas cuando cada campo que mencionas lo has visto en una respuesta real.

4. **Reúne el contexto de negocio.** Si la petición depende de reglas o cifras de fuera del código (normativa, precios, costumbres del mercado), búscalas en fuentes primarias. Terminas cuando cada regla o cifra lleva su fuente y su fecha.

5. **Lista las preguntas abiertas.** Una por cada decisión que la petición deja sin resolver: para cada una, las opciones que has visto y qué cambia según la que se elija. Terminas cuando cada palabra ambigua del paso 1 y cada dato que falta del paso 3 tiene su pregunta.

6. **Entrega.** Resume en el chat lo que has encontrado y las preguntas abiertas, y pregunta: **"¿Quieres que lo guarde en `research.md`?"**. Si la respuesta es sí, escríbelo en la raíz del repo con la plantilla de abajo y recuerda el siguiente paso: abrir una conversación nueva y lanzar `/rpi-plan @research.md`.

## Plantilla de `research.md`

```markdown
# Research: <petición en una frase>

## Petición
<la petición tal cual y las palabras ambiguas con sus lecturas>

## Resumen
<cinco líneas como máximo: lo que hay y lo que falta>

## Código
<qué hace hoy el código que la petición toca, con `fichero:línea`>

## Datos
<campos de la API que hacen falta, unidades, ejemplos reales y lo que la API no da>

## Negocio
<reglas y cifras externas, cada una con fuente y fecha>

## Preguntas abiertas
1. <pregunta> — opciones: <a>, <b>… — qué cambia: <…>
```
