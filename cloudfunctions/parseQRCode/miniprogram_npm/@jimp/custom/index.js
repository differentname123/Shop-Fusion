module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1731211819986, function(require, module, exports) {


var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = configure;

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _core = _interopRequireWildcard(require("@jimp/core"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function configure(configuration) {
  var jimpInstance = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _core["default"];
  var jimpConfig = {
    hasAlpha: {},
    encoders: {},
    decoders: {},
    "class": {},
    constants: {}
  };

  function addToConfig(newConfig) {
    Object.entries(newConfig).forEach(function (_ref) {
      var _ref2 = (0, _slicedToArray2["default"])(_ref, 2),
          key = _ref2[0],
          value = _ref2[1];

      jimpConfig[key] = _objectSpread({}, jimpConfig[key], {}, value);
    });
  }

  function addImageType(typeModule) {
    var type = typeModule();

    if (Array.isArray(type.mime)) {
      _core.addType.apply(void 0, (0, _toConsumableArray2["default"])(type.mime));
    } else {
      Object.entries(type.mime).forEach(function (mimeType) {
        return _core.addType.apply(void 0, (0, _toConsumableArray2["default"])(mimeType));
      });
    }

    delete type.mime;
    addToConfig(type);
  }

  function addPlugin(pluginModule) {
    var plugin = pluginModule(_core.jimpEvChange) || {};

    if (!plugin["class"] && !plugin.constants) {
      // Default to class function
      addToConfig({
        "class": plugin
      });
    } else {
      addToConfig(plugin);
    }
  }

  if (configuration.types) {
    configuration.types.forEach(addImageType);
    jimpInstance.decoders = _objectSpread({}, jimpInstance.decoders, {}, jimpConfig.decoders);
    jimpInstance.encoders = _objectSpread({}, jimpInstance.encoders, {}, jimpConfig.encoders);
    jimpInstance.hasAlpha = _objectSpread({}, jimpInstance.hasAlpha, {}, jimpConfig.hasAlpha);
  }

  if (configuration.plugins) {
    configuration.plugins.forEach(addPlugin);
  }

  (0, _core.addJimpMethods)(jimpConfig["class"], jimpInstance);
  (0, _core.addConstants)(jimpConfig.constants, jimpInstance);
  return _core["default"];
}

module.exports = exports.default;
//# sourceMappingURL=index.js.map
}, function(modId) {var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1731211819986);
})()
//miniprogram-npm-outsideDeps=["@babel/runtime/helpers/interopRequireWildcard","@babel/runtime/helpers/interopRequireDefault","@babel/runtime/helpers/toConsumableArray","@babel/runtime/helpers/defineProperty","@babel/runtime/helpers/slicedToArray","@jimp/core"]
//# sourceMappingURL=index.js.map