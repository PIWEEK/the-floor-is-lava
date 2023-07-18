
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

async function loadLevel(options) {
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = options?.accept ?? '.json'
    input.multiple = options?.multiple ?? false
    input.onchange = (event) => {
      if (options?.multiple) {
        resolve(event.files)
      } else {
        const [file] = event.files
        resolve(file)
      }
    }
    input.click()
  })
}

const button = document.getElementById('load-level')
button.onclick = async () => {
  const file = await loadLevel({
    accept: '.json',
    multiple: false
  })
  console.log(file)
}
