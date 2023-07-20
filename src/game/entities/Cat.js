import { Point } from '@taoro/math-point'
import { Rect } from '@taoro/math-rect'
import { Component } from '@taoro/component'
import { ImageSheet } from '@taoro/image-sheet'
import { TextComponent, RectComponent, ImageComponent } from '@taoro/renderer-2d'
import { TransformComponent } from '@taoro/component-transform-2d'
import { Animation } from '~/game/utils/Animation.js'
import { CatAnimation } from '~/game/constants/CatAnimation.js'
import { CollisionTag } from '~/game/constants/CollisionTag.js'
import { ColliderComponent } from '~/game/systems/Collider.js'

const GRAVITY = 1

const LAVA_Y = 900

const CAT_MIN_JUMP_SPEED = 15
const CAT_MAX_JUMP_SPEED = 25
const CAT_MIN_X_SPEED = 10
const CAT_MAX_X_SPEED = 20

const CAT_INITIAL_X = 20
const CAT_INITIAL_Y = 800

const CAT_SPEED_DAMAGED = 10
const CAT_ANIMATION_FRAMES = 16

const ANIMATION_JUMP__PREPARE = 0
const ANIMATION_JUMP__JUMPING = 2
const ANIMATION_JUMP__FLOATING = 3
const ANIMATION_JUMP__FALLING = 4
const ANIMATION_JUMP__LANDING = 5

const ANIMATION_SPEED_WALK = 0.2
const ANIMATION_SPEED_JUMP = 0.2
const ANIMATION_SPEED_DAMAGE = 0.5
const ANIMATION_MAX_FRAME_DAMAGE = 10

/**
 * Crea un array de rectángulos a partir de una imagen.
 *
 * @param {CanvasImageSource} source
 * @param {number} numRects
 * @returns {Array<Rect>}
 */
function createAnimationRects(source, numRects = CAT_ANIMATION_FRAMES) {
  const rectWidth = source.width / numRects
  const rectHeight = source.height
  const rects = []
  for (let i = 0; i < numRects; i++) {
    rects.push(new Rect(i * rectWidth, 0, rectWidth, rectHeight))
  }
  return rects
}

/**
 * Cat.
 */
export function* Cat(game, parentVelocity, parentTransform, gameState) {
  const transform = new TransformComponent('cat', {
    x: CAT_INITIAL_X,
    y: CAT_INITIAL_Y,
  })

  const collider = new ColliderComponent('cat', {
    rects: [new Rect(0, 0, 180, 40)],
    tag: CollisionTag.CAT,
    collidesWithTag: CollisionTag.SOLID
  })

  const cat = game.resources.get('images/gato.png')
  const imageSheet = new ImageSheet(
    cat.width,
    cat.height,
    createAnimationRects(cat)
  )

  // Creamos un componente imagen que renderizará
  // el gato en pantalla con el fotograma actual.
  const image = new ImageComponent('cat', {
    source: cat,
    rect: new Rect(),
    pivot: new Point(-40, -100),
  })
  image.rect.copy(imageSheet.rectOf(0))

  // Creamos un controlador para la animación.
  const animation = new Animation(
    new Map([
      [CatAnimation.DAMAGE, [0, 2]],
      [CatAnimation.JUMP, [2, 8]],
      [CatAnimation.WALK, [8, 16]],
    ]),
    CatAnimation.JUMP,
    ANIMATION_JUMP__FALLING
  )

  // Si estamos en modo desarrollo mostramos las cajas
  // de colisión y un texto de debug.
  let debugTransform, debugCollisionRect
  if (import.meta.env.MODE === 'development') {
    const text = new TextComponent('cat', {
      text: () => `${collider.collisions.size}`,
      font: '24px corben',
    })

    const rect = new RectComponent('cat', {
      fillStyle: '',
      strokeStyle: '#f0f',
    })
    rect.rect.copy(collider.rects[0])

    debugTransform = new TransformComponent('debug-collision-rect', {})
    debugCollisionRect = new RectComponent('debug-collision-rect', {
      fillStyle: '#f0f',
    })
  }

  const velocity = new Point(0, 0)

  // TODO: ¿Esto podría hacerse con una FSM?
  let isRunning = false
  let isDamaged = false
  let isJumping = true
  let jumpingCount = 0
  let isMeowing = false

  // TODO: Esto lo uso para cosas de debug de las
  // colisiones porque hay algo muy raro con las
  // colisiones del gato.
  const collisionRect = new Rect()

  game.sound.play(game.resources.get('sounds/meow.wav?taoro:as=audiobuffer'), {
    playbackRate: 1 + Math.random() * 0.5,
    onEnded: () => (isMeowing = false),
  })

  /**
   * Bucle del gato.
   */
  while (true) {
    /**
     * Bucle de gameplay.
     */
    while (!isRunning) {
      if (!isDamaged) {
        if (game.input.stateOf(0, 'jump') && !isJumping) {
          jumpingCount = 0
          animation.set(CatAnimation.JUMP)
          isJumping = true
        }

        if (game.input.stateOf(0, 'jump') && isJumping) {
          jumpingCount++
        }

        if (animation.isAnimation(CatAnimation.WALK)) {
          animation.animate(ANIMATION_SPEED_WALK)
        } else if (animation.isAnimation(CatAnimation.JUMP) && isJumping) {
          if (velocity.y === 0) {
            animation.animate(ANIMATION_SPEED_JUMP)
            // Cuando el fotograma del gato sea el 3 y su velocidad sea mayor
            // o igual a 0, entonces saltamos.
            if (animation.isFrame(ANIMATION_JUMP__JUMPING) && velocity.y >= 0) {
              velocity.y -= Math.max(CAT_MIN_JUMP_SPEED, Math.min(CAT_MAX_JUMP_SPEED, jumpingCount * 3))
              parentVelocity.x = -Math.max(CAT_MIN_X_SPEED, Math.min(CAT_MAX_X_SPEED, jumpingCount))
              jumpingCount = 0
            }
          } else if (velocity.y >= -30 && velocity.y <= -10) {
            animation.frame = ANIMATION_JUMP__JUMPING
          } else if (velocity.y >= -10 && velocity.y < 0) {
            animation.frame = ANIMATION_JUMP__FLOATING
          } else if (velocity.y >= 0) {
            animation.frame = ANIMATION_JUMP__FALLING
          }
        }
        /*
        if (collider.hasCollided) {
          const [id] = collider.collisions
          const collisionTransform = Component.findByIdAndConstructor(id, TransformComponent)
          const collisionCollider = Component.findByIdAndConstructor(id, ColliderComponent)
          if (collisionCollider.tag === CollisionTag.SOLID) { // SOLID
            // Hacemos una cosa
          } else if (collisionCollider.tag === CollisionTag.POISON) { // POISON

          } else if (collisionCollider.tag === CollisionTag.MOVABLE) { // MOVABLE

          } else if (collisionCollider.tag === CollisionTag.CHARM) { // CHARM

          }
        }
        */

        if (collider.hasCollided) {
          const [collision] = collider.collisions

          if (debugCollisionRect) {
            debugCollisionRect.rect.copy(collision.targetRect)
          }

          if (velocity.y > 0) {
            velocity.reset()

            // FIXME: Aquí hay algo MUY raro que hace que las colisiones
            // salga un poco "pochas".
            // Realmente la fórmula debería ser:
            //
            // transform.position.y = collisionRect.y - collider.rect.height
            //
            transform.position.y = collision.targetRect.y - collider.rects[0].height
            if (isJumping) {
              isJumping = false
              animation.set(CatAnimation.WALK)
              if (Math.random() > 0.85) {
                isMeowing = true
                game.sound.play(game.resources.get('sounds/meow.wav?taoro:as=audiobuffer'), {
                  playbackRate: 1 + Math.random() * 0.5,
                  onEnded: () => (isMeowing = false),
                })
              }
            }
          }
        }

        if (!collider.hasCollided) {
          if (debugCollisionRect) {
            debugCollisionRect.rect.reset()
          }
        }

        if (!collider.hasCollided && transform.position.y < LAVA_Y) {
          if (!isJumping) {
            isJumping = true
            velocity.reset()
            animation.set(CatAnimation.JUMP, ANIMATION_JUMP__FALLING)
          }
          // Aplicamos la gravedad del juego.
          if (isJumping && animation.frame >= ANIMATION_JUMP__FLOATING && transform.position.y > LAVA_Y - 50) {
            animation.frame = ANIMATION_JUMP__LANDING
          }
          velocity.y += GRAVITY
        }

        if (transform.position.y >= LAVA_Y) {
          // El gato está en el suelo (su velocidad vertical es 0
          // y su posición vertical es igual a la mitad de la altura de la pantalla).
          velocity.reset()
          transform.position.y = LAVA_Y
          if (isJumping) {
            isJumping = false
            isDamaged = true
            animation.set(CatAnimation.DAMAGE)
            parentVelocity.x = 0
            game.sound.play(game.resources.get('sounds/hiss.mp3?taoro:as=audiobuffer'))
          }
        }
      } else {
        if (animation.isAnimation(CatAnimation.DAMAGE)) {
          animation.animate(ANIMATION_SPEED_DAMAGE)
          if (animation.frame > ANIMATION_MAX_FRAME_DAMAGE) {
            isRunning = true
          }
        }
      }
      image.rect.copy(imageSheet.rectOf(animation.currentFrame))

      transform.position.add(velocity)
      yield
    }

    /**
     * Cuando salimos del bucle principal, entramos
     * en el bucle de animación de daño.
     */
    animation.set(CatAnimation.WALK)
    velocity.reset()
    while (transform.position.x < game.viewport.currentWidth) {
      velocity.x += 1
      transform.position.add(velocity)
      animation.animate()
      image.rect.copy(imageSheet.rectOf(animation.currentFrame))
      yield
    }

    isDamaged = false
    isRunning = false
    isJumping = true
    isMeowing = false
    animation.set(CatAnimation.JUMP, 4)
    velocity.reset()
    transform.position.set(CAT_INITIAL_X, CAT_INITIAL_Y)
    parentTransform.position.x = 0
    parentVelocity.x = -4

    yield
  }

  image.unregister()
  transform.unregister()
  rect.unregister()
  text.unregister()
}

export default Cat
