module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1729528801483, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _utils = require("@jimp/utils");

var _default = function _default() {
  return {
    /**
     * Uniformly scales the image by a factor.
     * @param {number} f the factor to scale the image by
     * @param {string} mode (optional) a scaling method (e.g. Jimp.RESIZE_BEZIER)
     * @param {function(Error, Jimp)} cb (optional) a callback for when complete
     * @returns {Jimp} this for chaining of methods
     */
    scale: function scale(f, mode, cb) {
      if (typeof f !== "number") {
        return _utils.throwError.call(this, "f must be a number", cb);
      }

      if (f < 0) {
        return _utils.throwError.call(this, "f must be a positive number", cb);
      }

      if (typeof mode === "function" && typeof cb === "undefined") {
        cb = mode;
        mode = null;
      }

      var w = this.bitmap.width * f;
      var h = this.bitmap.height * f;
      this.resize(w, h, mode);

      if ((0, _utils.isNodePattern)(cb)) {
        cb.call(this, null, this);
      }

      return this;
    },

    /**
     * Scale the image to the largest size that fits inside the rectangle that has the given width and height.
     * @param {number} w the width to resize the image to
     * @param {number} h the height to resize the image to
     * @param {string} mode (optional) a scaling method (e.g. Jimp.RESIZE_BEZIER)
     * @param {function(Error, Jimp)} cb (optional) a callback for when complete
     * @returns {Jimp} this for chaining of methods
     */
    scaleToFit: function scaleToFit(w, h, mode, cb) {
      if (typeof w !== "number" || typeof h !== "number") {
        return _utils.throwError.call(this, "w and h must be numbers", cb);
      }

      if (typeof mode === "function" && typeof cb === "undefined") {
        cb = mode;
        mode = null;
      }

      var f = w / h > this.bitmap.width / this.bitmap.height ? h / this.bitmap.height : w / this.bitmap.width;
      this.scale(f, mode);

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
return __REQUIRE__(1729528801483);
})()
//miniprogram-npm-outsideDeps=["@jimp/utils"]
//# sourceMappingURL=index.js.map