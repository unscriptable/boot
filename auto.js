/** @license MIT License (c) copyright 2014 original authors */
/** @author Brian Cavalier */
/** @author John Hann */
module.exports = {
	main: autoConfigure
};

var bowerMetaData = require('./lib/metadata/bower');
var path = require('./lib/path');

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
		processors.push(process(context, urls[i]));
	}
	Promise.all(processors).then(done, logError);

	function done (metadatas) {
		var i, mainFile;
		for (i = 0; i < metadatas.length; i++) {
			if (metadatas[i] && metadatas[i].main) {
				mainFile = path.joinPaths(metadatas[i].name, metadatas[i].main);
				return runMain(context, mainFile);
			}
		}
	}

	function logError (ex) {
		console.error('Did not load metadata', ex);
		console.error(ex.stack);
	}
}

function runMain (context, mainFile) {
	return context.loader.import(mainFile)
		.then(function (main) {
			if (typeof main.main === 'function') {
				main.main(context);
			}
		});
}

function process (context, url) {
	var filename;
	filename = url.split('/').pop();
	if ('bower.json' === filename) {
		return bowerMetaData.process(context, url);
	}
	else if ('package.json' === filename) {
//		return npmMetaData.process(context);
	}
	else {
		throw new Error('Unknown metadata type: (' + filename + ') at ' + url);
	}
}

// 1. Load metadata files (.json files) --> done
// 2. Extract metadata about packages and main module(s) --> done
// 3. Get metadata files for each package (recursive) --> done
// 4. Configure package descriptors and create pipelines for each
// 5. Load the application's main.
