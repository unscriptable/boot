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
	findPackage: findPackage,
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

function findPackage (packages, fromModule, forModule) {
	var fromPkgUid, fromDescr, forPkgUid;

	fromPkgUid = fromModule.split('#')[0];
	forPkgUid = forModule.split('#')[0];
	fromDescr = packages[fromPkgUid];

	return fromDescr && fromDescr.deps[forPkgUid];
}

function createUid (descriptor, moduleName) {
	return descriptor.metaType + ':' + descriptor.name
		+ '@' + descriptor.version
		+ (moduleName ? '#' + moduleName : '');
}
