import _ from 'lodash'
// import $ from 'jquery'
// import './page1.css'
// import './common.css'

// // console.log($)
// const obj = {
//   0: "a",
//   1: "b"
// }

// const result = _.isArray(obj)
// console.log(result)

// // 热更新
// // import a from './a'
// // import './index.css'
// // console.log(a)
// // if(module.hot){ // 是否开启了热更新
// //   module.hot.accept() // 接受热更新
// // }

// const result = _.isArray($('div'))
// console.log(result, '11')

// import {add} from './myMath'
// import './common.js'
// import './common.css'

// console.log(add(1, 2))

// const div = document.createElement("div")
// div.innerText = "myDiv"
// div.className = "red"
// document.body.appendChild(div)

// 懒加载
// import { chunk } from 'lodash-es'
const btn = document.querySelector('button')
btn.onclick = async function () {
  // const { chunk } = await import(/* webpackChunkName:"lodash" */'lodash-es')
  const { chunk } = await import(/* webpackChunkName:"lodash" */'./utils')
  const result = chunk([1, 2, 3, 4, 5, 6, 7, 8], 2)
  console.log('result', result) 
}