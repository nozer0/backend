const { Company } = require('./models')
const Seq = require('./seqs')

module.exports = {
	fetch ({ type, region, name, withContacts, offset, size }, user) {
		try {
			let $and = []
			if (type) {
				$and.push({ type })
			}
			if (region) {
				$and.push({ region })
			}
			if (name) {
				$and.push({ $or: [
					{ code: { $regex: name, $options: 'i' } },
					{ name: { $regex: name } }
				]})
			}
			if (user.role > 0) {
				let userId = user._id
				$and.push({
					$or: [
						{ readers: userId },
	  				{ editors: userId },
	  				{ createdBy: userId }
					]
				})
			}
			let conds = $and.length ? { $and } : {}
			offset = isNaN(offset) ? 0 : +offset
			let data = Company.find(conds).skip(offset).limit(isNaN(size) ? 25 : +size).sort({ updatedAt: -1 })
			return {
				total: Company.count(conds),
				offset,
				data: withContacts ? data.populate('contacts') : data
			}
		} catch (err) {
			console.error(err)
		}
	},
	getNames ({ keyword, type, region }, user) {
		try {
			let $and = []
			if (type) {
				$and.push({ type })
			}
			if (region) {
				$and.push({ region })
			}
			if (keyword) {
				$and.push({ $or: [
					{ code: { $regex: keyword, $options: 'i' } },
					{ name: { $regex: keyword } }
				]})
			}
			if (user.role > 0) {
				let userId = user._id
				$and.push({
					$or: [
						{ readers: userId },
	  				{ editors: userId },
	  				{ createdBy: userId }
					]
				})
			}
			let conds = $and.length ? { $and } : {}
			return Company.find(conds, 'name code region')
		} catch (err) {
			console.error(err)
		}
	},
	get (id, user) {
		try {
			if (user.role < 1) return Company.findById(id)
			let userId = user._id
			return Company.findOne({
				_id: id,
				$or: [
					{ readers: userId },
  				{ editors: userId },
  				{ createdBy: userId }
				]
			})
		} catch (err) {
			console.error(err)
		}
	},
	getByCode (model, user) {
		try {
			if (user.role < 1) return Company.findOne({ code })
			let userId = user._id
			return Company.findOne({
				code,
				$or: [
					{ readers: userId },
  				{ editors: userId },
  				{ createdBy: userId }
				]
			})
		} catch (err) {
			console.error(err)
		}
	},
	async checkPermission(id, user) {
		if (user.role < 1) return true
		let d = await Company.findById(id, 'createdBy editors')
		return d && d.createdBy === userId || d.editors.includes(userId)
	},
	async post (data, user) {
		try {
			let id = data._id
			let userId = user._id
			if (!id) {
				let model = new Company(data)
				model.createdBy = userId
				model.code = Seq.getSeq(await Seq.refresh('C'))
				return model.save()
			}
			data.updateBy = userId
			if (user.role < 0) {
				return Company.findByIdAndUpdate(id, data, { new: true })
			}
			return Company.findOneAndUpdate({
				_id: id,
				$or: [
  				{ editors: userId },
  				{ createdBy: userId }
				]
			}, data, { new: true })
		} catch (err) {
			console.error(err)
		}
	},
	async delete (id, user) {
		if (user.role >= 0) throw new Error('禁止操作')
		try {
			return Company.findByIdAndRemove(id)
			// don't allow others to delete
			// let d = await Company.findById(id, 'createdBy')
			// if (!d || d.createdBy !== user._id) {
			// 	return null
			// }
			// return d.remove()
		} catch (err) {
			console.error(err)
		}
	},
	async insertMany (data, options = {}) {
		let ret = []
		let seq = await Seq.refresh('C')
		let date = seq.date
		let num = seq.num
		for (let d of data) {
			try {
				let p = new Company(d)
				p.code = 'C' + date + (num < 100 ? num < 10 ? '00' : '0' : '') + num
				await p.save()
				num += 1
			} catch (err) {
				console.error([d.name, err.code === 11000 ? '重复数据' : err.message])
				ret.push([d.name, err.code === 11000 ? '重复数据' : err.message])
			}
		}
		console.info(ret)
		if (num !== seq.num) {
			try {
				await seq.save()
			} catch (err) {
				console.error(err)
			}
		}
		return ret
	}
}
