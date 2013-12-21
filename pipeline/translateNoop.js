module.exports = translateNoop;

function translateNoop (load) {
	return load.source;
}
