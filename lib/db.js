var mongoose = require('mongoose')
var config = require('../config')

mongoose.connect(config.mongodb.uri, {useMongoClient: true})

var db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', function() {
})

module.exports = mongoose