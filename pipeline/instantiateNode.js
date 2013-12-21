var findRequires = require('../lib/findRequires');
var nodeFactory = require('../lib/nodeFactory');

module.exports = instantiateNode;

function instantiateNode (load) {
	load.loader = this;
	load.deps = findRequires(load.source);
	return {
		deps: load.deps,
		execute: nodeFactory(load)
	};
}
