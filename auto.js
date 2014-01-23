/** @license MIT License (c) copyright 2014 original authors */
/** @author Brian Cavalier */
/** @author John Hann */
module.exports = autoConfigure;

var defaultMeta = 'app.json,bower.json,package.json';

function autoConfigure (context) {
	var urls, files, howMany, i;

	if (!context.bootMeta) context.bootMeta = defaultMeta;

	urls = context.bootMeta.split(/\s*,\s*/);
	files = [];
	howMany = urls.length;

	for (i = 0; i < howMany; i++) {
		context.loader.import(urls[i]).then(collect.bind(null, i));
	}

	function collect (i, value) {
		files[i] = value;
		if (--howMany === 0) done();
	}
	function done () {
		// TODO: do something meaningful here
		console.log(files);
	}
}
