const { marked } = require("marked")
const hljs = require("highlight.js")

module.exports = function (content) {
  // 代码块高亮处理
  marked.use({
    renderer: {
      code({text, lang}) {
        return `<pre><code class="hljs ${lang}">${hljs.highlight(lang, text).value}</code></pre>`
      }
    }
  })
  
  // 1. 将 markdown 转换为 html
  const html = marked(content)
  // 2. 将 html 转换为 js 代码，采用模块化导出
  return `module.exports = ${JSON.stringify(html)}`
}