module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1729528802055, function(require, module, exports) {


var tslib = require('tslib');
var gLite = require('@antv/g-lite');
var util = require('@antv/util');

var CANVAS_CAMERA_ID = 'g-canvas-camera';
var HTMLRenderingPlugin = /** @class */ (function () {
    function HTMLRenderingPlugin() {
        this.displayObjectHTMLElementMap = new WeakMap();
    }
    HTMLRenderingPlugin.prototype.joinTransformMatrix = function (matrix) {
        return "matrix(".concat([
            matrix[0],
            matrix[1],
            matrix[4],
            matrix[5],
            matrix[12],
            matrix[13],
        ].join(','), ")");
    };
    HTMLRenderingPlugin.prototype.apply = function (context, runtime) {
        var _this = this;
        var camera = context.camera, renderingContext = context.renderingContext, renderingService = context.renderingService;
        this.context = context;
        var canvas = renderingContext.root.ownerDocument.defaultView;
        var nativeHTMLMap = canvas.context.eventService.nativeHTMLMap;
        var setTransform = function (object, $el) {
            $el.style.transform = _this.joinTransformMatrix(object.getWorldTransform());
        };
        var handleMounted = function (e) {
            var object = e.target;
            if (object.nodeName === gLite.Shape.HTML) {
                if (!_this.$camera) {
                    _this.$camera = _this.createCamera(camera);
                }
                // create DOM element
                var $el_1 = _this.getOrCreateEl(object);
                _this.$camera.appendChild($el_1);
                // apply documentElement's style
                if (runtime.enableCSSParsing) {
                    var attributes_1 = object.ownerDocument.documentElement.attributes;
                    Object.keys(attributes_1).forEach(function (name) {
                        $el_1.style[name] = attributes_1[name];
                    });
                }
                Object.keys(object.attributes).forEach(function (name) {
                    _this.updateAttribute(name, object);
                });
                setTransform(object, $el_1);
                nativeHTMLMap.set($el_1, object);
            }
        };
        var handleUnmounted = function (e) {
            var object = e.target;
            if (object.nodeName === gLite.Shape.HTML && _this.$camera) {
                var $el = _this.getOrCreateEl(object);
                if ($el) {
                    $el.remove();
                    nativeHTMLMap.delete($el);
                }
            }
        };
        var handleAttributeChanged = function (e) {
            var object = e.target;
            if (object.nodeName === gLite.Shape.HTML) {
                var attrName = e.attrName;
                _this.updateAttribute(attrName, object);
            }
        };
        var handleBoundsChanged = function (e) {
            var object = e.target;
            if (object.nodeName === gLite.Shape.HTML) {
                var $el = _this.getOrCreateEl(object);
                setTransform(object, $el);
            }
        };
        var handleCanvasResize = function () {
            if (_this.$camera) {
                var _a = _this.context.config, width = _a.width, height = _a.height;
                _this.$camera.style.width = "".concat(width || 0, "px");
                _this.$camera.style.height = "".concat(height || 0, "px");
            }
        };
        renderingService.hooks.init.tap(HTMLRenderingPlugin.tag, function () {
            canvas.addEventListener(gLite.CanvasEvent.RESIZE, handleCanvasResize);
            canvas.addEventListener(gLite.ElementEvent.MOUNTED, handleMounted);
            canvas.addEventListener(gLite.ElementEvent.UNMOUNTED, handleUnmounted);
            canvas.addEventListener(gLite.ElementEvent.ATTR_MODIFIED, handleAttributeChanged);
            canvas.addEventListener(gLite.ElementEvent.BOUNDS_CHANGED, handleBoundsChanged);
        });
        renderingService.hooks.endFrame.tap(HTMLRenderingPlugin.tag, function () {
            if (_this.$camera &&
                renderingContext.renderReasons.has(gLite.RenderReason.CAMERA_CHANGED)) {
                _this.$camera.style.transform = _this.joinTransformMatrix(camera.getOrthoMatrix());
            }
        });
        renderingService.hooks.destroy.tap(HTMLRenderingPlugin.tag, function () {
            // remove camera
            if (_this.$camera) {
                _this.$camera.remove();
            }
            canvas.removeEventListener(gLite.CanvasEvent.RESIZE, handleCanvasResize);
            canvas.removeEventListener(gLite.ElementEvent.MOUNTED, handleMounted);
            canvas.removeEventListener(gLite.ElementEvent.UNMOUNTED, handleUnmounted);
            canvas.removeEventListener(gLite.ElementEvent.ATTR_MODIFIED, handleAttributeChanged);
            canvas.removeEventListener(gLite.ElementEvent.BOUNDS_CHANGED, handleBoundsChanged);
        });
    };
    HTMLRenderingPlugin.prototype.createCamera = function (camera) {
        var _a = this.context.config, doc = _a.document, width = _a.width, height = _a.height;
        var $canvas = this.context.contextService.getDomElement();
        var $container = $canvas.parentNode;
        if ($container) {
            var cameraId = CANVAS_CAMERA_ID;
            var $existedCamera = $container.querySelector('#' + cameraId);
            if (!$existedCamera) {
                var $camera = (doc || document).createElement('div');
                $existedCamera = $camera;
                $camera.id = cameraId;
                // use absolute position
                $camera.style.position = 'absolute';
                // account for DOM element's offset @see https://github.com/antvis/G/issues/1150
                $camera.style.left = "".concat($canvas.offsetLeft || 0, "px");
                $camera.style.top = "".concat($canvas.offsetTop || 0, "px");
                $camera.style.transformOrigin = 'left top';
                $camera.style.transform = this.joinTransformMatrix(camera.getOrthoMatrix());
                // HTML elements should not overflow with canvas @see https://github.com/antvis/G/issues/1163
                $camera.style.overflow = 'hidden';
                $camera.style.pointerEvents = 'none';
                $camera.style.width = "".concat(width || 0, "px");
                $camera.style.height = "".concat(height || 0, "px");
                $container.appendChild($camera);
            }
            return $existedCamera;
        }
        return null;
    };
    HTMLRenderingPlugin.prototype.getOrCreateEl = function (object) {
        var doc = this.context.config.document;
        var $existedElement = this.displayObjectHTMLElementMap.get(object);
        if (!$existedElement) {
            $existedElement = (doc || document).createElement('div');
            object.parsedStyle.$el = $existedElement;
            this.displayObjectHTMLElementMap.set(object, $existedElement);
            if (object.id) {
                $existedElement.id = object.id;
            }
            if (object.name) {
                $existedElement.setAttribute('name', object.name);
            }
            if (object.className) {
                $existedElement.className = object.className;
            }
            // use absolute position
            $existedElement.style.position = 'absolute';
            // @see https://github.com/antvis/G/issues/1150
            $existedElement.style.left = "0px";
            $existedElement.style.top = "0px";
            $existedElement.style['will-change'] = 'transform';
            $existedElement.style.transform = this.joinTransformMatrix(object.getWorldTransform());
        }
        return $existedElement;
    };
    HTMLRenderingPlugin.prototype.updateAttribute = function (name, object) {
        var $el = this.getOrCreateEl(object);
        switch (name) {
            case 'innerHTML':
                var innerHTML = object.parsedStyle.innerHTML;
                if (util.isString(innerHTML)) {
                    $el.innerHTML = innerHTML;
                }
                else {
                    $el.innerHTML = '';
                    $el.appendChild(innerHTML);
                }
                break;
            case 'transformOrigin':
                var transformOrigin = object.parsedStyle.transformOrigin;
                $el.style['transform-origin'] = "".concat(transformOrigin[0].value, " ").concat(transformOrigin[1].value);
                break;
            case 'width':
                if (this.context.enableCSSParsing) {
                    var width = object.computedStyleMap().get('width');
                    $el.style.width = width.toString();
                }
                else {
                    var width = object.parsedStyle.width;
                    $el.style.width = util.isNumber(width)
                        ? "".concat(width, "px")
                        : width.toString();
                }
                break;
            case 'height':
                if (this.context.enableCSSParsing) {
                    var height = object.computedStyleMap().get('height');
                    $el.style.height = height.toString();
                }
                else {
                    var height = object.parsedStyle.height;
                    $el.style.height = util.isNumber(height)
                        ? "".concat(height, "px")
                        : height.toString();
                }
                break;
            case 'zIndex':
                var zIndex = object.parsedStyle.zIndex;
                $el.style['z-index'] = "".concat(zIndex);
                break;
            case 'visibility':
                var visibility = object.parsedStyle.visibility;
                $el.style.visibility = visibility;
                break;
            case 'pointerEvents':
                var pointerEvents = object.parsedStyle.pointerEvents;
                $el.style.pointerEvents = pointerEvents;
                break;
            case 'opacity':
                var opacity = object.parsedStyle.opacity;
                $el.style.opacity = "".concat(opacity);
                break;
            case 'fill':
                var fill = object.parsedStyle.fill;
                var color = '';
                if (gLite.isCSSRGB(fill)) {
                    if (fill.isNone) {
                        color = 'transparent';
                    }
                    else {
                        color = object.getAttribute('fill');
                    }
                }
                else if (Array.isArray(fill)) {
                    color = object.getAttribute('fill');
                }
                else if (gLite.isPattern(fill)) ;
                $el.style.background = color;
                break;
            case 'stroke':
                var stroke = object.parsedStyle.stroke;
                var borderColor = '';
                if (gLite.isCSSRGB(stroke)) {
                    if (stroke.isNone) {
                        borderColor = 'transparent';
                    }
                    else {
                        borderColor = object.getAttribute('stroke');
                    }
                }
                else if (Array.isArray(stroke)) {
                    borderColor = object.getAttribute('stroke');
                }
                else if (gLite.isPattern(stroke)) ;
                $el.style['border-color'] = borderColor;
                $el.style['border-style'] = 'solid';
                break;
            case 'lineWidth':
                var lineWidth = object.parsedStyle.lineWidth;
                $el.style['border-width'] = "".concat(lineWidth || 0, "px");
                break;
            case 'lineDash':
                $el.style['border-style'] = 'dashed';
                break;
            case 'filter':
                var filter = object.style.filter;
                $el.style.filter = filter;
                break;
            default:
                if (name !== 'x' && name !== 'y') {
                    if (!util.isNil(object.style[name]) && object.style[name] !== '') {
                        $el.style[name] = object.style[name];
                    }
                }
        }
    };
    HTMLRenderingPlugin.tag = 'HTMLRendering';
    return HTMLRenderingPlugin;
}());

var Plugin = /** @class */ (function (_super) {
    tslib.__extends(Plugin, _super);
    function Plugin() {
        var _this = _super.apply(this, tslib.__spreadArray([], tslib.__read(arguments), false)) || this;
        _this.name = 'html-renderer';
        return _this;
    }
    Plugin.prototype.init = function () {
        this.addRenderingPlugin(new HTMLRenderingPlugin());
    };
    Plugin.prototype.destroy = function () {
        this.removeAllRenderingPlugins();
    };
    return Plugin;
}(gLite.AbstractRendererPlugin));

exports.Plugin = Plugin;
//# sourceMappingURL=index.js.map

}, function(modId) {var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1729528802055);
})()
//miniprogram-npm-outsideDeps=["tslib","@antv/g-lite","@antv/util"]
//# sourceMappingURL=index.js.map