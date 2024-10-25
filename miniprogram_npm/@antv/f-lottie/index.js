module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1729528802034, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _tslib = require("tslib");
var _fEngine = require("@antv/f-engine");
var _gLottiePlayer = require("@antv/g-lottie-player");
var Lottie = /** @class */function (_super) {
  (0, _tslib.__extends)(Lottie, _super);
  function Lottie(props) {
    var _this = _super.call(this, props) || this;
    _this.addLottie = function () {
      var _a = _this,
        props = _a.props,
        context = _a.context;
      var data = props.data,
        options = props.options,
        play = props.play;
      var canvas = context.canvas;
      if (!data) return;
      // 文档流后挂载lottie
      canvas.ready.then(function () {
        _this.animation = _this.animation ? _this.animation : (0, _gLottiePlayer.loadAnimation)(data, options);
        _this.animation.render(_this.ref.current);
        _this.size = _this.animation.size();
        _this.updateSize();
        // 播放控制
        if (play) {
          var _a = play.speed,
            speed = _a === void 0 ? 1 : _a,
            _b = play.start,
            start = _b === void 0 ? 0 : _b,
            _c = play.end,
            end = _c === void 0 ? _this.animation.getDuration(true) : _c;
          _this.animation.setSpeed(speed);
          _this.animation.playSegments([start, end]);
        }
      });
    };
    _this.updateSize = function () {
      var _a = _this.size,
        currentWidth = _a.width,
        currentHeight = _a.height;
      var style = _this.props.style;
      if (!style) return;
      var _b = style.width,
        width = _b === void 0 ? currentWidth : _b,
        _c = style.height,
        height = _c === void 0 ? currentHeight : _c;
      _this.ref.current.scale(width / currentWidth, height / currentHeight);
      _this.size = {
        width: width,
        height: height
      };
    };
    _this.ref = (0, _fEngine.createRef)();
    return _this;
  }
  Lottie.prototype.didMount = function () {
    this.addLottie();
  };
  Lottie.prototype.willUpdate = function () {
    this.addLottie();
  };
  Lottie.prototype.render = function () {
    var _a = this.props,
      style = _a.style,
      animation = _a.animation;
    return (0, _fEngine.jsx)("group", {
      ref: this.ref,
      style: style,
      animation: animation
    });
  };
  return Lottie;
}(_fEngine.Component);
var _default = exports.default = Lottie;
}, function(modId) {var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1729528802034);
})()
//miniprogram-npm-outsideDeps=["tslib","@antv/f-engine","@antv/g-lottie-player"]
//# sourceMappingURL=index.js.map