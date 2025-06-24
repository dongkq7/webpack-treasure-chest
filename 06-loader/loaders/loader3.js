module.exports = function(sourceCode) {
  const callback = this.async()
  setTimeout(() => {
    console.log('loader3')
    callback(null, sourceCode)
  }, 2000)
}