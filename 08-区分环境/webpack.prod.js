const baseConfig = require("./webpack.base");
const { merge } = require("webpack-merge");

// module.exports = {
//   mode: "production",
//   devtool: false,
// }
module.exports = merge(baseConfig, {
  mode: "production",
  devtool: false,
});
