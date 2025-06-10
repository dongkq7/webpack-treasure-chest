module.exports = {
  entry: "./src/index.js",
  output: {
    filename: "scripts/[name]-[fullhash:6].js",
    clean: true,
  },
};
