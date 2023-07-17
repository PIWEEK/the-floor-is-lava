import { Point } from '@taoro/math-point'
import { Rect } from '@taoro/math-rect'
import { ImageComponent } from '@taoro/renderer-2d'
import { TransformComponent } from '@taoro/component-transform-2d'

/**
 * Cat.
 */
export function* Cat(game) {
  const transform = new TransformComponent('cat', {
    x: 100,
    y: 100,
    width: 32,
    height: 32,
  })

  const image = new ImageComponent('cat', {
    source: game.resources.get('images/gato.png'),
    rect: new Rect(0, 0, 400, 300),
    pivot: new Point(-200, -150),
  })

  game.sound.play(game.resources.get('sounds/meow.wav?taoro:as=audiobuffer'), {
    playbackRate: 1 + Math.random() * 0.5,
    onEnded: () => (isMeowing = false),
  })

  const velocity = new Point(0, 0)

  let life = 100
  let isJumping = false
  let isMeowing = false
  let frameIndex = 0

  while (life > 0) {
    if (game.input.stateOf(0, 'jump') && !isJumping) {
      velocity.y -= 10
      isJumping = true
    }

    if (game.input.stateOf(0, 'left')) {
      velocity.x -= 1
      transform.scale.x = -1
    } else if (game.input.stateOf(0, 'right')) {
      velocity.x += 1
      transform.scale.x = 1
    }

    if (game.input.stateOf(0, 'meow') && !isMeowing) {
      game.sound.play(
        game.resources.get('sounds/meow.wav?taoro:as=audiobuffer'),
        {
          playbackRate: 1 + Math.random() * 0.5,
          onEnded: () => (isMeowing = false),
        }
      )
      isMeowing = true
    }

    frameIndex += Math.abs(velocity.x) / 50

    image.rect.x = (Math.floor(frameIndex) % 8) * 400

    transform.position.x += velocity.x
    transform.position.y += velocity.y
    velocity.x *= 0.8

    if (transform.position.y < game.viewport.currentHalfHeight) {
      velocity.y += 0.8
    } else {
      velocity.y = 0
      transform.position.y = game.viewport.currentHalfHeight
      isJumping = false
    }

    yield
  }

  image.unregister()
  transform.unregister()
}

export default Cat
