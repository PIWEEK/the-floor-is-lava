import { Rect } from '@taoro/math-rect'
import { Point } from '@taoro/math-point'
import { linear, quadratic } from '@taoro/math-interpolation'
import { ImageComponent, RectComponent } from "@taoro/renderer-2d"
import { TransformComponent } from "@taoro/component-transform-2d"
import { ColliderComponent } from '~/game/systems/Collider.js'
import { getRandomId } from '~/game/utils/id'
import { CollisionTag } from '~/game/constants/CollisionTag'
import { SymbolType } from '~/game/constants/SymbolType'

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
export function * LevelSymbol(game, gameState, parentTransform, instance, symbol, levelId, parallax = 1) {
  const id = getRandomId('level-symbol')

  const transform = new TransformComponent(id, {
    x: instance.position.x,
    y: instance.position.y,
  })

  const source = game.resources.get(`levels/${levelId}/symbols/${symbol.name}.png`)
  const image = new ImageComponent(id, {
    source
  })

  const rects = []
  for (const { position, size } of symbol.colliders) {
    rects.push(new Rect(position.x, position.y, size.width, size.height))

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

  const collider = new ColliderComponent(id, {
    rects: rects,
    tag: symbol?.type === SymbolType.CHARM ? CollisionTag.CHARM : CollisionTag.SOLID,
    targetTag: CollisionTag.CAT,
  })

  let alive = true, charmIndex = 0
  while (alive) {
    if (symbol.type === SymbolType.CHARM) {
      if (collider.collidesWithTag(CollisionTag.CAT)) {
        alive = false
      }
    }
    transform.position.x = parentTransform.position.x * parallax + instance.position.x
    yield
  }

  const initialPosition = transform.position.clone()

  charmIndex = gameState.charms
  gameState.charms++

  const charmPosition = new Point(
    20 + charmIndex * 150, 20
  )

  let startTime = performance.now()
  while (true) {
    let currentTime = performance.now() - startTime
    let delta = quadratic(Math.min(1, currentTime / 400), 0, 1, 1)
    transform.position.set(
      linear(delta, initialPosition.x, charmPosition.x),
      linear(delta, initialPosition.y, charmPosition.y)
    )
    yield
  }

  image.unregister()
  collider.unregister()
  transform.unregister()
}

export default LevelSymbol
