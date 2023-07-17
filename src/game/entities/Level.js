import { TransformComponent } from '@taoro/component-transform-2d'

export function * Level(game) {
  const transform = new TransformComponent('level', {
    x: 0,
    y: 0,
  })

  while (true) {
    yield
  }
}
