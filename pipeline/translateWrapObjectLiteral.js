/** @license MIT License (c) copyright 2014 original authors */
/** @author Brian Cavalier */
/** @author John Hann */
module.exports = translateWrapObjectLiteral;

var translateAsIs = require('./translateAsIs');

function translateWrapObjectLiteral (options, load) {
	// The \n allows for a comment on the last line!
	load.source = '(' + load.source + '\n)';
	return translateAsIs(options, load);
}
