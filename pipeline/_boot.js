/** @license MIT License (c) copyright 2014 original authors */
/** @author Brian Cavalier */
/** @author John Hann */
var normalizeCjs = require('./normalizeCjs');
var locateAsIs = require('./locateAsIs');
var fetchAsText = require('./fetchAsText');
var translateAsIs = require('./translateAsIs');
var instantiateNode = require('./instantiateNode');
var overrideIf = require('../lib/overrideIf');

module.exports = function () {
	var pipeline = {
		normalize: normalizeCjs,
		locate: locateAsIs,
		fetch: fetchAsText,
		translate: translateAsIs,
		instantiate: instantiateNode
	};

	pipeline.applyTo = function (loader) {
		overrideIf(loader, isBootModule, pipeline);
	};

	return pipeline;
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

