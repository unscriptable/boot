/** @license MIT License (c) copyright 2014 original authors */
/** @author Brian Cavalier */
/** @author John Hann */
define(function () {

	return {
		moduleType: function (metadata) {
			return metadata.moduleType || 'node'
		},
		locator: function (metadata) {
			return 'npm';
		},
		dependencies: function (metadata) {
			return metadata.dependencies;
		},
		main: function (metadata) {
			return metadata.main;
		}
	};

});
