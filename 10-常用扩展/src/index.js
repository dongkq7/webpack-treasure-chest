// const imgSrc = require('./assets/webpack.png').default
import imgSrc from './assets/webpack.png'
console.log(imgSrc)

if (true) {
  const img = new Image()
  img.src = imgSrc
  document.body.appendChild(img)
}
console.log(PI)
$('body').css('background', '#333')