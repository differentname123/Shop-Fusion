module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1731211820015, function(require, module, exports) {


var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _pngjs = require("pngjs");

var _utils = require("@jimp/utils");

var MIME_TYPE = "image/png"; // PNG filter types

var PNG_FILTER_AUTO = -1;
var PNG_FILTER_NONE = 0;
var PNG_FILTER_SUB = 1;
var PNG_FILTER_UP = 2;
var PNG_FILTER_AVERAGE = 3;
var PNG_FILTER_PATH = 4;

var _default = function _default() {
  return {
    mime: (0, _defineProperty2["default"])({}, MIME_TYPE, ["png"]),
    constants: {
      MIME_PNG: MIME_TYPE,
      PNG_FILTER_AUTO: PNG_FILTER_AUTO,
      PNG_FILTER_NONE: PNG_FILTER_NONE,
      PNG_FILTER_SUB: PNG_FILTER_SUB,
      PNG_FILTER_UP: PNG_FILTER_UP,
      PNG_FILTER_AVERAGE: PNG_FILTER_AVERAGE,
      PNG_FILTER_PATH: PNG_FILTER_PATH
    },
    hasAlpha: (0, _defineProperty2["default"])({}, MIME_TYPE, true),
    decoders: (0, _defineProperty2["default"])({}, MIME_TYPE, _pngjs.PNG.sync.read),
    encoders: (0, _defineProperty2["default"])({}, MIME_TYPE, function (data) {
      var png = new _pngjs.PNG({
        width: data.bitmap.width,
        height: data.bitmap.height
      });
      png.data = data.bitmap.data;
      return _pngjs.PNG.sync.write(png, {
        width: data.bitmap.width,
        height: data.bitmap.height,
        deflateLevel: data._deflateLevel,
        deflateStrategy: data._deflateStrategy,
        filterType: data._filterType,
        colorType: typeof data._colorType === "number" ? data._colorType : data._rgba ? 6 : 2,
        inputHasAlpha: data._rgba
      });
    }),
    "class": {
      _deflateLevel: 9,
      _deflateStrategy: 3,
      _filterType: PNG_FILTER_AUTO,
      _colorType: null,

      /**
       * Sets the deflate level used when saving as PNG format (default is 9)
       * @param {number} l Deflate level to use 0-9. 0 is no compression. 9 (default) is maximum compression.
       * @param {function(Error, Jimp)} cb (optional) a callback for when complete
       * @returns {Jimp} this for chaining of methods
       */
      deflateLevel: function deflateLevel(l, cb) {
        if (typeof l !== "number") {
          return _utils.throwError.call(this, "l must be a number", cb);
        }

        if (l < 0 || l > 9) {
          return _utils.throwError.call(this, "l must be a number 0 - 9", cb);
        }

        this._deflateLevel = Math.round(l);

        if ((0, _utils.isNodePattern)(cb)) {
          cb.call(this, null, this);
        }

        return this;
      },

      /**
       * Sets the deflate strategy used when saving as PNG format (default is 3)
       * @param {number} s Deflate strategy to use 0-3.
       * @param {function(Error, Jimp)} cb (optional) a callback for when complete
       * @returns {Jimp} this for chaining of methods
       */
      deflateStrategy: function deflateStrategy(s, cb) {
        if (typeof s !== "number") {
          return _utils.throwError.call(this, "s must be a number", cb);
        }

        if (s < 0 || s > 3) {
          return _utils.throwError.call(this, "s must be a number 0 - 3", cb);
        }

        this._deflateStrategy = Math.round(s);

        if ((0, _utils.isNodePattern)(cb)) {
          cb.call(this, null, this);
        }

        return this;
      },

      /**
       * Sets the filter type used when saving as PNG format (default is automatic filters)
       * @param {number} f The quality to use -1-4.
       * @param {function(Error, Jimp)} cb (optional) a callback for when complete
       * @returns {Jimp} this for chaining of methods
       */
      filterType: function filterType(f, cb) {
        if (typeof f !== "number") {
          return _utils.throwError.call(this, "n must be a number", cb);
        }

        if (f < -1 || f > 4) {
          return _utils.throwError.call(this, "n must be -1 (auto) or a number 0 - 4", cb);
        }

        this._filterType = Math.round(f);

        if ((0, _utils.isNodePattern)(cb)) {
          cb.call(this, null, this);
        }

        return this;
      },

      /**
       * Sets the color type used when saving as PNG format
       * @param {number} s color type to use 0, 2, 4, 6.
       * @param {function(Error, Jimp)} cb (optional) a callback for when complete
       * @returns {Jimp} this for chaining of methods
       */
      colorType: function colorType(s, cb) {
        if (typeof s !== "number") {
          return _utils.throwError.call(this, "s must be a number", cb);
        }

        if (s !== 0 && s !== 2 && s !== 4 && s !== 6) {
          return _utils.throwError.call(this, "s must be a number 0, 2, 4, 6.", cb);
        }

        this._colorType = Math.round(s);

        if ((0, _utils.isNodePattern)(cb)) {
          cb.call(this, null, this);
        }

        return this;
      }
    }
  };
};

exports["default"] = _default;
module.exports = exports.default;
//# sourceMappingURL=index.js.map
}, function(modId) {var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1731211820015);
})()
//miniprogram-npm-outsideDeps=["@babel/runtime/helpers/interopRequireDefault","@babel/runtime/helpers/defineProperty","pngjs","@jimp/utils"]
//# sourceMappingURL=index.js.map