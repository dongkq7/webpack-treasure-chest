module.exports = class FileListPlugin {
  constructor(filename) {
    this.filename = filename
  }

  apply(compiler) {
    compiler.hooks.emit.tap('FileListPlugin', (compilation) => {
      const fileList = []
      // 从compilation.assets中获取到资源列表并读取，进行拼接
      for (const key in compilation.assets) {
        const content = `
          【${key}】
          大小: ${compilation.assets[key].size() / 1024}KB
        `
        fileList.push(content)
      }
      console.log('fileList', fileList)
      const str = fileList.join("\n\n")
      compilation.assets[this.filename] = {
        source() {
          return str
        },
        size() {
          return str.length
        }
      }
    })
  }
}