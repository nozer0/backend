const router = require('koa-router')()
const api = require('./api')
const users = require('./users')

router.get('/', async (ctx, next) => {
  if (ctx.session)
  await ctx.render('index', {
    title: 'Hello Koa 2!'
  })
})

router.get('/string', async (ctx, next) => {
  ctx.body = 'koa2 string'
})

router.get('/json', async (ctx, next) => {
  ctx.body = {
    title: 'koa2 json'
  }
})

router.use('/v1', api.routes(), api.allowedMethods())

module.exports = router
