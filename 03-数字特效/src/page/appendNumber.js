import $ from 'jquery'
import isPrime from '../utils/isPrime'
import radColor, { getRandomNumber } from '../utils/radColor'

const divContainer = $('#divContainer')
const divCenter = $('#divCenter')
export default function(n, isPrime) {
  const span = $('<span>').text(n)
  if (isPrime) {
    const color = radColor()
    span.css('color', color)
    // 创建素数区域并添加动画
    createCenterPrimeNumber(n, color)
  }
  divContainer.append(span)
  // 在中间区域添加数字
  createCenterNumber(n)
}


function createCenterNumber(n) {
  divCenter.text(n)
}

function createCenterPrimeNumber(n, color) {
  const div = $('<div>').addClass('center').css('color', color).text(n)
  $('body').append(div)
  //加入了div后，强行让页面重新渲染
  getComputedStyle(div[0]).left; //只要读取某个元素的位置或尺寸信息，则会导致浏览器重新渲染 reflow
  div.css("transform", `translate(${getRandomNumber(-200, 200)}px, ${getRandomNumber(-200, 200)}px)`).css("opacity", 0)
}