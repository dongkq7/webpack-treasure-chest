const path = require("path")
const HtmlWebpackPlugin = require("html-webpack-plugin")
module.exports = {
  mode: "development",
  resolveLoader: {
    modules: [path.resolve(__dirname, "loaders"), "node_modules"],
  },
  module: {
    rules: [
      {
        test: /\.md$/,
        use: ["md-loader"]
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin()
  ]
}