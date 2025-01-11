由于webpack同时支持CommonJS和ES6 module，因此需要理解它们互操作时webpack是如何处理的。

- 有的情况是使用es导入cjs导出
- 有的情况是使用cjs导入es导出

## 同模块化标准

如果导出和导入使用的是同一种模块化标准，打包后的效果和之前学习的模块化没有任何差异

![null](assets/2020-01-07-07-53-45.png)![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1736475985143-918d629c-302d-4c8d-9a73-219fe3d3a362.png)

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1736476001064-8dc9797a-ea69-43ae-8271-135f7af98ba8.png)

## 不同模块化标准

不同的模块化标准，webpack按照如下的方式处理

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1736476008410-e57a6052-12a3-4b0e-9601-0c730e106244.png)

a.js

```javascript
export const a = 1
export const b = 2
export default 3
```

b.js

```javascript
const obj = require('./a')
console.log(obj)
console.log(obj.a, obj.b, obj.default)
```

index.js

```javascript
require('./b')
```

打包后，执行main.js（如果安装了run coder插件可以直接右键run code运行）

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1736477336601-23f20267-266a-4fa4-aec6-236c33046d16.png)

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1736477351052-a5b0c579-1be8-4a7c-8826-c50d58db2abf.png)

通过运行结果可以看到，commonjs会将es最终导出形成的对象直接导入进来

需要注意的是，如果使用es6的默认导出导出一个对象：

export default {

 a:1,

 b:2,

 c:3

}

通过cjs导入时：

var obj = require('...')

这个导出的对象不是obj（es会将导出的内容进行合并，合并成一个对象，默认导出的内容放到字段default中），而是在`obj.default`中



那么如果使用CJS导出，ES导入呢？



![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1736476021513-643434bb-62f0-4d82-8446-e0480bf6cb98.png)c.js

```javascript
module.exports = {
  d: 1,
  e: 2,
  f: 3
}
```

d.js

```javascript
// import * as cObj from './c'
// 或者
import cObj2 from './c'
console.log('========使用es导入========')
console.log(cObj2)
```

![null](assets/2020-01-07-07-55-54.png)

## 最佳实践

选择一个合适的模块化标准，然后贯彻整个开发阶段。