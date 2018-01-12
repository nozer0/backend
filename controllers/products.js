const models = require('./models')

const { Product } = models

module.exports = {
	fetch ({ category, vendor, name, offset, size }) {
		try {
			let conds = {}
			if (category) {
				conds.category = category
			}
			if (vendor) {
				conds.vendor = vendor
			}
			if (name) {
				conds.$or = [{ model: { $regex: name } }, { name: { $regex: name } }]
			}
			offset = isNaN(offset) ? 0 : +offset
			return {
				total: Product.count(conds),
				offset,
				data: Product.find(conds).skip(offset).limit(isNaN(size) ? 25 : +size).sort({ updatedAt: -1 })
			}
		} catch (err) {
			console.error(err)
		}
	},
	getNames ({ keyword, category, vendor }) {
		try {
			let $and = []
			if (category) {
				$and.push({ category })
			}
			if (vendor) {
				$and.push({ vendor })
			}
			if (keyword) {
				$and.push({ $or: [
					{ model: { $regex: keyword, $options: 'i' } },
					{ name: { $regex: keyword } }
				]})
			}
			let conds = $and.length ? { $and } : {}
			return Product.find(conds, 'model name vendor')
		} catch (err) {
			console.error(err)
		}
	},
	get (id) {
		try {
			return Product.findById(id)
		} catch (err) {
			console.error(err)
		}
	},
	getByModel (model) {
		try {
			return Product.findOne({ model })
		} catch (err) {
			console.error(err)
		}
	},
	async post (data, user) {
		try {
			let userId = user._id
			if (data._id) {
				data.updateBy = userId
				return Product.findByIdAndUpdate(data._id, data, { new: true })
			}
			if (data.model) {
				let d = await Product.findOne({ model: data.model }, '_id')
				if (d) {
					data.updateBy = userId
					return Product.findByIdAndUpdate(d._id, data, { new: true })
				}
			}
			let model = new Product(data)
			model.createdBy = userId
			return model.save()
		} catch (err) {
			console.error(err)
		}
	},
	delete (id) {
		if (user.role >= 0) throw new Error('禁止操作')
		try {
			return Product.findByIdAndRemove(id)
		} catch (err) {
			console.error(err)
		}
	},
	async insertMany (data, options = {}) {
		let ret = []
		for (let d of data) {
			try {
				let p = new Product(d)
				await p.save()
			} catch (err) {
				// console.error(err)
				ret.push([d.model, err.code === 11000 ? '重复数据' : err.message])
			}
		}
		return ret
	}
}
