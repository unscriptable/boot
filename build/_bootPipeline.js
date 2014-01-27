
;define('boot/pipeline/locateAsIs', ['require', 'exports', 'module'], function (require, exports, module) {/** @license MIT License (c) copyright 2014 original authors */
/** @author Brian Cavalier */
/** @author John Hann */
module.exports = locateAsIs;

function locateAsIs (options, load) {
	return load.name;
}

});


;define('boot/lib/overrideIf', ['require', 'exports', 'module'], function (require, exports, module) {/** @license MIT License (c) copyright 2014 original authors */
/** @author Brian Cavalier */
/** @author John Hann */
module.exports = overrideIf;

function overrideIf (predicate, base, props) {
	for (var p in props) {
		if (p in base) {
			base[p] = choice(predicate, props[p], base[p]);
		}
	}
}

function choice (predicate, a, b) {
	return function () {
		var f = predicate.apply(this, arguments) ? a : b;
		return f.apply(this, arguments);
	};
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


;define('boot/lib/beget', ['require', 'exports', 'module'], function (require, exports, module) {/** @license MIT License (c) copyright 2014 original authors */
/** @author Brian Cavalier */
/** @author John Hann */
module.exports = beget;

function Begetter () {}
function beget (base) {
	var obj;
	Begetter.prototype = base;
	obj = new Begetter();
	Begetter.prototype = null;
	return obj;
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
	ensureEndSlash: ensureEndSlash,
	ensureExt: ensureExt,
	reduceLeadingDots: reduceLeadingDots,
	splitDirAndFile: splitDirAndFile
};

/**
 * Returns true if the url is absolute (not relative to the document)
 * @param {string} url
 * @return {Boolean}
 */
function isAbsUrl (url) {
	return absUrlRx.test(url);
}

/**
 * Returns true if the path provided is relative.
 * @param {string} path
 * @return {Boolean}
 */
function isRelPath (path) {
	return path.charAt(0) == '.';
}

/**
 * Joins path parts together.
 * @param {...string} parts
 * @return {string}
 */
function joinPaths () {
	var result, parts;
	parts = Array.prototype.slice.call(arguments);
	result = [parts.pop() || ''];
	while (parts.length) {
		result.unshift(ensureEndSlash(parts.pop()))
	}
	return result.join('');
}

/**
 * Ensures a trailing slash ("/") on a string.
 * @param {string} path
 * @return {string}
 */
function ensureEndSlash (path) {
	return path && path.charAt(path.length - 1) !== '/'
		? path + '/'
		: path;
}

/**
 * Checks for an extension at the end of the url or file path.  If one isn't
 * specified, it is added.
 * @param {string} path is any url or file path.
 * @param {string} ext is an extension, starting with a dot.
 * @returns {string} a url with an extension.
 */
function ensureExt (path, ext) {
	var hasExt = path.indexOf('.') > path.indexOf('/');
	return hasExt ? path : path + ext;
}

/**
 * Normalizes a CommonJS-style (or AMD) module id against a referring
 * module id.  Leading ".." or "." path specifiers are folded into
 * the referer's id/path.
 * @param {string} childId
 * @param {string} baseId
 * @return {string}
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

function splitDirAndFile (url) {
	var parts, file;
	parts = url.split('/');
	file = parts.pop();
	return [
		parts.join('/'),
		file
	];
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


;define('boot/lib/fetchText', ['require', 'exports', 'module'], function (require, exports, module) {module.exports = fetchText;

function fetchText (url, callback, errback) {
	var xhr;
	xhr = new XMLHttpRequest();
	xhr.open('GET', url, true);
	xhr.onreadystatechange = function () {
		if (xhr.readyState === 4) {
			if (xhr.status < 400) {
				callback(xhr.responseText);
			}
			else {
				errback(
					new Error(
						'fetchText() failed. url: "' + url
						+ '" status: ' + xhr.status + ' - ' + xhr.statusText
					)
				);
			}
		}
	};
	xhr.send(null);
};

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

var global;

if (typeof global === 'undefined') {
	global = window;
}

function nodeFactory (loader, load) {
	var require, module;

	require = function (id) {
		var abs = loader.normalize(id, load.name);
		return loader.get(abs);
	};
	module = { id: load.name, uri: load.address, exports: {} };

	return function () {
		// TODO: use loader.global when es6-module-loader implements it
		var g = global;
		nodeEval(require, module.exports, module, g, load.source);
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


;define('boot/pipeline/fetchAsText', ['require', 'exports', 'module', 'boot/lib/fetchText', 'boot/lib/Thenable'], function (require, exports, module, $cram_r0, $cram_r1) {/** @license MIT License (c) copyright 2014 original authors */
/** @author Brian Cavalier */
/** @author John Hann */
module.exports = fetchAsText;

var fetchText = $cram_r0;
var Thenable = $cram_r1;

function fetchAsText (options, load) {
	return Thenable(function(resolve, reject) {
		fetchText(load.address, resolve, reject);
	});

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


;define('boot/pipeline/locateFlatPackage', ['require', 'exports', 'module', 'boot/lib/path'], function (require, exports, module, $cram_r0) {/** @license MIT License (c) copyright 2014 original authors */
/** @author Brian Cavalier */
/** @author John Hann */
module.exports = locateFlatPackage;

var path = $cram_r0;

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

});


;define('boot/lib/package', ['require', 'exports', 'module', 'boot/lib/path'], function (require, exports, module, $cram_r0) {/** @license MIT License (c) copyright 2014 original authors */
/** @author Brian Cavalier */
/** @author John Hann */
var path = $cram_r0;

/**
 * @module boot/lib/package
 * Functions for CommonJS-style module packages
 */
module.exports = {

	normalizeDescriptor: normalizeDescriptor,
	normalizeCollection: normalizeCollection

};

function normalizeCollection (collection) {
	var result = {}, i, descriptor;
	if (collection && collection.length && collection[0]) {
		// array
		for (i = 0; i < collection.length; i++) {
			descriptor = normalizeDescriptor(collection[i]);
			result[descriptor.name] = descriptor;
		}
	}
	else if (collection) {
		// object hashmap
		for (i in collection) {
			descriptor = normalizeDescriptor(collection[i], i);
			result[descriptor.name] = descriptor;
		}
	}
	return result;
}

function normalizeDescriptor (thing, name) {
	var descriptor;

	descriptor = typeof thing === 'string'
		? fromString(thing)
		: fromObject(thing, name);

	if (name) descriptor.name = name; // override with hashmap key
	if (!descriptor.name) throw new Error('Package requires a name: ' + thing);
	descriptor.main = descriptor.main.replace(/\.js$/, '');
	descriptor.location = path.ensureEndSlash(descriptor.location);

	return descriptor;
}

function fromString (str) {
	var parts = str.split('/');
	return {
		main: parts.pop(),
		location: parts.join('/'),
		name: parts.pop()
	};
}

function fromObject (obj, name) {
	return {
		main: obj.main || 'main', // or index?
		location: obj.location || '',
		name: obj.name || name
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


;define('boot/pipeline/_boot', ['require', 'exports', 'module', 'boot/pipeline/normalizeCjs', 'boot/pipeline/locateFlatPackage', 'boot/pipeline/locateAsIs', 'boot/pipeline/fetchAsText', 'boot/pipeline/translateAsIs', 'boot/pipeline/translateWrapObjectLiteral', 'boot/pipeline/instantiateNode', 'boot/pipeline/instantiateScript', 'boot/lib/overrideIf', 'boot/lib/partial', 'boot/lib/package', 'boot/lib/beget'], function (require, exports, module, $cram_r0, $cram_r1, $cram_r2, $cram_r3, $cram_r4, $cram_r5, $cram_r6, $cram_r7, $cram_r8, $cram_r9, $cram_r10, $cram_r11) {/** @license MIT License (c) copyright 2014 original authors */
/** @author Brian Cavalier */
/** @author John Hann */
var normalizeCjs = $cram_r0;
var locateFlatPackage = $cram_r1;
var locateAsIs = $cram_r2;
var fetchAsText = $cram_r3;
var translateAsIs = $cram_r4;
var translateWrapObjectLiteral = $cram_r5;
var instantiateNode = $cram_r6;
var instantiateScript = $cram_r7;
var overrideIf = $cram_r8;
var partial = $cram_r9;
var pkg = $cram_r10;
var beget = $cram_r11;

module.exports = function (options) {
	var modulePipeline, jsonPipeline;

	options = beget(options);
	if (options.packages) {
		options.packages = pkg.normalizeCollection(options.packages);
	}

	modulePipeline = withOptions(options, {
		normalize: normalizeCjs,
		locate: locateFlatPackage,
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
			overrideIf(isBootModule, loader, modulePipeline);
			overrideIf(isJsonFile, loader, jsonPipeline);
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

