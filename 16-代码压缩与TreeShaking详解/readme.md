# 1、JS代码压缩

## Terser

默认情况下webpack对打包后的bundle.js并没有进行任何的压缩，之所以可以看到压缩后的效果，是因为它底层使用到了TerserPlugin（production模式下默认会配置上TerserPlugin）

Terser是一个JavaScript的解释（Parser）、Mangler（绞肉机）/Compressor（压缩机）的工具集，早期我们会使用 uglify-js来压缩、丑化我们的JavaScript代码，但是目前已经不再维护，并且不支持ES6+的语法。Terser是从 uglify-es fork 过来的，并且保留它原来的大部分API以及适配 uglify-es和uglify-js@3等。**也就是说，Terser可以帮助我们压缩、丑化我们的代码，让我们的bundle变得更小。**

### 基本使用

因为Terser是一个独立的工具，所以它可以单独安装：

```bash
npm i terser -D
# 可以使用如下命令进行压缩：
npx terser [input files] [options]
# terser js/foo.js -o foo.min.js -c arrows=true,dead_code=true -m toplevel=true
# -c 配置关于压缩的配置
# -m 配置关于命名等的配置
```

### 常见的compress与mangle配置

Compress option： 

- arrows：class或者object中的函数，转换成箭头函数，以减少代码量
- arguments：将函数中使用 arguments[index]转成对应的形参名称，比如代码里使用到了arguments[0]，对应的形参为num1，那么会将arguments[0]转换成num1
- dead_code：移除不可达的代码（tree shaking）

Mangle option 

- toplevel：默认值是false，顶层作用域中的变量名称，进行丑化（转换），比如将message变成o
- keep_classnames：默认值是false，是否保持依赖的类名称
- keep_fnames：默认值是false，是否保持原来的函数名称

更多配置查看文档：

- https://github.com/terser/terser#compress-options
- https://github.com/terser/terser#mangle-options

## Terser在webpack中的配置

真实开发中，我们不需要手动的通过terser来处理我们的代码，我们可以直接通过webpack来处理： 

在webpack中有一个`**minimizer**`属性，在production模式下，默认就是使用TerserPlugin来处理代码的

如果我们对默认的配置不满意，也可以自己来创建TerserPlugin的实例，并且覆盖相关的配置：

1. **首先，需要打开**`**minimize**`**，**让其对代码进行压缩，`minimize: true`，默认production模式下已经打开了。但是如果是development模式，不设置minimize: true，直接配置minimizer的话是不生效的。所以最好不管是不是在production模式下，只要需要自定义minimizer的话，都设置一下`minimize: true`



1. **其次，我们可以在**`**minimizer**`**创建一个TerserPlugin：** 

- `extractComments`：默认值为true，表示会将注释抽取到一个单独的文件中； 

- 在开发中，我们不希望保留这个注释时，可以设置为false



- `parallel`：使用多进程并发运行提高构建的速度，默认值是true 

-  并发运行的默认数量： os.cpus().length - 1
- 我们也可以设置自己的个数，但是使用默认值即可



- `terserOptions`：设置我们的terser相关的配置

- compress：设置压缩相关的选项
- mangle：设置丑化相关的选项，可以直接设置为true
- toplevel：顶层变量是否进行转换
- keep_classnames：保留类的名称
- keep_fnames：保留函数的名称

```javascript
const path = require('path')
const TerserPlugin = require('terser-webpack-plugin')
module.exports = {
  mode: 'development',
  devtool: false,
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'js/bundle.js',
    clean: true
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        extractComments: false,
        terserOptions: {
          compress: {
            arguments: true
          },
          mangle: true,
          keep_fnames: true,
        }
      })
    ]
  }
}
```

# 2、CSS压缩

CSS压缩通常是去除无用的空格等，因为很难去修改选择器、属性的名称、值等。CSS的压缩我们可以使用另外一个插件：`**css-minimizer-webpack-plugin**`**，**其底层使用的是cssnano来进行优化压缩CSS的，该工具也可以单独使用。

1. 首先进行安装

```bash
npm i css-minimizer-webpack-plugin -D
```

1. 在`**optimization.minimizer**`中进行配置

- 开启`parallel`来使用多核cpu来开启多进程压缩

```javascript
const path = require('path')
const TerserPlugin = require('terser-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
module.exports = {
  mode: 'development',
  devtool: false,
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'js/bundle.js',
    clean: true
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader'
        ]
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'css/[name]-bundle.css',
      chunkFilename: 'css/[name]-chunk.css'
    }),
    new CssMinimizerPlugin({
      // 开启多进程压缩
      parallel: true
    })
  ]
}
```

# 3、TreeShaking

## 什么是TreeShaking

Tree Shaking是一个术语，在计算机中表示消除死代码（dead_code），最早的想法起源于LISP，用于消除未调用的代码（纯函数无副作用，可以放心的消除，这也是为什么要求我们在进行函数式编程时，尽量使用纯函数的原因之一）后来Tree Shaking也被应用于其他的语言，比如JavaScript、Dart。

## JavaScript的TreeShaking

对JavaScript进行Tree Shaking是源自打包工具rollup。**这是因为Tree Shaking依赖于ES Module的静态语法分析（不执行任何的代码，可以明确知道模块的依赖关系）。**

- webpack2正式内置支持了ES2015模块，和检测未使用模块的能力
- 在webpack4正式扩展了这个能力，并且通过 package.json的 `sideEffects`属性作为标记，告知webpack在编译时，哪里的文件可以安全的删除掉
- webpack5中，也提供了对部分CommonJS的tree shaking的支持：（**所以在webpack中最好使用es module来使得更好的tree shaking**）https://github.com/webpack/changelog-v5#commonjs-tree-shaking

## webpack中实现JS的TreeShaking

事实上webpack实现Tree Shaking采用了两种不同的方案： 

- `**usedExports**`：通过**标记某些函数是否被使用**，之后通过Terser来进行优化的
- `**sideEffects**`：**跳过整个模块/文件，直接查看该文件是否有副作用**

默认情况下，如果使用了TerserPlugin，**会对入口文件中没有使用到的代码进行TreeShaking的，但是不会对使用到的模块中未使用到的东西进行TreeShaking，**比如，math.js中导出了sum与mul函数，但是在导入时只用到了sum函数没有使用到mul，但是打包后会发现mul函数也会被打包进去**：**

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1750664633198-81b8c125-6afe-445d-a701-3b742f3903e9.png)

注意，查看此效果需要在development模式下进行，因为production模式下默认会开启`usedExports`以及`minimize`

### usedExports

在开启了usedExports后（不使用minimize的情况下），进行打包会发现：![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1750664828097-51132283-0a7f-43a2-867e-386892c89565.png)

会增加一行注释`unused harmony export mul`，根据这个注释minimize就会知道哪些代码没有使用到，此时再配合`minimize: true`会发现，无用的mul函数被移除了：

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1750664978000-ad48f808-8614-47d7-a259-b60bc15a1c61.png)

**总得来说，usedExports开启后会分析导入模块中哪些函数有被使用到，哪些没有被使用到。将没有被使用到的函数通过注释标识出来，这样开启了Terser后，Terser会根据标识将无用的函数移除掉。**

### sideEffects

sideEffects不需要结合Terser也能完成TreeShaking。

开启usedExports后，结合Terser来进行优化，但是只会对没有使用到的函数进行TreeShaking，如果整个导入的模块都没有使用到，此时就需要通过`sideEffects`来进行进一步优化了。

比如现在在index.js中引入了utils/other.js，但是没有使用到任何内容

```javascript
import './css/index.css'
import { sum } from './utils/math'
import { other, name } from './utils/other'

sum(10, 20)

function foo() {
  console.log('foo')
}


// 无用代码
if (false) {
  foo()
}
```

此时打包时还会去保留：

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1750665826720-324ef9bc-a651-4a47-bc55-a92e5bee8e34.png)

此时可以通过在package.json中增加如下配置，来告诉webpack所有的模块都没有副作用

```javascript
{
  "sideEffects": false,
  "scripts": {
    "build": "webpack"
  }
}
```

再次打包会发现，产物中没有关于other.js的内容了：

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1750665850459-22dbaaaf-001e-46a5-8f86-9c38c29e1053.png)

但是这样的配置仅针对所有模块都没有副作用的情况，比如other.js中有一段副作用代码：`window.other='abc'`，如果通过这种方式Treeshaking后，在其他模块中就没有办法使用window.other了，那么就可以通过如下方式来配置，哪些模块有副作用：

```javascript
"sideEffects": ["./src/utils/other.js"]
```

对于css文件来说，我们会通过import "xxx.css"的方式引入，如果开启了sideEffects，那么css也会被移除，此时可以针对css进行排除：

```javascript
"sideEffects": ["*.css"],
```

## webpack中实现CSS的TreeShaking

CSS的Tree Shaking需要借助于一些其他的插件

在早期的时候，我们会使用PurifyCss插件来完成CSS的tree shaking，但是目前该库已经不再维护了（最新更新也是在4年前了） 

目前我们可以使用另外一个库来完成CSS的Tree Shaking：`**PurgeCSS**`，也是一个帮助我们删除未使用的CSS的工具

1. 安装

```bash
npm i purgecss-webpack-plugin -D
```

1. 使用

- 需要安装glob依赖来配合配置paths路径，使得src下的任意目录下的文件匹配，nodir:true表示不匹配目录
- safelist用来配置不需要移除的属性，比如body与html

```javascript
const glob = require('glob')
const { PurgeCSSPlugin } = require("purgecss-webpack-plugin")

module.exports = {
  //...
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'css/[name]-bundle.css',
      chunkFilename: 'css/[name]-chunk.css'
    }),
    new PurgeCSSPlugin({
      paths: glob.sync(`${path.resolve(__dirname, 'src')}/**/*`, { nodir: true }),
      safelist: {
        deep: [/html/, /body/]
      }
    })
  ]
}
```

# 4、作用域提升

将多个模块中的内容合并到一个模块中，以提升代码执行速度。

- production模式下会自动开启
- development模式下需要通过如下方式进行开启：

```javascript
const webpack = require('webpack')
module.exports = {
  mode: 'development',
  //...
  plugins: [
    // 作用域提升
    new webpack.optimize.ModuleConcatenationPlugin()
  ]
}
```

可见开启后，三个模块会合并为一个模块：

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1750667817318-b9e63f06-6364-43cc-b493-ba0762403cbe.png)

# 5、HTTP压缩

通过以上的方式对代码进行了压缩与优化，接下来还可以进一步进行压缩，比如通过gzip压缩算法对文件压缩，比如将main-bundle.js压缩成main-bundle.js.gz。浏览器在拿到压缩后的文件后会自动进行解压并执行相关代码。

HTTP压缩是一种内置在服务器和客户端之间的，以**改进传输速度和带宽利用率的方式**。

HTTP压缩的流程什么呢？ 

1. 第一步：HTTP数据在服务器发送前就已经被压缩了（可以在webpack中完成），也就是说部署到服务器端的是压缩后的代码
2. 第二步：兼容压缩格式的浏览器在向服务器发送请求时，会告知服务器自己支持哪些压缩格式

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1750668727133-45fdb2de-fc17-41d3-a4f0-8c036d975f06.png)

1. 第三步：服务器在浏览器支持的压缩格式下，直接返回对应的压缩后的文件，并且在响应头中告知浏览器

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1750668743075-67af6076-f224-467b-9ca2-b87bcf8bd837.png)

目前的压缩格式非常的多： 

- compress – UNIX的“compress”程序的方法（历史性原因，不推荐大多数应用使用，应该使用gzip或deflate
- deflate – 基于deflate算法（定义于RFC 1951）的压缩，使用zlib数据格式封装
- gzip – GNU zip格式（定义于RFC 1952），是目前使用比较广泛的压缩算法
- br – 一种新的开源压缩算法，专为HTTP内容的编码而设计

## js与css的压缩

需要使用到CompressionPlugin

1. 安装

```bash
npm i compression-webpack-plugin -D
```

1. 使用

- `test` 匹配要压缩哪些文件
- `minRatio` 配置压缩比例，也就是压缩后至少减少多少才进行压缩，因为如果本身文件太小就没有必要进行压缩了
- `algorithm` 采用的压缩算法

```javascript
const CompressionPlugin = require('compression-webpack-plugin')
module.exports = {
  //...
  plugins: [
    // 压缩
    new CompressionPlugin({
      test: /\.(css|js)$/,
      minRatio: 0.7,
      algorithm: 'gzip'
    })
  ]
}
```

## html文件的压缩

默认情况下，在production模式下会对html文件进行压缩，之所以可以压缩是HTMLWebpackPlugin实现的，

可以通过该插件的`minify`来进行配置：

- false不开启压缩
- auto在production模式下开启压缩
- 也可以进行自定义：

```javascript
const path = require('path')
const TerserPlugin = require('terser-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const webpack = require('webpack')
const CompressionPlugin = require('compression-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  mode: 'development',
  //...
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
      minify: {
        // 移除注释
          removeComments: true,
          // 移除属性
          removeEmptyAttributes: true,
          // 移除默认属性
          removeRedundantAttributes: true,
          // 折叠空白字符
          collapseWhitespace: true,
          // 压缩内联的CSS
          minifyCSS: true,
          // 压缩JavaScript
          minifyJS: {
            mangle: {
              toplevel: true
            }
          }
      }
    })
  ]
}
```

# 6、打包分析

## 分析打包时间

1. 安装speed-measure-webpack-plugin插件

```bash
npm i speed-measure-webpack-plugin -D
```

1. 使用

- 实例化插件对象，并通过对象中的wrap方法包裹webpack配置文件

```javascript
const SpeedMeasurePlugin = require('speed-measure-webpack-plugin')

const smp = new SpeedMeasurePlugin()


module.exports = smp.wrap({
//...
})
```

## 打包后文件分析

1. 安装webpack-bundle-analyzer工具

```bash
npm i webpack-bundle-analyzer -D
```

1. 使用

```javascript
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

module.exports = {
  //...
  plugins: [
    //...
    new BundleAnalyzerPlugin()
  ]
}
```

在打包webpack的时候，这个工具是帮助我们打开一个8888端口上的服务，我们可以直接的看到每个包的大小：

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1750671733718-b275ffce-7c04-4043-805f-b31178b48720.png)