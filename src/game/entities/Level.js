import { TransformComponent } from '@taoro/component-transform-2d'
import { LevelBox } from './LevelBox'

export function * Level(game, levelIndex) {
  const transform = new TransformComponent('level', {
    x: 0,
    y: 0,
  })

  const levelData = game.resources.get(`levels/level${levelIndex.toString().padStart(2, 0)}.json`)
  for (const rect of levelData) {
    game.scheduler.add(LevelBox(game, rect, transform))
  }

  while (true) {
    transform.position.x -= 2
    yield
  }
}
