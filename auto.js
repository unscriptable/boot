/** @license MIT License (c) copyright 2014 original authors */
/** @author Brian Cavalier */
/** @author John Hann */
module.exports = {
	main: autoConfigure
};

var bowerMetaData = require('./lib/metadata/bower');

var defaultMeta = 'boot.json,bower.json,package.json';

var metaProcessors = {
	'bower.json': bowerMetaData
};

function autoConfigure (context) {
	var urls, processors, howMany, i;

	if (!context.bootMeta) context.bootMeta = defaultMeta;

	urls = context.bootMeta.split(/\s*,\s*/);
	howMany = urls.length;
	processors = [];

	for (i = 0; i < howMany; i++) {
		// TODO: this won't work for user-supplied urls
		if (metaProcessors[urls[i]]) {
			processors.push(metaProcessors[urls[i]].process(context));
		}
		Promise.all(processors).then(done, log);
	}

	function done (metadatas) {
		console.log(metadatas);
		console.log(context);
	}

	function log (ex) {
		console.error('Did not load metadata', ex);
		console.error(ex.stack);
	}
}

// 1. Load metadata files (.json files) --> done
// 2. Extract metadata about packages and main module(s) --> done
// 3. Get metadata files for each package (recursive) --> done
// 4. Configure package descriptors and create pipelines for each
// 5. Load the application's main.
