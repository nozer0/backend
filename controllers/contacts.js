const { Company, Contact } = require('./models')

module.exports = {
	async fetch ({ company, withCompanyName, offset, size }, user) {
		try {
			let userId = user._id
			let conds = {}
			if (company) {
				if (user.role > 0) {
					let c = await Company.count({
						_id: company,
						$or: [
		  				{ readers: userId },
		  				{ editors: userId },
		  				{ createdBy: userId }
						]
					})
					if (!c) return
				}
				conds.company = company
			} else if (user.role > 0) {
				let ids = await Company.find({
					$or: [
						{ readers: userId },
	  				{ editors: userId },
	  				{ createdBy: userId }
					]
				}, '_id')
				if (!ids || !ids.length) {
					return
				}
				conds.$or = [
					{ company: { $in: ids.map(c => c._id) } },
					{ createdBy: userId }
				]
			}
			offset = isNaN(offset) ? 0 : +offset
			let data = Contact.find(conds).skip(offset).limit(isNaN(size) ? 25 : +size).sort({ updatedAt: -1 })
			return {
				total: Contact.count(conds),
				offset,
				data: withCompanyName ? data.populate('company', 'name') : data
			}
		} catch (err) {
			console.error(err)
		}
	},
	async getNames ({ keyword, company, withPhone, withCompanyName }, user) {
		try {
			let $and = []
			if (keyword) {
				$and.push({ $or: [
					{ name: { $regex: keyword } },
					{ email: { $regex: keyword, $options: 'i' } }
				]})
			}
			let userId = user._id
			if (company) {
				if (user.role > 0) {
					let c = await Company.count({
						_id: company,
						$or: [
		  				{ readers: userId },
		  				{ editors: userId },
		  				{ createdBy: userId }
						]
					})
					if (!c) return
				}
				$and.push({ company })
			} else if (user.role > 0) {
				let ids = await Company.find({
					$or: [
						{ readers: userId },
	  				{ editors: userId },
	  				{ createdBy: userId }
					]
				}, '_id')
				if (!ids || !ids.length) {
					return
				}
				$and.push({
					$or: [
						{ company: { $in: cs.map(c => c._id) } },
						{ createdBy: userId }
					]
				})
			}
			let conds = $and.length ? { $and } : {}
			let data = Contact.find(conds, withPhone ? 'name email phone' : 'name email')
			return withCompanyName ? data.populate('company', 'name') : data
		} catch (err) {
			console.error(err)
		}
	},
	async get (id, withCompanyName, user) {
		try {
			if (user.role < 1) {
				return withCompanyName ? Contact.findById(id).populate('company', 'name') : Contact.findById(id)
			}
			let data = await Contact.findById(id)
			if (!data) return
			let userId = user._id
			let c = await Company.findOne({
				_id: data.company,
				$or: [
  				{ readers: userId },
  				{ editors: userId },
  				{ createdBy: userId }
				]
			}, 'name')
			if (!c || data.createdBy.toString() !== userId) {
				return
			}
			if (withCompanyName) {
				data.company = c
			}
			return data
		} catch (err) {
			console.error(err)
		}
	},
	async checkPermission(id, userId) {
		let d = await Contact.findById(id, 'createdBy editors')
		return d && d.createdBy === userId || d.editors.includes(userId)
	},
	async post (data, user) {
		try {
			let id = data._id
			let userId = user._id
			if (!id) {
				let model = new Contact(data)
				model.createdBy = userId
				return model.save()
			}
			data.updateBy = userId
			if (user.role < 0) {
				return Contact.findByIdAndUpdate(id, data, { new: true })
			}
			let d = await Contact.findById(id)
			if (!d) return
			let c = await Company.count({
				_id: d.company,
				$or: [
  				{ readers: userId },
  				{ editors: userId },
  				{ createdBy: userId }
				]
			})
			if (!c || d.createdBy.toString() !== userId) {
				return
			}
			Object.assign(d, data)
			return d.save()	
		} catch (err) {
			console.error(err)
		}
	},
	async delete (id, user) {
		if (user.role >= 0) throw new Error('禁止操作')
		try {
			return Contact.findByIdAndRemove(id)
			// let d = await Contact.findById(id, 'createdBy').populate('company', 'editors createdBy')
			// if (!d) return
			// let c = d.company
			// if (d.createdBy !== userId) {
			// 	if (!c || c.createdBy !== userId && !c.editors.includes(userId)) {
			// 		return
			// 	}
			// 	// throw new Error('禁止操作')
			// }
			// return d.remove()
		} catch (err) {
			console.error(err)
		}
	},
	async insertMany (data, options = {}) {
		let ret = []
		for (let d of data) {
			try {
				let p = new Contact(d)
				await p.save()
			} catch (err) {
				console.error([d.name, err.code === 11000 ? '重复数据' : err.message])
				ret.push([d.name, err.code === 11000 ? '重复数据' : err.message])
			}
		}
		console.info(ret)
		return ret
	}
}
