/** @license MIT License (c) copyright 2014 original authors */
/** @author Brian Cavalier */
/** @author John Hann */
var metadata = require('../lib/metadata');
var normalizeCjs = require('./normalizeCjs');
var createNormalizer = require('../lib/createNormalizer');
var createVersionedIdTransform = require('../lib/createVersionedIdTransform');
var locatePackage = require('./locatePackage');
var fetchAsText = require('./fetchAsText');
var translateAsIs = require('./translateAsIs');
var instantiateNode = require('./instantiateNode');
var instantiateAmd = require('./instantiateAmd');
var overrideIf = require('../lib/overrideIf');
var metadata = require('../lib/metadata');

module.exports = pipelineFromMetadata;

function pipelineFromMetadata (context) {
	var pipeline;

	pipeline = {
		normalize: createNormalizer(
			createVersionedIdTransform(context),
			normalizeCjs
		),
		locate: withContext(context, locatePackage),
		fetch: fetchAsText,
		translate: translateAsIs,
		instantiate: instantiateNodeOrAmd
	};

	return {
		applyTo: function (loader) {
			overrideIf(createIsConfigured(context), loader, pipeline);
		}
	}
}

function createIsConfigured (context) {
	var packages = context.packages;
	return function isConfigured (arg) {
		var pkgUid;
		if (typeof arg === 'string') {
			// arg is an abstract name
			if (arg.charAt(0) === '.') {
				// arg is relative, use the referer's name
				arg = arguments[1];
				pkgUid = arg.split('#')[0];
			}
			else {
				pkgUid = arg.split('/')[0];
			}
		}
		else {
			// arg is a load context with an uid
			pkgUid = arg.name.split('#')[0];
		}
		return pkgUid in packages;
	};
}

// TODO: reuse this
function withContext (context, func) {
	return function (load) {
		load.metadata.boot = context;
		return func.call(this, load);
	};
}

function instantiateNodeOrAmd (load) {
	// TODO: find a way to pre-compute the moduleType. this is inefficient.
	var pkg = metadata.findPackage(load.metadata.boot.packages, load.name);
	if (pkg.moduleType === 'amd') {
		return instantiateAmd.call(this, load);
	}
	else {
		return instantiateNode.call(this, load);
	}
}
