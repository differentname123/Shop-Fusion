module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1731211820578, function(require, module, exports) {


var tslib = require('tslib');
var gLite = require('@antv/g-lite');
var util = require('@antv/util');
var glMatrix = require('gl-matrix');

/**
 * support 2 modes in rendering:
 * * immediate
 * * delayed: render at the end of frame with dirty-rectangle
 */
var CanvasRendererPlugin = /** @class */ (function () {
    function CanvasRendererPlugin(canvasRendererPluginOptions) {
        this.canvasRendererPluginOptions = canvasRendererPluginOptions;
        this.removedRBushNodeAABBs = [];
        this.renderQueue = [];
        /**
         * This stack is only used by clipPath for now.
         */
        this.restoreStack = [];
        this.clearFullScreen = false;
        /**
         * view projection matrix
         */
        this.vpMatrix = glMatrix.mat4.create();
        this.dprMatrix = glMatrix.mat4.create();
        this.tmpMat4 = glMatrix.mat4.create();
        this.vec3a = glMatrix.vec3.create();
        this.vec3b = glMatrix.vec3.create();
        this.vec3c = glMatrix.vec3.create();
        this.vec3d = glMatrix.vec3.create();
    }
    CanvasRendererPlugin.prototype.apply = function (context, runtime) {
        var _this = this;
        this.context = context;
        var config = context.config, camera = context.camera, renderingService = context.renderingService, renderingContext = context.renderingContext, rBushRoot = context.rBushRoot, 
        // @ts-ignore
        pathGeneratorFactory = context.pathGeneratorFactory;
        this.rBush = rBushRoot;
        this.pathGeneratorFactory = pathGeneratorFactory;
        var contextService = context.contextService;
        var canvas = renderingContext.root.ownerDocument.defaultView;
        var handleUnmounted = function (e) {
            var object = e.target;
            // remove r-bush node
            // @ts-ignore
            var rBushNode = object.rBushNode;
            if (rBushNode.aabb) {
                // save removed aabbs for dirty-rectangle rendering later
                _this.removedRBushNodeAABBs.push(rBushNode.aabb);
            }
        };
        var handleCulled = function (e) {
            var object = e.target;
            // @ts-ignore
            var rBushNode = object.rBushNode;
            if (rBushNode.aabb) {
                // save removed aabbs for dirty-rectangle rendering later
                _this.removedRBushNodeAABBs.push(rBushNode.aabb);
            }
        };
        renderingService.hooks.init.tap(CanvasRendererPlugin.tag, function () {
            canvas.addEventListener(gLite.ElementEvent.UNMOUNTED, handleUnmounted);
            canvas.addEventListener(gLite.ElementEvent.CULLED, handleCulled);
            // clear fullscreen
            var dpr = contextService.getDPR();
            var width = config.width, height = config.height;
            var context = contextService.getContext();
            _this.clearRect(context, 0, 0, width * dpr, height * dpr, config.background);
        });
        renderingService.hooks.destroy.tap(CanvasRendererPlugin.tag, function () {
            canvas.removeEventListener(gLite.ElementEvent.UNMOUNTED, handleUnmounted);
            canvas.removeEventListener(gLite.ElementEvent.CULLED, handleCulled);
            _this.renderQueue = [];
            _this.removedRBushNodeAABBs = [];
            _this.restoreStack = [];
        });
        renderingService.hooks.beginFrame.tap(CanvasRendererPlugin.tag, function () {
            var context = contextService.getContext();
            var dpr = contextService.getDPR();
            var width = config.width, height = config.height;
            var _a = _this.canvasRendererPluginOptions, dirtyObjectNumThreshold = _a.dirtyObjectNumThreshold, dirtyObjectRatioThreshold = _a.dirtyObjectRatioThreshold;
            // some heuristic conditions such as 80% object changed
            var _b = renderingService.getStats(), total = _b.total, rendered = _b.rendered;
            var ratio = rendered / total;
            _this.clearFullScreen =
                renderingService.disableDirtyRectangleRendering() ||
                    (rendered > dirtyObjectNumThreshold &&
                        ratio > dirtyObjectRatioThreshold);
            if (context) {
                context.resetTransform
                    ? context.resetTransform()
                    : context.setTransform(1, 0, 0, 1, 0, 0);
                if (_this.clearFullScreen) {
                    _this.clearRect(context, 0, 0, width * dpr, height * dpr, config.background);
                }
            }
        });
        var renderByZIndex = function (object, context) {
            if (object.isVisible() && !object.isCulled()) {
                _this.renderDisplayObject(object, context, _this.context, _this.restoreStack, runtime);
                // if (object.renderable.) {
                // if we did a full screen rendering last frame
                _this.saveDirtyAABB(object);
                // }
            }
            var sorted = object.sortable.sorted || object.childNodes;
            // should account for z-index
            sorted.forEach(function (child) {
                renderByZIndex(child, context);
            });
        };
        // render at the end of frame
        renderingService.hooks.endFrame.tap(CanvasRendererPlugin.tag, function () {
            var context = contextService.getContext();
            // clear & clip dirty rectangle
            var dpr = contextService.getDPR();
            glMatrix.mat4.fromScaling(_this.dprMatrix, [dpr, dpr, 1]);
            glMatrix.mat4.multiply(_this.vpMatrix, _this.dprMatrix, camera.getOrthoMatrix());
            // if (this.clearFullScreen) {
            if (_this.clearFullScreen) {
                // console.log('canvas renderer fcp...');
                renderByZIndex(renderingContext.root, context);
            }
            else {
                // console.log('canvas renderer next...');
                // merge removed AABB
                var dirtyRenderBounds = _this.safeMergeAABB.apply(_this, tslib.__spreadArray([_this.mergeDirtyAABBs(_this.renderQueue)], tslib.__read(_this.removedRBushNodeAABBs.map(function (_a) {
                    var minX = _a.minX, minY = _a.minY, maxX = _a.maxX, maxY = _a.maxY;
                    var aabb = new gLite.AABB();
                    aabb.setMinMax(
                    // vec3.fromValues(minX, minY, 0),
                    // vec3.fromValues(maxX, maxY, 0),
                    [minX, minY, 0], [maxX, maxY, 0]);
                    return aabb;
                })), false));
                _this.removedRBushNodeAABBs = [];
                if (gLite.AABB.isEmpty(dirtyRenderBounds)) {
                    _this.renderQueue = [];
                    return;
                }
                var dirtyRect = _this.convertAABB2Rect(dirtyRenderBounds);
                var x = dirtyRect.x, y = dirtyRect.y, width = dirtyRect.width, height = dirtyRect.height;
                var tl = glMatrix.vec3.transformMat4(_this.vec3a, [x, y, 0], _this.vpMatrix);
                var tr = glMatrix.vec3.transformMat4(_this.vec3b, [x + width, y, 0], _this.vpMatrix);
                var bl = glMatrix.vec3.transformMat4(_this.vec3c, [x, y + height, 0], _this.vpMatrix);
                var br = glMatrix.vec3.transformMat4(_this.vec3d, [x + width, y + height, 0], _this.vpMatrix);
                var minx = Math.min(tl[0], tr[0], br[0], bl[0]);
                var miny = Math.min(tl[1], tr[1], br[1], bl[1]);
                var maxx = Math.max(tl[0], tr[0], br[0], bl[0]);
                var maxy = Math.max(tl[1], tr[1], br[1], bl[1]);
                var ix = Math.floor(minx);
                var iy = Math.floor(miny);
                var iwidth = Math.ceil(maxx - minx);
                var iheight = Math.ceil(maxy - miny);
                context.save();
                _this.clearRect(context, ix, iy, iwidth, iheight, config.background);
                context.beginPath();
                context.rect(ix, iy, iwidth, iheight);
                context.clip();
                // @see https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Transformations
                context.setTransform(_this.vpMatrix[0], _this.vpMatrix[1], _this.vpMatrix[4], _this.vpMatrix[5], _this.vpMatrix[12], _this.vpMatrix[13]);
                // draw dirty rectangle
                var enableDirtyRectangleRenderingDebug = config.renderer.getConfig().enableDirtyRectangleRenderingDebug;
                if (enableDirtyRectangleRenderingDebug) {
                    canvas.dispatchEvent(new gLite.CustomEvent(gLite.CanvasEvent.DIRTY_RECTANGLE, {
                        dirtyRect: {
                            x: ix,
                            y: iy,
                            width: iwidth,
                            height: iheight,
                        },
                    }));
                }
                // search objects intersect with dirty rectangle
                var dirtyObjects = _this.searchDirtyObjects(dirtyRenderBounds);
                // do rendering
                dirtyObjects
                    // sort by z-index
                    .sort(function (a, b) { return a.sortable.renderOrder - b.sortable.renderOrder; })
                    .forEach(function (object) {
                    // culled object should not be rendered
                    if (object && object.isVisible() && !object.isCulled()) {
                        _this.renderDisplayObject(object, context, _this.context, _this.restoreStack, runtime);
                    }
                });
                context.restore();
                // save dirty AABBs in last frame
                _this.renderQueue.forEach(function (object) {
                    _this.saveDirtyAABB(object);
                });
                // clear queue
                _this.renderQueue = [];
            }
            // pop restore stack, eg. root -> parent -> child
            _this.restoreStack.forEach(function () {
                context.restore();
            });
            // clear restore stack
            _this.restoreStack = [];
        });
        renderingService.hooks.render.tap(CanvasRendererPlugin.tag, function (object) {
            if (!_this.clearFullScreen) {
                // render at the end of frame
                _this.renderQueue.push(object);
            }
        });
    };
    CanvasRendererPlugin.prototype.clearRect = function (context, x, y, width, height, background) {
        // clearRect is faster than fillRect @see https://stackoverflow.com/a/30830253
        context.clearRect(x, y, width, height);
        if (background) {
            context.fillStyle = background;
            context.fillRect(x, y, width, height);
        }
    };
    CanvasRendererPlugin.prototype.renderDisplayObject = function (object, context, canvasContext, restoreStack, runtime) {
        var nodeName = object.nodeName;
        // console.log('canvas render:', object);
        // restore to its ancestor
        var parent = restoreStack[restoreStack.length - 1];
        if (parent &&
            !(object.compareDocumentPosition(parent) & gLite.Node.DOCUMENT_POSITION_CONTAINS)) {
            context.restore();
            restoreStack.pop();
        }
        // @ts-ignore
        var styleRenderer = this.context.styleRendererFactory[nodeName];
        var generatePath = this.pathGeneratorFactory[nodeName];
        // clip path
        var clipPath = object.parsedStyle.clipPath;
        if (clipPath) {
            this.applyWorldTransform(context, clipPath);
            // generate path in local space
            var generatePath_1 = this.pathGeneratorFactory[clipPath.nodeName];
            if (generatePath_1) {
                context.save();
                // save clip
                restoreStack.push(object);
                context.beginPath();
                generatePath_1(context, clipPath.parsedStyle);
                context.closePath();
                context.clip();
            }
        }
        // fill & stroke
        if (styleRenderer) {
            this.applyWorldTransform(context, object);
            context.save();
            // apply attributes to context
            this.applyAttributesToContext(context, object);
        }
        if (generatePath) {
            context.beginPath();
            generatePath(context, object.parsedStyle);
            if (object.nodeName !== gLite.Shape.LINE &&
                object.nodeName !== gLite.Shape.PATH &&
                object.nodeName !== gLite.Shape.POLYLINE) {
                context.closePath();
            }
        }
        // fill & stroke
        if (styleRenderer) {
            styleRenderer.render(context, object.parsedStyle, object, canvasContext, this, runtime);
            // restore applied attributes, eg. shadowBlur shadowColor...
            context.restore();
        }
        // finish rendering, clear dirty flag
        object.renderable.dirty = false;
    };
    CanvasRendererPlugin.prototype.convertAABB2Rect = function (aabb) {
        var min = aabb.getMin();
        var max = aabb.getMax();
        // expand the rectangle a bit to avoid artifacts
        // @see https://www.yuque.com/antv/ou292n/bi8nix#ExvCu
        var minX = Math.floor(min[0]);
        var minY = Math.floor(min[1]);
        var maxX = Math.ceil(max[0]);
        var maxY = Math.ceil(max[1]);
        var width = maxX - minX;
        var height = maxY - minY;
        return { x: minX, y: minY, width: width, height: height };
    };
    /**
     * TODO: merge dirty rectangles with some strategies.
     * For now, we just simply merge all the rectangles into one.
     * @see https://idom.me/articles/841.html
     */
    CanvasRendererPlugin.prototype.mergeDirtyAABBs = function (dirtyObjects) {
        // merge into a big AABB
        // TODO: skip descendant if ancestor is caculated, but compareNodePosition is really slow
        var aabb = new gLite.AABB();
        dirtyObjects.forEach(function (object) {
            var renderBounds = object.getRenderBounds();
            aabb.add(renderBounds);
            var dirtyRenderBounds = object.renderable.dirtyRenderBounds;
            if (dirtyRenderBounds) {
                aabb.add(dirtyRenderBounds);
            }
        });
        return aabb;
    };
    CanvasRendererPlugin.prototype.searchDirtyObjects = function (dirtyRectangle) {
        // search in r-tree, get all affected nodes
        var _a = tslib.__read(dirtyRectangle.getMin(), 2), minX = _a[0], minY = _a[1];
        var _b = tslib.__read(dirtyRectangle.getMax(), 2), maxX = _b[0], maxY = _b[1];
        var rBushNodes = this.rBush.search({
            minX: minX,
            minY: minY,
            maxX: maxX,
            maxY: maxY,
        });
        return rBushNodes.map(function (_a) {
            var displayObject = _a.displayObject;
            return displayObject;
        });
    };
    CanvasRendererPlugin.prototype.saveDirtyAABB = function (object) {
        var renderable = object.renderable;
        if (!renderable.dirtyRenderBounds) {
            renderable.dirtyRenderBounds = new gLite.AABB();
        }
        var renderBounds = object.getRenderBounds();
        if (renderBounds) {
            // save last dirty aabb
            renderable.dirtyRenderBounds.update(renderBounds.center, renderBounds.halfExtents);
        }
    };
    /**
     * TODO: batch the same global attributes
     */
    CanvasRendererPlugin.prototype.applyAttributesToContext = function (context, object) {
        var _a = object.parsedStyle, stroke = _a.stroke, fill = _a.fill, opacity = _a.opacity, lineDash = _a.lineDash, lineDashOffset = _a.lineDashOffset;
        // @see https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/setLineDash
        if (lineDash) {
            context.setLineDash(lineDash);
        }
        // @see https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/lineDashOffset
        if (!util.isNil(lineDashOffset)) {
            context.lineDashOffset = lineDashOffset;
        }
        if (!util.isNil(opacity)) {
            context.globalAlpha *= opacity;
        }
        if (!util.isNil(stroke) &&
            !Array.isArray(stroke) &&
            !stroke.isNone) {
            context.strokeStyle = object.attributes.stroke;
        }
        if (!util.isNil(fill) && !Array.isArray(fill) && !fill.isNone) {
            context.fillStyle = object.attributes.fill;
        }
    };
    CanvasRendererPlugin.prototype.applyWorldTransform = function (context, object, matrix) {
        var tx = 0;
        var ty = 0;
        var anchor = (object.parsedStyle || {}).anchor;
        var anchorX = (anchor && anchor[0]) || 0;
        var anchorY = (anchor && anchor[1]) || 0;
        if (anchorX !== 0 || anchorY !== 0) {
            // const bounds = object.getGeometryBounds();
            var bounds = object.geometry.contentBounds;
            var width = (bounds && bounds.halfExtents[0] * 2) || 0;
            var height = (bounds && bounds.halfExtents[1] * 2) || 0;
            tx = -(anchorX * width);
            ty = -(anchorY * height);
        }
        // apply clip shape's RTS
        if (matrix) {
            glMatrix.mat4.copy(this.tmpMat4, object.getLocalTransform());
            this.vec3a[0] = tx;
            this.vec3a[1] = ty;
            this.vec3a[2] = 0;
            glMatrix.mat4.translate(this.tmpMat4, this.tmpMat4, this.vec3a);
            glMatrix.mat4.multiply(this.tmpMat4, matrix, this.tmpMat4);
            glMatrix.mat4.multiply(this.tmpMat4, this.vpMatrix, this.tmpMat4);
        }
        else {
            // apply RTS transformation in world space
            glMatrix.mat4.copy(this.tmpMat4, object.getWorldTransform());
            this.vec3a[0] = tx;
            this.vec3a[1] = ty;
            this.vec3a[2] = 0;
            glMatrix.mat4.translate(this.tmpMat4, this.tmpMat4, this.vec3a);
            glMatrix.mat4.multiply(this.tmpMat4, this.vpMatrix, this.tmpMat4);
        }
        // @see https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Transformations
        context.setTransform(this.tmpMat4[0], this.tmpMat4[1], this.tmpMat4[4], this.tmpMat4[5], this.tmpMat4[12], this.tmpMat4[13]);
    };
    CanvasRendererPlugin.prototype.safeMergeAABB = function () {
        var aabbs = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            aabbs[_i] = arguments[_i];
        }
        var merged = new gLite.AABB();
        aabbs.forEach(function (aabb) {
            merged.add(aabb);
        });
        return merged;
    };
    CanvasRendererPlugin.tag = 'CanvasRenderer';
    return CanvasRendererPlugin;
}());

var DefaultRenderer = /** @class */ (function () {
    function DefaultRenderer(imagePool) {
        this.imagePool = imagePool;
    }
    DefaultRenderer.prototype.render = function (context, parsedStyle, object, canvasContext, plugin, runtime) {
        var fill = parsedStyle.fill, fillRule = parsedStyle.fillRule, opacity = parsedStyle.opacity, fillOpacity = parsedStyle.fillOpacity, stroke = parsedStyle.stroke, strokeOpacity = parsedStyle.strokeOpacity, lineWidth = parsedStyle.lineWidth, lineCap = parsedStyle.lineCap, lineJoin = parsedStyle.lineJoin, shadowType = parsedStyle.shadowType, shadowColor = parsedStyle.shadowColor, shadowBlur = parsedStyle.shadowBlur, filter = parsedStyle.filter, miterLimit = parsedStyle.miterLimit;
        var hasFill = !util.isNil(fill) && !fill.isNone;
        var hasStroke = !util.isNil(stroke) && !stroke.isNone && lineWidth > 0;
        var isFillTransparent = fill.alpha === 0;
        var hasFilter = !!(filter && filter.length);
        var hasShadow = !util.isNil(shadowColor) && shadowBlur > 0;
        var nodeName = object.nodeName;
        var isInnerShadow = shadowType === 'inner';
        var shouldDrawShadowWithStroke = hasStroke &&
            hasShadow &&
            (nodeName === gLite.Shape.PATH ||
                nodeName === gLite.Shape.LINE ||
                nodeName === gLite.Shape.POLYLINE ||
                isFillTransparent ||
                isInnerShadow);
        if (hasFill) {
            context.globalAlpha = opacity * fillOpacity;
            if (!shouldDrawShadowWithStroke) {
                setShadowAndFilter(object, context, hasShadow);
            }
            this.fill(context, object, fill, fillRule, canvasContext, plugin, runtime);
            if (!shouldDrawShadowWithStroke) {
                this.clearShadowAndFilter(context, hasFilter, hasShadow);
            }
        }
        if (hasStroke) {
            context.globalAlpha = opacity * strokeOpacity;
            context.lineWidth = lineWidth;
            if (!util.isNil(miterLimit)) {
                context.miterLimit = miterLimit;
            }
            if (!util.isNil(lineCap)) {
                context.lineCap = lineCap;
            }
            if (!util.isNil(lineJoin)) {
                context.lineJoin = lineJoin;
            }
            if (shouldDrawShadowWithStroke) {
                if (isInnerShadow) {
                    context.globalCompositeOperation = 'source-atop';
                }
                setShadowAndFilter(object, context, true);
                if (isInnerShadow) {
                    this.stroke(context, object, stroke, canvasContext, plugin, runtime);
                    context.globalCompositeOperation = 'source-over';
                    this.clearShadowAndFilter(context, hasFilter, true);
                }
            }
            this.stroke(context, object, stroke, canvasContext, plugin, runtime);
        }
    };
    DefaultRenderer.prototype.clearShadowAndFilter = function (context, hasFilter, hasShadow) {
        if (hasShadow) {
            context.shadowColor = 'transparent';
            context.shadowBlur = 0;
        }
        if (hasFilter) {
            // save drop-shadow filter
            var oldFilter = context.filter;
            if (!util.isNil(oldFilter) && oldFilter.indexOf('drop-shadow') > -1) {
                context.filter =
                    oldFilter.replace(/drop-shadow\([^)]*\)/, '').trim() || 'none';
            }
        }
    };
    DefaultRenderer.prototype.fill = function (context, object, fill, fillRule, canvasContext, plugin, runtime) {
        var _this = this;
        if (Array.isArray(fill)) {
            fill.forEach(function (gradient) {
                context.fillStyle = _this.getColor(gradient, object, context);
                fillRule ? context.fill(fillRule) : context.fill();
            });
        }
        else {
            if (gLite.isPattern(fill)) {
                context.fillStyle = this.getPattern(fill, object, context, canvasContext, plugin, runtime);
            }
            fillRule ? context.fill(fillRule) : context.fill();
        }
    };
    DefaultRenderer.prototype.stroke = function (context, object, stroke, canvasContext, plugin, runtime) {
        var _this = this;
        if (Array.isArray(stroke)) {
            stroke.forEach(function (gradient) {
                context.strokeStyle = _this.getColor(gradient, object, context);
                context.stroke();
            });
        }
        else {
            if (gLite.isPattern(stroke)) {
                context.strokeStyle = this.getPattern(stroke, object, context, canvasContext, plugin, runtime);
            }
            context.stroke();
        }
    };
    DefaultRenderer.prototype.getPattern = function (pattern, object, context, canvasContext, plugin, runtime) {
        var $offscreenCanvas;
        var dpr;
        if (pattern.image.nodeName === 'rect') {
            var _a = pattern.image.parsedStyle, width = _a.width, height = _a.height;
            dpr = canvasContext.contextService.getDPR();
            var offscreenCanvas = canvasContext.config.offscreenCanvas;
            $offscreenCanvas = runtime.offscreenCanvasCreator.getOrCreateCanvas(offscreenCanvas);
            $offscreenCanvas.width = width * dpr;
            $offscreenCanvas.height = height * dpr;
            var offscreenCanvasContext_1 = runtime.offscreenCanvasCreator.getOrCreateContext(offscreenCanvas);
            var restoreStack_1 = [];
            // offscreenCanvasContext.scale(1 / dpr, 1 / dpr);
            pattern.image.forEach(function (object) {
                plugin.renderDisplayObject(object, offscreenCanvasContext_1, canvasContext, restoreStack_1, runtime);
            });
            restoreStack_1.forEach(function () {
                offscreenCanvasContext_1.restore();
            });
        }
        var canvasPattern = this.imagePool.getOrCreatePatternSync(pattern, context, $offscreenCanvas, dpr, function () {
            // set dirty rectangle flag
            object.renderable.dirty = true;
            canvasContext.renderingService.dirtify();
        });
        return canvasPattern;
    };
    DefaultRenderer.prototype.getColor = function (parsedColor, object, context) {
        var color;
        if (parsedColor.type === gLite.GradientType.LinearGradient ||
            parsedColor.type === gLite.GradientType.RadialGradient) {
            var bounds = object.getGeometryBounds();
            var width = (bounds && bounds.halfExtents[0] * 2) || 1;
            var height = (bounds && bounds.halfExtents[1] * 2) || 1;
            color = this.imagePool.getOrCreateGradient(tslib.__assign(tslib.__assign({ type: parsedColor.type }, parsedColor.value), { width: width, height: height }), context);
        }
        return color;
    };
    return DefaultRenderer;
}());
/**
 * apply before fill and stroke but only once
 */
function setShadowAndFilter(object, context, hasShadow) {
    var _a = object.parsedStyle, filter = _a.filter, shadowColor = _a.shadowColor, shadowBlur = _a.shadowBlur, shadowOffsetX = _a.shadowOffsetX, shadowOffsetY = _a.shadowOffsetY;
    if (filter && filter.length) {
        // use raw filter string
        context.filter = object.style.filter;
    }
    if (hasShadow) {
        context.shadowColor = shadowColor.toString();
        context.shadowBlur = shadowBlur || 0;
        context.shadowOffsetX = shadowOffsetX || 0;
        context.shadowOffsetY = shadowOffsetY || 0;
    }
}

var ImageRenderer = /** @class */ (function () {
    function ImageRenderer(imagePool) {
        this.imagePool = imagePool;
    }
    ImageRenderer.prototype.render = function (context, parsedStyle, object) {
        var width = parsedStyle.width, height = parsedStyle.height, img = parsedStyle.img, shadowColor = parsedStyle.shadowColor, shadowBlur = parsedStyle.shadowBlur;
        var image;
        var iw = width;
        var ih = height;
        if (util.isString(img)) {
            // image has been loaded in `mounted` hook
            image = this.imagePool.getImageSync(img);
        }
        else {
            iw || (iw = img.width);
            ih || (ih = img.height);
            image = img;
        }
        if (image) {
            var hasShadow = !util.isNil(shadowColor) && shadowBlur > 0;
            setShadowAndFilter(object, context, hasShadow);
            // node-canvas will throw the following err:
            // Error: Image given has not completed loading
            try {
                context.drawImage(image, 0, 0, iw, ih);
            }
            catch (e) { }
        }
    };
    return ImageRenderer;
}());

var TextRenderer = /** @class */ (function () {
    function TextRenderer() {
    }
    TextRenderer.prototype.render = function (context, parsedStyle, object, canvasContext, plugin, runtime) {
        var _a = parsedStyle, lineWidth = _a.lineWidth, textAlign = _a.textAlign, textBaseline = _a.textBaseline, lineJoin = _a.lineJoin, miterLimit = _a.miterLimit, letterSpacing = _a.letterSpacing, stroke = _a.stroke, fill = _a.fill, fillOpacity = _a.fillOpacity, strokeOpacity = _a.strokeOpacity, opacity = _a.opacity, metrics = _a.metrics, dx = _a.dx, dy = _a.dy, shadowColor = _a.shadowColor, shadowBlur = _a.shadowBlur;
        var font = metrics.font, lines = metrics.lines, height = metrics.height, lineHeight = metrics.lineHeight, lineMetrics = metrics.lineMetrics;
        context.font = font;
        context.lineWidth = lineWidth;
        context.textAlign = textAlign === 'middle' ? 'center' : textAlign;
        var formattedTextBaseline = textBaseline;
        if (
        // formattedTextBaseline === 'bottom' ||
        !runtime.enableCSSParsing &&
            formattedTextBaseline === 'alphabetic') {
            formattedTextBaseline = 'bottom';
        }
        context.lineJoin = lineJoin;
        if (!util.isNil(miterLimit)) {
            context.miterLimit = miterLimit;
        }
        var linePositionY = 0;
        // handle vertical text baseline
        if (textBaseline === 'middle') {
            linePositionY = -height / 2 - lineHeight / 2;
        }
        else if (textBaseline === 'bottom' ||
            textBaseline === 'alphabetic' ||
            textBaseline === 'ideographic') {
            linePositionY = -height;
        }
        else if (textBaseline === 'top' || textBaseline === 'hanging') {
            linePositionY = -lineHeight;
        }
        // account for dx & dy
        var offsetX = dx || 0;
        linePositionY += dy || 0;
        if (lines.length === 1) {
            if (formattedTextBaseline === 'bottom') {
                formattedTextBaseline = 'middle';
                linePositionY -= 0.5 * height;
            }
            else if (formattedTextBaseline === 'top') {
                formattedTextBaseline = 'middle';
                linePositionY += 0.5 * height;
            }
        }
        context.textBaseline = formattedTextBaseline;
        var hasShadow = !util.isNil(shadowColor) && shadowBlur > 0;
        setShadowAndFilter(object, context, hasShadow);
        // draw lines line by line
        for (var i = 0; i < lines.length; i++) {
            var linePositionX = lineWidth / 2 + offsetX;
            linePositionY += lineHeight;
            // no need to re-position X, cause we already set text align
            // @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/textAlign
            if (!util.isNil(stroke) && !stroke.isNone && lineWidth) {
                this.drawLetterSpacing(context, lines[i], lineMetrics[i], textAlign, linePositionX, linePositionY, letterSpacing, fillOpacity, strokeOpacity, opacity, true);
            }
            if (!util.isNil(fill)) {
                this.drawLetterSpacing(context, lines[i], lineMetrics[i], textAlign, linePositionX, linePositionY, letterSpacing, fillOpacity, strokeOpacity, opacity);
            }
        }
    };
    TextRenderer.prototype.drawLetterSpacing = function (context, text, lineMetrics, textAlign, x, y, letterSpacing, fillOpacity, strokeOpacity, opacity, isStroke) {
        if (isStroke === void 0) { isStroke = false; }
        // letterSpacing of 0 means normal, render all texts directly
        if (letterSpacing === 0) {
            if (isStroke) {
                this.strokeText(context, text, x, y, strokeOpacity);
            }
            else {
                this.fillText(context, text, x, y, fillOpacity, opacity);
            }
            return;
        }
        // draw text using left align
        var currentTextAlign = context.textAlign;
        context.textAlign = 'left';
        var currentPosition = x;
        if (textAlign === 'center' || textAlign === 'middle') {
            currentPosition = x - lineMetrics.width / 2;
        }
        else if (textAlign === 'right' || textAlign === 'end') {
            currentPosition = x - lineMetrics.width;
        }
        var stringArray = Array.from(text);
        var previousWidth = context.measureText(text).width;
        var currentWidth = 0;
        for (var i = 0; i < stringArray.length; ++i) {
            var currentChar = stringArray[i];
            if (isStroke) {
                this.strokeText(context, currentChar, currentPosition, y, strokeOpacity);
            }
            else {
                this.fillText(context, currentChar, currentPosition, y, fillOpacity, opacity);
            }
            currentWidth = context.measureText(text.substring(i + 1)).width;
            currentPosition += previousWidth - currentWidth + letterSpacing;
            previousWidth = currentWidth;
        }
        context.textAlign = currentTextAlign;
    };
    TextRenderer.prototype.fillText = function (context, text, x, y, fillOpacity, opacity) {
        var currentGlobalAlpha;
        var applyOpacity = !util.isNil(fillOpacity) && fillOpacity !== 1;
        if (applyOpacity) {
            currentGlobalAlpha = context.globalAlpha;
            context.globalAlpha = fillOpacity * opacity;
        }
        context.fillText(text, x, y);
        if (applyOpacity) {
            context.globalAlpha = currentGlobalAlpha;
        }
    };
    TextRenderer.prototype.strokeText = function (context, text, x, y, strokeOpacity) {
        var currentGlobalAlpha;
        var applyOpacity = !util.isNil(strokeOpacity) && strokeOpacity !== 1;
        if (applyOpacity) {
            currentGlobalAlpha = context.globalAlpha;
            context.globalAlpha = strokeOpacity;
        }
        context.strokeText(text, x, y);
        if (applyOpacity) {
            context.globalAlpha = currentGlobalAlpha;
        }
    };
    return TextRenderer;
}());

var RectRenderer = /** @class */ (function (_super) {
    tslib.__extends(RectRenderer, _super);
    function RectRenderer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return RectRenderer;
}(DefaultRenderer));

var CircleRenderer = /** @class */ (function (_super) {
    tslib.__extends(CircleRenderer, _super);
    function CircleRenderer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return CircleRenderer;
}(DefaultRenderer));

var EllipseRenderer = /** @class */ (function (_super) {
    tslib.__extends(EllipseRenderer, _super);
    function EllipseRenderer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return EllipseRenderer;
}(DefaultRenderer));

var LineRenderer = /** @class */ (function (_super) {
    tslib.__extends(LineRenderer, _super);
    function LineRenderer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return LineRenderer;
}(DefaultRenderer));

var PolylineRenderer = /** @class */ (function (_super) {
    tslib.__extends(PolylineRenderer, _super);
    function PolylineRenderer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return PolylineRenderer;
}(DefaultRenderer));

var PolygonRenderer = /** @class */ (function (_super) {
    tslib.__extends(PolygonRenderer, _super);
    function PolygonRenderer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return PolygonRenderer;
}(DefaultRenderer));

var PathRenderer = /** @class */ (function (_super) {
    tslib.__extends(PathRenderer, _super);
    function PathRenderer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return PathRenderer;
}(DefaultRenderer));

var Plugin = /** @class */ (function (_super) {
    tslib.__extends(Plugin, _super);
    function Plugin(options) {
        if (options === void 0) { options = {}; }
        var _this = _super.call(this) || this;
        _this.options = options;
        _this.name = 'canvas-renderer';
        return _this;
    }
    Plugin.prototype.init = function () {
        var _a;
        var canvasRendererPluginOptions = tslib.__assign({ dirtyObjectNumThreshold: 500, dirtyObjectRatioThreshold: 0.8 }, this.options);
        // @ts-ignore
        var imagePool = this.context.imagePool;
        var defaultRenderer = new DefaultRenderer(imagePool);
        var defaultStyleRendererFactory = (_a = {},
            _a[gLite.Shape.CIRCLE] = defaultRenderer,
            _a[gLite.Shape.ELLIPSE] = defaultRenderer,
            _a[gLite.Shape.RECT] = defaultRenderer,
            _a[gLite.Shape.IMAGE] = new ImageRenderer(imagePool),
            _a[gLite.Shape.TEXT] = new TextRenderer(),
            _a[gLite.Shape.LINE] = defaultRenderer,
            _a[gLite.Shape.POLYLINE] = defaultRenderer,
            _a[gLite.Shape.POLYGON] = defaultRenderer,
            _a[gLite.Shape.PATH] = defaultRenderer,
            _a[gLite.Shape.GROUP] = undefined,
            _a[gLite.Shape.HTML] = undefined,
            _a[gLite.Shape.MESH] = undefined,
            _a);
        this.context.defaultStyleRendererFactory = defaultStyleRendererFactory;
        this.context.styleRendererFactory = defaultStyleRendererFactory;
        this.addRenderingPlugin(new CanvasRendererPlugin(canvasRendererPluginOptions));
    };
    Plugin.prototype.destroy = function () {
        this.removeAllRenderingPlugins();
        delete this.context.defaultStyleRendererFactory;
        delete this.context.styleRendererFactory;
    };
    return Plugin;
}(gLite.AbstractRendererPlugin));

exports.CircleRenderer = CircleRenderer;
exports.EllipseRenderer = EllipseRenderer;
exports.ImageRenderer = ImageRenderer;
exports.LineRenderer = LineRenderer;
exports.PathRenderer = PathRenderer;
exports.Plugin = Plugin;
exports.PolygonRenderer = PolygonRenderer;
exports.PolylineRenderer = PolylineRenderer;
exports.RectRenderer = RectRenderer;
exports.TextRenderer = TextRenderer;
//# sourceMappingURL=index.js.map

}, function(modId) {var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1731211820578);
})()
//miniprogram-npm-outsideDeps=["tslib","@antv/g-lite","@antv/util","gl-matrix"]
//# sourceMappingURL=index.js.map