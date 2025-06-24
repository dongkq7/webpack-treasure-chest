# 需要依赖清单

- `webpack`
- `webpack-cli`
- `css-loader`
- `style-loader`
- `html-webpack-plugin`
- `marked`将md文件内容处理为html
- `highlight.js` 关键词高亮

使用`hljs.highlight`处理后，关键词会被span包裹并挂上特殊的类，此时我们可以手动添加css或者使用该库提供的css样式来处理高亮效果

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1750741352765-04ff7b8c-6f85-43e3-b79f-46d2818931ee.png)