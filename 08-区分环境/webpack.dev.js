const baseConfig = require("./webpack.base");
const { merge } = require("webpack-merge");

// module.exports = {
//   mode: 'development',
//   devtool: 'source-map',
//   watch: true
// }
module.exports = merge(baseConfig, {
  mode: "development",
  devtool: "source-map",
  watch: true,
});
