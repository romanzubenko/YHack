var request = require('request'),
	async = require('async'),
	mongoose = require('./app/schema');

mongoose.connect();


async.eachSeries([1, 2, 3, 4], function(rKey, rkCB){
	console.log(rKey);
	rkCB("a");
}, function(f){
	console.log(f);
});
async.mapSeries(['file1','file2','file3'], function(r, cb){
	console.log(r);
	cb(null, r+"2");
}, function(err, results){
	console.log(results);
    // results is now an array of stats for each file
});