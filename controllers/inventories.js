const { Project, Inventory } = require('./models')

module.exports = {
	async fetch ({ project, createdBy, offset, size }, user) {
		try {
			let userId = user._id
			let conds = {}
			if (project) {
				if (user.role > 0) {
					let c = await Project.count({
						_id: project,
						$or: [
							{ salesman: userId },
		  				{ supportmen: userId },
		  				{ engineers: userId }
						]
					})
					if (!c) return
				}
				conds.project = project
			} else if (user.role > 0) {
				let ids = await Project.find({
					$or: [
						{ salesman: userId },
	  				{ supportmen: userId },
	  				{ engineers: userId }
					]
				}, '_id')
				if (!ids || !ids.length) {
					return
				}
				conds.$or = [
					{ project: { $in: ids.map(c => c._id) } },
					{ createdBy: userId }
				]
			}
			offset = isNaN(offset) ? 0 : +offset
			let data = Inventory.find(conds).skip(offset).limit(isNaN(size) ? 25 : +size).sort({ updatedAt: -1 })
			return {
				total: Inventory.count(conds),
				offset,
				data
			}
		} catch (err) {
			console.error(err)
		}
	},
	async get (id, user) {
		try {
			if (user.role < 1) {
				return Inventory.findById(id)
			}
			let data = await Inventory.findById(id)
			if (!data) return
			let userId = user._id
			let c = await Project.findOne({
				_id: data.project,
				$or: [
					{ salesman: userId },
  				{ supportmen: userId },
  				{ engineers: userId }
				]
			}, 'name')
			if (!c || data.createdBy.toString() !== userId) {
				return
			}
			return data
		} catch (err) {
			console.error(err)
		}
	},
	async post (data, user) {
		try {
			let id = data._id
			let userId = user._id
			if (!id) {
				let model = new Inventory(data)
				model.createdBy = userId
				return model.save()
			}
			data.updateBy = userId
			if (user.role < 0) {
				return Inventory.findByIdAndUpdate(id, data, { new: true })
			}
			let d = await Inventory.findById(id)
			if (!d) return
			let c = await Project.count({
				_id: d.company,
				$or: [
					{ salesman: userId },
  				{ supportmen: userId }
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
			return Inventory.findByIdAndRemove(id)
			// let d = await Inventory.findById(id, 'createdBy').populate('company', 'editors createdBy')
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
	}
}
