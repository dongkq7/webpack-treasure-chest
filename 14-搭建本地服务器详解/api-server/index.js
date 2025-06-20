const Koa = require('koa')
const Router = require('@koa/router')

const app = new Koa()
const router = new Router({
  prefix: '/users'
})

router.get('/', (ctx) => {
  console.log(ctx.headers)
  ctx.body = {
    code: 0,
    data: [
      { id: 1, name: 'John' },
      { id: 2, name: 'Jane' },
      { id: 3, name: 'Jim' },
    ]
  }
})

app.use(router.routes())
app.use(router.allowedMethods())

app.listen(3000, () => {
  console.log('Server is running on port 3000')
})