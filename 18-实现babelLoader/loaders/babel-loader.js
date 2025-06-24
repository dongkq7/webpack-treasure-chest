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