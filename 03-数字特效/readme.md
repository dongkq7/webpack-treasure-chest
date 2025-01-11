## 前置

在编写代码的时候想要看测试效果，改完代码就需要打包一下比较麻烦，可以在打包命令后添加`--watch`来开启监听，此时webpack会监听代码变化，代码变化后会重新进行打包：

```json
"scripts": {
    "dev": "webpack --mode=development  --watch"
  },
```

同时，在vscode中使用live server去启动页面从而达到代码变化页面就会更新的效果

## 实现效果

点击页面，数字一个个展示在页面上，其中素数会以随机的颜色进行标识。

页面中央也会展示数字，其中素数会带有平移的动画效果。

![img](https://cdn.nlark.com/yuque/0/2025/gif/22253064/1736500578964-e243874e-1d89-4b9a-ae6d-4f2c48481aca.gif)

## 代码编写

首先，可以把代码拆成多个功能模块

### 素数判断

```javascript
export default function (num) {
  if (num < 2) return false
  for (let i = 2; i <= Math.sqrt(num); i++) {
    if (num % i === 0) return false
  }
  return true
}
```

### 随机数生成

这里用于随机色的产生以及生成指定范围的随机数字

```javascript
const colors = ["#f26395", "#62efab", "#ef7658", "#ffe868", "#80e3f7", "#d781f9"]

export function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min) + min)
}
export default function() {
  console.log(getRandomNumber(0, 6))
  return colors[getRandomNumber(0, 6)]
}
```

### 数字构造函数

可以控制开始生产数字以及暂停生产数字，其中可以接收传入的回调函数来实现自定义生成数字后的处理逻辑。

```javascript
import isPrime from './isPrime'

export default class {
  constructor(duration = 100) {
    this.duration = duration // 生产数字的时间间隔
    this.number = 1
    this.callback = null // 为了具有更高的扩展性，通过回调函数的方式供外部自定义
    this.timer = null
  }

  start() {
    if (this.timer) {
      return
    }
    this.timer = setInterval(() => {
      this.callback && this.callback(this.number, isPrime(this.number))
      this.number ++
    }, this.duration)
  }

  stop() {
    clearInterval(this.timer)
    this.timer = null
  }
}
```

### 页面交互

分为向页面添加数字的逻辑以及事件交互逻辑

```javascript
import $ from 'jquery'
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
```