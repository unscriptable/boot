/** @license MIT License (c) copyright 2014 original authors */
/** @author Brian Cavalier */
/** @author John Hann */
module.exports = {
	process: processMetaFile
};
// TODO: these are boot.js things, not auto.js things. we should split the libs
var path = require('../path');
var partial = require('../partial');

var metaName = 'bower.json';
var libFolder = 'bower_components';

function locateBowerMetaFile (pkgName) {
	return path.joinPaths(pkgName ? libFolder : '', pkgName || '', metaName);
}

function locateBowerMetaFolder (pkgName) {
	return path.joinPaths(pkgName ? libFolder : '', pkgName || '');
}

function createBowerPackageDescriptor (meta) {
	return {
		name: meta.name,
		location: locateBowerMetaFolder(meta.name),
		metaType: 'bower',
		main: meta.main,
		metadata: meta
	};
}

function processMetaFile (context, pkgName) {
	var filter, process, save;

	filter = partial(filterNewPackageNames, [context]);
	process = partial(processPackageMetaFiles, [context]);
	save = partial(savePackageDescriptors, [context]);

	return context.loader.import(locateBowerMetaFile(pkgName))
		.then(function (metadata) {
			var newPkgs = filter(extractPackageNames(metadata));
			return Promise.resolve(newPkgs)
				.then(process)
				.then(save)
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

function filterNewPackageNames (context, names) {
	var newNames = [];
	for (var i = 0; i < names.length; i++) {
		if (!(names[i] in context.packages)) newNames.push(names[i]);
	}
	return newNames;
}

function processPackageMetaFiles (context, names) {
	var promises = [];
	for (var i = 0; i < names.length; i++) {
		promises.push(processMetaFile(context, names[i]));
	}
	return Promise.all(promises);
}

function savePackageDescriptors (context, metadatas) {
	var meta;
	for (var i = 0; i < metadatas.length; i++) {
		meta = metadatas[i];
		context.packages[meta.name] = createBowerPackageDescriptor(meta);
	}
}
