import { useEffect, useState } from 'react'
import carLogo from './assets/car.svg'
import fuelIcon from './assets/fuel.svg'
import boltIcon from './assets/bolt.svg'
import leafIcon from './assets/leaf.svg'

const API = 'https://www.fueleconomy.gov/ws/rest'

// colores de cada combustible (copiados del css, si cambias uno cambia el otro!!)
const colores: any = {
  Gasoline: '#64748b',
  Diesel: '#78350f',
  Hybrid: '#0d9488',
  'Plug-in Hybrid': '#7c3aed',
  EV: '#2563eb',
  FFV: '#ca8a04',
  CNG: '#0891b2',
  'Bifuel (CNG)': '#0891b2',
  'Bifuel (LPG)': '#0e7490',
  FCV: '#db2777',
}

// los nombres en castellano, la api los manda en ingles
const nombresCombustible: any = {
  Gasoline: 'Gasolina',
  Diesel: 'Diésel',
  Hybrid: 'Híbrido',
  'Plug-in Hybrid': 'Híbrido enchufable',
  EV: 'Eléctrico',
  FFV: 'Flexible (E85)',
  CNG: 'Gas natural (GNC)',
  'Bifuel (CNG)': 'Bifuel (GNC)',
  'Bifuel (LPG)': 'Bifuel (GLP)',
  FCV: 'Hidrógeno',
}

// ojo que el orden importa: Minicompact y Subcompact antes que Compact
const clases: any = [
  ['Two Seaters', 'Biplaza'],
  ['Minicompact Cars', 'Microcompacto'],
  ['Subcompact Cars', 'Utilitario'],
  ['Compact Cars', 'Compacto'],
  ['Midsize Cars', 'Berlina mediana'],
  ['Large Cars', 'Berlina grande'],
  ['Small Station Wagons', 'Familiar pequeño'],
  ['Midsize Station Wagons', 'Familiar mediano'],
  ['Small Sport Utility Vehicle', 'SUV pequeño'],
  ['Standard Sport Utility Vehicle', 'SUV grande'],
  ['Small Pickup Trucks', 'Pick-up pequeño'],
  ['Standard Pickup Trucks', 'Pick-up grande'],
  ['Minivan', 'Monovolumen'],
  ['Vans, Passenger Type', 'Furgoneta de pasajeros'],
  ['Vans, Cargo Type', 'Furgoneta de carga'],
  ['Special Purpose Vehicle', 'Vehículo especial'],
]

const tracciones: any = {
  'Front-Wheel Drive': 'Delantera',
  'Rear-Wheel Drive': 'Trasera',
  'All-Wheel Drive': 'Total (AWD)',
  '4-Wheel Drive': '4x4',
  'Part-time 4-Wheel Drive': '4x4 conectable',
  '4-Wheel or All-Wheel Drive': '4x4 o total',
  '2-Wheel Drive': '4x2',
}

const tiposCombustible: any = {
  Regular: 'Gasolina normal',
  Midgrade: 'Gasolina intermedia',
  Premium: 'Gasolina premium',
  Diesel: 'Diésel',
  Electricity: 'Electricidad',
  'Regular Gas and Electricity': 'Gasolina normal y electricidad',
  'Premium and Electricity': 'Gasolina premium y electricidad',
  'Regular Gas or Electricity': 'Gasolina normal o electricidad',
  'Premium Gas or Electricity': 'Gasolina premium o electricidad',
  'Gasoline or E85': 'Gasolina o E85',
  'Premium or E85': 'Gasolina premium o E85',
  CNG: 'Gas natural (GNC)',
  Hydrogen: 'Hidrógeno',
}

// si no esta en la lista se queda en ingles
function traducirClase(v: any) {
  if (!v) return ''
  let r = v
  for (let i = 0; i < clases.length; i++) {
    if (v.startsWith(clases[i][0])) {
      r = clases[i][1] + v.slice(clases[i][0].length)
      break
    }
  }
  return r.replace(' - ', ' ').replace('2WD', '4x2').replace('4WD', '4x4')
}

function traducirCambio(v: any) {
  if (!v) return ''
  return v.replace('Automatic', 'Automático').replace('variable gear ratios', 'relación variable').replace('-spd', ' vel.')
}

// lo de las versiones viene tipo "Auto (S5), 6 cyl, 4.0 L, Turbo"
function traducirVersion(v: any) {
  return v
    .replace('Auto (', 'Aut. (')
    .replace('Man ', 'Man. ')
    .replace(' cyl', ' cil.')
    .replace('Part-time AWD', 'AWD conectable')
    .replace(/(\d)\.(\d) L/, '$1,$2 L')
}

// numeros a la española (coma para los decimales)
function num(x: any) {
  return Number(x).toLocaleString('es-ES')
}

// los consumos siempre con un decimal (9,0 y no 9)
function dec(x: any) {
  if (x == null) return '—'
  return Number(x).toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
}

// las marcas que salen en el desplegable, si falta alguna hay que añadirla aqui
const marcas = [
  'Toyota',
  'Honda',
  'Ford',
  'Chevrolet',
  'Tesla',
  'Hyundai',
  'Kia',
  'Volkswagen',
  'BMW',
  'Mercedes-Benz',
  'Audi',
  'Volvo',
  'Mazda',
  'Subaru',
  'Nissan',
  'Porsche',
]

// aqui guardamos lo que viene de la api para no pedirlo dos veces
var cache: any = {}

// TODO: mover esto a otro sitio algun dia
function sacarRuta() {
  let h = window.location.hash.replace('#/', '').replace('#', '')
  return h
}

// la api a veces devuelve una lista, a veces un objeto suelto y a veces null (??)
function aLista(x: any) {
  if (!x || !x.menuItem) return []
  if (Array.isArray(x.menuItem)) return x.menuItem
  return [x.menuItem]
}

function pedir(url: string) {
  return fetch(API + url, { headers: { Accept: 'application/json' } }).then((r) => {
    if (!r.ok) throw new Error('fallo ' + r.status)
    return r.json()
  })
}

// la api va en unidades americanas (millas y galones), aqui lo pasamos a lo de aqui
const KM_POR_MILLA = 1.609344
// 100 km en millas / litros por galon (galon americano, 3,785 L)
const MPG_A_L100 = 235.215

// MPG a L/100 km, es la inversa asi que no vale una regla de tres
function litros(mpg: any) {
  if (!mpg) return null
  return Math.round((MPG_A_L100 / mpg) * 10) / 10
}

// kWh/100 millas a kWh/100 km
function kwh(x: any) {
  if (!x) return null
  return Math.round((x / KM_POR_MILLA) * 10) / 10
}

function km(millas: any) {
  if (!millas) return null
  return Math.round(millas * KM_POR_MILLA)
}

// convierte lo de la api a lo nuestro (la api lo manda todo como texto)
function convertir(d: any) {
  const electrico = d.atvType == 'EV'
  return {
    // lo que se enseña en grande: litros, o kWh si es electrico (el MPGe no lo entiende nadie)
    unidad: electrico ? 'kWh/100 km' : 'L/100 km',
    consumo: electrico ? kwh(Number(d.combE)) : litros(Number(d.comb08)),
    consumoCiudad: electrico ? kwh(Number(d.cityE)) : litros(Number(d.city08)),
    consumoCarretera: electrico ? kwh(Number(d.highwayE)) : litros(Number(d.highway08)),
    litrosCiudad: electrico ? null : litros(Number(d.city08)),
    litrosCarretera: electrico ? null : litros(Number(d.highway08)),
    litros: electrico ? null : litros(Number(d.comb08)),
    kwh: kwh(Number(d.combE)),
    co2Km: Math.round(Number(d.co2TailpipeGpm) / KM_POR_MILLA),
    autonomia: km(Number(d.range)),
    autonomiaElectrica: km(Number(d.rangeA)),
    id: '' + d.id,
    year: d.year,
    make: d.make,
    model: d.model,
    baseModel: d.baseModel,
    fuel: d.atvType ? d.atvType : 'Gasoline',
    combustible: nombresCombustible[d.atvType ? d.atvType : 'Gasoline'] || d.atvType,
    fuelType: tiposCombustible[d.fuelType] || d.fuelType,
    vclass: traducirClase(d.VClass),
    drive: tracciones[d.drive] || d.drive,
    trany: traducirCambio(d.trany),
    cylinders: d.cylinders,
    displ: d.displ,
    evMotor: d.evMotor,
    city: Number(d.city08),
    highway: Number(d.highway08),
    comb: Number(d.comb08),
    cityA: Number(d.cityA08),
    highwayA: Number(d.highwayA08),
    combA: Number(d.combA08),
    combE: Number(d.combE),
    co2: Number(d.co2TailpipeGpm),
    fuelCost: Number(d.fuelCost08),
    range: Number(d.range),
    rangeA: d.rangeA,
    uf: Number(d.combinedUF),
    feScore: Number(d.feScore),
    ghgScore: Number(d.ghgScore),
    youSaveSpend: Number(d.youSaveSpend),
  }
}

function leerComparar() {
  try {
    return JSON.parse(localStorage.getItem('comparar') || '[]')
  } catch (e) {
    return []
  }
}

export default function App() {
  const [ruta, setRuta] = useState(sacarRuta())
  const [comparar, setComparar] = useState<any>(leerComparar())

  useEffect(() => {
    // router casero con el hash, no hace falta meter librerias
    const f = () => {
      setRuta(sacarRuta())
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', f)
    return () => window.removeEventListener('hashchange', f)
  }, [])

  const cambiarComparar = (id: string) => {
    let nuevo: any = []
    if (comparar.includes(id)) {
      nuevo = comparar.filter((x: any) => x != id)
    } else {
      // maximo 3 que si no la tabla no cabe
      if (comparar.length >= 3) return
      nuevo = [...comparar, id]
    }
    setComparar(nuevo)
    localStorage.setItem('comparar', JSON.stringify(nuevo))
  }

  let pagina: any = null
  if (ruta == '') {
    pagina = <Home comparar={comparar} cambiarComparar={cambiarComparar} />
  } else if (ruta == 'compare') {
    pagina = <Comparar comparar={comparar} cambiarComparar={cambiarComparar} />
  } else {
    pagina = <Detalle id={ruta.replace('vehicle/', '')} comparar={comparar} cambiarComparar={cambiarComparar} />
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <div className="cabecera">
        <div className="cabecera-dentro">
          <a href="#/" className="logo">
            <img src={carLogo} alt="logo" />
            Comparador de coches
          </a>
          <ul className="menu">
            <li>
              <a href="#/" className={ruta == '' ? 'activo' : ''}>
                Inicio
              </a>
            </li>
            <li>
              <a href="#/compare" className={ruta == 'compare' ? 'activo' : ''}>
                Comparar ({comparar.length})
              </a>
            </li>
          </ul>
        </div>
      </div>
      {pagina}
    </div>
  )
}

function Home(props: any) {
  const [year, setYear] = useState('2024')
  const [marca, setMarca] = useState('Toyota')
  const [texto, setTexto] = useState('')
  const [fuel, setFuel] = useState('all')
  const [comp, setComp] = useState('greater')
  const [valor, setValor] = useState<any>(0)
  const [coches, setCoches] = useState<any>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    setCoches(null)
    setError(false)
    // primero los modelos, luego las versiones de cada modelo y luego cada version una a una
    // (son muchas peticiones pero la api no tiene otra forma)
    pedir('/vehicle/menu/model?year=' + year + '&make=' + encodeURIComponent(marca))
      .then((data) => {
        const modelos = aLista(data)
        Promise.all(
          modelos.map((m: any) =>
            pedir(
              '/vehicle/menu/options?year=' +
                year +
                '&make=' +
                encodeURIComponent(marca) +
                '&model=' +
                encodeURIComponent(m.value),
            ).then((o) => aLista(o).map((x: any) => ({ id: x.value, trim: x.text }))),
          ),
        )
          .then((versiones: any) => {
            let todas: any = []
            versiones.forEach((v: any) => (todas = todas.concat(v)))
            return Promise.all(
              todas.map((v: any) =>
                pedir('/vehicle/' + v.id).then((d) => {
                  cache[d.id] = d
                  return { ...convertir(d), trim: v.trim }
                }),
              ),
            )
          })
          .then((arr: any) => {
            console.log('coches cargados', arr.length)
            setCoches(arr)
          })
          .catch(() => setError(true))
      })
      .catch((e) => {
        console.log(e)
        setError(true)
      })
  }, [year, marca])

  let lista: any = null
  if (coches) {
    lista = coches.filter((c: any) => {
      const s = texto.toLowerCase()
      let ok = true
      let txt = texto.trim().length == 0
      let v = valor
      let okMpg = true
      if (!txt) {
        txt = c.model.toLowerCase().includes(s) || c.vclass.toLowerCase().includes(s)
      }
      if (fuel != 'all' && c.fuel != fuel) ok = false
      // los electricos cuentan como 0 litros
      let l = c.litros || 0
      if (comp == 'greater') {
        okMpg = l > v
      } else if (comp == 'equal') {
        okMpg = l == v
      } else if (comp == 'less') {
        // no se por que pero asi funciona, no tocar
        if (txt && texto.trim().length > 0) {
          okMpg = l > v
        } else {
          okMpg = l < v
        }
      }
      if (!txt) ok = false
      if (!okMpg) ok = false
      return ok
    })
  }

  if (error) {
    return (
      <div className="main">
        <h1>Error al cargar los coches</h1>
      </div>
    )
  }

  const years: any = []
  for (let y = 2026; y >= 2015; y--) years.push('' + y)

  return (
    <div className="main">
      <div className="buscador">
        <div className="fila">
          <select className="sel" value={year} onChange={(e) => setYear(e.target.value)}>
            {years.map((y: any) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <select className="sel sel-marca" value={marca} onChange={(e) => setMarca(e.target.value)}>
            {marcas.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <input
          className="input-buscar"
          value={texto}
          placeholder="Filtrar por modelo o carrocería"
          onChange={(e) => setTexto(e.target.value)}
        />
        <div className="fila">
          <select className="sel" value={fuel} onChange={(e) => setFuel(e.target.value)}>
            <option value="all">Todos los combustibles</option>
            {Object.keys(colores).map((f) => (
              <option key={f} value={f}>
                {nombresCombustible[f]}
              </option>
            ))}
          </select>
          <span className="etiqueta">L/100 km</span>
          <select className="sel" value={comp} onChange={(e) => setComp(e.target.value)}>
            <option value="greater">Mayor que</option>
            <option value="equal">Igual a</option>
            <option value="less">Menor que</option>
          </select>
          <input
            className="input-valor"
            type="text"
            value={valor}
            placeholder="Valor"
            onChange={(e) => {
              const n = Number(e.target.value.replace(',', '.'))
              setValor(isNaN(n) ? 0 : n)
            }}
          />
        </div>
      </div>
      {props.comparar.length > 0 && (
        <a href="#/compare" className="barra-comparar">
          {props.comparar.length} de 3 elegidos · Comparar ahora →
        </a>
      )}
      <div className="lista">
        {lista == null ? (
          [0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => <Esqueleto key={i} />)
        ) : lista.length == 0 ? (
          <h2>No hay coches</h2>
        ) : (
          lista.map((c: any) => {
            const elegido = props.comparar.includes(c.id)
            return (
              <div key={c.id} className="card" style={{ borderTopColor: colores[c.fuel] }}>
                <a href={'#/vehicle/' + c.id}>
                  <div className="card-top">
                    <p className="card-nombre">
                      {c.make} {c.model}
                    </p>
                    <p className="card-num">{c.year}</p>
                  </div>
                  <p className="card-trim">{traducirVersion(c.trim)}</p>
                  <div className="card-chips">
                    <span className="chip" style={{ backgroundColor: colores[c.fuel] }}>
                      <img src={c.fuel == 'EV' ? boltIcon : fuelIcon} alt={'combustible ' + c.combustible} style={{ height: 14 }} />
                      {c.combustible}
                    </span>
                    <span className="chip chip-claro">{c.vclass}</span>
                  </div>
                  <div className="card-mpg" style={{ color: colores[c.fuel] }}>
                    {dec(c.consumo)}
                    <span>{c.unidad}</span>
                  </div>
                  <div className="card-datos">
                    <div className="dato">
                      <div className="dato-valor">{dec(c.consumoCiudad)}</div>
                      <div className="dato-titulo">Ciudad</div>
                    </div>
                    <div className="dato">
                      <div className="dato-valor">{dec(c.consumoCarretera)}</div>
                      <div className="dato-titulo">Carretera</div>
                    </div>
                    <div className="dato">
                      <div className="dato-valor">{c.co2Km}</div>
                      <div className="dato-titulo">CO₂ g/km</div>
                    </div>
                    <div className="dato">
                      <div className="dato-valor">{num(c.fuelCost)} $</div>
                      <div className="dato-titulo">Combustible / año</div>
                    </div>
                  </div>
                </a>
                <button
                  className={elegido ? 'boton boton-activo' : 'boton'}
                  disabled={!elegido && props.comparar.length >= 3}
                  onClick={() => props.cambiarComparar(c.id)}
                >
                  {elegido ? '✓ En la comparación' : '+ Comparar'}
                </button>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

// la tarjeta de mentira mientras llega la api (mismas medidas que la de verdad)
function Esqueleto(props: any) {
  return (
    <div className="card card-cargando" style={props.centrado ? { margin: '0 auto' } : {}}>
      <div>
        <div className="card-top">
          <div className="hueso" style={{ width: '65%', height: 20 }} />
          <div className="hueso" style={{ width: 32, height: 12 }} />
        </div>
        <div className="hueso" style={{ width: '50%', height: 12, marginTop: 8 }} />
        <div className="card-chips">
          <div className="hueso" style={{ width: 70, height: 20, borderRadius: 100 }} />
          <div className="hueso" style={{ width: 150, height: 20, borderRadius: 100 }} />
        </div>
        <div className="hueso" style={{ width: '45%', height: 40, margin: '20px 0 16px' }} />
        <div className="card-datos">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="dato">
              <div className="hueso" style={{ width: 32, height: 14, margin: '0 auto 6px' }} />
              <div className="hueso" style={{ width: 40, height: 10, margin: '0 auto' }} />
            </div>
          ))}
        </div>
      </div>
      <div className="hueso" style={{ height: 34, borderRadius: 6 }} />
    </div>
  )
}

function Detalle(props: any) {
  const [c, setC] = useState<any>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    setC(null)
    setError(false)
    // si ya lo teniamos del listado no lo volvemos a pedir
    if (cache[props.id]) {
      setC(convertir(cache[props.id]))
      return
    }
    pedir('/vehicle/' + props.id)
      .then((d) => {
        cache[d.id] = d
        setC(convertir(d))
      })
      .catch(() => setError(true))
  }, [props.id])

  if (error) {
    return (
      <div className="main">
        <h1>Error al cargar el coche</h1>
      </div>
    )
  }

  if (!c) {
    return (
      <div className="main">
        <Esqueleto centrado />
      </div>
    )
  }

  const color = colores[c.fuel]
  const elegido = props.comparar.includes(c.id)
  const borde = '2px solid color-mix(in srgb, ' + color + ', #ffffff 70%)'

  // las filas de la ficha, las de electrico solo si tiene enchufe
  let filas: any = [
    ['Carrocería', c.vclass],
    ['Tracción', c.drive],
    ['Cambio', c.trany],
    ['Motor', c.cylinders ? c.cylinders + ' cil., ' + ('' + c.displ).replace('.', ',') + ' L' : '—'],
    ['Combustible', c.fuelType],
    ['Consumo en ciudad', dec(c.consumoCiudad) + ' ' + c.unidad],
    ['Consumo en carretera', dec(c.consumoCarretera) + ' ' + c.unidad],
    ['Consumo combinado', dec(c.consumo) + ' ' + c.unidad],
    ['CO₂ por el escape', num(c.co2Km) + ' g/km'],
    ['Gasto anual en combustible', num(c.fuelCost) + ' $'],
    ['Autonomía', c.autonomia ? num(c.autonomia) + ' km' : '—'],
  ]
  if (c.fuel == 'EV' || c.fuel == 'Plug-in Hybrid') {
    filas.push(['Motor eléctrico', c.evMotor])
  }
  if (c.fuel == 'Plug-in Hybrid') {
    filas.push(['Consumo eléctrico', dec(c.kwh) + ' kWh/100 km'])
    filas.push(['Autonomía eléctrica', num(c.autonomiaElectrica) + ' km'])
    filas.push(['Factor de utilidad', num(c.uf)])
  }

  return (
    <div style={{ padding: 16, width: '100%' }}>
      <div className="ficha">
        {/* cabecera con el color del combustible */}
        <div
          className="ficha-cabecera"
          style={{
            background: `linear-gradient(135deg, ${color} 0%, color-mix(in srgb, ${color}, #000000 35%) 100%)`,
          }}
        >
          <p>
            {c.year} · {c.make}
          </p>
          <h1>{c.model}</h1>
          <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
            <span className="chip chip-grande" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
              <img src={c.fuel == 'EV' ? boltIcon : fuelIcon} alt={'combustible ' + c.combustible} style={{ height: 18 }} />
              {c.combustible}
            </span>
            <span className="chip chip-grande" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
              {c.vclass}
            </span>
          </div>
          <div className="ficha-grande">
            {dec(c.consumo)}
            <span>{c.unidad} combinado</span>
          </div>
          <button className="boton boton-blanco" onClick={() => props.cambiarComparar(c.id)}>
            {elegido ? '✓ En la comparación' : '+ Añadir a la comparación'}
          </button>
        </div>
        <div className="ficha-contenido">
          <div className="ficha-datos">
            <div className="ficha-dato" style={{ border: borde }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color: color }}>
                <img src={leafIcon} alt="consumo" style={{ width: 20, height: 20 }} />
                <span style={{ fontSize: 24, fontWeight: 700 }}>{c.feScore}/10</span>
              </div>
              <span style={{ fontSize: 14, color: '#666', fontWeight: 500 }}>Puntuación de consumo</span>
            </div>
            <div className="ficha-dato" style={{ border: borde }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color: color }}>
                <img src={leafIcon} alt="emisiones" style={{ width: 20, height: 20 }} />
                <span style={{ fontSize: 24, fontWeight: 700 }}>{c.ghgScore}/10</span>
              </div>
              <span style={{ fontSize: 14, color: '#666', fontWeight: 500 }}>Puntuación de gases de efecto invernadero</span>
            </div>
          </div>
          <h2 className="ficha-titulo" style={{ color: color, borderBottomColor: color }}>
            Datos técnicos
          </h2>
          <table className="ficha-tabla" style={{ border: borde }}>
            <tbody>
              {filas.map((f: any) => (
                <tr key={f[0]}>
                  <th style={{ color: color }}>{f[0]}</th>
                  <td>{f[1]}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* 5 años contra el coche medio, lo calcula la EPA */}
          <p className="ficha-nota">
            {c.youSaveSpend >= 0
              ? 'Ahorras ' + num(c.youSaveSpend) + ' $ en combustible en 5 años frente al coche nuevo medio.'
              : 'Gastas ' + num(-c.youSaveSpend) + ' $ más en combustible en 5 años que el coche nuevo medio.'}
          </p>
        </div>
      </div>
    </div>
  )
}

function Comparar(props: any) {
  const [coches, setCoches] = useState<any>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    setError(false)
    Promise.all(
      props.comparar.map((id: any) =>
        cache[id]
          ? Promise.resolve(convertir(cache[id]))
          : pedir('/vehicle/' + id).then((d) => {
              cache[d.id] = d
              return convertir(d)
            }),
      ),
    )
      .then((arr) => setCoches(arr))
      .catch(() => setError(true))
  }, [props.comparar])

  if (error) {
    return (
      <div className="main">
        <h1>Error al cargar la comparación</h1>
      </div>
    )
  }

  if (props.comparar.length == 0) {
    return (
      <div className="main">
        <h2>Aún no hay nada que comparar</h2>
        <p>
          Elige hasta 3 coches del <a href="#/">listado</a>.
        </p>
      </div>
    )
  }

  if (!coches) {
    return (
      <div className="main">
        <Esqueleto centrado />
      </div>
    )
  }

  // [titulo, campo, que es mejor, con un decimal]
  const filas: any = [
    ['Combustible', 'combustible', null],
    ['Carrocería', 'vclass', null],
    ['Tracción', 'drive', null],
    ['Cambio', 'trany', null],
    ['Consumo ciudad (L/100 km)', 'litrosCiudad', 'min', true],
    ['Consumo carretera (L/100 km)', 'litrosCarretera', 'min', true],
    ['Consumo combinado (L/100 km)', 'litros', 'min', true],
    ['Consumo eléctrico (kWh/100 km)', 'kwh', 'min', true],
    ['CO₂ (g/km)', 'co2Km', 'min'],
    ['Gasto anual en combustible ($)', 'fuelCost', 'min'],
    ['Autonomía (km)', 'autonomia', 'max'],
    ['Puntuación de consumo', 'feScore', 'max'],
  ]

  return (
    <div className="main main-ancho">
      <h1>Comparar</h1>
      <div className="tabla-scroll">
        <table className="comparar">
          <thead>
            <tr>
              <th></th>
              {coches.map((c: any) => (
                <th key={c.id} style={{ borderTopColor: colores[c.fuel] }}>
                  <a href={'#/vehicle/' + c.id}>
                    <span className="comparar-year">{c.year}</span>
                    {c.make} {c.model}
                  </a>
                  <button className="quitar" onClick={() => props.cambiarComparar(c.id)}>
                    Quitar
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filas.map((f: any) => {
              // los que no tienen el dato (null) no cuentan para el mejor
              const valores = coches.map((c: any) => c[f[1]]).filter((v: any) => v != null)
              let mejor: any = null
              if (f[2] == 'max') mejor = Math.max(...valores)
              if (f[2] == 'min') mejor = Math.min(...valores)
              return (
                <tr key={f[0]}>
                  <th>{f[0]}</th>
                  {coches.map((c: any) => (
                    <td key={c.id} className={coches.length > 1 && c[f[1]] == mejor ? 'mejor' : ''}>
                      {c[f[1]] ? (f[3] ? dec(c[f[1]]) : typeof c[f[1]] == 'number' ? num(c[f[1]]) : c[f[1]]) : '—'}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
