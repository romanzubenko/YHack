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
	server, io, schemaLG, helper;


app.configure(function() {
	app.set('port', process.env.PORT || port); // Listening to port 3000
	app.set('view engine', 'jade');
	app.use(express.bodyParser()); //
	app.use(express.cookieParser()); // TODO! try to use: app.use(cookieParser);
	app.use(express.methodOverride());
	app.use(app.router); // use express routing
	app.use(express.static(path.join(__dirname, '/../public'))); // serve static files from public folder
});

server = http.createServer(app).listen(app.get('port'), function() {
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

global.counter = 0;

var findRelated = function(keyword, socketCB, n, eachCB){
	if( n == null ){ n = 2; }
	else if( n == 0 ) { return eachCB(); }

	mongoose.Related.findOne({ 'keyword': keyword }, function (err, found){
		if (err ) return console.log("Error", err);

		if( found ){
			socketCB(found);
			async.eachSeries(found.related, function(rKey, rkCB){
				findRelated(rKey, socketCB, n-1, rkCB);
			}, function(){
				if(eachCB) eachCB();
			});
		}else{

			request({
				url: "https://api.datamarket.azure.com/Bing/Search/v1/Composite?$format=JSON&Sources=%27RelatedSearch%27&Query=%27"+encodeURIComponent(keyword)+"%27",
				auth: {
					'user': 'romanzubenko@hotmail.com',
					'pass': 'wT2i3TGfdUarg+NDwPoXtCh/d2QeDltuHAYqIvDdFZE',
				}

			}, function (error, response, body) {
				var results = JSON.parse(body).d.results[0].RelatedSearch.map(function(e){
					return e.Title;
				});

				new mongoose.Related({
					keyword: keyword,
					related: results
				}).save(function(err, data){
					if( err ) return console.log("Mongoose Error", err, eachCB());
					console.log(n, data);

					socketCB(data);

					async.eachSeries(data.related, function(rKey, rkCB){
						findRelated(rKey, socketCB, n-1, rkCB);
					}, function(){
						if(eachCB) eachCB();
					});
					/*
					async.mapSeries(data.related, function(rKey, rkCB){
						findRelated(rKey, rkCB, n-1);
					}, function(err, results){
						var merged = [];
							merged = merged.concat.apply(merged, results);
						var a = {};
						a[keyword] = merged;
						callBack(null, a);
					});
*/

				});
			});

		}
	});
};
/*
function translatePhrase(data) {
	s.src = "http://api.microsofttranslator.com/V2/Ajax.svc/Translate&from="
				+ encodeURIComponent(from) +
                "&to=" + encodeURIComponent(to) +
                "&text=" + encodeURIComponent(text)

    request({
		url: "https://api.datamarket.azure.com/Bing/Search/v1/Composite?$format=JSON&Sources=%27RelatedSearch%27&Query=%27"+encodeURIComponent(query)+"%27",
		auth: {
			'user': 'hiroki.osame@gmail.com',
			'pass': 'MP2WykKO3YUL/Gfww+RKEYgW0XyjfAtNvHDli6/+lH0',
		}
}
*/
function calculateRatings(data,socket,callback) {
	for (var i = data.words.length - 1; i >= 0; i--) {
		queryRating(data.words[i],socket,callback);
	};
	for (var i = data.bigrams.length - 1; i >= 0; i--) {
		queryRating(data.bigrams[i],socket,callback);
	};
	for (var i = data.trigrams.length - 1; i >= 0; i--) {
		queryRating(data.trigrams[i],socket,callback);
	};
}

function queryRating(phrase,socket,callback) {
	console.log(socket);
	var query;
	if (typeof phrase === 'string') {
		query = phrase;
	} else {
		query = phrase.join(' ');
	}

	console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!QUERY :" + query);
	mongoose.Freq.findOne({'query': query }, function (err, found){
		if (found) {
			global.counter += 1;
			console.log("concept.." + global.counter)
			socket.emit("PHRASE",{"phrase" : query, "score" : found.score})
			return;
		}

		request({
			url: "https://api.datamarket.azure.com/Bing/Search/v1/Composite?$format=JSON&Sources=%27RelatedSearch%27&Query=%27"+encodeURIComponent(query)+"%27",
			auth: {
				'user': 'hiroki.osame@gmail.com',
				'pass': 'MP2WykKO3YUL/Gfww+RKEYgW0XyjfAtNvHDli6/+lH0',
			}

		}, function (error, response, body) {
			global.counter += 1;
			console.log("bing.." + global.counter)
			try {
				var parsedBody = JSON.parse(body);
				if (isNan(WebTotal)) {
					var score = 0;
				} else {
					var score = Number(parsedBody.WebTotal);
				}
				console.log("!!!!!!!!!!!!!!!DONE")
				console.log({"phrase" : query, "score" : score})
				socket.emit("PHRASE",{"phrase" : query, "score" : score})
			} catch(err) {

			}
		});

		request({
			url: "http://conceptnet5.media.mit.edu/data/5.1/c/en/" + query
		},function (error, response, body) {
			global.counter += 1;
			console.log("concept.." + global.counter)
			var score = Number(JSON.parse(body).maxScore); // HIROKI PLEASE HELP ME HERE
			console.log("!!!!!!!!!!!!!!!DONE")
			console.log({"phrase " : query, "score" : score})
			socket.emit("PHRASE",{"phrase" : query, "score" : score});
		});
	});
}


io.on('connection', function (socket) {
	socket.on("bing-search", function(keyword) {
		findRelated(keyword, socket.emit.bind(this, "bing-searchComplete"));
	});

	socket.on('fbUserData',function(fbdata) {
		console.log("Incoming socket: fbUserData...");
		console.log(fbdata);
		var l = new mongoose.Corpus({text : fbdata});
		l.save(function(err){
			console.log("saved");
			var python = child.spawn('python', ['nlp/freq.py', l._id.toString()]);
			python.stdout.on('data', function (data) {
				console.log("get shit from python")
				data = JSON.parse(data);
				calculateRatings(data,socket,function(result){});
			});
		});
	});

	socket.on('translate', function(translate){
		request.get(
			"https://www.googleapis.com/language/translate/v2?key=AIzaSyDdWPhyu-7gSmPjIuztNYlz3_pphztalM8&source=en&target="+encodeURIComponent(translate.target)+"&q="+encodeURIComponent(translate.q),
			function(error, response, data) {
				if (error) return console.log("err", error);
				console.log("translated ")
				console.log(translate)
				console.log(data);
				socket.emit("translateComplete", [translate.q, JSON.parse(data).data.translations[0].translatedText]);
			}
		);
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
app.get('/sigma', function(req, res){
	res.render('sigma');
});

app.get('/asl', function(req, res){
	var data = {
		test : "1"
	}
	res.render('asl',{
		data : data,
	});
});

