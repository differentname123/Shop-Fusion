(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.FJSXRuntime = {}));
}(this, (function (exports) { 'use strict';

	function getDefaultExportFromCjs (x) {
		return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
	}

	function createCommonjsModule(fn, basedir, module) {
		return module = {
			path: basedir,
			exports: {},
			require: function (path, base) {
				return commonjsRequire(path, (base === undefined || base === null) ? module.path : base);
			}
		}, fn(module, module.exports), module.exports;
	}

	function commonjsRequire () {
		throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
	}

	var objectWithoutPropertiesLoose = createCommonjsModule(function (module) {
	function _objectWithoutPropertiesLoose(r, e) {
	  if (null == r) return {};
	  var t = {};
	  for (var n in r) if ({}.hasOwnProperty.call(r, n)) {
	    if (e.includes(n)) continue;
	    t[n] = r[n];
	  }
	  return t;
	}
	module.exports = _objectWithoutPropertiesLoose, module.exports.__esModule = true, module.exports["default"] = module.exports;
	});

	var objectWithoutProperties = createCommonjsModule(function (module) {
	function _objectWithoutProperties(e, t) {
	  if (null == e) return {};
	  var o,
	    r,
	    i = objectWithoutPropertiesLoose(e, t);
	  if (Object.getOwnPropertySymbols) {
	    var s = Object.getOwnPropertySymbols(e);
	    for (r = 0; r < s.length; r++) o = s[r], t.includes(o) || {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]);
	  }
	  return i;
	}
	module.exports = _objectWithoutProperties, module.exports.__esModule = true, module.exports["default"] = module.exports;
	});

	var _objectWithoutProperties = /*@__PURE__*/getDefaultExportFromCjs(objectWithoutProperties);

	var _excluded = ["ref"];
	// 实现jsx-automatic 入口
	function jsx(type, config, key) {
	  var _ref = config || {},
	    ref = _ref.ref,
	    props = _objectWithoutProperties(_ref, _excluded);
	  return {
	    key: key,
	    ref: ref,
	    type: type,
	    props: props
	  };
	}

	var fragment = (function (props) {
	  return props.children;
	});

	exports.Fragment = fragment;
	exports.jsx = jsx;
	exports.jsxDEV = jsx;
	exports.jsxs = jsx;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
