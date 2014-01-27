exports.main = displayMetadata;

function displayMetadata (context) {
	write('done! Found the following packages:');
	write(Object.keys(context.packages));
	console.log(context);
}

function write (msg) {
	document.body.appendChild(document.createElement('p')).innerHTML = msg;
}
