/** @license MIT License (c) copyright 2014 original authors */
/** @author Brian Cavalier */
/** @author John Hann */
module.exports = {
	process: process
};
// TODO: these are boot.js things, not auto.js things. we should split the libs
var path = require('boot/lib/path');
var partial = require('boot/lib/partial');

var libFolder = 'bower_components';

function locateBowerMetaFile (options, pkgName) {
	return path.joinPaths(
		locateBowerMetaFolder(options, pkgName),
		options.metaName
	);
}

function locateBowerMetaFolder (options, pkgName) {
	return path.joinPaths(
		options.rootPath,
		libFolder,
		pkgName || ''
	);
}

function createBowerPackageDescriptor (options, url, meta) {
	var parts;
	parts = path.splitDirAndFile(url);
	return {
		name: meta.name,
		location: parts[0],
		metaType: 'bower',
		moduleType: meta.moduleType || 'amd',
		main: meta.main,
		metadata: meta
	};
}

function process (context, rootUrl) {
	var parts, options;
	parts = path.splitDirAndFile(rootUrl);
	options = {
		metaName: parts[1],
		rootPath: parts[0],
		rootUrl: rootUrl
	};
	return processMetaFile(context, options, '');
}

function processMetaFile (context, options, pkgName) {
	var process, save, url;

	process = partial(processPackageMetaFiles, [context, options]);
	save = partial(savePackageDescriptor, [context, options]);

	url = pkgName ? locateBowerMetaFile(options, pkgName) : options.rootUrl;

	return context.loader.import(url)
		.then(function (metadata) {
			// save this package's descriptor
			var pkgDesc = save(url, metadata);
			return process(metadata.dependencies)
				.then(function (metadeps) {
					addDeps(pkgDesc, metadeps);
					return metadata;
				});
		});

	function addDeps (metadata, metadeps) {
		metadata.deps = {};
		for (var i = 0; i < metadeps.length; i++) {
			metadata.deps[metadeps[i].name] = metadeps[i].version;
		}
	}
}

function processPackageMetaFiles (context, options, deps) {
	var promises = [];
	for (var name in deps) {
		promises.push(processMetaFile(context, options, name));
	}
	return Promise.all(promises);
}

function savePackageDescriptor (context, options, url, metadata) {
	var name = metadata.name, pkgSet = context.packages[name], descr;
	if (!pkgSet) {
		pkgSet = context.packages[name] = { versions: {} };
	}
	if (!pkgSet.versions) pkgSet.versions = {};
	descr = pkgSet.versions[metadata.version] =
		createBowerPackageDescriptor(options, url, metadata);;
	if (!pkgSet['default']) pkgSet['default'] = descr;
	return descr;
}
