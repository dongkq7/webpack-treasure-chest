const { SyncWaterfallHook } = require('tapable')

let count = 0

class MyCompiler {
  constructor() {
    this.hooks = {
      // 1. 创建hook，并确定好要接收的参数
      syncWaterfallHook: new SyncWaterfallHook(['name', 'age'])
    }
    // 2. 注册事件
    this.hooks.syncWaterfallHook.tap('syncWaterfallHook1', (name, age) => {
      console.log('syncWaterfallHook1', name, age)
      return 'abc'
    })
    this.hooks.syncWaterfallHook.tap('syncWaterfallHook2', (name, age) => {
      console.log('syncWaterfallHook2', name, age) // abc 18
    })
  }
}

const compiler = new MyCompiler()

setTimeout(() => {
  // 3. 触发事件
  compiler.hooks.syncWaterfallHook.call('张三', 18)
}, 2000)