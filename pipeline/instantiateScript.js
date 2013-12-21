module.exports = instantiateScript;

function instantiateScript (load) {
	return void globalEval(load.source);
}

function globalEval () { (1, eval)(arguments[0]); }
