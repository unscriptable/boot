/** @license MIT License (c) copyright 2014 original authors */
/** @author Brian Cavalier */
/** @author John Hann */
var normalizeCjs = require('./normalizeCjs');
var locateNpm = require('./locateNpm');
var fetchAsText = require('./fetchAsText');
var translateAsIs = require('./translateAsIs');
var instantiateNode = require('./instantiateNode');
var partial = require('boot/lib/partial');

module.exports = function (options) {
	return withOptions(options, {
		normalize: normalizeCjs,
		locate: locateNpm,
		fetch: fetchAsText,
		translate: translateAsIs,
		instantiate: instantiateNode
	});
};

function withOptions (options, pipeline) {
	for (var p in pipeline) {
		pipeline[p] = partial(pipeline[p], [options]);
	}
	return pipeline;
}
