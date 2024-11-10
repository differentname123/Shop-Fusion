module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1731211820584, function(require, module, exports) {


var tslib = require('tslib');
var gLite = require('@antv/g-lite');
var util = require('@antv/util');
var glMatrix = require('gl-matrix');

var ImagePool = /** @class */ (function () {
    function ImagePool(canvasConfig) {
        this.canvasConfig = canvasConfig;
        this.imageCache = {};
        this.gradientCache = {};
        this.patternCache = {};
    }
    ImagePool.prototype.getImageSync = function (src, callback) {
        if (!this.imageCache[src]) {
            this.getOrCreateImage(src).then(function (img) {
                if (callback) {
                    callback(img);
                }
            });
        }
        else {
            if (callback) {
                callback(this.imageCache[src]);
            }
        }
        return this.imageCache[src];
    };
    ImagePool.prototype.getOrCreateImage = function (src) {
        var _this = this;
        if (this.imageCache[src]) {
            return Promise.resolve(this.imageCache[src]);
        }
        // @see https://github.com/antvis/g/issues/938
        var createImage = this.canvasConfig.createImage;
        return new Promise(function (resolve, reject) {
            var image;
            if (createImage) {
                image = createImage(src);
            }
            else if (gLite.isBrowser) {
                image = new window.Image();
            }
            if (image) {
                image.onload = function () {
                    _this.imageCache[src] = image;
                    resolve(image);
                };
                image.onerror = function (ev) {
                    reject(ev);
                };
                image.crossOrigin = 'Anonymous';
                image.src = src;
            }
        });
    };
    ImagePool.prototype.getOrCreatePatternSync = function (pattern, context, $offscreenCanvas, dpr, callback) {
        var patternKey = this.generatePatternKey(pattern);
        if (patternKey && this.patternCache[patternKey]) {
            return this.patternCache[patternKey];
        }
        var image = pattern.image, repetition = pattern.repetition, transform = pattern.transform;
        var src;
        var needScaleWithDPR = false;
        // Image URL
        if (util.isString(image)) {
            src = this.getImageSync(image, callback);
        }
        else if ($offscreenCanvas) {
            src = $offscreenCanvas;
            needScaleWithDPR = true;
        }
        else {
            src = image;
        }
        // @see https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/createPattern
        var canvasPattern = src && context.createPattern(src, repetition);
        if (canvasPattern) {
            var mat = void 0;
            // @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasPattern/setTransform
            if (transform) {
                mat = gLite.parsedTransformToMat4(gLite.parseTransform(transform), new gLite.DisplayObject({}));
            }
            else {
                mat = glMatrix.mat4.identity(glMatrix.mat4.create());
            }
            if (needScaleWithDPR) {
                glMatrix.mat4.scale(mat, mat, [1 / dpr, 1 / dpr, 1]);
            }
            canvasPattern.setTransform({
                a: mat[0],
                b: mat[1],
                c: mat[4],
                d: mat[5],
                e: mat[12],
                f: mat[13],
            });
        }
        if (patternKey && canvasPattern) {
            this.patternCache[patternKey] = canvasPattern;
        }
        return canvasPattern;
    };
    ImagePool.prototype.getOrCreateGradient = function (params, context) {
        var key = this.generateGradientKey(params);
        var type = params.type, steps = params.steps, width = params.width, height = params.height, angle = params.angle, cx = params.cx, cy = params.cy, size = params.size;
        if (this.gradientCache[key]) {
            return this.gradientCache[key];
        }
        var gradient = null;
        if (type === gLite.GradientType.LinearGradient) {
            var _a = gLite.computeLinearGradient(width, height, angle), x1 = _a.x1, y1 = _a.y1, x2 = _a.x2, y2 = _a.y2;
            // @see https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/createLinearGradient
            gradient = context.createLinearGradient(x1, y1, x2, y2);
        }
        else if (type === gLite.GradientType.RadialGradient) {
            var _b = gLite.computeRadialGradient(width, height, cx, cy, size), x = _b.x, y = _b.y, r = _b.r;
            // @see https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/createRadialGradient
            gradient = context.createRadialGradient(x, y, 0, x, y, r);
        }
        if (gradient) {
            steps.forEach(function (_a) {
                var offset = _a.offset, color = _a.color;
                if (offset.unit === gLite.UnitType.kPercentage) {
                    gradient === null || gradient === void 0 ? void 0 : gradient.addColorStop(offset.value / 100, color.toString());
                }
            });
            this.gradientCache[key] = gradient;
        }
        return this.gradientCache[key];
    };
    ImagePool.prototype.generateGradientKey = function (params) {
        var type = params.type, width = params.width, height = params.height, steps = params.steps, angle = params.angle, cx = params.cx, cy = params.cy, size = params.size;
        return "gradient-".concat(type, "-").concat((angle === null || angle === void 0 ? void 0 : angle.toString()) || 0, "-").concat((cx === null || cx === void 0 ? void 0 : cx.toString()) || 0, "-").concat((cy === null || cy === void 0 ? void 0 : cy.toString()) || 0, "-").concat((size === null || size === void 0 ? void 0 : size.toString()) || 0, "-").concat(width, "-").concat(height, "-").concat(steps
            .map(function (_a) {
            var offset = _a.offset, color = _a.color;
            return "".concat(offset).concat(color);
        })
            .join('-'));
    };
    ImagePool.prototype.generatePatternKey = function (pattern) {
        var image = pattern.image, repetition = pattern.repetition;
        // only generate cache for Image
        if (util.isString(image)) {
            return "pattern-".concat(image, "-").concat(repetition);
        }
        else if (image.nodeName === 'rect') {
            return "pattern-".concat(image.entity, "-").concat(repetition);
        }
    };
    return ImagePool;
}());

var LoadImagePlugin = /** @class */ (function () {
    function LoadImagePlugin() {
    }
    LoadImagePlugin.prototype.apply = function (context) {
        var renderingService = context.renderingService, renderingContext = context.renderingContext, imagePool = context.imagePool;
        var canvas = renderingContext.root.ownerDocument.defaultView;
        var calculateWithAspectRatio = function (object, imageWidth, imageHeight) {
            var _a = object.parsedStyle, width = _a.width, height = _a.height;
            if (width && !height) {
                object.setAttribute('height', (imageHeight / imageWidth) * width);
            }
            else if (!width && height) {
                object.setAttribute('width', (imageWidth / imageHeight) * height);
            }
        };
        var handleMounted = function (e) {
            var object = e.target;
            var nodeName = object.nodeName, attributes = object.attributes;
            if (nodeName === gLite.Shape.IMAGE) {
                var img = attributes.img, keepAspectRatio_1 = attributes.keepAspectRatio;
                if (util.isString(img)) {
                    imagePool.getImageSync(img, function (_a) {
                        var width = _a.width, height = _a.height;
                        if (keepAspectRatio_1) {
                            calculateWithAspectRatio(object, width, height);
                        }
                        // set dirty rectangle flag
                        object.renderable.dirty = true;
                        renderingService.dirtify();
                    });
                }
            }
        };
        var handleAttributeChanged = function (e) {
            var object = e.target;
            var attrName = e.attrName, newValue = e.newValue;
            if (object.nodeName === gLite.Shape.IMAGE) {
                if (attrName === 'img') {
                    if (util.isString(newValue)) {
                        imagePool.getOrCreateImage(newValue).then(function (_a) {
                            var width = _a.width, height = _a.height;
                            if (object.attributes.keepAspectRatio) {
                                calculateWithAspectRatio(object, width, height);
                            }
                            // set dirty rectangle flag
                            object.renderable.dirty = true;
                            renderingService.dirtify();
                        });
                    }
                }
            }
        };
        renderingService.hooks.init.tap(LoadImagePlugin.tag, function () {
            canvas.addEventListener(gLite.ElementEvent.MOUNTED, handleMounted);
            canvas.addEventListener(gLite.ElementEvent.ATTR_MODIFIED, handleAttributeChanged);
        });
        renderingService.hooks.destroy.tap(LoadImagePlugin.tag, function () {
            canvas.removeEventListener(gLite.ElementEvent.MOUNTED, handleMounted);
            canvas.removeEventListener(gLite.ElementEvent.ATTR_MODIFIED, handleAttributeChanged);
        });
    };
    LoadImagePlugin.tag = 'LoadImage';
    return LoadImagePlugin;
}());

var Plugin = /** @class */ (function (_super) {
    tslib.__extends(Plugin, _super);
    function Plugin() {
        var _this = _super.apply(this, tslib.__spreadArray([], tslib.__read(arguments), false)) || this;
        _this.name = 'image-loader';
        return _this;
    }
    Plugin.prototype.init = function () {
        // @ts-ignore
        this.context.imagePool = new ImagePool(this.context.config);
        this.addRenderingPlugin(new LoadImagePlugin());
    };
    Plugin.prototype.destroy = function () {
        this.removeAllRenderingPlugins();
    };
    return Plugin;
}(gLite.AbstractRendererPlugin));

exports.ImagePool = ImagePool;
exports.Plugin = Plugin;
//# sourceMappingURL=index.js.map

}, function(modId) {var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1731211820584);
})()
//miniprogram-npm-outsideDeps=["tslib","@antv/g-lite","@antv/util","gl-matrix"]
//# sourceMappingURL=index.js.map