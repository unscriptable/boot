/** @license MIT License (c) copyright 2014 original authors */
/** @author Brian Cavalier */
/** @author John Hann */
define(function () {

	return {
		moduleType: function (metadata) {
			return metadata.moduleType || 'amd'
		},
		locator: function (metadata) {
			return 'bower';
		},
		dependencies: function (metadata) {
			return metadata.dependencies;
		},
		main: function () {
			return this.metadata.main;
		}
	};

});
