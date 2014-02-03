/** @license MIT License (c) copyright 2014 original authors */
/** @author Brian Cavalier */
/** @author John Hann */
var findRequires = require('../lib/findRequires');
var captureAmdArgs = require('../lib/captureAmdArgs');
var amdFactory = require('../lib/amdFactory');

module.exports = instantiateAmd;

var scopedVars = ['require', 'exports', 'module'];

function instantiateAmd (load) {
	var loader, defineArgs, arity, factory, deps, i;

	loader = load.metadata.boot.loader;

	// the safest way to capture the many define() variations is to run it
	defineArgs = captureOrThrow(load);
	arity = defineArgs.factory.length;

	if (defineArgs.deps == null && arity > 0) {
		// is using load.source faster than defineArgs.factory.toString()?
		defineArgs.requires = findRequires(load.source);
		defineArgs.depsList = scopedVars.slice(0, arity);
	}

	factory = amdFactory(this, defineArgs, load);

	// remove "require", "exports", "module"
	deps = (defineArgs.depsList || []).concat(defineArgs.requires || []);
	for (i = deps.length - 1; i >= 0; i--) {
		if (scopedVars.indexOf(deps[i]) >= 0) {
			deps.splice(i, 1);
		}
	}

	return {
		deps: deps,
		execute: function () {
			return new Module(factory.apply(loader, arguments));
		}
	};
}

function captureOrThrow (load) {
	try {
		return captureAmdArgs(load.source);
	}
	catch (ex) {
		throw new Error('Error while capturing AMD define: ' + load.name);
	}
}
