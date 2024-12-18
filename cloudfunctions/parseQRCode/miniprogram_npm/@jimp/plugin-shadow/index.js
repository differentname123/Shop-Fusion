module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1731211820012, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _utils = require("@jimp/utils");

/**
 * Creates a circle out of an image.
 * @param {function(Error, Jimp)} options (optional)
 * opacity - opacity of the shadow between 0 and 1
 * size,- of the shadow
 * blur - how blurry the shadow is
 * x- x position of shadow
 * y - y position of shadow
 * @param {function(Error, Jimp)} cb (optional) a callback for when complete
 * @returns {Jimp} this for chaining of methods
 */
var _default = function _default() {
  return {
    shadow: function shadow() {
      var _this = this;

      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var cb = arguments.length > 1 ? arguments[1] : undefined;

      if (typeof options === "function") {
        cb = options;
        options = {};
      }

      var _options = options,
          _options$opacity = _options.opacity,
          opacity = _options$opacity === void 0 ? 0.7 : _options$opacity,
          _options$size = _options.size,
          size = _options$size === void 0 ? 1.1 : _options$size,
          _options$x = _options.x,
          x = _options$x === void 0 ? -25 : _options$x,
          _options$y = _options.y,
          y = _options$y === void 0 ? 25 : _options$y,
          _options$blur = _options.blur,
          blur = _options$blur === void 0 ? 5 : _options$blur; // clone the image

      var orig = this.clone();
      var shadow = this.clone(); // turn all it's pixels black

      shadow.scan(0, 0, shadow.bitmap.width, shadow.bitmap.height, function (x, y, idx) {
        shadow.bitmap.data[idx] = 0x00;
        shadow.bitmap.data[idx + 1] = 0x00;
        shadow.bitmap.data[idx + 2] = 0x00; // up the opacity a little,

        shadow.bitmap.data[idx + 3] = shadow.constructor.limit255(shadow.bitmap.data[idx + 3] * opacity);
        _this.bitmap.data[idx] = 0x00;
        _this.bitmap.data[idx + 1] = 0x00;
        _this.bitmap.data[idx + 2] = 0x00;
        _this.bitmap.data[idx + 3] = 0x00;
      }); // enlarge it. This creates a "shadow".

      shadow.resize(shadow.bitmap.width * size, shadow.bitmap.height * size).blur(blur); // Then blit the "shadow" onto the background and the image on top of that.

      this.composite(shadow, x, y);
      this.composite(orig, 0, 0);

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
return __REQUIRE__(1731211820012);
})()
//miniprogram-npm-outsideDeps=["@jimp/utils"]
//# sourceMappingURL=index.js.map