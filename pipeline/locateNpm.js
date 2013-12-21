var path = require('../lib/path');

module.exports = locateNpm;

var joinPaths = path.joinPaths;
var ensureExt = path.ensureExt;

function locateNpm (load) {
	return ensureExt(joinPaths(this.baseUrl, load.name), '.js');
}
