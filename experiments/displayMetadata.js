module.exports = displayMetadata;

function displayMetadata (context) {
	write('This module\'s uri is "' + module.uri + '".');
	write('This module\'s id is "' + module.id + '".');
	write('Found the following packages:');
	write(JSON.stringify(Object.keys(context.packages), null, '    '), 'pre');
	console.log(context);
}

function write (msg, tagType) {
	document.body.appendChild(document.createElement(tagType || 'p')).innerHTML = msg;
}
