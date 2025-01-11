为了对后面分析编译过程有帮助，以便于后续理解webpack的插件及加载器，对webpack编译结果进行分析，看一下编译之后的main.js中到底是什么？

假设自己来实现main.js，要如何来实现呢？

webpack要根据入口文件开始，寻找依赖关系，将依赖的文件合并成一个文件。（不考虑分包的情况）

- 所以要实现的就是将依赖的文件合并成一个文件并能正确输出结果

假设，有a.js与index.js，其中index.js作为入口文件依赖文件a：

a.js

```javascript
console.log('a')
module.exports = 'a'
```

index.js

```javascript
console.log('index')
var a = require('./a')
console.log(a)
```

那么就要实现一个main.js来将a.js与index.js进行合并，并依次输出index a a 

## 分析及实现

要合并a模块与index模块，并且合并结果里是没有commonjs以及es模块化的，合并后的结果只是普普通通的js代码。那么既然合并结果中没有模块化，又是如何保持不污染全局变量的呢？

那就是将模块中的代码放入一个函数中去执行。也就是每个模块都对应一个函数，函数中要执行的代码就是我们在模块中书写的代码。运行某个模块就相当于执行某个函数。

### step1

在执行模块对应代码的时候需要找到该模块对应的函数，所以可以将所有模块放到一个对象中。key为模块路径，因为模块路径是唯一的，模块中使用到的module、exports、require则可通过函数的参数进行传递，那么就有以下结构：

```javascript
var modules = {
  './src/a.js': function(module, exports) {
    console.log('a')
    module.exports = 'a'
  },
  './src/index.js': function(module, exports, require) {
    console.log('index')
    var a = require('./src/a.js')
    console.log(a)
  }
}
```

### step2

将模块进行合并成一个对象后，需要对该对象进行处理，那么就需要一个函数来处理这个对象。

防止全局变量的污染，那么就可以使用立即执行函数去处理这个对象，将这个对象传递进去：

```javascript
var modules = {
  './src/a.js': function(module, exports) {
    console.log('a')
    module.exports = 'a'
  },
  './src/index.js': function(module, exports, require) {
    console.log('index')
    var a = require('./src/a.js')
    console.log(a)
  }
}

(function(modules) {
  
})(modules)
```

定义var modules也可能会造成全局变量污染，所以就可以把对象直接传递进去：

```javascript
(function(modules) {
  
})({
  './src/a.js': function(module, exports) {
    console.log('a')
    module.exports = 'a'
  },
  './src/index.js': function(module, exports, require) {
    console.log('index')
    var a = require('./src/a.js')
    console.log(a)
  }
})
```

那么这个函数中，就要去执行入口文件，也就是index.js，执行入口文件就相当于require(./src/index.js)，所以要提供一个require函数去执行入口文件并拿到执行结果。

- 由于require函数接收文件路径，则可以通过该路径在modules对象中拿到对应函数去执行
- 执行函数时只需要传入module、exports、require即可
- 由于在模块中，会将导出的结果放入module.exports中，所以在执行完函数后，可通过module.exports去拿到对应结果

```javascript
(function(modules) {
  /**
   * 执行模块并拿到模块导出结果
   * @param {*} moduleId 模块路径
   */
  function require(moduleId) {
    var fun = modules[moduleId]
    var module = {
      exports: {}
    }
    fun(module, module.exports, require)
    // 执行完毕后则可以通过module.exports拿到导出结果
    var result = module.exports
    return result
  }
  // 执行入口文件
  require('./src/index.js')
})({
  './src/a.js': function(module, exports) {
    console.log('a')
    module.exports = 'a'
  },
  './src/index.js': function(module, exports, require) {
    console.log('index')
    var a = require('./src/a.js')
    console.log(a)
  }
})
```

### step3

模块是有缓存的，反复导入一个模块时，只运行一次。

那么就可以用一个对象来存放各模块的导出结果，在调取require时判断是否已经存在导出结果了，如果存在则直接返回，不存在则放入导出结果即可。

```javascript
// 存放模块导出结果，实现缓存
  var moduleExports = {}

/**
 * 执行模块并拿到模块导出结果
 * @param {*} moduleId 模块路径
 */
function require(moduleId) {
  if (moduleExports[moduleId]) {
    return moduleExports[moduleId]
  }
  var fun = modules[moduleId]
  var module = {
    exports: {}
  }
  fun(module, module.exports, require)
  // 执行完毕后则可以通过module.exports拿到导出结果
  var result = module.exports
  // 将结果放入缓存中
  moduleExports[moduleId] = result
  return result
}
```

在webpack中有个细节，为了避免require函数与node环境中的同名，使用了`__webpack_require`

### 关于eval

webpack的打包结果中，会使用eval来执行模块中的代码，这是为什么？

由于最终运行的代码是打包后的，会被合并起来，如果其中有代码执行错误，那么报错位置就会被定位到打包结果的文件中，不方便调试。

在使用eval时，浏览器会将错误信息放在单独的环境中显示，就方便了调试。其中，还能增加sourceURL注释来告诉浏览器错误代码的文件路径：

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1736592300946-8592d52e-3310-476c-bbbf-0067613e979b.png)