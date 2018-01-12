const format = require('date-format')
const { Seq } = require('./models')

module.exports = {
	async refresh (prefix) {
		prefix = prefix.toUpperCase()
		let date = format('yyyyMMdd', new Date())
		try {
			var seq = await Seq.findOne({ prefix })
			if (seq) {
				if (seq.date === date) {
					seq.num += 1
				} else {
					seq.date = date
					seq.num = 1
				}
			} else {
				seq = new Seq({
					prefix,
					date,
					num: 1
				})
			}
			return seq.save()
		} catch (err) {
			console.error(err)
		}
	},
	getSeq (seq) {
		let num = seq.num
		if (num < 10) {
			num = '00' + num
		} else if (num < 100) {
			num = '0' + num
		}
		return seq.prefix + seq.date + num
	},
	get (prefix) {
		try {
			return Seq.findOne({ prefix })
		} catch (err) {
			console.error(err)
		}
	},
	post (data) {
		try {
			if (data._id) {
				return Seq.findByIdAndUpdate(data._id, data, { new: true })
			}
			let model = new Seq(data)
			return model.save()
		} catch (err) {
			console.error(err)
		}
	}
}
