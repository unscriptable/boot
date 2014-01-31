/** @license MIT License (c) copyright 2014 original authors */
/** @author Brian Cavalier */
/** @author John Hann */
var normalizeCjs = require('./normalizeCjs');
var locatePackage = require('./locatePackage');
var locateAsIs = require('./locateAsIs');
var fetchAsText = require('./fetchAsText');
var translateAsIs = require('./translateAsIs');
var translateWrapObjectLiteral = require('./translateWrapObjectLiteral');
var instantiateNode = require('./instantiateNode');
var instantiateScript = require('./instantiateScript');
var overrideIf = require('../lib/overrideIf');
var pkg = require('../lib/package');
var beget = require('../lib/beget');

module.exports = _bootPipeline;

function _bootPipeline (context) {
	var modulePipeline, jsonPipeline;

	context = beget(context);
	if (context.packages) {
		context.packages = pkg.normalizeCollection(context.packages);
	}

	modulePipeline = {
		normalize: normalizeCjs,
		locate: withContext(context, locatePackage),
		fetch: fetchAsText,
		translate: translateAsIs,
		instantiate: instantiateNode
	};

	jsonPipeline = {
		normalize: normalizeCjs,
		locate: withContext(context, locateAsIs),
		fetch: fetchAsText,
		translate: translateWrapObjectLiteral,
		instantiate: instantiateScript
	};

	return {
		applyTo: function (loader) {
			overrideIf(isBootModule, loader, modulePipeline);
			overrideIf(isJsonFile, loader, jsonPipeline);
		}
	};
}

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

function withContext (context, func) {
	return function (load) {
		load.metadata.boot = context;
		return func.call(this, load);
	};
}
