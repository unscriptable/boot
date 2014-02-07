/** @license MIT License (c) copyright 2014 original authors */
/** @author Brian Cavalier */
/** @author John Hann */
var metadata = require('./lib/metadata');
var fromMetadata = require('./pipeline/fromMetadata');
var beget = require('./lib/beget');
var path = require('./lib/path');

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
		processors.push(metadata.crawl(context, urls[i]).then(void 0, function(e) {
			console.error(e);
			console.error(e.stack);
			return void 0;
		}));
	}
	Promise.all(processors).then(done, logError);

	function done (metadatas) {
		metadatas = metadatas.filter(function(x) {
			return x !== void 0;
		});
		return configureLoader(context)
			.then(initBootExtensions)
			.then(function () {
				return initApplication(context, metadatas);
			});
	}

	function logError (ex) {
		console.error('Did not load metadata', ex);
		console.error(ex.stack);
	}
}

function configureLoader (context) {
	// TODO: fix boot's package descriptor elsewhere!
	context.packages.boot = require('boot/lib/package').normalizeDescriptor(context.packages.boot);
	context.packages.boot.uid = context.packages.boot.name = 'boot';
	var pipeline = fromMetadata(context);
	pipeline.applyTo(context.loader);
	return Promise.resolve(context);
}

function initBootExtensions (context) {
	var seen, name, pkg, promises;
	seen = {};
	promises = [];
	for (name in context.packages) {
		pkg = context.packages[name];
		// TODO: remove this when the boot package is no longer a string
		if (typeof pkg !== 'object') continue;
		// TODO: remove this if we no longer have versioned and unversioned packages
		if (!(pkg.name in seen)) {
			seen[pkg.name] = true;
			if (pkg.metadata && pkg.metadata.boot) {
				promises.push(
					runBootExtension(context, path.joinPaths(pkg.name, pkg.metadata.boot))
				);
			}
		}
	}
	return Promise.all(promises).then(function () { return context; });
}

function runBootExtension (context, bootExtension) {
	// friggin es6 loader doesn't run normalize on dynamic import!!!!
	var normalized = context.loader.normalize(bootExtension, '');
	return context.loader.import(normalized)
		.then(function (extension) {
			if(typeof extension === 'function') {
				return extension(context);
			}

			if (extension.pipeline) {
				extension.pipeline(context).applyTo(context.loader);
			}

			if(extension.init) {
				return extension.init(context);
			}
		});
}

function initApplication (context, metadatas) {
	var i, meta, mainModule;
	for (i = 0; i < metadatas.length; i++) {
		meta = metadatas[i];
		if (meta && meta.main) {
			// TODO: implement main modules
			mainModule = path.joinPaths(meta.name, meta.main);
			return runMain(context, mainModule)
				.then(function () { return context; });
		}
	}
	// TODO: if no main modules found, look for one in a conventional place
	// TODO: warn if multiple main modules were found, but only the first was run
}

function runMain (context, mainModule) {
	// friggin es6 loader doesn't run normalize on dynamic import!!!!
	var normalized = context.loader.normalize(mainModule, '');
	return context.loader.import(normalized)
		.then(function (main) {
			if (typeof main === 'function') {
				main(beget(context));
			}
			else if (typeof main.main === 'function') {
				main.main(beget(context));
			}
		});
}
