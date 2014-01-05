
;define('boot/pipeline/locateAsIs', ['require', 'exports', 'module'], function (require, exports, module) {/** @license MIT License (c) copyright 2014 original authors */
/** @author Brian Cavalier */
/** @author John Hann */
module.exports = locateAsIs;

function locateAsIs (options, load) {
	return load.name;
}

});


;define('boot/lib/partial', ['require', 'exports', 'module'], function (require, exports, module) {/** @license MIT License (c) copyright 2014 original authors */
/** @author Brian Cavalier */
/** @author John Hann */
module.exports = partial;

/**
 * Returns a function that has part of its parameters captured.
 * @param {Function} func
 * @param {Array} args
 * @returns {Function}
 */
function partial (func, args) {
	return function () {
		var copy = args.concat(args.slice.apply(arguments));
		return func.apply(this, copy);
	};
}

});


;define('boot/lib/overrideIf', ['require', 'exports', 'module'], function (require, exports, module) {/** @license MIT License (c) copyright 2014 original authors */
/** @author Brian Cavalier */
/** @author John Hann */
module.exports = overrideIf;

function overrideIf (base, predicate, props) {
	for (var p in props) {
		if (p in base) {
			base[p] = override(base[p], predicate, props[p]);
		}
	}
}

function override (orig, predicate, method) {
	return function () {
		return predicate.apply(this, arguments)
			? method.apply(this, arguments)
			: orig.apply(this, arguments);
	};
}

});


;define('boot/lib/path', ['require', 'exports', 'module'], function (require, exports, module) {/** @license MIT License (c) copyright 2014 original authors */
/** @author Brian Cavalier */
/** @author John Hann */
var absUrlRx, findDotsRx;

absUrlRx = /^\/|^[^:]+:\/\//;
findDotsRx = /(\.)(\.?)(?:$|\/([^\.\/]+.*)?)/g;

/** @module path */
module.exports = {
	isAbsUrl: isAbsUrl,
	isRelPath: isRelPath,
	joinPaths: joinPaths,
	removeEndSlash: removeEndSlash,
	ensureExt: ensureExt,
	reduceLeadingDots: reduceLeadingDots
};

/**
 * Returns true if the url is absolute (not relative to the document)
 * @param {String} url
 * @return {Boolean}
 */
function isAbsUrl (url) { return absUrlRx.test(url); }

/**
 * Returns true if the the path provided is relative.
 * @param {String} path
 * @return {Boolean}
 */
function isRelPath (path) { return path.charAt(0) == '.'; }

/**
 * Joins two paths, base and sub, together.
 * @param {String} base
 * @param {String} sub
 * @return {String}
 */
function joinPaths (base, sub) {
	base = removeEndSlash(base);
	return (base ? base + '/' : '') + sub;
}

/**
 * Removes any trailing slash ("/") from a string.
 * @param {String} path
 * @return {String}
 */
function removeEndSlash (path) {
	return path && path.charAt(path.length - 1) == '/'
		? path.substr(0, path.length - 1)
		: path;
}
/**
 * Ensures that a path ends in the given extension.
 * @param {String} path
 * @param {String} ext
 * @return {String}
 */
function ensureExt (path, ext) {
	return path.lastIndexOf(ext) == path.length - ext.length
		? path
		: path + ext;
}

/**
 * Normalizes a CommonJS-style (or AMD) module id against a referring
 * module id.  Leading ".." or "." path specifiers are folded into
 * the referer's id/path.
 * @param {String} childId
 * @param {String} baseId
 * @return {String}
 */
function reduceLeadingDots (childId, baseId) {
	var removeLevels, normId, levels, isRelative, diff;
	// this algorithm is similar to dojo's compactPath, which
	// interprets module ids of "." and ".." as meaning "grab the
	// module whose name is the same as my folder or parent folder".
	// These special module ids are not included in the AMD spec
	// but seem to work in node.js, too.

	removeLevels = 1;
	normId = childId;

	// remove leading dots and count levels
	if (isRelPath(normId)) {
		isRelative = true;
		// replaceDots also counts levels
		normId = normId.replace(findDotsRx, replaceDots);
	}

	if (isRelative) {
		levels = baseId.split('/');
		diff = levels.length - removeLevels;
		if (diff < 0) {
			// this is an attempt to navigate above parent module.
			// maybe dev wants a url or something. punt and return url;
			return childId;
		}
		levels.splice(diff, removeLevels);
		// normId || [] prevents concat from adding extra "/" when
		// normId is reduced to a blank string
		return levels.concat(normId || []).join('/');
	}
	else {
		return normId;
	}

	function replaceDots (m, dot, dblDot, remainder) {
		if (dblDot) removeLevels++;
		return remainder || '';
	}
}

});


;define('boot/lib/Thenable', ['require', 'exports', 'module'], function (require, exports, module) {/** @license MIT License (c) copyright 2014 original authors */
/** @author Brian Cavalier */
/** @author John Hann */
module.exports = Thenable;

function Thenable (resolver) {
	var then, nextFulfill, nextReject;

	then = push;
	resolver(fulfill, reject);

	return {
		then: function (onFulfill, onReject) {
			return then(onFulfill, onReject);
		}
	};

	function push (onFulfill, onReject) {
		return new Thenable(function (childFulfill, childReject) {
			nextFulfill = function (value) {
				tryBoth(value, onFulfill, onReject)
					&& tryBoth(value, childFulfill, childReject);
			};
			nextReject = function (ex) {
				tryBoth(ex, onReject, failLoud)
					 && tryBoth(ex, childReject, failLoud);
			};
		});
	}

	function fulfill (value) {
		then = fulfiller(value);
		if (nextFulfill) nextFulfill(value);
	}

	function reject (ex) {
		then = rejecter(ex);
		if (nextReject) nextReject(ex);
	}
}

function fulfiller (value) {
	return function (onFulfill, onReject) {
		onFulfill(value);
		return this;
	};
}

function rejecter (value) {
	return function (onFulfill, onReject) {
		onReject(value);
		return this;
	};
}

function tryBoth (value, first, second) {
	try {
		first(value);
		return true;
	}
	catch (ex) {
		second(ex);
	}
}

function failLoud (ex) {
	throw ex;
}


});


;define('boot/lib/addSourceUrl', ['require', 'exports', 'module'], function (require, exports, module) {/** @license MIT License (c) copyright 2014 original authors */
/** @author Brian Cavalier */
/** @author John Hann */
module.exports = addSourceUrl;

function addSourceUrl (url, source) {
	return source
		+ '\n/*\n//@ sourceURL='
		+ url.replace(/\s/g, '%20')
		+ '\n*/\n';
}

});


;define('boot/lib/findRequires', ['require', 'exports', 'module'], function (require, exports, module) {/** @license MIT License (c) copyright 2014 original authors */
/** @author Brian Cavalier */
/** @author John Hann */
module.exports = findRequires;

var removeCommentsRx, findRValueRequiresRx;

removeCommentsRx = /\/\*[\s\S]*?\*\/|\/\/.*?[\n\r]/g;
findRValueRequiresRx = /require\s*\(\s*(["'])(.*?[^\\])\1\s*\)|[^\\]?(["'])/g;

function findRequires (source) {
	var deps, seen, clean, currQuote;

	deps = [];
	seen = {};

	// remove comments, then look for require() or quotes
	clean = source.replace(removeCommentsRx, '');
	clean.replace(findRValueRequiresRx, function (m, rq, id, qq) {
		// if we encounter a string in the source, don't look for require()
		if (qq) {
			currQuote = currQuote == qq ? false : currQuote;
		}
		// if we're not inside a quoted string
		else if (!currQuote) {
			// push [relative] id into deps list and seen map
			if (!(id in seen)) {
				seen[id] = true;
				deps.push(id)
			}
		}
		return ''; // uses least RAM/CPU
	});

	return deps;
}

});


;define('boot/lib/nodeFactory', ['require', 'exports', 'module'], function (require, exports, module) {/** @license MIT License (c) copyright 2014 original authors */
/** @author Brian Cavalier */
/** @author John Hann */
module.exports = nodeFactory;

var nodeEval = new Function(
	'require', 'exports', 'module', 'global',
	'eval(arguments[4]);'
);

function nodeFactory (loader, load) {
	var require, module;

	require = function (id) {
		var abs = loader.normalize(id, load.name);
		return loader.get(abs);
	};
	module = { id: load.name, uri: load.address, exports: {} };

	return function () {
		nodeEval(require, module.exports, module, loader.global, load.source);
		return module.exports;
	};
}

});


;define('boot/lib/globalFactory', ['require', 'exports', 'module'], function (require, exports, module) {/** @license MIT License (c) copyright 2014 original authors */
/** @author Brian Cavalier */
/** @author John Hann */
module.exports = globalFactory;

var globalEval = new Function('return eval(arguments[0]);');

function globalFactory (loader, load) {
	return function () {
		return globalEval(load.source);
	};
}

});


;define('boot/pipeline/normalizeCjs', ['require', 'exports', 'module', 'boot/lib/path'], function (require, exports, module, $cram_r0) {/** @license MIT License (c) copyright 2014 original authors */
/** @author Brian Cavalier */
/** @author John Hann */
var path = $cram_r0;

module.exports = normalizeCjs;

var reduceLeadingDots = path.reduceLeadingDots;

function normalizeCjs (options, name, refererName, refererUrl) {
	return reduceLeadingDots(String(name), refererName || '');
}

});


;define('boot/pipeline/fetchAsText', ['require', 'exports', 'module', 'boot/boot', 'boot/lib/Thenable'], function (require, exports, module, $cram_r0, $cram_r1) {/** @license MIT License (c) copyright 2014 original authors */
/** @author Brian Cavalier */
/** @author John Hann */
module.exports = fetchAsText;

var fetchText = $cram_r0.fetchText;
var Thenable = $cram_r1;

function fetchAsText (options, load) {
	return Thenable(function(resolve, reject) {
		fetchText(load.address, resolve, reject);
	});

}

});


;define('boot/pipeline/translateAsIs', ['require', 'exports', 'module', 'boot/lib/addSourceUrl'], function (require, exports, module, $cram_r0) {/** @license MIT License (c) copyright 2014 original authors */
/** @author Brian Cavalier */
/** @author John Hann */
module.exports = translateAsIs;

var addSourceUrl = $cram_r0;

function translateAsIs (options, load) {
	return options.debug
		? addSourceUrl(load.address, load.source)
		: load.source;
}

});


;define('boot/pipeline/instantiateNode', ['require', 'exports', 'module', 'boot/lib/findRequires', 'boot/lib/nodeFactory'], function (require, exports, module, $cram_r0, $cram_r1) {/** @license MIT License (c) copyright 2014 original authors */
/** @author Brian Cavalier */
/** @author John Hann */
var findRequires = $cram_r0;
var nodeFactory = $cram_r1;

module.exports = instantiateNode;

function instantiateNode (options, load) {
	var factory;

	load.loader = this;
	load.deps = findRequires(load.source);
	factory = nodeFactory(this, load);

	return {
		deps: load.deps,
		execute: function () {
			return new Module(factory.apply(this, arguments));
		}
	};
}

});


;define('boot/pipeline/instantiateScript', ['require', 'exports', 'module', 'boot/lib/globalFactory'], function (require, exports, module, $cram_r0) {/** @license MIT License (c) copyright 2014 original authors */
/** @author Brian Cavalier */
/** @author John Hann */
module.exports = instantiateScript;

var globalFactory = $cram_r0;

function instantiateScript (options, load) {
	var factory = globalFactory(this, load);
	return {
		execute: function () {
			return new Module(factory());
		}
	};
}

});


;define('boot/pipeline/translateWrapObjectLiteral', ['require', 'exports', 'module', 'boot/pipeline/translateAsIs'], function (require, exports, module, $cram_r0) {/** @license MIT License (c) copyright 2014 original authors */
/** @author Brian Cavalier */
/** @author John Hann */
module.exports = translateWrapObjectLiteral;

var translateAsIs = $cram_r0;

function translateWrapObjectLiteral (options, load) {
	// The \n allows for a comment on the last line!
	load.source = '(' + load.source + '\n)';
	return translateAsIs(options, load);
}

});


;define('boot/pipeline/_boot', ['require', 'exports', 'module', 'boot/pipeline/normalizeCjs', 'boot/pipeline/locateAsIs', 'boot/pipeline/fetchAsText', 'boot/pipeline/translateAsIs', 'boot/pipeline/translateWrapObjectLiteral', 'boot/pipeline/instantiateNode', 'boot/pipeline/instantiateScript', 'boot/lib/overrideIf', 'boot/lib/partial'], function (require, exports, module, $cram_r0, $cram_r1, $cram_r2, $cram_r3, $cram_r4, $cram_r5, $cram_r6, $cram_r7, $cram_r8) {/** @license MIT License (c) copyright 2014 original authors */
/** @author Brian Cavalier */
/** @author John Hann */
var normalizeCjs = $cram_r0;
var locateAsIs = $cram_r1;
var fetchAsText = $cram_r2;
var translateAsIs = $cram_r3;
var translateWrapObjectLiteral = $cram_r4;
var instantiateNode = $cram_r5;
var instantiateScript = $cram_r6;
var overrideIf = $cram_r7;
var partial = $cram_r8;

/*****
 TODO:
 1. All pipeline functions should take a leading `options` param.
 2. Create a boot/lib/partial module that allows functions to be partialed
 3. Pipelines should partial their `options`.
 *****/

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

});

