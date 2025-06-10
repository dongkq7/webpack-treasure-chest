// const path = require("path");
// module.exports = {
//   mode: "development",
//   entry: {
//     main: "./src/index.js", // 属性名 chunk名称，属性值chunk对应的入口模块路径
//     a: "./src/a.js",
//   },
//   // entry: ["./src/index.js", "./src/a.js"],
//   output: {
//     path: path.resolve(__dirname, "target"),
//     filename: "[name][fullhash:8].js",
//     clean: true,
//   },
// };

import path from "node:path";
export default {
  mode: "development",
  entry: {
    main: "./src/index.js", // 属性名 chunk名称，属性值chunk对应的入口模块路径
    // a: "./src/a.js",
  },
  // entry: ["./src/index.js", "./src/a.js"],
  output: {
    path: path.resolve(import.meta.dirname, "target"),
    filename: "[name][fullhash:8].js",
    chunkFilename: "[name][contenthash:8].js",
    clean: true,
  },
};
