var levelup = require('levelup'),
	namespace = require('level-namespace'),
	
	db = levelup('/tmp/my_db', {encoding: 'json', createIfMissing: true}, function (err, db) {
		if (err) return console.log('Ooops!', err);
		console.log('Connected to levelDB database', db._location)
	});

/*
 * Setting up namespace "users" for leveldb
 */
namespace(db)
var users = db.namespace('users');


/*
 * Define a model for User object
 */
function User(data) {
	if (!(this instanceof User)) return new User(name);

	var data = data || {};

	this._id = data._id || null;
	this.name = data.name || null;

	return this
};
User.prototype = {
	get: function (val) {
		return this[val];
	},
	set: function (val, data) {
		this[val] = data;
	}
	// TODO: add validation methods here, maybe?
};


/*
 * Create a new user
 */
exports.create = function (req, res) {
	var user = req.body
	  , ts = Math.round(new Date().getTime())

	var u = new User(user);
	u.set('_id', ts);

	users.put(ts, u, function (err) {
		if (err) return res.status(304).end('error');

		res.send('user #' + ts + ' successfully created');
	});
};

/*
 * Update an existing user
 */
exports.update = function (req, res) {
	var user = req.body
	  , id = req.params.id;

	users.get(id, function (err, value) {
		if (err) return res.status(304).end('error');

		// create a new User object from the value returned by the DB...
		var u = new User(value);
		// ..and apply only changes that fits in the model (other params will be ommitted)
		for (var i in user) {
			if (u.hasOwnProperty(i)) {
				u.set(i, user[i]);
			}
		}

		users.put(id, u, function (err) {
			if (err) return res.status(304).end('error');

			res.end('user successfully updated');
		});

	});
};

/*
 * Delete an exisiting user
 */
exports.del = function (req, res) {
	var id = req.params.id;

	users.del(id, function (err) {
		if (err) return res.status(304).end('error');

		res.end('user successfully removed');
	});
};


/*
 * Retrieve an existing user
 */
exports.findOne = function (req, res) {
	var id = req.params.id;

	users.get(id, function (err, value) {
		if (err) return res.status(404).end('user does not exist');
		res.json(value);
	});
};


/*
 * Retrieve an array of all users
 */
exports.findAll = function (req, res) {
	var all = [];
	users.valueStream()
		.on('data', function (data) {
			all.push(data);
		})
		.on('error', function (err) {
			console.log('Oh my!', err)
		})
		.on('end', function () {
			res.json(all);
		});
};