module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1729528802047, function(require, module, exports) {


var tslib = require('tslib');
var gLite = require('@antv/g-lite');
var DeviceRenderer = require('@antv/g-plugin-device-renderer');
var DragDropEvent = require('@antv/g-plugin-dragndrop');
var HTMLRenderer = require('@antv/g-plugin-html-renderer');
var ImageLoader = require('@antv/g-plugin-image-loader');
var DomInteraction = require('@antv/g-plugin-mobile-interaction');
var GesturePlugin = require('@antv/g-plugin-gesture');
var util = require('@antv/util');
var gDeviceApi = require('@antv/g-device-api');

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

var DeviceRenderer__namespace = /*#__PURE__*/_interopNamespaceDefault(DeviceRenderer);
var DragDropEvent__namespace = /*#__PURE__*/_interopNamespaceDefault(DragDropEvent);
var HTMLRenderer__namespace = /*#__PURE__*/_interopNamespaceDefault(HTMLRenderer);
var ImageLoader__namespace = /*#__PURE__*/_interopNamespaceDefault(ImageLoader);
var DomInteraction__namespace = /*#__PURE__*/_interopNamespaceDefault(DomInteraction);
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

var WebGLContextService = /** @class */ (function () {
    function WebGLContextService(context) {
        this.canvasConfig = context.config;
        // @ts-ignore
        this.deviceRendererPlugin = context.deviceRendererPlugin;
    }
    WebGLContextService.prototype.init = function () {
        return tslib.__awaiter(this, void 0, void 0, function () {
            var _a, canvas, devicePixelRatio, dpr;
            return tslib.__generator(this, function (_b) {
                _a = this.canvasConfig, canvas = _a.canvas, devicePixelRatio = _a.devicePixelRatio;
                this.$canvas = canvas;
                // 实际获取到小程序环境的上下文
                this.context = this.$canvas.getContext('webgl');
                dpr = devicePixelRatio || 1;
                dpr = dpr >= 1 ? Math.ceil(dpr) : 1;
                this.dpr = dpr;
                this.resize(this.canvasConfig.width, this.canvasConfig.height);
                return [2 /*return*/];
            });
        });
    };
    WebGLContextService.prototype.getContext = function () {
        return this.context;
    };
    WebGLContextService.prototype.getDomElement = function () {
        return this.$canvas;
    };
    WebGLContextService.prototype.getDPR = function () {
        return this.dpr;
    };
    WebGLContextService.prototype.getBoundingClientRect = function () {
        if (this.$canvas.getBoundingClientRect) {
            return this.$canvas.getBoundingClientRect();
        }
    };
    WebGLContextService.prototype.destroy = function () {
        // TODO: 小程序环境销毁 context
        this.context = null;
        this.$canvas = null;
    };
    WebGLContextService.prototype.resize = function (width, height) {
        var pixelRatio = devicePixelRatio;
        var canvasDOM = this.$canvas; // HTMLCanvasElement or canvasElement
        // 浏览器环境设置style样式
        // @ts-ignore 使用style功能判断不使用类型判断更准确
        if (canvasDOM.style) {
            // @ts-ignore
            canvasDOM.style.width = width + 'px';
            // @ts-ignore
            canvasDOM.style.height = height + 'px';
        }
        if (isCanvasElement(canvasDOM)) {
            canvasDOM.width = width * pixelRatio;
            canvasDOM.height = height * pixelRatio;
            // if (pixelRatio !== 1) {
            //   this.context.scale(pixelRatio, pixelRatio);
            // }
        }
    };
    WebGLContextService.prototype.applyCursorStyle = function (cursor) {
        // 小程序环境无需设置鼠标样式
    };
    WebGLContextService.prototype.toDataURL = function (options) {
        return tslib.__awaiter(this, void 0, void 0, function () {
            return tslib.__generator(this, function (_a) {
                return [2 /*return*/, this.deviceRendererPlugin.toDataURL(options)];
            });
        });
    };
    return WebGLContextService;
}());

var ContextRegisterPlugin = /** @class */ (function (_super) {
    tslib.__extends(ContextRegisterPlugin, _super);
    function ContextRegisterPlugin(rendererPlugin, config) {
        var _this = _super.call(this) || this;
        _this.rendererPlugin = rendererPlugin;
        _this.config = config;
        _this.name = 'mobile-webgl-context-register';
        return _this;
    }
    ContextRegisterPlugin.prototype.init = function () {
        this.context.ContextService = WebGLContextService;
        this.context.deviceRendererPlugin = this.rendererPlugin;
        var config = this.config;
        this.context.deviceContribution = new gDeviceApi.WebGLDeviceContribution(tslib.__assign({}, ((config === null || config === void 0 ? void 0 : config.targets)
            ? {
                targets: config.targets,
            }
            : {
                targets: ['webgl2', 'webgl1'],
            })));
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
        var deviceRendererPlugin = new DeviceRenderer__namespace.Plugin();
        _this.registerPlugin(new ContextRegisterPlugin(deviceRendererPlugin, config));
        _this.registerPlugin(new ImageLoader__namespace.Plugin());
        _this.registerPlugin(deviceRendererPlugin);
        _this.registerPlugin(new DomInteraction__namespace.Plugin());
        _this.registerPlugin(new HTMLRenderer__namespace.Plugin());
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

exports.DeviceRenderer = DeviceRenderer__namespace;
exports.HTMLRenderer = HTMLRenderer__namespace;
exports.DomInteraction = DomInteraction__namespace;
exports.Renderer = Renderer;
//# sourceMappingURL=index.js.map

}, function(modId) {var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1729528802047);
})()
//miniprogram-npm-outsideDeps=["tslib","@antv/g-lite","@antv/g-plugin-device-renderer","@antv/g-plugin-dragndrop","@antv/g-plugin-html-renderer","@antv/g-plugin-image-loader","@antv/g-plugin-mobile-interaction","@antv/g-plugin-gesture","@antv/util","@antv/g-device-api"]
//# sourceMappingURL=index.js.map