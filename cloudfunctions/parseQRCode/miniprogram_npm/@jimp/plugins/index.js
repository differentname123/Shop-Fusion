module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1729954661691, function(require, module, exports) {


var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _timm = require("timm");

var _pluginBlit = _interopRequireDefault(require("@jimp/plugin-blit"));

var _pluginBlur = _interopRequireDefault(require("@jimp/plugin-blur"));

var _pluginCircle = _interopRequireDefault(require("@jimp/plugin-circle"));

var _pluginColor = _interopRequireDefault(require("@jimp/plugin-color"));

var _pluginContain = _interopRequireDefault(require("@jimp/plugin-contain"));

var _pluginCover = _interopRequireDefault(require("@jimp/plugin-cover"));

var _pluginCrop = _interopRequireDefault(require("@jimp/plugin-crop"));

var _pluginDisplace = _interopRequireDefault(require("@jimp/plugin-displace"));

var _pluginDither = _interopRequireDefault(require("@jimp/plugin-dither"));

var _pluginFisheye = _interopRequireDefault(require("@jimp/plugin-fisheye"));

var _pluginFlip = _interopRequireDefault(require("@jimp/plugin-flip"));

var _pluginGaussian = _interopRequireDefault(require("@jimp/plugin-gaussian"));

var _pluginInvert = _interopRequireDefault(require("@jimp/plugin-invert"));

var _pluginMask = _interopRequireDefault(require("@jimp/plugin-mask"));

var _pluginNormalize = _interopRequireDefault(require("@jimp/plugin-normalize"));

var _pluginPrint = _interopRequireDefault(require("@jimp/plugin-print"));

var _pluginResize = _interopRequireDefault(require("@jimp/plugin-resize"));

var _pluginRotate = _interopRequireDefault(require("@jimp/plugin-rotate"));

var _pluginScale = _interopRequireDefault(require("@jimp/plugin-scale"));

var _pluginShadow = _interopRequireDefault(require("@jimp/plugin-shadow"));

var _pluginThreshold = _interopRequireDefault(require("@jimp/plugin-threshold"));

var plugins = [_pluginBlit["default"], _pluginBlur["default"], _pluginCircle["default"], _pluginColor["default"], _pluginContain["default"], _pluginCover["default"], _pluginCrop["default"], _pluginDisplace["default"], _pluginDither["default"], _pluginFisheye["default"], _pluginFlip["default"], _pluginGaussian["default"], _pluginInvert["default"], _pluginMask["default"], _pluginNormalize["default"], _pluginPrint["default"], _pluginResize["default"], _pluginRotate["default"], _pluginScale["default"], _pluginShadow["default"], _pluginThreshold["default"]];

var _default = function _default(jimpEvChange) {
  var initializedPlugins = plugins.map(function (pluginModule) {
    var plugin = pluginModule(jimpEvChange) || {};

    if (!plugin["class"] && !plugin.constants) {
      // Default to class function
      plugin = {
        "class": plugin
      };
    }

    return plugin;
  });
  return _timm.mergeDeep.apply(void 0, (0, _toConsumableArray2["default"])(initializedPlugins));
};

exports["default"] = _default;
module.exports = exports.default;
//# sourceMappingURL=index.js.map
}, function(modId) {var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1729954661691);
})()
//miniprogram-npm-outsideDeps=["@babel/runtime/helpers/interopRequireDefault","@babel/runtime/helpers/toConsumableArray","timm","@jimp/plugin-blit","@jimp/plugin-blur","@jimp/plugin-circle","@jimp/plugin-color","@jimp/plugin-contain","@jimp/plugin-cover","@jimp/plugin-crop","@jimp/plugin-displace","@jimp/plugin-dither","@jimp/plugin-fisheye","@jimp/plugin-flip","@jimp/plugin-gaussian","@jimp/plugin-invert","@jimp/plugin-mask","@jimp/plugin-normalize","@jimp/plugin-print","@jimp/plugin-resize","@jimp/plugin-rotate","@jimp/plugin-scale","@jimp/plugin-shadow","@jimp/plugin-threshold"]
//# sourceMappingURL=index.js.map