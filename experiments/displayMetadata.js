var formatPackages = require('./formatPackages');

var callbacks = require('when/callbacks');
var domReady = require('curl/src/curl/domReady');
var rest = require('rest');
var template = require('./template.html');

module.exports = displayMetadata;

function displayMetadata (context) {
	var text = template.replace(/\$\{([^\}]+)\}/g, function (m, token) {
		return module[token];
	});
	write(text, 'div');
	write('Configured the following packages:');
	write(formatPackages(context.packages), 'pre');
	console.log(context);
}

function write (msg, tagType) {
	callbacks.call(domReady).then(function () {
		var doc = document;
		var body = doc.body;
		body.appendChild(doc.createElement(tagType || 'p')).innerHTML = msg;
	});
}
