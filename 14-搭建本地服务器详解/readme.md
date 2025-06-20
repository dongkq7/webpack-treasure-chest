# 为什么需要搭建本地服务器

目前我们开发的代码，为了运行需要有两个操作： 

操作一：npm run build，编译相关的代码

操作二：通过live server或者直接通过浏览器，打开index.html代码，查看效果

这个过程经常操作会影响我们的开发效率，我们希望可以做到，当文件发生变化时，可以自动的完成编译和展示

为了完成自动编译，webpack提供了几种可选的方式： 

- webpack watch mode（很少用）

-  **webpack-dev-server（常用）**

- webpack-dev-middleware（很少用）

# webpack-dev-server的基本使用

1. 安装

```bash
npm i -D webpack-dev-server
```

1. 添加相关脚本

```json
"scripts": {
  "serve": "webpack serve"
}
```

webpack-dev-server 在编译之后不会写入到任何输出文件，而是将 bundle 文件保留在内存中 

事实上webpack-dev-server使用了一个库叫memfs（早期使用的是memory-fs，webpack自己写的）

# 使用静态资源

有时候需要在index.html中引入一些静态资源，比如：

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
  <script src="./script/aaa.js"></script>
</body>
</html>
```

但是当启动本地服务器的时候，会发现报了如下错误：（找不到该静态资源）

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1750386300671-cb347008-756a-4950-a1d4-0053bc31a91a.png)

怎么办呢？**实际上本地服务器在遇到html中引入的静态资源时，会自动去项目启动目录（一般是项目根目录）下的public文件夹下去找，**会发现如果引入的是public下的静态资源就不会报错了，**需要注意此时引入的静态资源前面不需要加**`./public`**本地服务器会自动去找**：

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1750386072447-6c5925d9-c3c5-42d7-9f91-40eded7e5922.png)

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1750386086340-bca160c6-b220-4c13-9da2-4dd70dfc0062.png)

如果想让webpack的本地服务器可以去找其他目录下的静态资源怎么办呢？那就需要通过`**devServer.static**`配置项去配置了：

```javascript
devServer: {
  static: ['public', 'script']
}
```

此时html中就可以这样引入静态资源了：

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
  <script src="./aaa.js"></script>
  <script src="./abc.js"></script>
</body>
</html>
```

# 其他配置项

## host

默认为是localhost，可以配置为`0.0.0.0`，如果想通过手机访问ip以及想让同一网段下的其他用户通过ip访问到，那么就需要设置为`0.0.0.0`

## open

设置编译成功后是否自动打开浏览器

## compress

是否做压缩，如果开启了压缩，会发现bundle.js的`Content-Encoding: gzip`浏览器拿到的资源是通过gzip压缩后的，此时浏览器会自动解压，gzip会将资源文件体积缩小

# proxy代理配置

## 基本使用

**如果访问的服务器存在跨域，那么在开发阶段都需要通过proxy代理配置进行解决。**

比如现在搭建了一个服务器，启动在3000端口上：

```javascript
const Koa = require('koa')
const Router = require('@koa/router')

const app = new Koa()
const router = new Router({
  prefix: '/users'
})

router.get('/', (ctx) => {
  ctx.body = {
    code: 0,
    data: [
      { id: 1, name: 'John' },
      { id: 2, name: 'Jane' },
      { id: 3, name: 'Jim' },
    ]
  }
})

app.use(router.routes())
app.use(router.allowedMethods())

app.listen(3000, () => {
  console.log('Server is running on port 3000')
})
```

在本地服务器中的index.js中去访问该接口

```javascript
import axios from 'axios'

axios.get('http://localhost:3000/users').then(res => {
  console.log(res)
})
```

由于本地服务器启动在8080端口上，访问3000端口的接口会出现跨域问题：

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1750387668469-b7f39f1b-8a15-451e-aac3-45c3f40a9d77.png)

此时就可以通过代理服务器去解决，由于代理服务器与本地服务器是跑在同一个端口下的，所以请求代理服务器不会有跨域问题，再由代理服务器去帮我们转发到目标服务器上即可

```javascript
devServer: {
  static: ['public', 'script'],
  proxy: [
    {
      context: ['/api'],
      target: 'http://localhost:3000',
      pathRewrite: {
        '^/api': ''
      }
    },
    // 可以配置多个代理...
  ]
}
```

此时在index.js中请求接口时这样写即可：

```javascript
axios.get('/api/users').then(res => {
  console.log(res)
})
```

## 关于changeOrigin

**用来配置是否更新代理服务器headers中的host地址**

如果不配置，会有这样一个问题，在服务器端通过`ctx.headers`获取的host为localhost:8080：

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1750388872479-16417c93-67be-4393-b834-affe8f708049.png)

会发现，如果没有设置changeOrigin，在请求接口的时候Host默认会是本地服务器的地址。

如果目标服务器有反爬机制或者会校验host与服务器的host是否一致，不一致则不返回数据，那么这样就拿不到数据了。此时可以通过`**devServer.changeOrigin = true**`来让代理服务器将host修改为目标服务器的host已解决此问题

```javascript
devServer: {
    static: ['public', 'script'],
    proxy: [
      {
        context: ['/api'],
        target: 'http://localhost:3000',
        pathRewrite: {
          '^/api': ''
        },
        changeOrigin: true
      }
    ]
  },
```

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1750388825167-35c3b25b-bac9-479e-8ddb-a9775035c6cd.png)

# historyApiFallback

historyApiFallback是开发中一个非常常见的属性，**它主要的作用是解决SPA页面在路由跳转之后，进行页面刷新时，返回404的错误。** 

在改变history时，实际上页面没有进行刷新，而是通过监听history的改变来渲染不同的组件以达到变更页面的目的。所以如果一旦自己进行了手动刷新，就会出现错误找不到页面。

- 因为刷新后，本质是会去找对应的资源，由于不存在对应的资源所以会出现问题
- 在webpack中就需要通过`**historyApiFallback**`来解决

- boolean值：默认是false 
- 如果设置为true，比如当前访问的是localhost:8080/about，那么在刷新时，返回404错误时，会自动返回 index.html 的内容（重新请求localhost:8080），并将后面的/about当成history的一部分
- object类型的值，可以配置rewrites属性，可以配置from来匹配路径，决定要跳转到哪一个页面

事实上devServer中实现historyApiFallback功能是通过connect-history-api-fallback库的： 

可以查看[connect-history-api-fallback](https://github.com/bripkens/connect-history-api-fallback) 文档

```javascript
devServer: {
  //...
  historyApiFallback: true
}
```