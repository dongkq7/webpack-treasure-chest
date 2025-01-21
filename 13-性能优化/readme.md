# 概述

性能优化主要体现在三个方面：

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1737097908171-08917a10-6550-4a7f-bdf2-91ffd07ddcca.png)

**构建性能**

这里所说的构建性能，是指在**开发阶段的构建性能（会频繁进行打包）**，而不是生产环境的构建性能（很少对生产环境进行打包）

优化的目标，**是降低 从打包开始，到代码效果呈现所经过的时间**

构建性能会影响开发效率。构建性能越高，开发过程中时间的浪费越少

**传输性能**

传输性能是指，打包后的JS代码放在了服务器上，传输到浏览器经过的时间

在优化传输性能时要考虑到：

1. 总传输量：所有需要传输的JS文件的内容加起来，就是总传输量，重复代码越少，总传输量越少
2. 文件数量：当访问页面时，需要传输的JS文件数量，文件数量越多，http请求越多，响应速度越慢
3. 浏览器缓存：JS文件会被浏览器缓存，被缓存的文件不会再进行传输

**运行性能**

运行性能是指，JS代码在浏览器端的运行速度

它主要取决于我们如何书写高性能的代码

**永远不要过早的关注于性能**，因为你在开发的时候，无法完全预知最终的运行性能，过早的关注性能会极大的降低开发效率

性能优化主要从上面三个维度入手

**性能优化没有完美的解决方案，需要具体情况具体分析。**有的时候想提高传输性能，就要牺牲构建性能等等。。。



# 一、提高构建性能（提高开发阶段的效率）

## 1、减少模块解析

### 什么叫做模块解析？

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1737101617704-432dab47-9090-416e-8c9f-91314a79e231.png)![null](assets/2020-02-13-16-26-41.png)

**模块解析包括：抽象语法树分析、依赖分析、模块语法替换**

### 不做模块解析会怎样？

![null](assets/2020-02-13-16-28-10.png)![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1737101625231-c32640ee-bee6-4cb9-b89b-773c706d2bb7.png)

如果某个模块不做解析，该模块经过loader处理后的代码就是最终代码。

如果没有loader对该模块进行处理，该模块的源码就是最终打包结果的代码。

如果不对某个模块进行解析，可以缩短构建时间

### 哪些模块不需要解析？

模块中无其他依赖：一些已经打包好的第三方库，比如jquery

### 如何让某个模块不要解析？

配置`module.noParse`，它是一个正则，被正则匹配到的模块不会解析

```javascript
module.exports = {
  mode: 'development',
  module: {
    noParse: /jquery/,
  }
}
```



![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1737104316286-e5e0c0c5-a9ee-43d2-87f2-85a6674da701.png)

可以发现不解析jquery模块后，构建速度有所提升。

## 2、优化loader性能

在减少了模块解析后，虽然不进行模块解析了但是还是会对模块进行loader的。接下来就是进一步限制loader的应用范围了。

### 进一步限制loader的应用范围

思路是：对于某些库，不使用loader

例如：babel-loader可以转换ES6或更高版本的语法，可是有些库本身就是用ES5语法书写的，不需要转换，使用babel-loader反而会浪费构建时间

lodash就是这样的一个库

lodash是在ES5之前出现的库，使用的是ES3语法

通过`module.rule.exclude`或`module.rule.include`，排除或仅包含需要应用loader的场景

```javascript
module.exports = {
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /lodash/,
                use: "babel-loader"
            }
        ]
    }
}
```

如果暴力一点，甚至可以排除掉`node_modules`目录中的模块，或仅转换`src`目录的模块

```javascript
module.exports = {
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                //或
                // include: /src/,
                use: "babel-loader"
            }
        ]
    }
}
```



### 缓存loader的结果（webpack4）

我们可以基于一种假设：如果某个文件内容不变，经过相同的loader解析后，解析后的结果也不变

于是，可以将loader的解析结果保存下来，让后续的解析直接使用保存的结果

`cache-loader`可以实现这样的功能（webpack4版本使用）

在初次构建由于要将内容读取出来进行缓存，缓存到文件中，进行了文件读写消耗了一定的时间，但是在后续构建就会变快了。

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        use: ['cache-loader', ...loaders]
      },
    ],
  },
};
```

有趣的是，`cache-loader`放到最前面，却能够决定后续的loader是否运行，这是为什么呢？

实际上，loader的运行过程中，还包含一个过程，即`pitch`

pitch是loader函数的一个静态属性，其是一个方法，可以返回一个内容，也可以不返回。

```javascript
function loader(source) {
  return `new source`
}

loader.pitch = function(path) {
  // 可以返回也可以不返回
}
```

实际上在执行laoder解析source code之前还会经过一个过程，这个过程会依次将path（文件路径）按loader配置顺序传递给loader的pitch函数，如果该loader的pitch函数中返回了内容那么就不接着将path向其他loader的pitch中传递了，而是直接让其前一个loader进行下一步处理。如果没有前一个loader那么直接结束整个流程。

![null](assets/2020-02-21-13-32-36.png)![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1737104447760-2ce8be05-768e-403d-86fb-5f224527b19c.png)



`cache-loader`还可以实现各自自定义的配置，具体方式见文档: https://www.npmjs.com/package/cache-loader

### 3、为loader的运行开启多线程

不开启多线程，loader是处理完一个js文件后再处理下一个js文件

`thread-loader`会开启一个线程池，线程池中包含适量的线程（不去进行配置，默认就是根据CPU的核来进行开启的）

它会把后续的loader放到线程池的线程中运行，以提高构建效率。

配置的时候将thread-loader放在需要开启多线程loader的前面即可。比如：

```javascript
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: "cache-loader",
            options:{
              cacheDirectory: "./cache"
            }
          },
          "thread-loader",
          "babel-loader"
        ]
      }
    ]
  }
```

这样就会对babel-loader开启多线程解析，由于cache-loader对代码是不进行解析的所以不需要对其开启多线程

由于后续的loader会放到新的线程中，所以，后续的loader不能：

- 使用 webpack api 生成文件（this.emitFile）
- 无法使用自定义的 plugin api
- 无法访问 webpack options

在实际的开发中，可以进行测试，来决定`thread-loader`放到什么位置

**特别注意**，开启和管理线程需要消耗时间，在小型项目中使用`thread-loader`反而会增加构建时间

在大型项目中如果将所有优化手段都做了，构建时间还是慢，那么可以尝试下thread-loader



## 3、热替换

准确来说热替换并不能降低构建（打包）时间（可能还会稍微增加），但可以降低代码改动到效果呈现的时间

当使用`webpack-dev-server`时，考虑代码改动到效果呈现的过程

![null](assets/2020-02-21-14-20-49.png)![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1737108695626-88ebf5f2-cf93-45b3-8408-f7945367f151.png)

当浏览器刷新重新请求时，请求的是所有资源，不管有没有变更过，如果是大型项目，资源很多，这样就浪费了时间。

有的时候也会遇到这种情况：需求是填写表单的内容，然后发现有一部分写错了，修改后重新保存代码，就会刷新页面，此时内容就会被清空，还得重新填写内容，降低了开发效率。



而使用了热替换后，流程发生了变化

![null](assets/2020-02-21-14-22-32.png)![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1737108699419-c0422fbc-35d3-453e-aa51-b556f5e15492.png)

类似于使用ajax请求改动的资源，这样的话页面就没有刷新，就不会请求所有的资源，就意味着页面上填写的内容还会被保留下来。提高了开发效率。

### 使用和原理

1. 更改配置

```javascript
module.exports = {
  devServer:{
    hot:true // 开启HMR
  },
  plugins:[ 
    // 可选，webpack4之后不写也会自动加上，所以如果webpack版本较新就可以不写
    new webpack.HotModuleReplacementPlugin()
  ]
}
```

1. 更改代码（在入口模块处添加如下代码）

```javascript
// index.js

if(module.hot){ // 是否开启了热更新
  module.hot.accept() // 接受热更新
}
```

首先，这段代码会参与最终运行！

当开启了热更新后，`webpack-dev-server`会向打包结果中注入`module.hot`属性

默认情况下，`webpack-dev-server`不管是否开启了热更新，当重新打包后，都会调用`location.reload`刷新页面

但如果运行了`module.hot.accept()`，将改变这一行为

`module.hot.accept()`的作用是让`webpack-dev-server`通过`socket`管道，把服务器更新的内容发送到浏览器

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1737108709709-cc529584-3620-49a5-9e72-bbd365dee468.png)



web socket可以让浏览器与服务器端建立持久的链接，这就意味着服务器端也可以主动发消息给浏览器端

- 当服务器端监听到文件改变并打包完成了，那么就会通过web socket发送个消息给客户端，那么客户端就location.reload刷新页面
- 那么如果开启热更新后，服务器一更新主动发消息给客户端，浏览器此时就会将结果交给插件处理，然后就会发送消息给服务器端更新了哪些数据，服务器端就会把更新的数据给客户端传递过去

![null](assets/2020-02-21-14-34-05.png)

然后，将结果交给插件`HotModuleReplacementPlugin`注入的代码执行

插件`HotModuleReplacementPlugin`会根据改变覆盖原始代码，然后让代码重新执行

**所以，热替换发生在代码运行期**

### 样式热替换

对于样式也是可以使用热替换的，但需要使用`style-loader`，不能使用`mini-css-extract-plugin`

因为热替换发生时，`HotModuleReplacementPlugin`只会简单的重新运行模块代码。

因此重新运行入口模块中的代码，那么`style-loader`的代码也会重新运行，就会重新设置`style`元素中的样式，这样样式就会更新了。

而`mini-css-extract-plugin`，由于它生成文件是在**构建期间**，运行期间并不会生成文件也无法改动文件，因此它对于热替换是无效的

# 二、提升传输性能

一方面是尽可能的让代码体积比较小

另一方面是将变动比较少的代码尽可能的抽离出去，单独存放一个文件，这样就可以重新利用浏览器缓存

## 1、分包

指的是将一个整体的代码，分不到不提供的打包文件中

### 什么时候分包

当多个chunk引入了公共模块，而且公共模块体积较大或有较少的变动

比如，都引入了jquery和lodash

分包有两种方式：手动分包和自动分包

### 1-1、手动分包

#### 原理

手动分包的总体思路是：

1. 先单独的打包公共模块

![null](assets/2020-02-24-13-24-57.png)![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1737354715216-c7895b8f-b01a-43bc-961f-b6a3768095a7.png)

公共模块会被打包成为动态链接库(dll Dynamic Link Library)，并生成资源清单

1. 根据入口模块进行正常打包

打包时，如果发现模块中使用了资源清单中描述的模块，则不会形成下面的代码结构

```javascript
//源码，入口文件index.js
import $ from "jquery"
import _ from "lodash"
_.isArray($(".red"));
```

由于资源清单中包含`jquery`和`lodash`两个模块，因此打包结果的大致格式是：

```javascript
(function(modules){
  //...
})({
  // index.js文件的打包结果并没有变化
  "./src/index.js":
  function(module, exports, __webpack_require__){
    var $ = __webpack_require__("./node_modules/jquery/index.js")
    var _ = __webpack_require__("./node_modules/lodash/index.js")
    _.isArray($(".red"));
  },
  // 由于资源清单中存在，jquery的代码并不会出现在这里
  "./node_modules/jquery/index.js":
  function(module, exports, __webpack_require__){
    // 直接将资源清单里暴露的全局变量导出
    module.exports = jquery;
  },
  // 由于资源清单中存在，lodash的代码并不会出现在这里
  "./node_modules/lodash/index.js":
  function(module, exports, __webpack_require__){
    module.exports = lodash;
  }
})
```

#### 打包公共模块

打包公共模块是一个**独立的**打包过程

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1737355043178-9db4f4d2-056b-41d6-999f-7c7e0c5cbcdf.png)

1. 单独打包公共模块，暴露变量名

```javascript
// webpack.dll.config.js
module.exports = {
  mode: "production", // 让打包出来的文件最小化
  entry: {
    jquery: ["jquery"],
    lodash: ["lodash"]
  },
  output: {
    filename: "dll/[name].js",
    library: "[name]" // 暴露出全局变量名
  }
};
```

1. 利用`DllPlugin`生成资源清单（每个chunk都会生成一个清单）

【注意】

清单文件保存在哪都可以，不需要保存在dist目录下，dist目录下的代码是最终参与运行的代码

而清单文件是不需要最终去运行的，只不过需要在打包过程中作为参考的

```javascript
// webpack.dll.config.js
module.exports = {
  plugins: [
    new webpack.DllPlugin({
      path: path.resolve(__dirname, "dll", "[name].manifest.json"), //资源清单的保存位置
      name: "[name]"//资源清单中，暴露的变量名
    })
  ]
};
```

运行后，即可完成公共模块打包

#### 使用公共模块

1. 在页面中手动引入公共模块

```html
<script src="./dll/jquery.js"></script>

<script src="./dll/lodash.js"></script>
```

1. 重新设置`clean-webpack-plugin`

如果使用了插件`clean-webpack-plugin`，为了避免它把公共模块清除，需要做出以下配置

```javascript
new CleanWebpackPlugin({
  // 要清除的文件或目录
  // 排除掉dll目录本身和它里面的文件
  cleanOnceBeforeBuildPatterns: ["**/*", '!dll', '!dll/*']
})
```

目录和文件的匹配规则使用的是[globbing patterns](https://github.com/sindresorhus/globby#globbing-patterns)

1. 使用`DllReferencePlugin`控制打包结果

```javascript
module.exports = {
  plugins:[
    new webpack.DllReferencePlugin({
      manifest: require("./dll/jquery.manifest.json")
    }),
    new webpack.DllReferencePlugin({
      manifest: require("./dll/lodash.manifest.json")
    })
  ]
}
```

#### 总结

**手动打包的过程**：

1. 开启`output.library`暴露公共模块
2. 用`DllPlugin`创建资源清单
3. 用`DllReferencePlugin`使用资源清单

**手动打包的注意事项**：

1. 资源清单不参与运行，可以不放到打包目录中
2. 记得手动引入公共JS，以及避免被删除
3. 不要对小型的公共JS库使用

**优点**：

1. 极大提升自身模块的打包速度
2. 极大的缩小了自身文件体积
3. 有利于浏览器缓存第三方库的公共代码

**缺点**：

1. 使用非常繁琐
2. 如果第三方库中包含重复代码，则效果不太理想，还得将依赖的其他库进行同样方式的打包

### 1-2、自动分包

与手动分包相比，手动分包可以极大提高构建效率，但是自动分包构建性能会降低。

但是自动分包可以提高开发效率，一旦有新模块引入不用去手动处理了。

#### 原理

不同与手动分包，自动分包是从**实际的角度**出发，从一个更加**宏观的角度**来控制分包，而一般不对具体哪个包要分出去进行控制

因此使用自动分包，不仅非常方便，而且更加贴合实际的开发需要

要控制自动分包，关键是要配置一个合理的**分包策略**

有了分包策略之后，不需要额外安装任何插件，webpack会自动的按照策略进行分包

实际上，webpack在内部是使用`SplitChunksPlugin`进行分包的
过去有一个库`CommonsChunkPlugin`也可以实现分包，不过由于该库某些地方并不完善，到了`webpack4`之后，已被`SplitChunksPlugin`取代

![null](assets/2020-02-24-17-19-47.png)

从分包流程中至少可以看出以下几点：

- 分包策略至关重要，它决定了如何分包
- 分包时，webpack开启了一个**新的chunk**，对分离的模块进行打包
- 打包结果中，公共的部分被提取出来形成了一个单独的文件，它是新chunk的产物

#### 分包策略的基本配置

webpack提供了`optimization`配置项，用于配置一些优化信息

其中`splitChunks`是分包策略的配置

```javascript
module.exports = {
  optimization: {
    splitChunks: {
      // 分包策略
    }
  }
}
```

事实上，分包策略有其默认的配置，我们只需要轻微的改动，即可应对大部分分包场景

1. chunks

该配置项用于配置需要应用分包策略的chunk

我们知道，分包是从已有的chunk中分离出新的chunk，那么哪些chunk需要分离呢

chunks有三个取值，分别是：

- all: 对于所有的chunk都要应用分包策略
- async：【默认】仅针对异步chunk应用分包策略
- initial：仅针对普通chunk应用分包策略

所以，你只需要配置`chunks`为`all`即可

1. maxSize

该配置可以控制包的最大字节数

如果某个包（包括分出来的包）超过了该值，则webpack会尽可能的将其分离成多个包

但是不要忽略的是，分包的**基础单位是模块**，如果一个完整的模块超过了该体积，它是无法做到再切割的，因此，尽管使用了这个配置，完全有可能某个包还是会超过这个体积

另外，该配置看上去很美妙，实际意义其实不大

因为分包的目的是**提取大量的公共代码**，从而减少总体积和充分利用浏览器缓存

虽然该配置可以把一些包进行再切分，但是实际的总体积和传输量并没有发生变化（有的浏览器支持并行下载，这样是有用的，但是有的浏览器并不支持并行下载）

如果要进一步减少公共模块的体积，只能是压缩和`tree shaking`

#### 分包策略的其他配置

如果不想使用其他配置的默认值，可以手动进行配置：

- automaticNameDelimiter：新chunk名称的分隔符，默认值-
- minChunks：一个模块被多少个chunk使用时，才会进行分包，默认值1
- minSize：当分包达到多少字节后才允许被真正的拆分，默认值30000（太小的文件没必要拆分出去，还得多一次请求）

#### 缓存组

之前配置的分包策略是全局的

而实际上，分包策略是基于缓存组的

每个缓存组提供一套独有的策略，webpack按照缓存组的优先级依次处理每个缓存组，被缓存组处理过的分包不需要再次分包

默认情况下，webpack提供了两个缓存组：

```javascript
module.exports = {
  optimization:{
    splitChunks: {
      //全局配置
      cacheGroups: {
        // 属性名是缓存组名称，会影响到分包的chunk名
        // 属性值是缓存组的配置，缓存组继承所有的全局配置，也有自己特殊的配置
        vendors: { 
          test: /[\\/]node_modules[\\/]/, // 当匹配到相应模块时，将这些模块进行单独打包
          priority: -10 // 缓存组优先级，优先级越高，该策略越先进行处理，默认值为0
        },
        default: {
          minChunks: 2,  // 覆盖全局配置，将最小chunk引用数改为2
          priority: -20, // 优先级
          reuseExistingChunk: true // 重用已经被分离出去的chunk
        }
      }
    }
  }
}
```

很多时候，缓存组对于我们来说没什么意义，因为默认的缓存组就已经够用了

但是我们同样可以利用缓存组来完成一些事情，比如对公共样式的抽离

```javascript
module.exports = {
  optimization: {
    splitChunks: {
      chunks: "all",
      cacheGroups: {
        styles: {
          test: /\.css$/, // 匹配样式模块
          minSize: 0, // 覆盖默认的最小尺寸，这里仅仅是作为测试
          minChunks: 2 // 覆盖默认的最小chunk引用数
        }
      }
    }
  },
  module: {
    rules: [{ test: /\.css$/, use: [MiniCssExtractPlugin.loader, "css-loader"] }]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: "./public/index.html",
      chunks: ["index"]
    }),
    new MiniCssExtractPlugin({
      filename: "[name].[fullhash:5].css",
      // chunkFilename是配置来自于分割chunk的文件名
      chunkFilename: "common.[hash:5].css" 
    })
  ]
}
```

## 2、代码压缩

分包只是把模块提出去，并不会对这些模块做单独处理。

对单模块体积优化可以进行代码压缩、tree shaking。

### 概述

1. **为什么要进行代码压缩**

减少代码体积；破坏代码的可读性，提升破解成本；

1. **什么时候要进行代码压缩**

生产环境

1. **使用什么压缩工具**

目前最流行的代码压缩工具主要有两个：`UglifyJs`和`Terser`

`UglifyJs`是一个传统的代码压缩工具，已存在多年，曾经是前端应用的必备工具，但由于它不支持`ES6`语法，所以目前的流行度已有所下降。

`Terser`是一个新起的代码压缩工具，支持`ES6+`语法，因此被很多构建工具内置使用。`webpack`安装后会内置`Terser`，当启用生产环境后即可用其进行代码压缩。

因此，我们选择`Terser`

### Terser

在`Terser`的官网可尝试它的压缩效果

Terser官网：https://terser.org/

### webpack+Terser

webpack自动集成了Terser

如果你想更改、添加压缩工具，又或者是想对Terser进行配置，使用下面的webpack配置即可

```javascript
const TerserPlugin = require('terser-webpack-plugin');
// const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
module.exports = {
  optimization: {
    // 是否要启用压缩，默认情况下，生产环境会自动开启，所以不需要设置
    // minimize: true, 
    minimizer: [ // 压缩时使用的插件，可以有多个
      new TerserPlugin(), 
      // new OptimizeCSSAssetsPlugin() // 对CSS进行压缩
      new CssMinimizerPlugin() // 对CSS进行压缩 webpack5中使用
    ],
  },
};
``
```

## 3、tree shaking

代码压缩是通过修改变量名、参数名、方法名、代码格式等让代码体积尽可能的缩小。

压缩可以移除模块内部的无效代码，但是tree shaking可以移除模块之间的无效代码。

### 背景

某些模块导出的代码并不一定会被用到

```javascript
// myMath.js
export function add(a, b){
  console.log("add")
  return a+b;
}

export function sub(a, b){
  console.log("sub")
  return a-b;
}
// index.js
import {add} from "./myMath"
console.log(add(1,2));
```

tree shaking 用于移除掉不会用到的导出

### 使用

```
webpack2`开始就支持了`tree shaking
```

只要是生产环境，`tree shaking`自动开启

### 原理

webpack会从入口模块出发寻找依赖关系

当解析一个模块时，**webpack会根据ES6的模块导入语句来判断**，该模块依赖了另一个模块的哪个导出

webpack之所以选择ES6的模块导入语句，是因为ES6模块有以下特点：

1. 导入导出语句只能是顶层语句
2. import的模块名只能是字符串常量
3. import绑定的变量是不可变的

这些特征都非常有利于分析出稳定的依赖

在具体分析依赖时，webpack坚持的原则是：**保证代码正常运行，然后再尽量tree shaking**

所以，如果你依赖的是一个导出的对象，由于JS语言的动态特性，以及`webpack`还不够智能，为了保证代码正常运行，它不会移除对象中的任何信息

因此，我们在编写代码的时候，**尽量**：

- 使用`export xxx`导出，而不使用`export default {xxx}`导出
- 使用`import {xxx} from "xxx"`导入，而不使用`import xxx from "xxx"`导入

依赖分析完毕后，`webpack`会根据每个模块每个导出是否被使用，标记其他导出为`dead code`，然后交给代码压缩工具处理

代码压缩工具最终移除掉那些`dead code`代码

### 使用第三方库

某些第三方库可能使用的是`commonjs`的方式导出，比如`lodash`

又或者没有提供普通的ES6方式导出

对于这些库，`tree shaking`是无法发挥作用的

因此要寻找这些库的`es6`版本，好在很多流行但没有使用的`ES6`的第三方库，都发布了它的`ES6`版本，比如`lodash-es`

### 作用域分析

`tree shaking`本身并没有完善的作用域分析，可能导致在一些`dead code`函数中的依赖仍然会被视为依赖

比如myMath中导出了一个依赖lodash的函数，但是在index.js中并没有使用：

```javascript
//myMath.js
import {chunk} from 'lodash-es'
export function add(a, b){
  console.log("add")
  return a+b;
}

export function sub(a, b){
  console.log("sub")
  return a-b;
}

export function myChunk() {
  console.log("chunk")
  return chunk([1,2,3,4,5,6,7,8], 2)
}

// index.js
import {add} from './myMath'
console.log(add(1, 2))
```

此时打包结果中还是将lodash的chunk打包了。

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1737425352344-22452af6-f429-49f1-a8b8-2cdb0d9d5cb4.png)

### 副作用问题

webpack在`tree shaking`的使用，有一个原则：**一定要保证代码正确运行**

在满足该原则的基础上，再来决定如何`tree shaking`

因此，当`webpack`无法确定某个模块是否有副作用时，它往往将其视为有副作用

因此，某些情况可能并不是我们所想要的

```javascript
//common.js
var n  = Math.random();

//index.js
import "./common.js"
```

虽然我们根本没用有`common.js`的导出，但`webpack`担心`common.js`有副作用，如果去掉会影响某些功能

如果要解决该问题，就需要标记该文件是没有副作用的

在`package.json`中加入`sideEffects`

```json
{
    "sideEffects": false
}
```

有两种配置方式：

- false：当前工程中，所有模块都没有副作用。注意，这种写法会影响到某些css文件的导入
- 数组：设置哪些文件拥有副作用，例如：`["!src/common.js"]`，表示只要不是`src/common.js`的文件，都有副作用

这种方式我们一般不处理，通常是一些第三方库在它们自己的`package.json`中标注

### css tree shaking

`webpack`无法对`css`完成`tree shaking`，因为`css`跟`es6`没有半毛钱关系

因此对`css`的`tree shaking`需要其他插件完成

例如：`purgecss-webpack-plugin`

注意：`purgecss-webpack-plugin`对`css module`无能为力

所以还是用到哪些样式写哪些样式比较好

## 4、懒加载

### 如何开启

页面一开始的时候可能不需要那么多js文件，很多时候是用户做了某些操作或者页面加载完才需要去做的，这个时候就可以考虑使用懒加载。

懒加载可以理解为异步的chunk。

比如有的模块需要点击按钮才去加载

```javascript
import { chunk } from 'lodash-es'
const btn = document.querySelector('button')
btn.onclick = function () {
  const result = chunk([1, 2, 3, 4, 5, 6, 7, 8], 2)
  console.log('result', result) 
}
```

如果这样写，就会直接被打包进去。

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1737426712326-960a9592-3e02-4c98-b63e-8ccafccb8db7.png)

此时可以采用es6的动态import。

```javascript
const btn = document.querySelector('button')
btn.onclick = async function () {
  const { chunk } = await import('lodash-es')
  const result = chunk([1, 2, 3, 4, 5, 6, 7, 8], 2)
  console.log('result', result) 
}
```

起初浏览器是不会去加载的：

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1737426771075-92dd8a28-03f1-4758-86c9-1d3d4f82972a.png)

点击按钮后才去加载：

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1737426811160-27398126-b7a2-45b4-b3c9-b86170d1566e.png)

如果想变更打包后的chunk名称，可以这样写：

```javascript
const { chunk } = await import(/* webpackChunkName:"lodash" */'lodash-es')
```

### 优化

由于是动态导入，所以没有tree shaking，因为动态导入只有在运行时才能确定依赖。就是因为没有静态导入。

此时如果想使用treeshaking怎么办？

此时可以把静态导入导出放入一个文件里，再通过动态导入该文件来实现。

```javascript
// utils.js
export { chunk } from "lodash-es"

// index.js
const btn = document.querySelector('button')
btn.onclick = async function () {
  // const { chunk } = await import(/* webpackChunkName:"lodash" */'lodash-es')
  const { chunk } = await import(/* webpackChunkName:"lodash" */'./utils')
  const result = chunk([1, 2, 3, 4, 5, 6, 7, 8], 2)
  console.log('result', result) 
}
```

## 5、gzip

gzip是一种压缩文件的算法

### B/S结构中的压缩传输

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1737429472876-7e5daa63-bdb6-4a3f-95d6-04c85173105a.png)

1. 浏览器根据accept-encoding告诉服务器端支持哪些压缩算法
2. 服务器端读取未压缩的文件，然后通过浏览器支持的压缩方式进行压缩，并通过content-encoding告诉浏览器使用的哪种压缩方式
3. 浏览器读取到压缩内容后进行解压

优点：传输效率可能得到大幅提升（对于较小的文件，压缩前后并没有减少多少反而会增加压缩和解压时间）

缺点：服务器的压缩需要时间，客户端的解压需要时间

### 使用webpack进行预压缩

使用`compression-webpack-plugin`插件对打包结果进行预压缩，可以移除服务器的压缩时间


![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1737429477962-67a6f233-d160-41a2-8e1c-616096a9f458.png)

1. 安装

npm install compression-webpack-plugin --save-dev

1. 配置

https://www.npmjs.com/package/compression-webpack-plugin

1. 使用

一般会保留原文件与压缩后的文件，需要服务器去配合，服务器端当检查有.gz文件的时候会将该文件发送给浏览器

# 三、其他

## ESLint

ESLint是一个针对JS的代码风格**检查**工具，当不满足其要求的风格时，会给予警告或错误

官网：https://eslint.org/

ESLint是用于代码风格检查，与webpack无关。

### 使用

ESLint通常配合编辑器使用

1. 在vscode中安装`ESLint`

该工具会自动检查工程中的JS文件

检查的工作交给`eslint`库，如果当前工程没有，则会去全局库中查找，如果都没有，则无法完成检查

另外，检查的依据是`eslint`的配置文件`.eslintrc`，如果找不到工程中的配置文件，也无法完成检查

1. 安装`eslint`

```
npm i [-g] eslint
```

1. 创建配置文件

可以通过`eslint`交互式命令创建配置文件

由于windows环境中git窗口对交互式命名支持不是很好，建议使用powershell

```
npx eslint --init
```

执行该命令的时候要有package.json文件并安装了eslint库

eslint会识别工程中的`.eslintrc.*`文件，也能够识别`package.json`中的`eslintConfig`字段

### 配置

#### env

配置代码的运行环境

- browser：代码是否在浏览器环境中运行
- es6：是否启用ES6的全局API，例如`Promise`等

#### parserOptions

该配置指定`eslint`对哪些语法的支持

- ecmaVersion: 支持的ES语法版本
- sourceType

- script：传统脚本
- module：模块化脚本

#### parser

`eslint`的工作原理是先将代码进行解析，然后按照规则进行分析

`eslint` 默认使用`Espree`作为其解析器，你可以在配置文件中指定一个不同的解析器。

#### globals

配置可以使用的额外的全局变量

```json
{
  "globals": {
    "var1": "readonly",
    "var2": "writable"
  }
}
```

`eslint`支持注释形式的配置，在代码中使用下面的注释也可以完成配置

```javascript
/* global var1, var2 */
/* global var3:writable, var4:writable */
```

#### extends

该配置继承自哪里

它的值可以是字符串或者数组

比如：

```json
{
  "extends": "eslint:recommended"
}
```

表示，该配置缺失的位置，使用`eslint`推荐的规则

#### ignoreFiles

排除掉某些不需要验证的文件

```
.eslintignore
dist/**/*.js
node_modules
```

#### rules

`eslint`规则集

每条规则影响某个方面的代码风格

每条规则都有下面几个取值：

- off 或 0 或 false: 关闭该规则的检查
- warn 或 1 或 true：警告，不会导致程序退出
- error 或 2：错误，当被触发的时候，程序会退出

除了在配置文件中使用规则外，还可以在注释中使用：

```javascript
/* eslint eqeqeq: "off", curly: "error" */
```

https://eslint.bootcss.com/docs/rules/

## bundle分析

1. 安装 webpack-bundle-analyzer

npm install webpack-bundle-analyzer --save-dev

1. 配置

```javascript
const WebapckBundleAnalyzer = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

module.exports = {
  mode: 'production',
  plugins: [
    new WebapckBundleAnalyzer()
  ]
}
```

1. 运行打包命令后，该插件会开启一个页面来显示打包情况

- Stat size表示没打包前的体积
- Parsed size表示打包后的尺寸
- Gzipped size表示经过gzip压缩后的尺寸

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1737429106607-273f95dc-25d0-475e-aadd-8d6a5053fbfe.png)