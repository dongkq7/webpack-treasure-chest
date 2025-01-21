const webpack = require('webpack')
const path = require('path')
module.exports = {
  mode: 'production',
  entry: {
    lodash: ['lodash'],
    jquery: ['jquery']
  },
  output: {
    filename: 'dll/[name].js',
    library: '[name]'
  },
  plugins: [
    new webpack.DllPlugin({
      path: path.resolve(__dirname, 'dll', '[name].manifest.json'),
      name: '[name]'
    })
  ]
}