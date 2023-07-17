
const refX = 4000
const refY = 2400

const targetX = 1920
const targetY = 1080

const rects = Array.from(document.querySelectorAll('rect[fill="#FF00A8"]'))
const collisionRects = rects.map((rect) => ({
  x: parseInt((rect.x.baseVal.value / refX * targetX).toFixed()),
  y: parseInt((rect.y.baseVal.value / refY * targetY).toFixed()),
  width: parseInt((rect.width.baseVal.value / refX * targetX).toFixed()),
  height: parseInt((rect.height.baseVal.value / refY * targetY).toFixed()),
}))
