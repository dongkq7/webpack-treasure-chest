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