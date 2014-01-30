/** @license MIT License (c) copyright 2014 original authors */
/** @author Brian Cavalier */
/** @author John Hann */
var beget = require('boot/lib/beget');

module.exports = {
	processMetaFile: processMetaFile,
	processDependencies: processDependencies,
	saveDescriptor: saveDescriptor
};

function processMetaFile (context, options, pkgName) {
	var url;

	options = beget(options);

	// TODO: consider resolving this before this function executes
	url = pkgName ? options.locateMetaFile(options, pkgName) : options.rootUrl;
	options.localRootPath = options.rootPath;

	return context.loader.import(url)
		.then(function (metadata) {
			// save this package's descriptor
			var pkgDesc = saveDescriptor(context, options, url, metadata);
			options.localRootPath = options.locateMetaFolder(options, pkgName);
			return processDependencies(context, options, metadata)
				.then(function (metadeps) {
					addDeps(pkgDesc, metadeps);
					return pkgDesc;
				});
		});

	function addDeps (descr, deps) {
		var uid;
		descr.deps = {};
		for (var i = 0; i < deps.length; i++) {
			uid = options.createUid(deps[i]);
			descr.deps[uid] = uid;
		}
	}
}

function processDependencies (context, options, metadata) {
	var deps = metadata.dependencies, promises = [];
	for (var name in deps) {
		promises.push(processMetaFile(context, options, name));
	}
	return Promise.all(promises);
}

function saveDescriptor (context, options, url, metadata) {
	var uid, pkgSet, descr;

	descr = options.createDescriptor(options, url, metadata);
	uid = options.createUid(descr);
	pkgSet = context.packages[uid];

	if (!pkgSet) pkgSet = context.packages[uid] = {};
	if (!pkgSet.versions) pkgSet.versions = {};

	pkgSet.versions[metadata.version] = descr;

	if (!pkgSet['default']) pkgSet['default'] = descr;

	return descr;
}
