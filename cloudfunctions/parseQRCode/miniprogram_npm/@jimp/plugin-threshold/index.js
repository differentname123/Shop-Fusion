module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1731211820013, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _utils = require("@jimp/utils");

/**
 * Applies a minimum color threshold to a greyscale image.  Converts image to greyscale by default
 * @param {number} options object
 *  max: A number auto limited between 0 - 255
 *  replace: (optional) A number auto limited between 0 - 255 (default 255)
 *  autoGreyscale: (optional) A boolean whether to apply greyscale beforehand (default true)
 * @param {number} cb (optional) a callback for when complete
 * @return {this} this for chaining of methods
 */
var _default = function _default() {
  return {
    threshold: function threshold(_ref, cb) {
      var _this = this;

      var max = _ref.max,
          _ref$replace = _ref.replace,
          replace = _ref$replace === void 0 ? 255 : _ref$replace,
          _ref$autoGreyscale = _ref.autoGreyscale,
          autoGreyscale = _ref$autoGreyscale === void 0 ? true : _ref$autoGreyscale;

      if (typeof max !== "number") {
        return _utils.throwError.call(this, "max must be a number", cb);
      }

      if (typeof replace !== "number") {
        return _utils.throwError.call(this, "replace must be a number", cb);
      }

      if (typeof autoGreyscale !== "boolean") {
        return _utils.throwError.call(this, "autoGreyscale must be a boolean", cb);
      }

      max = this.constructor.limit255(max);
      replace = this.constructor.limit255(replace);

      if (autoGreyscale) {
        this.greyscale();
      }

      this.scanQuiet(0, 0, this.bitmap.width, this.bitmap.height, function (x, y, idx) {
        var grey = _this.bitmap.data[idx] < max ? _this.bitmap.data[idx] : replace;
        _this.bitmap.data[idx] = grey;
        _this.bitmap.data[idx + 1] = grey;
        _this.bitmap.data[idx + 2] = grey;
      });

      if ((0, _utils.isNodePattern)(cb)) {
        cb.call(this, null, this);
      }

      return this;
    }
  };
};

exports["default"] = _default;
module.exports = exports.default;
//# sourceMappingURL=index.js.map
}, function(modId) {var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1731211820013);
})()
//miniprogram-npm-outsideDeps=["@jimp/utils"]
//# sourceMappingURL=index.js.map