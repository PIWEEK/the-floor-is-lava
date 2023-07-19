export class Animation {
  constructor(indices, initialAnimation, initialFrame) {
    this.indices = indices
    this.animation = initialAnimation
    this.frame = initialFrame
  }

  get currentFrame() {
    const [startFrame, endFrame] = this.indices.get(this.animation)
    const count = endFrame - startFrame
    return startFrame + (Math.floor(this.frame) % count)
  }

  isAnimation(animation) {
    return this.animation === animation
  }

  isFrame(index) {
    return Math.floor(this.frame) === index
  }

  set(newAnimation, newIndex = 0) {
    this.animation = newAnimation
    this.frame = newIndex
    return this
  }

  animate(velocity = 1) {
    this.frame += velocity
    return this
  }
}

export default Animation
