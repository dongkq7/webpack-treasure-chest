module.exports = class MyPlugin{
  apply(compiler) {
    compiler.hooks.done.tap('Myplugin-done', function(compilation) {
      console.log('编译完成');
    })
  }
}