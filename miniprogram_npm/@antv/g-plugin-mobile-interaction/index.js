module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1731211820585, function(require, module, exports) {


var tslib = require('tslib');
var gLite = require('@antv/g-lite');

/**
 * listen to mouse/touch/pointer events on DOM wrapper, trigger pointer events
 */
var MobileInteractionPlugin = /** @class */ (function () {
    function MobileInteractionPlugin() {
    }
    MobileInteractionPlugin.prototype.apply = function (context) {
        var renderingService = context.renderingService, contextService = context.contextService, config = context.config;
        // 获取小程序上下文
        var canvasEl = contextService.getDomElement();
        var onPointerDown = function (ev) {
            renderingService.hooks.pointerDown.call(ev);
        };
        var onPointerUp = function (ev) {
            renderingService.hooks.pointerUp.call(ev);
        };
        var onPointerMove = function (ev) {
            // 触发 G 定义的标准 pointerMove 事件
            renderingService.hooks.pointerMove.call(ev);
        };
        var onPointerOver = function (ev) {
            renderingService.hooks.pointerOver.call(ev);
        };
        var onPointerOut = function (ev) {
            renderingService.hooks.pointerOut.call(ev);
        };
        var onClick = function (ev) {
            renderingService.hooks.click.call(ev);
        };
        var onPointerCancel = function (ev) {
            renderingService.hooks.pointerCancel.call(ev);
        };
        renderingService.hooks.init.tap(MobileInteractionPlugin.tag, function () {
            // 基于小程序上下文的事件监听方式，绑定事件监听，可以参考下面基于 DOM 的方式
            canvasEl.addEventListener('touchstart', onPointerDown, true);
            canvasEl.addEventListener('touchend', onPointerUp, true);
            canvasEl.addEventListener('touchmove', onPointerMove, true);
            canvasEl.addEventListener('touchcancel', onPointerCancel, true);
            // FIXME: 这里不应该只在 canvasEl 上监听 mousemove 和 mouseup，而应该在更高层级的节点上例如 document 监听。
            // 否则无法判断是否移出了 canvasEl
            // canvasEl.addEventListener('mousemove', onPointerMove, true);
            // canvasEl.addEventListener('mousedown', onPointerDown, true);
            canvasEl.addEventListener('mouseout', onPointerOut, true);
            canvasEl.addEventListener('mouseover', onPointerOver, true);
            // canvasEl.addEventListener('mouseup', onPointerUp, true);
            if (config.useNativeClickEvent) {
                canvasEl.addEventListener('click', onClick, true);
            }
        });
        renderingService.hooks.destroy.tap(MobileInteractionPlugin.tag, function () {
            // 基于小程序上下文的事件监听方式，移除事件监听
            canvasEl.removeEventListener('touchstart', onPointerDown, true);
            canvasEl.removeEventListener('touchend', onPointerUp, true);
            canvasEl.removeEventListener('touchmove', onPointerMove, true);
            canvasEl.removeEventListener('touchcancel', onPointerCancel, true);
            // canvasEl.removeEventListener('mousemove', onPointerMove, true);
            // canvasEl.removeEventListener('mousedown', onPointerDown, true);
            canvasEl.removeEventListener('mouseout', onPointerOut, true);
            canvasEl.removeEventListener('mouseover', onPointerOver, true);
            // canvasEl.removeEventListener('mouseup', onPointerUp, true);
            if (config.useNativeClickEvent) {
                canvasEl.removeEventListener('click', onClick, true);
            }
        });
    };
    MobileInteractionPlugin.tag = 'MobileInteraction';
    return MobileInteractionPlugin;
}());

var Plugin = /** @class */ (function (_super) {
    tslib.__extends(Plugin, _super);
    function Plugin() {
        var _this = _super.apply(this, tslib.__spreadArray([], tslib.__read(arguments), false)) || this;
        _this.name = 'mobile-interaction';
        return _this;
    }
    Plugin.prototype.init = function () {
        this.addRenderingPlugin(new MobileInteractionPlugin());
    };
    Plugin.prototype.destroy = function () {
        this.removeAllRenderingPlugins();
    };
    return Plugin;
}(gLite.AbstractRendererPlugin));

exports.Plugin = Plugin;
//# sourceMappingURL=index.js.map

}, function(modId) {var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1731211820585);
})()
//miniprogram-npm-outsideDeps=["tslib","@antv/g-lite"]
//# sourceMappingURL=index.js.map