# babel

官网：https://babeljs.io/
民间中文网：https://www.babeljs.cn/

## 简介

babel一词来自于希伯来语，直译为巴别塔，巴别塔象征的统一的国度、统一的语言。

而今天的JS世界缺少一座巴别塔，不同版本的浏览器能识别的ES标准并不相同，就导致了开发者面对不同版本的浏览器要使用不同的语言，和古巴比伦一样，前端开发也面临着这样的困境。

babel的出现，就是用于解决这样的问题，它是一个编译器，可以把不同标准书写的语言，编译为统一的、能被各种浏览器识别的语言

![null](assets/2020-02-07-10-25-56.png)![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1737078954926-c461e727-3b7e-4713-9c9c-39b10fb46eac.png)

由于语言的转换工作灵活多样，babel的做法和postcss、webpack差不多，它本身仅提供一些分析功能，真正的转换需要依托于插件完成

![null](assets/2020-02-07-10-27-30.png)![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1737078961570-aef4d64e-85ab-4337-b2c9-c239f0e38552.png)

## babel的安装

babel可以和构建工具联合使用，也可以独立使用

如果要独立的使用babel，需要安装下面两个库：

- @babel/core：babel核心库，提供了编译所需的所有api
- @babel/cli：提供一个命令行工具，调用核心库的api完成编译

```shell
npm i -D @babel/core @babel/cli
```

## babel的使用

@babel/cli的使用极其简单

它提供了一个命令`babel`

```shell
# 按文件编译
babel 要编译的文件 -o 编辑结果文件

# 按目录编译
babel 要编译的整个目录 -d 编译结果放置的目录

# 可以加上-w开启监听
```

## babel的配置

可以看到，babel本身没有做任何事情，真正的编译要依托于**babel插件**和**babel预设**来完成

babel预设和postcss预设含义一样，是多个插件的集合体，用于解决一系列常见的兼容问题

如何告诉babel要使用哪些插件或预设呢？需要通过一个配置文件`.babelrc`

```json
{
    "presets": [],
    "plugins": []
}
```

## babel预设

babel有多种预设，最常见的预设是`@babel/preset-env`

`@babel/preset-env`可以让你使用最新的JS语法，而无需针对每种语法转换设置具体的插件

【注意】这个预设只是帮我们转换语法，对于一些新的API的转换，还需要配合使用其他插件来搞定

**配置**

```json
{
    "presets": [
        "@babel/preset-env"
    ]
}
```

**兼容的浏览器**

`@babel/preset-env`需要根据兼容的浏览器范围来确定如何编译，和postcss一样，可以使用文件`.browserslistrc`来描述浏览器的兼容范围

```plain
last 3 version
> 1%
not ie <= 8
```

**自身的配置**

和`postcss-preset-env`一样，`@babel/preset-env`自身也有一些配置

具体的配置见：https://www.babeljs.cn/docs/babel-preset-env#options

配置方式是：

```json
{
    "presets": [
        ["@babel/preset-env", {
            "配置项1": "配置值",
            "配置项2": "配置值",
            "配置项3": "配置值"
        }]
    ]
}
```

其中一个比较常见的配置项是`useBuiltIns`，该配置的默认值是false

它有什么用呢？由于该预设仅转换新的语法，并不对新的API进行任何处理

例如：

```javascript
new Promise(resolve => {
    resolve()
})
```

转换的结果为

```javascript
new Promise(function (resolve) {
  resolve();
});
```

如果遇到没有Promise构造函数的旧版本浏览器，该代码就会报错

而配置`useBuiltIns`可以在编译结果中注入这些新的API，它的值默认为`false`，表示不注入任何新的API，可以将其设置为`usage`，表示根据API的使用情况，从core-js库中按需导入API，**此时还需要安装core-js库、并配置**

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1737083289594-d42d5c14-e6b8-4670-bd42-6d45c6813dd9.png)

【注意】core-js需要安装成生产依赖，因为最终运行需要core-js

npm install core-js

core-js库中包含了所有新的API的实现

```json
{
    "presets": [
        ["@babel/preset-env", {
            "useBuiltIns": "usage",
            "corejs": 3
        }]
    ]
}
```

在之前转换API使用的是：@babel/polyfill ，现在已过时，目前被`core-js`和`generator-runtime`所取代

## babel插件

除了预设可以转换代码之外，插件也可以转换代码，它们的顺序是：

- 插件在 Presets 前运行。
- 插件顺序从前往后排列。
- Preset 顺序是颠倒的（从后往前）。

```shell
{
  "presets: ['a', 'b'],
  "plugins": ['c', 'd']
}

运行顺序： c ---> d ---> b ---> a
```

通常情况下，`@babel/preset-env`只转换那些已经形成正式标准的语法（比如剪头函数已经是正式标准了，但是有的浏览器还是不支持），对于某些处于早期阶段、还没有确定的语法不做转换。

如果要转换这些语法，就要单独使用插件

下面随便列举一些插件

### `@babel/plugin-proposal-class-properties`

新版本babel直接支持

该插件可以让你在类中书写初始化字段

```javascript
class A {
    a = 1;
    constructor(){
        this.b = 3;
    }
}
```

### `@babel/plugin-proposal-function-bind`

该插件可以让你轻松的为某个方法绑定this

```javascript
function Print() {
    console.log(this.loginId);
}

const obj = {
    loginId: "abc"
};

obj::Print(); //相当于：Print.call(obj);
```

遗憾的是，目前vscode无法识别该语法，会在代码中报错，虽然并不会有什么实际性的危害，但是影响观感

### `@babel/plugin-proposal-optional-chaining`

新版本babel直接支持

```javascript
const obj = {
  foo: {
    bar: {
      baz: 42,
    },
  },
};

const baz = obj?.foo?.bar?.baz; // 42

const safe = obj?.qux?.baz; // undefined
```

### `babel-plugin-transform-remove-console`

该插件会移除源码中的控制台输出语句

```javascript
console.log("foo");
console.error("bar");
```

编译后



### `@babel/plugin-transform-runtime`

用于提供一些公共的API，这些API会帮助代码转换

对于代码转换，可以发现编译后多了很多辅助函数，这样就会增加很多代码。如果有很多js，那么编译后会有很多重复内容。

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1737095155115-dba19138-4fb6-4418-8308-3bcb545dbda8.png)

这个插件就是用来将这些辅助函数抽离出去的

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1737095864231-51af0cec-4632-4bd3-8a31-45066f92b166.png)

可以发现使用到的辅助函数此时就会从@babel/runtime中引入，所以还需要安装一下该库（注意，需要安装成普通依赖）

npm i @babel/runtime

## webpack中使用babel

https://www.babeljs.cn/setup#installation

与postcss和webpack结合相似，babel与webpack结合需要安装babel-loader。

1. 安装babel-laoder与@babel/core、@babel/preset-env

npm install -D babel-loader @babel/core @babel/preset-env

1. 配置.babelrc与.browswerslistrc供babel预设读取
2. 根据具体情况来安装一些额外的包，比如core-js等