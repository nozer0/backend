const router = require('koa-router')()
const send = require('koa-send')
const passport = require('../../lib/auth')
const tokenController = require('../../controllers/tokens')
const users = require('./users')
const groups = require('./groups')
const products = require('./products')
const companies = require('./companies')
const contacts = require('./contacts')
const projects = require('./projects')
const workorders = require('./workorders')
const inventories = require('./inventories')

// router.prefix('/api')

router.post('/login', (ctx, next) => {
  return passport.authenticate('local', async (err, user, info, status) => {
    if (user && user._id) {
      let token = await tokenController.refresh(user._id)
      if (token) {
        ctx.body = {
          success: true,
          user,
          token: 'Bearer ' + token.token
        }
        ctx.login(user)
      } else {
        ctx.body = { error: '操作失败' }
      }
      // ctx.body = ctx.session
    } else {
      ctx.body = { info, error: err }
    }
  })(ctx, next)
}).all('/logout', (ctx, next) => {
  ctx.logout()
  ctx.body = {
    success: true
  }
})

// router.all('/*', async (ctx, next) => {
//   if (ctx.isAuthenticated()) {
//     await next()
//   } else {
//     ctx.status = 401
//     ctx.body = {
//       status: 401,
//       msg: '令牌失效'
//     }
//   }
// })

router.all('/*', async (ctx, next) => {
  await passport.authenticate('bearer', async (err, user, info, status) => {
    if (user || ctx.isAuthenticated()) {
      console.info('ctx auth', ctx.isAuthenticated())
      if (!ctx.isAuthenticated()) {
        ctx.login(user)
      }
      console.info('ctx auth', ctx.isAuthenticated())
      await next()
    } else {
      ctx.status = 401
      ctx.body = {
        status: 401,
        error: '令牌失效'
      }
    }
  })(ctx, next)
})

router.get('/accessToken', async (ctx, next) => {
  if (ctx.isAuthenticated()) {
    let user = ctx.state.user
    let token = await tokenController.refresh(user._id)
    ctx.body = {
      success: true,
      user,
      token: 'Bearer ' + token.token
    }
  } else {
    ctx.status = 401
    ctx.body = {
      status: 401,
      error: '令牌失效'
    }
  }
})

router.use('/users', users.routes(), users.allowedMethods())
router.use('/groups', groups.routes(), groups.allowedMethods())
router.use('/products', products.routes(), products.allowedMethods())
router.use('/companies', companies.routes(), companies.allowedMethods())
router.use('/contacts', contacts.routes(), contacts.allowedMethods())
router.use('/projects', projects.routes(), projects.allowedMethods())
router.use('/workorders', workorders.routes(), workorders.allowedMethods())
router.use('/inventories', inventories.routes(), inventories.allowedMethods())

module.exports = router
