const { SyncBailHook } = require('tapable')

class MyCompiler {
  constructor() {
    this.hooks = {
      // 1. 创建hook，并确定好要接收的参数
      syncBailHook: new SyncBailHook(['name', 'age'])
    }
    // 2. 注册事件
    this.hooks.syncBailHook.tap('syncBailHook1', (name, age) => {
      console.log('syncBailHook1', name, age)
      return 1
    })
    this.hooks.syncBailHook.tap('syncBailHook2', (name, age) => {
      console.log('syncBailHook2', name, age)
    })
  }
}

const compiler = new MyCompiler()

setTimeout(() => {
  // 3. 触发事件
  compiler.hooks.syncBailHook.call('张三', 18)
}, 2000)