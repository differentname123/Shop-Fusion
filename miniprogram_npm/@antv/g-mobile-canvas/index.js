module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1731211820573, function(require, module, exports) {


var tslib = require('tslib');
var gLite = require('@antv/g-lite');
var CanvasPathGenerator = require('@antv/g-plugin-canvas-path-generator');
var CanvasPicker = require('@antv/g-plugin-canvas-picker');
var CanvasRenderer = require('@antv/g-plugin-canvas-renderer');
var DragDropEvent = require('@antv/g-plugin-dragndrop');
var ImageLoader = require('@antv/g-plugin-image-loader');
var MobileInteraction = require('@antv/g-plugin-mobile-interaction');
var GesturePlugin = require('@antv/g-plugin-gesture');
var util = require('@antv/util');

function _interopNamespaceDefault(e) {
    var n = Object.create(null);
    if (e) {
        Object.keys(e).forEach(function (k) {
            if (k !== 'default') {
                var d = Object.getOwnPropertyDescriptor(e, k);
                Object.defineProperty(n, k, d.get ? d : {
                    enumerable: true,
                    get: function () { return e[k]; }
                });
            }
        });
    }
    n.default = e;
    return Object.freeze(n);
}

var CanvasPathGenerator__namespace = /*#__PURE__*/_interopNamespaceDefault(CanvasPathGenerator);
var CanvasPicker__namespace = /*#__PURE__*/_interopNamespaceDefault(CanvasPicker);
var CanvasRenderer__namespace = /*#__PURE__*/_interopNamespaceDefault(CanvasRenderer);
var DragDropEvent__namespace = /*#__PURE__*/_interopNamespaceDefault(DragDropEvent);
var ImageLoader__namespace = /*#__PURE__*/_interopNamespaceDefault(ImageLoader);
var MobileInteraction__namespace = /*#__PURE__*/_interopNamespaceDefault(MobileInteraction);
var GesturePlugin__namespace = /*#__PURE__*/_interopNamespaceDefault(GesturePlugin);

function isCanvasElement(el) {
    if (!el || typeof el !== 'object')
        return false;
    if (el.nodeType === 1 && el.nodeName) {
        // HTMLCanvasElement
        return true;
    }
    // CanvasElement
    return !!el.isCanvasElement;
}

var Canvas2DContextService = /** @class */ (function () {
    function Canvas2DContextService(context) {
        this.canvasConfig = context.config;
    }
    Canvas2DContextService.prototype.init = function () {
        return tslib.__awaiter(this, void 0, void 0, function () {
            var _a, canvas, devicePixelRatio, dpr;
            return tslib.__generator(this, function (_b) {
                _a = this.canvasConfig, canvas = _a.canvas, devicePixelRatio = _a.devicePixelRatio;
                this.$canvas = canvas;
                // 实际获取到小程序环境的上下文
                this.context = this.$canvas.getContext('2d');
                dpr = devicePixelRatio || 1;
                dpr = dpr >= 1 ? Math.ceil(dpr) : 1;
                this.dpr = dpr;
                this.resize(this.canvasConfig.width, this.canvasConfig.height);
                return [2 /*return*/];
            });
        });
    };
    Canvas2DContextService.prototype.getContext = function () {
        return this.context;
    };
    Canvas2DContextService.prototype.getDomElement = function () {
        return this.$canvas;
    };
    Canvas2DContextService.prototype.getDPR = function () {
        return this.dpr;
    };
    Canvas2DContextService.prototype.getBoundingClientRect = function () {
        if (this.$canvas.getBoundingClientRect) {
            return this.$canvas.getBoundingClientRect();
        }
    };
    Canvas2DContextService.prototype.destroy = function () {
        // TODO: 小程序环境销毁 context
        this.context = null;
        this.$canvas = null;
    };
    Canvas2DContextService.prototype.resize = function (width, height) {
        var devicePixelRatio = this.canvasConfig.devicePixelRatio;
        var pixelRatio = devicePixelRatio;
        var canvasDOM = this.$canvas; // HTMLCanvasElement or canvasElement
        // 浏览器环境设置style样式
        if (canvasDOM.style) {
            canvasDOM.style.width = width + 'px';
            canvasDOM.style.height = height + 'px';
        }
        if (isCanvasElement(canvasDOM)) {
            canvasDOM.width = width * pixelRatio;
            canvasDOM.height = height * pixelRatio;
            if (pixelRatio !== 1) {
                this.context.scale(pixelRatio, pixelRatio);
            }
        }
    };
    Canvas2DContextService.prototype.applyCursorStyle = function (cursor) {
        // 小程序环境无需设置鼠标样式
    };
    Canvas2DContextService.prototype.toDataURL = function (options) {
        return tslib.__awaiter(this, void 0, void 0, function () {
            var type, encoderOptions;
            return tslib.__generator(this, function (_a) {
                type = options.type, encoderOptions = options.encoderOptions;
                return [2 /*return*/, this.context.canvas.toDataURL(type, encoderOptions)];
            });
        });
    };
    return Canvas2DContextService;
}());

var ContextRegisterPlugin = /** @class */ (function (_super) {
    tslib.__extends(ContextRegisterPlugin, _super);
    function ContextRegisterPlugin() {
        var _this = _super.apply(this, tslib.__spreadArray([], tslib.__read(arguments), false)) || this;
        _this.name = 'mobile-canvas-context-register';
        return _this;
    }
    ContextRegisterPlugin.prototype.init = function () {
        this.context.ContextService = Canvas2DContextService;
    };
    ContextRegisterPlugin.prototype.destroy = function () {
        delete this.context.ContextService;
    };
    return ContextRegisterPlugin;
}(gLite.AbstractRendererPlugin));

var Renderer = /** @class */ (function (_super) {
    tslib.__extends(Renderer, _super);
    function Renderer(config) {
        var _this = _super.call(this, config) || this;
        // register Canvas2DContext
        _this.registerPlugin(new ContextRegisterPlugin());
        _this.registerPlugin(new ImageLoader__namespace.Plugin());
        _this.registerPlugin(new CanvasPathGenerator__namespace.Plugin());
        // enable rendering with Canvas2D API
        _this.registerPlugin(new CanvasRenderer__namespace.Plugin());
        _this.registerPlugin(new MobileInteraction__namespace.Plugin());
        // enable picking with Canvas2D API
        _this.registerPlugin(new CanvasPicker__namespace.Plugin());
        _this.registerPlugin(new DragDropEvent__namespace.Plugin({
            isDocumentDraggable: util.isNil(config === null || config === void 0 ? void 0 : config.isDocumentDraggable)
                ? true
                : config.isDocumentDraggable,
            isDocumentDroppable: util.isNil(config === null || config === void 0 ? void 0 : config.isDocumentDroppable)
                ? true
                : config.isDocumentDroppable,
            dragstartDistanceThreshold: util.isNil(config === null || config === void 0 ? void 0 : config.dragstartDistanceThreshold)
                ? 10
                : config.dragstartDistanceThreshold,
            dragstartTimeThreshold: util.isNil(config === null || config === void 0 ? void 0 : config.dragstartTimeThreshold)
                ? 50
                : config.dragstartTimeThreshold,
        }));
        _this.registerPlugin(new GesturePlugin__namespace.Plugin({
            isDocumentGestureEnabled: true,
        }));
        return _this;
    }
    return Renderer;
}(gLite.AbstractRenderer));

exports.CanvasPicker = CanvasPicker__namespace;
exports.CanvasRenderer = CanvasRenderer__namespace;
exports.Renderer = Renderer;
//# sourceMappingURL=index.js.map

}, function(modId) {var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1731211820573);
})()
//miniprogram-npm-outsideDeps=["tslib","@antv/g-lite","@antv/g-plugin-canvas-path-generator","@antv/g-plugin-canvas-picker","@antv/g-plugin-canvas-renderer","@antv/g-plugin-dragndrop","@antv/g-plugin-image-loader","@antv/g-plugin-mobile-interaction","@antv/g-plugin-gesture","@antv/util"]
//# sourceMappingURL=index.js.map