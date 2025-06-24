const path = require("path")

module.exports = {
  mode: "development",
  resolveLoader: {
    modules: [path.resolve(__dirname, "loaders")],
  },
  module: {
    rules: [
      {
        test: /index\.js/,
        use: [
          {
            loader: "loader1",
            options: {
              a: 1,
              b: 2
            },
          },
          "loader2"
        ],
        // enforce: "pre",
      },
      {
        test: /\.js$/,
        use: ["loader3", "loader4"],
      },
      {
        test: /\.css$/,
        use: ["css-loader"],
      },
      {
        test: /\.(png|jpe?g|gif)$/,
        use: [
          {
            loader: "img-loader",
            options: {
              limit: 3000,
              filename: "img-[contenthash:6].[ext]",
            },
          },
        ],
      },
    ],
  },
};
