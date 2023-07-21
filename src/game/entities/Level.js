import { Point } from '@taoro/math-point'
import { TransformComponent } from '@taoro/component-transform-2d'
import { ImageComponent } from '@taoro/renderer-2d'
import { LevelSymbol } from './LevelSymbol.js'
import { Cat } from './Cat.js'
import { LevelEnd } from './LevelEnd.js'

const LEVEL_SPEED = -8
const LEVEL_DECELERATION = 0.2

const LEVEL_MAX_LAYERS = 4
const LEVEL_CAT_LAYER = 2
const LEVEL_END_LAYER = 0

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
    charms: 0,
    charmX: 0,
    pauseStart: 0,
    endStart: 0,
    isEnded: false,
    isPaused: false,
  }

  const transform = new TransformComponent('level', {
    x: 0,
    y: 0,
  })

  game.resources.load('sounds/twinkle.mp3?taoro:as=audiobuffer')
  game.resources.load('sounds/meowch.wav?taoro:as=audiobuffer')
  game.resources.load('sounds/meow.wav?taoro:as=audiobuffer')
  game.resources.load('sounds/meowbrrr.wav?taoro:as=audiobuffer')
  game.resources.load('sounds/hiss.mp3?taoro:as=audiobuffer')
  game.resources.load('images/gato.png?taoro:as=imagebitmap')

  // Cargamos el archivo de nivel.
  await game.resources.load(`levels/${levelId}/level.json`)
  // Cargamos los datos del nivel, la música de fondo
  // y la imagen de fondo.
  const { layers, music, background } = game.resources.get(
    `levels/${levelId}/level.json`
  )
  game.resources.load(`levels/${levelId}/${music}?taoro:as=audiobuffer`)
  game.resources.load(`levels/${levelId}/${background}?taoro:as=imagebitmap`)
  // Cargamos todos los símbolos del nivel.
  for (const layer of layers) {
    for (const symbol of layer.symbols) {
      game.resources.load(`levels/${levelId}/symbols/${symbol.name}.png?taoro:as=imagebitmap`)
    }
  }

  // Esperamos a que todo se cargue.
  console.log(await game.resources.all())

  // Añadimos los componentes de la imagen de fondo.
  const backgroundTransform = new TransformComponent('background')
  const backgroundImage = new ImageComponent('background', {
    source: game.resources.get(
      `levels/${levelId}/${background}?taoro:as=imagebitmap`
    ),
  })

  // Aquí creamos todos los elementos del nivel a partir de las capas
  // que hemos creado con el exportador. De momento hay cuatro capas
  // que se identifican por: `siluetas`, `primer plano`
  let cat = null
  for (let index = 0; index < LEVEL_MAX_LAYERS; index++) {
    const layer = layers[index]
    if (index === LEVEL_END_LAYER) {
      game.scheduler.add(LevelEnd(game, gameState, transform, velocity, layer.size.width))
    }

    for (const instance of layer.instances) {
      const symbol = layer.symbols.find(
        (symbol) => symbol.guid === instance.symbol
      )
      game.scheduler.add(
        LevelSymbol(game, gameState, transform, instance, symbol, levelId, layer.parallax)
      )
    }
    if (index === LEVEL_CAT_LAYER) {
      cat = Cat(game, gameState, velocity, transform)
    }
  }

  // FIXME: Esto arregla una condición de carrera que todavía no tengo
  // ni idea de por qué sucede.
  let frameCount = 0
  while (frameCount < 90) {
    frameCount++
    yield
  }

  // Arrancamos la música.
  game.music.a.buffer = game.resources.get(
    `levels/${levelId}/${music}?taoro:as=audiobuffer`
  )
  game.music.a.start()

  game.scheduler.add(cat)
  transform.position.reset()
  velocity.set(LEVEL_SPEED, 0)
  // Bucle principal del juego que se encargará de actualizar la posición
  // del scroll.
  while (true) {
    if (transform.position.x < layers[LEVEL_END_LAYER].size.width) {
      if (velocity.x < LEVEL_SPEED) {
        velocity.x += LEVEL_DECELERATION
      }
      transform.position.x += velocity.x
    }
    yield
  }

  transform.unregister()

  backgroundTransform.unregister()
  backgroundImage.unregister()
}
