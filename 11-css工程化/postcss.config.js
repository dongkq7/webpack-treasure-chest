module.exports = {
  // map: false
  map: {
    inline: false // 使用源码地图，但不使用行内源码地图，而是生成一个独立的 .map 文件
  },
  plugins: [
    // 新版本需要这样引入
    require("postcss-preset-env")({
      stage: 0, //哪怕是处于草案阶段的语法，也需要转换
      preserve: false // 不保留编译前的内容
    })
  ]
}