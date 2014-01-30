/** @license MIT License (c) copyright 2014 original authors */
/** @author Brian Cavalier */
/** @author John Hann */
module.exports = {
	main: autoConfigure
};

var metadata = require('./lib/metadata');

//var defaultMeta = 'boot.json,bower.json,package.json';
var defaultMeta = 'bower.json,package.json';

function autoConfigure (context) {
	var urls, processors, howMany, i;

	if (!context.bootMeta) context.bootMeta = defaultMeta;

	urls = context.bootMeta.split(/\s*,\s*/);
	howMany = urls.length;
	processors = [];

	for (i = 0; i < howMany; i++) {
		processors.push(metadata.crawl(context, urls[i]));
	}
	Promise.all(processors).then(done, logError);

	function done (metadatas) {
		// TODO: configure loader with package descriptors here
		var i, meta, mainModule;
		for (i = 0; i < metadatas.length; i++) {
			meta = metadatas[i];
			if (meta && meta.main) {
				mainModule = meta.name;
				// TODO: remove this work-around when package mains are working
				mainModule = meta.main;
				return runMain(context, mainModule);
			}
		}
		// TODO: if no main modules found, look for one in a conventional place
		// TODO: warn if multiple main modules were found, but only the first was run
	}

	function logError (ex) {
		console.error('Did not load metadata', ex);
		console.error(ex.stack);
	}
}

function runMain (context, mainModule) {
	return context.loader.import(mainModule)
		.then(function (main) {
			// TODO: get function-modules working
			// and change this next part to assume a function-module
			// if (typeof main === 'function') main(context);
			if (typeof main.main === 'function') {
				main.main(context);
			}
		});
}

// 1. Load metadata files (.json files) --> done
// 2. Extract metadata about packages and main module(s) --> done
// 3. Get metadata files for each package (recursive) --> done
// 4. Configure package descriptors and create pipelines for each
// 5. Load the application's main.
