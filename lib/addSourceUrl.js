module.exports = addSourceUrl;

function addSourceUrl (url, source) {
	return source
		+ '\n/*\n////@ sourceURL='
		+ url.replace(/\s/g, '%20')
		+ '\n*/\n';
}
