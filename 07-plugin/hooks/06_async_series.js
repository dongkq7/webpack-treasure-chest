const { AsyncSeriesHook } = require('tapable')

class MyCompiler {
  constructor() {
    this.hooks = {
      // 1. 创建hook，并确定好要接收的参数
      asyncSeriesHook: new AsyncSeriesHook(['name', 'age'])
    }
    // 2. 注册事件
    this.hooks.asyncSeriesHook.tapAsync('asyncSeriesHook1', (name, age, callback) => {
      setTimeout(() => {
        console.log('asyncSeriesHook1', name, age)
        callback()
      }, 2000)
    })
    this.hooks.asyncSeriesHook.tapAsync('asyncSeriesHook2', (name, age, callback) => {
      setTimeout(() => {
        console.log('asyncSeriesHook2', name, age)
        callback()
      }, 2000)
    })
  }
}

const compiler = new MyCompiler()
setTimeout(() => {
  // 3. 触发事件
  compiler.hooks.asyncSeriesHook.callAsync('张三', 18, () => {
    console.log('asyncSeriesHook 执行完成')
  })
}, 0)