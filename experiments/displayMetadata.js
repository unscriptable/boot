var formatPackages = require('./formatPackages');

module.exports = displayMetadata;

function displayMetadata (context) {
	write('This module\'s uri is "' + module.uri + '".');
	write('This module\'s id is "' + module.id + '".');
	write('Found the following packages:');
	write(formatPackages(context.packages), 'pre');
	console.log(context);
}

function write (msg, tagType) {
	document.body.appendChild(document.createElement(tagType || 'p')).innerHTML = msg;
}
