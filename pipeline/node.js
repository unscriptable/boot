/** @license MIT License (c) copyright 2014 original authors */
/** @author Brian Cavalier */
/** @author John Hann */
var normalizeCjs = require('./normalizeCjs');
var locateNpm = require('./locateNpm');
var fetchAsText = require('./fetchAsText');
var translateAsIs = require('./translateAsIs');
var instantiateNode = require('./instantiateNode');

module.exports = function (options) {
	return withOptions(options, {
		normalize: normalizeCjs,
		locate: withOptions(options, locateNpm),
		fetch: fetchAsText,
		translate: translateAsIs,
		instantiate: instantiateNode
	});
};

function withOptions (options, func) {
	return function (load) {
		load.metadata.boot = options;
		return func.call(this, load);
	};
}
