有些时候，我们需要针对生产环境和开发环境分别书写webpack配置

## 方案一

在根目录编写好不同环境对应的webpack配置文件，在打包命令后加上--config参数来指定使用哪个配置文件

webpack.dev.js

```javascript
module.exports = {
  mode: 'development',
  devtool: 'source-map',
  watch: true
}
```

webpack.prod.js

```javascript
module.exports = {
  mode: 'production',
  devtool: false
}
```

package.json

```javascript
{
 "scripts": {
    "build": "webpack --config webpack.prod.js",
    "dev": "webpack --config webpack.dev.js"
  },
}
```

## 方案二

为了更好的适应这种要求，webpack允许配置不仅可以是一个对象，还可以是一个**函数**

```javascript
module.exports = env => {
  return {
    //配置内容
  }
}
```

在开始构建时，webpack如果发现配置是一个函数，会调用该函数，将函数返回的对象作为配置内容，因此，开发者可以根据不同的环境返回不同的对象

在调用webpack函数时，webpack会向函数传入一个参数env，**该参数的值来自于webpack命令中给env指定的值**，例如

```bash
npx webpack --env abc # env: {abc:true}
npx webpack --env abc=1  # env： {abc:'1'}
npx webpack --env abc=1 --env bcd=2 # env: {abc:'1', bcd:'2'}
```

这样一来，我们就可以在命令中指定环境，在代码中进行判断，根据环境返回不同的配置结果。

1. 将公共配置抽离到webpack.base.js中

```javascript
module.exports = {
  entry: "./src/index.js",
  output: {
      filename: "scripts/[name]-[fullhash:6].js"
  }
}
```

1. 在配置文件中引入各环境的配置文件，判断环境后去将webpack.config.js导出的配置对象与其他环境的配置对象进行混合

```javascript
var baseConfig = require("./webpack.base")
var devConfig = require("./webpack.dev")
var proConfig = require("./webpack.prod")

module.exports = env => {
  console.log(env)
  if (env && env.prod) {
    return {
      ...baseConfig,
      ...proConfig
    }
  } else {
    return {
      ...baseConfig,
      ...devConfig
    }
  }
}
```

1. 在package.json中配置脚本参数

```json
  "scripts": {
    "build": "webpack --env prod",
    "dev": "webpack --env dev"
  },
```

## 方案三

一般将配置抽取到不同的配置文件中，然后通过`webpack-merge`插件中的`merge对配置文件进行合并`

```bash
npm i webpack-merge -D
```

webpack.base.js:

```javascript
module.exports = {
  entry: "./src/index.js",
  output: {
    filename: "scripts/[name]-[fullhash:6].js",
    clean: true,
  },
};
```

webpack.dev.js:

```javascript
const baseConfig = require("./webpack.base");
const { merge } = require("webpack-merge");

module.exports = merge(baseConfig, {
  mode: "development",
  devtool: "source-map",
  watch: true,
});
```

webpack.prod.js:

```javascript
const baseConfig = require("./webpack.base");
const { merge } = require("webpack-merge");

module.exports = merge(baseConfig, {
  mode: "production",
  devtool: false,
});
```