module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1729954661665, function(require, module, exports) {


var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _jpegJs = _interopRequireDefault(require("jpeg-js"));

var _utils = require("@jimp/utils");

var MIME_TYPE = "image/jpeg";

var _default = function _default() {
  return {
    mime: (0, _defineProperty2["default"])({}, MIME_TYPE, ["jpeg", "jpg", "jpe"]),
    constants: {
      MIME_JPEG: MIME_TYPE
    },
    decoders: (0, _defineProperty2["default"])({}, MIME_TYPE, _jpegJs["default"].decode),
    encoders: (0, _defineProperty2["default"])({}, MIME_TYPE, function (image) {
      return _jpegJs["default"].encode(image.bitmap, image._quality).data;
    }),
    "class": {
      // The quality to be used when saving JPEG images
      _quality: 100,

      /**
       * Sets the quality of the image when saving as JPEG format (default is 100)
       * @param {number} n The quality to use 0-100
       * @param {function(Error, Jimp)} cb (optional) a callback for when complete
       * @returns {Jimp} this for chaining of methods
       */
      quality: function quality(n, cb) {
        if (typeof n !== "number") {
          return _utils.throwError.call(this, "n must be a number", cb);
        }

        if (n < 0 || n > 100) {
          return _utils.throwError.call(this, "n must be a number 0 - 100", cb);
        }

        this._quality = Math.round(n);

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
return __REQUIRE__(1729954661665);
})()
//miniprogram-npm-outsideDeps=["@babel/runtime/helpers/interopRequireDefault","@babel/runtime/helpers/defineProperty","jpeg-js","@jimp/utils"]
//# sourceMappingURL=index.js.map