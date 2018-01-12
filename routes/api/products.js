const router = require('koa-router')()
const body = require('koa-body')
const fs = require('fs')
const path = require('path')
const csv = require('fast-csv')
const controller = require('../../controllers/products')

// router.prefix('/products')

router.get('/names', async (ctx, next) => {
  try {
    ctx.body = await controller.getNames(ctx.query)
  } catch (err) {
    console.log(err)
    ctx.status = 404
    ctx.body = ''
    // ctx.throw(404, err)
  }
}).get('/:id', async (ctx, next) => {
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
  let query = ctx.query
  let model = query.model
  if (model) {
    try {
      let d = await controller.getByModel(model)
      if (d) {
        ctx.body = d
      } else {
        ctx.status = 404
        ctx.body = ''
      }
    } catch (err) {
      ctx.status = 404
      ctx.body = ''
    }
  } else {
    try {
      let ret = await controller.fetch(query)
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
  try {
    let d = await controller.delete(ctx.params.id)
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

const VENDORS = {
  '锐捷': 'RG',
  '华三': 'H3C',
  '迪普': 'DP',
  'LG': 'LG',
  '戴尔': 'DELL'
}
const CATEGORIES = {
  '交换机': 'switch',
  '服务器': 'server',
  '显示屏': 'display'
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
      headers: ['model', 'name', 'category', 'vendor', 'retailPrice', 'finalistPrice', 'parameter', 'description', 'note', ]
    }).on('data', d => {
      let vendor = d.vendor
      d.vendor = VENDORS[vendor] || vendor
      let category = d.category
      d.category = CATEGORIES[category] || category
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

module.exports = router
