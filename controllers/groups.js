const { Group } = require('./models')

module.exports = {
	fetch () {
		try {
			return Group.find()
		} catch (err) {
			console.error(err)
		}
	},
	get (id) {
		try {
			return Group.findById(id)
		} catch (err) {
			console.error(err)
		}
	},
	post (data, user) {
	  if (user.role >= 0 && (!user.isManager || !user.group)) {
	    throw new Error('禁止操作')
	  }
		try {
			let group = user.group && user.group.toString()
			let id = data._id
			if (!id) {
				if (user.role >= 0 && group !== data.parent) {
					throw new Error('禁止操作')
				}
				let model = new Group(data)
				return model.save()
			}
			if (user.role >= 0 && id !== group && data.parent && data.parent !== group) {
	    	throw new Error('禁止操作')
			}
			return Group.findByIdAndUpdate(data._id, data, { new: true })
		} catch (err) {
			console.error(err)
		}
	},
	async delete (id, user) {
	  if (user.role >= 0 && (!user.isManager || !user.group)) {
	    throw new Error('禁止操作')
	  }
		try {
			if (user.role < 0) {
				return Group.findByIdAndRemove(id)
			}
			let group = user.group.toString()
			let d = await Group.findById(id)
			if (!d || (id !== group && d.parent && d.parent !== group)) {
				throw new Error('禁止操作')
			}
			return d.remove()
		} catch (err) {
			console.error(err)
		}
	}
}
