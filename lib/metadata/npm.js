/** @license MIT License (c) copyright 2014 original authors */
/** @author Brian Cavalier */
/** @author John Hann */
module.exports = {
	process: process
};

var path = require('boot/lib/path');
var partial = require('boot/lib/partial');
var beget = require('boot/lib/beget');

var libFolder = 'node_modules';

function locateNpmMetaFile (options, pkgName) {
	return path.joinPaths(
		locateNpmMetaFolder(options, pkgName),
		options.metaName
	);
}

function locateNpmMetaFolder (options, pkgName) {
	return path.joinPaths(
		options.rootPath,
		libFolder,
		pkgName || ''
	);
}

function createNpmPackageDescriptor (options, url, meta) {
	var parts;
	parts = path.splitDirAndFile(url);
	return {
		name: meta.name,
		version: meta.version,
		location: parts[0],
		metaType: 'npm',
		moduleType: meta.moduleType || 'node',
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

	options = beget(options);

	process = partial(processPackageMetaFiles, [context, options]);
	save = partial(savePackageDescriptor, [context, options]);

	url = pkgName ? locateNpmMetaFile(options, pkgName) : options.rootUrl;

	return context.loader.import(url)
		.then(function (metadata) {
			// save this package's descriptor
			var pkgDesc = save(url, metadata);
			options.rootPath = locateNpmMetaFolder(options, pkgName);
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
	var name = metadata.name, pkgSet = context.packages[name];
	if (!pkgSet) {
		pkgSet = context.packages[name] = {
			versions: {}
		};
	}
	if (!pkgSet.versions) pkgSet.versions = {};
	return pkgSet.versions[metadata.version] =
		createNpmPackageDescriptor(options, url, metadata);;
}
