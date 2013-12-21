/** @license MIT License (c) copyright 2014 original authors */
/** @author Brian Cavalier */
/** @author John Hann */
module.exports = fetchText;

var _require, slice, _fetch;

_require = typeof require == 'function' && require;

slice = Array.prototype.slice;

// determine the correct method upon first use
_fetch = function (url, callback, errback) {
	var fs;
	if (hasXhr()) {
		_fetch = xhrFetch;
	}
	else if (fs = hasFsModule()) {
		_fetch = (isNodeFs(fs) ? nodeFetch : cjsFetch).bind(null, fs);
	}
	else {
		_fetch = failFetch;
	}
	return _fetch(url, callback, errback);
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
function fetchText (url, callback, errback) {
	return _fetch(url, callback, errback);
}

function xhrFetch (url, callback, errback) {
	var xhr;
	xhr = new XMLHttpRequest();
	xhr.open('GET', url, true);
	xhr.onreadystatechange = function () {
		if (xhr.readyState === 4) {
			if (xhr.status < 400) {
				callback(xhr.responseText);
			}
			else {
				errback(new Error('fetchText() failed. status: ' + xhr.status + ' - ' + xhr.statusText));
			}
		}
	};
	xhr.send(null);
}

function nodeFetch (fs, url, callback, errback) {
	fs.readFile(url, function (err) {
		if (err) {
			errback(err);
		}
		else {
			callback.apply(this, slice.call(arguments, 1));
		}
	});
}

function cjsFetch (fs, url, callback, errback) {
	try {
		callback(fs.read(url));
	}
	catch (ex) {
		errback(ex);
	}
}

function failFetch () {
	throw new Error('Could not create a text file fetcher.');
}

function hasXhr () {
	return typeof XMLHttpRequest != 'undefined';
}

function hasFsModule () {
	if (_require) {
		try {
			return _require('fs');
		}
		catch (ex) { }
	}
}

function isNodeFs (fs) {
	return typeof fs.readFile == 'function' && fs.readFile.length > 1;
}
