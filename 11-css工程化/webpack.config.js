const HtmlWebpackPlugin = require("html-webpack-plugin")
var { CleanWebpackPlugin } = require("clean-webpack-plugin")
const MiniCssExtractPlugin = require("mini-css-extract-plugin")

module.exports = {
  mode: 'development',
  devServer: {
    open: true
  },
  output: {
    filename: 'js/[name].[chunkhash:6].js'
  },
  module: {
    rules: [
      // {
      //   test: /\.css$/,
      //   use: [
      //     'style-loader',
      //     {
      //       loader: 'css-loader',
      //       options: {
      //         // modules: true, // 开启 CSS Modules
      //         modules: {
      //           mode: 'local',
      //           localIdentName: '[name]--[hash:base64:5]',
      //         }
      //       },
      //     },
      //   ],
      // },
      // {
      //   test: /\.less$/,
      //   use: [
      //     'style-loader',
      //     {
      //       loader: 'css-loader',
      //       options: {
      //         // modules: true, // 开启 CSS Modules
      //         modules: {
      //           mode: 'local',
      //           localIdentName: '[name]--[hash:base64:5]',
      //         }
      //       },
      //     },
      //     'less-loader'
      //   ],
      // },
      // {
      //   test: /\.pcss$/,
      //   use: [
      //     'style-loader',
      //     {
      //       loader: 'css-loader',
      //       options: {
      //         // modules: true, // 开启 CSS Modules
      //         modules: {
      //           mode: 'local',
      //           localIdentName: '[name]--[hash:base64:5]',
      //         }
      //       },
      //     },
      //     'less-loader',
      //     'postcss-loader'
      //   ],
      // },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              modules: true, // 开启 CSS Modules
            },
          },
        ],
      },
      {
        test: /\.(png|jpg|gif)$/,
        type: 'asset/resource',
        generator: {
          filename: 'imgs/[name].[hash:6][ext]'
        }
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html'
    }),
    new MiniCssExtractPlugin({
      filename: 'css/[name].[contenthash:6].css'
    }),
    new CleanWebpackPlugin()
  ]
}