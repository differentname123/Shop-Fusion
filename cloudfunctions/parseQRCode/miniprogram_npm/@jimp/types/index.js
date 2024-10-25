module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1729528801489, function(require, module, exports) {


var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _timm = require("timm");

var _jpeg = _interopRequireDefault(require("@jimp/jpeg"));

var _png = _interopRequireDefault(require("@jimp/png"));

var _bmp = _interopRequireDefault(require("@jimp/bmp"));

var _tiff = _interopRequireDefault(require("@jimp/tiff"));

var _gif = _interopRequireDefault(require("@jimp/gif"));

var _default = function _default() {
  return (0, _timm.mergeDeep)((0, _jpeg["default"])(), (0, _png["default"])(), (0, _bmp["default"])(), (0, _tiff["default"])(), (0, _gif["default"])());
};

exports["default"] = _default;
module.exports = exports.default;
//# sourceMappingURL=index.js.map
}, function(modId) {var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1729528801489);
})()
//miniprogram-npm-outsideDeps=["@babel/runtime/helpers/interopRequireDefault","timm","@jimp/jpeg","@jimp/png","@jimp/bmp","@jimp/tiff","@jimp/gif"]
//# sourceMappingURL=index.js.map