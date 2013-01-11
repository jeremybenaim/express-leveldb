var express = require('express'),
	routes = require('./routes'),
	http = require('http'),
	path = require('path');

var app = express();

app.configure(function () {
	app.set('port', process.env.PORT || 3000);
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.logger('dev'));
	app.use(express.compress());
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(app.router);
	app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function () {
	app.use(express.errorHandler());
});

var users = require('./routes/users');

app.get('/users', users.findAll)
app.post('/users', users.create)
app.get('/users/:id', users.findOne)
app.put('/users/:id', users.update)
app.del('/users/:id', users.del)

// Uncomment this if you want to use Express to serve the home page
// app.get('/', routes.index);

http.createServer(app).listen(app.get('port'), function () {
	console.log("Express server listening on port " + app.get('port'));
});