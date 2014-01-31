module.exports = displayMetadata;

function displayMetadata (context) {
	write('done! Found the following packages:');
	write(JSON.stringify(Object.keys(context.packages), null, '    '), 'pre');
	console.log(context);
}

function write (msg, tagType) {
	document.body.appendChild(document.createElement(tagType || 'p')).innerHTML = msg;
}
