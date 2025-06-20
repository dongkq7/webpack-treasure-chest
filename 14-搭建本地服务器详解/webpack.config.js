const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  mode: 'development',
  devtool: false,
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    clean: true,
  },
  resolve: {
    extensions: ['.js', '.jsx', '.json', '.ts']
  },
  devServer: {
    static: ['public', 'script'],
    proxy: [
      {
        context: ['/api'],
        target: 'http://localhost:3000',
        pathRewrite: {
          '^/api': ''
        },
        changeOrigin: true
      }
    ],
    historyApiFallback: true
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: {
          // loader: 'ts-loader'
          loader: 'babel-loader'
        }
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
    })
  ]
}