/** @license MIT License (c) copyright 2014 original authors */
/** @author Brian Cavalier */
/** @author John Hann */
module.exports = instantiateScript;

function instantiateScript (load) {
	return void globalEval(load.source);
}

function globalEval () { (1, eval)(arguments[0]); }
