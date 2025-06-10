module.exports = {
  mode: "development",
  module: {
    rules: [
      {
        test: /index\.js/,
        use: ["./loaders/loader1.js", "./loaders/loader2.js"],
      },
      {
        test: /\.js$/,
        use: ["./loaders/loader3.js", "./loaders/loader4.js"],
      },
      {
        test: /\.css$/,
        use: ["./loaders/css-loader.js"],
      },
      {
        test: /\.(png|jpe?g|gif)$/,
        use: [
          {
            loader: "./loaders/img-loader.js",
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
