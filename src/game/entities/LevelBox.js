import { TransformComponent } from '@taoro/component-transform-2d'
import { ColliderComponent } from '@taoro/collider-nano-2d'

export function * LevelBox(game) {
  const id = getRandomId('level-box')

  const transform = new TransformComponent(id, {
    x: 0,
    y: 0,
  })

  const collider = new ColliderComponent(id, {
    tag: 'box',
    collidesWithTag: 'cat'
  })

  while (true) {
    yield
  }

}
