const { AsyncParallelHook } = require('tapable')

class MyCompiler {
  constructor() {
    this.hooks = {
      // 1. 创建hook，并确定好要接收的参数
      asyncParallelHook: new AsyncParallelHook(['name', 'age'])
    }
    // 2. 注册事件
    this.hooks.asyncParallelHook.tapAsync('asyncParallelHook1', (name, age) => {
      setTimeout(() => {
        console.log('asyncParallelHook1', name, age)
      }, 2000)
    })
    this.hooks.asyncParallelHook.tapAsync('asyncParallelHook2', (name, age) => {
      setTimeout(() => {
        console.log('asyncParallelHook2', name, age)
      }, 2000)
    })
  }
}

const compiler = new MyCompiler()
setTimeout(() => {
  // 3. 触发事件
  compiler.hooks.asyncParallelHook.callAsync('张三', 18)
}, 0)