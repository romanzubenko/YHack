/*
	Schemes for MongoDB
*/
var mongoose = require('mongoose');

exports.Related = mongoose.model('Related', {
	keyword: {
		type: String,
		required: true,
		unique: true
	},
	related: [String]
});
exports.connect = function() {
	mongoose.connect('mongodb://localhost/yhack');

	var db = mongoose.connection;
	db.on('error', console.error.bind(console, 'connection error:'));
	db.once('open', function callback () {
		console.log("MongoDB is Connected!");
	});
};