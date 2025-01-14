var path = require('path')
module.exports = {
  mode: 'development',
  entry: {
    index: './index.js'
  },
  context: path.resolve(__dirname, 'src'),
  output: {
    library: {
      name: 'abc',
      type: 'var'
    }
  },
  // 告诉webpack打包后的代码运行在哪个环境中，默认是web环境
  target: 'node',
  module: {
    noParse: /jquery|lodash/,
  },
  resolve: {
    modules: [path.resolve(__dirname, 'node_modules')], // 模块查找位置
    extensions: ['.js', '.json', '.vue', '.css'], // 自动解析确定的扩展
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  externals: {
    lodash: '_'
  },
  stats: {
    colors: true, // 显示显色
    modules: false // 不显示构建的模块详细信息
  }
}