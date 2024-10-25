module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1729528802041, function(require, module, exports) {


var tslib = require('tslib');
var gLite = require('@antv/g-lite');
var util = require('@antv/util');

var eps = 0.0001;
/**
 * Provides some control methods like:
 * - play
 * - pause
 * - stop
 * - goToAndStop
 * - goToAndPlay
 * @see https://github.com/airbnb/lottie-web/blob/master/player/js/animation/AnimationItem.js
 */
var LottieAnimation = /** @class */ (function () {
    function LottieAnimation(width, height, elements, context) {
        var _this = this;
        this.width = width;
        this.height = height;
        this.elements = elements;
        this.context = context;
        this.keyframeAnimationMap = new WeakMap();
        this.displayObjectElementMap = new WeakMap();
        this.animations = [];
        this.isPaused = false;
        this.direction = 1;
        this.displayObjects = elements.map(function (element) {
            return _this.buildHierachy(element);
        });
        // TODO: preload images
        // TODO: preload fonts
    }
    LottieAnimation.prototype.generateTransform = function (tx, ty, scaleX, scaleY, rotation) {
        var transformStr = '';
        if (tx !== 0 || ty !== 0) {
            transformStr += "translate(".concat(tx, ", ").concat(ty, ")");
        }
        if (scaleX !== 1 || scaleY !== 1) {
            transformStr += " scale(".concat(scaleX === 0 ? eps : scaleX, ", ").concat(scaleY === 0 ? eps : scaleY, ")");
        }
        if (rotation !== 0) {
            transformStr += " rotate(".concat(rotation, "deg)");
        }
        return transformStr;
    };
    LottieAnimation.prototype.buildHierachy = function (element) {
        var _this = this;
        var type = element.type, name = element.name, _a = element.anchorX, anchorX = _a === void 0 ? 0 : _a, _b = element.anchorY, anchorY = _b === void 0 ? 0 : _b, _c = element.rotation, rotation = _c === void 0 ? 0 : _c, _d = element.scaleX, scaleX = _d === void 0 ? 1 : _d, _e = element.scaleY, scaleY = _e === void 0 ? 1 : _e, _f = element.x, x = _f === void 0 ? 0 : _f, _g = element.y, y = _g === void 0 ? 0 : _g, 
        // skew = 0,
        // skewAxis = 0,
        children = element.children, shape = element.shape, style = element.style, keyframeAnimation = element.keyframeAnimation;
        var displayObject;
        var transform = this.generateTransform(x - anchorX, y - anchorY, scaleX, scaleY, rotation);
        // const transformMat = mat4.fromRotationTranslationScaleOrigin(
        //   mat4.create(),
        //   quat.fromEuler(quat.create(), 0, 0, rotation),
        //   [x - anchorX, y - anchorY, 0],
        //   [scaleX, scaleY, 1],
        //   [anchorX, anchorY, 0],
        // );
        // TODO: repeater @see https://lottiefiles.github.io/lottie-docs/shapes/#repeater
        // @see https://lottiefiles.github.io/lottie-docs/shapes/#shape
        // TODO: polystar, convert to Bezier @see https://lottiefiles.github.io/lottie-docs/rendering/#polystar
        if (type === gLite.Shape.GROUP) {
            displayObject = new gLite.Group({
                style: {
                    transformOrigin: "".concat(anchorX, "px ").concat(anchorY, "px"),
                    transform: transform,
                },
            });
        }
        else if (type === gLite.Shape.ELLIPSE) {
            var cx = shape.cx, cy = shape.cy, rx = shape.rx, ry = shape.ry;
            // const center = vec3.fromValues(cx, cy, 0);
            // vec3.transformMat4(center, center, transformMat);
            displayObject = new gLite.Ellipse({
                style: {
                    // cx: center[0],
                    // cy: center[1],
                    cx: cx,
                    cy: cy,
                    rx: rx,
                    ry: ry,
                    // reset transform-origin based on anchor & center
                    transformOrigin: "".concat(anchorX - cx + rx, "px ").concat(anchorY - cy + ry, "px"),
                    transform: transform,
                },
            });
        }
        else if (type === gLite.Shape.PATH) {
            var d = this.generatePathFromShape(shape);
            displayObject = new gLite.Path({
                style: {
                    d: d, // use Path Array which can be skipped when parsing
                    transformOrigin: "".concat(anchorX, "px ").concat(anchorY, "px"),
                    transform: transform,
                },
            });
        }
        else if (type === gLite.Shape.RECT) {
            // @see https://lottiefiles.github.io/lottie-docs/shapes/#rectangle
            var cx = shape.x, cy = shape.y, width = shape.width, height = shape.height, r = shape.r;
            displayObject = new gLite.Rect({
                style: {
                    x: cx,
                    y: cy,
                    width: width,
                    height: height,
                    anchor: [0.5, 0.5], // position means the center of the rectangle
                    radius: r,
                    transformOrigin: "".concat(anchorX - cx + width / 2, "px ").concat(anchorY - cy + height / 2, "px"),
                    transform: transform,
                },
            });
        }
        else if (type === gLite.Shape.IMAGE) {
            var width = shape.width, height = shape.height, src = shape.src;
            displayObject = new gLite.Image({
                style: {
                    x: 0,
                    y: 0,
                    width: width,
                    height: height,
                    src: src,
                    transformOrigin: "".concat(anchorX, "px ").concat(anchorY, "px"),
                    transform: transform,
                },
            });
        }
        if (name) {
            displayObject.name = name;
        }
        // TODO: match name `mn`, used in expressions
        if (style) {
            // { fill, fillOpacity, fillRule, opacity, lineDash, lineDashOffset }
            displayObject.attr(style);
        }
        if (keyframeAnimation) {
            this.keyframeAnimationMap.set(displayObject, keyframeAnimation);
        }
        if (children) {
            var childNodes = children.map(function (child) { return _this.buildHierachy(child); });
            displayObject.append.apply(displayObject, tslib.__spreadArray([], tslib.__read(childNodes), false));
        }
        this.displayObjectElementMap.set(displayObject, element);
        return displayObject;
    };
    LottieAnimation.prototype.getAnimations = function () {
        return this.animations;
    };
    /**
     * Returns the animation duration in seconds or frames.
     * @see https://github.com/airbnb/lottie-web#getdurationinframes
     */
    LottieAnimation.prototype.getDuration = function (inFrames) {
        if (inFrames === void 0) { inFrames = false; }
        return (((inFrames ? this.fps() : 1) *
            (this.context.endFrame - this.context.startFrame) *
            this.context.frameTime) /
            1000);
    };
    /**
     * Returns the animation frame rate (frames / second).
     */
    LottieAnimation.prototype.fps = function () {
        return this.context.fps;
    };
    LottieAnimation.prototype.isSameKeyframeOptions = function (options1, options2) {
        return (options1.delay === options2.delay &&
            options1.duration === options2.duration &&
            options1.easing === options2.easing);
    };
    LottieAnimation.prototype.isSameKeyframes = function (keyframe1, keyframe2) {
        // const { offset: o1, easing: e1, ...rest1 } = keyframe1;
        // const { offset: o2, easing: e2, ...rest2 } = keyframe2;
        // const isAllApplyToTransform =
        //   Object.keys(rest1).every((key) =>
        //     ['x', 'y', 'scaleX', 'scaleY', 'rotation'].includes(key),
        //   ) &&
        //   Object.keys(rest2).every((key) =>
        //     ['x', 'y', 'scaleX', 'scaleY', 'rotation'].includes(key),
        //   );
        return (keyframe1.offset === keyframe2.offset &&
            keyframe1.easing === keyframe2.easing
        // (keyframe1.easing === keyframe2.easing || isAllApplyToTransform)
        );
    };
    LottieAnimation.prototype.generatePathFromShape = function (shape) {
        // @see https://lottiefiles.github.io/lottie-docs/shapes/#path
        var close = shape.close, v = shape.v, i = shape.in, out = shape.out;
        var d = [];
        d.push(['M', v[0][0], v[0][1]]);
        for (var n = 1; n < v.length; n++) {
            // @see https://lottiefiles.github.io/lottie-docs/concepts/#bezier
            // The nth bezier segment is defined as:
            // v[n], v[n]+o[n], v[n+1]+i[n+1], v[n+1]
            d.push([
                'C',
                out[n - 1][0],
                out[n - 1][1],
                i[n][0],
                i[n][1],
                v[n][0],
                v[n][1],
            ]);
        }
        if (close) {
            d.push([
                'C',
                out[v.length - 1][0],
                out[v.length - 1][1],
                i[0][0],
                i[0][1],
                v[0][0],
                v[0][1],
            ]);
            d.push(['Z']);
        }
        return d;
    };
    /**
     * render Lottie Group to canvas or a mounted display object
     */
    LottieAnimation.prototype.render = function (canvasOrDisplayObject) {
        var _this = this;
        var wrapper = new gLite.Group();
        wrapper.append.apply(wrapper, tslib.__spreadArray([], tslib.__read(this.displayObjects), false));
        if (gLite.isCanvas(canvasOrDisplayObject)) {
            canvasOrDisplayObject.appendChild(wrapper);
        }
        else if (gLite.isDisplayObject(canvasOrDisplayObject)) {
            if (!canvasOrDisplayObject.isConnected) {
                throw new Error('[g-lottie-player]: Cannot render Lottie to an unmounted DisplayObject.');
            }
            else {
                canvasOrDisplayObject.appendChild(wrapper);
            }
        }
        else {
            throw new Error('[g-lottie-player]: We should render Lottie to a mounted DisplayObject or Canvas.');
        }
        this.displayObjects.forEach(function (parent) {
            parent.forEach(function (child) {
                var _a;
                var keyframeAnimation = _this.keyframeAnimationMap.get(child);
                // console.log('keyframeAnimation', keyframeAnimation);
                var element = _this.displayObjectElementMap.get(child);
                if (element && element.clipPath) {
                    var _b = element.clipPath, shape = _b.shape, keyframeAnimation_1 = _b.keyframeAnimation;
                    var clipPath = new gLite.Path();
                    // use clipPath as target's siblings
                    child.parentElement.appendChild(clipPath);
                    child.style.clipPath = clipPath;
                    if (shape) {
                        clipPath.style.d = _this.generatePathFromShape(shape);
                    }
                    // TODO: only support one clipPath now
                    if (keyframeAnimation_1 && keyframeAnimation_1.length) {
                        var _c = keyframeAnimation_1[0], delay = _c.delay, duration = _c.duration, easing = _c.easing, keyframes = _c.keyframes;
                        // animate clipPath with its `d` property
                        var clipPathAnimation = clipPath.animate(keyframes.map(function (_a) {
                            var offset = _a.offset, shape = _a.shape, easing = _a.easing;
                            return {
                                offset: offset,
                                d: util.path2String(_this.generatePathFromShape(shape)),
                                easing: easing,
                            };
                        }), {
                            delay: delay,
                            duration: duration,
                            easing: easing,
                            iterations: _this.context.iterations,
                        });
                        _this.animations.push(clipPathAnimation);
                    }
                }
                // account for animation only apply to visibility, e.g. spring
                var visibilityStartOffset = element.visibilityStartOffset, visibilityEndOffset = element.visibilityEndOffset, visibilityFrame = element.visibilityFrame;
                if (visibilityFrame &&
                    (!keyframeAnimation || !keyframeAnimation.length)) {
                    keyframeAnimation = [
                        {
                            duration: _this.context.frameTime * visibilityFrame,
                            keyframes: [
                                { offset: 0, style: { opacity: 1 } },
                                { offset: 1, style: { opacity: 1 } },
                            ],
                        },
                    ];
                }
                if (keyframeAnimation && keyframeAnimation.length) {
                    var keyframesOptions_1 = [];
                    keyframeAnimation.map(function (_a) {
                        var _b = _a.delay, delay = _b === void 0 ? 0 : _b, duration = _a.duration, easing = _a.easing, keyframes = _a.keyframes;
                        var formattedKeyframes = keyframes.map(function (keyframe) {
                            return gLite.definedProps(keyframe);
                        });
                        var options = gLite.definedProps({
                            delay: delay,
                            duration: duration,
                            easing: easing,
                            iterations: _this.context.iterations,
                            fill: _this.context.fill,
                        });
                        keyframesOptions_1.push([formattedKeyframes, options]);
                    });
                    var mergedKeyframesOptions = [keyframesOptions_1[0]];
                    var _loop_1 = function (i) {
                        var _d = tslib.__read(keyframesOptions_1[i], 2), currentKeyframes = _d[0], currentOptions = _d[1];
                        // can merge options?
                        var existedKeyframeOptions = mergedKeyframesOptions.find(function (_a) {
                            var _b = tslib.__read(_a, 2), keyframes = _b[0], options = _b[1];
                            return keyframes.length === currentKeyframes.length &&
                                _this.isSameKeyframeOptions(currentOptions, options);
                        });
                        if (existedKeyframeOptions) {
                            currentKeyframes.forEach(function (currentKeyframe) {
                                var existedKeyframe = existedKeyframeOptions[0].find(function (keyframe) { return _this.isSameKeyframes(currentKeyframe, keyframe); });
                                if (existedKeyframe) {
                                    currentKeyframe.offset; 
                                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                    currentKeyframe.easing; 
                                    var rest = tslib.__rest(currentKeyframe, ["offset", "easing"]);
                                    // merge interpolated properties
                                    Object.assign(existedKeyframe, rest);
                                }
                                else {
                                    // append if cannot be merged
                                    existedKeyframeOptions[0].push(currentKeyframe);
                                }
                            });
                        }
                        else {
                            // cannot be merged since options are different
                            mergedKeyframesOptions.push(keyframesOptions_1[i]);
                        }
                    };
                    // merge [{ offset: 0, cx: 1 }, { offset: 0, cy: 1 }] into { offset: 0, cx: 1, cy: 1 }
                    for (var i = 1; i < keyframesOptions_1.length; i++) {
                        _loop_1(i);
                    }
                    // restore animations for later use
                    (_a = _this.animations).push.apply(_a, tslib.__spreadArray([], tslib.__read(mergedKeyframesOptions
                        .map(function (_a) {
                        var _b = tslib.__read(_a, 2), merged = _b[0], options = _b[1];
                        // format interpolated properties, e.g. scaleX -> transform
                        var formatted = _this.formatKeyframes(merged, child);
                        if (formatted.length) {
                            // console.log(child, formatted);
                            var animation_1 = child.animate(formatted, options);
                            if (!util.isNil(visibilityStartOffset) &&
                                !util.isNil(visibilityEndOffset)) {
                                child.style.visibility = 'hidden';
                                animation_1.onframe = function () {
                                    var progress = animation_1.effect.getComputedTiming().progress;
                                    if (progress >= visibilityStartOffset &&
                                        progress < visibilityEndOffset) {
                                        child.style.visibility = 'visible';
                                    }
                                    else {
                                        child.style.visibility = 'hidden';
                                    }
                                };
                            }
                            if (!_this.context.autoplay) {
                                animation_1.pause();
                            }
                            return animation_1;
                        }
                    })
                        .filter(function (animation) { return !!animation; })), false));
                }
            });
        });
        return wrapper;
    };
    LottieAnimation.prototype.formatKeyframes = function (keyframes, object) {
        keyframes.forEach(function (keyframe) {
            // if ('offsetPath' in keyframe) {
            //   if (!object.style.offsetPath) {
            //     const [ox, oy] = object.getOrigin();
            //     (keyframe.offsetPath as AbsoluteArray).forEach((segment) => {
            //       if (segment[0] === 'M') {
            //         segment[1] -= ox;
            //         segment[2] -= oy;
            //       } else if (segment[0] === 'C') {
            //         segment[1] -= ox;
            //         segment[2] -= oy;
            //         segment[3] -= ox;
            //         segment[4] -= oy;
            //         segment[5] -= ox;
            //         segment[6] -= oy;
            //       }
            //     });
            //     const offsetPath = new Path({
            //       style: {
            //         d: keyframe.offsetPath,
            //       },
            //     });
            //     object.style.offsetPath = offsetPath;
            //     console.log(offsetPath);
            //   }
            //   delete keyframe.offsetPath;
            //   // offsetPath should override x/y
            //   delete keyframe.x;
            //   delete keyframe.y;
            // }
            // should keep transform during initialization
            // if (!object.style.offsetPath) {
            //   keyframe.transform = object.style.transform || '';
            // }
            keyframe.transform = object.style.transform || '';
            // TODO: transforms with different easing functions will conflict
            if ('scaleX' in keyframe) {
                keyframe.transform =
                    (keyframe.transform || '') +
                        " scaleX(".concat(keyframe.scaleX === 0 ? eps : keyframe.scaleX, ")");
                delete keyframe.scaleX;
            }
            if ('scaleY' in keyframe) {
                keyframe.transform =
                    (keyframe.transform || '') +
                        " scaleY(".concat(keyframe.scaleY === 0 ? eps : keyframe.scaleY, ")");
                delete keyframe.scaleY;
            }
            if ('rotation' in keyframe) {
                keyframe.transform =
                    (keyframe.transform || '') + " rotate(".concat(keyframe.rotation, "deg)");
                delete keyframe.rotation;
            }
            // TODO: skew & skewAxis
            // if ('skew' in keyframe) {
            //   keyframe.transform = (keyframe.transform || '') + ` skew(${keyframe.skew}deg)`;
            //   delete keyframe.skew;
            // }
            if ('x' in keyframe) {
                keyframe.transform =
                    (keyframe.transform || '') + " translateX(".concat(keyframe.x, "px)");
                delete keyframe.x;
            }
            if ('y' in keyframe) {
                keyframe.transform =
                    (keyframe.transform || '') + " translateY(".concat(keyframe.y, "px)");
                delete keyframe.y;
            }
            // { style: { opacity: 1 } }
            if ('style' in keyframe) {
                Object.keys(keyframe.style).forEach(function (name) {
                    keyframe[name] = keyframe.style[name];
                });
                delete keyframe.style;
            }
        });
        // ignore empty interpolable attributes
        keyframes = keyframes.filter(function (keyframe) {
            // TODO: support negative offset
            keyframe.ignore; keyframe.easing; var offset = keyframe.offset, rest = tslib.__rest(keyframe, ["ignore", "easing", "offset"]);
            return offset >= 0 && Object.keys(rest).length > 0;
            // return Object.keys(rest).length > 0;
        });
        if (keyframes.length) {
            // padding offset = 1
            if (keyframes[keyframes.length - 1].offset !== 1) {
                keyframes.push(tslib.__assign(tslib.__assign({}, keyframes[keyframes.length - 1]), { offset: 1 }));
            }
        }
        // sort by offset
        keyframes.sort(function (a, b) { return a.offset - b.offset; });
        // remove empty attributes
        keyframes.forEach(function (keyframe) {
            Object.keys(keyframe).forEach(function (name) {
                if (keyframe[name] === '') {
                    delete keyframe[name];
                }
            });
        });
        return keyframes;
    };
    /**
     * Destroy all internal displayobjects.
     */
    LottieAnimation.prototype.destroy = function () {
        this.displayObjects.forEach(function (object) {
            object.destroy();
        });
    };
    /**
     * Return the size of this animation.
     * @param outputSize - If provided, the size will be copied into here as width, height.
     */
    LottieAnimation.prototype.size = function (outputSize) {
        return { width: this.width, height: this.height };
    };
    /**
     * Bodymovin version
     */
    LottieAnimation.prototype.version = function () {
        return this.context.version;
    };
    LottieAnimation.prototype.play = function () {
        this.isPaused = false;
        this.animations.forEach(function (animation) {
            animation.play();
        });
    };
    /**
     * Can contain 2 numeric values that will be used as first and last frame of the animation.
     * @see https://github.com/airbnb/lottie-web#playsegmentssegments-forceflag
     */
    LottieAnimation.prototype.playSegments = function (segments) {
        var _this = this;
        var _a = tslib.__read(segments, 2), firstFrame = _a[0], lastFrame = _a[1];
        this.isPaused = false;
        this.animations.forEach(function (animation) {
            animation.currentTime = (firstFrame / _this.fps()) * 1000;
            var originOnFrame = animation.onframe;
            animation.onframe = function (e) {
                if (originOnFrame) {
                    // @ts-ignore
                    originOnFrame(e);
                }
                if (animation.currentTime >= (lastFrame / _this.fps()) * 1000) {
                    animation.finish();
                    if (originOnFrame) {
                        animation.onframe = originOnFrame;
                    }
                    else {
                        animation.onframe = null;
                    }
                }
            };
            animation.play();
        });
    };
    LottieAnimation.prototype.pause = function () {
        this.isPaused = true;
        this.animations.forEach(function (animation) {
            animation.pause();
        });
    };
    /**
     *
     */
    LottieAnimation.prototype.togglePause = function () {
        if (this.isPaused) {
            this.play();
        }
        else {
            this.pause();
        }
    };
    /**
     * Goto and stop at a specific time(in seconds) or frame.
     * Split goToAndStop/Play into goTo & stop/play
     * @see https://github.com/airbnb/lottie-web
     */
    LottieAnimation.prototype.goTo = function (value, isFrame) {
        var _this = this;
        if (isFrame === void 0) { isFrame = false; }
        if (isFrame) {
            this.animations.forEach(function (animation) {
                animation.currentTime = (value / _this.fps()) * 1000;
            });
        }
        else {
            this.animations.forEach(function (animation) {
                animation.currentTime = value * 1000;
            });
        }
    };
    /**
     * @see https://github.com/airbnb/lottie-web#stop
     */
    LottieAnimation.prototype.stop = function () {
        this.animations.forEach(function (animation) {
            animation.finish();
        });
    };
    /**
     * 1 is normal speed.
     * @see https://github.com/airbnb/lottie-web#setspeedspeed
     */
    LottieAnimation.prototype.setSpeed = function (speed) {
        var _this = this;
        this.animations.forEach(function (animation) {
            animation.playbackRate = speed * _this.direction;
        });
    };
    /**
     * 1 is forward, -1 is reverse.
     * @see https://github.com/airbnb/lottie-web#setdirectiondirection
     */
    LottieAnimation.prototype.setDirection = function (direction) {
        this.direction = direction;
        this.animations.forEach(function (animation) {
            animation.playbackRate *= direction;
        });
    };
    return LottieAnimation;
}());

/**
 * borrow from https://github.com/airbnb/lottie-web/blob/master/player/js/utils/DataManager.js#L40-L493
 */
function completeLayers(layers, comps) {
    var layerData;
    var i;
    var len = layers.length;
    var j;
    var jLen;
    var k;
    var kLen;
    for (i = 0; i < len; i += 1) {
        layerData = layers[i];
        if ('ks' in layerData && !layerData.completed) {
            layerData.completed = true;
            if (layerData.tt) {
                layers[i - 1].td = layerData.tt;
            }
            if (layerData.hasMask) {
                var maskProps = layerData.masksProperties;
                jLen = maskProps.length;
                for (j = 0; j < jLen; j += 1) {
                    if (maskProps[j].pt.k.i) {
                        convertPathsToAbsoluteValues(maskProps[j].pt.k);
                    }
                    else {
                        kLen = maskProps[j].pt.k.length;
                        for (k = 0; k < kLen; k += 1) {
                            if (maskProps[j].pt.k[k].s) {
                                convertPathsToAbsoluteValues(maskProps[j].pt.k[k].s[0]);
                            }
                            if (maskProps[j].pt.k[k].e) {
                                convertPathsToAbsoluteValues(maskProps[j].pt.k[k].e[0]);
                            }
                        }
                    }
                }
            }
            if (layerData.ty === 0) {
                layerData.layers = findCompLayers(layerData.refId, comps);
                completeLayers(layerData.layers, comps);
            }
            else if (layerData.ty === 4) {
                completeShapes(layerData.shapes);
            }
            else if (layerData.ty === 5) {
                completeText(layerData);
            }
        }
    }
}
function completeChars(chars, assets) {
    if (chars) {
        var i = 0;
        var len = chars.length;
        for (i = 0; i < len; i += 1) {
            if (chars[i].t === 1) {
                // var compData = findComp(chars[i].data.refId, assets);
                chars[i].data.layers = findCompLayers(chars[i].data.refId, assets);
                // chars[i].data.ip = 0;
                // chars[i].data.op = 99999;
                // chars[i].data.st = 0;
                // chars[i].data.sr = 1;
                // chars[i].w = compData.w;
                // chars[i].data.ks = {
                //   a: { k: [0, 0, 0], a: 0 },
                //   p: { k: [0, -compData.h, 0], a: 0 },
                //   r: { k: 0, a: 0 },
                //   s: { k: [100, 100], a: 0 },
                //   o: { k: 100, a: 0 },
                // };
                completeLayers(chars[i].data.layers, assets);
            }
        }
    }
}
function findComp(id, comps) {
    var i = 0;
    var len = comps.length;
    while (i < len) {
        if (comps[i].id === id) {
            return comps[i];
        }
        i += 1;
    }
    return null;
}
function findCompLayers(id, comps) {
    var comp = findComp(id, comps);
    if (comp) {
        if (!comp.layers.__used) {
            comp.layers.__used = true;
            return comp.layers;
        }
        return JSON.parse(JSON.stringify(comp.layers));
    }
    return null;
}
function completeShapes(arr) {
    var i;
    var len = arr.length;
    var j;
    var jLen;
    for (i = len - 1; i >= 0; i -= 1) {
        if (arr[i].ty === 'sh') {
            if (arr[i].ks.k.i) {
                convertPathsToAbsoluteValues(arr[i].ks.k);
            }
            else {
                jLen = arr[i].ks.k.length;
                for (j = 0; j < jLen; j += 1) {
                    if (arr[i].ks.k[j].s) {
                        convertPathsToAbsoluteValues(arr[i].ks.k[j].s[0]);
                    }
                    if (arr[i].ks.k[j].e) {
                        convertPathsToAbsoluteValues(arr[i].ks.k[j].e[0]);
                    }
                }
            }
        }
        else if (arr[i].ty === 'gr') {
            completeShapes(arr[i].it);
        }
    }
}
function convertPathsToAbsoluteValues(path) {
    var i;
    var len = path.i.length;
    for (i = 0; i < len; i += 1) {
        path.i[i][0] += path.v[i][0];
        path.i[i][1] += path.v[i][1];
        path.o[i][0] += path.v[i][0];
        path.o[i][1] += path.v[i][1];
    }
}
function checkVersion(minimum, animVersionString) {
    var animVersion = animVersionString ? animVersionString.split('.') : [100, 100, 100];
    if (minimum[0] > animVersion[0]) {
        return true;
    }
    if (animVersion[0] > minimum[0]) {
        return false;
    }
    if (minimum[1] > animVersion[1]) {
        return true;
    }
    if (animVersion[1] > minimum[1]) {
        return false;
    }
    if (minimum[2] > animVersion[2]) {
        return true;
    }
    if (animVersion[2] > minimum[2]) {
        return false;
    }
    return null;
}
var checkText = (function () {
    var minimumVersion = [4, 4, 14];
    function updateTextLayer(textLayer) {
        var documentData = textLayer.t.d;
        textLayer.t.d = {
            k: [
                {
                    s: documentData,
                    t: 0,
                },
            ],
        };
    }
    function iterateLayers(layers) {
        var i;
        var len = layers.length;
        for (i = 0; i < len; i += 1) {
            if (layers[i].ty === 5) {
                updateTextLayer(layers[i]);
            }
        }
    }
    return function (animationData) {
        if (checkVersion(minimumVersion, animationData.v)) {
            iterateLayers(animationData.layers);
            if (animationData.assets) {
                var i = void 0;
                var len = animationData.assets.length;
                for (i = 0; i < len; i += 1) {
                    if (animationData.assets[i].layers) {
                        iterateLayers(animationData.assets[i].layers);
                    }
                }
            }
        }
    };
})();
var checkChars = (function () {
    var minimumVersion = [4, 7, 99];
    return function (animationData) {
        if (animationData.chars && !checkVersion(minimumVersion, animationData.v)) {
            var i = void 0;
            var len = animationData.chars.length;
            for (i = 0; i < len; i += 1) {
                var charData = animationData.chars[i];
                if (charData.data && charData.data.shapes) {
                    completeShapes(charData.data.shapes);
                    charData.data.ip = 0;
                    charData.data.op = 99999;
                    charData.data.st = 0;
                    charData.data.sr = 1;
                    charData.data.ks = {
                        p: { k: [0, 0], a: 0 },
                        s: { k: [100, 100], a: 0 },
                        a: { k: [0, 0], a: 0 },
                        r: { k: 0, a: 0 },
                        o: { k: 100, a: 0 },
                    };
                    if (!animationData.chars[i].t) {
                        charData.data.shapes.push({
                            ty: 'no',
                        });
                        charData.data.shapes[0].it.push({
                            p: { k: [0, 0], a: 0 },
                            s: { k: [100, 100], a: 0 },
                            a: { k: [0, 0], a: 0 },
                            r: { k: 0, a: 0 },
                            o: { k: 100, a: 0 },
                            sk: { k: 0, a: 0 },
                            sa: { k: 0, a: 0 },
                            ty: 'tr',
                        });
                    }
                }
            }
        }
    };
})();
var checkPathProperties = (function () {
    var minimumVersion = [5, 7, 15];
    function updateTextLayer(textLayer) {
        var pathData = textLayer.t.p;
        if (typeof pathData.a === 'number') {
            pathData.a = {
                a: 0,
                k: pathData.a,
            };
        }
        if (typeof pathData.p === 'number') {
            pathData.p = {
                a: 0,
                k: pathData.p,
            };
        }
        if (typeof pathData.r === 'number') {
            pathData.r = {
                a: 0,
                k: pathData.r,
            };
        }
    }
    function iterateLayers(layers) {
        var i;
        var len = layers.length;
        for (i = 0; i < len; i += 1) {
            if (layers[i].ty === 5) {
                updateTextLayer(layers[i]);
            }
        }
    }
    return function (animationData) {
        if (checkVersion(minimumVersion, animationData.v)) {
            iterateLayers(animationData.layers);
            if (animationData.assets) {
                var i = void 0;
                var len = animationData.assets.length;
                for (i = 0; i < len; i += 1) {
                    if (animationData.assets[i].layers) {
                        iterateLayers(animationData.assets[i].layers);
                    }
                }
            }
        }
    };
})();
var checkColors = (function () {
    var minimumVersion = [4, 1, 9];
    function iterateShapes(shapes) {
        var i;
        var len = shapes.length;
        var j;
        var jLen;
        for (i = 0; i < len; i += 1) {
            if (shapes[i].ty === 'gr') {
                iterateShapes(shapes[i].it);
            }
            else if (shapes[i].ty === 'fl' || shapes[i].ty === 'st') {
                if (shapes[i].c.k && shapes[i].c.k[0].i) {
                    jLen = shapes[i].c.k.length;
                    for (j = 0; j < jLen; j += 1) {
                        if (shapes[i].c.k[j].s) {
                            shapes[i].c.k[j].s[0] /= 255;
                            shapes[i].c.k[j].s[1] /= 255;
                            shapes[i].c.k[j].s[2] /= 255;
                            shapes[i].c.k[j].s[3] /= 255;
                        }
                        if (shapes[i].c.k[j].e) {
                            shapes[i].c.k[j].e[0] /= 255;
                            shapes[i].c.k[j].e[1] /= 255;
                            shapes[i].c.k[j].e[2] /= 255;
                            shapes[i].c.k[j].e[3] /= 255;
                        }
                    }
                }
                else {
                    shapes[i].c.k[0] /= 255;
                    shapes[i].c.k[1] /= 255;
                    shapes[i].c.k[2] /= 255;
                    shapes[i].c.k[3] /= 255;
                }
            }
        }
    }
    function iterateLayers(layers) {
        var i;
        var len = layers.length;
        for (i = 0; i < len; i += 1) {
            if (layers[i].ty === 4) {
                iterateShapes(layers[i].shapes);
            }
        }
    }
    return function (animationData) {
        if (checkVersion(minimumVersion, animationData.v)) {
            iterateLayers(animationData.layers);
            if (animationData.assets) {
                var i = void 0;
                var len = animationData.assets.length;
                for (i = 0; i < len; i += 1) {
                    if (animationData.assets[i].layers) {
                        iterateLayers(animationData.assets[i].layers);
                    }
                }
            }
        }
    };
})();
var checkShapes = (function () {
    var minimumVersion = [4, 4, 18];
    function completeClosingShapes(arr) {
        var i;
        var len = arr.length;
        var j;
        var jLen;
        for (i = len - 1; i >= 0; i -= 1) {
            if (arr[i].ty === 'sh') {
                if (arr[i].ks.k.i) {
                    arr[i].ks.k.c = arr[i].closed;
                }
                else {
                    jLen = arr[i].ks.k.length;
                    for (j = 0; j < jLen; j += 1) {
                        if (arr[i].ks.k[j].s) {
                            arr[i].ks.k[j].s[0].c = arr[i].closed;
                        }
                        if (arr[i].ks.k[j].e) {
                            arr[i].ks.k[j].e[0].c = arr[i].closed;
                        }
                    }
                }
            }
            else if (arr[i].ty === 'gr') {
                completeClosingShapes(arr[i].it);
            }
        }
    }
    function iterateLayers(layers) {
        var layerData;
        var i;
        var len = layers.length;
        var j;
        var jLen;
        var k;
        var kLen;
        for (i = 0; i < len; i += 1) {
            layerData = layers[i];
            if (layerData.hasMask) {
                var maskProps = layerData.masksProperties;
                jLen = maskProps.length;
                for (j = 0; j < jLen; j += 1) {
                    if (maskProps[j].pt.k.i) {
                        maskProps[j].pt.k.c = maskProps[j].cl;
                    }
                    else {
                        kLen = maskProps[j].pt.k.length;
                        for (k = 0; k < kLen; k += 1) {
                            if (maskProps[j].pt.k[k].s) {
                                maskProps[j].pt.k[k].s[0].c = maskProps[j].cl;
                            }
                            if (maskProps[j].pt.k[k].e) {
                                maskProps[j].pt.k[k].e[0].c = maskProps[j].cl;
                            }
                        }
                    }
                }
            }
            if (layerData.ty === 4) {
                completeClosingShapes(layerData.shapes);
            }
        }
    }
    return function (animationData) {
        if (checkVersion(minimumVersion, animationData.v)) {
            iterateLayers(animationData.layers);
            if (animationData.assets) {
                var i = void 0;
                var len = animationData.assets.length;
                for (i = 0; i < len; i += 1) {
                    if (animationData.assets[i].layers) {
                        iterateLayers(animationData.assets[i].layers);
                    }
                }
            }
        }
    };
})();
function completeData(animationData) {
    if (animationData.__complete) {
        return;
    }
    checkColors(animationData);
    checkText(animationData);
    checkChars(animationData);
    checkPathProperties(animationData);
    checkShapes(animationData);
    completeLayers(animationData.layers, animationData.assets);
    completeChars(animationData.chars, animationData.assets);
    animationData.__complete = true;
}
function completeText(data) {
    if (data.t.a.length === 0 && !('m' in data.t.p)) ;
}

/**
 * https://lottiefiles.github.io/lottie-docs/constants/
 */
var BlendMode;
(function (BlendMode) {
    BlendMode[BlendMode["Normal"] = 0] = "Normal";
    BlendMode[BlendMode["Multiply"] = 1] = "Multiply";
    BlendMode[BlendMode["Screen"] = 2] = "Screen";
    BlendMode[BlendMode["Overlay"] = 3] = "Overlay";
    BlendMode[BlendMode["Darken"] = 4] = "Darken";
    BlendMode[BlendMode["Lighten"] = 5] = "Lighten";
    BlendMode[BlendMode["ColorDodge"] = 6] = "ColorDodge";
    BlendMode[BlendMode["ColorBurn"] = 7] = "ColorBurn";
    BlendMode[BlendMode["HardLight"] = 8] = "HardLight";
    BlendMode[BlendMode["SoftLight"] = 9] = "SoftLight";
    BlendMode[BlendMode["Difference"] = 10] = "Difference";
    BlendMode[BlendMode["Exclusion"] = 11] = "Exclusion";
    BlendMode[BlendMode["Hue"] = 12] = "Hue";
    BlendMode[BlendMode["Saturation"] = 13] = "Saturation";
    BlendMode[BlendMode["Color"] = 14] = "Color";
    BlendMode[BlendMode["Luminosity"] = 15] = "Luminosity";
    BlendMode[BlendMode["Add"] = 16] = "Add";
    BlendMode[BlendMode["HardMix"] = 17] = "HardMix";
})(BlendMode || (BlendMode = {}));
/**
 * @see https://lottiefiles.github.io/lottie-docs/constants/#mattemode
 */
var MatteMode;
(function (MatteMode) {
    MatteMode[MatteMode["Normal"] = 0] = "Normal";
    MatteMode[MatteMode["Alpha"] = 1] = "Alpha";
    MatteMode[MatteMode["InvertedAlpha"] = 2] = "InvertedAlpha";
    MatteMode[MatteMode["Luma"] = 3] = "Luma";
    MatteMode[MatteMode["InvertedLuma"] = 4] = "InvertedLuma";
})(MatteMode || (MatteMode = {}));
var Layer3DMode;
(function (Layer3DMode) {
    Layer3DMode[Layer3DMode["Off"] = 0] = "Off";
    Layer3DMode[Layer3DMode["On"] = 1] = "On";
})(Layer3DMode || (Layer3DMode = {}));
var AutoOrientMode;
(function (AutoOrientMode) {
    AutoOrientMode[AutoOrientMode["Off"] = 0] = "Off";
    AutoOrientMode[AutoOrientMode["On"] = 1] = "On";
})(AutoOrientMode || (AutoOrientMode = {}));
var EffectValueType;
(function (EffectValueType) {
    EffectValueType[EffectValueType["Number"] = 0] = "Number";
    EffectValueType[EffectValueType["Color"] = 2] = "Color";
    EffectValueType[EffectValueType["MultiDimensional"] = 3] = "MultiDimensional";
    EffectValueType[EffectValueType["Boolean"] = 7] = "Boolean";
})(EffectValueType || (EffectValueType = {}));
var EffectType;
(function (EffectType) {
    EffectType[EffectType["Transform"] = 5] = "Transform";
    EffectType[EffectType["DropShadow"] = 25] = "DropShadow";
})(EffectType || (EffectType = {}));
var MaskMode;
(function (MaskMode) {
    MaskMode["No"] = "n";
    MaskMode["Add"] = "a";
    MaskMode["Subtract"] = "s";
    MaskMode["Intersect"] = "i";
    MaskMode["Lighten"] = "l";
    MaskMode["Darken"] = "d";
    MaskMode["Difference"] = "f";
})(MaskMode || (MaskMode = {}));
var LayerType;
(function (LayerType) {
    LayerType[LayerType["precomp"] = 0] = "precomp";
    LayerType[LayerType["solid"] = 1] = "solid";
    LayerType[LayerType["image"] = 2] = "image";
    LayerType[LayerType["null"] = 3] = "null";
    LayerType[LayerType["shape"] = 4] = "shape";
    LayerType[LayerType["text"] = 5] = "text";
    LayerType[LayerType["audio"] = 6] = "audio";
    LayerType[LayerType["pholderVideo"] = 7] = "pholderVideo";
    LayerType[LayerType["imageSeq"] = 8] = "imageSeq";
    LayerType[LayerType["video"] = 9] = "video";
    LayerType[LayerType["pholderStill"] = 10] = "pholderStill";
    LayerType[LayerType["guide"] = 11] = "guide";
    LayerType[LayerType["adjustment"] = 12] = "adjustment";
    LayerType[LayerType["camera"] = 13] = "camera";
    LayerType[LayerType["light"] = 14] = "light";
    LayerType[LayerType["data"] = 15] = "data";
})(LayerType || (LayerType = {}));
var TextJustify;
(function (TextJustify) {
    TextJustify[TextJustify["Left"] = 0] = "Left";
    TextJustify[TextJustify["Right"] = 1] = "Right";
    TextJustify[TextJustify["Center"] = 2] = "Center";
})(TextJustify || (TextJustify = {}));
var VerticalJustify;
(function (VerticalJustify) {
    VerticalJustify[VerticalJustify["Top"] = 0] = "Top";
    VerticalJustify[VerticalJustify["Center"] = 1] = "Center";
    VerticalJustify[VerticalJustify["Bottom"] = 2] = "Bottom";
})(VerticalJustify || (VerticalJustify = {}));
var RangeSelectorDomain;
(function (RangeSelectorDomain) {
    RangeSelectorDomain[RangeSelectorDomain["Characters"] = 1] = "Characters";
    RangeSelectorDomain[RangeSelectorDomain["CharactersExcludingSpaces"] = 2] = "CharactersExcludingSpaces";
    RangeSelectorDomain[RangeSelectorDomain["Words"] = 3] = "Words";
    RangeSelectorDomain[RangeSelectorDomain["Lines"] = 4] = "Lines";
})(RangeSelectorDomain || (RangeSelectorDomain = {}));
var RangeSelectorShape;
(function (RangeSelectorShape) {
    RangeSelectorShape[RangeSelectorShape["Square"] = 1] = "Square";
    RangeSelectorShape[RangeSelectorShape["RampUp"] = 2] = "RampUp";
    RangeSelectorShape[RangeSelectorShape["RampDown"] = 3] = "RampDown";
    RangeSelectorShape[RangeSelectorShape["Triangle"] = 4] = "Triangle";
    RangeSelectorShape[RangeSelectorShape["Round"] = 5] = "Round";
    RangeSelectorShape[RangeSelectorShape["Smooth"] = 6] = "Smooth";
})(RangeSelectorShape || (RangeSelectorShape = {}));
var RangeSelectorUnits;
(function (RangeSelectorUnits) {
    RangeSelectorUnits[RangeSelectorUnits["Percentage"] = 1] = "Percentage";
    RangeSelectorUnits[RangeSelectorUnits["Index"] = 2] = "Index";
})(RangeSelectorUnits || (RangeSelectorUnits = {}));
var RangeSelectorMode;
(function (RangeSelectorMode) {
    RangeSelectorMode[RangeSelectorMode["Add"] = 1] = "Add";
    RangeSelectorMode[RangeSelectorMode["Subtract"] = 2] = "Subtract";
    RangeSelectorMode[RangeSelectorMode["Intersect"] = 3] = "Intersect";
    RangeSelectorMode[RangeSelectorMode["Min"] = 4] = "Min";
    RangeSelectorMode[RangeSelectorMode["Max"] = 5] = "Max";
    RangeSelectorMode[RangeSelectorMode["Difference"] = 6] = "Difference";
})(RangeSelectorMode || (RangeSelectorMode = {}));
/**
 * @see https://lottiefiles.github.io/lottie-docs/shapes/#shape-types
 */
var ShapeType;
(function (ShapeType) {
    ShapeType["Rectangle"] = "rc";
    ShapeType["Ellipse"] = "el";
    ShapeType["PolyStar"] = "sr";
    ShapeType["Path"] = "sh";
    ShapeType["Fill"] = "fl";
    ShapeType["Stroke"] = "st";
    ShapeType["GradientFill"] = "gf";
    ShapeType["GradientStroke"] = "gs";
    ShapeType["NoStyle"] = "no";
    ShapeType["Group"] = "gr";
    ShapeType["Transform"] = "tr";
    ShapeType["Repeater"] = "rp";
    ShapeType["Trim"] = "tm";
    ShapeType["RoundedCorners"] = "rd";
    ShapeType["PuckerOrBloat"] = "pb";
    ShapeType["Merge"] = "mm";
    ShapeType["Twist"] = "tw";
    ShapeType["OffsetPath"] = "op";
    ShapeType["ZigZag"] = "zz";
})(ShapeType || (ShapeType = {}));
/**
 * @see https://lottiefiles.github.io/lottie-docs/constants/#fillrule
 */
var FillRule;
(function (FillRule) {
    FillRule[FillRule["NonZero"] = 1] = "NonZero";
    FillRule[FillRule["EvenOdd"] = 2] = "EvenOdd";
})(FillRule || (FillRule = {}));
/**
 * @see https://lottiefiles.github.io/lottie-docs/constants/#linejoin
 */
var LineJoin;
(function (LineJoin) {
    LineJoin[LineJoin["Miter"] = 1] = "Miter";
    LineJoin[LineJoin["Round"] = 2] = "Round";
    LineJoin[LineJoin["Bevel"] = 3] = "Bevel";
})(LineJoin || (LineJoin = {}));
/**
 * @see https://lottiefiles.github.io/lottie-docs/constants/#linecap
 */
var LineCap;
(function (LineCap) {
    LineCap[LineCap["Butt"] = 1] = "Butt";
    LineCap[LineCap["Round"] = 2] = "Round";
    LineCap[LineCap["Square"] = 3] = "Square";
})(LineCap || (LineCap = {}));
/**
 * @see https://lottiefiles.github.io/lottie-docs/constants/#gradienttype
 */
var GradientType;
(function (GradientType) {
    GradientType[GradientType["Linear"] = 1] = "Linear";
    GradientType[GradientType["Radial"] = 2] = "Radial";
})(GradientType || (GradientType = {}));
var FontPathOrigin;
(function (FontPathOrigin) {
    FontPathOrigin[FontPathOrigin["CssUrl"] = 1] = "CssUrl";
    FontPathOrigin[FontPathOrigin["ScriptUrl"] = 2] = "ScriptUrl";
    FontPathOrigin[FontPathOrigin["FontUrl"] = 3] = "FontUrl";
})(FontPathOrigin || (FontPathOrigin = {}));

var ParseContext = /** @class */ (function () {
    function ParseContext() {
        this.frameTime = 1000 / 30;
        this.startFrame = 0;
        this.autoplay = false;
        this.fill = 'auto';
        this.iterations = 0;
        this.assetsMap = new Map();
    }
    return ParseContext;
}());
function isNumberArray(val) {
    return Array.isArray(val) && typeof val[0] === 'number';
}
function isMultiDimensionalValue(val) {
    return isNumberArray(val === null || val === void 0 ? void 0 : val.k);
}
function isMultiDimensionalKeyframedValue(val) {
    var k = val === null || val === void 0 ? void 0 : val.k;
    return Array.isArray(k) && k[0].t !== undefined && isNumberArray(k[0].s);
}
function isValue(val) {
    // TODO is [100] sort of value?
    return typeof (val === null || val === void 0 ? void 0 : val.k) === 'number';
}
function isKeyframedValue(val) {
    var k = val === null || val === void 0 ? void 0 : val.k;
    return Array.isArray(k) && k[0].t !== undefined && typeof k[0].s === 'number';
}
function toColorString(val) {
    var opacity = getMultiDimensionValue(val, 3);
    return "rgba(".concat([
        Math.round(getMultiDimensionValue(val, 0) * 255),
        Math.round(getMultiDimensionValue(val, 1) * 255),
        Math.round(getMultiDimensionValue(val, 2) * 255),
        !util.isNil(opacity) ? opacity : 1,
    ].join(','), ")");
}
function getMultiDimensionValue(val, dimIndex) {
    return val != null
        ? typeof val === 'number'
            ? val
            : val[dimIndex || 0]
        : NaN;
}
/**
 * @see https://lottiefiles.github.io/lottie-docs/concepts/#easing-handles
 */
function getMultiDimensionEasingBezierString(kf, nextKf, dimIndex) {
    var _a, _b, _c, _d;
    var bezierEasing = [];
    bezierEasing.push((((_a = kf.o) === null || _a === void 0 ? void 0 : _a.x) &&
        (getMultiDimensionValue(kf.o.x, dimIndex) ||
            getMultiDimensionValue(kf.o.x, 0))) ||
        0, (((_b = kf.o) === null || _b === void 0 ? void 0 : _b.y) &&
        (getMultiDimensionValue(kf.o.y, dimIndex) ||
            getMultiDimensionValue(kf.o.y, 0))) ||
        0, (((_c = kf.i) === null || _c === void 0 ? void 0 : _c.x) &&
        (getMultiDimensionValue(kf.i.x, dimIndex) ||
            getMultiDimensionValue(kf.i.x, 0))) ||
        1, (((_d = kf.i) === null || _d === void 0 ? void 0 : _d.y) &&
        (getMultiDimensionValue(kf.i.y, dimIndex) ||
            getMultiDimensionValue(kf.i.y, 0))) ||
        1);
    // linear by default
    if (!(bezierEasing[0] === 0 &&
        bezierEasing[1] === 0 &&
        bezierEasing[2] === 1 &&
        bezierEasing[3] === 1)) {
        return "cubic-bezier(".concat(bezierEasing.join(','), ")");
    }
    return;
}
/**
 * @see https://lottiefiles.github.io/lottie-docs/concepts/#keyframe
 */
function parseKeyframe(kfs, bezierEasingDimIndex, context, setVal) {
    var kfsLen = kfs.length;
    // const offset = context.layerStartTime;
    var duration = context.endFrame - context.startFrame;
    var out = {
        duration: 0,
        delay: 0,
        keyframes: [],
    };
    var prevKf;
    for (var i = 0; i < kfsLen; i++) {
        var kf = kfs[i];
        var nextKf = kfs[i + 1];
        // If h is present and it's 1, you don't need i and o,
        // as the property will keep the same value until the next keyframe.
        var isDiscrete = kf.h === 1;
        var offset = (kf.t + context.layerOffsetTime - context.startFrame) / duration;
        var outKeyframe = {
            offset: offset,
        };
        if (!isDiscrete) {
            outKeyframe.easing = getMultiDimensionEasingBezierString(kf, nextKf, bezierEasingDimIndex);
        }
        // Use end state of later frame if start state not exits.
        // @see https://lottiefiles.github.io/lottie-docs/concepts/#old-lottie-keyframes
        var startVal = kf.s || (prevKf === null || prevKf === void 0 ? void 0 : prevKf.e);
        if (startVal) {
            setVal(outKeyframe, startVal);
        }
        if (outKeyframe.offset > 0 && i === 0) {
            // Set initial
            var initialKeyframe = {
                offset: 0,
            };
            if (startVal) {
                setVal(initialKeyframe, startVal);
            }
            out.keyframes.push(initialKeyframe);
        }
        out.keyframes.push(outKeyframe);
        if (isDiscrete && nextKf) {
            // Use two keyframe to simulate the discrete animation.
            var extraKeyframe = {
                offset: Math.max((nextKf.t + context.layerOffsetTime - context.startFrame) / duration, 0),
            };
            setVal(extraKeyframe, startVal);
            out.keyframes.push(extraKeyframe);
        }
        prevKf = kf;
    }
    if (kfsLen) {
        out.duration = context.frameTime * duration;
    }
    return out;
}
function parseOffsetKeyframe(kfs, targetPropName, propNames, keyframeAnimations, context, convertVal) {
    var _loop_1 = function (dimIndex) {
        var propName = propNames[dimIndex];
        var keyframeAnim = parseKeyframe(kfs, dimIndex, context, function (outKeyframe, startVal) {
            var val = getMultiDimensionValue(startVal, dimIndex);
            if (convertVal) {
                val = convertVal(val);
            }
            (targetPropName
                ? (outKeyframe[targetPropName] = {})
                : outKeyframe)[propName] = val;
        });
        // moving position around a curved path
        var needOffsetPath = kfs.some(function (kf) { return kf.ti && kf.to; });
        if (needOffsetPath) {
            var offsetPath_1 = [];
            kfs.forEach(function (kf, i) {
                keyframeAnim.keyframes[i].offsetPath = offsetPath_1;
                // convert to & ti(Tangent for values (eg: moving position around a curved path)) to offsetPath & offsetDistance
                // @see https://lottiefiles.github.io/lottie-docs/concepts/#animated-position
                if (kf.ti && kf.to) {
                    if (i === 0) {
                        offsetPath_1.push(['M', kf.s[0], kf.s[1]]);
                    }
                    keyframeAnim.keyframes[i].segmentLength = util.getTotalLength(offsetPath_1);
                    // @see https://lottiefiles.github.io/lottie-docs/concepts/#bezier
                    // The nth bezier segment is defined as:
                    // v[n], v[n]+o[n], v[n+1]+i[n+1], v[n+1]
                    offsetPath_1.push([
                        'C',
                        kf.s[0] + kf.to[0],
                        kf.s[1] + kf.to[1],
                        kf.s[0] + kf.ti[0],
                        kf.s[1] + kf.ti[1],
                        kf.e[0],
                        kf.e[1],
                    ]);
                }
            });
            // calculate offsetDistance: segmentLength / totalLength
            var totalLength_1 = util.getTotalLength(offsetPath_1);
            keyframeAnim.keyframes.forEach(function (kf) {
                kf.offsetDistance = util.isNil(kf.segmentLength)
                    ? 1
                    : kf.segmentLength / totalLength_1;
                delete kf.segmentLength;
            });
        }
        if (keyframeAnim.keyframes.length) {
            keyframeAnimations.push(keyframeAnim);
        }
    };
    for (var dimIndex = 0; dimIndex < propNames.length; dimIndex++) {
        _loop_1(dimIndex);
    }
}
function parseColorOffsetKeyframe(kfs, targetPropName, propName, keyframeAnimations, context) {
    var keyframeAnim = parseKeyframe(kfs, 0, context, function (outKeyframe, startVal) {
        (targetPropName
            ? (outKeyframe[targetPropName] = {})
            : outKeyframe)[propName] = toColorString(startVal);
    });
    if (keyframeAnim.keyframes.length) {
        keyframeAnimations.push(keyframeAnim);
    }
}
function parseValue(lottieVal, attrs, targetPropName, propNames, animations, context, convertVal) {
    if (targetPropName) {
        attrs[targetPropName] = attrs[targetPropName] || {};
    }
    var target = targetPropName ? attrs[targetPropName] : attrs;
    if (isValue(lottieVal)) {
        var val = lottieVal.k;
        target[propNames[0]] = convertVal ? convertVal(val) : val;
    }
    else if (isKeyframedValue(lottieVal)) {
        parseOffsetKeyframe(lottieVal.k, targetPropName, propNames, animations, context, convertVal);
    }
    else if (isMultiDimensionalValue(lottieVal)) {
        for (var i = 0; i < propNames.length; i++) {
            var val = getMultiDimensionValue(lottieVal.k, i);
            target[propNames[i]] = convertVal ? convertVal(val) : val;
        }
    }
    else if (isMultiDimensionalKeyframedValue(lottieVal)) {
        // TODO Merge dimensions
        parseOffsetKeyframe(lottieVal.k, targetPropName, propNames, animations, context, convertVal);
    }
}
/**
 * @see https://lottiefiles.github.io/lottie-docs/concepts/#transform
 */
function parseTransforms(ks, attrs, animations, context, targetProp, transformProps) {
    if (targetProp === void 0) { targetProp = ''; }
    if (transformProps === void 0) { transformProps = {
        x: 'x',
        y: 'y',
        rotation: 'rotation',
        scaleX: 'scaleX',
        scaleY: 'scaleY',
        anchorX: 'anchorX',
        anchorY: 'anchorY',
        skew: 'skew',
        skewAxis: 'skewAxis',
    }; }
    // @see https://lottiefiles.github.io/lottie-docs/concepts/#split-vector
    if (ks.p.s) {
        parseValue(ks.p.x, attrs, targetProp, [transformProps.x], animations, context);
        parseValue(ks.p.y, attrs, targetProp, [transformProps.y], animations, context);
    }
    else {
        parseValue(ks.p, attrs, targetProp, [transformProps.x, transformProps.y], animations, context);
    }
    parseValue(ks.s, attrs, targetProp, [transformProps.scaleX, transformProps.scaleY], animations, context, function (val) { return val / 100; });
    parseValue(ks.r, attrs, targetProp, [transformProps.rotation], animations, context);
    parseValue(ks.a, attrs, targetProp, [transformProps.anchorX, transformProps.anchorY], animations, context);
    parseValue(ks.sk, attrs, targetProp, [transformProps.skew], animations, context);
    parseValue(ks.sa, attrs, targetProp, [transformProps.skewAxis], animations, context);
}
function isGradientFillOrStroke(fl) {
    return fl.g && fl.s && fl.e;
}
function convertColorStops(arr, count) {
    var colorStops = [];
    for (var i = 0; i < count * 4;) {
        var offset = arr[i++];
        var r = Math.round(arr[i++] * 255);
        var g = Math.round(arr[i++] * 255);
        var b = Math.round(arr[i++] * 255);
        colorStops.push({
            offset: offset,
            color: "rgb(".concat(r, ", ").concat(g, ", ").concat(b, ")"),
        });
    }
    return colorStops;
}
function joinColorStops(colorStops) {
    return "".concat(colorStops
        .map(function (_a) {
        var offset = _a.offset, color = _a.color;
        return "".concat(color, " ").concat(offset * 100, "%");
    })
        .join(', '));
}
/**
 * TODO:
 * * Transition
 * * Highlight length & angle in Radial Gradient
 *
 * @see https://lottiefiles.github.io/lottie-docs/concepts/#gradients
 * @see https://lottiefiles.github.io/lottie-docs/shapes/#gradients
 */
function parseGradient(shape) {
    var colorArr = shape.g.k.k;
    var colorStops = convertColorStops(colorArr, shape.g.p);
    // @see https://lottiefiles.github.io/lottie-docs/constants/#gradienttype
    if (shape.t === GradientType.Linear) {
        var angle = gLite.rad2deg(Math.atan2(shape.e.k[1] - shape.s.k[1], shape.e.k[0] - shape.s.k[0]));
        // @see https://g-next.antv.vision/zh/docs/api/css/css-properties-values-api#linear-gradient
        return "linear-gradient(".concat(angle, "deg, ").concat(joinColorStops(colorStops), ")");
    }
    else if (shape.t === GradientType.Radial) {
        // TODO: highlight length & angle (h & a)
        // Highlight Length, as a percentage between s and e
        // Highlight Angle, relative to the direction from s to e
        var size = util.distanceSquareRoot(shape.e.k, shape.s.k);
        // @see https://g-next.antv.vision/zh/docs/api/css/css-properties-values-api#radial-gradient
        return "radial-gradient(circle ".concat(size, "px at ").concat(shape.s.k[0], "px ").concat(shape.s.k[1], "px, ").concat(joinColorStops(colorStops), ")");
    }
    else {
        // Invalid gradient
        return '#000';
    }
}
function parseFill(fl, attrs, animations, context) {
    attrs.style = attrs.style || {};
    // Color
    if (isGradientFillOrStroke(fl)) {
        attrs.style.fill = parseGradient(fl);
    }
    else {
        if (isMultiDimensionalValue(fl.c)) {
            attrs.style.fill = toColorString(fl.c.k);
        }
        else if (isMultiDimensionalKeyframedValue(fl.c)) {
            parseColorOffsetKeyframe(fl.c.k, 'style', 'fill', animations, context);
        }
    }
    // FillRule @see https://lottiefiles.github.io/lottie-docs/constants/#fillrule
    attrs.style.fillRule =
        fl.r === FillRule.EvenOdd ? 'evenodd' : 'nonzero';
    // Opacity
    parseValue(fl.o, attrs, 'style', ['fillOpacity'], animations, context, function (opacity) { return opacity / 100; });
}
function parseStroke(st, attrs, animations, context) {
    attrs.style = attrs.style || {};
    // Color
    if (isGradientFillOrStroke(st)) {
        attrs.style.stroke = parseGradient(st);
    }
    else {
        if (isMultiDimensionalValue(st.c)) {
            attrs.style.stroke = toColorString(st.c.k);
        }
        else if (isMultiDimensionalKeyframedValue(st.c)) {
            parseColorOffsetKeyframe(st.c.k, 'style', 'stroke', animations, context);
        }
    }
    // Opacity
    parseValue(st.o, attrs, 'style', ['strokeOpacity'], animations, context, function (opacity) { return opacity / 100; });
    // Line width
    parseValue(st.w, attrs, 'style', ['lineWidth'], animations, context);
    switch (st.lj) {
        case LineJoin.Bevel:
            attrs.style.lineJoin = 'bevel';
            break;
        case LineJoin.Round:
            attrs.style.lineJoin = 'round';
            break;
        case LineJoin.Miter:
            attrs.style.lineJoin = 'miter';
            break;
    }
    switch (st.lc) {
        case LineCap.Butt:
            attrs.style.lineCap = 'butt';
            break;
        case LineCap.Round:
            attrs.style.lineCap = 'round';
            break;
        case LineCap.Square:
            attrs.style.lineCap = 'square';
            break;
    }
    // Line dash
    var dashArray = [];
    var dashOffset = 0;
    if (st.d) {
        st.d.forEach(function (item) {
            if (item.n !== 'o') {
                dashArray.push(item.v.k);
            }
            else {
                dashOffset = item.v.k;
            }
        });
        attrs.style.lineDash = dashArray;
        attrs.style.lineDashOffset = dashOffset;
    }
}
function isBezier(k) {
    return k && k.i && k.o && k.v;
}
/**
 * @see https://lottiefiles.github.io/lottie-docs/shapes/#path
 */
function parseShapePaths(shape, animations, context) {
    var attrs = {
        type: gLite.Shape.PATH,
        // Should have no fill and stroke by default
        style: {
            fill: 'none',
            stroke: 'none',
        },
    };
    // @see https://lottiefiles.github.io/lottie-docs/concepts/#bezier
    if (isBezier(shape.ks.k)) {
        attrs.shape = {
            in: shape.ks.k.i,
            out: shape.ks.k.o,
            v: shape.ks.k.v,
            close: shape.ks.k.c,
        };
    }
    else if (Array.isArray(shape.ks.k)) {
        var keyframeAnim = parseKeyframe(shape.ks.k, 0, context, function (outKeyframe, startVal) {
            outKeyframe.shape = {
                in: startVal[0].i,
                out: startVal[0].o,
                v: startVal[0].v,
                close: startVal[0].c,
            };
        });
        if (keyframeAnim.keyframes.length) {
            animations.push(keyframeAnim);
        }
    }
    return attrs;
}
/**
 * @see https://lottiefiles.github.io/lottie-docs/shapes/#rectangle
 */
function parseShapeRect(shape, animations, context) {
    var attrs = {
        type: gLite.Shape.RECT,
        // Should have no fill and stroke by default
        style: {
            fill: 'none',
            stroke: 'none',
        },
        shape: {},
    };
    parseValue(shape.p, attrs, 'shape', ['x', 'y'], animations, context);
    parseValue(shape.s, attrs, 'shape', ['width', 'height'], animations, context);
    parseValue(shape.r, attrs, 'shape', ['r'], animations, context);
    return attrs;
}
/**
 * @see https://lottiefiles.github.io/lottie-docs/layers/#image-layer
 */
function parseImageLayer(layer, context) {
    var attrs = {
        type: gLite.Shape.IMAGE,
        style: {},
        shape: {
            width: 0,
            height: 0,
            src: '',
        },
    };
    var asset = context.assetsMap.get(layer.refId);
    if (asset) {
        attrs.shape.width = asset.w;
        attrs.shape.height = asset.h;
        // TODO: url to fetch
        attrs.shape.src = asset.p;
    }
    return attrs;
}
/**
 * @see https://lottiefiles.github.io/lottie-docs/shapes/#ellipse
 */
function parseShapeEllipse(shape, animations, context) {
    var attrs = {
        type: gLite.Shape.ELLIPSE,
        // Should have no fill and stroke by default
        style: {
            fill: 'none',
            stroke: 'none',
        },
        shape: {},
    };
    parseValue(shape.p, attrs, 'shape', ['cx', 'cy'], animations, context);
    parseValue(shape.s, attrs, 'shape', ['rx', 'ry'], animations, context, function (val) { return val / 2; });
    return attrs;
}
function parseShapeLayer(layer, context) {
    function tryCreateShape(shape, keyframeAnimations) {
        var ecEl;
        // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
        switch (shape.ty) {
            case ShapeType.Path:
                ecEl = parseShapePaths(shape, keyframeAnimations, context);
                break;
            case ShapeType.Ellipse:
                ecEl = parseShapeEllipse(shape, keyframeAnimations, context);
                break;
            case ShapeType.Rectangle:
                ecEl = parseShapeRect(shape, keyframeAnimations, context);
                break;
            case ShapeType.PolyStar:
                // TODO: parseShapePolyStar
                break;
        }
        return ecEl;
    }
    function parseModifiers(shapes, modifiers) {
        shapes.forEach(function (shape) {
            if (shape.hd) {
                return;
            }
            // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
            switch (shape.ty) {
                case ShapeType.Repeater:
                    parseValue(shape.c, modifiers.attrs, 'shape', ['repeat'], modifiers.keyframeAnimations, context);
                    parseTransforms(shape.tr, modifiers.attrs, modifiers.keyframeAnimations, context, 'shape', {
                        x: 'repeatX',
                        y: 'repeatY',
                        rotation: 'repeatRot',
                        scaleX: 'repeatScaleX',
                        scaleY: 'repeatScaleY',
                        anchorX: 'repeatAnchorX',
                        anchorY: 'repeatAnchorY',
                        skew: 'repeatSkew',
                        skewAxis: 'repeatSkewAxis',
                    });
                    break;
                case ShapeType.Trim:
                    parseValue(shape.s, modifiers.attrs, 'shape', ['trimStart'], modifiers.keyframeAnimations, context);
                    parseValue(shape.e, modifiers.attrs, 'shape', ['trimEnd'], modifiers.keyframeAnimations, context);
                    break;
            }
        });
    }
    function parseIterations(shapes, modifiers) {
        var ecEls = [];
        var attrs = {};
        var keyframeAnimations = [];
        // Order is reversed
        shapes = shapes.slice().reverse();
        // Modifiers first:
        parseModifiers(shapes, modifiers);
        shapes.forEach(function (shape) {
            if (shape.hd) {
                return;
            }
            var ecEl;
            switch (shape.ty) {
                case ShapeType.Group:
                    ecEl = {
                        type: gLite.Shape.GROUP,
                        children: parseIterations(shape.it, 
                        // Modifiers will be applied to all childrens.
                        modifiers),
                    };
                    break;
                // TODO Multiple fill and stroke
                case ShapeType.Fill:
                case ShapeType.GradientFill:
                    parseFill(shape, attrs, keyframeAnimations, context);
                    break;
                case ShapeType.Stroke:
                case ShapeType.GradientStroke:
                    parseStroke(shape, attrs, keyframeAnimations, context);
                    break;
                case ShapeType.Transform:
                    parseTransforms(shape, attrs, keyframeAnimations, context);
                    break;
                // TODO Multiple shapes.
                default:
                    ecEl = tryCreateShape(shape, keyframeAnimations);
            }
            if (ecEl) {
                ecEl.name = shape.nm;
                ecEls.push(ecEl);
            }
        });
        ecEls.forEach(function (el, idx) {
            // Apply modifiers first
            el = tslib.__assign(tslib.__assign(tslib.__assign({}, el), gLite.definedProps(modifiers.attrs)), attrs);
            if (keyframeAnimations.length || modifiers.keyframeAnimations.length) {
                el.keyframeAnimation = tslib.__spreadArray(tslib.__spreadArray([], tslib.__read(modifiers.keyframeAnimations), false), tslib.__read(keyframeAnimations), false);
            }
            ecEls[idx] = el;
        });
        return ecEls;
    }
    return {
        type: gLite.Shape.GROUP,
        children: parseIterations(layer.shapes, {
            attrs: {},
            keyframeAnimations: [],
        }),
    };
}
function traverse(el, cb) {
    var _a;
    cb(el);
    if (el.type === gLite.Shape.GROUP) {
        (_a = el.children) === null || _a === void 0 ? void 0 : _a.forEach(function (child) {
            traverse(child, cb);
        });
    }
}
function addLayerOpacity(layer, layerGroup, context) {
    var _a, _b;
    var opacityAttrs = {};
    var opacityAnimations = [];
    if ((_a = layer.ks) === null || _a === void 0 ? void 0 : _a.o) {
        parseValue(layer.ks.o, opacityAttrs, 'style', ['opacity'], opacityAnimations, context, function (val) { return val / 100; });
        if (((_b = opacityAttrs.style) === null || _b === void 0 ? void 0 : _b.opacity) || opacityAnimations.length) {
            // apply opacity to group's children
            traverse(layerGroup, function (el) {
                if (el.type !== gLite.Shape.GROUP && el.style) {
                    Object.assign(el.style, opacityAttrs.style);
                    if (opacityAnimations.length) {
                        el.keyframeAnimation = (el.keyframeAnimation || []).concat(opacityAnimations);
                    }
                }
            });
        }
    }
}
function parseSolidShape(layer) {
    return {
        type: gLite.Shape.RECT,
        shape: {
            x: 0,
            y: 0,
            width: layer.sw,
            height: layer.sh,
        },
        style: {
            fill: layer.sc,
        },
    };
}
function parseLayers(layers, context, precompLayerTl) {
    var elements = [];
    // Order is reversed
    layers = layers.slice().reverse();
    var layerIndexMap = new Map();
    var offsetTime = (precompLayerTl === null || precompLayerTl === void 0 ? void 0 : precompLayerTl.st) || 0;
    layers === null || layers === void 0 ? void 0 : layers.forEach(function (layer) {
        // Layer time is offseted by the precomp layer.
        var _a, _b;
        // Use the ip, op, st of ref from.
        var layerIp = offsetTime + layer.ip;
        var layerOp = offsetTime + layer.op;
        var layerSt = offsetTime + layer.st;
        context.layerOffsetTime = offsetTime;
        var layerGroup;
        // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
        switch (layer.ty) {
            case LayerType.shape:
                // @see https://lottiefiles.github.io/lottie-docs/layers/#shape-layer
                layerGroup = parseShapeLayer(layer, context);
                break;
            case LayerType.null:
                // @see https://lottiefiles.github.io/lottie-docs/layers/#null-layer
                layerGroup = {
                    type: gLite.Shape.GROUP,
                    children: [],
                };
                break;
            case LayerType.solid:
                // @see https://lottiefiles.github.io/lottie-docs/layers/#solid-color-layer
                layerGroup = {
                    type: gLite.Shape.GROUP,
                    children: [],
                };
                // Anything you can do with solid layers, you can do better with a shape layer and a rectangle shape
                // since none of this layer's own properties can be animated.
                if (layer.sc) {
                    layerGroup.children.push(parseSolidShape(layer));
                }
                break;
            case LayerType.precomp:
                // @see https://lottiefiles.github.io/lottie-docs/layers/#precomposition-layer
                layerGroup = {
                    type: gLite.Shape.GROUP,
                    children: parseLayers(((_a = context.assetsMap.get(layer.refId)) === null || _a === void 0 ? void 0 : _a.layers) || [], context, {
                        st: layerSt,
                    }),
                };
                break;
            case LayerType.text:
                // TODO: https://lottiefiles.github.io/lottie-docs/layers/#text-layer
                break;
            case LayerType.image:
                // TODO: https://lottiefiles.github.io/lottie-docs/layers/#image-layer
                layerGroup = layerGroup = {
                    type: gLite.Shape.GROUP,
                    children: [parseImageLayer(layer, context)],
                };
                break;
        }
        if (layerGroup) {
            var keyframeAnimations = [];
            var attrs = {
                name: layer.nm,
            };
            if (layer.ks) {
                parseTransforms(layer.ks, attrs, keyframeAnimations, context);
            }
            Object.assign(layerGroup, attrs);
            if (layer.ind != null) {
                layerIndexMap.set(layer.ind, layerGroup);
            }
            layerGroup.extra = {
                layerParent: layer.parent,
            };
            // Masks @see https://lottiefiles.github.io/lottie-docs/layers/#masks
            // @see https://lottie-animation-community.github.io/docs/specs/layers/common/#clipping-masks
            // TODO: not support alpha and other modes.
            // @see https://lottie-animation-community.github.io/docs/specs/properties/mask-mode-types/
            if (layer.hasMask && ((_b = layer.masksProperties) === null || _b === void 0 ? void 0 : _b.length)) {
                var maskKeyframeAnimations = [];
                // TODO: Only support one mask now.
                var attrs_1 = parseShapePaths({
                    ks: layer.masksProperties[0].pt,
                }, maskKeyframeAnimations, context);
                layerGroup.clipPath = tslib.__assign({ type: gLite.Shape.PATH }, attrs_1);
                if (maskKeyframeAnimations.length) {
                    layerGroup.clipPath.keyframeAnimation = maskKeyframeAnimations;
                }
            }
            addLayerOpacity(layer, layerGroup, context);
            // Update in and out animation.
            if (layerIp != null &&
                layerOp != null &&
                (layerIp > context.startFrame || layerOp < context.endFrame)) {
                var duration = context.endFrame - context.startFrame;
                var visibilityStartOffset = (layerIp - context.startFrame) / duration;
                var visibilityEndOffset = (layerOp - context.startFrame) / duration;
                layerGroup.visibilityStartOffset = visibilityStartOffset;
                layerGroup.visibilityEndOffset = visibilityEndOffset;
                layerGroup.visibilityFrame = duration;
            }
            if (keyframeAnimations.length) {
                layerGroup.keyframeAnimation = keyframeAnimations;
            }
            elements.push(layerGroup);
        }
    });
    // Build hierarchy
    return elements.filter(function (el) {
        var _a, _b;
        var parentLayer = layerIndexMap.get((_a = el.extra) === null || _a === void 0 ? void 0 : _a.layerParent);
        if (parentLayer) {
            (_b = parentLayer.children) === null || _b === void 0 ? void 0 : _b.push(el);
            return false;
        }
        return true;
    });
}
var DEFAULT_LOAD_ANIMATION_OPTIONS = {
    loop: true,
    autoplay: false,
    fill: 'both',
};
function parse(data, options) {
    var _a;
    completeData(data);
    var _b = tslib.__assign(tslib.__assign({}, DEFAULT_LOAD_ANIMATION_OPTIONS), options), loop = _b.loop, autoplay = _b.autoplay, fill = _b.fill;
    var context = new ParseContext();
    context.fps = data.fr || 30;
    context.frameTime = 1000 / context.fps;
    context.startFrame = data.ip;
    context.endFrame = data.op;
    context.version = data.v;
    context.autoplay = !!autoplay;
    context.fill = fill;
    context.iterations = util.isNumber(loop) ? loop : loop ? Infinity : 1;
    // @see https://lottiefiles.github.io/lottie-docs/assets/
    (_a = data.assets) === null || _a === void 0 ? void 0 : _a.forEach(function (asset) {
        context.assetsMap.set(asset.id, asset);
    });
    var elements = parseLayers(data.layers || [], context);
    return {
        width: data.w,
        height: data.h,
        elements: elements,
        context: context,
    };
}

/**
 * @see https://github.com/airbnb/lottie-web/wiki/loadAnimation-options
 * @see https://github.com/airbnb/lottie-web#other-loading-options
 */
function loadAnimation(data, options) {
    var _a = parse(data, options), width = _a.width, height = _a.height, elements = _a.elements, context = _a.context;
    return new LottieAnimation(width, height, elements, context);
}

exports.loadAnimation = loadAnimation;
//# sourceMappingURL=index.js.map

}, function(modId) {var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1729528802041);
})()
//miniprogram-npm-outsideDeps=["tslib","@antv/g-lite","@antv/util"]
//# sourceMappingURL=index.js.map