var uuid = require('node-uuid'),
	db = require('../leveldb').connect(),
	namespace = require('level-namespace')

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
User.prototype.get = function (val) {
	return this[val];
},
User.prototype.set = function (val, data) {
	this[val] = data;
}
// TODO: add validation methods here, maybe?


/*
 * Create a new user
 */
exports.create = function (req, res) {
	var user = req.body,
		id = uuid.v1();

	var u = new User(user);
	u.set('_id', id);

	users.put(id, u, function (err) {
		if (err) {
			console.log(err);
			return res.json(500, {'error': {'message': 'Oops, error. Not sure about what happened here.'}});
		}
		res.json({'success': 'User successfully created!', 'data': u});
	});
};

/*
 * Update an existing user
 */
exports.update = function (req, res) {
	var user = req.body,
		id = req.params.id;

	users.get(id, function (err, value) {
		if (err) {
			console.log(err);
			return res.json(400, {'error': {'message': 'User not found'}});
		}

		// create a new User object from the value returned by the DB...
		var u = new User(value);
		// ..and apply only changes that fits in the model (other params will be ommitted)
		for (var i in user) {
			if (u.hasOwnProperty(i)) {
				u.set(i, user[i]);
			}
		}

		users.put(id, u, function (err) {
			if (err) {
				console.log(err);
				return res.json(500, {'error': {'message': 'Oops, error. Not sure about what happened here.'}});
			}

			res.json({'success': 'User successfully updated!', 'data': u});
		});

	});
};

/*
 * Delete an exisiting user
 */
exports.del = function (req, res) {
	var id = req.params.id;

	users.del(id, function (err) {
		if (err) {
			console.log(err);
			return res.json(400, {'error': {'message': 'User not found'}});
		}

		res.json({'success': 'User successfully removed!'});
	});
};


/*
 * Retrieve an existing user
 */
exports.findOne = function (req, res) {
	var id = req.params.id;

	users.get(id, function (err, value) {
		if (err){
			console.log(err);
			return res.json(400, {'error': {'message': 'User not found'}});
		}

		res.json({'success': 'User exists!', 'data' : value});
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
