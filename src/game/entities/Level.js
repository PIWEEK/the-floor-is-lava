import { TransformComponent } from '@taoro/component-transform-2d'
import { LevelBox } from './LevelBox'

export function * Level(game, levelIndex) {
  const transform = new TransformComponent('level', {
    x: 0,
    y: 0,
  })

  // Generamos el nivel a partir de la lista de rectángulos del archivo.
  // TODO: Molaría que esto pudiera cargar todos los recursos de forma más o menos
  // inteligente.
  const levelData = game.resources.get(`levels/level${levelIndex.toString().padStart(2, 0)}.json`)
  for (const rect of levelData) {
    game.scheduler.add(LevelBox(game, rect, transform))
  }

  while (true) {
    transform.position.x -= 4
    yield
  }
}
