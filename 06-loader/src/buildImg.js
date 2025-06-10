import src from "./assets/webpack.png";
// 将css加入到webpack依赖图中
import "./css/index.css";
var img = document.createElement("img");
img.src = src;
document.body.append(img);

var div = document.createElement("div");
document.body.append(div);
