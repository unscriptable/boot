var formatPackages = require('./formatPackages');

var callbacks = require('when/callbacks');
var domReady = require('curl/src/curl/domReady');

module.exports = displayMetadata;

function displayMetadata (context) {
	writeModuleInfo();
	write('Configured the following packages:');
	write(formatPackages(context.packages), 'pre');
	console.log(context);
}

//function writeModuleInfo () {
//	write('Module: ' + module.id + ', ' + module.uri, 'div');
//}

function write (msg, tagType) {
	callbacks.call(domReady).then(function () {
		var doc = document;
		var body = doc.body;
		body.appendChild(doc.createElement(tagType || 'p')).innerHTML = msg;
	});
}

var template = require('./template.html');
function writeModuleInfo () {
	var text;
	text = template.replace(/\$\{([^\}]+)\}/g, function (m, token) {
		return module[token];
	});
	write(text, 'div');
}

