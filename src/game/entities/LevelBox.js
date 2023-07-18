import { Rect } from '@taoro/math-rect'
import { TransformComponent } from '@taoro/component-transform-2d'
import { ColliderComponent } from '@taoro/collider-nano-2d'
import { TextComponent, RectComponent } from '@taoro/renderer-2d'

function getRandomId(prefix) {
  const id = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(36).padStart(8, 0)
  return `${prefix}-${id}`
}

export function * LevelBox(game, levelRect, parentTransform) {
  const id = getRandomId('level-box')

  const transform = new TransformComponent(id, {
    x: levelRect.x,
    y: levelRect.y,
  })

  const rect = new RectComponent(id, {
    rect: new Rect(0, 0, levelRect.width, levelRect.height),
    fillStyle: '#f0f'
  })

  const text = new TextComponent(id, {
    text: () => `${transform.position.x}, ${transform.position.y}, ${collider.rect.x}, ${collider.rect.y}`,
    font: '24px corben'
  })

  const collider = new ColliderComponent(id, {
    rect: new Rect(0, 0, levelRect.width, levelRect.height),
    tag: 1,
    collidesWithTag: 0
  })

  while (true) {
    transform.position.x = parentTransform.position.x + levelRect.x
    yield // detente aquí hasta la siguiente actualización
  }

  transform.unregister()
  collider.unregister()
  rect.unregister()
  text.unregister()
}
