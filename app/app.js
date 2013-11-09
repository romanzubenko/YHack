var express = require('express'),
	http = require('http'),
	path = require('path'),
	app = express(),
	mongoose = require('mongoose'),
	SessionSockets = require('session.socket.io'),
	port = 3000,
	secretCookie = 'mongplia',
	RedisStore = require('connect-redis')(express),
	sessionStore = new RedisStore({ttl: 604800}),
	cookieParser = express.cookieParser(secretCookie),
	RedisStore1 = require("socket.io/lib/stores/redis"),
	redis = require("socket.io/node_modules/redis"),
	pub = redis.createClient(),
	sub = redis.createClient(),
	client = redis.createClient(),
	server,io,schemaLG,helper;



app.configure(function() {
	app.set('port', process.env.PORT || port); // Listening to port 3000
	app.set('view engine', 'jade');
	app.use(express.bodyParser()); //
	app.use(express.cookieParser()); // TODO! try to use: app.use(cookieParser);
	app.use(express.session({store: sessionStore, secret: secretCookie, key: 'express.sid'})); // glue express and Redis Session Store
	app.use(express.methodOverride());
	app.use(app.router); // use express routing
	app.use(express.static(path.join(__dirname, '/../public'))); // serve static files from public folder
});

server = http.createServer(app).listen(app.get('port'), function(){
	console.log("Express server listening on port " + app.get('port'));
});

io = require('socket.io').listen(server, { log: false }); // SocketIO initialization
sessionSockets = new SessionSockets(io, sessionStore, cookieParser, 'express.sid'); // SocketIO with sessions initialization
mongoose.connect('mongodb://localhost/test');
schemaLG = require('./schema');
schemaLG.initializeSchemas(mongoose);
helper = require('./helper_functions');

/*
	Sockets
*/
io.set('authorization', function (handshake, accept) {
	if (!handshake.headers.cookie) {
		return accept('No cookie transmitted.', false);
	} else {
		accept(null, true);
	}
});

io.set ("store", new RedisStore1({
	redisPub: pub,
	redisSub: sub,
	redisClient: client
}));


sessionSockets.on('connection', function (err, socket, session) {
	socket.session = session; // append session to socket

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


/*
	Routes
*/

app.get('/', function(req, res){
	var data = {
		test : "1"
	}
	res.render('index',{
		data : data,
	});
});

