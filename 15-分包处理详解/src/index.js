/**
 * 自定义分包
 */
import react from 'react'
// import axios from 'axios'
import { foo } from './utils/foo'
import { bar } from './utils/bar'
import './css/index.css'
// 测试通过cdn方式引入lodash
console.log(_)
axios.get('/api/users').then(res => {
  console.log(res)
})

foo()
bar()


const btn1 = document.createElement('button')
btn1.textContent = 'Home'
btn1.onclick = () => {
  import(
    /* webpackChunkName: "home" */
    /* webpackPrefetch: true */
    './router/home'
  ).then(module => {
    module.homeFun()
    console.log(module.default.name)
  })
}
document.body.appendChild(btn1)

const btn2 = document.createElement('button')
btn2.textContent = 'About'
btn2.onclick = () => {
  import(
    /* webpackChunkName: "about" */
    /* webpackPrefetch: true */
    './router/about'
  )
}
document.body.appendChild(btn2)