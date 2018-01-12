const { User } = require('./models')

module.exports = {
	auth (username, password) {
		try {
			return User.findOne({ username, password })
		} catch (err) {
			console.error(err)
		}
		return false
	},
	fetch ({ group, offset, size }, user) {
		if (user.role > 0) throw new Error('禁止操作')
		try {
			offset = isNaN(offset) ? 0 : +offset
			let conds = group ? { group } : {}
			let data = User.find(conds).skip(offset).limit(isNaN(size) ? 25 : +size).sort({ createdAt: -1 })
			return {
				total: User.count(conds),
				offset,
				data
			}
		} catch (err) {
			console.error(err)
		}
	},
	get (id, user) {
		if (user.role > 0 && user._id !== id) throw new Error('禁止操作')
		try {
			return User.findById(id)
		} catch (err) {
			console.error(err)
		}
	},
	async getNames ({ keyword, withEmail }) {
		try {
			let conds = {}
			if (keyword) {
				conds.$or = [
					{ name: { $regex: keyword } },
					{ email: { $regex: keyword, $options: 'i' } }
				]
			}
			return User.find(conds, withEmail ? 'name username email role' : 'name username')
		} catch (err) {
			console.error(err)
		}
	},
	async getName (id) {
		try {
			let user = await User.findById(id, 'name')
			return user && user.name || ''
		} catch (err) {
			console.error(err)
		}
	},
	post (data, user) {
		// if (user.role >= 0) throw new Error('禁止操作')
		try {
			let id = data._id
			if (id) {
				if (user.role >= 0 && id !== user._id) throw new Error('禁止操作')
				return User.findByIdAndUpdate(id, data, { new: true })
			}
			if (user.role >= 0) throw new Error('禁止操作')
			let model = new User(data)
			return model.save()
		} catch (err) {
			console.error(err)
		}
	},
	delete (id, user) {
		if (user.role > 0) throw new Error('禁止操作')
		try {
			return User.findByIdAndRemove(id)
		} catch (err) {
			console.error(err)
		}
	},
	async insertMany (data, options = {}) {
		let ret = []
		for (let d of data) {
			try {
				let u = new User(d)
				await u.save()
			} catch (err) {
				// console.error(err)
				ret.push([d.username, err.code === 11000 ? '重复数据' : err.message])
			}
		}
		return ret
	}
}
