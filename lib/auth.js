const passport = require('koa-passport')
const BearerStrategy = require('passport-http-bearer').Strategy
const LocalStrategy = require('passport-local').Strategy
const TokenController = require('../controllers/tokens')
const UserController = require('../controllers/users')

passport.use(new BearerStrategy(async (token, done) => {
  try {
    const accessToken = await TokenController.auth(token)
    console.info('auth', token, accessToken.user)
    accessToken ? done(null, accessToken.user) : done(null, false, { type: 'error', message: '授权失败！' })
  } catch (err) {
    done(err, false, { type: 'error', message: '授权失败！' })
  }
}))
passport.use(new LocalStrategy(async (username, password, done) => {
  try {
    console.info(username, password)
    let user = await UserController.auth(username, password)
    user ? done(null, user) : done(null, false, { type: 'error', message: '登录失败！' })
  } catch (err) {
    done(err, false, { type: 'error', message: '登录失败！' })
  }
}))
passport.serializeUser(function (user, done) {
  done(null, user)
})
passport.deserializeUser(function (user, done) {
  return done(null, user)
})

module.exports = passport