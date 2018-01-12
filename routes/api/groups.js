const router = require('koa-router')()
const controller = require('../../controllers/groups')

// router.prefix('/groups')

router.get('/:id', async (ctx, next) => {
  try {
    let d = await controller.get(ctx.params.id)
    if (d) {
      ctx.body = d
    } else {
      ctx.status = 404
      ctx.body = ''
    }
  } catch (err) {
    console.log(err)
    ctx.status = 404
    ctx.body = ''
    // ctx.throw(404, err)
  }
}).get('/', async (ctx, next) => {
  try {
    ctx.body = await controller.fetch()
  } catch (err) {
    console.log(err)
    ctx.body = []
    // ctx.throw(404, err)
  }
})

router.put('/:id?', async (ctx, next) => {
  let user = ctx.state.user
  try {
    let data = ctx.request.body
    let id = ctx.params.id
    if (!data._id && id) data._id = ctx.params.id
    let d = await controller.post(data, user)
    if (d) {
      ctx.body = d
    } else {
      ctx.status = 404
      ctx.body = ''
    }
  } catch (err) {
    ctx.throw(403, err)
  }
})

router.post('/', async (ctx, next) => {
  let user = ctx.state.user
  try {
    let data = ctx.request.body
    let d = await controller.post(data, user)
    if (d) {
      ctx.body = d
    } else {
      ctx.status = 404
      ctx.body = ''
    }
  } catch (err) {
    ctx.throw(403, err)
  }
})

router.delete('/:id', async (ctx, next) => {
  let user = ctx.state.user
  try {
    let d = await controller.delete(ctx.params.id, user)
    if (d) {
      ctx.body = d
    } else {
      ctx.status = 404
      ctx.body = ''
    }
  } catch (err) {
    ctx.throw(403, err)
  }
})

module.exports = router
