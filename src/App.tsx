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

// convierte lo de la api a lo nuestro (la api lo manda todo como texto)
function convertir(d: any) {
  return {
    id: '' + d.id,
    year: d.year,
    make: d.make,
    model: d.model,
    baseModel: d.baseModel,
    fuel: d.atvType ? d.atvType : 'Gasoline',
    fuelType: d.fuelType,
    vclass: d.VClass,
    drive: d.drive,
    trany: d.trany,
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
            <img src={carLogo} alt="main-logo" />
            Car Compare
          </a>
          <ul className="menu">
            <li>
              <a href="#/" className={ruta == '' ? 'activo' : ''}>
                Home
              </a>
            </li>
            <li>
              <a href="#/compare" className={ruta == 'compare' ? 'activo' : ''}>
                Compare ({comparar.length})
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
      if (comp == 'greater') {
        okMpg = c.comb > v
      } else if (comp == 'equal') {
        okMpg = c.comb == v
      } else if (comp == 'less') {
        // no se por que pero asi funciona, no tocar
        if (txt && texto.trim().length > 0) {
          okMpg = c.comb > v
        } else {
          okMpg = c.comb < v
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
        <h1>Error loading vehicles</h1>
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
          placeholder="Filter by model or class"
          onChange={(e) => setTexto(e.target.value)}
        />
        <div className="fila">
          <select className="sel" value={fuel} onChange={(e) => setFuel(e.target.value)}>
            <option value="all">All fuels</option>
            {Object.keys(colores).map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
          <span className="etiqueta">MPG</span>
          <select className="sel" value={comp} onChange={(e) => setComp(e.target.value)}>
            <option value="greater">Greater than</option>
            <option value="equal">Equal to</option>
            <option value="less">Less than</option>
          </select>
          <input
            className="input-valor"
            type="text"
            value={valor}
            placeholder="Value"
            onChange={(e) => {
              const n = Number(e.target.value)
              setValor(isNaN(n) ? 0 : n)
            }}
          />
        </div>
      </div>
      {props.comparar.length > 0 && (
        <a href="#/compare" className="barra-comparar">
          {props.comparar.length} of 3 selected · Compare now →
        </a>
      )}
      <div className="lista">
        {lista == null ? (
          [0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => <Esqueleto key={i} />)
        ) : lista.length == 0 ? (
          <h2>No vehicles found</h2>
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
                  <p className="card-trim">{c.trim}</p>
                  <div className="card-chips">
                    <span className="chip" style={{ backgroundColor: colores[c.fuel] }}>
                      <img src={c.fuel == 'EV' ? boltIcon : fuelIcon} alt={'fuel ' + c.fuel} style={{ height: 14 }} />
                      {c.fuel}
                    </span>
                    <span className="chip chip-claro">{c.vclass}</span>
                  </div>
                  <div className="card-mpg" style={{ color: colores[c.fuel] }}>
                    {c.comb}
                    <span>MPG combined</span>
                  </div>
                  <div className="card-datos">
                    <div className="dato">
                      <div className="dato-valor">{c.city}</div>
                      <div className="dato-titulo">City</div>
                    </div>
                    <div className="dato">
                      <div className="dato-valor">{c.highway}</div>
                      <div className="dato-titulo">Highway</div>
                    </div>
                    <div className="dato">
                      <div className="dato-valor">{c.co2}</div>
                      <div className="dato-titulo">CO₂ g/mi</div>
                    </div>
                    <div className="dato">
                      <div className="dato-valor">${c.fuelCost}</div>
                      <div className="dato-titulo">Fuel / year</div>
                    </div>
                  </div>
                </a>
                <button
                  className={elegido ? 'boton boton-activo' : 'boton'}
                  disabled={!elegido && props.comparar.length >= 3}
                  onClick={() => props.cambiarComparar(c.id)}
                >
                  {elegido ? '✓ In comparison' : '+ Compare'}
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
        <h1>Error loading vehicle</h1>
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
    ['Class', c.vclass],
    ['Drive', c.drive],
    ['Transmission', c.trany],
    ['Engine', c.cylinders ? c.cylinders + ' cyl, ' + c.displ + ' L' : '—'],
    ['Fuel', c.fuelType],
    ['City', c.city + ' MPG'],
    ['Highway', c.highway + ' MPG'],
    ['Combined', c.comb + ' MPG'],
    ['CO₂ tailpipe', c.co2 + ' g/mi'],
    ['Annual fuel cost', '$' + c.fuelCost],
    ['Range', c.range ? c.range + ' mi' : '—'],
  ]
  if (c.fuel == 'EV' || c.fuel == 'Plug-in Hybrid') {
    filas.push(['Electric motor', c.evMotor])
    filas.push(['Electricity use', c.combE + ' kWh/100 mi'])
  }
  if (c.fuel == 'Plug-in Hybrid') {
    filas.push(['Combined (electric)', c.combA + ' MPGe'])
    filas.push(['Electric range', c.rangeA + ' mi'])
    filas.push(['Utility factor', c.uf])
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
              <img src={c.fuel == 'EV' ? boltIcon : fuelIcon} alt={'fuel ' + c.fuel} style={{ height: 18 }} />
              {c.fuel}
            </span>
            <span className="chip chip-grande" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
              {c.vclass}
            </span>
          </div>
          <div className="ficha-grande">
            {c.comb}
            <span>MPG combined</span>
          </div>
          <button className="boton boton-blanco" onClick={() => props.cambiarComparar(c.id)}>
            {elegido ? '✓ In comparison' : '+ Add to comparison'}
          </button>
        </div>
        <div className="ficha-contenido">
          <div className="ficha-datos">
            <div className="ficha-dato" style={{ border: borde }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color: color }}>
                <img src={leafIcon} alt="fe-score" style={{ width: 20, height: 20 }} />
                <span style={{ fontSize: 24, fontWeight: 700 }}>{c.feScore}/10</span>
              </div>
              <span style={{ fontSize: 14, color: '#666', fontWeight: 500 }}>Fuel economy score</span>
            </div>
            <div className="ficha-dato" style={{ border: borde }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color: color }}>
                <img src={leafIcon} alt="ghg-score" style={{ width: 20, height: 20 }} />
                <span style={{ fontSize: 24, fontWeight: 700 }}>{c.ghgScore}/10</span>
              </div>
              <span style={{ fontSize: 14, color: '#666', fontWeight: 500 }}>Greenhouse gas score</span>
            </div>
          </div>
          <h2 className="ficha-titulo" style={{ color: color, borderBottomColor: color }}>
            Specs
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
              ? 'You save $' + c.youSaveSpend + ' in fuel costs over 5 years compared to the average new vehicle.'
              : 'You spend $' + -c.youSaveSpend + ' more in fuel costs over 5 years compared to the average new vehicle.'}
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
        <h1>Error loading comparison</h1>
      </div>
    )
  }

  if (props.comparar.length == 0) {
    return (
      <div className="main">
        <h2>Nothing to compare yet</h2>
        <p>
          Pick up to 3 vehicles from the <a href="#/">list</a>.
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

  // [titulo, campo, que es mejor]
  const filas: any = [
    ['Fuel', 'fuel', null],
    ['Class', 'vclass', null],
    ['Drive', 'drive', null],
    ['Transmission', 'trany', null],
    ['City MPG', 'city', 'max'],
    ['Highway MPG', 'highway', 'max'],
    ['Combined MPG', 'comb', 'max'],
    ['CO₂ g/mi', 'co2', 'min'],
    ['Annual fuel cost $', 'fuelCost', 'min'],
    ['Range mi', 'range', 'max'],
    ['kWh/100 mi', 'combE', null],
    ['Fuel economy score', 'feScore', 'max'],
  ]

  return (
    <div className="main main-ancho">
      <h1>Compare</h1>
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
                    Remove
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filas.map((f: any) => {
              const valores = coches.map((c: any) => c[f[1]])
              let mejor: any = null
              if (f[2] == 'max') mejor = Math.max(...valores)
              if (f[2] == 'min') mejor = Math.min(...valores)
              return (
                <tr key={f[0]}>
                  <th>{f[0]}</th>
                  {coches.map((c: any) => (
                    <td key={c.id} className={coches.length > 1 && c[f[1]] == mejor ? 'mejor' : ''}>
                      {c[f[1]] ? c[f[1]] : '—'}
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
