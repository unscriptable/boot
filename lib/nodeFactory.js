module.exports = nodeFactory;

var path = require('../lib/path');

var nodeEval = new Function(
	'require', 'exports', 'module', 'global',
	'eval(arguments[4]);'
);


// Note: does not support computed module ids in require() calls or
// async require(id, cb, eb) as in AMD!
function nodeFactory (load) {
	var deps, map, i;

	deps = load.deps;
	map = {};
	for (i = 0; i < deps.length; i++) {
		map[deps[i]] = i;
	}

	// create a factory
	return function () {
		var deps, loader, require, module;

		deps = arguments;
		loader = load.loader;
		require = function (id) {
			var dep;
			if (id in load.deps) {
				dep = deps[load.deps[id]];
			}
			// TODO: figure out if/how to resolve relative require()s of dynamic modules
			else if (path.isAbsUrl(id) && loader.has(id)) {
				dep = loader.get(id);
			}
			else {
				throw new Error('Module not resolved: ' + id + '. Dynamic require() not supported.');
			}
			return dep;
		};
		module = { id: load.name, uri: load.address, exports: {} };

		nodeEval(require, module.exports, module, loader.global, load.source);

		return module.exports;
	};
}
