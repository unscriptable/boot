var formatPackages = require('./formatPackages');

var callbacks = require('when/callbacks');
var domReady = require('curl/src/curl/domReady');
var rest = require('rest');

module.exports = displayMetadata;

function displayMetadata (context) {
	write('This module\'s uri is "' + module.uri + '".');
	write('This module\'s id is "' + module.id + '".');
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
