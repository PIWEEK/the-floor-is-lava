import { Game } from '@taoro/game'
import { Component } from '@taoro/component'
import { AudioChannelName } from '@taoro/audio-channel'
import { InputDevice } from '@taoro/input'
import { Renderer } from '@taoro/renderer-2d'
import { ViewportResizeMode } from '@taoro/viewport'
import { Collider } from './systems/Collider.js'
import { Level } from './entities/Level.js'
import { Loading } from './entities/Loading.js'

let game = null

export async function start(canvas) {
  game = new Game(canvas, {
    globalThis: true,
  })

  game.viewport.mode = ViewportResizeMode.NONE
  game.viewport.width = 1920
  game.viewport.height = 1080

  // TODO: Hacer un cargador.
  game.resources.load('fonts/Corben/Corben-Regular.ttf?taoro:family=corben')
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
          [InputDevice.POINTER, [0, 'LeftButton']],
          [InputDevice.GAMEPAD, [0, 1, 1, -1]],
          [InputDevice.GAMEPAD, [0, 0, 0, 1]],
          [InputDevice.GAMEPAD, [0, 0, 1, 1]],
          [InputDevice.GAMEPAD, [0, 0, 2, 1]],
          [InputDevice.GAMEPAD, [0, 0, 3, 1]],
        ],
      ],
      [
        'pause',
        [
          [InputDevice.KEYBOARD, ['KeyP']],
          [InputDevice.POINTER, [0, 'MiddleButton']],
        ],
      ],
    ]
  })

  game.audio.get(AudioChannelName.MASTER).gain = localStorage.getItem("music") === "true" ? 1 : 0
  game.audio.get(AudioChannelName.MUSIC).gain = 0.125

  game.scheduler.add(Loading(game))
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
