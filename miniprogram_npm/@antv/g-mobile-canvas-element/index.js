module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1731211820572, function(require, module, exports) {


var EventEmitter = require('eventemitter3');

var CanvasElement = /** @class */ (function () {
    function CanvasElement(ctx) {
        this.isCanvasElement = true;
        this.emitter = new EventEmitter();
        this.context = ctx;
        // 有可能是 node canvas 创建的 context 对象
        var canvas = ctx.canvas || {};
        this.width = canvas.width || 0;
        this.height = canvas.height || 0;
    }
    CanvasElement.prototype.getContext = function (contextId, contextAttributes) {
        return this.context;
    };
    CanvasElement.prototype.getBoundingClientRect = function () {
        var width = this.width;
        var height = this.height;
        // 默认都处理成可视窗口的顶部位置
        return {
            top: 0,
            right: width,
            bottom: height,
            left: 0,
            width: width,
            height: height,
            x: 0,
            y: 0,
        };
    };
    CanvasElement.prototype.addEventListener = function (type, listener, options) {
        // TODO: implement options
        this.emitter.on(type, listener);
    };
    CanvasElement.prototype.removeEventListener = function (type, listener, options) {
        this.emitter.off(type, listener);
    };
    /**
     * @see https://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-EventTarget-dispatchEvent
     */
    CanvasElement.prototype.dispatchEvent = function (e) {
        this.emitter.emit(e.type, e);
        return true;
    };
    return CanvasElement;
}());
function supportEventListener(canvas) {
    if (!canvas) {
        return false;
    }
    // 非 HTMLCanvasElement
    if (canvas.nodeType !== 1 ||
        !canvas.nodeName ||
        canvas.nodeName.toLowerCase() !== 'canvas') {
        return false;
    }
    // 微信小程序canvas.getContext('2d')时也是CanvasRenderingContext2D
    // 也会有ctx.canvas, 而且nodeType也是1，所以还要在看下是否支持addEventListener
    var support = false;
    try {
        canvas.addEventListener('eventTest', function () {
            support = true;
        });
        canvas.dispatchEvent(new Event('eventTest'));
    }
    catch (error) {
        support = false;
    }
    return support;
}
function createMobileCanvasElement(ctx) {
    if (!ctx) {
        return null;
    }
    if (supportEventListener(ctx.canvas)) {
        return ctx.canvas;
    }
    return new CanvasElement(ctx);
}

exports.createMobileCanvasElement = createMobileCanvasElement;
//# sourceMappingURL=index.js.map

}, function(modId) {var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1731211820572);
})()
//miniprogram-npm-outsideDeps=["eventemitter3"]
//# sourceMappingURL=index.js.map