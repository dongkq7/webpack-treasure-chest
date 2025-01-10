import isPrime from './isPrime'

export default class {
  constructor(duration = 100) {
    this.duration = duration // 生产数字的时间间隔
    this.number = 1
    this.callback = null // 为了具有更高的扩展性，通过回调函数的方式供外部自定义
    this.timer = null
  }

  start() {
    if (this.timer) {
      return
    }
    this.timer = setInterval(() => {
      this.callback && this.callback(this.number, isPrime(this.number))
      this.number ++
    }, this.duration)
  }

  stop() {
    clearInterval(this.timer)
    this.timer = null
  }
}