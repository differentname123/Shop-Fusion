module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1731211820000, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _utils = require("@jimp/utils");

/**
 * Flip the image horizontally
 * @param {boolean} horizontal a Boolean, if true the image will be flipped horizontally
 * @param {boolean} vertical a Boolean, if true the image will be flipped vertically
 * @param {function(Error, Jimp)} cb (optional) a callback for when complete
 * @returns {Jimp} this for chaining of methods
 */
function flipFn(horizontal, vertical, cb) {
  if (typeof horizontal !== "boolean" || typeof vertical !== "boolean") return _utils.throwError.call(this, "horizontal and vertical must be Booleans", cb);
  var bitmap = Buffer.alloc(this.bitmap.data.length);
  this.scanQuiet(0, 0, this.bitmap.width, this.bitmap.height, function (x, y, idx) {
    var _x = horizontal ? this.bitmap.width - 1 - x : x;

    var _y = vertical ? this.bitmap.height - 1 - y : y;

    var _idx = this.bitmap.width * _y + _x << 2;

    var data = this.bitmap.data.readUInt32BE(idx);
    bitmap.writeUInt32BE(data, _idx);
  });
  this.bitmap.data = Buffer.from(bitmap);

  if ((0, _utils.isNodePattern)(cb)) {
    cb.call(this, null, this);
  }

  return this;
}

var _default = function _default() {
  return {
    flip: flipFn,
    mirror: flipFn
  };
};

exports["default"] = _default;
module.exports = exports.default;
//# sourceMappingURL=index.js.map
}, function(modId) {var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1731211820000);
})()
//miniprogram-npm-outsideDeps=["@jimp/utils"]
//# sourceMappingURL=index.js.map