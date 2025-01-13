在执行webpack命令时

- 1. 首先会进行初始化：将命令行参数、配置文件、以及默认配置合并成最终配置对象
- 2. 然后执行编译，创建chunk：根据配置的入口模块路径分析依赖，将多个模块文件合并成一个chunk，chunk中记录了各模块路径及转换后的代码。接着webpack会根据配置文件为每个chunk生成一个chunk assets资源列表，里面记录了最终输出的文件名及文件内容
- 3. 将这些chunk assets按照资源列表生成文件

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1736671400985-c95b47b2-fec4-4b11-bc8b-fdcdc6ec1653.png)



node内置模块 - path: https://nodejs.org/dist/latest-v12.x/docs/api/path.html

## 入口

**入口真正配置的是chunk**

入口通过entry进行配置，属性名代表chunk的名称，属性值代表chunk对应的入口模块的路径。

### 默认情况

默认情况下，entry的配置如下：

```javascript
 entry: {
    main: './src/index.js'
  },
// 如果配置的是entry: './src/index.js'，就相当于如上的写法，最终也会被转换成如上配置
```

### 多入口

```javascript
 entry: {
    main: './src/index.js',
    a: './src/a.js'
  },
```

一个chunk也可以对应多个入口，此时使用数组去表示：

```javascript
 entry: {
    main: './src/index.js',
    a: ['./src/a.js', './src/index.js']
  },
```

这里achunk只是从多个入口来分析模块依赖，最终将这些模块还是合并到一个chunk里。

## 出口

这里的出口是针对**资源列表的文件名或路径**的配置

出口通过output进行配置

常用配置如下：

### path

必须配置一个绝对路径，表示资源列表文件放置的文件夹

- 由于webpack是在node环境中运行，而且为了保持不同操作系统兼容性，可以使用node中path模块的resolve函数进行路径拼接，如：`path.resolve(__dirname, 'target')`

### filename

每个chunk对应多个资源文件，如main.js、main.map.js，一个资源文件是合并模块后的js代码文件，一个是其对应的map文件。

**这个filename配置的就是合并模块后的js代码文件名，确切说是配置的该文件的文件名规则。**

#### 静态名称

- **可以是一个确切的名字，如'bundle.js'**

```javascript
const path = require('path')
module.exports = {
  mode: 'development',
  output: {
    path: path.resolve(__dirname, 'target'),
    filename: 'bundle.js'
  }
}
```

如果devtool配置的为source-map，那么该chunk也会生成一个对应的map文件，此时map文件名将会是bundle.map.js

- **也可以指定存放的文件目录**，如

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1736675499728-297112a5-5fb0-4219-8298-5186e0422e2f.png)

打包后该js文件将会被放到scripts文件夹下

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1736675535330-130f5488-c87a-40f2-a88b-346408e0ed48.png)

#### 动态规则

当入口为多个的时候，要使用动态规则生成名称。

将规则放入`[]`中，最终会被替换成相应的内容，规则对应如下：

- name：chunkname
- fullhash: 总的资源hash，通常用于解决缓存问题
- chunkhash: 使用chunkhash，这里hash值的变化只与chunk中的内容是否变化有关
- id: 使用chunkid，不推荐，开发环境id为chunkname，但是生产环境是一个数字，开发环境与生产环境不一致

```javascript
const path = require('path')
module.exports = {
  mode: 'development',
  entry: {
    main: './src/index.js',
    a: './src/a.js'
  },
  output: {
    path: path.resolve(__dirname, 'target'),
    filename: '[name].js' // 最终name会被替换为entry中配置的chunkname
  }
}
```

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1736678475792-5b8adf4a-57cc-4a29-93b1-98bf03ecf01d.png)

为了解决缓存问题，通常会在名字后加上资源hash，hash比较长，可以后面加上`:数字`来取前几位

```javascript
  output: {
    path: path.resolve(__dirname, 'target'),
    filename: '[name][fullhash:8].js'
  },
```

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1736679212415-dec97ea9-e323-44d5-9e37-125cd1176883.png)

## 入口出口最佳实践

### 一个页面一个JS

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1736679776798-85cb5f9f-99b1-419d-99df-89f5d7c85631.png)![null](assets/2020-01-10-12-00-28.png)

源码结构

```plain
|—— src
    |—— pageA   页面A的代码目录
        |—— index.js 页面A的启动模块
        |—— ...
    |—— pageB   页面B的代码目录
        |—— index.js 页面B的启动模块
        |—— ...
    |—— pageC   页面C的代码目录
        |—— main1.js 页面C的启动模块1 例如：主功能
        |—— main2.js 页面C的启动模块2 例如：实现额外功能
        |—— ...
    |—— common  公共代码目录
        |—— ...
```

webpack配置

```javascript
module.exports = {
    entry:{
        pageA: "./src/pageA/index.js",
        pageB: "./src/pageB/index.js",
        pageC: ["./src/pageC/main1.js", "./src/pageC/main2.js"]
    },
    output:{
        filename:"[name].[chunkhash:5].js"
    }
}
```

这种方式**适用于页面之间的功能差异巨大、公共代码较少的情况**，这种情况下打包出来的最终代码不会有太多重复

如果公共代码较多，就会导致最终打包后各chunk里有较多重复代码，最终影响页面传输。

### 一个页面多个JS

![null](assets/2020-01-10-12-38-03.png)![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1736679787118-acf2d7f1-d488-42e5-9524-3e09241f61ed.png)

源码结构

```plain
|—— src
    |—— pageA   页面A的代码目录
        |—— index.js 页面A的启动模块
        |—— ...
    |—— pageB   页面B的代码目录
        |—— index.js 页面B的启动模块
        |—— ...
    |—— statistics   用于统计访问人数功能目录
        |—— index.js 启动模块
        |—— ...
    |—— common  公共代码目录
        |—— ...
```

webpack配置

```javascript
module.exports = {
    entry:{
        pageA: "./src/pageA/index.js",
        pageB: "./src/pageB/index.js",
        statistics: "./src/statistics/index.js"
    },
    output:{
        filename:"[name].[chunkhash:5].js"
    }
}
```

这种方式适用于页面之间有一些**独立**、相同的功能，专门使用一个chunk抽离这部分JS有利于浏览器更好的缓存这部分内容。

思考：为什么不使用多启动模块的方式？

虽然可以这样配置，但是导致了传输量增加

### 单页应用

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1736679797344-501c858c-b560-48fa-99c9-565be2d43a40.png)

所谓单页应用，是指整个网站（或网站的某一个功能块）只有一个页面，页面中的内容全部靠JS创建和控制。 vue和react都是实现单页应用的利器。

![null](assets/2020-01-10-12-44-13.png)

源码结构

```plain
|—— src
    |—— subFunc   子功能目录
        |—— ...
    |—— subFunc   子功能目录
        |—— ...
    |—— common  公共代码目录
        |—— ...
    |—— index.js
```

webpack配置

```javascript
module.exports = {
    entry: "./src/index.js",
    output:{
        filename:"index.[hash:5].js"
    }
}
```

## [扩展]关于路径

关于node中的路径：

1. `./`

- 模块化代码中，./表示当前js文件所在的路径
- 在路径处理中，./表示node运行目录（即当前node运行所在的目录）

1. __dirname

- 所有情况下都表示当前运行的js文件所在的目录，是一个绝对路径

1. path.resolve

- node中的一个函数，将多段路径拼接成一个绝对路径，对不同操作系统会兼容处理，比如windows和mac的路径斜杠是不同的，这里也是可以正确处理的
- `path.resolve("./", "abc", "123")`,这里的`./`指的是node运行所在的目录，如果想拼接当前js所在目录那么是有`__dirname`