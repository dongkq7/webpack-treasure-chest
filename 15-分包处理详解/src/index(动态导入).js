/**
 * 动态导入
 */
const btn1 = document.createElement('button')
btn1.textContent = 'Home'
btn1.onclick = () => {
  import(/* webpackChunkName: "home" */ './router/home').then(module => {
    module.homeFun()
    console.log(module.default.name)
  })
}
document.body.appendChild(btn1)

const btn2 = document.createElement('button')
btn2.textContent = 'About'
btn2.onclick = () => {
  import(/* webpackChunkName: "about" */ './router/about')
}
document.body.appendChild(btn2)