const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const path = require('path')
const webpack = require('webpack')
const TerserWebpackPlugin = require('terser-webpack-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const Purgecss = require("purgecss-webpack-plugin")
const WebapckBundleAnalyzer = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

module.exports = {
  mode: 'production',
  // mode: 'production',
  // devServer: {
  //   open: true,
  //   hot: true
  // },
  entry: {
    main: './src/index.js',
    // other: './src/other.js'
  },
  // output: {
  //   path: path.resolve(__dirname, 'dist'),
  //   filename: '[name].[fullhash:6].js'
  // },
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        styles: {
          test: /\.css$/,
          minSize: 0,
          minChunks: 2
        }
      }
    },
    // 代码压缩
    minimizer: [
      new TerserWebpackPlugin(),
      new CssMinimizerPlugin()
    ]
  },
  module: {
    noParse: /jquery/,
    rules: [
      // {
      //   test: /\.js$/,
      //   exclude: /lodash/,
      //   // use: ["thread-loader", "babel-loader"]
      //   use: ["babel-loader"]
      // },
      // {
      //   test: /\.css$/,
      //   use: ['style-loader', 'css-loader']
      // }
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader']
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: ['**/*', '!dll', '!dll/**']
    }),
    // new HtmlWebpackPlugin({
    //   template: './public/index.html'
    // }),
    // new MiniCssExtractPlugin({
    //   filename: "styles/[name].[fullhash:6].css",
    //   // chunkFilename是配置来自于分割chunk的文件名
    //   chunkFilename: "common.[fullhash:6].css" 
    // })
    // new webpack.DllReferencePlugin({
    //   manifest: require('./dll/lodash.manifest.json')
    // }),
    // new webpack.DllReferencePlugin({
    //   manifest: require('./dll/jquery.manifest.json')
    // })
    new WebapckBundleAnalyzer()
  ]
}