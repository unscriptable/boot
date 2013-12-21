define(function () {

	return {
		moduleType: function (metadata) {
			return metadata.moduleType || 'node'
		},
		locator: function (metadata) {
			return 'auto';
		},
		dependencies: function (metadata) {
			return metadata.dependencies;
		},
		main: function (metadata) {
			return metadata.main;
		}
	};

});
