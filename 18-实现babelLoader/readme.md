# 具体思路

babel-loader实际上是拿到js代码后执行@babel/core中的transform方法，并将对应的配置项传递进去来完成代码的转换

1. 安装相应的依赖
2. 通过loader的异步处理方式来完成对代码的转换

# 代码实现

```javascript
const babel = require('@babel/core')
const path = require('path')

module.exports = function (content) {
  const callback = this.async()
  let options = this.getOptions()
  // 如果options为空，则读取babel.config.js文件
  if (!options || Object.keys(options).length === 0) {
    options = require(path.resolve(process.cwd(), 'babel.config.js'))
  }

  babel.transform(content, options, (err, result) => {
    callback(err, result.code)
  })
}
```