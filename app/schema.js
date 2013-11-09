/*
	Schemes for MongoDB
*/
var initializeSchemas = function(mongoose) {
	Schema = mongoose.Schema;
	
	var SampleSchema = new Schema({
		name: String,
	}),


	SampleSchema = mongoose.model('Sample', SampleSchema);
	
};

module.exports.initializeSchemas = initializeSchemas;