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
var overrideIf = require('../lib/overrideIf');

module.exports = pipelineFromMetadata;

function pipelineFromMetadata (context) {
	var uid, descr, name, moduleType, pipeline;

	// loop through package descriptors
//	for (uid in context.packages) {
//		descr = context.packages[uid];
//		name = descr.name;
//		uid = desc.uid; // key could be name instead of uid
//		moduleType = descr.moduleType;
//		// TODO: associate uid with pipeline methods for amd, node, etc.
//	}

	pipeline = {
		normalize: createNormalizer(
			createVersionedIdTransform(context),
			normalizeCjs
		),
		locate: withContext(context, locatePackage),
		fetch: fetchAsText,
		translate: translateAsIs,
		// TODO: this needs to sniff for moduleType and pick the correct one
		instantiate: instantiateNode
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
