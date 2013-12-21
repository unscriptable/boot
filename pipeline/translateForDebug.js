module.exports = translateForDebug;

var addSourceUrl = require('../lib/addSourceUrl');

function translateForDebug (load) {
	return addSourceUrl(load.address, load.source);
}
