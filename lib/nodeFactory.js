/** @license MIT License (c) copyright 2014 original authors */
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
