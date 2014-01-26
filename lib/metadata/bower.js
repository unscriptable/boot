/** @license MIT License (c) copyright 2014 original authors */
/** @author Brian Cavalier */
/** @author John Hann */
module.exports = {
	process: process
};
// TODO: these are boot.js things, not auto.js things. we should split the libs
var path = require('../path');
var partial = require('../partial');

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

function createBowerPackageDescriptor (options, url, name, meta) {
	return {
		name: name,
		location: url,
		metaType: 'bower',
		main: meta.main,
		metadata: meta
	};
}

function process (context, rootUrl) {
	var parts, options;
	parts = rootUrl.split('/');
	options = {
		metaName: parts.pop(),
		rootPath: parts.join('/'),
		rootUrl: rootUrl
	};
	return processMetaFile(context, options, '');
}

function processMetaFile (context, options, pkgName) {
	var filter, process, save, url;

	filter = partial(filterNewPackageNames, [context, options]);
	process = partial(processPackageMetaFiles, [context, options]);
	save = partial(savePackageDescriptor, [context, options]);

	url = pkgName ? locateBowerMetaFile(options, pkgName) : options.rootUrl;

	return context.loader.import(url)
		.then(function (metadata) {
			save(url, pkgName, metadata);
			var newPkgs = filter(extractPackageNames(metadata));
			return Promise.resolve(newPkgs)
				.then(process)
				.then(function () { return metadata; });
		});
}

function extractPackageNames (metadata) {
	var names = [];
	for (var name in metadata.dependencies) {
		names.push(name);
	}
	return names;
}

function filterNewPackageNames (context, options, names) {
	var newNames = [];
	for (var i = 0; i < names.length; i++) {
		if (!(names[i] in context.packages)) newNames.push(names[i]);
	}
	return newNames;
}

function processPackageMetaFiles (context, options, names) {
	var promises = [];
	for (var i = 0; i < names.length; i++) {
		promises.push(processMetaFile(context, options, names[i]));
	}
	return Promise.all(promises);
}

function savePackageDescriptor (context, options, url, pkgName, metadata) {
	// pkgName is blank when loading top metadata file
	if (pkgName && pkgName != metadata.name) {
		throw new Error(
			'Mismatch in ' + url +
			' (' + pkgName + ' != ' + metadata.name + ').'
		);
	}
	context.packages[metadata.name] =
		createBowerPackageDescriptor(options, url, pkgName, metadata);
	return metadata;
}
