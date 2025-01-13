## plugin是干什么的

loader的功能定位是转换代码，而一些其他的操作难以使用loader完成，比如：

- 当webpack生成文件时，顺便多生成一个说明描述文件
- 当webpack编译启动时，控制台输出一句话表示webpack启动了
- 当xxxx时，要做xxxx...

这种类似的功能需要把功能嵌入到webpack的编译流程中，而这种事情的实现是依托于plugin的

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

apply函数会在初始化阶段，**创建好compiler对象后运行。**

compiler对象是在初始化阶段构建的，**整个webpack打包期间只有一个compiler对象**，后续完成打包工作的是compiler对象内部创建的**compilation**

apply方法会在**创建好compiler对象后调用**，并向方法传入一个compiler对象

![null](assets/2020-01-15-12-49-26.png)![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1736755153372-845e85c9-cdaa-4fc0-aa49-f0583f8a0c9e.png)

如果启动了watch，在文件变化时会重新进行打包，此时会重新生成一个compilation，不会重新生成compiler。compiler只会有一个，而compilation会有多个。

- 所以说apply方法只会在创建好compiler对象后运行一次。当文件内容变化时不会重新运行。因为apply是在初始化阶段compiler对象创建好后运行的，文件内容变化后重新生成的只有compilation对象，compiler对象是不变的。

既然apply方法只运行一次，为什么可以处理各个事件节点呢？

这就是因为apply方法中是去注册各个事件节点的钩子函数的，一旦发生了某个事件那么就会执行对应的函数。

compiler对象提供了大量的钩子函数（hooks，可以理解为事件），plugin的开发者可以注册这些钩子函数，参与webpack编译和生成。

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

## 案例

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