# Contexto del comparador de coches

Lo que hay que saber del dominio para trabajar en este proyecto y que no se deduce leyendo el código.

## La fuente de datos

Los datos vienen de la API de [fueleconomy.gov](https://www.fueleconomy.gov/feg/ws/), de la Agencia de Protección Ambiental de EE. UU. (EPA). No pide clave y cubre los coches vendidos en EE. UU. desde 1984; el catálogo de la app va de 1995 a 2026.

- **No tiene listado.** Para listar los coches de un año y una marca hay que pedir los modelos (`/vehicle/menu/model`), después las versiones de cada modelo (`/vehicle/menu/options`) y después cada versión por su id (`/vehicle/{id}`).
- **Contesta en XML** salvo que se pida `Accept: application/json`.
- **Los menús cambian de forma**: una lista cuando hay varias entradas, un objeto suelto cuando hay una y `null` cuando no hay ninguna.
- **Todo llega como texto**, números incluidos, y `-1` o una cadena vacía significan "sin dato".
- **Es un catálogo de EE. UU.**: hay modelos que no se venden en España, y marcas europeas que no aparecen.

## Combustibles

El campo `atvType` dice la tecnología; si viene vacío, el coche es de gasolina. En el código se nombran con `FuelKind`:

| `atvType` | `FuelKind` | En pantalla |
|---|---|---|
| (vacío) | `gasoline` | Gasolina |
| `Diesel` | `diesel` | Diésel |
| `Hybrid` | `hybrid` | Híbrido |
| `Plug-in Hybrid` | `plugInHybrid` | Híbrido enchufable |
| `EV` | `electric` | Eléctrico |
| `FFV` | `flexFuel` | Flexible (E85) |
| `CNG` | `naturalGas` | Gas natural (GNC) |
| `Bifuel (CNG)` | `bifuelNaturalGas` | Bifuel (GNC) |
| `Bifuel (LPG)` | `bifuelLpg` | Bifuel (GLP) |
| `FCV` | `hydrogen` | Hidrógeno |

## Unidades

La API mide como en EE. UU. y la app enseña unidades europeas. La conversión se hace una sola vez, al construir el `Vehicle`.

- **Consumo**: la API da millas por galón (MPG) en ciudad (`city08`), carretera (`highway08`) y combinado (`comb08`). Se pasa a litros cada 100 km con **235,215 / MPG**: es la inversa, no una regla de tres, y el galón es el de EE. UU. (3,785 L).
- **Combinado**: la EPA lo calcula como media armónica de ciudad (55 %) y carretera (45 %). Se usa `comb08` tal cual; recalcularlo con una media aritmética da otro número.
- **Eléctricos**: en un eléctrico, `city08`, `highway08` y `comb08` son **MPGe**, una equivalencia energética y no un consumo de combustible. Su consumo real está en kWh cada 100 millas (`cityE`, `highwayE`, `combE`), que se divide entre 1,609344 para pasarlo a kWh cada 100 km.
- **Híbridos enchufables**: tienen las dos cosas. `comb08` es el consumo de gasolina cuando la batería está gastada, `combE` el consumo eléctrico, `rangeA` la autonomía eléctrica (en millas) y `combinedUF` el factor de utilidad: la parte de los kilómetros que la EPA estima que se hacen en eléctrico.
- **Distancias**: `range` y `rangeA` vienen en millas; se multiplican por 1,609344.
- **CO₂**: `co2TailpipeGpm` son gramos por milla, solo por el escape; se dividen entre 1,609344. En un enchufable ya tiene en cuenta la parte eléctrica.

## Lo que la API no da

- **Precio de compra.** No hay ningún precio.
- **Impuestos y normativa de España** (matriculación, circulación, etiqueta ambiental de la DGT).
- **Precios de la energía en España** (gasolina, diésel, electricidad) ni kilómetros al año.

Los costes que sí trae están en **dólares y con precios de EE. UU.**: `fuelCost08` es el gasto anual en combustible y `youSaveSpend` lo que se ahorra o se gasta de más en 5 años frente al coche nuevo medio. No valen como coste en España.

Cualquier cambio que necesite uno de estos datos tiene que decidir de dónde sale y dejarlo escrito como supuesto.
