import { Point } from '@taoro/math-point'
import { TransformComponent } from '@taoro/component-transform-2d'
import { ImageComponent } from '@taoro/renderer-2d'
import { LevelBox } from './LevelBox.js'
import { ForegroundLevel } from './ForegroundLevel.js'
import { Cat } from './Cat.js'

export function * Level(game, levelIndex) {
  const transform = new TransformComponent('level', {
    x: 0,
    y: 0,
  })

  const backgroundTransform = new TransformComponent('background')

  const backgroundImage = new ImageComponent('background', {
    source: game.resources.get('images/01/background.png')
  })

  // Generamos el nivel a partir de la lista de rectángulos del archivo.
  // TODO: Molaría que esto pudiera cargar todos los recursos de forma más o menos
  // inteligente.
  const levelData = game.resources.get(`levels/level${levelIndex.toString().padStart(2, 0)}.json`)
  for (const rect of levelData) {
    game.scheduler.add(LevelBox(game, rect, transform))
  }

  game.scheduler.add(Cat(game))

  for (let i = 0; i < 8; i++) {
    const position = new Point(1000 + i * 2000, 1080)
    game.scheduler.add(ForegroundLevel(game, position, transform, '01', i + 1))
  }

  while (true) {
    transform.position.x -= 4
    yield
  }

  transform.unregister()
}
