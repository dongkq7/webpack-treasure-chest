## context

```javascript
context: path.resolve(__dirname, "src")
```

该配置会影响入口和loaders的解析，入口和loaders的相对路径会以context的配置作为基准路径，这样，你的配置会独立于CWD（current working directory 当前执行路径）。



比如多个入口都是在src下的，那么可以将相对路径设置为当前js文件下的src，那么entry中的各入口模块就可以不用写成./src/index.js这种了，直接./index.js即可：

```javascript
var path = require('path')
module.exports = {
  mode: 'development',
  entry: {
    index: './index.js',
    a: './a.js'
  },
  context: path.resolve(__dirname, 'src'),
}
```

配置的context也会影响loaders配置中的路径

## output

### library

```javascript
library: "abc"
```

这样一来，打包后的结果中，会将自执行函数的执行结果暴露给abc ，相当于暴露出了一个abc变量，其值就是打包后最终的导出结果。

index.js:

```javascript
module.exports = 'Hello Webpack'
```

webpack.config.js:

```javascript
var path = require('path')
module.exports = {
  mode: 'development',
  entry: {
    index: './index.js'
  },
  context: path.resolve(__dirname, 'src'),
  output: {
    library: 'abc'
  }
}
```

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1736762929124-c77bdea4-4334-441c-919d-8565210afd56.png)

在index.html中引入最终打包好的js后，在控制台中就可以直接访问全局变量abc来获取到导出的结果了：

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1736762996935-2de4b855-a607-4fb7-a628-2c92928297fe.png)

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1736763046850-ce796b20-eec7-4738-ac55-403e401ec00b.png)

这种一般在以下两种情况用的到：

- 与某些插件配合，一些插件可能需要我们将打包结果暴露出去供它使用
- 开发的项目最终要打包成库供其他开发者使用，在传统开发模式中，引入你写的库打包后的js，就可以通过你暴露的全局变量来使用，比如：

<script src="./xxx.js"></script>

<script>

  abc()

</script>

### libraryTarget

```javascript
libraryTarget: "var"
```

该配置可以更加精细的控制如何暴露入口包的导出结果，**与library配合使用。**

- library用来控制暴露的变量的名称
- libraryTarget用来控制怎么暴露出去

#### 注意

未来webpack很有可能废弃libraryTarget

建议使用output.library.type来配置:

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1736824745011-1465b6c6-d717-4ad0-a4dc-ae7150fd9f78.png)

其他可用的值有：

- var：默认值，暴露给一个普通变量
- window：暴露给window对象的一个属性
- this：暴露给this的一个属性
- global：暴露给global的一个属性
- commonjs：暴露给exports的一个属性
- 其他：https://www.webpackjs.com/configuration/output/#output-librarytarget

## target

```javascript
target:"web" //默认值
```

设置打包结果最终要运行的环境，**webpack在打包解析依赖的时候就会用target配置的环境去解析，**常用值有

- web: 打包后的代码运行在web环境中
- node：打包后的代码运行在node环境中
- 其他：https://www.webpackjs.com/configuration/target/

比如在index.js中依赖了node环境的fs模块，如果target为web那么webpack在打包解析依赖时会报错，因为找不到fs模块。

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1736825002244-58060ee0-e995-43f0-84ac-e6f50658dcb2.png)

但如果配置成target: 'node'，那么就会成功解析依赖。会发现在对fs模块解析的时候发现时node环境的内置模块，那么就会直接require该内置模块并导出：

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1736825047731-2d67995b-4a7a-4c40-87d3-fbe2cbc134f7.png)

## module.noParse

```javascript
 module: {
    noParse: /jquery|lodash/,
  }
```

不解析正则表达式匹配的模块，通常用它来忽略那些大型的单模块库，以提高**构建性能。**

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1736825943534-f5739998-1152-4e4d-829c-0648da354fcd.png)

一旦有模块符合匹配规则，那么在解析该模块的时候会将该模块中的文件内容直接读取出来原封不动的放入到模块记录列表中，**不会对该模块中的代码进行语法分析，也不会去分析该模块中的依赖，也不会去替换其中的依赖函数。**

**使用场景：**

比如编写的js依赖jquery，会发现jquery的package.json中的入口指向的是打包后的jquery文件。

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1736826044458-c77b21a9-3614-4a61-a036-adcb616ee7f8.png)

这样的话在使用jquery就没有必要再对其进行语法分析、读取依赖等操作了。这样就会影响webpack打包效率（对其做语法分析是很耗时的）。直接将打包结果读取出来即可。那么此时就可以使用noParse来跳过对该模块的解析。

这里的配置只是会影响webpack打包的性能，不会影响代码运行的性能。如果不在意那可以忽略。

## resolve

resolve的相关配置主要用于控制模块解析过程。

### modules

如果某个模块依赖了另一个模块，当使用webpack打包时，webpack会根据抽象语法树分析模块的依赖，遇到require(...)，默认情况下会按照node的查找规则去查找。**（注意，打包时，依赖是webpack去查找的，而不是node，因为打包不是去运行代码，而是webpack根据抽象语法树去分析依赖，然后去查找依赖）**

- **webpack有一套自己的查找方式，只不过，默认情况下，和node的查找方式是一样的。**

比方说在index.js中有如下代码：

if (Math.random() < 0.5) {

   require('./a')

}

打包结果中一定是有a模块的，这是因为webpack不管执行结果最终是什么，只看AST的分析，发现依赖了某个模块时就会将该模块加入到模块列表中。

```javascript
modules: ["node_modules"]  //默认值，该数组表示模块的查找位置
```

当解析模块时，如果遇到导入语句，```require("test")```，webpack会从下面的位置寻找依赖的模块

1. 当前目录下的```node_modules```目录
2. 上级目录下的```node_modules```目录
3. ...

### extensions

```javascript
extensions: [".js", ".json", '.vue', '.css', '.jsx']  // 默认值:extensions['.js', '.json']
```

当解析模块时，遇到无具体后缀的导入语句，例如```require("test")```，webpack会根据`extensions`配置，依次测试它的后缀名

- test.js
- test.json

### alias

```javascript
alias: {
  "@": path.resolve(__dirname, 'src'),
  "_": __dirname
}
```

有了alias（别名）后，导入语句中可以加入配置的键名，例如```require("@/abc.js")```，webpack会将其看作是```require(src的绝对路径+"/abc.js")```。

在大型系统中，源码结构往往比较深和复杂，别名配置可以让我们更加方便的导入依赖

## externals

```javascript
externals: {
    jquery: "$", // 告诉webpack遇到jquery，直接导出$即可
    lodash: "_" // 告诉webpack遇到lodash，直接导出_即可
}
```

从最终的bundle中排除掉配置的配置的源码，例如，入口模块是

```javascript
//index.js
require("jquery")
require("lodash")
```

生成的bundle是：

```javascript
(function(){
    ...
})({
    "./src/index.js": function(module, exports, __webpack_require__){
        __webpack_require__("jquery")
        __webpack_require__("lodash")
    },
    "jquery": function(module, exports){
        //jquery的大量源码
    },
    "lodash": function(module, exports){
        //lodash的大量源码
    },
})
```

但是jquery与lodash使用传统的cdn导入，那么就不需要将jquery与lodash合并到打包文件中，比如：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>
</head>
<body>
    <!-- $ -->
    <script src="https://cdn.bootcss.com/jquery/3.4.1/jquery.js"></script>
    <!-- _ -->
    <script src="https://cdn.bootcss.com/lodash.js/4.17.15/lodash.core.min.js"></script>
    <script src="./index.js"></script>
</body>
</html>
```

其中jquery会暴露一个$全局变量供我们使用

lodash会暴露一个_全局变量供我们使用

此时就需要配置externals，有了该配置后，则变成了：

```javascript
(function(){
    ...
})({
    "./src/index.js": function(module, exports, __webpack_require__){
        __webpack_require__("jquery")
        __webpack_require__("lodash")
    },
    "jquery": function(module, exports){
        module.exports = $;
    },
    "lodash": function(module, exports){
        module.exports = _;
    },
})
```

这比较适用于一些第三方库来自于外部CDN的情况，这样一来，即可以在页面中使用CDN，又让bundle的体积变得更小，还不影响源码的编写。

不影响页面的require：

```javascript
var _ = require('lodash')
// 或者 var xxx = require('lodash') 都可以，这个xxx就是lodash的全局变量_
console.log(_)
```

## stats

stats控制的是构建过程中控制台的输出内容，比如：

```javascript
stats: {
    colors: true, // 显示显色
    modules: false // 不显示构建的模块详细信息
  }
```

更多配置，查看：https://www.webpackjs.com/configuration/stats/#stats