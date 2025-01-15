##  1、清除输出目录

一般bundle的文件名称会加上hash，如果文件内容变更的话，hash也会变化，但是此时原来的文件依旧会保留在打包目录中，还得手动删除比较麻烦。

此时就可以使用`clean-webpack-plugin`插件进行处理。

- 注意，需要正确指出output.path，输出的文件目录

1. 安装插件

npm install --save-dev clean-webpack-plugin

1. 使用

```javascript
const path = require('path')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
module.exports = {
  mode: 'development',
  devtool: 'source-map',
  output: {
    path: path.resolve(__dirname, 'dist'), // 确保配置了输出目录
    filename: '[name][chunkhash:6].js'
  },
  plugins: [new CleanWebpackPlugin()]
}
```

## 2、自动生成页面

一般打包后的js需要放在页面中去运行，webpack不会自动生成页面。此时需要插件去生成页面并自动将打包后的js引入。

1. 安装插件

 npm i --save-dev html-webpack-plugin

1. 使用

```javascript
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
module.exports = {
  mode: 'development',
  devtool: 'source-map',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name][chunkhash:6].js'
  },
  plugins: [
    new HtmlWebpackPlugin()
  ]
}
```

此时该插件会生成一个默认的html并引入打包后的js：

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1736838824221-02bff8d5-d8d8-49c9-b325-3cf44ed36133.png)

### 该插件常用配置

#### template

如果不想使用该插件默认生成的index.html，比如页面中包含其他内容，需要指定一个html模板，此时插件就会按照指定的模板去生成html。

一般会把模板页面放在pulic目录下

```javascript
module.exports = {
  //...
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html'
    })
  ]
}
```

#### chunks

如果项目是多入口的（包含多个chunk.js）。如果不配置chunks，插件生成的html中会将这些chunk的js文件都引入。

如果只想引入指定的js文件，那么就需要通过chunks配置项去告诉插件。

- 该配置项默认为'all'
- 可以配置成一个数组，将指定的chunk名称写入即可。

```javascript
const path = require('path')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
module.exports = {
//...
  entry: {
    home: './src/index.js',
    a: './src/a.js'
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      chunks: ['home']
    })
  ]
}
```

如果想生成多个html文件，每个html引入不同的chunk.js那么可以这样:

```javascript
const path = require('path')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
module.exports = {
  //...
  entry: {
    home: './src/index.js',
    a: './src/a.js'
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      filename: 'home.html',
      chunks: ['home']
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html',
      filename: 'a.html',
      chunks: ['a']
    })
  ]
}
```

此时就需要指定生成的html名称。

## 3、复制静态资源

比如现在页面上有一个图片

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>
<body>
  <img src="./imgs/webpack.png"/>
  <h1>这是一个模板页面</h1>
</body>
</html>
```

可以发现最终打包后，图片是展示不出来的。

**这是因为这个图片不是require引入然后通过js生成的，跟js是没有什么关系的，所以webpack在打包时分析依赖的时候并不会发现它，自然就不会打包过去。**

跟html-webpack-plugin也没什么关系，这个插件只是将页面作为模板来生成html的，不会解析其中的内容的。

此时就需要一个复制静态资源的文件，将静态资源输出到资源列表。

1. 安装

npm install copy-webpack-plugin --save-dev

1. 配置

```javascript
const CopyWebpackPlugin = require('copy-webpack-plugin')
module.exports = {
  //...
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: './public',
          to: './'
        }]
    })
  ]
}
```

该插件构造函数中接收一个个配置规则，告诉插件将那个目录下的静态资源(from)拷贝出来放到哪里(to)。

- 需要注意to属性是相对于dist目录的，如果静态资源直接放在dist下，to配置成`./`即可
- 这个插件对重复的静态资源进行了判断，如果使用了html-webpack-plugin生成了页面，同时静态资源目录下又存在html，是不会进行重复拷贝的。

## 4、开发服务器

在**开发阶段**，目前遇到的问题是打包、运行、调试过程过于繁琐，回顾一下操作流程：

1. 编写代码
2. 控制台运行命令完成打包
3. 打开页面查看效果
4. 继续编写代码，回到步骤2

并且，我们往往希望把最终生成的代码和页面部署到服务器上，来模拟真实环境

为了解决这些问题，webpack官方制作了一个单独的库：**webpack-dev-server**

它**既不是plugin也不是loader**

### 如何使用

1. 安装

npm install webpack-dev-server --save-dev

1. 执行`webpack-dev-server`命令

`webpack-dev-server`命令几乎支持所有的webpack命令参数，如`--config`、`-env`等等，可以把它当作webpack命令使用

**这个命令是专门为开发阶段服务的，真正部署的时候还是得使用webpack命令。**

注意，执行这个命令，不会进行真正的打包的。

当我们执行`webpack-dev-server`命令后，它做了以下操作：

1. 内部执行webpack命令，传递命令参数
2. 开启watch
3. 注册hooks：类似于plugin，webpack-dev-server会向webpack中注册一些钩子函数，主要功能如下：

1. 将资源列表（aseets）保存起来，保存到内存中
2. 禁止webpack输出文件

1. 用express开启一个服务器，监听某个端口，当请求到达后，根据请求的路径，给予相应的资源内容

**配置**

针对webpack-dev-server的配置，参考：https://www.webpackjs.com/configuration/dev-server/

常见配置有：

- **port**：配置监听端口



- **open**: 是否自动打开浏览器窗口，如果设置为true，启动开发服务器后会自动打开默认浏览器，也可以配置成数组来指定默认打开的页面https://www.webpackjs.com/configuration/dev-server/#devserveropen



- **proxy**：配置代理，常用于跨域访问

前端页面开发完成后往往会与服务端部署在同一域下，不会有跨域问题。**跨域问题往往会出现在开发阶段，开发阶段启动的是开发服务器，与接口地址不在同一域下，所以会产生跨域问题。**

这个时候就可以用此配置项让webpack将接口地址代理到指定域下。由于webpack是运行在node环境中的所以不会产生跨域问题，跨域问题是发生在浏览器端的。

```javascript
devServer: {
  port: 8082,
  open: true,
  proxy: [
    {
      context: ['/api'],
      target: 'http://localhost:3000', // 代理到的目标服务器地址
      pathRewrite: { '^/api': '' } ,// 不希望接口中有 /api
      changeOrigin: true // 改变请求头中的 host 和 origin
    }
  ]
},
```

需要注意的是，有时候服务器会检查请求头中的host。虽然代理改变了请求的目标地址，但是默认情况下不会去修改host的，比如我们访问的开发服务器地址为localhost:8082，那么此时host为localhost:8082，这样服务器就会校验不通过。

此时就需要加上`changeOrigin: true`来改变请求头中的host和origin



- stats：配置控制台输出内容，webpack5中使用的是devMiddleware.stats



往往会将命令写到package.json中

```json
"scripts": {
    "dev": "webpack-dev-server"
  },
```

**注意**

由于读取配置发生在初始化阶段，所以启动了devserver后修改了相关配置并不会生效，需要重新启动才行。



## 5、普通文件处理

### file-loader

如果现在有这样一个需求：根据某个条件动态来控制是否展示某个图片。那么此时可以这样：

```javascript
const imgSrc = require('./assets/webpack.png')

if (Math.random() < 0.5) {
  const img = new Image()
  img.src = imgSrc
  document.body.appendChild(img)
}
```

会发现此时打包会失败：

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1736847983305-36a5aa64-3f71-47c5-9796-219884bc541f.png)

这是因为webpack在模块解析时会将图片内容当成js文件内容去读取，由于图片内容是二进制的，webpack就无法识别这个内容并进行AST分析了，所以会报错。

那么就需要`file-loader`去处理：

- 该loader会生成一个具有相同文件内容的文件输出到目录并将生成的文件路径导出（使用的是ES6导出的：export default '文件路径'）

**安装**

npm install file-loader --save-dev

**使用**

```javascript
  module: {
    rules: [
      {
        test: /\.(png)|(jpg)|(gif)$/,
        use: ['file-loader']
      }]
  },
```

**注意**

由于file-loader中是按照esmodule的方式来导出的，如果文件使用cjs导入，那么后面要使用.default的方式来获取到其导出的文件名。

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1736848868959-ed9d8631-6f22-4296-805f-a0e7b94e40e6.png)

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1736848879938-62e8af7d-4428-471a-acc3-5e7a4b1f6807.png)

**file-laoder中的配置参数**

比如想指定生成文件的文件名并放入指定目录下（这个路径是相对于dist目录的）

```javascript
  module: {
    rules: [
      {
        test: /\.(png)|(jpg)|(gif)$/,
        use: [{
          loader: 'file-loader',
          options: {
            name: 'imgs/[name][contenthash:6].[ext]'
          }
        }]
      }]
  },
```

更多配置查看：https://www.npmjs.com/package/file-loader

### url-loader

将文件转换成base64格式。

1. 安装

npm install url-loader --save-dev

1. 使用

**相关参数**

- **limit 默认为false，不限制大小，将所有经过loader的文件都转成base64。**可以设置为number或者string，单位为字节，设置后，只要文件只要不超过这个数值择转成base64，如果超过则交给file-loader处理。一般会给个合适的数值，因为如果过多小文件转成文件的话会增加传输，如果过多大文件转成base64的话会增加代码体积。

```javascript
  module: {
    rules: [
      {
        test: /\.(png)|(jpg)|(gif)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 10 * 1024,
              name: 'imgs/[name][contenthash:6].[ext]'
            }
          }
        ]
      }]
  },
```

1. 更多配置https://www.npmjs.com/package/url-loader

## 6、解决路径问题

首先来理解下Web中的绝对路径和相对路径。

### 绝对路径和相对路径是用来干什么的

路径是用来找资源的，比如页面资源、js资源、css资源、图片资源。

每个资源都对应一个URL地址。

既然有了URL地址为什么还要有绝对路径和相对路径呢？

- 就是因为完整的URL地址写起来太麻烦了，所以才有了绝对路径和相对路径

**无论写的哪种路径，最终都会被转换成完整的URL（只有URL地址才能访问到资源）**

### 当前资源和目标资源

![img](https://cdn.nlark.com/yuque/0/2025/jpeg/22253064/1736907434789-1e102258-1f2d-4e4a-9171-10bbe8e8ec1b.jpeg)

比如在页面中要引入一张图片，那么页面就是当前资源，图片就是目标资源。通过书写一个路径，经过浏览器的自动处理就会变成一个完整的URL。

比如在CSS中引入背景图，CSS就是当前资源，目标资源就是图片。

### 绝对路径

**绝对路径：与当前资源的path无关**

比如：当前资源是http://a.com/news/detail?id=1#t1

以下书写方式都是绝对路径：

http://b.com/list  ===>   http://b.com/list

//b.com/list        ===>   http://b.com/list  省略协议的绝对路径，会采用当前资源的协议

/list                    ===>  http://a.com/list   省略协议域名端口的绝对路径，会采用当前资源的

/                        ===>  http://a.com/       与上面情况相同，只不过访问的是根路径

**可以看到绝对路径与当前资源的****path****是没有关系的**

绝对路径的使用场景如下：
1 站外资源只能使用绝对路径

**iconfont的css、站外图片、站外链接等**

2 当前资源和目标资源的相对位置不稳定或不明确，且目标资源的path是稳定的时，推荐绝对路径

**用户上传的图片地址、多地址的页面引入同一资源等（比如/news与news/index访问的是同一个页面）**

用户上传的图片往往是服务器端去动态生成的，如果要使用相对路径，那么意味着服务器端要为不同页面路径都要生成一个地址这是不现实的。

### 相对路径

**相对路径：相对于当前资源的path**

比如：当前资源是http://a.com/news/detail?id=1#t1

以下书写方式都是相对路径：

./list         ===>   http://a.com/news/list

../list        ===>   http://a.com/list 

list           ===>   http://a.com/news/list  这种方式等同于./list

?id=2       ===>   http://a.com/news/detail?id=2  这种方式就是以当前path为准直接拼接?id=2

\#t2          ===>    http://a.com/news/detail?id=1#t2

相对路径的使用场景如下：

当前资源和目标资源的相对位置稳定且明确（开发中大部分场景均使用）

### 打包后资源中的路径问题

### 为什么自动生成的html引入的js不会有问题

如果将js放入到scripts下，index.html为什么会正确引入呢？

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1736911723308-9a87abeb-d637-488f-8ea4-003795cdc32b.png)

这是因为html-webpack-plugin内部可以读取到资源列表中bundle.js的位置，所以会正确为我们引入。

### 为什么html引入的资源路径会有问题

比如file-loader的配置如下：

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1736913396986-c2ca780a-0595-4487-8b79-edd9477ccc0b.png)

最终打包后dist目录中就会出现imgs文件夹并放入图片资源，该loader处理好图片后就会输出"imgs/xxx.x"这样的相对路径供js代码使用。

此时js引入图片后，就会获取到url-loader export出来的资源相对路径。

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1736911894915-f0fb5902-2ad0-438c-bed7-8f1537f13b8a.png)

这个相对路径会变成一个完整的url地址，会相对于当前目标资源也就是启动的index.html页面的path进行拼接。

比如访问的index.html的url为：http://127.0.0.1/dist/index.html，那么这个图片资源的url为http://127.0.0.1/dist/imgs/webapckxx.png。

如果打包后的资源目录层级如下：

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1736912120293-55acbac7-bf3c-4d89-84ed-36970d61f8fc.png)

这样就会正确访问到这个图片资源。

但如果index.html外又套了一层呢？

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1736913470937-4f14ab20-0f89-415f-b4a8-37464088783b.png)

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1736913371991-32bd7ac9-3e32-4c45-99c4-b4ad0dfdb8a5.png)

会发现再次访问index.html就会找不到图片了。

这种问题发生的根本原因是：模块中的路径来自于某个loader或者plugin，当产生路径时，loader或者plugin只有相对于dist目录的路径，并不知道该路径将在哪个资源中使用，从而无法确定最终的正确路径。

由于输出的相对路径为 imgs/webpackxx.png，此时访问的当前资源为http://localhost:8082/home/index.html，那么最终资源url会变为 http://localhost:8082/home/imgs/webpackxx.png，所以访问不到了。

面对这种情况，需要依靠webpack的配置`**publicPath**`来解决。



打包结果中，会__webpack_require__提供一个属性p

- 这个publicPath属性是一个字符串，就是用来控制`__webpack_require__.p`的
- **该属性在旧版本webpack中默认是空字符串**

publicPath一般配置为'/'，这样imgs/webpackxx.png就会变为/imgs/webpackxxx.png，就是一个绝对路径了，比如页面资源地址为localhost:8082/home/index.html，那么该图片资源地址就会变为localhost:8082/imgs/webpackxx.png，这样就不会有问题了。

### 【注意】新版本webpack中不会有此问题的原因

新版本webpack中会对__webpack_require__.p进行处理：

### ![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1736922974115-cf211396-c8f5-40a9-8749-b84c53a06d7c.png)

脚本js所在路径 + ‘../’

在图片处理中，会将这个前缀进行拼接：

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1736923073687-96cee684-5666-4c67-9ea5-986225961b91.png)

所以获取到的图片资源路径最终会变成：

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1736923126800-3e663296-79c3-4007-90d7-352301c2be9a.png)

所以访问不会有问题



## 7、webpack内置插件

所有的webpack内置插件都作为webpack的静态属性存在的，使用下面的方式即可创建一个插件对象

```javascript
const webpack = require("webpack")

new webpack.插件名(options)
```

### DefinePlugin

全局常量定义插件，使用该插件通常定义一些常量值，例如：

```javascript
new webpack.DefinePlugin({
    PI: `Math.PI`, // PI = Math.PI
    VERSION: `"1.0.0"`, // VERSION = "1.0.0"
    DOMAIN: JSON.stringify("a.com")
})
```

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1736924677823-7e8796aa-87ae-4919-90d1-48f58f02cc3b.png)

注意：属性值需要是字符串，被解析时将会解析成这个字符串的值

这样一来，在源码中，我们可以直接使用插件中提供的常量，当webpack编译完成后，会自动替换为常量的值

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1736924655714-88304bfb-7b27-48a8-bca1-7c137ed9b512.png)

### BannerPlugin

它可以为每个chunk生成的文件头部添加一行注释，一般用于添加作者、公司、版权等信息

```javascript
new webpack.BannerPlugin({
  banner: `
  hash:[fullhash]
  chunkhash:[chunkhash]
  name:[name]
  author:xxx
  corporation:xxx
  `
})
```

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1736924726291-53fae577-c85c-491a-98fc-5865e7c7fafa.png)

### ProvidePlugin

自动加载模块，而不必到处 import 或 require 

```javascript
new webpack.ProvidePlugin({
  $: 'jquery',
  _: 'lodash'
})
```

然后在我们任意源码中：

```javascript
$('#item'); // <= 起作用
_.drop([1, 2, 3], 2); // <= 起作用
```