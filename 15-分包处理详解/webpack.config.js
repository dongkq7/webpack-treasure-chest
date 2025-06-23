const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = {
  mode: 'production',
  devtool: false,
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'js/[name]-bundle.js',
    chunkFilename: 'js/[name]-chunk.js',
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
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          // 'style-loader',
          'css-loader'
        ]
      }
    ]
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
      // 为了测试分包效果（将utils下的两个文件打包到一起），所以设置minSize为10
      minSize: 10,
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          filename: 'js/[name]-vendors-bundle.js'
        },
        utils: {
          test: /utils/,
          filename: 'js/[name]-utils-bundle.js'
        }
      }
    },
    chunkIds: 'deterministic',
    minimizer: [
      // 不对注释进行提取
      new TerserPlugin({
        extractComments: false
      })
    ],
    // runtimeChunk: {
    //   name: 'runtime'
    // },
  },
  externals: {
    axios: 'axios',
    lodash: '_'
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
    }),
    new MiniCssExtractPlugin({
      filename: 'css/[name]-bundle.css',
      // 对分包的css文件（通过import动态引入的css）进行命名
      chunkFilename: 'css/[name]-chunk.css'
    })
  ]
}