var elastical = require('elastical'),
	_es_client = new elastical.Client();

exports.client = function () {
	return _es_client;
};

/*
 * Setting up elasticsearch client
 */
var ES_INDEX = 'express-leveldb';
	ES_TYPE = '';

/*
 * Search through all users (using elasticsearch)
 */
exports.search = function (req, res) {
	var type = req.params.type,
		field = req.params.field,
		query = req.params.query;

	var q = {"query":{"query_string":{"default_field":field,"query":query}}};

	_es_client.search(q, function (err, results, response) {
		if (err) {
			console.log(err);
			return res.json(500, {'error': {'message': 'Oops, error. Not sure about what happened here.'}});
		}
		else {
			console.log(response);
			var hits = [], i;

			for (i in results.hits){
				hits.push({'_id' : results.hits[i]._id, 'data': results.hits[i]._source})
			}

			res.json({'count': results.total, 'data': hits});
		}
	});

};

/*
 * Search through all users with a wildcard positioned by default
 */
exports.autocomplete = function (req, res) {
	var field = req.params.field;
		query = req.params.query + '*';

	var q = {"query":{"query_string":{"default_field":field,"query":query}}};

	_es_client.search(q, function (err, results, response) {
		if (err) {
			console.log(err);
			return res.json(500, {'error': {'message': 'Oops, error. Not sure about what happened here.'}});
		}
		else {
			console.log(response);
			var hits = [], i;

			for (i in results.hits){
				hits.push({'_id' : results.hits[i]._id, 'data': results.hits[i]._source})
			}

			res.json({'count': results.total, 'data': hits});
		}
	});

};