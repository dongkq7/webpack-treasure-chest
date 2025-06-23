import axios from 'axios'

// cd 到 api-server 目录下，执行 node index.js 启动服务器
axios.get('/api/users').then(res => {
  console.log(res)
})

console.log('hello main')