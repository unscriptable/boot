/** @license MIT License (c) copyright 2014 original authors */
/** @author Brian Cavalier */
/** @author John Hann */
module.exports = translateNoop;

function translateNoop (load) {
	return load.source;
}
