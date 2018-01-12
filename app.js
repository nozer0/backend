const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const body = require('koa-body')
const logger = require('koa-logger')
const cors = require('koa-cors')
const passport = require('./lib/auth')
const session = require("koa-session2")
const mongoose = require('mongoose')
const config = require('./config')

const index = require('./routes/index')
// const api = require('./routes/api')
const users = require('./routes/users')

// error handler
onerror(app)

// middlewares
app.use(body())
app.use(async (ctx, next) => {
  var query = ctx.query
  if (query._method) {
    this.request.method = query._method.toUpperCase()
  }
  await next()
})
app.use(json())
app.use(logger())
app.use(cors({
  credentials: true,
  origin: true // 'http://localhost:8080'
}))  
app.use(require('koa-static')(__dirname + '/public'))

app.keys = ['ungegistered']
app.use(session({
  maxAge: 15 * 3600000
}, app))
app.use(passport.initialize())
app.use(passport.session())
// app.use(function(ctx, next) {
//   if (ctx.isAuthenticated()) {
//     return next()
//   } else {
//     ctx.body = 'Login please'
//   }
// })

app.use(views(__dirname + '/views', {
  extension: 'pug'
}))

// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

mongoose.Promise = global.Promise
mongoose.connect(config.mongodb.uri, {useMongoClient: true})

var db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', function() {
})

// routes
app.use(index.routes(), index.allowedMethods())
// app.use(api.routes(), api.allowedMethods())
app.use(users.routes(), users.allowedMethods())

module.exports = app
