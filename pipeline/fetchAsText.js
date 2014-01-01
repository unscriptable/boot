/** @license MIT License (c) copyright 2014 original authors */
/** @author Brian Cavalier */
/** @author John Hann */
module.exports = fetchAsText;

var fetchText = require('boot').fetchText;
var Promise = require('../lib/Promise');

function fetchAsText (load) {
	return Promise(function(resolve, reject) {
		fetchText(load.address, resolve, reject);
	});

}
