webpack官网：https://www.webpackjs.com/

## webpack简介

webpack是基于模块化的打包（构建）工具，它把一切视为模块

它通过一个开发时态的入口模块为起点，分析出所有的依赖关系，然后经过一系列的过程（压缩、合并），最终生成运行时态的文件。

webpack的特点：

- **为前端工程化而生**：webpack致力于解决前端工程化，特别是浏览器端工程化中遇到的问题，让开发者集中注意力编写业务代码，而把工程化过程中的问题全部交给webpack来处理
- **简单易用**：支持零配置，可以不用写任何一行额外的代码就使用webpack
- **强大的生态**：webpack是非常灵活、可以扩展的，webpack本身的功能并不多，但它提供了一些可以扩展其功能的机制，使得一些第三方库可以融于到webpack中
- **基于nodejs**：由于webpack在构建的过程中需要读取文件，因此它是运行在node环境中的（不要理解成我们写的代码要在node环境中运行，我们写代码完全可以使用浏览器端提供的webapi，而是webpack构建过程要在node环境中，也就是说webpack要在node环境中将我们写好的代码进行打包构建）
- **基于模块化**：webpack在构建过程中要分析依赖关系，方式是通过模块化导入语句进行分析的，它支持各种模块化标准，包括但不限于CommonJS、ES6 Module

## webpack的安装

webpack通过npm安装，它提供了两个包：

- webpack：核心包，包含了webpack构建过程中要用到的所有api
- webpack-cli：提供一个简单的cli命令，它调用了webpack核心包的api，来完成构建过程

安装方式：

- 全局安装：可以全局使用webpack命令，但是无法为不同项目对应不同的webpack版本
- **本地安装**：推荐，每个项目都使用自己的webpack版本进行构建（因为现在都有npx了，所以没必要全局安装了，全局安装不方便版本控制）

```plain
npm i -D webpack webpack-cli
```

为什么要安装成开发环境下的依赖？

因为我们最终运行的代码是webpack打包后的代码，最终运行的代码就不需要webpack参与了

- 类似于我们使用的less less-loader，打包后的都是经过其编译后的css，不需要其参与了所以都安装成开发环境的依赖即可

## 使用

```shell
webpack
```

默认情况下，webpack会以`./src/index.js`作为入口文件分析依赖关系，打包到`./dist/main.js`文件中

- 所以需要注意，在不修改webpack配置的前提下，打包入口文件一定要放在src下

通过--mode选项可以控制webpack的**打包结果的运行环境：**

- 指的是最终要运行在哪个环境：开发环境还是生产环境
- 如果在开发环境运行那么webpack最终的打包结果会倾向于方便调试、如果是在生产环境运行那么webpack最终的打包结果会进行优化：让代码体积变得更小等
- 默认是生产环境，通过--mode进行配置，如果`--mode=development`表示开发环境

一般会在package.json中做如下配置：

```json
 "scripts": {
    "build": "webpack --mode=production",
    "dev": "webpack --mode=development"
  },
```

development:

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1736475844160-b5051577-2dc1-4267-9735-148f0870ee0a.png)

production:

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1736475863424-9e0a59a3-e77d-4f03-9d96-9a87cb6ec6fa.png)

除了在scripts中通过`--mode=xx`的方式来指定外，还可以通过配置文件的方式来指定：

【提示】如果配置文件中使用esmodule规范，需要在package.json中设置`**type:module**`

```javascript
export default {
  mode: "production",
  entry: "./src/index.js",
};
```

## 关于production模式下的treeshaking

在production模式下，默认会开启treeshaking，比如如下代码：

```javascript
const sum = (num1, num2) => {
  return num1 + num2;
};
```

在定义sum后，没有使用到该函数，那么执行命令后，会发现该函数不存在了