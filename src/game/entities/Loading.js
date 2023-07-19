import { TransformComponent } from "@taoro/component-transform-2d";
import { TextComponent } from "@taoro/renderer-2d";

const FONT_SIZE = 48
const MARGIN_SIZE = FONT_SIZE * 2

export function * Loading(game) {
  const transform = new TransformComponent('loading', {
    x: MARGIN_SIZE,
    y: game.viewport.height - MARGIN_SIZE,
  })

  const text = new TextComponent('loading', {
    text: () => {
      if (game.resources.loaded === game.resources.total) {
        return ''
      }
      return `Loading... (${Math.floor(
        (game.resources.loaded / game.resources.total) * 100
      )}%)`
    },
    fillStyle: '#FFEFDF',
    font: `${FONT_SIZE}px corben`,
  })

  while (true) {
    transform.position.set(MARGIN_SIZE, game.viewport.height - MARGIN_SIZE)
    yield
  }

  image.unregister()
  transform.unregister()
  text.unregister()
}

export default Loading
