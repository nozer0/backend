const router = require('koa-router')()
const body = require('koa-body')
const send = require('koa-send')
const fs = require('fs')
const path = require('path')
const csv = require('fast-csv')
const controller = require('../../controllers/users')

// router.prefix('/users')

var root_path = path.resolve(__dirname, '../../files')

router.get('/names/:id?', async (ctx, next) => {
  try {
    let id = ctx.params.id
    if (id) {
      ctx.body = await controller.getName(ctx.params.id)
    } else {
      ctx.body = await controller.getNames(ctx.query)
    }
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
    ctx.body = []
    // ctx.throw(404, err)
  }
})

router.put('/:id?', async (ctx, next) => {
  let user = ctx.state.user
  try {
    let data = ctx.request.body
    let id = ctx.params.id
    if (!data._id && id) data._id = id
    let d = await controller.post(data, user)
    if (d) {
      ctx.body = d
    } else {
      ctx.status = 404
      ctx.body = ''
    }
  } catch (err) {
    console.info('error', err)
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
    console.info('error', err)
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

router.post('/import', body({ multipart: true }), async (ctx, next) => {
  let user = ctx.state.user
  if (user.role > 0) {
    ctx.status = 403
    ctx.body = { error: '禁止操作' }
    return
  }
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
    let userId = user._id
    csv.fromStream(reader, {
      ignoreEmpty: true,
      discardUnmappedColumns: true,
      renameHeaders: true,
      headers: ['username', 'name', ,'title', , 'email', 'mobiles', 'note', ]
    }).on('data', d => {
      d.createdBy = userId
      array.push(d)
    }).on('end', () => {
      console.log("done")
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

router.get('/:id/avatar', async (ctx, next) => {
  let user = ctx.state.user
  if (user.avatar) {
    await send(ctx, ctx.params.id, { root: root_path })
  }
  // await next()
})
router.post('/:id/avatar', body({ multipart: true }), async (ctx, next) => {
  try {
    let user = ctx.state.user
    let id = ctx.params.id
    if (user.role > 0 && user._id !== id) {
      ctx.status = 403
      ctx.body = { error: '禁止操作' }
      return
    }
    let files = ctx.request.body.files
    let file = files && files.avatar
    if (!file) {
      ctx.body = {
        error: '未上传有效文件'
      }
      return
    }
    let filename = user._id.toString()// + path.extname(file.name)
    const reader = fs.createReadStream(file.path)
    const writer = fs.createWriteStream(path.join(root_path, filename))
    // writer.on('error', err => {
    //   ctx.body = {
    //     success: false,
    //     error: err
    //   }
    // })
    // writer.on('finish', () => {
    //   ctx.body = {
    //     success: true,
    //     filename: filename,
    //     file2: file
    //   }
    // })
    await reader.pipe(writer)
    let d = await controller.post({ _id: id, avatar: true })
    if (d) {
      ctx.state.user.avatar = true
      ctx.body = {
        success: true,
        name: filename
      }
    } else {
      ctx.status = 404
      ctx.body = ''
    }
  } catch (err) {
    ctx.throw(403, err)
  }
})

module.exports = router
