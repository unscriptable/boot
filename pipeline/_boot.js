/** @license MIT License (c) copyright 2014 original authors */
/** @author Brian Cavalier */
/** @author John Hann */
var normalizeCjs = require('./normalizeCjs');
var locateAsIs = require('./locateAsIs');
var fetchAsText = require('./fetchAsText');
var translateAsIs = require('./translateAsIs');
var translateForDebug = require('./translateForDebug');
var translateWrapObjectLiteral = require('./translateWrapObjectLiteral');
var instantiateNode = require('./instantiateNode');
var instantiateScript = require('./instantiateScript');
var overrideIf = require('../lib/overrideIf');

module.exports = function (options) {
	var translate, modulePipeline, jsonPipeline;

	translate = options && options.debug
		? translateForDebug
		: translateAsIs;

	modulePipeline = {
		normalize: normalizeCjs,
		locate: locateAsIs,
		fetch: fetchAsText,
		translate: translate,
		instantiate: instantiateNode
	};

	jsonPipeline = {
		normalize: normalizeCjs,
		locate: locateAsIs,
		fetch: fetchAsText,
		translate: translateJson(translateWrapObjectLiteral, translate),
		instantiate: instantiateScript
	};

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

function translateJson (wrap, base) {
	// Note: this mutates `source`
	return function (load) {
		load.source = wrap(load);
		return base(load);
	};
}
