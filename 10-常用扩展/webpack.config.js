const path = require("path");
const webpack = require("webpack");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
module.exports = {
  mode: "development",
  devtool: "source-map",
  entry: {
    home: "./src/index.js",
    // a: './src/a.js'
  },
  output: {
    path: path.resolve(__dirname, "dist"), // 确保配置了输出目录
    filename: "scripts/[name][chunkhash:6].js",
  },
  devServer: {
    port: 8082,
    // open: true,
    open: ["home/index.html"],
    proxy: [
      {
        context: ["/api"],
        target: "http://localhost:3000", // 代理到的目标服务器地址
        pathRewrite: { "^/api": "" }, // 不希望接口中有 /api
        changeOrigin: true, // 改变请求头中的 host 和 origin
      },
    ],
    compress: true,
    devMiddleware: {
      stats: {
        colors: true,
        modules: false,
      },
    },
  },
  module: {
    rules: [
      {
        test: /\.(png)|(jpg)|(gif)$/,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "imgs/[name][contenthash:6].[ext]",
            },
          },
          // {
          //   loader: 'url-loader',
          //   options: {
          //     limit: 10 * 1024,
          //     name: 'imgs/[name][contenthash:6].[ext]'
          //   }
          // }
        ],
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      PI: "Math.PI",
    }),
    new webpack.BannerPlugin({
      banner: `
      hash:[fullhash]
      chunkhash:[chunkhash]
      name:[name]
      author:xxx
      corporation:xxx
      `,
    }),
    new webpack.ProvidePlugin({
      $: "jquery",
    }),
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: "./public/index.html",
      filename: "home/index.html",
      chunks: ["home"],
    }),
    // new HtmlWebpackPlugin({
    //   template: './public/index.html',
    //   filename: 'a.html',
    //   chunks: ['a']
    // }),
    // new CopyWebpackPlugin({
    //   patterns: [
    //     {
    //       from: './public',
    //       to: './'
    //     }]
    // })
  ],
};
