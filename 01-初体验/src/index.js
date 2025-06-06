const sum = (num1, num2) => {
  return num1 + num2;
};

// 不加以下代码，在production模式下，打包结果是空
// 这是因为在production模式下默认开启了treeshaking，所以如果没有用到sum会进行树摇优化
console.log(sum(1, 2));
