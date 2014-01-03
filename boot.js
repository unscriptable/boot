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
		pipelineUrl: boot.scriptUrl + '/' + '../build/_bootPipeline.js'
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
		var loader, _set, _get;
		loader = new Loader({});
		_set = this.legacySetter(loader);
		_get = this.legacyGetter(loader);
		// Expose boot.js as a module (Note: this doesn't seem like the
		// appropriate place to do this, but it must be done before loading
		// the pipeline.)
		_set('boot/boot', this);
		_set('boot', this);
		// fetch default pipeline (in a simple amd-wrapped node bundle)
		this.fetchSimpleAmdBundle(
			{ url: options.pipelineUrl, loader: loader },
			function () {
				var pipeline = _get('boot/pipeline/_boot');
				// extend loader
				pipeline().applyTo(loader);
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
		var exports = options.exports;
		this.injectScript(options, exports ? exportOrFail : callback, errback);
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
		var _define, _store;
		_define = this.simpleDefine(options.loader);
		_store = this.legacySetter(options.loader);
		this.fetchText(options.url, evalOrFail, errback);
		function evalOrFail (source) {
			try { callback(amdEval(storeInRegistry, source)); }
			catch (ex) { errback(ex); }
		}
		function storeInRegistry (id, deps, factory) {
			var value = _define(id, deps, factory);
			_store(id, value);
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
						new Error(
							'fetchText() failed. url: "' + url
							+ '" status: ' + xhr.status + ' - ' + xhr.statusText
						)
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
		// TODO: have this return {id, deps, factory} instead of eagerly instantiating
		var _global, _require;
		// temporary work-around for es6-module-loader which throws when
		// accessing loader.global
		try { _global = loader.global } catch (ex) { _global = global; }
		_require = this.legacyGetter(loader);
		return function (id, deps, factory) {
			var scoped, modules, i, len;
			scoped = {
				require: _require,
				exports: {},
				global: _global
			};
			scoped.module = { exports: scoped.exports };
			modules = [];
			for (i = 0, len = deps.length; i < len; i++) {
				modules[i] = deps[i] in scoped
					? scoped[deps[i]]
					: scoped.require(deps[i]);
			}
			// eager instantiation. assume commonjs-wrapped
			factory.apply(null, modules);
			return scoped.module.exports;
		};
	};

	boot.legacySetter = function (loader) {
		return function (id, module) {
			var wrapped = {
				// for real ES6 modules to consume this module
				'default': module,
				// for modules transpiled from ES6
				__es6Module: module
			};
			// TODO: remove `new` when fixed in es6-module-loader
			loader.set(id, new Module(wrapped));
		};
	};

	boot.legacyGetter = function (loader) {
		return function (id) {
			var wrapped = loader.get(id);
			if (wrapped && wrapped.__es6Module) {
				return wrapped.__es6Module;
			}
			else {
				// TODO: es6-module-transpiler handles this differently
				// https://github.com/square/es6-module-transpiler/issues/85#issuecomment-30961158
				return wrapped;
			}
		};
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
