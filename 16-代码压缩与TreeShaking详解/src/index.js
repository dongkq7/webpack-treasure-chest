import './css/index.css'
import { sum } from './utils/math'
import { other } from './utils/other'

sum(10, 20)
other()

function foo() {
  console.log('foo')
}


// 无用代码
if (false) {
  foo()
}

const div = document.createElement('div')
div.className = 'title'
document.body.appendChild(div)