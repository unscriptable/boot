/** @license MIT License (c) copyright 2014 original authors */
/** @author Brian Cavalier */
/** @author John Hann */
var Loader;
(function (exports, NativeLoader, global, amdEval) {
"use strict";

	var boot, document, defaultMain, options;

	boot = exports || {};

	document = global.document;

	defaultMain = 'boot/auto';

	boot.scriptUrl = getCurrentScript();
	boot.scriptPath = getPathFromUrl(boot.scriptUrl);

	options = {
		// TODO: switch to dist when es6-module-loader seems stable
//		loaderShimUrl: '//raw.github.com/ModuleLoader/es6-module-loader/master/dist/es6-module-loader.js',
		loaderShimUrl: '//raw.github.com/ModuleLoader/es6-module-loader/master/lib/es6-module-loader.js',
		bootMain: defaultMain,
		pipelineUrl: boot.scriptPath + 'build/_bootPipeline.js'
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
			self.bootLoader(options, loadMain, failLoudly);
		}
		function loadMain (loader) {
			// TODO: file an issue with es6-module-loader to implement .done()
			loader.import(options.bootMain).then(go, failLoudly);
		}
		function go (main) {
			main.main(beget(options));
		}
		function failLoudly (ex) {
			console.error(ex);
			throw ex;
		}
	};

	boot.bootLoader = function (options, callback, errback) {
		var main, loader, _set, _get;

		main = options.bootMain;
		loader = new Loader({});

		_set = this.legacySetter(loader);
		_get = this.legacyGetter(loader);
		// Expose boot.js as a module (Note: this doesn't seem like the
		// appropriate place to do this, but it must be done before loading
		// the pipeline.)
		_set('boot/boot', this);
		_set('boot', this);

		// set options
		options.loader = loader;
		options.baseUrl = boot.scriptPath;
		options.packages = { boot: boot.scriptUrl };

		// fetch default pipeline (in a simple amd-wrapped node bundle)
		this.fetchSimpleAmdBundle(
			{
				url: options.pipelineUrl,
				loader: loader,
				debug: options.debug
			},
			function () {
				var pipeline = _get('boot/pipeline/_boot');
				// extend loader
				pipeline(options).applyTo(loader);
				callback(loader);
			},
			errback
		);
	};

	boot.installShimLoader = function (options, callback, errback) {
		this.loadScript(
			{ url: options.loaderShimUrl, exports: 'Loader' },
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
			if (options.debug) {
				// TODO: consider reusing this with lib/addSourceUrl
				source += '\n/*\n//@ sourceURL='
					+ options.url.replace(/\s/g, '%20')
					+ '\n*/\n';
			}
			try { callback(amdEval(storeInRegistry, source)); }
			catch (ex) { errback(ex); }
		}
		function storeInRegistry (id, deps, factory) {
			var value = _define(id, deps, factory);
			_store(id, value);
		}
	};

	// TODO: share this with lib/fetchText somehow
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
		var el = document.documentElement, i, attr, prop;
		for (i = 0; i < el.attributes.length; i++) {
			attr = el.attributes[i];
			prop = attr.name.slice(5).replace(/(?:data)?-(.)/g, camelize);
			if (prop) options[prop] = attr.value || true;
		}
		return options;
		function camelize (m, l) { return l.toUpperCase();}
	};

	boot.simpleDefine = function (loader) {
		// TODO: have this return {id, deps, factory} instead of eagerly instantiating
		var _global, _require;
		// temporary work-around for es6-module-loader which throws when
		// accessing loader.global
		try { _global = loader.global } catch (ex) { _global = global; }
		_require = this.legacyGetter(loader);
		return function (id, deps, factory) {
			var scoped, modules, i, len, isCjs, result;
			scoped = {
				require: _require,
				exports: {},
				global: _global
			};
			scoped.module = { exports: scoped.exports };
			modules = [];
			// if deps has been omitted
			if (arguments.length === 2) {
				factory = deps;
				deps = ['require', 'exports', 'module'].slice(factory.length);
			}
			for (i = 0, len = deps.length; i < len; i++) {
				modules[i] = deps[i] in scoped
					? scoped[deps[i]]
					: scoped.require(deps[i]);
				isCjs |= deps[i] === 'exports' || deps[i] === 'module';
			}
			// eager instantiation.
			result = factory.apply(null, modules);
			return isCjs ? scoped.module.exports : result;
		};
	};

	boot.legacySetter = function (loader) {
		return function (id, module) {
			// TODO: only wrap if not an Object
			var wrapped = {
				// for real ES6 modules to consume this module
				'default': module,
				// for modules transpiled from ES6
				__es5Module: module
			};
			// TODO: spec is ambiguous whether Module is a constructor or factory
			loader.set(id, new Module(wrapped));
		};
	};

	boot.legacyGetter = function (loader) {
		return function (id) {
			var wrapped = loader.get(id);
			if (wrapped && wrapped.__es5Module) {
				return wrapped.__es5Module;
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
		// Otherwise, loop to find script.readyState == 'interactive' in IE.
		stack = '';
		try { throw new Error(); } catch (ex) { stack = ex.stack; }
		matches = stack.match(/(?:http:|https:|file:|\/).*?\.js/);

		return matches && matches[0];
	}

	function getPathFromUrl (url) {
		var last = url.lastIndexOf('/');
		return url.slice(0, last) + '/';
	}

	// TODO: reuse this
	function Begetter () {}
	function beget (base) {
		Begetter.prototype = base;
		var obj = new Begetter();
		Begetter.prototype = null;
		return obj;
	}

}(
	typeof exports !== 'undefined' && exports,
	typeof Loader !== 'undefined' && Loader,
	typeof global !== 'undefined' ? global : this,
	Function('define', 'return eval(arguments[1])')
));
