import { Game } from '@taoro/game'
import { Component } from '@taoro/component'
import { AudioChannelName } from '@taoro/audio-channel'
import { InputDevice } from '@taoro/input'
import { Renderer } from '@taoro/renderer-2d'
import { Collider } from '@taoro/collider-nano-2d'
import { ViewportResizeMode } from '@taoro/viewport'
import { Level } from './entities/Level.js'

let game = null

export async function start(canvas) {
  game = new Game(canvas, {
    globalThis: true,
  })

  game.viewport.mode = ViewportResizeMode.NONE
  game.viewport.width = 1920
  game.viewport.height = 1080

  // TODO: Hacer un cargador.
  game.resources.load(
    'musics/ES_Cool Cat Alley - Alvaro Antin.mp3?taoro:as=audiobuffer'
  )
  game.resources.load('sounds/meowch.wav?taoro:as=audiobuffer')
  game.resources.load('sounds/meow.wav?taoro:as=audiobuffer')
  game.resources.load('sounds/meowbrrr.wav?taoro:as=audiobuffer')
  game.resources.load(
    'sounds/ES_Cat Hiss Angry Short - SFX Producer.mp3?taoro:as=audiobuffer'
  )
  game.resources.load('fonts/Corben/Corben-Regular.ttf?taoro:family=corben')
  game.resources.load('images/gato.json')
  game.resources.load('images/gato.png')
  game.resources.load('images/intro.png')
  game.resources.load('images/01/background.png')
  for (let i = 0; i < 8; i++) {
    game.resources.load(`images/01/foreground/${i + 1}.png`)
  }
  game.resources.load('levels/level01.json')
  await game.resources.all()

  // Añadimos el renderer al pipeline del juego.
  const collider = new Collider()
  const renderer = new Renderer(canvas)
  game.pipeline.unshift(() => collider.update())
  game.pipeline.push(() => renderer.update())

  // Seteamos los bindings de los controles.
  game.input.setBindings(0, () => {
    return [
      [
        'jump',
        [
          [InputDevice.KEYBOARD, ['KeyW']],
          [InputDevice.KEYBOARD, ['Space']],
          [InputDevice.KEYBOARD, ['ArrowUp']],
          // [InputDevice.MOUSE, [0, 'LeftButton']],
          [InputDevice.POINTER, [0, 'LeftButton']],
          [InputDevice.GAMEPAD, [0, 1, 1, -1]], // 0 -> gamepad 0
        ],
      ],
      [
        'meow',
        [
          [InputDevice.KEYBOARD, ['KeyZ']],
          // [InputDevice.MOUSE, [0, 'RightButton']],
          [InputDevice.POINTER, [0, 'RightButton']],
          [InputDevice.GAMEPAD, [0, 0, 0, 1]],
          [InputDevice.GAMEPAD, [0, 0, 1, 1]],
          [InputDevice.GAMEPAD, [0, 0, 2, 1]],
          [InputDevice.GAMEPAD, [0, 0, 3, 1]],
        ],
      ],
    ]
  })

  game.audio.get(AudioChannelName.MASTER).gain = localStorage.getItem("music") === "true" ? 1 : 0
  game.audio.get(AudioChannelName.MUSIC).gain = 0.125

  // Añadimos el gato al juego.
  game.scheduler.add(Level(game, 1))

  // Arrancamos el juego.
  game.start()
}

export function stop() {
  game.music.a.stop()
  game.scheduler.clear()
  Component.unregisterAll()
  game.stop()
}
