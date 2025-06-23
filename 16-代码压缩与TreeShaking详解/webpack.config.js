const path = require('path')
const TerserPlugin = require('terser-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const webpack = require('webpack')
const CompressionPlugin = require('compression-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const glob = require('glob')
const { PurgeCSSPlugin } = require("purgecss-webpack-plugin")
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

module.exports = {
  mode: 'development',
  devtool: false,
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'js/bundle.js',
    clean: true
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader'
        ]
      }
    ]
  },
  optimization: {
    usedExports: true,
    minimize: true,
    minimizer: [
      new TerserPlugin({
        extractComments: false,
        terserOptions: {
          compress: {
            arguments: true
          },
          mangle: true,
          keep_fnames: true
        }
      }),
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'css/[name]-bundle.css',
      chunkFilename: 'css/[name]-chunk.css'
    }),
    new PurgeCSSPlugin({
      paths: glob.sync(`${path.resolve(__dirname, 'src')}/**/*`, { nodir: true }),
      safelist: {
        deep: [/html/, /body/]
      }
    }),
    new CssMinimizerPlugin({
      // 开启多进程压缩
      parallel: true
    }),
    // 作用域提升
    new webpack.optimize.ModuleConcatenationPlugin(),
    new HtmlWebpackPlugin({
      template: './index.html',
      minify: {
        // 移除注释
        removeComments: true,
        // 移除空格
        collapseWhitespace: true,
        // 移除属性引号
        removeAttributeQuotes: true
      }
    }),
    // 压缩
    new CompressionPlugin({
      test: /\.(css|js)$/,
      minRatio: 0.7,
      algorithm: 'gzip'
    }),
    new BundleAnalyzerPlugin()
  ]
}