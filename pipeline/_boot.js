/** @license MIT License (c) copyright 2014 original authors */
/** @author Brian Cavalier */
/** @author John Hann */
var normalizeCjs = require('./normalizeCjs');
var locateAsIs = require('./locateAsIs');
var fetchAsText = require('./fetchAsText');
var translateAsIs = require('./translateAsIs');
var translateWrapObjectLiteral = require('./translateWrapObjectLiteral');
var instantiateNode = require('./instantiateNode');
var instantiateScript = require('./instantiateScript');
var overrideIf = require('../lib/overrideIf');
var partial = require('boot/lib/partial');

module.exports = function (options) {
	var modulePipeline, jsonPipeline;

	modulePipeline = withOptions(options, {
		normalize: normalizeCjs,
		locate: locateAsIs,
		fetch: fetchAsText,
		translate: translateAsIs,
		instantiate: instantiateNode
	});

	jsonPipeline = withOptions(options, {
		normalize: normalizeCjs,
		locate: locateAsIs,
		fetch: fetchAsText,
		translate: translateWrapObjectLiteral,
		instantiate: instantiateScript
	});

	return {
		applyTo: function (loader) {
			overrideIf(loader, isBootModule, modulePipeline);
			overrideIf(loader, isJsonFile, jsonPipeline);
		}
	};
};

function isBootModule (arg) {
	var moduleId, packageId;
	// Pipeline functions typically receive an object with a normalized name,
	// but the normalize function takes an unnormalized name and a normalized
	// referrer name.
	moduleId = getModuleId(arg);
	if (moduleId.charAt(0) === '.') moduleId = arguments[1];
	packageId = moduleId.split('/')[0];
	return packageId === 'boot';
}

function isJsonFile (arg) {
	var moduleId, ext;
	moduleId = getModuleId(arg);
	ext = moduleId.split('.').pop();
	return ext === 'json';
}

function getModuleId (arg) {
	return typeof arg === 'object' ? arg.name : arg;
}

function withOptions (options, pipeline) {
	for (var p in pipeline) {
		pipeline[p] = partial(pipeline[p], [options]);
	}
	return pipeline;
}
