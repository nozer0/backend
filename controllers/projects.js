const { Types: { ObjectId } } = require('mongoose')
const { Project } = require('./models')
const Seq = require('./seqs')

module.exports = {
	fetch ({ customer, name, region, type, phase, step, status, offset, size }, user) {
		try {
			let $and = []
			if (name) {
				$and.push({ $or: [
					{ name: { $regex: name } },
					{ email: { $regex: name, $options: 'i' } }
				]})
			}
			if (customer) {
				$and.push({ 'customer.company': customer })
			}
			if (region) {
				$and.push({ region })
			}
			if (type) {
				$and.push({ type })
			}
			if (phase) {
				$and.push({ phase })
			}
			if (step) {
				$and.push({ step })
			}
			if (status) {
				$and.push({ status })
			}
			if (user.role > 0) {
				let userId = user._id
				$and.push({
					$or: [
						{ auditor: userId },
						{ salesman: userId },
	  				{ supportmen: userId },
	  				{ engineers: userId },
						{ createdBy: userId }
					]
				})
			}
			let conds = $and.length ? { $and } : {}
			offset = isNaN(offset) ? 0 : +offset
			let data = Project.find(conds).skip(offset).limit(isNaN(size) ? 25 : +size).sort({ updatedAt: -1 })
			return {
				total: Project.count(conds),
				offset,
				data
			}
		} catch (err) {
			console.error(err)
		}
	},
	getNames ({ keyword, customer, withRegion }, user) {
		try {
			let $and = []
			if (keyword) {
				$and.push({ $or: [
					{ name: { $regex: keyword } },
					{ email: { $regex: keyword, $options: 'i' } }
				]})
			}
			if (customer) {
				$and.push({ 'customer.company': customer })
			}
			if (user.role > 0) {
				let userId = user._id
				$and.push({
					$or: [
						{ auditor: userId },
						{ salesman: userId },
	  				{ supportmen: userId },
	  				{ engineers: userId },
						{ createdBy: userId }
					]
				})
			}
			let conds = $and.length ? { $and } : {}
			let data = Project.find(conds, withRegion ? 'code name region' : 'code name')
			return data
		} catch (err) {
			console.error(err)
		}
	},
	get (id, user) {
		try {
			if (user.role < 1) return Project.findById(id)
			let userId = user._id
			return Project.findOne({
				_id: id,
				$or: [
					{ auditor: userId },
					{ salesman: userId },
  				{ supportmen: userId },
  				{ engineers: userId },
					{ createdBy: userId }
				]
			})
		} catch (err) {
			console.error(err)
		}
	},
	async checkPermission(id, userId) {
		let d = await Project.findById(id, 'createdBy')
		return d && d.createdBy === userId
	},
	async post (data, user) {
		try {
			let id = data._id
			let userId = user._id
			let role = user.role
			if (!id) {
				if (role > 1 && role !== 4) {
					throw new Error('禁止操作')
				}
				let model = new Project(data)
				model.createdBy = userId
				model.code = Seq.getSeq(await Seq.refresh('P'))
				return model.save()
			}
			data.updateBy = userId
			if (role < 1) {
				return Project.findByIdAndUpdate(id, data, { new: true })
			}
			return Company.findOneAndUpdate({
				_id: id,
				$or: [
					{ auditor: userId },
					{ salesman: userId },
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
			return Project.findByIdAndRemove(id)
			// let d = await Project.findById(id, 'createdBy')
			// if (!d || d.createdBy !== user._id) {
			// 	return
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
				let p = new Project(d)
				p.code = 'P' + date + (num < 100 ? num < 10 ? '00' : '0' : '') + num
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
