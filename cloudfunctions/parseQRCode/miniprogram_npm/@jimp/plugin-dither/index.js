module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1729954661675, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _utils = require("@jimp/utils");

/**
 * Apply a ordered dithering effect
 * @param {function(Error, Jimp)} cb (optional) a callback for when complete
 * @returns {Jimp} this for chaining of methods
 */
function dither(cb) {
  var rgb565Matrix = [1, 9, 3, 11, 13, 5, 15, 7, 4, 12, 2, 10, 16, 8, 14, 6];
  this.scanQuiet(0, 0, this.bitmap.width, this.bitmap.height, function (x, y, idx) {
    var thresholdId = ((y & 3) << 2) + x % 4;
    var dither = rgb565Matrix[thresholdId];
    this.bitmap.data[idx] = Math.min(this.bitmap.data[idx] + dither, 0xff);
    this.bitmap.data[idx + 1] = Math.min(this.bitmap.data[idx + 1] + dither, 0xff);
    this.bitmap.data[idx + 2] = Math.min(this.bitmap.data[idx + 2] + dither, 0xff);
  });

  if ((0, _utils.isNodePattern)(cb)) {
    cb.call(this, null, this);
  }

  return this;
}

var _default = function _default() {
  return {
    dither565: dither,
    dither16: dither
  };
};

exports["default"] = _default;
module.exports = exports.default;
//# sourceMappingURL=index.js.map
}, function(modId) {var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1729954661675);
})()
//miniprogram-npm-outsideDeps=["@jimp/utils"]
//# sourceMappingURL=index.js.map