/** @license MIT License (c) copyright 2014 original authors */
/** @author Brian Cavalier */
/** @author John Hann */
var Loader;
(function (exports, NativeLoader, global, amdEval) {
"use strict";

	var doc, defaultShimLoaderUrl, bootPipelineUrl, undefined;

	doc = global.document;

	defaultShimLoaderUrl = '//raw.github.com/ModuleLoader/es6-module-loader/master/dist/es6-module-loader.js';
	bootPipelineUrl = './build/_bootPipeline.js';

	var boot = exports || {};

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
			// TODO
		}
		function failLoudly (ex) { throw ex; }
	};

	boot.bootLoader = function (options, callback, errback) {
		var loader;
		loader = new Loader({});
		// fetch default pipeline (in a simple amd-wrapped node bundle)
		this.fetchSimpleAmdBundle(
			{ url: bootPipelineUrl, loader: loader },
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
			{ url: options.shimLoaderUrl, exports: 'Loader' },
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

		el = doc.createElement('script');
		el.onload = el.onreadystatechange = process;
		el.onerror = fail;
		el.type = options.mimetype || 'text/javascript';
		el.charset = options.charset || 'utf-8';
		el.async = !options.order;
		el.src = options.url;

		head = doc.head || doc.getElementsByTagName('head')[0];
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
		var html = doc.documentElement;
		options.bootFiles = html.getAttribute('data-boot');
		options.shimLoaderUrl = html.getAttribute('data-loader-url') || defaultShimLoaderUrl;
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

	function noop () {}

}(
	typeof exports !== 'undefined' && exports,
	typeof Loader !== 'undefined' && Loader,
	typeof global !== 'undefined' ? global : this,
	Function('define', 'return eval(arguments[1])')
));
