import { Rect } from '@taoro/math-rect'
import { TransformComponent } from "@taoro/component-transform-2d"
import { RectComponent } from "@taoro/renderer-2d"
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

  while (true) {
    if (gameState.isEnded) {
      if (transform.position.x > 0) {
        transform.position.x += parentVelocity.x
        if (transform.position.x < 0) {
          transform.position.x = 0
        }
      }
    } else {
      transform.position.x = parentTransform.position.x * parallax + x
    }
    yield
  }
}

export default LevelEnd
