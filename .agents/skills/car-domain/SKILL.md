---
name: car-domain
description: Conocimiento del dominio del comparador de coches (la API de la EPA, sus unidades y rarezas, los tipos de combustible y lo que la API no da) y dónde vive cada pieza en src/core. Precárgala antes de planificar, implementar o revisar cualquier cambio que toque consumos, emisiones, costes, combustibles o datos de la API.
user-invocable: false
---

# Dominio del comparador de coches

La fuente de verdad del negocio es `CONTEXT.md`, en la raíz. Esta skill te dice cómo usarla, no la sustituye.

## Reglas

1. **Lee la sección de `CONTEXT.md` que toque antes de escribir código.** Si el cambio usa un dato de la API, comprueba en `CONTEXT.md` en qué unidad viene y qué significa. Nunca lo supongas de memoria: la API es de EE. UU. y muchos campos no son lo que parecen (el "MPG" de un eléctrico es MPGe, la autonomía eléctrica de un enchufable está en `rangeA`, el `-1` significa "sin dato").
2. **El dominio trabaja en unidades europeas.** La conversión desde millas, galones y gramos por milla se hace una vez, en `buildVehicle`, con las funciones de `domain/units.ts`. Si hace falta una conversión nueva, va en `units.ts` con su test.
3. **Lo que la API no da, no se inventa.** Precios de compra, impuestos, precios de la energía o kilómetros al año no están en la API. Si un cambio los necesita, son un supuesto de negocio: el plan tiene que decir de dónde salen, y el código tiene que dejarlos en un único sitio, con nombre, para poder cambiarlos.
4. **Los costes de la API están en dólares y son de EE. UU.** (`annualFuelCostUsd`, `fiveYearSavingsUsd`): no sirven como coste en España sin recalcularlos.

## Dónde vive cada cosa

| Qué | Dónde |
|---|---|
| Modelo (`Vehicle`, `FuelKind`, `Consumption`) y listas del catálogo | `src/core/Vehicle/domain/Vehicle.ts` |
| Conversiones de unidades | `src/core/Vehicle/domain/units.ts` |
| Qué consumo enseñar en grande (litros o kWh) | `src/core/Vehicle/domain/headlineConsumption.ts` |
| Contrato del repositorio | `src/core/Vehicle/domain/VehicleRepository.ts` |
| Acceso a fueleconomy.gov, DTO y mapper | `src/core/Vehicle/infrastructure/` |
| Lo que la UI puede pedir | `src/core/Vehicle/services/Vehicle.service.ts` (`vehicleService`) |
| Cableado repositorio → servicio | `src/core/Vehicle/_di/` y `src/di/` |
| Nombres en castellano de los valores de la API | `src/ui/texts/labels.ts` |

La **lógica de negocio pura** (conversiones, costes, reglas de clasificación) va en `domain/`, sin dependencias de otras capas. Dominio y servicios se miden al 100 % de cobertura y de mutantes muertos, así que cada regla necesita un test que la defienda.
