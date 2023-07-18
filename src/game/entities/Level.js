import { Point } from '@taoro/math-point'
import { TransformComponent } from '@taoro/component-transform-2d'
import { ImageComponent } from '@taoro/renderer-2d'
import { LevelSymbol } from './LevelSymbol.js'
import { Cat } from './Cat.js'

export async function * Level(game, levelIndex) {
  const levelId = levelIndex.toString().padStart(2, 0)

  const velocity = new Point(-4, 0)

  const transform = new TransformComponent('level', {
    x: 0,
    y: 0,
  })

  // Cargamos el archivo de nivel.
  await game.resources.load(`levels/${levelId}/level.json`)

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

  // Recorremos las capas en orden inverso para crear los elementos
  // desde la capa más lejana a la más cercana.
  for (let index = 3; index >= 0; index--) {
    const layer = layers[index]

    // TODO: Meter aquí toda la info de los símbolos que estamos
    // cargando en el nivel.
    for (const instance of layer.instances) {
      const symbol = layer.symbols.find((symbol) => symbol.guid === instance.symbol)
      game.scheduler.add(
        LevelSymbol(game, transform, instance, symbol, levelId)
      )
    }

    if (index === 1) {
      game.scheduler.add(Cat(game, velocity, transform))
    }
  }

  while (true) {
    transform.position.x += velocity.x
    yield
  }

  transform.unregister()

  backgroundTransform.unregister()
  backgroundImage.unregister()

}
