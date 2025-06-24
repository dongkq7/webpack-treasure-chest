# Webpack和Tapable

webpack有两个非常重要的类：`Compiler`和`Compilation` ，它们通过注入插件的方式，来监听webpack的所有生命周期，插件的注入离不开各种各样的Hook，而Hook是如何得到的呢？ 

- 其实是创建了**Tapable库中的各种Hook的实例**

所以，如果想要学习自定义插件，最好先了解一个库：Tapable 

- Tapable是官方编写和维护的一个库
- Tapable是管理着需要的Hook，这些Hook可以被应用到我们的插件中

## Hook的分类

Tapable中的Hook分为同步的和异步的：

- 以`Sync`开头的为同步Hook
- 以`Async`开头的为异步Hook

其他类别：

- `Bail`：当有返回值时，就不会执行后续的事件触发了
- `Loop`：当返回值为true或者返回值隐式转换为true，就会反复执行该事件，当返回值为undefined或者不返回内容，就退出事
- `Waterfall`：当返回值不为undefined时，会将这次返回的结果作为下次事件的第一个参数
- `Parallel`：并行，不会等到上一个事件处理回调结束，才执行下一次事件处理回调
- `Series`：串行，会等待上一个异步的Hook执行完后，才执行下一个

![img](https://cdn.nlark.com/yuque/0/2025/jpeg/22253064/1750743019636-13877525-bdb4-4c08-a17b-1a1dc1ba0b0a.jpeg)

## Tapable的使用

```bash
npm i tapable
```



```javascript
// ----------------------------- SyncHook -------------------------------------
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

// ----------------------------- SyncBailHook -------------------------------------
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


// ----------------------------- SyncLoopHook -------------------------------------
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


// ----------------------------- SyncWaterfallHook -------------------------------------
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

// ----------------------------- AsyncParallelHook -------------------------------------

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


// // ----------------------------- AsyncSeriesHook -------------------------------------
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
```

# plugin是干什么的

loader的功能定位是转换代码，而一些其他的操作难以使用loader完成，比如：

- 当webpack生成文件时，顺便多生成一个说明描述文件
- 当webpack编译启动时，控制台输出一句话表示webpack启动了
- 当xxxx时，要做xxxx...

这种类似的功能需要把功能嵌入到webpack的编译流程中，而这种事情的实现是依托于plugin的。

总得来说：Loader用于对特定模块类型进行转换，Plugin可以用于执行更加广泛的任务，比如打包优化、资源管理、环境变量注入等。

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1749526734171-c6f98cce-4564-4405-92d1-a03d88eb9d9f.png)

![null](assets/2020-01-15-12-45-16.png)![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1736755141140-d228f725-75be-4cf2-a39a-1186d253bdf5.png)

红色点表示事件的触发点，比如在初始化完成后会触发一个事件、编译过程中也会触发一些事件：比如模块解析完成，chunk资源生成完成、总资源生成完成触发一个事件、总得资源输出到文件目录中时也会触发一个事件。等等。

**而这些事件都会被plugin进行监听。**

plugin的**本质**是一个带有apply方法的对象

```javascript
var plugin = {
    apply: function(compiler){
        
    }
}
```

通常，习惯上，我们会将该对象写成构造函数的模式

```javascript
module.exports = class MyPlugin{
  apply(compiler) {
    console.log('MyPlugin 启动');
  }
}
```

要将插件应用到webpack，需要把插件对象配置到webpack的plugins数组中，如下：

```javascript
var MyPlugin = require('./plugins/MyPlugin');
module.exports = {
  mode: 'development',
  plugins: [
    new MyPlugin()
  ]
}
```

apply函数会在初始化阶段，**创建好compiler对象（编译器实例）后运行。**

compiler对象是在初始化阶段构建的，**整个webpack打包期间只有一个compiler对象**，后续完成打包工作的是compiler对象内部创建的**compilation**

apply方法会在**创建好compiler对象后调用**，并向方法传入一个compiler对象

![null](assets/2020-01-15-12-49-26.png)![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1736755153372-845e85c9-cdaa-4fc0-aa49-f0583f8a0c9e.png)

如果启动了watch，在文件变化时会重新进行打包，此时会重新生成一个compilation，不会重新生成compiler。compiler只会有一个，而compilation会有多个。

- 所以说apply方法只会在创建好compiler对象后运行一次。当文件内容变化时不会重新运行。因为apply是在初始化阶段compiler对象创建好后运行的，文件内容变化后重新生成的只有compilation对象，compiler对象是不变的。

既然apply方法只运行一次，为什么可以处理各个事件节点呢？

**这就是因为apply方法中是去注册各个事件节点的钩子函数的，一旦发生了某个事件那么就会执行对应的函数。**

**compiler对象提供了大量的钩子函数（hooks，可以理解为事件），plugin的开发者可以注册这些钩子函数，参与webpack编译和生成。**

可以在apply方法中使用下面的代码注册钩子函数:

```javascript
class MyPlugin{
    apply(compiler){
        compiler.hooks.事件名称.事件类型(name, function(compilation){
            //事件处理函数
        })
    }
}
```

**事件名称**

即要监听的事件名，即钩子名，所有的钩子：https://www.webpackjs.com/api/compiler-hooks

**事件类型**

这一部分使用的是 Tapable API，这个小型的库是一个专门用于钩子函数监听的库。

它提供了一些事件类型：

- tap：注册一个同步的钩子函数，函数运行完毕则表示事件处理结束，类似于document.addEventListener
- tapAsync：注册一个基于回调的异步的钩子函数，函数通过调用一个回调表示事件处理结束
- tapPromise：注册一个基于Promise的异步的钩子函数，函数通过返回的Promise进入已决状态表示事件处理结束

**处理函数**

处理函数有一个事件参数`compilation`

**示例**

```javascript
module.exports = class MyPlugin{
  apply(compiler) {
    compiler.hooks.done.tap('Myplugin-done', function(compilation) {
      console.log('编译完成');
    })
  }
}
```

此时如果开启了watch，那么在第一次打包完成以及文件改变后打包完成都会执行注册的done钩子函数

# 如何自定义插件

**【总结】：plugin是如何被注册到webpack的生命周期中的呢？**

1. 在webpack函数的createCompiler方法中，注册所有的插件
2. 在注册插件时，会调用插件函数或者插件对象的apply方法
   1. 在内部是通过options.plugins拿到所有的插件，然后进行遍历。如果该插件是一个函数那么直接通过`plugin.call(compiler, compiler)`调取该函数；如果是一个对象，那么执行`对象.apply(compiler)`

3. 插件方法会接收compiler对象，**compiler对象提供了大量的钩子函数，**可以通过compiler对象来注册hook事件（某些插件也会传入compilation对象，也可以监听compilation对象的hook事件）

   1. 在Compiler类的构造函数中，创建了this.hooks对象，其中通过tapable库中提供的方法创建了各类型的hook：`this.hooks = { xx : new SyncHook(), yy: new AsyncSeriesHook() }`

   1. 所以可以通过比如`compiler.hooks.xx.tap()`来注册各事件

   1. 在webpack内部会在相应节点通过比如`compiler.hooks.xx.call()`来触发事件

现在通过分析，如果要自定义插件要进行如下操作：

- 提供一个拥有apply示例方法的类
- apply方法接收compiler对象，并通过该对象提供的相应的hook来注册事件
- 在配置webpack时，导入该类并实例化，传入到plugins数组中



# 案例

在输出打包后的资源文件时，多生成一个文件，文件内容为每个资源文件名称及其大小，比如：

```plain
【main.js】
4.3KB

【main.js.map】
3.7KB
```

**分析**

需要在asset输出之前多生成一个资源文件，那么可以使用emit钩子函数去完成这一需求

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1736758461256-9bda6bc3-1263-4cce-8630-759bb712e8e8.png)

```javascript
module.exports = class FileListPlugin {
  constructor(filename) {
    this.filename = filename
  }

  apply(compiler) {
    compiler.hooks.emit.tap('FileListPlugin', (compilation) => {
      const fileList = []
      // 从compilation.assets中获取到资源列表并读取，进行拼接
      for (const key in compilation.assets) {
        const content = `
          【${key}】
          大小: ${compilation.assets[key].size() / 1024}KB
        `
        fileList.push(content)
      }
      console.log('fileList', fileList)
      const str = fileList.join("\n\n")
      compilation.assets[this.filename] = {
        source() {
          return str
        },
        size() {
          return str.length
        }
      }
    })
  }
}
```

- 通过compilation.assets可以获取到最终输出到文件目录的资源列表信息，其中key为文件名称，key对应的是一个对象，该对象中的size方法可以获取到该文件的大小
- 向assets中加入新的文件内容即可，source方法要返回文件内容，size方法返回的是文件大小（这里返回字符串长度来代表）