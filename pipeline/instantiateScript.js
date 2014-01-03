/** @license MIT License (c) copyright 2014 original authors */
/** @author Brian Cavalier */
/** @author John Hann */
module.exports = instantiateScript;

var globalFactory = require('../lib/globalFactory');

function instantiateScript (load) {
	return {
		execute: function () {
			return new Module(globalFactory(load.source));
		}
	};
}
