import { linear, quadratic } from '@taoro/math-interpolation'
import { Rect } from '@taoro/math-rect'
import { TransformComponent } from "@taoro/component-transform-2d"
import { TextComponent, RectComponent } from "@taoro/renderer-2d"
import { ColliderComponent } from '~/game/systems/Collider'
import { CollisionTag } from '~/game/constants/CollisionTag'

export function* LevelEnd(game, gameState, parentTransform, parentVelocity, x, parallax = 1) {
  const transform = new TransformComponent('end', {
    x: 0,
    y: 0,
  })

  const rect = new RectComponent('end', {
    rect: new Rect(0, 0, 2000, 1080),
    fillStyle: '#000'
  })

  const collider = new ColliderComponent('end', {
    rects: [new Rect(0, 0, 1920, 1080)],
    tag: CollisionTag.END,
    targetTag: CollisionTag.CAT,
  })

  const textTransform = new TransformComponent('end-text', {
    x: 1920 / 2,
    y: 2000,
  })

  const text = new TextComponent('end-text', {
    text: 'THE END',
    textAlign: 'center',
    textBaseline: 'middle',
    font: '200px corben',
    fillStyle: '#FFD2C6',
    alpha: 0,
  })

  while (true) {
    if (gameState.isEnded) {
      if (transform.position.x > 0) {
        transform.position.x += parentVelocity.x
        if (transform.position.x < 0) {
          transform.position.x = 0
        }
      }

      const delta = Math.max(0, Math.min(1, (performance.now() - gameState.endStart) / 3000))
      textTransform.position.y = quadratic(delta, 2000, 540, 540)
      text.alpha = delta

    } else {
      transform.position.x = parentTransform.position.x * parallax + x
    }
    yield
  }
}

export default LevelEnd
