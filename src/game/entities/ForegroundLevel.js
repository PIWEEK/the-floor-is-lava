import { Point } from '@taoro/math-point'
import { TransformComponent } from '@taoro/component-transform-2d'
import { ImageComponent } from '@taoro/renderer-2d'
import { getRandomId } from '~/game/utils/id'

export function * ForegroundLevel(game, position, parentTransform, level, index) {
  const id = getRandomId('foreground-level')

  const transform = new TransformComponent(id, {
    x: position.x,
    y: position.y,
  })

  const source = game.resources.get(`images/${level}/foreground/${index}.png`)
  const image = new ImageComponent(id, {
    source,
    pivot: new Point(-source.width / 2, -source.height + 20)
  })

  while (true) {
    transform.position.x = parentTransform.position.x * 1.2 + position.x
    yield // detente aquí hasta la siguiente actualización
  }

  transform.unregister()
  image.unregister()
}
