var express = require('express'),
	http = require('http'),
	path = require('path'),
	app = express(),
	mongoose = require('./schema'),
	port = 3000,

	secretCookie = 'mongolia',
	cookieParser = express.cookieParser(secretCookie),
<<<<<<< HEAD
	server, io, schemaLG, helper;
	
=======
	server,io,schemaLG,helper;

>>>>>>> 5cd0909cec5f1467d1e4d1b0c51d041080343aa5


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

mongoose.connect('mongodb://localhost/test');

helper = require('./helper_functions');

/* Sockets */
io.set('authorization', function (handshake, accept) {
	if (!handshake.headers.cookie) {
		return accept('No cookie transmitted.', false);
	} else {
		accept(null, true);
	}
});


io.on('connection', function (socket) {


	socket.on("bing-search",function(data) {
		// Hiroki, do your magic here

		// test output
		var result = {}
		result[data] = [
				{"devide and conquer" : ['algorithm','sorting']},
				{"graph algorithm" : ['min flow','cut property']},
			]
		socket.emit("bing-searchComplete",result);
	});

	socket.on('fbUserData',function(user) {
		console.log("Incoming socket: fbUserData...");
		helper.register(userdata,socket,function(message) {
		  console.log(userdata);
			socket.emit('fbUserDataComplete',message);
		});
	});

})


/* Routes */

app.get('/', function(req, res){
	var data = {
		test : "1"
	}
	res.render('index',{
		data : data,
	});
});

