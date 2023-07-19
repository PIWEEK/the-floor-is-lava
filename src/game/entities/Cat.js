import { Point } from '@taoro/math-point'
import { Rect } from '@taoro/math-rect'
import { Component } from '@taoro/component'
import { ImageSheet } from '@taoro/image-sheet'
import { TextComponent, RectComponent, ImageComponent } from '@taoro/renderer-2d'
import { TransformComponent } from '@taoro/component-transform-2d'
import { ColliderComponent } from '@taoro/collider-nano-2d'
import { Animation } from '~/game/utils/Animation.js'
import { CatAnimation } from '~/game/constants/CatAnimation.js'
import { CollisionTag } from '~/game/constants/CollisionTag.js'

const GRAVITY = 0.8

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
    x: 400,
    y: 100,
  })

  // 240 -> 525
  // 144 -> 315
  const collider = new ColliderComponent('cat', {
    rect: new Rect(0, 80, 160, 20),
    tag: CollisionTag.CAT,
    collidesWithTag: CollisionTag.SOLID
  })


  const gato = game.resources.get('images/gato.png')
  const imageSheet = new ImageSheet(
    gato.width,
    gato.height,
    createAnimationRects(gato)
  )

  const image = new ImageComponent('cat', {
    source: game.resources.get('images/gato.png'),
    rect: new Rect(),
    pivot: new Point(-100, -100),
  })
  image.rect.copy(imageSheet.rectOf(0))

  // Si estamos en modo desarrollo mostramos las cajas
  // de colisión y un texto de debug.
  if (import.meta.env.MODE === 'development') {
    const text = new TextComponent('cat', {
      text: () => `${collider.collisions.size}`,
      font: '24px corben',
    })
    text.pivot.set(200, 150)

    const rect = new RectComponent('cat', {
      fillStyle: '',
      strokeStyle: '#f0f',
    })
    rect.rect.copy(collider.rect)
  }

  game.sound.play(game.resources.get('sounds/meow.wav?taoro:as=audiobuffer'), {
    playbackRate: 1 + Math.random() * 0.5,
    onEnded: () => (isMeowing = false),
  })

  const velocity = new Point(0, 0)

  let isDamaged = false
  let isJumping = true
  let isMeowing = false

  const animation = new Animation(
    new Map([
      [CatAnimation.DAMAGE, [0, 2]],
      [CatAnimation.JUMP, [2, 8]],
      [CatAnimation.WALK, [8, 16]]
    ]),
    CatAnimation.JUMP,
    4
  )

  const lavaHeight = 900

  let jumpingCount = 0

  const collisionRect = new Rect()

  /**
   * Bucle del gato.
   */
  while (true) {
    /**
     * Bucle de gameplay.
     */
    while (!isDamaged) {
      if (gameState.isPaused) {
        yield
      }

      if (game.input.stateOf(0, 'jump') && !isJumping) {
        jumpingCount = 0
        animation.set(CatAnimation.JUMP)
        isJumping = true
      }

      if (game.input.stateOf(0, 'jump') && isJumping) {
        jumpingCount++
      }

      if (game.input.stateOf(0, 'meow') && !isMeowing) {
        game.sound.play(
          game.resources.get('sounds/meow.wav?taoro:as=audiobuffer'),
          {
            playbackRate: 1 + Math.random() * 0.5,
            onEnded: () => (isMeowing = false),
          }
        )
        animation.set(CatAnimation.DAMAGE)
        isMeowing = true
      }

      if (animation.isAnimation(CatAnimation.WALK)) {
        animation.animate(ANIMATION_SPEED_WALK)
      } else if (animation.isAnimation(CatAnimation.JUMP) && isJumping) {
        if (velocity.y === 0) {
          animation.animate(ANIMATION_SPEED_JUMP)
          // Cuando el fotograma del gato sea el 3 y su velocidad sea mayor
          // o igual a 0, entonces saltamos.
          if (animation.isFrame(ANIMATION_JUMP__JUMPING) && velocity.y >= 0) {
            velocity.y -= Math.max(10, Math.min(30, jumpingCount * 3))
            parentVelocity.x = -Math.max(5, Math.min(10, jumpingCount))
            jumpingCount = 0
          }
        } else if (velocity.y >= -30 && velocity.y <= -10) {
          animation.frame = ANIMATION_JUMP__JUMPING
        } else if (velocity.y >= -10 && velocity.y < 0) {
          animation.frame = ANIMATION_JUMP__FLOATING
        } else if (velocity.y >= 0) {
          animation.frame = ANIMATION_JUMP__FALLING
        }
      } else if (animation.isAnimation(CatAnimation.DAMAGE)) {
        animation.animate(ANIMATION_SPEED_DAMAGE)
        if (animation.frame > ANIMATION_MAX_FRAME_DAMAGE) {
          isDamaged = true
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

      if (collider.hasCollided && velocity.y > 0) {
        const [id] = collider.collisions
        const collisionTransform = Component.findByIdAndConstructor(id, TransformComponent)
        const collisionCollider = Component.findByIdAndConstructor(id, ColliderComponent)

        collisionRect
          .copy(collisionCollider.rect)
          .translatePoint(collisionTransform.position)

        velocity.y = 0
        transform.position.y = collisionRect.y - collisionRect.height - collider.rect.height / 2
        if (isJumping) {
          animation.set(CatAnimation.WALK)
          isJumping = false
        }
      } else if (!collider.hasCollided && transform.position.y < lavaHeight) {
        if (!isJumping) {
          velocity.y = 0
          isJumping = true
          animation.set(CatAnimation.JUMP, ANIMATION_JUMP__FALLING)
        }
        // Aplicamos la gravedad del juego.
        velocity.y += GRAVITY
        if (isJumping && animation.frame >= 3 && transform.position.y > lavaHeight - 50) {
          animation.frame = 5
        }
      } else if (transform.position.y >= lavaHeight) {
        // El gato está en el suelo (su velocidad vertical es 0
        // y su posición vertical es igual a la mitad de la altura de la pantalla).
        velocity.y = 0
        transform.position.y = lavaHeight
        if (isJumping) {
          isJumping = false
          animation.set(CatAnimation.DAMAGE)
          parentVelocity.x = 0
          game.sound.play(game.resources.get('sounds/hiss.mp3?taoro:as=audiobuffer'))
        }
      }
      image.rect.copy(imageSheet.rectOf(animation.currentFrame))

      transform.position.x += velocity.x
      transform.position.y += velocity.y

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
      transform.position.x += velocity.x
      animation.animate()
      image.rect.copy(imageSheet.rectOf(animation.currentFrame))
      yield
    }

    isDamaged = false
    isJumping = true
    isMeowing = false
    animation.set(CatAnimation.JUMP, 4)
    velocity.reset()
    transform.position.set(400, 100)
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
