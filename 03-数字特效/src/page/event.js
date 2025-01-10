import NumberCreater from '../utils/number'
import appendNumber from './appendNumber'

const n = new NumberCreater()
n.callback = function(n, isPrime) {
  appendNumber(n, isPrime)
}

let isStart = false
window.onclick = function() {
  if (isStart) {
    n.stop()
    isStart = false
  } else {
    n.start()
    isStart = true
  }
}