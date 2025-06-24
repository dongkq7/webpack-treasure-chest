const { SyncLoopHook } = require('tapable')

let count = 0

class MyCompiler {
  constructor() {
    this.hooks = {
      // 1. 创建hook，并确定好要接收的参数
      syncLoopHook: new SyncLoopHook(['name', 'age'])
    }
    // 2. 注册事件
    this.hooks.syncLoopHook.tap('syncLoopHook1', (name, age) => {
      if (count < 3) {
        console.log('syncLoopHook1', name, age)
        count++
        return true
      }
    })
    this.hooks.syncLoopHook.tap('syncLoopHook2', (name, age) => {
      console.log('syncLoopHook2', name, age)
    })
  }
}

const compiler = new MyCompiler()

setTimeout(() => {
  // 3. 触发事件
  compiler.hooks.syncLoopHook.call('张三', 18)
}, 2000)