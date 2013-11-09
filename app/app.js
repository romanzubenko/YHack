var express = require('express'),
	http = require('http'),
	path = require('path'),
	app = express(),
	mongoose = require('./schema'),
	port = 3000,
	async = require('async'),
	request = require('request'),
	secretCookie = 'mongolia',
	child = require('child_process'),
	cookieParser = express.cookieParser(secretCookie),
	server, io, schemaLG, helper,
	ObjectID = require('mongodb').ObjectID;


app.configure(function() {
	app.set('port', process.env.PORT || port); // Listening to port 3000
	app.set('view engine', 'jade');
	app.use(express.bodyParser()); //
	app.use(express.cookieParser()); // TODO! try to use: app.use(cookieParser);
	app.use(express.methodOverride());
	app.use(app.router); // use express routing
	app.use(express.static(path.join(__dirname, '/../public'))); // serve static files from public folder
});

server = http.createServer(app).listen(app.get('port'), function(){
	console.log("Express server listening on port " + app.get('port'));
});

io = require('socket.io').listen(server, { log: false }); // SocketIO initialization

mongoose.connect();

helper = require('./helper_functions');

/* Sockets */
io.set('authorization', function (handshake, accept) {
	if (!handshake.headers.cookie) {
		return accept('No cookie transmitted.', false);
	} else {
		accept(null, true);
	}
});



var findRelated = function(keyword, callBack, n){
	if( n == null ){ n = 2; }
	else if( n == 0 ) { return callBack(null, [keyword]); }

		
	mongoose.Related.findOne({ 'keyword': keyword }, function (err, found){
		if (err ) return console.log("Error", err);

		if( found ){

			async.mapSeries(found.related, function(rKey, rkCB){
				findRelated(rKey, rkCB, n-1);
			}, function(err, results){
				var merged = [];
					merged = merged.concat.apply(merged, results);
				var a = {};
				a[keyword] = merged;
				callBack(null, a);
			});

		}else{
			console.log("made a request");
			/*
			request({
				url: "https://api.datamarket.azure.com/Bing/Search/v1/Composite?$format=JSON&Sources=%27RelatedSearch%27&Query=%27"+encodeURIComponent(keyword)+"%27",
				auth: {
					'user': 'hiroki.osame@gmail.com',
					'pass': 'MP2WykKO3YUL/Gfww+RKEYgW0XyjfAtNvHDli6/+lH0',
				}

			}, function (error, response, body) {
				var results = JSON.parse(body).d.results[0].RelatedSearch.map(function(e){
					return e.Title;
				});

				new mongoose.Related({
					keyword: keyword,
					related: results
				}).save(function(err, data){
					if( err ) return console.log("Mongoose Error", err, callBack());
					console.log(n, data);

					async.eachSeries(data.related, function(rKey, rkCB){
						findRelated(rKey, rkCB, n-1 );
					}, function(){
						callBack();
					});
				});
			});
			*/
		}
	});
};


function calculateRatings(data,callback) {
	async.parallel({
		words : function(callback){
			sync.map(data.words,queryRating,callback);
		},
		bigrams : function(callback){
			sync.map(data.bigrams,queryRating,callback);
		},
		trigrams : function(callback){
			sync.map(data.trigrams,queryRating,callback);
		}
	},function(err,r){
		if (err) {
			console.log("error 1");
			callback([false,false,false])
		}
		callback(r)
	});
}


function queryRating(phrase,callback) {
	var query;
	if (typeof phrase === 'string') {
		query = phrase;
	} else {
		query = phrase.join(' ');
	}
	async.parallel({
		bing: function(callback){
			callback(err,110000)
		},
		concept: function(callback){
			callback(err,2000)
		},
	},function(err, r) {
		if (err) {
			console.log("MongoDB error: finding song for adding track id : " + songID);
			callback([false,"Database error"])
			return;
		}
		callback(null,r.bing + r.concept * 1000);
	});
}



io.on('connection', function (socket) {



	socket.on("bing-search", function(keyword) {

		console.log("Received");
		findRelated(keyword, function(err, result){
			console.log("Done!", err, result);
			socket.emit("bing-searchComplete", result);
		});

		/*
		// test output
		var result = {}
		result[data] = [
				{"devide and conquer" : ['algorithm','sorting']},
				{"graph algorithm" : ['min flow','cut property']},
			]
		*/
		//socket.emit("bing-searchComplete", result);
	});

	socket.on('fbUserData',function(fbdata) {
		console.log("Incoming socket: fbUserData...");
		var l = new mongoose.Corpus({text : fbdata});
		l.save(function(err){
			console.log("saved");
			var python = child.spawn('python', ['nlp/freq.py', l._id.toString()]);
			python.stdout.on('data', function (data) {
				data = JSON.parse(data);
				calculateRatings(data,function(result){
					console.log("I can't believe it ");
					console.log(result);
				});
				
			});
		});
	});
});


/* Routes */

app.get('/', function(req, res){
	var data = {
		test : "1"
	}
	res.render('index',{
		data : data,
	});
});

