webpack做的事情，仅仅是分析出各种模块的依赖关系，然后形成资源列表，最终打包生成到指定的文件中。
更多的功能需要借助webpack loaders和webpack plugins完成。

## 什么是loader

**webpack loader**： loader本质上是一个函数，它的作用是将某个源码字符串转换成另一个源码字符串返回。

![null](assets/2020-01-13-10-39-24.png)![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1736733426643-26fe26ec-1e97-47b8-818a-e0851ba7598f.png)

loader函数的将在模块解析的过程中被调用，以得到最终的源码。

**全流程：**

![null](assets/2020-01-13-09-28-52.png)![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1736733432529-ea3dfe63-95d3-488d-a750-bbac15114efd.png)

**chunk中解析模块的流程：**

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1736733437860-fefb9d3e-cdcf-4fe9-9360-b9ba5fa56059.png)![null](assets/2020-01-13-09-29-08.png)

**chunk中解析模块的更详细流程：**

![null](assets/2020-01-13-09-35-44.png)![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1736733447742-4fd2ab19-0304-4386-b38d-affb883a46ac.png)

在读取文件内容之后，生成AST抽象语法树之前会处理loaders。

**处理loaders流程：**

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1736733461328-46c286bb-bd02-4ccf-8230-ed5b031e9774.png)![null](assets/2020-01-13-10-29-54.png)

## loader相关配置

**完整配置**

```javascript
module.exports = {
    module: { //针对模块的配置，目前版本只有两个配置，rules、noParse
        rules: [ //模块匹配规则，可以存在多个规则
            { //每个规则是一个对象
                test: /\.js$/, //正则表达式，匹配的模块
                use: [ //匹配到后应用的加载器
                    {  //其中一个规则
                        loader: "模块路径", //加载器的路径，内部会将该路径放入到require中
                        options: { //对应loader传递的额外参数

                        }
                    }
                ]
            }
        ]
    }
}
```

**简化配置**

```javascript
module.exports = {
    module: { //针对模块的配置，目前版本只有两个配置，rules、noParse
        rules: [ //模块匹配规则，可以存在多个规则
            { //每个规则是一个对象
                test: /\.js$/, //匹配的模块正则
                use: ["loader路径1", "loader路径2"]//loader的路径，该字符串会被放置到require中
            }
        ]
    }
}
```

### 试着写一个loader

假设index.js为：

```javascript
变量 a = 1
```

打包时会报错：

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1736736028184-ba84ec2b-3a26-49d7-be90-bac4cf8cc73e.png)

在解析模块时，读取文件内容后，会调取loader函数，对读取出来的文件内容字符串进行处理，返回一个处理后的字符串。那么可以写一个loader来处理此问题。

loaders/loader1.js

```javascript
module.exports = function(sourceCode) {
  console.log('处理前=>', sourceCode)
  return sourceCode.replaceAll('变量', 'var')
}
```

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1736736428378-cf03ff9b-eed1-4290-a088-d5a26dcc2a7c.png)

可见，处理后，变量会被替换为var，最终可以成功打包。



### 多个loader的执行顺序

```javascript
module.exports = {
  mode: 'development',
  module: {
    rules: [
      {
        test: /index\.js/,
        use: ["./loaders/loader1.js", "./loaders/loader2.js"]
      },
      {
        test: /\.js$/,
        use: ["./loaders/loader3.js", "./loaders/loader4.js"]
      }
    ]
  }
}
```

loader1.js

```javascript
module.exports = function(sourceCode) {
  console.log('loader1')
  return sourceCode
}
```

loader2.js

```javascript
module.exports = function(sourceCode) {
  console.log('loader2')
  return sourceCode
}
```

loader3.js

```javascript
module.exports = function(sourceCode) {
  console.log('loader3')
  return sourceCode
}
```

loader4.js

```javascript
module.exports = function(sourceCode) {
  console.log('loader2')
  return sourceCode
}
```

对于index.js来说，符合规则1，也符合规则2

起初loaders数组为空，首先判断符合规则1，会将loader1.js与loader2.js加入数组中；然后判断也符合规则2，所以会将loader3.js和loader4.js也加入到数组中，此时loaders数组为[loader1, loader2, loader3, loader4]

loader在执行过程中会按照从后往前的顺序，先把sourceCode交给loader4处理，loader4处理完毕后将处理过后的sourceCode再交给loader3...依次向前。

所以会看到最终输出结果为：

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1736739567718-d3fcf535-4295-4cbd-9dbd-2406d35ab9f3.png)

如果此时index.js中require(./a.js)呢？

- 首先在模块解析时，会先对index.js中的文件内容进行loader处理，所以会先依次输出loader4 loader3 loader2 loader1
- 然后根据AST抽象语法树分析，发现index.js中依赖a.js，所以会再对a.js中的文件内容读取后进行loader处理，由于a.js只匹配到了规则2，所以会依次输出loader4 loader3

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1736739658725-ab83ead0-1805-46c5-bde2-e829804e8f61.png)

## loader处理样式

如果模块中依赖样式代码，比如在index.js中依赖index.css文件，在index.js中使用require引入了index.css：

index.js

```javascript
require('./assets/index.css')
```

会发现，在打包时会报错：

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1736749186335-72b4fd2b-9a92-428f-98c3-52c5b00b0102.png)

这是因为当webpack发现index.js依赖index.css后，会将index.css中的文件内容读取出来进行AST抽象语法树分析。但是由于css代码不是js代码，webpack就识别不了了，因此转换不了AST抽象语法树。

此时就需要使用一个loader将css代码转换成webpack能识别的js代码。

loader中会拿到读取的css文件的内容，那么就可以在loader中返回如下的js代码内容：

css-loader.js

```javascript
module.exports = function(sourceCode) {
  var code =  `
    var style = document.createElement('style')
    style.innerHTML = \`${sourceCode}\`
    document.head.appendChild(style)
  `
  return code
}
```

需要注意不要使用双引号来包裹 `sourceCode`，而 `sourceCode` 本身也包含双引号。可以使用模板字符串来避免这个问题。

如果期望require('./assets/index.css')后能拿到文件中原始内容，那么可以在loader的js代码内容中将原始内容通过module.exports导出即可

```javascript
module.exports = function(sourceCode) {
  var code =  `
    var style = document.createElement('style')
    style.innerHTML = \`${sourceCode}\`
    document.head.appendChild(style)
    module.exports = \`${sourceCode}\`
  `
  return code
}
```

## loader处理图片

比如想在页面上通过js的方式展示一张图片

```javascript
var src = require('./assets/webpack.png')
var img = document.createElement('img')
img.src = src
document.body.appendChild(img)
```

当运行webpack时会发现报如下错误：

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1736752304457-1183c637-aad0-400b-8a7f-ff74aac3fd29.png)

这是因为图片内容是二进制格式的，webpack在模块依赖分析时，二进制格式的代码解析不成抽象语法树。

**所以此时也需要一个loader来处理，将二进制内容翻译成js代码内容，从而能够成功解析成抽象语法树。**

无非就是在loader中处理图片二进制内容，导出一个base64内容或者文件路径。

注意，需要拿到图片的二进制内容才能进行正确处理，此时需要在导出的loader函数上加上`raw`属性，并配置成true，这样webpack看到loader函数加上了这个属性后才会将二进制格式传递进来，这样给的内容就不是字符串了，而是ArrayBuffer（二进制内容是用ArrayBuffer存储的）。

```javascript
function loader(buffer) {
  console.log(buffer)
  // 处理逻辑...
}

loader.raw = true
module.exports = loader
```

### 将图片转换成base64进行展示

```javascript
function loader(buffer) {
  console.log('字节数：', buffer.byteLength)
  var content = getBase64(buffer)
  return `module.exports = \`${content}\``
}

loader.raw = true
module.exports = loader

function getBase64(buffer) {
  return 'data:image/png;base64,'+buffer.toString('base64')
}
```

这种方式是直接将依赖的图片模块转换成了base64，最终打包结果中不会存在图片文件。

### 将图片转换成文件路径进行展示

此时需要打包后生成一个文件，然后将文件路径导出，index.js中此时会拿到最终打包生成的图片文件路径，从而进行展示。

1. 首先安装loader-utils模块

npm i -D loader-utils

1. 使用loaderutils中的`interpolateName`函数来生成文件名，并使用上下文中的emitFile函数来将文件输出到资源列表中

- `interpolateName` 函数中参数1 为导出的loader函数中的上下文，参数2为生成的文件名规则（其中contenthash是与该文件内容有关的hase，ext为文件后缀），参数3为一个对象其中content表示该文件的原始内容
- emitFile函数中传入最终生成的文件名与文件原始内容，来将生成的文件打包到资源列表中

```javascript
var loaderUtil = require('loader-utils')

function loader(buffer) {
  console.log('字节数：', buffer.byteLength)
  var content = getFilePath.call(this, buffer)
  console.log(content)
  return `module.exports = \`${content}\``
}

loader.raw = true
module.exports = loader

function getFilePath(buffer) {
  var filename = loaderUtil.interpolateName(this, '[contenthash:6].[ext]', {
    content: buffer
  })
  this.emitFile(filename, buffer)
  return filename
}
```

打包后，就可以看到图片会单独作为一个文件输出到资源列表中：

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1736754456042-c7e8d1d4-ec43-4e4f-a5d0-87495435b02d.png)

### 根据loader配置来选择一种方式展示

可以向该img-loader传入配置信息，来让用户动态决定使用哪种方式来展示图片文件。

**webpack.config.js:**

```javascript
module.exports = {
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.(png)|(jpg)|(gif)$/,
        use: [{
          loader: "./loaders/img-loader.js",
          options: {
            limit: 3000,
            filename: "img-[contenthash:6].[ext]"
          }
        }]
      }
    ]
  }
}
```

**img-loader.js:**

```javascript
var loaderUtil = require('loader-utils')

function loader(buffer) {
  console.log('字节数：', buffer.byteLength)
  var content
  // 拿到配置信息
  var { limit = 1000, filename = '[contenthash:6].[ext]'} = this.getOptions()
  if (buffer.byteLength >= limit) {
    content = getFilePath.call(this, buffer, filename)
  } else {
    content = getBase64(buffer)
  }
  console.log(content)
  return `module.exports = \`${content}\``
}

loader.raw = true
module.exports = loader

function getBase64(buffer) {
  return 'data:image/png;base64,'+buffer.toString('base64')
}

function getFilePath(buffer, name) {
  var filename = loaderUtil.interpolateName(this, name, {
    content: buffer
  })
  this.emitFile(filename, buffer)
  return filename
}
```

## 注意

由于loader是在webpack打包过程中用到的，所以loader中只能使用cjs，不能使用esmodule。