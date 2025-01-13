require('./a.js')
var cssContent = require('./assets/index.css')
console.log('cssContent...', cssContent)
var src = require('./assets/webpack.png')
console.log('src..', src)
var img = document.createElement('img')
img.src = src
document.body.appendChild(img)