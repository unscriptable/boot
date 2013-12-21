module.exports = fetchAsText;

var fetchText = require('../lib/fetchText');

function fetchAsText (load) {
	return this.Promise(function(resolve, reject) {
		fetchText(load.address, resolve, reject);
	});

}
