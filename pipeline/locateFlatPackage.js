/** @license MIT License (c) copyright 2014 original authors */
/** @author Brian Cavalier */
/** @author John Hann */
module.exports = locateFlatPackage;

var path = require('../lib/path');

function locateFlatPackage (options, load) {
	var parts, packageName, moduleName, descriptor, location, ext;

	// Note: name should be normalized before it reaches this locate function.
	parts = load.name.split('/');
	packageName = parts.shift();

	if (!options.packages) throw new Error('Packages not provided: ' + load.name);

	descriptor = options.packages[packageName];
	if (!descriptor) throw new Error('Package not found: ' + load.name);

	moduleName = parts.join('/') || descriptor.main;
	location = descriptor.location;
	ext = options.defaultExt || '.js';

	// prepend baseUrl
	if (!path.isAbsUrl(location) && options.baseUrl) {
		location = path.joinPaths(options.baseUrl, location);
	}

	return path.joinPaths(location, path.ensureExt(moduleName, ext));
}
