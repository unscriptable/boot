/** @license MIT License (c) copyright 2014 original authors */
/** @author Brian Cavalier */
/** @author John Hann */
var metadata = require('./lib/metadata');
var fromMetadata = require('./pipeline/fromMetadata');
var beget = require('./lib/beget');

module.exports = {
	main: autoConfigure
};

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
		configureLoader(context);
		var i, meta, mainModule;
		for (i = 0; i < metadatas.length; i++) {
			meta = metadatas[i];
			if (meta && meta.main) {
				// TODO: implement main modules
				mainModule = meta.name + '/' + meta.main;
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

function configureLoader (context) {
	var pipeline = fromMetadata(context);
	pipeline.applyTo(context.loader);
	return context;
}

function runMain (context, mainModule) {
	// friggin es6 loader doesn't run normalize on dynamic import!!!!
	var normalized = context.loader.normalize(mainModule, '');
	return context.loader.import(normalized)
		.then(function (main) {
			// TODO: get function-modules working
			// and change this next part to assume a function-module
			// if (typeof main === 'function') main(context);
			if (typeof main === 'function') {
				main(beget(context));
			}
			else if (typeof main.main === 'function') {
				main.main(beget(context));
			}
		});
}
