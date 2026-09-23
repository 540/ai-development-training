# Contexto de la Pokédex

Lo que hay que saber del dominio para trabajar en este proyecto y que no se deduce leyendo el código.

## Generaciones

La Pokédex cubre las nueve generaciones, de Kanto a Paldea. Cada generación es un rango de números de la Pokédex nacional, y el listado se pide por generación.

## Tipos

Cada Pokémon tiene uno o dos tipos. Hay 18, y en el código se nombran siempre por su identificador en inglés, que es el que usa PokéAPI:

- `normal`: Normal.
- `fire`: Fuego.
- `water`: Agua.
- `electric`: Eléctrico.
- `grass`: Planta.
- `ice`: Hielo.
- `fighting`: Lucha.
- `poison`: Veneno.
- `ground`: Tierra.
- `flying`: Volador.
- `psychic`: Psíquico.
- `bug`: Bicho.
- `rock`: Roca.
- `ghost`: Fantasma.
- `dragon`: Dragón.
- `dark`: Siniestro.
- `steel`: Acero.
- `fairy`: Hada.

## Efectividad entre tipos

Cuando un ataque de un tipo golpea a un Pokémon de otro tipo, el daño se multiplica:

- **Muy eficaz**: ×2.
- **Poco eficaz**: ×0,5.
- **Sin efecto**: ×0.
- Cualquier combinación que no aparezca en la tabla es neutra: ×1.

Contra un Pokémon de dos tipos, los multiplicadores de cada tipo se multiplican entre sí: un ataque puede llegar a ×4 o quedarse en ×0,25.

Esta es la tabla de efectividad vigente, desde la sexta generación. Cada tipo atacante indica contra qué tipos defensores es muy eficaz, poco eficaz o no tiene efecto.

### Normal (`normal`)

- Muy eficaz contra: ninguno.
- Poco eficaz contra: `rock`, `steel`.
- Sin efecto contra: `ghost`.

### Fuego (`fire`)

- Muy eficaz contra: `grass`, `ice`, `bug`, `steel`.
- Poco eficaz contra: `fire`, `water`, `rock`, `dragon`.
- Sin efecto contra: ninguno.

### Agua (`water`)

- Muy eficaz contra: `fire`, `ground`, `rock`.
- Poco eficaz contra: `water`, `grass`, `dragon`.
- Sin efecto contra: ninguno.

### Eléctrico (`electric`)

- Muy eficaz contra: `water`, `flying`.
- Poco eficaz contra: `electric`, `grass`, `dragon`.
- Sin efecto contra: `ground`.

### Planta (`grass`)

- Muy eficaz contra: `water`, `ground`, `rock`.
- Poco eficaz contra: `fire`, `grass`, `poison`, `flying`, `bug`, `dragon`, `steel`.
- Sin efecto contra: ninguno.

### Hielo (`ice`)

- Muy eficaz contra: `grass`, `ground`, `flying`, `dragon`.
- Poco eficaz contra: `fire`, `water`, `ice`, `steel`.
- Sin efecto contra: ninguno.

### Lucha (`fighting`)

- Muy eficaz contra: `normal`, `ice`, `rock`, `dark`, `steel`.
- Poco eficaz contra: `poison`, `flying`, `psychic`, `bug`, `fairy`.
- Sin efecto contra: `ghost`.

### Veneno (`poison`)

- Muy eficaz contra: `grass`, `fairy`.
- Poco eficaz contra: `poison`, `ground`, `rock`, `ghost`.
- Sin efecto contra: `steel`.

### Tierra (`ground`)

- Muy eficaz contra: `fire`, `electric`, `poison`, `rock`, `steel`.
- Poco eficaz contra: `grass`, `bug`.
- Sin efecto contra: `flying`.

### Volador (`flying`)

- Muy eficaz contra: `grass`, `fighting`, `bug`.
- Poco eficaz contra: `electric`, `rock`, `steel`.
- Sin efecto contra: ninguno.

### Psíquico (`psychic`)

- Muy eficaz contra: `fighting`, `poison`.
- Poco eficaz contra: `psychic`, `steel`.
- Sin efecto contra: `dark`.

### Bicho (`bug`)

- Muy eficaz contra: `grass`, `psychic`, `dark`.
- Poco eficaz contra: `fire`, `fighting`, `poison`, `flying`, `ghost`, `steel`, `fairy`.
- Sin efecto contra: ninguno.

### Roca (`rock`)

- Muy eficaz contra: `fire`, `ice`, `flying`, `bug`.
- Poco eficaz contra: `fighting`, `ground`, `steel`.
- Sin efecto contra: ninguno.

### Fantasma (`ghost`)

- Muy eficaz contra: `psychic`, `ghost`.
- Poco eficaz contra: `dark`.
- Sin efecto contra: `normal`.

### Dragón (`dragon`)

- Muy eficaz contra: `dragon`.
- Poco eficaz contra: `steel`.
- Sin efecto contra: `fairy`.

### Siniestro (`dark`)

- Muy eficaz contra: `psychic`, `ghost`.
- Poco eficaz contra: `fighting`, `dark`, `fairy`.
- Sin efecto contra: ninguno.

### Acero (`steel`)

- Muy eficaz contra: `ice`, `rock`, `fairy`.
- Poco eficaz contra: `fire`, `water`, `electric`, `steel`.
- Sin efecto contra: ninguno.

### Hada (`fairy`)

- Muy eficaz contra: `fighting`, `dragon`, `dark`.
- Poco eficaz contra: `fire`, `poison`, `steel`.
- Sin efecto contra: ninguno.
