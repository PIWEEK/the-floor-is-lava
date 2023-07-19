import { Rect } from '@taoro/math-rect'
import { Component } from '@taoro/component'
import { TransformComponent } from '@taoro/component-transform-2d'
import { Pool } from '@taoro/pool'

export class Collision {
  #id = null
  #target = null
  #source = null
  #targetRect = null
  #sourceRect = null

  /**
   * Creates a new collision identifier.
   *
   * @param {*} id
   * @param {ColliderComponent} target
   * @param {ColliderComponent} source
   * @param {Rect} targetRect
   * @param {Rect} sourceRect
   */
  constructor(id, target, source, targetRect, sourceRect) {
    this.#id = id ?? null
    this.#target = target ?? null
    this.#source = source ?? null
    this.#targetRect = targetRect ?? new Rect()
    this.#sourceRect = sourceRect ?? new Rect()
  }

  set(id, target, source, targetRect, sourceRect) {
    this.#id = id
    this.#target = target
    this.#source = source
    this.#targetRect.copy(targetRect)
    this.#sourceRect.copy(sourceRect)
  }

  get id() {
    return this.#id
  }

  get target() {
    return this.#target
  }

  get source() {
    return this.#source
  }

  get targetRect() {
    return this.#targetRect
  }

  get sourceRect() {
    return this.#sourceRect
  }
}

const MAX_COLLISIONS = 16

const CollisionProvider = new Pool(MAX_COLLISIONS, () => new Collision())

export class ColliderComponent extends Component {
  #rects = null
  #collisions = new Set()

  constructor(id, { tag = 0, collidesWithTag = 0, rects = [new Rect()] } = {}) {
    super(id)
    this.#rects = rects ?? [new Rect()]
    this.tag = tag ?? 0
    this.collidesWithTag = collidesWithTag ?? 0
  }

  get collisions() {
    return this.#collisions
  }

  get rects() {
    return this.#rects
  }

  get hasCollided() {
    return this.#collisions.size > 0
  }

  collidesWith(id) {
    for (const collision of this.#collisions) {
      if (collision.id === id) {
        return true
      }
    }
    return false
  }
}

/**
 * A very simple collider system without any optimizations like
 * Spatial Hash Maps, Quad Trees, Bounding Volume Hierarchy, etc.
 *
 * It also doesn't supports rotation, scale, skew, etc. neither
 * it supports any kind of collider shape other than rectangles.
 *
 * It's just a simple collider system to get things started.
 */
export class Collider {
  update() {
    const aRect = new Rect()
    const bRect = new Rect()

    const components = Component.findByConstructor(ColliderComponent)
    if (!components) {
      return
    }

    for (const component of components) {
      component.collisions.forEach((collision) => CollisionProvider.deallocate(collision))
      component.collisions.clear()
    }

    for (let aIndex = 0; aIndex < components.length - 1; aIndex++) {
      const a = components[aIndex]
      const aTransform = Component.findByIdAndConstructor(
        a.id,
        TransformComponent
      )
      for (let bIndex = aIndex + 1; bIndex < components.length; bIndex++) {
        const b = components[bIndex]
        if (a.collidesWithTag !== b.tag) {
          continue
        }

        for (const aCurrentRect of a.rects) {
          aRect.copy(aCurrentRect).translatePoint(aTransform.position)

          for (const bCurrentRect of b.rects) {
            const bTransform = Component.findByIdAndConstructor(
              b.id,
              TransformComponent
            )
            bRect.copy(bCurrentRect).translatePoint(bTransform.position)

            if (aRect.intersectsRect(bRect)) {
              const aCollision = CollisionProvider.allocate()
              aCollision.set(b.id, b, a, bRect, aRect)
              a.collisions.add(aCollision)
              const bCollision = CollisionProvider.allocate()
              bCollision.set(a.id, a, b, aRect, bRect)
              b.collisions.add(bCollision)
            }
          }
        }
      }
    }
  }
}
