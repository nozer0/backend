const { Token } = require('./models')
const { security: { tokenLife } } = require('../config')

module.exports = {
	async auth (token) {
		try {
			let accessToken = await Token.findOne({ token }).populate('user')
			if (!accessToken) return false
		  if (Math.round((Date.now() - accessToken.updatedAt) / 1000) > tokenLife) {
	  		accessToken.remove()
	      return false
		  }
		  // accessToken = await accessToken.populate('user')
		  // console.info('auth', accessToken)
		  return accessToken
		} catch (err) {
			console.error(err)
		}
		return false
	},
	async refresh (userId) {
		try {
			var token = await Token.findOne({ user: userId })
			if (token) {
				token.token = '' + userId + Date.now()
			} else {
				token = new Token({
					token: '' + userId + Date.now(),
					user: userId
				})
				console.info(token)
			}
			return token.save()
		} catch (err) {
			console.error(err)
		}
	},
	fetch () {
		try {
			return Token.find()
		} catch (err) {
			console.error(err)
		}
	},
	get (token) {
		try {
			return Token.findOne({ token })
		} catch (err) {
			console.error(err)
		}
	},
	delete (token) {
		try {
			return Token.remove({ token })
		} catch (err) {
			console.error(err)
		}
	}
}
