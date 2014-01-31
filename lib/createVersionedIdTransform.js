/** @license MIT License (c) copyright 2014 original authors */
/** @author Brian Cavalier */
/** @author John Hann */
var metadata = require('./metadata');

module.exports = createVersionedIdTransform;

function createVersionedIdTransform (context) {
	var packages;

	packages = context.packages;

	return function (normalized, refUid, refUrl) {
		var refPkg, depPkg;
		refPkg = metadata.findPackage(packages, refUid);
		depPkg = metadata.findDepPackage(packages, refPkg, normalized);
		return metadata.createUid(depPkg, normalized);
	};
}
