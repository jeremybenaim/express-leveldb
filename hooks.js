var db = require('./leveldb').connect(),
	colors = require('colors'),
	hooks = require('level-hooks');
	hooks()(db);

/*
 * Setting up elasticsearch client
 */
var es_client = require('./elasticsearch').client(),
	ES_INDEX = 'express-leveldb',
	ES_TYPE = '';


db.hooks.post(function (ch) {
	var type = ch.type,
		ES_TYPE = ch.key.split(':')[0],
		key = ch.key.split(':')[1];

	if (ch.type === 'put') {
		var value = ch.value;
		es_client.index(ES_INDEX, ES_TYPE, {name: value['name']}, {id: value['_id']}, function (err, res) {
			if(err) console.log(err);		
		});
	} else if (ch.type === 'del') {
		es_client.delete(ES_INDEX, ES_TYPE, key, function (err, res) {
			if(err) console.log(err);
		});
	}
	
	console.log(' ✔'.green + ' elasticsearch index updated');
})