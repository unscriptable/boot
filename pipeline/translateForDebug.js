/** @license MIT License (c) copyright 2014 original authors */
/** @author Brian Cavalier */
/** @author John Hann */
module.exports = translateForDebug;

var addSourceUrl = require('../lib/addSourceUrl');

function translateForDebug (load) {
	return addSourceUrl(load.address, load.source);
}
