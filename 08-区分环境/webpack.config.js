var baseConfig = require("./webpack.base")
var devConfig = require("./webpack.dev")
var proConfig = require("./webpack.prod")

module.exports = env => {
  console.log(env)
  if (env && env.prod) {
    return {
      ...baseConfig,
      ...proConfig
    }
  } else {
    return {
      ...baseConfig,
      ...devConfig
    }
  }
}