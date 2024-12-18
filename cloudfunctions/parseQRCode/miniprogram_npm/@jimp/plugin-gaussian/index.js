module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1731211820001, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _utils = require("@jimp/utils");

/**
 * Applies a true Gaussian blur to the image (warning: this is VERY slow)
 * @param {number} r the pixel radius of the blur
 * @param {function(Error, Jimp)} cb (optional) a callback for when complete
 * @returns {Jimp} this for chaining of methods
 */
var _default = function _default() {
  return {
    gaussian: function gaussian(r, cb) {
      // http://blog.ivank.net/fastest-gaussian-blur.html
      if (typeof r !== "number") {
        return _utils.throwError.call(this, "r must be a number", cb);
      }

      if (r < 1) {
        return _utils.throwError.call(this, "r must be greater than 0", cb);
      }

      var rs = Math.ceil(r * 2.57); // significant radius

      var range = rs * 2 + 1;
      var rr2 = r * r * 2;
      var rr2pi = rr2 * Math.PI;
      var weights = [];

      for (var y = 0; y < range; y++) {
        weights[y] = [];

        for (var x = 0; x < range; x++) {
          var dsq = Math.pow(x - rs, 2) + Math.pow(y - rs, 2);
          weights[y][x] = Math.exp(-dsq / rr2) / rr2pi;
        }
      }

      for (var _y = 0; _y < this.bitmap.height; _y++) {
        for (var _x = 0; _x < this.bitmap.width; _x++) {
          var red = 0;
          var green = 0;
          var blue = 0;
          var alpha = 0;
          var wsum = 0;

          for (var iy = 0; iy < range; iy++) {
            for (var ix = 0; ix < range; ix++) {
              var x1 = Math.min(this.bitmap.width - 1, Math.max(0, ix + _x - rs));
              var y1 = Math.min(this.bitmap.height - 1, Math.max(0, iy + _y - rs));
              var weight = weights[iy][ix];

              var _idx = y1 * this.bitmap.width + x1 << 2;

              red += this.bitmap.data[_idx] * weight;
              green += this.bitmap.data[_idx + 1] * weight;
              blue += this.bitmap.data[_idx + 2] * weight;
              alpha += this.bitmap.data[_idx + 3] * weight;
              wsum += weight;
            }

            var idx = _y * this.bitmap.width + _x << 2;
            this.bitmap.data[idx] = Math.round(red / wsum);
            this.bitmap.data[idx + 1] = Math.round(green / wsum);
            this.bitmap.data[idx + 2] = Math.round(blue / wsum);
            this.bitmap.data[idx + 3] = Math.round(alpha / wsum);
          }
        }
      }

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
return __REQUIRE__(1731211820001);
})()
//miniprogram-npm-outsideDeps=["@jimp/utils"]
//# sourceMappingURL=index.js.map