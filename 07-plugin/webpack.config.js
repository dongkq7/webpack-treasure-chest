var MyPlugin = require('./plugins/MyPlugin')
var FileListPlugin = require('./plugins/FileListPlugin')
module.exports = {
  mode: 'development',
  devtool: 'source-map',
  watch: true,
  plugins: [
    new MyPlugin(),
    new FileListPlugin('资源列表.txt')
  ]
}