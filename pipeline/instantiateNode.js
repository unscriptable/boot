/** @license MIT License (c) copyright 2014 original authors */
/** @author Brian Cavalier */
/** @author John Hann */
var findRequires = require('../lib/findRequires');
var nodeFactory = require('../lib/nodeFactory');

module.exports = instantiateNode;

function instantiateNode (load) {
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
