const router = require('koa-router')()
const body = require('koa-body')
const fs = require('fs')
const path = require('path')
const csv = require('fast-csv')
const controller = require('../../controllers/projects')

// router.prefix('/products')

router.get('/names', async (ctx, next) => {
  let user = ctx.state.user
  try {
    ctx.body = await controller.getNames(ctx.query, user)
  } catch (err) {
    console.log(err)
    ctx.status = 404
    ctx.body = ''
    // ctx.throw(404, err)
  }
}).get('/:id', async (ctx, next) => {
  let user = ctx.state.user
  try {
    let d = await controller.get(ctx.params.id, user)
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
  let user = ctx.state.user
  try {
    let ret = await controller.fetch(ctx.query, user)
    ctx.body = ret ? {
      total: await ret.total,
      offset: ret.offset,
      data: await ret.data
    } : { total: 0, data: null }
  } catch (err) {
    console.log(err)
    ctx.status = 404
    ctx.body = { total: 0, data: null }
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

const TYPES = {
  '客户': 0,
  '运营商': 1,
  '厂商': 2,
  '供货商': 3,
  '集成商': 4,
  '代理商': 5
}

router.post('/import', body({ multipart: true }), async (ctx, next) => {
  let files = ctx.request.body.files
  let file = files && files.csv
  if (!file) {
    ctx.body = {
      error: '未上传有效文件'
    }
    return
  }
  const reader = fs.createReadStream(file.path)
  let p = new Promise((resolve, reject) => {
    let array = []
    let userId = ctx.state.user._id
    csv.fromStream(reader, {
      ignoreEmpty: true,
      discardUnmappedColumns: true,
      renameHeaders: true,
      headers: ['name',, 'department', 'title', 'email', 'phone', 'mobile', 'fax', 'qq', 'wechat', 'note', ]
    }).on('data', d => {
      d.createdBy = userId
      array.push(d)
    }).on('end', () => {
      resolve(array)
    }).on('error', (err) => {
      reject(err)
    })
  })
  try {
    let data = await p
    let result = await controller.insertMany(data, {
      ordered: true,
      rawResult: false
    })
    console.info(result)
    // let usernames = users.map(u => u.username)
    // for (let d of data) {
    //   d.success = usernames.includes(d.username)
    // }
    ctx.body = result.length ? {
      error: result
    } : {
      success: true
    }
  } catch (err) {
    ctx.throw(403, err)
  }
})

module.exports = router
