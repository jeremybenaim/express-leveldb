var levelup = require('levelup'),
	_db = levelup('/tmp/my_db', {encoding: 'json', createIfMissing: true}, function (err, db) {
		if (err) return console.log('Ooops!', err);
		console.log('Connected to levelDB database', db._location)
	});

exports.connect = function () {
	return _db;
};