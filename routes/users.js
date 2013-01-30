var uuid = require('node-uuid'),
	db = require('../leveldb').connect();

/*
 * Setting up hooks
 */
// var hooks = require('level-hooks');
// hooks()(db);


/*
 * Setting up namespace "users" for leveldb
 */
var namespace = require('level-namespace');
namespace(db);
var users = db.namespace('users');

/*
 * Setting up elasticsearch
 */
var elastical = require('elastical'),
	es_client = new elastical.Client(),
	INDEX = 'express-leveldb', // this would never change (see it as the ES counterpart of our DB)
	TYPE = 'users';	// this is the the type of document (== to the namespace)


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
		
		es_client.index(INDEX, TYPE, {name: u.get('name')}, {id: u.get('_id')}, function (err, res) {
			if(err) console.log(err);
			console.log('User successfully added to the index', INDEX, 'w/ type', TYPE)
		});

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

			es_client.index(INDEX, TYPE, {name: u.get('name')}, {id: u.get('_id')}, function (err, res) {
				if(err) console.log(err);
				console.log('User successfully updated in the index', INDEX, 'w/ type', TYPE)
			});

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
		
		es_client.delete(INDEX, TYPE, id, function (err, res) {
			if(err) console.log(err);
		    console.log('User successfully deleted from the index', INDEX, 'w/ type', TYPE)
		});
		
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
	
	es_client.search({"query":{"match_all":{}}}, function (err, results, res) {
    	if (!err) {
	    	var hits = [], i;

	    	for (i in results.hits){
	    		hits.push(results.hits[i]._source)
	    	}

    		console.log('\n results \n', hits);
	    }
    });
};


/*
 * Search through all users (using elasticsearch)
 */
exports.search = function (req, res) {
	var id = req.params.id;
};