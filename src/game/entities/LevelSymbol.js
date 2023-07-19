import { Rect } from '@taoro/math-rect'
import { ImageComponent, RectComponent } from "@taoro/renderer-2d"
import { TransformComponent } from "@taoro/component-transform-2d"
import { ColliderComponent } from "@taoro/collider-nano-2d"
import { getRandomId } from '~/game/utils/id'
import { CollisionTag } from '~/game/constants/CollisionTag'

/**
 * Esta tarea se encarga de crear los diferentes símbolos
 * del nivel y de controlar su posición con respecto al nivel.
 *
 * @param {Game} game
 * @param {Transform} parentTransform
 * @param {LevelSymbolInstance} instance
 * @param {LevelSymbolDefinition} symbol
 * @param {number} levelId
 * @param {number} [parallax=1]
 */
export function * LevelSymbol(game, parentTransform, instance, symbol, levelId, parallax = 1) {
  const id = getRandomId('level-symbol')

  const transform = new TransformComponent(id, {
    x: instance.position.x,
    y: instance.position.y,
  })

  const source = game.resources.get(`levels/${levelId}/symbols/${symbol.name}.png`)
  const image = new ImageComponent(id, {
    source
  })

  const colliders = []
  for (const { position, size } of symbol.colliders) {
    new ColliderComponent(id, {
      rect: new Rect(position.x, position.y, size.width, size.height),
      tag: CollisionTag.SOLID,
      collidesWithTag: CollisionTag.CAT,
    })

    // Si estamos en modo desarrollo mostramos las cajas
    // de colisión.
    if (import.meta.env.MODE === 'development') {
      new RectComponent(id, {
        rect: new Rect(position.x, position.y, size.width, size.height),
        fillStyle: 'transparent',
        strokeStyle: '#f0f',
      })
    }
  }

  while (true) {
    transform.position.x = parentTransform.position.x * parallax + instance.position.x
    yield
  }

  image.unregister()
  colliders.forEach(collider => collider.unregister())
}

export default LevelSymbol
