import { useEffect, useState } from 'react'
import pokeball from './assets/pokeball.svg'
import heightIcon from './assets/height.svg'
import weightIcon from './assets/weight.svg'
import bug from './assets/types/bug.svg'
import dark from './assets/types/dark.svg'
import dragon from './assets/types/dragon.svg'
import electric from './assets/types/electric.svg'
import fairy from './assets/types/fairy.svg'
import fighting from './assets/types/fighting.svg'
import fire from './assets/types/fire.svg'
import flying from './assets/types/flying.svg'
import ghost from './assets/types/ghost.svg'
import grass from './assets/types/grass.svg'
import ground from './assets/types/ground.svg'
import ice from './assets/types/ice.svg'
import normal from './assets/types/normal.svg'
import poison from './assets/types/poison.svg'
import psychic from './assets/types/psychic.svg'
import rock from './assets/types/rock.svg'
import steel from './assets/types/steel.svg'
import water from './assets/types/water.svg'

// colores de los tipos (copiados del css, si cambias uno cambia el otro!!)
const colores: any = {
  bug: '#a7b723',
  dark: '#75574c',
  dragon: '#7037ff',
  electric: '#f9cf30',
  fairy: '#e69eac',
  fighting: '#c12239',
  fire: '#f57d31',
  flying: '#a891ec',
  ghost: '#70559b',
  grass: '#74cb48',
  ground: '#dec16b',
  ice: '#9ad6df',
  normal: '#aaa67f',
  poison: '#a43e9e',
  psychic: '#fb5584',
  rock: '#b69e31',
  steel: '#b7b9d0',
  water: '#6493eb',
}

const iconos: any = {
  bug,
  dark,
  dragon,
  electric,
  fairy,
  fighting,
  fire,
  flying,
  ghost,
  grass,
  ground,
  ice,
  normal,
  poison,
  psychic,
  rock,
  steel,
  water,
}

// aqui guardamos lo que viene de la api para no pedirlo dos veces
var cache: any = {}

// TODO: mover esto a otro sitio algun dia
function sacarId() {
  let h = window.location.hash.replace('#/', '').replace('#', '')
  return h
}

export default function App() {
  const [ruta, setRuta] = useState(sacarId())

  useEffect(() => {
    // router casero con el hash, no hace falta meter librerias
    const f = () => {
      setRuta(sacarId())
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', f)
    return () => window.removeEventListener('hashchange', f)
  }, [])

  return (
    <div style={{ minHeight: '100vh' }}>
      <div className="cabecera">
        <div className="cabecera-dentro">
          <a href="#/" className="logo">
            <img src={pokeball} alt="main-logo" />
            Pokédex
          </a>
          <ul className="menu">
            <li>
              <a href="#/" className={ruta == '' ? 'activo' : ''}>
                Home
              </a>
            </li>
          </ul>
        </div>
      </div>
      {ruta == '' ? <Home /> : <Detalle id={ruta} />}
    </div>
  )
}

function Home() {
  const [gen, setGen] = useState('Kanto')
  const [texto, setTexto] = useState('')
  const [stat, setStat] = useState('hp')
  const [comp, setComp] = useState('greater')
  const [valor, setValor] = useState<any>(0)
  const [pokes, setPokes] = useState<any>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    setPokes(null)
    setError(false)
    let offset = 0
    let limit = 151
    // las generaciones a mano, si sale una nueva hay que añadirla aqui
    if (gen == 'Kanto') {
      offset = 0
      limit = 151
    } else if (gen == 'Johto') {
      offset = 151
      limit = 100
    } else if (gen == 'Hoenn') {
      offset = 251
      limit = 135
    } else if (gen == 'Sinnoh') {
      offset = 386
      limit = 107
    } else if (gen == 'Unova') {
      offset = 493
      limit = 156
    } else if (gen == 'Kalos') {
      offset = 649
      limit = 72
    } else if (gen == 'Alola') {
      offset = 721
      limit = 88
    } else if (gen == 'Galar') {
      offset = 809
      limit = 96
    } else if (gen == 'Paldea') {
      offset = 905
      limit = 120
    }
    fetch('https://pokeapi.co/api/v2/pokemon?offset=' + offset + '&limit=' + limit)
      .then((r) => r.json())
      .then((data) => {
        // pedimos uno a uno porque la lista no trae los datos (va lento pero bueno)
        Promise.all(data.results.map((x: any) => fetch(x.url).then((r) => r.json())))
          .then((todos: any) => {
            let arr: any = []
            for (let i = 0; i < todos.length; i++) {
              const d = todos[i]
              let s: any = {}
              d.stats.forEach((st: any) => {
                if (st.stat.name == 'hp') s.hp = st.base_stat
                if (st.stat.name == 'attack') s.attack = st.base_stat
                if (st.stat.name == 'defense') s.defense = st.base_stat
                if (st.stat.name == 'special-attack') s.specialAttack = st.base_stat
                if (st.stat.name == 'special-defense') s.specialDefense = st.base_stat
                if (st.stat.name == 'speed') s.speed = st.base_stat
              })
              arr.push({
                id: '' + d.id,
                name: d.name,
                height: d.height / 10,
                weight: d.weight / 10,
                types: d.types.map((t: any) => t.type.name),
                img: d.sprites.other['official-artwork'].front_default,
                stats: s,
              })
              cache[d.id] = d
            }
            console.log('pokes cargados', arr.length)
            setPokes(arr)
          })
          .catch(() => setError(true))
      })
      .catch((e) => {
        console.log(e)
        setError(true)
      })
  }, [gen])

  // function ordenar(arr: any) {
  //   return arr.sort((a: any, b: any) => (a.name > b.name ? 1 : -1))
  // }

  let lista: any = null
  if (pokes) {
    lista = pokes.filter((p: any) => {
      const s = texto.toLowerCase()
      let ok = true
      let txt = texto.trim().length == 0
      let st = p.stats[stat]
      let v = valor
      let okStat = true
      if (!txt) {
        let found = p.name.toLowerCase().includes(s)
        for (let i = 0; i < p.types.length; i++) {
          if (p.types[i].toLowerCase().includes(s)) found = true
        }
        txt = found
      }
      if (comp == 'greater') {
        okStat = st > v
      } else if (comp == 'equal') {
        okStat = st == v
      } else if (comp == 'less') {
        // no se por que pero asi funciona, no tocar
        if (txt && texto.trim().length > 0) {
          okStat = st > v
        } else {
          okStat = st < v
        }
      }
      if (!txt) ok = false
      if (!okStat) ok = false
      return ok
    })
  }

  if (error) {
    return (
      <div className="main">
        <h1>Error loading Pokémons</h1>
      </div>
    )
  }

  return (
    <div className="main">
      <div className="buscador">
        <select className="sel-gen" value={gen} onChange={(e) => setGen(e.target.value)}>
          {['Kanto', 'Johto', 'Hoenn', 'Sinnoh', 'Unova', 'Kalos', 'Alola', 'Galar', 'Paldea'].map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
        <input
          className="input-buscar"
          value={texto}
          placeholder="Filter by name or type"
          onChange={(e) => setTexto(e.target.value)}
        />
        <div className="filtro-stat">
          <select className="sel" value={stat} onChange={(e) => setStat(e.target.value)}>
            <option value="hp">HP</option>
            <option value="attack">ATK</option>
            <option value="defense">DEF</option>
            <option value="specialAttack">S.ATK</option>
            <option value="specialDefense">S.DEF</option>
            <option value="speed">SPD</option>
          </select>
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
      <div className="lista">
        {lista == null ? (
          [0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => <div key={i} className="card card-cargando"></div>)
        ) : lista.length == 0 ? (
          <h2>No Pokémons found</h2>
        ) : (
          lista.map((p: any) => (
            <a key={p.id} href={'#/' + p.id}>
              <div className="card" style={{ backgroundColor: colores[p.types[0]] }}>
                <div className="card-top">
                  <p className="card-nombre">{p.name}</p>
                  <p className="card-num">#{p.id.padStart(3, '0')}</p>
                </div>
                <div className="card-body">
                  <img className="card-img" src={p.img} alt="pokemon" />
                  <div className="card-tipos">
                    {p.types.map((t: any) => (
                      <span key={t} className="chip" style={{ backgroundColor: colores[t] }}>
                        <img src={iconos[t]} alt={'type ' + t} style={{ height: 16 }} />
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="card-about" style={{ color: colores[p.types[0]] }}>
                    About
                  </div>
                  <div className="card-datos">
                    <div className="dato">
                      <div className="dato-valor">
                        <img src={weightIcon} alt="weight-icon" />
                        {p.weight} kg
                      </div>
                      <div className="dato-titulo">Weight</div>
                    </div>
                    <div className="dato">
                      <div className="dato-valor">
                        <img src={heightIcon} alt="height-icon" />
                        {p.height} m
                      </div>
                      <div className="dato-titulo">Height</div>
                    </div>
                  </div>
                  <ul className="stats" style={{ ['--c' as any]: colores[p.types[0]] }}>
                    {[
                      ['HP', 'hp'],
                      ['ATK', 'attack'],
                      ['DEF', 'defense'],
                      ['SATK', 'specialAttack'],
                      ['SDEF', 'specialDefense'],
                      ['SPD', 'speed'],
                    ].map((x) => (
                      <li key={x[0]} className="stat">
                        <p className="stat-nombre">{x[0]}</p>
                        <p>{('' + p.stats[x[1]]).padStart(3, '0')}</p>
                        <progress className="stat-barra" value={p.stats[x[1]]} max={255} />
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </a>
          ))
        )}
      </div>
    </div>
  )
}

function Detalle(props: any) {
  const [p, setP] = useState<any>(null)
  const [error, setError] = useState(false)

  // convierte lo de la api a lo nuestro (igual que en el Home)
  const convertir = (d: any) => {
    let s: any = {}
    for (let i = 0; i < d.stats.length; i++) {
      switch (d.stats[i].stat.name) {
        case 'hp':
          s.hp = d.stats[i].base_stat
          break
        case 'attack':
          s.attack = d.stats[i].base_stat
          break
        case 'defense':
          s.defense = d.stats[i].base_stat
          break
        case 'special-attack':
          s.specialAttack = d.stats[i].base_stat
          break
        case 'special-defense':
          s.specialDefense = d.stats[i].base_stat
          break
        case 'speed':
          s.speed = d.stats[i].base_stat
          break
      }
    }
    return {
      id: '' + d.id,
      name: d.name,
      height: d.height / 10,
      weight: d.weight / 10,
      types: d.types.map((t: any) => t.type.name),
      img: d.sprites.other['official-artwork'].front_default,
      stats: s,
    }
  }

  useEffect(() => {
    setP(null)
    setError(false)
    // si ya lo teniamos del listado no lo volvemos a pedir
    if (cache[props.id]) {
      setP(convertir(cache[props.id]))
      return
    }
    fetch('https://pokeapi.co/api/v2/pokemon/' + props.id)
      .then((r) => {
        if (!r.ok) throw new Error('fallo ' + r.status)
        return r.json()
      })
      .then((d) => {
        cache[d.id] = d
        setP(convertir(d))
      })
      .catch(() => setError(true))
  }, [props.id])

  if (error) {
    return (
      <div className="main">
        <h1>Error loading Pokémon</h1>
      </div>
    )
  }

  if (!p) {
    return (
      <div className="main">
        <div className="card card-cargando" style={{ margin: '0 auto' }}></div>
      </div>
    )
  }

  const c1 = colores[p.types[0]]
  const c2 = p.types[1] ? colores[p.types[1]] : null
  const borde = '2px solid color-mix(in srgb, ' + c1 + ', #ffffff 70%)'

  return (
    <div style={{ padding: 16, width: '100%' }}>
      <div className="ficha">
        {/* cabecera con el degradado de los dos tipos */}
        <div
          className="ficha-cabecera"
          style={{
            background: c2
              ? `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`
              : `linear-gradient(135deg, ${c1} 0%, color-mix(in srgb, ${c1}, #000000 20%) 100%)`,
          }}
        >
          <h1>{p.name}</h1>
          <p>#{p.id.padStart(3, '0')}</p>
          <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
            {p.types.map((t: any) => (
              <span key={t} className="chip chip-grande" style={{ backgroundColor: colores[t] }}>
                <img src={iconos[t]} alt={'type ' + t} style={{ height: 18 }} />
                {t}
              </span>
            ))}
          </div>
          <div className="ficha-imagen">
            <img src={p.img} alt={p.name} />
          </div>
        </div>
        <div className="ficha-contenido">
          <div className="ficha-datos">
            <div className="ficha-dato" style={{ border: borde }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color: c1 }}>
                <img src={weightIcon} alt="weight-icon" style={{ width: 20, height: 20 }} />
                <span style={{ fontSize: 24, fontWeight: 700 }}>{p.weight} kg</span>
              </div>
              <span style={{ fontSize: 14, color: '#666', fontWeight: 500 }}>Weight</span>
            </div>
            <div className="ficha-dato" style={{ border: borde }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color: c1 }}>
                <img src={heightIcon} alt="height-icon" style={{ width: 20, height: 20 }} />
                <span style={{ fontSize: 24, fontWeight: 700 }}>{p.height} m</span>
              </div>
              <span style={{ fontSize: 14, color: '#666', fontWeight: 500 }}>Height</span>
            </div>
          </div>
          <h2 className="ficha-titulo" style={{ color: c1, borderBottomColor: c1 }}>
            Base Stats
          </h2>
          <div className="ficha-stats" style={{ border: borde }}>
            {/* 255 es el maximo de una stat */}
            {['HP', 'ATK', 'DEF', 'SATK', 'SDEF', 'SPD'].map((n, i) => {
              let v = 0
              if (i == 0) v = p.stats.hp
              if (i == 1) v = p.stats.attack
              if (i == 2) v = p.stats.defense
              if (i == 3) v = p.stats.specialAttack
              if (i == 4) v = p.stats.specialDefense
              if (i == 5) v = p.stats.speed
              return (
                <div key={n} className="ficha-stat">
                  <p style={{ width: 50, fontWeight: 700, textAlign: 'right', color: c1 }}>{n}</p>
                  <p style={{ width: 50 }}>{('' + v).padStart(3, '0')}</p>
                  <div
                    style={{
                      flex: 1,
                      height: 12,
                      borderRadius: 10,
                      overflow: 'hidden',
                      backgroundColor: 'color-mix(in srgb, ' + c1 + ', #ffffff 70%)',
                    }}
                  >
                    <div style={{ height: '100%', borderRadius: 10, width: (v / 255) * 100 + '%', backgroundColor: c1 }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
