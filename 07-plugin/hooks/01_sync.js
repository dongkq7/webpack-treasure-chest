const { SyncHook } = require('tapable')

class MyCompiler {
  constructor() {
    this.hooks = {
      // 1. 创建hook，并确定好要接收的参数
      syncHook: new SyncHook(['name', 'age'])
    }
    // 2. 注册事件
    this.hooks.syncHook.tap('syncHook1', (name, age) => {
      console.log('syncHook1', name, age)
    })
    this.hooks.syncHook.tap('syncHook2', (name, age) => {
      console.log('syncHook2', name, age)
    })
  }
}

const compiler = new MyCompiler()

setTimeout(() => {
  // 3. 触发事件
  compiler.hooks.syncHook.call('张三', 18)
}, 2000)