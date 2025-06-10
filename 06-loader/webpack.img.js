const path = require("path");
module.exports = {
  entry: "./src/buildImg.js",
  output: {
    path: path.resolve(__dirname, "build"),
    filename: "bundle.js",
    // webpack5之后可以配置该属性，用于打包前清空目录
    clean: true,
    // assetModuleFilename: "img/abc.png",
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|jpe?g|gif)$/,
        type: "asset",
        parser: {
          dataUrlCondition: {
            maxSize: 3 * 1024,
          },
        },
        // type: "asset/resource",
        // type: "asset/inline",
        generator: {
          // [name]为文件原始名称的占位符
          // [ext]为文件后缀的占位符
          filename: "img/[name]_[hash:8][ext]",
        },
      },
    ],
  },
};
