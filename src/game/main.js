import { Game } from '@taoro/game'
import { InputDevice } from '@taoro/input'
import { Renderer } from '@taoro/renderer-2d'
import { Cat } from './entities/Cat.js'

export default async function main(canvas) {

  const game = new Game(canvas, {
    globalThis: true
  })

  game.resources.load('sounds/meowch.wav?taoro:as=audiobuffer')
  game.resources.load('sounds/meow.wav?taoro:as=audiobuffer')
  game.resources.load('sounds/meowbrrr.wav?taoro:as=audiobuffer')
  game.resources.load('fonts/Corben/Corben-Regular.ttf?taoro:family=corben')
  game.resources.load('images/gato.png')
  await game.resources.all()

  // Añadimos el renderer al pipeline del juego.
  const renderer = new Renderer(canvas)
  game.pipeline.push(() => renderer.update())

  // Seteamos los bindings de los controles.
  game.input.setBindings(0, () => {
    return [
      [
        'jump',
        [
          [InputDevice.KEYBOARD, ['KeyW']],
          [InputDevice.KEYBOARD, ['ArrowUp']],
          [InputDevice.MOUSE, ['LeftButton']],
          [InputDevice.GAMEPAD, [0, 1, 1, -1]],
        ],
      ],
      [
        'meow',
        [
          [InputDevice.KEYBOARD, ['KeyZ']],
          [InputDevice.KEYBOARD, ['Space']],
          [InputDevice.MOUSE, ['RightButton']],
          [InputDevice.GAMEPAD, [0, 0, 0, 1]],
          [InputDevice.GAMEPAD, [0, 0, 1, 1]],
          [InputDevice.GAMEPAD, [0, 0, 2, 1]],
          [InputDevice.GAMEPAD, [0, 0, 3, 1]],
        ],
      ],
    ]
  })

  // Añadimos el gato al juego.
  game.scheduler.add(Cat(game))

  // Arrancamos el juego.
  game.start()
}
