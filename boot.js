/** @license MIT License (c) copyright 2014 original authors */
/** @author Brian Cavalier */
/** @author John Hann */
var Loader;
(function (exports, NativeLoader, global, amdEval) {
"use strict";

	var boot, document, options;

	boot = exports || {};

	document = global.document;

	boot.scriptUrl = getCurrentScript();

	options = {
		shimUrl: '//raw.github.com/ModuleLoader/es6-module-loader/master/dist/es6-module-loader.js',
		bootFiles: 'app.json,bower.json,package.json',
		pipelineUrl: boot.scriptUrl + '/' + './build/_bootPipeline.js'
	};

	boot.boot = function (options) {
		var self = this;
		if (NativeLoader) {
			getBootLoader();
		}
		else {
			self.installShimLoader(options, getBootLoader, failLoudly);
		}
		function getBootLoader () {
			self.bootLoader(options, getMetadataFiles, failLoudly);
		}
		function getMetadataFiles () {
			var urls = options.bootFiles.split(/\s*,\s*/);
			// TODO: add .json parsing to _boot pipeline
		}
		function failLoudly (ex) { throw ex; }
	};

	boot.bootLoader = function (options, callback, errback) {
		var loader;
		loader = new Loader({});
		// fetch default pipeline (in a simple amd-wrapped node bundle)
		this.fetchSimpleAmdBundle(
			{ url: options.pipelineUrl, loader: loader },
			function () {
				var pipeline = loader.get('boot/pipeline/_boot');
				// extend loader
				pipeline.applyTo(loader);
				callback(loader);
			},
			errback
		);
	};

	boot.installShimLoader = function (options, callback, errback) {
		this.loadScript(
			{ url: options.shimUrl, exports: 'Loader' },
			callback,
			errback
		);
	};

	boot.loadScript = function (options, callback, errback) {
		var url = options.url, exports = options.exports;
		this.injectScript(url, exports ? exportOrFail : callback, errback);
		function exportOrFail () {
			if (!(exports in global)) {
				errback(
					new Error('"' + exports + '" not found: "' + url + '"')
				);
			}
			callback(global[exports])
		}
	};

	var readyStates = { 'loaded': 1, 'complete': 1 };

	boot.injectScript = function (options, callback, errback) {
		var el, head;

		el = document.createElement('script');
		el.onload = el.onreadystatechange = process;
		el.onerror = fail;
		el.type = options.mimetype || 'text/javascript';
		el.charset = options.charset || 'utf-8';
		el.async = !options.order;
		el.src = options.url;

		head = document.head || document.getElementsByTagName('head')[0];
		head.appendChild(el);

		function process (ev) {
			ev = ev || global.event;
			// IE6-9 need to use onreadystatechange and look for
			// el.readyState in {loaded, complete} (yes, we need both)
			if (ev.type === 'load' || el.readyState in readyStates) {
				// release event listeners
				el.onload = el.onreadystatechange = el.onerror = '';
				callback();
			}
		}

		function fail () {
			errback(new Error('Syntax or http error: ' + options.url));
		}

	};

	boot.fetchSimpleAmdBundle = function (options, callback, errback) {
		var define = this.simpleDefine(options.loader);
		this.fetchText(options.url, evalOrFail, errback);
		function evalOrFail (source) {
			try { callback(amdEval(define, source)); }
			catch (ex) { errback(ex); }
		}
	};

	boot.fetchText = function (url, callback, errback) {
		var xhr;
		xhr = new XMLHttpRequest();
		xhr.open('GET', url, true);
		xhr.onreadystatechange = function () {
			if (xhr.readyState === 4) {
				if (xhr.status < 400) {
					callback(xhr.responseText);
				}
				else {
					errback(
						new Error('fetchText() failed. status: '
						+ xhr.status + ' - '
						+ xhr.statusText)
					);
				}
			}
		};
		xhr.send(null);
	};

	boot.mergeBrowserOptions = function (options) {
		var el = document.documentElement;
		options.bootFiles = el.getAttribute('data-boot') || options.bootFiles;
		options.shimUrl = el.getAttribute('data-loader-url') || options.shimUrl;
		return options;
	};

	boot.simpleDefine = function (loader) {
		return function (id, deps, factory) {
			var scoped, modules, i, len;
			scoped = {
				require: require,
				exports: {},
				global: loader.global
			};
			scoped.module = { exports: scoped.exports };
			modules = [];
			for (i = 0, len = deps.length; i < len; i++) {
				modules[i] = deps[i] in scoped
					? scoped[deps[i]]
					: scoped.require(deps[i]);
			}
			// eager instantiation
			return factory.apply(null, modules);
		};
		function require (id) { return loader.get(id); }
	};

	if (!exports) {
		boot.boot(boot.mergeBrowserOptions(options));
	}

	function getCurrentScript () {
		var stack, matches;

		// HTML5 way
		if (document && document.currentScript) return document.currentScript.src;

		// From https://gist.github.com/cphoover/6228063
		// (Note: Ben Alman's shortcut doesn't work everywhere.)
		// TODO: see if stack trace trick works in IE8+.
		// Otherwise, loop to find script.readyState == 'interactive'.
		stack = '';
		try { throw new Error(); } catch (ex) { stack = ex.stack; }
		matches = stack.match(/(?:http:|https:|file:|\/).*?\.js/);

		return matches && matches[0];
	}

}(
	typeof exports !== 'undefined' && exports,
	typeof Loader !== 'undefined' && Loader,
	typeof global !== 'undefined' ? global : this,
	Function('define', 'return eval(arguments[1])')
));
