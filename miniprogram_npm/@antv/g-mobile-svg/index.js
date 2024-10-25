module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1729528802046, function(require, module, exports) {


var tslib = require('tslib');
var gLite = require('@antv/g-lite');
var DragDropEvent = require('@antv/g-plugin-dragndrop');
var MobileInteraction = require('@antv/g-plugin-mobile-interaction');
var SVGPicker = require('@antv/g-plugin-svg-picker');
var SVGRenderer = require('@antv/g-plugin-svg-renderer');
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

var DragDropEvent__namespace = /*#__PURE__*/_interopNamespaceDefault(DragDropEvent);
var MobileInteraction__namespace = /*#__PURE__*/_interopNamespaceDefault(MobileInteraction);
var SVGPicker__namespace = /*#__PURE__*/_interopNamespaceDefault(SVGPicker);
var SVGRenderer__namespace = /*#__PURE__*/_interopNamespaceDefault(SVGRenderer);
var GesturePlugin__namespace = /*#__PURE__*/_interopNamespaceDefault(GesturePlugin);

var SVGContextService = /** @class */ (function () {
    function SVGContextService(context) {
        this.canvasConfig = context.config;
    }
    SVGContextService.prototype.init = function () {
        return tslib.__awaiter(this, void 0, void 0, function () {
            var _a, container, doc, $namespace, dpr;
            return tslib.__generator(this, function (_b) {
                _a = this.canvasConfig, container = _a.container, doc = _a.document;
                // create container
                this.$container = util.isString(container) ? (doc || document).getElementById(container) : container;
                if (this.$container) {
                    if (!this.$container.style.position) {
                        this.$container.style.position = 'relative';
                    }
                    $namespace = SVGRenderer.createSVGElement('svg', doc);
                    $namespace.setAttribute('width', "".concat(this.canvasConfig.width));
                    $namespace.setAttribute('height', "".concat(this.canvasConfig.height));
                    this.$container.appendChild($namespace);
                    this.$namespace = $namespace;
                }
                dpr = window.devicePixelRatio || 1;
                dpr = dpr >= 1 ? Math.ceil(dpr) : 1;
                this.dpr = dpr;
                return [2 /*return*/];
            });
        });
    };
    // @ts-ignore
    SVGContextService.prototype.getDomElement = function () {
        return this.$namespace;
    };
    SVGContextService.prototype.getContext = function () {
        return this.$namespace;
    };
    SVGContextService.prototype.getDPR = function () {
        return this.dpr;
    };
    SVGContextService.prototype.getBoundingClientRect = function () {
        var _a;
        return (_a = this.$namespace) === null || _a === void 0 ? void 0 : _a.getBoundingClientRect();
    };
    SVGContextService.prototype.destroy = function () {
        // destroy context
        if (this.$container && this.$namespace && this.$namespace.parentNode) {
            this.$container.removeChild(this.$namespace);
        }
    };
    SVGContextService.prototype.resize = function (width, height) {
        if (this.$namespace) {
            this.$namespace.setAttribute('width', "".concat(width));
            this.$namespace.setAttribute('height', "".concat(height));
        }
    };
    SVGContextService.prototype.applyCursorStyle = function (cursor) {
        if (this.$container) {
            this.$container.style.cursor = cursor;
        }
    };
    SVGContextService.prototype.toDataURL = function (options) {
        return tslib.__awaiter(this, void 0, void 0, function () {
            var cloneNode, svgDocType, svgDoc;
            return tslib.__generator(this, function (_a) {
                cloneNode = this.$namespace.cloneNode(true);
                svgDocType = document.implementation.createDocumentType('svg', '-//W3C//DTD SVG 1.1//EN', 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd');
                svgDoc = document.implementation.createDocument('http://www.w3.org/2000/svg', 'svg', svgDocType);
                svgDoc.replaceChild(cloneNode, svgDoc.documentElement);
                return [2 /*return*/, "data:image/svg+xml;charset=utf8,".concat(encodeURIComponent(new XMLSerializer().serializeToString(svgDoc)))];
            });
        });
    };
    return SVGContextService;
}());

var ContextRegisterPlugin = /** @class */ (function (_super) {
    tslib.__extends(ContextRegisterPlugin, _super);
    function ContextRegisterPlugin() {
        var _this = _super.apply(this, tslib.__spreadArray([], tslib.__read(arguments), false)) || this;
        _this.name = 'mobile-svg-context-register';
        return _this;
    }
    ContextRegisterPlugin.prototype.init = function () {
        // @ts-ignore
        this.context.ContextService = SVGContextService;
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
        _this.registerPlugin(new ContextRegisterPlugin());
        _this.registerPlugin(new SVGRenderer__namespace.Plugin());
        _this.registerPlugin(new MobileInteraction__namespace.Plugin());
        _this.registerPlugin(new SVGPicker__namespace.Plugin());
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

exports.MobileInteraction = MobileInteraction__namespace;
exports.SVGPicker = SVGPicker__namespace;
exports.SVGRenderer = SVGRenderer__namespace;
exports.Renderer = Renderer;
//# sourceMappingURL=index.js.map

}, function(modId) {var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1729528802046);
})()
//miniprogram-npm-outsideDeps=["tslib","@antv/g-lite","@antv/g-plugin-dragndrop","@antv/g-plugin-mobile-interaction","@antv/g-plugin-svg-picker","@antv/g-plugin-svg-renderer","@antv/g-plugin-gesture","@antv/util"]
//# sourceMappingURL=index.js.map