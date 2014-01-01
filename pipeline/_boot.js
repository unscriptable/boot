/** @license MIT License (c) copyright 2014 original authors */
/** @author Brian Cavalier */
/** @author John Hann */
var nodePipeline = require('./node');
var overrideIf = require('../lib/overrideIf');

module.exports = function () {
	var defaultPipeline = {};

	for (var p in nodePipeline) {
		defaultPipeline[p] = nodePipeline[p];
	}

	defaultPipeline.applyTo = function (loader) {
		overrideIf(loader, isBootModule, defaultPipeline);
	};

	return defaultPipeline;
};

function isBootModule (arg) {
	var moduleId, packageId;
	// Pipeline functions typically receive an object with a normalized name,
	// but the normalize function takes an unnormalized name and a normalized
	// referrer name.
	moduleId = typeof arg === 'object'
		? arg.name
		: arg.charAt(0) === '.' ? arguments[1] : arg;
	packageId = moduleId.split('/')[0];
	return packageId === 'boot';
}

