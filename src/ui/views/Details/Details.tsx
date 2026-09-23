import { FC, useState, useEffect, CSSProperties } from 'react'
import { PokemonCardSkeleton } from '../Home/_components/PokemonList/_components/PokemonCardSkeleton'
import { useParams } from '@/ui/hooks/router'
import { Pokemon } from '@/core/Pokemon/domain/Pokemon'
import { pokemonService } from '@/core/Pokemon/services/Pokemon.service'
import { PokemonType as PokemonTypeModel } from '@/core/Pokemon/domain/PokemonType'
import { Main } from '@/ui/components/Main'
import { COLORS } from '@/ui/styles/utils/colors'
import classes from './Details.module.css'

// Assets
import height from '@/ui/assets/height.svg'
import weight from '@/ui/assets/weight.svg'

// Type assets
import bug from '@/ui/assets/types/bug.svg'
import dark from '@/ui/assets/types/dark.svg'
import dragon from '@/ui/assets/types/dragon.svg'
import electric from '@/ui/assets/types/electric.svg'
import fairy from '@/ui/assets/types/fairy.svg'
import fighting from '@/ui/assets/types/fighting.svg'
import fire from '@/ui/assets/types/fire.svg'
import flying from '@/ui/assets/types/flying.svg'
import ghost from '@/ui/assets/types/ghost.svg'
import grass from '@/ui/assets/types/grass.svg'
import ground from '@/ui/assets/types/ground.svg'
import ice from '@/ui/assets/types/ice.svg'
import normal from '@/ui/assets/types/normal.svg'
import poison from '@/ui/assets/types/poison.svg'
import psychic from '@/ui/assets/types/psychic.svg'
import rock from '@/ui/assets/types/rock.svg'
import steel from '@/ui/assets/types/steel.svg'
import water from '@/ui/assets/types/water.svg'

const typeImages: Record<PokemonTypeModel, string> = {
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

export const Details: FC = () => {
  const { id } = useParams()
  const [pokemon, setPokemon] = useState<Pokemon | undefined>(undefined)
  const [isValidating, setIsValidating] = useState(false)
  const [hasError, setHasError] = useState(false)

  // Loads the Pokémon by id
  const loadPokemonById = async (pokemonId: string) => {
    try {
      setHasError(false)
      setIsValidating(true)
      setPokemon(undefined)

      const pokemonData = await pokemonService.findById(pokemonId)

      setPokemon(pokemonData)
    } catch (error) {
      setHasError(true)
    } finally {
      setIsValidating(false)
    }
  }

  // Reloads when the id changes
  useEffect(() => {
    if (id) {
      loadPokemonById(id)
    }
  }, [id])

  if (id === undefined) {
    return (
      <Main>
        <h1>Pokémon does not exist</h1>
      </Main>
    )
  }

  if (hasError) {
    return (
      <Main>
        <h1>Error loading Pokémon</h1>
      </Main>
    )
  }

  const isLoading = pokemon === undefined || isValidating

  if (isLoading) {
    return (
      <Main>
        <PokemonCardSkeleton />
      </Main>
    )
  }

  const [mainType, secondaryType] = pokemon.types
  const normalizedCode = `#${pokemon.id.padStart(3, '0')}`

  const mainTypeColor = COLORS[mainType]
  const secondaryTypeColor = secondaryType ? COLORS[secondaryType] : null

  // Chip for a Pokémon type
  const PokemonTypeComponent: FC<{ type: PokemonTypeModel }> = ({ type }) => {
    const style = {
      '--type-color': COLORS[type],
      backgroundColor: 'var(--type-color)',
    } as CSSProperties

    return (
      <span className={classes.typeChip} style={style}>
        <img
          src={typeImages[type]}
          alt={`type ${type}`}
          className={classes.typeIcon}
        />
        {type}
      </span>
    )
  }

  // Row for a stat
  const StatComponent: FC<{ title: string; value: number }> = ({
    title,
    value,
  }) => {
    const formattedValue = value.toString().padStart(3, '0')

    const statStyle = {
      color: mainTypeColor,
    } as CSSProperties

    const statBarBgStyle = {
      backgroundColor: `color-mix(in srgb, ${mainTypeColor}, var(--color-white) 70%)`,
    } as CSSProperties

    const statBarStyle = {
      width: `${(value / 255) * 100}%`,
      backgroundColor: mainTypeColor,
    } as CSSProperties

    return (
      <div className={classes.stat}>
        <p className={classes.statTitle} style={statStyle}>
          {title}
        </p>
        <p className={classes.statValue}>{formattedValue}</p>
        <div className={classes.statBarContainer} style={statBarBgStyle}>
          <div className={classes.statBar} style={statBarStyle} />
        </div>
      </div>
    )
  }

  const headerStyle = {
    background: secondaryTypeColor
      ? `linear-gradient(135deg, ${mainTypeColor} 0%, ${secondaryTypeColor} 100%)`
      : `linear-gradient(135deg, ${mainTypeColor} 0%, color-mix(in srgb, ${mainTypeColor}, var(--color-black) 20%) 100%)`,
  } as CSSProperties

  const aboutCardStyle = {
    border: `2px solid color-mix(in srgb, ${mainTypeColor}, var(--color-white) 70%)`,
  } as CSSProperties

  const aboutCardValueStyle = {
    color: mainTypeColor,
  } as CSSProperties

  const statsTitleStyle = {
    color: mainTypeColor,
    borderBottomColor: mainTypeColor,
  } as CSSProperties

  const statsContainerStyle = {
    border: `2px solid color-mix(in srgb, ${mainTypeColor}, var(--color-white) 70%)`,
  } as CSSProperties

  return (
    <div className={classes.container}>
      <div className={classes.card}>
        {/* Header Section */}
        <div className={classes.header} style={headerStyle}>
          <div className={classes.headerContent}>
            <div className={classes.headerInfo}>
              <h1>{pokemon.name}</h1>
              <p>{normalizedCode}</p>
            </div>
          </div>

          {/* Types */}
          <div className={classes.typesContainer}>
            {pokemon.types.map((type) => (
              <PokemonTypeComponent key={type} type={type} />
            ))}
          </div>

          {/* Pokémon Image */}
          <div className={classes.imageContainer}>
            <img
              src={pokemon.images.main}
              alt={pokemon.name}
              className={classes.pokemonImage}
            />
          </div>
        </div>

        {/* Content Section */}
        <div className={classes.content}>
          {/* About Section */}
          <div className={classes.aboutSection}>
            <div className={classes.aboutGrid}>
              <div className={classes.aboutCard} style={aboutCardStyle}>
                <div
                  className={classes.aboutCardValue}
                  style={aboutCardValueStyle}
                >
                  <img
                    src={weight}
                    alt="weight-icon"
                    className={classes.aboutCardIcon}
                  />
                  <span className={classes.aboutCardNumber}>
                    {pokemon.weight} kg
                  </span>
                </div>
                <span className={classes.aboutCardLabel}>Weight</span>
              </div>

              <div className={classes.aboutCard} style={aboutCardStyle}>
                <div
                  className={classes.aboutCardValue}
                  style={aboutCardValueStyle}
                >
                  <img
                    src={height}
                    alt="height-icon"
                    className={classes.aboutCardIcon}
                  />
                  <span className={classes.aboutCardNumber}>
                    {pokemon.height} m
                  </span>
                </div>
                <span className={classes.aboutCardLabel}>Height</span>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div>
            <h2 className={classes.statsTitle} style={statsTitleStyle}>
              Base Stats
            </h2>

            <div className={classes.statsContainer} style={statsContainerStyle}>
              <StatComponent title="HP" value={pokemon.stats.hp} />
              <StatComponent title="ATK" value={pokemon.stats.attack} />
              <StatComponent title="DEF" value={pokemon.stats.defense} />
              <StatComponent title="SATK" value={pokemon.stats.specialAttack} />
              <StatComponent
                title="SDEF"
                value={pokemon.stats.specialDefense}
              />
              <StatComponent title="SPD" value={pokemon.stats.speed} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
