module.exports = fetchViaXhr;

var fetchText = require('../lib/fetchText');

function fetchViaXhr (load) {
	return this.Promise(function(resolve, reject) {
		fetchText(load.address, resolve, reject);
	});

}
