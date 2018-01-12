const { WorkOrder } = require('./models')
const Seq = require('./seqs')

module.exports = {
	fetch ({ project, assignee, step, createdBy, offset, size }, user) {
		try {
			let $and = []
			if (assignee) {
				$and.push({ $or: [
					{ assignee },
					{ workers: assignee }
				]})
			}
			if (project) {
				$and.push({ project })
			}
			if (!isNaN(step)) {
				$and.push({ step })
			}
			if (createdBy) {
				$and.push({ createdBy })
			}
			if (user.role > 0) {
				let userId = user._id
				$and.push({
					$or: [
						{ assignee: userId },
	  				{ workers: userId },
						{ createdBy: userId }
					]
				})
			}
			let conds = $and.length ? { $and } : {}
			offset = isNaN(offset) ? 0 : +offset
			let data = WorkOrder.find(conds).skip(offset).limit(isNaN(size) ? 25 : +size).sort({ updatedAt: -1 })
			return {
				total: WorkOrder.count(conds),
				offset,
				data
			}
		} catch (err) {
			console.error(err)
		}
	},
	get (id, user) {
		try {
			if (user.role < 1) return WorkOrder.findById(id)
			let userId = user._id
			return WorkOrder.findOne({
				_id: id,
				$or: [
					{ assignee: userId },
	  			{ workers: userId },
					{ createdBy: userId }
				]
			})
		} catch (err) {
			console.error(err)
		}
	},
	async checkPermission(id, userId) {
		let d = await WorkOrder.findById(id, 'createdBy')
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
				let model = new WorkOrder(data)
				model.createdBy = userId
				model.code = Seq.getSeq(await Seq.refresh('W'))
				return model.save()
			}
			data.updateBy = userId
			if (role < 1) {
				return WorkOrder.findByIdAndUpdate(id, data, { new: true })
			}
			return Company.findOneAndUpdate({
				_id: id,
				$or: [
					{ assignee: userId },
	  			{ workers: userId },
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
			return WorkOrder.findByIdAndRemove(id)
			// let d = await WorkOrder.findById(id, 'createdBy')
			// if (!d || d.createdBy !== user._id) {
			// 	return
			// }
			// return d.remove()
		} catch (err) {
			console.error(err)
		}
	}
}
