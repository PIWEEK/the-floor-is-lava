import { Point } from '@taoro/math-point'
import { TransformComponent } from '@taoro/component-transform-2d'
import { ImageComponent } from '@taoro/renderer-2d'
import { LevelSymbol } from './LevelSymbol.js'
import { Cat } from './Cat.js'

const LEVEL_SPEED = -4
const LEVEL_DECELERATION = 0.1

const LEVEL_MAX_LAYERS = 4
const LEVEL_CAT_LAYER = 2

/**
 * La tarea del nivel es la responsable de controlar la velocidad
 * del nivel.
 *
 * @param {Game} game
 * @param {number} levelIndex
 */
export async function * Level(game, levelIndex) {
  const levelId = levelIndex.toString().padStart(2, 0)

  const velocity = new Point(LEVEL_SPEED, 0)
  const gameState = {
    pauseStart: 0,
    isPaused: false
  }

  const transform = new TransformComponent('level', {
    x: 0,
    y: 0,
  })

  // Cargamos el archivo de nivel.
  await game.resources.load(`levels/${levelId}/level.json`)

  // Cargamos las diferentes capas del nivel.
  const { layers, music, background } = game.resources.get(`levels/${levelId}/level.json`)
  game.resources.load(`levels/${levelId}/${music}?taoro:as=audiobuffer`)
  game.resources.load(`levels/${levelId}/${background}`)
  for (const layer of layers) {
    for (const symbol of layer.symbols) {
      game.resources.load(`levels/${levelId}/symbols/${symbol.name}.png`)
    }
  }

  await game.resources.all()

  const backgroundTransform = new TransformComponent('background')

  const backgroundImage = new ImageComponent('background', {
    source: game.resources.get(`levels/${levelId}/${background}`),
  })

  game.music.a.buffer = game.resources.get(
    `levels/${levelId}/${music}?taoro:as=audiobuffer`
  )
  game.music.a.start()

  //
  for (let index = 0; index < LEVEL_MAX_LAYERS; index++) {
    const layer = layers[index]
    for (const instance of layer.instances) {
      const symbol = layer.symbols.find((symbol) => symbol.guid === instance.symbol)
      game.scheduler.add(
        LevelSymbol(game, transform, instance, symbol, levelId, layer.parallax)
      )
    }

    if (index === LEVEL_CAT_LAYER) {
      game.scheduler.add(Cat(game, velocity, transform, gameState))
    }
  }

  while (true) {
    if(game.input.stateOf(0, 'pause') && performance.now() - gameState.pauseStart >= 500) {
      gameState.pauseStart = performance.now()
      gameState.isPaused = !gameState.isPaused
    }
    if (velocity.x < LEVEL_SPEED) {
      velocity.x += LEVEL_DECELERATION
    }
    transform.position.x += velocity.x
    yield
  }

  transform.unregister()

  backgroundTransform.unregister()
  backgroundImage.unregister()

}
