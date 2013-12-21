/** @license MIT License (c) copyright 2014 original authors */
/** @author Brian Cavalier */
/** @author John Hann */
(function (boot, doc, globalDefine) { "use strict";

	/**
	 * Loads the plain text file at the url provided, interprets it as JSON,
	 * and passes the resulting value to the callback function.  If an error
	 * occurs, the errback function is called with an Error.  If JSON is not
	 * supported by the current environment, eval() is used.
	 * @function
	 * @param {string} url
	 * @param {function (*): undefined} callback
	 * @param {function (Error): undefined} errback
	 */
	boot.fetchJson = function (url, callback, errback) {
		boot.fetchText(
			url,
			function (json) {
				var value;
				try { value = boot.fromJson(json); }
				catch (ex) { errback(ex); return; }
				callback(value);
			},
			errback
		);
	};

	boot.fetchSimpleAmd = function (url, callback, errback) {
		boot.fetchText(
			url,
			function (source) {
				callback(globalDefine(source));
			},
			errback
		);
	};

	/**
	 * Loads the contents of a plain text file at the url provided and passes
	 * it to the callback function.  If an error occurs, the errback function
	 * is called with an Error.
	 * @function
	 * @param {string} url
	 * @param {function (string): undefined} callback
	 * @param {function (Error): undefined} errback
	 */
	boot.fetchText = xhrFetch;

	boot.fromJson = function (json) {
		return JSON.parse(json);
	};

	/**
	 * Initiates the boot sequence.
	 * @function
	 */
	boot.boot = function () {
		var urls, count, meta, cb, atLeastOne;

		urls = metaFiles();
		count = urls.length;
		meta = [];

		urls.forEach(function (url, i) {
			cb = callback.bind(null, url ,i);
			boot.fetchJson(url, cb, cb);
		});

		function callback (url, i, data) {
			console.log('got', url, i, data);
			meta[i] = { url: url };
			if (!(data instanceof Error)) {
				atLeastOne = true;
				meta[i].data = data;
			}
			if (--count == 0) {
				if (atLeastOne) {
					// TODO: apply heuristics and combine meta files
					console.log('got some stuff', meta);
					boot.fetchSimpleAmd(
						boot.thisScriptUrl + '/../metadata/' + meta[0].url + '.js',
						console.log.bind(console),
						console.error.bind(console)
					);
				}
				else {
					// fail loudly
					throw new Error('No meta files were found.');
				}
			}
		}
	};

	boot.thisScriptUrl = getScriptUrl();

	function metaFiles () {
		var urls;
		urls = doc.documentElement.getAttribute('data-boot');
		if (typeof urls === 'string') {
			urls = urls.split(/\s*,\s*/);
		}
//		if (!urls) console.log('To limit HTTP requests, use <html data-boot="app.json">');
		// if not specified, look for all known meta files
		return urls || ['app.json', 'bower.json', 'package.json'];
	}

	function xhrFetch (url, callback, errback) {
		var xhr, msg;
		xhr = new XMLHttpRequest();
		xhr.open('GET', url, true);
		xhr.onreadystatechange = function () {
			if (xhr.readyState === 4) {
				if (xhr.status < 400) {
					callback(xhr.responseText);
				}
				else {
					msg = url + ' fetch failed. status: '
						+ xhr.status + ' - ' + xhr.statusText;
					errback(new Error(msg));
				}
			}
		};
		xhr.send(null);
	}

	function getScriptUrl () {
		var stack, matches;

		// HTML5 way
		if (doc.currentScript) return doc.currentScript.src;

		// From https://gist.github.com/cphoover/6228063
		// (Note: Ben Alman's shortcut doesn't work everywhere.)
		// TODO: see if stack trace trick works in IE8+.
		// Otherwise, loop to find script.readyState == 'interactive'.
		stack = '';
		try { throw new Error(); } catch (ex) { stack = ex.stack; }
		matches = stack.match(/(?:http:|https:|file:|\/).*?\.js/);

		return matches && matches[0];
	}

	boot.boot();

}(
	typeof _exports !== 'undefined' ? _exports : {},
	document,
	// use Function constructor to stop minification from renaming 'define'
	new Function('define', 'return eval(arguments[1])')
		.bind(null, function (f) { return f; })
));
