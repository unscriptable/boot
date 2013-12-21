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
