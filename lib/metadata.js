/** @license MIT License (c) copyright 2014 original authors */
/** @author Brian Cavalier */
/** @author John Hann */
var path = require('boot/lib/path');
var beget = require('boot/lib/beget');

var crawl = require('./metadata/crawl');
var bowerOptions = require('./metadata/bower');
var npmOptions = require('./metadata/npm');

var metaNameToOptions = {
	'bower.json': bowerOptions,
	'package.json': npmOptions
};

module.exports = {
	crawl: crawlStart,
	findPackage: findPackageDescriptor,
	findDepPackage: findDependentPackage,
	createUid: createUid
};

function crawlStart (context, rootUrl) {
	var parts, metaName, metaOptions, options;

	parts = path.splitDirAndFile(rootUrl);
	metaName = parts[1];
	metaOptions = metaNameToOptions[metaName];

	if (!metaOptions) throw new Error('Unknown metadata file: ' + rootUrl);

	options = beget(metaOptions);

	options.metaName = metaName;
	options.rootPath = parts[0];
	options.rootUrl = rootUrl;
	options.createUid = createUid;

	return crawl.processMetaFile(context, options, '');
}

function findPackageDescriptor (descriptors, fromModule) {
	var fromPkgUid = fromModule.split('#')[0];
	return descriptors[fromPkgUid];
}

function findDependentPackage (descriptors, fromPkg, depName) {
	var depPkgUid;

	// ensure we have a package descriptor, not a uid
	if (typeof fromPkg === 'string') fromPkg = descriptors[fromPkg];

	// ensure we have a package name, not a module name
	depName = depName.split('/')[0];

	// get dep pkg uid
	depPkgUid = fromPkg ? fromPkg.deps[depName] : depName;

	return depPkgUid && descriptors[depPkgUid];
}

function createUid (descriptor, normalized) {
	return descriptor.metaType + ':' + descriptor.name
		+ '@' + descriptor.version
		+ (normalized ? '#' + normalized : '');
}
