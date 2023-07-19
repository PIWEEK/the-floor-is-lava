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
    isPaused: false,
  }

  const transform = new TransformComponent('level', {
    x: 0,
    y: 0,
  })

  // Cargamos el archivo de nivel.
  await game.resources.load(`levels/${levelId}/level.json`)
  // Cargamos los datos del nivel, la música de fondo
  // y la imagen de fondo.
  const { layers, music, background } = game.resources.get(
    `levels/${levelId}/level.json`
  )
  game.resources.load(`levels/${levelId}/${music}?taoro:as=audiobuffer`)
  game.resources.load(`levels/${levelId}/${background}`)
  // Cargamos todos los símbolos del nivel.
  for (const layer of layers) {
    for (const symbol of layer.symbols) {
      game.resources.load(`levels/${levelId}/symbols/${symbol.name}.png`)
    }
  }

  // Esperamos a que todo se cargue.
  await game.resources.all()

  // Añadimos los componentes de la imagen de fondo.
  const backgroundTransform = new TransformComponent('background')
  const backgroundImage = new ImageComponent('background', {
    source: game.resources.get(`levels/${levelId}/${background}`),
  })

  // Aquí creamos todos los elementos del nivel a partir de las capas
  // que hemos creado con el exportador. De momento hay cuatro capas
  // que se identifican por: `siluetas`, `primer plano`, `
  for (let index = 0; index < LEVEL_MAX_LAYERS; index++) {
    const layer = layers[index]
    for (const instance of layer.instances) {
      const symbol = layer.symbols.find(
        (symbol) => symbol.guid === instance.symbol
      )
      game.scheduler.add(
        LevelSymbol(game, transform, instance, symbol, levelId, layer.parallax)
      )
    }
    if (index === LEVEL_CAT_LAYER) {
      game.scheduler.add(Cat(game, velocity, transform, gameState))
    }
  }

  // Arrancamos la música.
  game.music.a.buffer = game.resources.get(
    `levels/${levelId}/${music}?taoro:as=audiobuffer`
  )
  game.music.a.start()

  transform.position.reset()
  velocity.set(LEVEL_SPEED, 0)
  // Bucle principal del juego que se encargará de actualizar la posición
  // del scroll.
  while (true) {
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
