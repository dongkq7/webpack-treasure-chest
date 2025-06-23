# 为什么要分包

如果不进行分包处理，通过入口进行分析后，所有使用到的内容都会打包到一起：

- 包括我们自己写的代码
- 包括使用到的第三方库的代码，比如：react vue axios dayjs lodash......
- 包括wenpack为了支持运行时的模块化打包进去的运行时代码

**这个时候就会出现一些问题：**

- **所有东西都放在一个包中不方便管理（不知道自己编写的代码在哪、第三方库的代码在哪、运行时代码又在哪）**
- **最主要的问题是打包到一起会造成bundle.js非常大，导致用户打开网页时下载js很慢，首屏渲染速度大大降低，导致长时间用户看到的是空白页面，此时就需要分包来优化首屏渲染速度（此外SSR也可以增加首屏渲染速度）**

代码分离（Code Splitting）是webpack一个非常重要的特性： 

它主要的目的是将代码分离到不同的bundle中，之后我们可以按需加载，或者并行加载这些文件。比如默认情况下，所有的JavaScript代码（业务代码、第三方依赖、暂时没有用到的模块）在首页全部都加载，就会影响首页的加载速度。

**代码分离可以分出更小的bundle，以及控制资源加载优先级，提供代码的加载性能**

# 有哪些方式

Webpack中常用的代码分离有三种： 

1. 入口起点：使用entry配置多入口来手动分离代码
2. 防止重复：使用Entry Dependencies或者SplitChunksPlugin去重和分离代码
3. 动态导入：通过模块的内联函数调用来分离代码，import('xxx')

# 1、多入口

## 基本处理方式

- 将entry配置为对象的形式，写多个入口
- 将output.filename使用占位符的方式来命名

```javascript
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  mode: 'development',
  devtool: false,
  entry: {
    index: './src/index.js',
    main: './src/main.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name]-bundle.js',
    clean: true,
  }
}
```

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1750394244774-f7ac5154-28bf-438f-bde5-bd5c7419aaa9.png)

## 多入口共享代码

假如多个入口中使用到了相同的依赖，比如axios，**如果不进行额外处理，那么打包的多个入口的bundle中都会包含axios的源码：**

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1750394508440-c6166c7f-f9f2-4299-8234-d0c49f3a7c9f.png)

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1750394518986-e6d86c26-2608-4a3e-b2d3-361092557824.png)

此时需要通过配置多入口的依赖来解决：

- 将入口的配置写成对象的方式，`import`来配置入口文件`dependOn`来配置依赖项

```javascript
entry: {
  index: {
    import: './src/index.js',
    dependOn: 'shared'
  },
  main: {
    import: './src/main.js',
    dependOn: 'shared'
  },
  shared: ['axios']
}
```

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1750394897829-d9a4c3fa-a4d0-4250-9fae-7a32cf3cf7d5.png)

# 2、动态导入

## 导入方式

**通过动态导入引入的模块不会打包到主包中，会单独进行分包**

比如，现在期望点击按钮来动态加载对应的内容，就很适合动态导入：

```javascript
/**
 * 动态导入
 */
const btn1 = document.createElement('button')
btn1.textContent = 'Home'
btn1.onclick = () => {
  import('./router/home')
}
document.body.appendChild(btn1)

const btn2 = document.createElement('button')
btn2.textContent = 'About'
btn2.onclick = () => {
  import('./router/about')
}
document.body.appendChild(btn2)
```

查看打包结果会发现，会将两个动态引入的js单独打包：

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1750396757426-b4f4d56d-6b31-4c5c-8564-233d5cca596e.png)

此时会发现打包后的index.html中只引入了main.bundle.js

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1750396801043-e30858ef-7698-4f80-b8bd-3da515ab23e2.png)

在访问index.html时，会发现只加载了main-bundle.js

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1750396860909-e2d68a87-1dc5-40e5-a79e-2fc7187b776c.png)

其余两个js会在点击对应按钮时去加载，这样就提升了首屏渲染速度

## 关于动态导入的命名

如果不进行配置，动态导入的文件的打包结果是将所在路径以及后缀名以`_`拼接命名的：

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1750397036778-71a5376a-38b9-4e4d-8783-95e6c76092f9.png)

可以通过`**output.chunkFilename**`单独对的分包的文件进行命名：

```javascript
output: {
  chunkFilename: '[name]-chunk.js',
}
```

然后结合动态导入中添加魔法注释修改动态导入文件名称来达到想要的效果：

```javascript
/**
 * 动态导入
 */
const btn1 = document.createElement('button')
btn1.textContent = 'Home'
btn1.onclick = () => {
  import(/* webpackChunkName: "home" */ './router/home')
}
document.body.appendChild(btn1)

const btn2 = document.createElement('button')
btn2.textContent = 'About'
btn2.onclick = () => {
  import(/* webpackChunkName: "about" */ './router/about')
}
document.body.appendChild(btn2)
```

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1750397429391-601724d6-202d-4b78-bf64-23db01624050.png)

### 补充

**import动态导入后可以拿到返回的module对象：**

- **通过module.xx可以拿到导出的内容**
- **通过module.default.xx可以拿到默认导出的内容**

```javascript
const h1 = document.createElement('h1')
h1.textContent = 'Home'
document.body.appendChild(h1)

export const homeFun = () => {
  console.log('homeFun')
}
const name = 'home'
export default {
  name
}
const btn1 = document.createElement('button')
btn1.textContent = 'Home'
btn1.onclick = () => {
  import(/* webpackChunkName: "home" */ './router/home').then(module => {
    module.homeFun()
    console.log(module.default.name)
  })
}
document.body.appendChild(btn1)
```

# 3、自定义分包

## SplitChunks

比如现在想要把使用到的第三方库进行单独打包处理，在打开页面时让该打包文件与主入口的打包文件进行并行下载。此时就需要通过`optimization.splitChunks`进行自定义分包。

**默认情况下,webpack仅仅会对异步引入的内容，也就是import动态导入的这种进行单独打包处理。也就是说对应的配置项**`**optimization.splitChunks.chunks**`**为**`**async**`**。**

**如果此时期望不仅仅对异步的内容进行单独打包，那么就要把**`**optimization.splitChunks.chunks**`**设置为**`**all**`**。**

```javascript
optimization: {
  splitChunks: {
    chunks: 'all',
  }
}
```

比如在入口文件中引入了react与axios，会发现这俩会被单独打到一个包里：

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1750398659317-6e183c0d-3877-4030-b37c-3f20b53d3dcd.png)

至此，会把所有第三方的依赖同一分在一个包里，如果想要进行进一步的处理，那么需要其他配置项来完成。

## maxSize

当包大于指定大小的时候，会继续进行分包。

## minSize

拆分的包的大小不小于minSize

## 自定义分组

通过`splitChunks.cacheGroups`来进行自定义分组，自定义来自哪里的内容进行如何分包，cacheGroups中是一个个键值对，其中key表示分组的名称，value对应的是该分组如何进行拆分

- value中的test为该组匹配的文件，比如`test:/[\\/]node_modules[\\/]/`匹配node_modules下的文件

需要注意，如果不加上斜杠，/node_modules/就会匹配到路径中包含node_modules，比如import xx from './abc_node_modules'这样也会匹配到。为了不产生这种歧义最好前后加上斜杠的匹配，又由于windows与mac上的斜杠不同，所以可能是`\`也可能是`/`，而`\`需要转义，所以就会写成`test:/[\\/]node_modules[\\/]/`

- value中的filename来自定义该分组拆分出来的包的名称

```javascript
optimization: {
  splitChunks: {
    chunks: 'all',
    // 为了测试分包效果（将utils下的两个文件打包到一起），所以设置minSize为10
    minSize: 10,
    cacheGroups: {
      vendors: {
        test: /[\\/]node_modules[\\/]/,
        filename: '[name]-vendors-bundle.js'
      },
      utils: {
        test: /utils/,
        filename: '[name]-utils-bundle.js'
      }
    }
  }
}
```

## 解决注释的单独提取

在`production`模式下，打包，会发现会额外多一个`xx.LICENSE.txt`文件，该文件是将所有第三方包里的注释提取了出来，这是因为有些注释上会有一些版权声明，所以webpack不知道是不是需要删除，所以就将这种又`copyright`的注释提取了下来。

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1750647621388-83990f06-3f28-42b4-b87d-977a71639a97.png)

实际上，当把模式改成production时，webpack会自动运用一个`TerserPlugin`插件来完成注释的提取，如果不需要这个注释提取的话，可以在`**optimization.minimizer**`中进行配置，该配置项是让代码更加简洁，可以对JS代码进行简化，也可以对CSS代码进行简化。

```javascript
optimization: {
  splitChunks: {
    //...
  },
  minimizer: [
   // 不对注释进行提取
    new TerserPlugin({
      extractComments: false
    })
  ]
}
```

## 命名问题解决

即使使用了相同的命名规则，会发现在development模式下与production模式下生成的产物名称不一致：

这是由于在不同模式下，设置的chunkId算法不同，通过`**optimization.chunkIds**`可以进行配置，

有三个比较常见的值： 

- natural：按照数字的顺序使用id，如果重新进行打包，那么数字就会进行改变，不利于浏览器缓存
- named：development下的默认值，一个可读的名称的id
- deterministic：确定性的，在不同的编译中不变的短数字id

- 在webpack4中是没有这个值的
- 那个时候如果使用natural，那么在一些编译发生变化时，就会有问题

补充：使用[name]占位符与[id]占位符生成的文件名的效果是一样的，chunkIds配置项也可以解决[name]占位符生成的文件名在不同模式下不一致的问题

最佳实践： 

- 开发过程中，我们推荐使用named
- 打包过程中，我们推荐使用deterministic

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1750648042121-8adea954-5ddb-400c-9303-ac59ed70b4a2.png)

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1750648016524-c7f08f60-5009-4fe2-afda-5e45b8a02e07.png)

## runtimeChunk

配置runtime相关的代码是否抽取到一个单独的chunk中： 

 runtime相关的代码指的是在运行环境中，对模块进行解析、加载、模块信息相关的代码

抽离出来后，有利于浏览器缓存的策略： 

 比如我们修改了业务代码（main），那么runtime和component、bar的chunk是不需要重新加载的

 比如我们修改了component、bar的代码，那么main中的代码是不需要重新加载的

设置的值： 

- true/multiple：针对每个入口打包一个runtime文件
- single：打包一个runtime文件
- 对象：name属性决定runtimeChunk的名称

目前脚手架中都会将runtime代码与主包代码打包到一起，这个配置项了解一下即可

# 4、Prefetch和Preload

webpack v4.6.0+ 增加了对预获取和预加载的支持

在声明 import 时，使用下面这些内置指令，来告知浏览器： 

- prefetch(预获取)：**将来某些导航下**可能需要的资源 
- preload(预加载)：**当前导航下**可能需要资源，这个资源是单独打包的并没有和主包一样在html中进行script的引入，但是这个资源又需要在当下使用到

与 prefetch 指令相比，preload 指令有许多不同之处： 

- preload chunk 会在父 chunk 加载时，以并行方式开始加载
- prefetch chunk 会在父 chunk 加载结束后开始加载
- preload chunk 具有中等优先级，并立即下载
- prefetch chunk 在浏览器闲置时下载
- preload chunk 会在父 chunk 中立即请求，用于当下时刻
- prefetch chunk 会用于未来的某个时刻

此时可以在import函数中加上魔法注释来实现：

```javascript
  import(
    /* webpackChunkName: "home" */
    /* webpackPrefetch: true */
    './router/home'
  ).then(module => {
    module.homeFun()
    console.log(module.default.name)
  })
```

# 5、CDN

## 什么是CDN

CDN称之为内容分发网络（Content Delivery Network或Content Distribution Network，缩写：CDN） 。它是指通过相互连接的网络系统，利用最靠近每个用户的服务器更快、更可靠地将音乐、图片、视频、应用程序及其他文件发送给用户来提供高性能、可扩展性及低成本的网络内容传递给用户。

在开发中，我们使用CDN主要是两种方式： 

- **方式一：打包的所有静态资源，放到CDN服务器， 用户所有资源都是通过CDN服务器加载的**
- **方式二：一些第三方资源放到CDN服务器上**

## 购买CDN服务器

如果所有的静态资源都想要放到CDN服务器上，我们需要购买自己的CDN服务器

- 目前阿里、腾讯、亚马逊、Google等都可以购买CDN服务器
- 我们可以直接修改`**publicPath**`，在打包时添加上自己的CDN地址

```javascript
output: {
  publicPath: 'https://abc.com/cdn/'
}
<script defer="defer" src="https://abc.com/cdn/index.bundle.js"></script>
```

## 第三方库的CDN服务器

通常一些比较出名的开源框架都会将打包后的源码放到一些比较出名的、免费的CDN服务器上： 

- 国际上使用比较多的是**unpkg、JSDelivr、cdnjs**
- 国内也有一个比较好用的CDN是**bootcdn**

在项目中，我们如何去引入这些CDN呢？ 

- 第一，在打包的时候我们不再需要对类似于lodash或者dayjs这些库进行打包
- 第二，在html模块中，我们需要自己加入对应的CDN服务器地址

1. **第一步，我们可以通过webpack配置，来排除一些库的打包**： 

- key代表要排除的框架的名称，对应的是导入的node_modules中的名称，`import ... from 'xx'`，就是这个xx
- value代表实际使用api时通过什么变量调取的，对应的是从CDN地址请求下来的js中提供的名称

```javascript
  externals: {
    axios: 'axios',
    lodash: '_'
  }
```

1. **第二步，在html模板中，加入CDN服务器地址**：

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>
<body>
  <div id="root"></div>
  <script src="https://cdn.bootcdn.net/ajax/libs/axios/1.9.0/axios.min.js"></script>
  <script src="https://cdn.bootcdn.net/ajax/libs/lodash.js/4.17.21/lodash.min.js"></script>
</body>
</html>
```

# 6、CSS提取

默认，CSS会被打到主包中。一般会使用`mini-css-extract-plugin`插件进行提取：

- filename是来配置对普通方式引入的css文件进行拆分后的名称
- chunkFilename是来配置通过import动态引入的css文件进行拆分后的名称

```javascript
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = {
  //...
  module: {
    rules: [
      //...
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          // 'style-loader',
          'css-loader'
        ]
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'css/[name]-bundle.css',
      // 对分包的css文件（通过import动态引入的css）进行命名
      chunkFilename: 'css/[name]-chunk.css'
    })
  ]
}
```

使用该插件时，就不再需要style-loader对css处理了，style-loader会使用js的方式创建style标签并将css代码放进去，然后插入到head中

所以这里要使用`MiniCssExtractPlugin.loader`，该loader是将css单独提取出来，然后通过link的方式在html中引入

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1750655760054-e9941ee4-20c5-48f6-a95e-7dc63563a979.png)

# 7、扩展-不同hash值的区别

在配置打包产物的文件名时，可以通过占位符的方式进行动态配置。占位符中可以使用hash值，其中包括`hash`、`contenthash`、`chunkhash`

1. `**hash**`**值的生成和整个项目有关系**： 比如我们现在有两个入口index.js和main.js，它们分别会输出到不同的bundle文件中，并且在文件名称中我们有使用hash，这个时候，如果修改了index.js文件中的内容，那么hash会发生变化
2. `**chunkhash**`可以有效的解决上面的问题，**它会根据不同的入口进行借来解析来生成hash值**。比如我们修改了index.js，那么main.js的chunkhash是不会发生改变的
3. `**contenthash**`**表示生成的文件hash名称，只和内容有关系**： 比如我们的index.js，引入了一个style.css，style.css有被抽取到一个独立的css文件中，这个css文件在命名时，如果我们使用的是chunkhash，那么当index.js文件的内容发生变化时，css文件的命名也会发生变化，这个时候我们可以使用contenthash，只要css内容不改变，那么contenthash就不会改变

# 8、关于DDL

DLL是什么呢？ 

DLL全程是动态链接库（Dynamic Link Library），是为软件在Windows中实现共享函数库的一种实现方式

那么webpack中也有内置DLL的功能，它指的是我们可以将能够共享，并且不经常改变的代码，抽取成一个共享的库，这个库在之后编译的过程中，会被引入到其他项目的代码中

DDL库的使用分为两步: 

第一步：打包一个DLL库

第二步：项目中引入DLL库

注意：在升级到webpack4之后，React和Vue脚手架都移除了DLL库（下面的vue作者的回复），所以知道有这么一个概念即可