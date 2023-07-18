import { Point } from '@taoro/math-point'
import { Rect } from '@taoro/math-rect'
import { Component } from '@taoro/component'
import { ImageSheet, ImageSheetRect } from '@taoro/image-sheet'
import { TextComponent, RectComponent, ImageComponent } from '@taoro/renderer-2d'
import { TransformComponent } from '@taoro/component-transform-2d'
import { ColliderComponent } from '@taoro/collider-nano-2d'

export const CatAnimation = {
  DAMAGE: 'damage',
  JUMP: 'jump',
  WALK: 'walk',
}

/**
 * Cat.
 */
export function* Cat(game, parentVelocity, parentTransform) {
  const transform = new TransformComponent('cat', {
    x: 400,
    y: 100,
  })

  const collider = new ColliderComponent('cat', {
    rect: new Rect(0, 80, 100, 20),
    tag: 0,
    collidesWithTag: 1,
  })

  const gatoRects = game.resources.get('images/gato.json')
    .map((rect) => new Rect(rect.x, rect.y, rect.width, rect.height))
  const gato = game.resources.get('images/gato.png')
  const imageSheet = new ImageSheet(gato.width, gato.height, gatoRects)

  const image = new ImageComponent('cat', {
    source: game.resources.get('images/gato.png'),
    rect: new Rect(),
    pivot: new Point(-35, -35),
  })
  image.rect.copy(imageSheet.rectOf(0))

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

  game.sound.play(game.resources.get('sounds/meow.wav?taoro:as=audiobuffer'), {
    playbackRate: 1 + Math.random() * 0.5,
    onEnded: () => (isMeowing = false),
  })

  const velocity = new Point(0, 0)

  let isDamaged = false
  let isJumping = true
  let isMeowing = false

  // CatAnimation.WALK, 'jump' y 'damage'
  const frameIndices = new Map([
    [CatAnimation.DAMAGE, [0, 2]],
    [CatAnimation.JUMP, [2, 8]],
    [CatAnimation.WALK, [8, 16]]
  ])

  const lavaHeight = 840

  let frameAnimation = CatAnimation.JUMP
  let frameIndex = 4
  let currentRectIndex = 0

  while (true) {
    while (!isDamaged) {
      if (game.input.stateOf(0, 'jump') && !isJumping) {
        frameAnimation = CatAnimation.JUMP
        frameIndex = 0
        isJumping = true
      }

      if (game.input.stateOf(0, 'meow') && !isMeowing) {
        game.sound.play(
          game.resources.get('sounds/meow.wav?taoro:as=audiobuffer'),
          {
            playbackRate: 1 + Math.random() * 0.5,
            onEnded: () => (isMeowing = false),
          }
        )
        frameAnimation = CatAnimation.DAMAGE
        frameIndex = 0
        isMeowing = true
      }

      if (frameAnimation === CatAnimation.WALK) {
        frameIndex += 0.2
      } else if (frameAnimation === CatAnimation.JUMP && isJumping) {
        if (velocity.y === 0) {
          frameIndex += 0.2
          if (Math.floor(frameIndex) === 2 && velocity.y >= 0) {
            velocity.y -= 20
          }
        } else if (velocity.y >= -20 && velocity.y <= -10) {
          frameIndex = 2
        } else if (velocity.y >= -10 && velocity.y < 0) {
          frameIndex = 3
        } else if (velocity.y >= 0) {
          frameIndex = 4
        }
      } else if (frameAnimation === CatAnimation.DAMAGE) {
        frameIndex += 0.5
        if (frameIndex > 10) {
          isDamaged = true
        }
      }

      // image.rect.x = (Math.floor(frameIndex) % 8) * 400

      transform.position.x += velocity.x
      transform.position.y += velocity.y

      if (collider.hasCollided && velocity.y > 0) {
        for (const id of collider.collisions) {
          const collisionTransform = Component.findByIdAndConstructor(id, TransformComponent)
          if (collisionTransform.position.y - collider.rect.y - transform.position.y < 10) {
            velocity.y = 0
            transform.position.y = collisionTransform.position.y - collider.rect.y - collider.rect.height
            if (isJumping) {
              frameAnimation = CatAnimation.WALK
              frameIndex = 0
              isJumping = false
            }
          }
        }
      }

      if (!collider.hasCollided && transform.position.y < lavaHeight) {
        if (!isJumping) {
          velocity.y = 0.001
          isJumping = true
          frameAnimation = CatAnimation.JUMP
          frameIndex = 4
        }
        // Aplicamos la gravedad del juego.
        velocity.y += 0.8
        if (isJumping && frameIndex >= 3 && transform.position.y > lavaHeight - 50) {
          frameIndex = 5
        }
      } else if (transform.position.y >= lavaHeight) {
        // El gato está en el suelo (su velocidad vertical es 0
        // y su posición vertical es igual a la mitad de la altura de la pantalla).
        velocity.y = 0
        transform.position.y = lavaHeight
        if (isJumping) {
          isJumping = false
          frameAnimation = CatAnimation.DAMAGE
          frameIndex = 0

          parentVelocity.x = 0
          game.sound.play(game.resources.get('sounds/ES_Cat Hiss Angry Short - SFX Producer.mp3?taoro:as=audiobuffer'))
        }
        // TODO: Esto hace que el gato vaya caminando por el suelo
        //       de lava.
        /*
        if (isJumping && frameIndex >= 2) {
          frameAnimation = CatAnimation.WALK
          frameIndex = 0
          isJumping = false
        }
        */
      }

      const [startIndex, endIndex] = frameIndices.get(frameAnimation)
      const count = endIndex - startIndex
      currentRectIndex = startIndex + (Math.floor(frameIndex) % count)
      image.rect.copy(imageSheet.rectOf(currentRectIndex))

      yield
    }

    frameAnimation = CatAnimation.WALK
    frameIndex = 0
    while (transform.position.x < game.viewport.currentWidth) {
      transform.position.x += 10

      frameIndex += 1

      const [startIndex, endIndex] = frameIndices.get(frameAnimation)
      const count = endIndex - startIndex
      currentRectIndex = startIndex + (Math.floor(frameIndex) % count)
      image.rect.copy(imageSheet.rectOf(currentRectIndex))

      yield
    }

    isDamaged = false
    isJumping = true
    isMeowing = false
    frameAnimation = CatAnimation.JUMP
    frameIndex = 0
    currentRectIndex = 0
    velocity.x = 0
    velocity.y = 0
    transform.position.x = 400
    transform.position.y = 100
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
