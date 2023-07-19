import { TransformComponent } from "@taoro/component-transform-2d";
import { TextComponent } from "@taoro/renderer-2d";

export function * Loading(game) {
  const transform = new TransformComponent('loading', {
    x: 0,
    y: game.viewport.height - 48,
  })

  const text = new TextComponent('loading', {
    text: () => `Loading... (${Math.floor(game.resources.loaded / game.resources.total * 100)}%)`,
    font: '24px corben',
  })

  while (true) {
    yield
  }

  transform.unregister()
  text.unregister()
}

export default Loading
