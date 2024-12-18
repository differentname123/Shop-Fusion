module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1731211820588, function(require, module, exports) {


var gLite = require('@antv/g-lite');
var tslib = require('tslib');
var util = require('@antv/util');

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/API/AnimationPlaybackEvent
 */
// @ts-ignore
var AnimationEvent = /** @class */ (function (_super) {
    tslib.__extends(AnimationEvent, _super);
    function AnimationEvent(manager, target, currentTime, timelineTime) {
        var _this = _super.call(this, manager) || this;
        _this.currentTime = currentTime;
        _this.timelineTime = timelineTime;
        // @ts-ignore
        _this.target = target;
        _this.type = 'finish';
        _this.bubbles = false;
        // @ts-ignore
        _this.currentTarget = target;
        _this.defaultPrevented = false;
        _this.eventPhase = _this.AT_TARGET;
        _this.timeStamp = Date.now();
        _this.currentTime = currentTime;
        _this.timelineTime = timelineTime;
        return _this;
    }
    return AnimationEvent;
}(gLite.FederatedEvent));

var sequenceNumber = 0;
/**
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Animation/Animation
 */
var Animation = /** @class */ (function () {
    function Animation(effect, timeline) {
        var _a;
        this.currentTimePending = false;
        /**
         * @see https://developer.mozilla.org/en-US/docs/Web/API/Animation/playState
         */
        // playState: AnimationPlayState;
        this._idle = true;
        this._paused = false;
        this._finishedFlag = true;
        /**
         * @see https://developer.mozilla.org/en-US/docs/Web/API/Animation/currentTime
         */
        this._currentTime = 0;
        this._playbackRate = 1;
        this._inTimeline = true;
        this.effect = effect;
        effect.animation = this;
        this.timeline = timeline;
        this.id = "".concat(sequenceNumber++);
        this._inEffect = !!this.effect.update(0);
        this._totalDuration = Number((_a = this.effect) === null || _a === void 0 ? void 0 : _a.getComputedTiming().endTime);
        this._holdTime = 0;
        this._paused = false;
        this.oldPlayState = 'idle';
        this.updatePromises();
    }
    Object.defineProperty(Animation.prototype, "pending", {
        // animation: InternalAnimation | null;
        /**
         * @see https://developer.mozilla.org/en-US/docs/Web/API/Animation/pending
         */
        get: function () {
            return ((this._startTime === null && !this._paused && this.playbackRate !== 0) ||
                this.currentTimePending);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Animation.prototype, "playState", {
        get: function () {
            if (this._idle)
                return 'idle';
            if (this._isFinished)
                return 'finished';
            if (this._paused)
                return 'paused';
            return 'running';
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Animation.prototype, "ready", {
        /**
         * @see https://developer.mozilla.org/en-US/docs/Web/API/Animation/ready
         * @example
          animation.pause();
          animation.ready.then(function() {
            // Displays 'running'
            alert(animation.playState);
          });
          animation.play();
         */
        get: function () {
            var _this = this;
            if (!this.readyPromise) {
                if (this.timeline.animationsWithPromises.indexOf(this) === -1) {
                    this.timeline.animationsWithPromises.push(this);
                }
                this.readyPromise = new Promise(function (resolve, reject) {
                    _this.resolveReadyPromise = function () {
                        resolve(_this);
                    };
                    _this.rejectReadyPromise = function () {
                        reject(new Error());
                    };
                });
                if (!this.pending) {
                    this.resolveReadyPromise();
                }
            }
            return this.readyPromise;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Animation.prototype, "finished", {
        /**
         * @see https://developer.mozilla.org/en-US/docs/Web/API/Animation/finished
         * @example
          Promise.all(
            elem.getAnimations().map(
              function(animation) {
                return animation.finished
              }
            )
          ).then(
            function() {
              return elem.remove();
            }
          );
         */
        get: function () {
            var _this = this;
            if (!this.finishedPromise) {
                if (this.timeline.animationsWithPromises.indexOf(this) === -1) {
                    this.timeline.animationsWithPromises.push(this);
                }
                this.finishedPromise = new Promise(function (resolve, reject) {
                    _this.resolveFinishedPromise = function () {
                        resolve(_this);
                    };
                    _this.rejectFinishedPromise = function () {
                        reject(new Error());
                    };
                });
                if (this.playState === 'finished') {
                    this.resolveFinishedPromise();
                }
            }
            return this.finishedPromise;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Animation.prototype, "currentTime", {
        get: function () {
            this.updatePromises();
            return this._idle || this.currentTimePending ? null : this._currentTime;
        },
        set: function (newTime) {
            var _a;
            newTime = Number(newTime);
            if (isNaN(newTime))
                return;
            this.timeline.restart();
            if (!this._paused && this._startTime !== null) {
                this._startTime =
                    Number((_a = this.timeline) === null || _a === void 0 ? void 0 : _a.currentTime) - newTime / this.playbackRate;
            }
            this.currentTimePending = false;
            if (this._currentTime === newTime) {
                return;
            }
            if (this._idle) {
                this._idle = false;
                this._paused = true;
            }
            this.tickCurrentTime(newTime, true);
            this.timeline.applyDirtiedAnimation(this);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Animation.prototype, "startTime", {
        get: function () {
            return this._startTime;
        },
        set: function (newTime) {
            if (newTime !== null) {
                this.updatePromises();
                newTime = Number(newTime);
                if (isNaN(newTime))
                    return;
                if (this._paused || this._idle)
                    return;
                this._startTime = newTime;
                this.tickCurrentTime((Number(this.timeline.currentTime) - this._startTime) *
                    this.playbackRate);
                this.timeline.applyDirtiedAnimation(this);
                this.updatePromises();
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Animation.prototype, "playbackRate", {
        get: function () {
            return this._playbackRate;
        },
        set: function (value) {
            if (value === this._playbackRate) {
                return;
            }
            this.updatePromises();
            var oldCurrentTime = this.currentTime;
            this._playbackRate = value;
            this.startTime = null;
            if (this.playState !== 'paused' && this.playState !== 'idle') {
                this._finishedFlag = false;
                this._idle = false;
                this.ensureAlive();
                this.timeline.applyDirtiedAnimation(this);
            }
            if (oldCurrentTime !== null) {
                this.currentTime = oldCurrentTime;
            }
            this.updatePromises();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Animation.prototype, "_isFinished", {
        get: function () {
            return (!this._idle &&
                ((this._playbackRate > 0 &&
                    Number(this._currentTime) >= this._totalDuration) ||
                    (this._playbackRate < 0 && Number(this._currentTime) <= 0)));
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Animation.prototype, "totalDuration", {
        get: function () {
            return this._totalDuration;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Animation.prototype, "_needsTick", {
        get: function () {
            return this.pending || this.playState === 'running' || !this._finishedFlag;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * state machine,
     * resolve/reject ready/finished Promise according to current state
     */
    Animation.prototype.updatePromises = function () {
        var oldPlayState = this.oldPlayState;
        var newPlayState = this.pending ? 'pending' : this.playState;
        if (this.readyPromise && newPlayState !== oldPlayState) {
            if (newPlayState === 'idle') {
                this.rejectReadyPromise();
                this.readyPromise = undefined;
            }
            else if (oldPlayState === 'pending') {
                this.resolveReadyPromise();
            }
            else if (newPlayState === 'pending') {
                this.readyPromise = undefined;
            }
        }
        if (this.finishedPromise && newPlayState !== oldPlayState) {
            if (newPlayState === 'idle') {
                this.rejectFinishedPromise();
                this.finishedPromise = undefined;
            }
            else if (newPlayState === 'finished') {
                this.resolveFinishedPromise();
            }
            else if (oldPlayState === 'finished') {
                this.finishedPromise = undefined;
            }
        }
        this.oldPlayState = newPlayState;
        return this.readyPromise || this.finishedPromise;
    };
    Animation.prototype.play = function () {
        this.updatePromises();
        this._paused = false;
        if (this._isFinished || this._idle) {
            this.rewind();
            this._startTime = null;
        }
        this._finishedFlag = false;
        this._idle = false;
        this.ensureAlive();
        this.timeline.applyDirtiedAnimation(this);
        if (this.timeline.animations.indexOf(this) === -1) {
            this.timeline.animations.push(this);
        }
        this.updatePromises();
    };
    Animation.prototype.pause = function () {
        this.updatePromises();
        if (this.currentTime) {
            this._holdTime = this.currentTime;
        }
        if (!this._isFinished && !this._paused && !this._idle) {
            this.currentTimePending = true;
        }
        else if (this._idle) {
            this.rewind();
            this._idle = false;
        }
        this._startTime = null;
        this._paused = true;
        this.updatePromises();
    };
    Animation.prototype.finish = function () {
        this.updatePromises();
        if (this._idle)
            return;
        this.currentTime = this._playbackRate > 0 ? this._totalDuration : 0;
        this._startTime = this._totalDuration - this.currentTime;
        this.currentTimePending = false;
        this.timeline.applyDirtiedAnimation(this);
        this.updatePromises();
    };
    Animation.prototype.cancel = function () {
        var _this = this;
        this.updatePromises();
        if (!this._inEffect)
            return;
        this._inEffect = false;
        this._idle = true;
        this._paused = false;
        this._finishedFlag = true;
        this._currentTime = 0;
        this._startTime = null;
        this.effect.update(null);
        // effects are invalid after cancellation as the animation state
        // needs to un-apply.
        this.timeline.applyDirtiedAnimation(this);
        this.updatePromises();
        /**
         * 1. Reject the current finished promise with a DOMException named "AbortError".
         * 2. Let current finished promise be a new promise
         * @see https://w3c.github.io/csswg-drafts/web-animations-1/#canceling-an-animation-section
         */
        // if (this.finishedPromise) {
        //   this.rejectFinishedPromise();
        //   this.finishedPromise = undefined;
        // }
        if (this.oncancel) {
            var event_1 = new AnimationEvent(null, this, this.currentTime, null);
            setTimeout(function () {
                _this.oncancel(event_1);
            });
        }
    };
    Animation.prototype.reverse = function () {
        this.updatePromises();
        var oldCurrentTime = this.currentTime;
        this.playbackRate *= -1;
        this.play();
        if (oldCurrentTime !== null) {
            this.currentTime = oldCurrentTime;
        }
        this.updatePromises();
    };
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Animation/updatePlaybackRate
     */
    Animation.prototype.updatePlaybackRate = function (playbackRate) {
        this.playbackRate = playbackRate;
    };
    Animation.prototype.targetAnimations = function () {
        var _a;
        var target = (_a = this.effect) === null || _a === void 0 ? void 0 : _a.target;
        return target.getAnimations();
    };
    Animation.prototype.markTarget = function () {
        var animations = this.targetAnimations();
        if (animations.indexOf(this) === -1) {
            animations.push(this);
        }
    };
    Animation.prototype.unmarkTarget = function () {
        var animations = this.targetAnimations();
        var index = animations.indexOf(this);
        if (index !== -1) {
            animations.splice(index, 1);
        }
    };
    Animation.prototype.tick = function (timelineTime, isAnimationFrame) {
        if (!this._idle && !this._paused) {
            if (this._startTime === null) {
                if (isAnimationFrame) {
                    this.startTime = timelineTime - this._currentTime / this.playbackRate;
                }
            }
            else if (!this._isFinished) {
                this.tickCurrentTime((timelineTime - this._startTime) * this.playbackRate);
            }
        }
        if (isAnimationFrame) {
            this.currentTimePending = false;
            this.fireEvents(timelineTime);
        }
    };
    Animation.prototype.rewind = function () {
        if (this.playbackRate >= 0) {
            this.currentTime = 0;
        }
        else if (this._totalDuration < Infinity) {
            this.currentTime = this._totalDuration;
        }
        else {
            throw new Error('Unable to rewind negative playback rate animation with infinite duration');
        }
    };
    Animation.prototype.persist = function () {
        throw new Error(gLite.ERROR_MSG_METHOD_NOT_IMPLEMENTED);
    };
    Animation.prototype.addEventListener = function (type, listener, options) {
        throw new Error(gLite.ERROR_MSG_METHOD_NOT_IMPLEMENTED);
    };
    Animation.prototype.removeEventListener = function (type, listener, options) {
        throw new Error(gLite.ERROR_MSG_METHOD_NOT_IMPLEMENTED);
    };
    Animation.prototype.dispatchEvent = function (event) {
        throw new Error(gLite.ERROR_MSG_METHOD_NOT_IMPLEMENTED);
    };
    // replaceState: AnimationReplaceState;
    Animation.prototype.commitStyles = function () {
        throw new Error(gLite.ERROR_MSG_METHOD_NOT_IMPLEMENTED);
    };
    Animation.prototype.ensureAlive = function () {
        var _a, _b;
        // If an animation is playing backwards and is not fill backwards/both
        // then it should go out of effect when it reaches the start of its
        // active interval (currentTime === 0).
        if (this.playbackRate < 0 && this.currentTime === 0) {
            this._inEffect = !!((_a = this.effect) === null || _a === void 0 ? void 0 : _a.update(-1));
        }
        else {
            this._inEffect = !!((_b = this.effect) === null || _b === void 0 ? void 0 : _b.update(this.currentTime));
        }
        if (!this._inTimeline && (this._inEffect || !this._finishedFlag)) {
            this._inTimeline = true;
            this.timeline.animations.push(this);
        }
    };
    Animation.prototype.tickCurrentTime = function (newTime, ignoreLimit) {
        if (newTime !== this._currentTime) {
            this._currentTime = newTime;
            if (this._isFinished && !ignoreLimit) {
                this._currentTime = this._playbackRate > 0 ? this._totalDuration : 0;
            }
            this.ensureAlive();
        }
    };
    Animation.prototype.fireEvents = function (baseTime) {
        var _this = this;
        if (this._isFinished) {
            if (!this._finishedFlag) {
                if (this.onfinish) {
                    var event_2 = new AnimationEvent(null, this, this.currentTime, baseTime);
                    setTimeout(function () {
                        if (_this.onfinish) {
                            _this.onfinish(event_2);
                        }
                    });
                }
                this._finishedFlag = true;
            }
        }
        else {
            if (this.onframe && this.playState === 'running') {
                var event_3 = new AnimationEvent(null, this, this.currentTime, baseTime);
                this.onframe(event_3);
            }
            this._finishedFlag = false;
        }
    };
    return Animation;
}());

/**
 * https://github.com/gre/bezier-easing
 * BezierEasing - use bezier curve for transition easing function
 * by Gaëtan Renaudeau 2014 - 2015 – MIT License
 */
// These values are established by empiricism with tests (tradeoff: performance VS precision)
var NEWTON_ITERATIONS = 4;
var NEWTON_MIN_SLOPE = 0.001;
var SUBDIVISION_PRECISION = 0.0000001;
var SUBDIVISION_MAX_ITERATIONS = 10;
var kSplineTableSize = 11;
var kSampleStepSize = 1.0 / (kSplineTableSize - 1.0);
var float32ArraySupported = typeof Float32Array === 'function';
var A = function (aA1, aA2) { return 1.0 - 3.0 * aA2 + 3.0 * aA1; };
var B = function (aA1, aA2) { return 3.0 * aA2 - 6.0 * aA1; };
var C = function (aA1) { return 3.0 * aA1; };
// Returns x(t) given t, x1, and x2, or y(t) given t, y1, and y2.
var calcBezier = function (aT, aA1, aA2) {
    return ((A(aA1, aA2) * aT + B(aA1, aA2)) * aT + C(aA1)) * aT;
};
// Returns dx/dt given t, x1, and x2, or dy/dt given t, y1, and y2.
var getSlope = function (aT, aA1, aA2) {
    return 3.0 * A(aA1, aA2) * aT * aT + 2.0 * B(aA1, aA2) * aT + C(aA1);
};
var binarySubdivide = function (aX, aA, aB, mX1, mX2) {
    var currentX, currentT, i = 0;
    do {
        currentT = aA + (aB - aA) / 2.0;
        currentX = calcBezier(currentT, mX1, mX2) - aX;
        if (currentX > 0.0)
            aB = currentT;
        else
            aA = currentT;
    } while (Math.abs(currentX) > SUBDIVISION_PRECISION && ++i < SUBDIVISION_MAX_ITERATIONS);
    return currentT;
};
var newtonRaphsonIterate = function (aX, aGuessT, mX1, mX2) {
    for (var i = 0; i < NEWTON_ITERATIONS; ++i) {
        var currentSlope = getSlope(aGuessT, mX1, mX2);
        if (currentSlope === 0.0)
            return aGuessT;
        var currentX = calcBezier(aGuessT, mX1, mX2) - aX;
        aGuessT -= currentX / currentSlope;
    }
    return aGuessT;
};
var bezier = function (mX1, mY1, mX2, mY2) {
    if (!(0 <= mX1 && mX1 <= 1 && 0 <= mX2 && mX2 <= 1))
        throw new Error('bezier x values must be in [0, 1] range');
    if (mX1 === mY1 && mX2 === mY2)
        return function (t) { return t; };
    // Precompute samples table
    var sampleValues = float32ArraySupported
        ? new Float32Array(kSplineTableSize)
        : new Array(kSplineTableSize);
    for (var i = 0; i < kSplineTableSize; ++i) {
        sampleValues[i] = calcBezier(i * kSampleStepSize, mX1, mX2);
    }
    var getTForX = function (aX) {
        var intervalStart = 0.0;
        var currentSample = 1;
        var lastSample = kSplineTableSize - 1;
        for (; currentSample !== lastSample && sampleValues[currentSample] <= aX; ++currentSample)
            intervalStart += kSampleStepSize;
        --currentSample;
        // Interpolate to provide an initial guess for t
        var dist = (aX - sampleValues[currentSample]) /
            (sampleValues[currentSample + 1] - sampleValues[currentSample]);
        var guessForT = intervalStart + dist * kSampleStepSize;
        var initialSlope = getSlope(guessForT, mX1, mX2);
        if (initialSlope >= NEWTON_MIN_SLOPE)
            return newtonRaphsonIterate(aX, guessForT, mX1, mX2);
        else if (initialSlope === 0.0)
            return guessForT;
        else {
            return binarySubdivide(aX, intervalStart, intervalStart + kSampleStepSize, mX1, mX2);
        }
    };
    return function (t) {
        // Because JavaScript number are imprecise, we should guarantee the extremes are right.
        if (t === 0 || t === 1)
            return t;
        return calcBezier(getTForX(t), mY1, mY2);
    };
};

var convertToDash = function (str) {
    str = str.replace(/([A-Z])/g, function (letter) { return "-".concat(letter.toLowerCase()); });
    // Remove first dash
    return str.charAt(0) === '-' ? str.substring(1) : str;
};
/**
  Easing Functions from anime.js, they are tried and true, so, its better to use them instead of other alternatives
*/
var Quad = function (t) { return Math.pow(t, 2); };
var Cubic = function (t) { return Math.pow(t, 3); };
var Quart = function (t) { return Math.pow(t, 4); };
var Quint = function (t) { return Math.pow(t, 5); };
var Expo = function (t) { return Math.pow(t, 6); };
var Sine = function (t) { return 1 - Math.cos((t * Math.PI) / 2); };
var Circ = function (t) { return 1 - Math.sqrt(1 - t * t); };
var Back = function (t) { return t * t * (3 * t - 2); };
var Bounce = function (t) {
    var pow2, b = 4;
    while (t < ((pow2 = Math.pow(2, --b)) - 1) / 11) { }
    return 1 / Math.pow(4, 3 - b) - 7.5625 * Math.pow((pow2 * 3 - 2) / 22 - t, 2);
};
var Elastic = function (t, params) {
    if (params === void 0) { params = []; }
    var _a = tslib.__read(params, 2), _b = _a[0], amplitude = _b === void 0 ? 1 : _b, _c = _a[1], period = _c === void 0 ? 0.5 : _c;
    var a = util.clamp(Number(amplitude), 1, 10);
    var p = util.clamp(Number(period), 0.1, 2);
    if (t === 0 || t === 1)
        return t;
    return (-a *
        Math.pow(2, 10 * (t - 1)) *
        Math.sin(((t - 1 - (p / (Math.PI * 2)) * Math.asin(1 / a)) * (Math.PI * 2)) / p));
};
var Spring = function (t, params, duration) {
    if (params === void 0) { params = []; }
    var _a = tslib.__read(params, 4), _b = _a[0], mass = _b === void 0 ? 1 : _b, _c = _a[1], stiffness = _c === void 0 ? 100 : _c, _d = _a[2], damping = _d === void 0 ? 10 : _d, _e = _a[3], velocity = _e === void 0 ? 0 : _e;
    mass = util.clamp(mass, 0.1, 1000);
    stiffness = util.clamp(stiffness, 0.1, 1000);
    damping = util.clamp(damping, 0.1, 1000);
    velocity = util.clamp(velocity, 0.1, 1000);
    var w0 = Math.sqrt(stiffness / mass);
    var zeta = damping / (2 * Math.sqrt(stiffness * mass));
    var wd = zeta < 1 ? w0 * Math.sqrt(1 - zeta * zeta) : 0;
    var a = 1;
    var b = zeta < 1 ? (zeta * w0 + -velocity) / wd : -velocity + w0;
    var progress = duration ? (duration * t) / 1000 : t;
    if (zeta < 1) {
        progress =
            Math.exp(-progress * zeta * w0) * (a * Math.cos(wd * progress) + b * Math.sin(wd * progress));
    }
    else {
        progress = (a + b * progress) * Math.exp(-progress * w0);
    }
    if (t === 0 || t === 1)
        return t;
    return 1 - progress;
};
/**
 * Cache the durations at set easing parameters
 */
// export const EasingDurationCache: Map<string | TypeEasingFunction, number> = new Map();
/**
 * The threshold for an infinite loop
 */
// const INTINITE_LOOP_LIMIT = 10000;
/** Convert easing parameters to Array of numbers, e.g. "spring(2, 500)" to [2, 500] */
// export const parseEasingParameters = (str: string) => {
//   const match = /(\(|\s)([^)]+)\)?/.exec(str);
//   return match
//     ? match[2].split(',').map((value) => {
//         const num = parseFloat(value);
//         return !Number.isNaN(num) ? num : value.trim();
//       })
//     : [];
// };
/**
 * The spring easing function will only look smooth at certain durations, with certain parameters.
 * This functions returns the optimal duration to create a smooth springy animation based on physics
 *
 * Note: it can also be used to determine the optimal duration of other types of easing function, but be careful of 'in-'
 * easing functions, because of the nature of the function it can sometimes create an infinite loop, I suggest only using
 * `getEasingDuration` for `spring`, specifically 'out-spring' and 'spring'
 */
// export const getEasingDuration = (easing: string | TypeEasingFunction = 'spring') => {
//   if (EasingDurationCache.has(easing)) return EasingDurationCache.get(easing);
//   // eslint-disable-next-line @typescript-eslint/no-use-before-define
//   const easingFunction = typeof easing == 'function' ? easing : getEasingFunction(easing as string);
//   const params = typeof easing == 'function' ? [] : parseEasingParameters(easing);
//   const frame = 1 / 6;
//   let elapsed = 0;
//   let rest = 0;
//   let count = 0;
//   while (++count < INTINITE_LOOP_LIMIT) {
//     elapsed += frame;
//     if (easingFunction(elapsed, params, undefined) === 1) {
//       rest++;
//       if (rest >= 16) break;
//     } else {
//       rest = 0;
//     }
//   }
//   const duration = elapsed * frame * 1000;
//   EasingDurationCache.set(easing, duration);
//   return duration;
// };
/**
  These Easing Functions are based off of the Sozi Project's easing functions
  https://github.com/sozi-projects/Sozi/blob/d72e44ebd580dc7579d1e177406ad41e632f961d/src/js/player/Timing.js
*/
var Steps = function (t, params) {
    if (params === void 0) { params = []; }
    var _a = tslib.__read(params, 2), _b = _a[0], steps = _b === void 0 ? 10 : _b, type = _a[1];
    var trunc = type == 'start' ? Math.ceil : Math.floor;
    return trunc(util.clamp(t, 0, 1) * steps) / steps;
};
// @ts-ignore
var Bezier = function (t, params) {
    if (params === void 0) { params = []; }
    var _a = tslib.__read(params, 4), mX1 = _a[0], mY1 = _a[1], mX2 = _a[2], mY2 = _a[3];
    return bezier(mX1, mY1, mX2, mY2)(t);
};
/** The default `ease-in` easing function */
var easein = bezier(0.42, 0.0, 1.0, 1.0);
/** Converts easing functions to their `out`counter parts */
var EaseOut = function (ease) {
    return function (t, params, duration) {
        if (params === void 0) { params = []; }
        return 1 - ease(1 - t, params, duration);
    };
};
/** Converts easing functions to their `in-out` counter parts */
var EaseInOut = function (ease) {
    return function (t, params, duration) {
        if (params === void 0) { params = []; }
        return t < 0.5 ? ease(t * 2, params, duration) / 2 : 1 - ease(t * -2 + 2, params, duration) / 2;
    };
};
/** Converts easing functions to their `out-in` counter parts */
var EaseOutIn = function (ease) {
    return function (t, params, duration) {
        if (params === void 0) { params = []; }
        return t < 0.5
            ? (1 - ease(1 - t * 2, params, duration)) / 2
            : (ease(t * 2 - 1, params, duration) + 1) / 2;
    };
};
var EasingFunctions = {
    steps: Steps,
    'step-start': function (t) { return Steps(t, [1, 'start']); },
    'step-end': function (t) { return Steps(t, [1, 'end']); },
    linear: function (t) { return t; },
    'cubic-bezier': Bezier,
    ease: function (t) { return Bezier(t, [0.25, 0.1, 0.25, 1.0]); },
    in: easein,
    out: EaseOut(easein),
    'in-out': EaseInOut(easein),
    'out-in': EaseOutIn(easein),
    'in-quad': Quad,
    'out-quad': EaseOut(Quad),
    'in-out-quad': EaseInOut(Quad),
    'out-in-quad': EaseOutIn(Quad),
    'in-cubic': Cubic,
    'out-cubic': EaseOut(Cubic),
    'in-out-cubic': EaseInOut(Cubic),
    'out-in-cubic': EaseOutIn(Cubic),
    'in-quart': Quart,
    'out-quart': EaseOut(Quart),
    'in-out-quart': EaseInOut(Quart),
    'out-in-quart': EaseOutIn(Quart),
    'in-quint': Quint,
    'out-quint': EaseOut(Quint),
    'in-out-quint': EaseInOut(Quint),
    'out-in-quint': EaseOutIn(Quint),
    'in-expo': Expo,
    'out-expo': EaseOut(Expo),
    'in-out-expo': EaseInOut(Expo),
    'out-in-expo': EaseOutIn(Expo),
    'in-sine': Sine,
    'out-sine': EaseOut(Sine),
    'in-out-sine': EaseInOut(Sine),
    'out-in-sine': EaseOutIn(Sine),
    'in-circ': Circ,
    'out-circ': EaseOut(Circ),
    'in-out-circ': EaseInOut(Circ),
    'out-in-circ': EaseOutIn(Circ),
    'in-back': Back,
    'out-back': EaseOut(Back),
    'in-out-back': EaseInOut(Back),
    'out-in-back': EaseOutIn(Back),
    'in-bounce': Bounce,
    'out-bounce': EaseOut(Bounce),
    'in-out-bounce': EaseInOut(Bounce),
    'out-in-bounce': EaseOutIn(Bounce),
    'in-elastic': Elastic,
    'out-elastic': EaseOut(Elastic),
    'in-out-elastic': EaseInOut(Elastic),
    'out-in-elastic': EaseOutIn(Elastic),
    spring: Spring,
    'spring-in': Spring,
    'spring-out': EaseOut(Spring),
    'spring-in-out': EaseInOut(Spring),
    'spring-out-in': EaseOutIn(Spring),
};
/**
 * Convert string easing to their proper form
 */
var complexEasingSyntax = function (ease) {
    return convertToDash(ease)
        .replace(/^ease-/, '') // Remove the "ease-" keyword
        .replace(/(\(|\s).+/, '') // Remove the function brackets and parameters
        .toLowerCase()
        .trim();
};
/** Re-maps a number from one range to another. Numbers outside the range are not clamped to 0 and 1, because out-of-range values are often intentional and useful. */
var getEasingFunction = function (ease) {
    return EasingFunctions[complexEasingSyntax(ease)] || EasingFunctions.linear;
};
// /**
//  * Allows you to register new easing functions
//  */
// export const registerEasingFunction = (key: string, fn: TypeEasingFunction) => {
//   Object.assign(EasingFunctions, {
//     [key]: fn,
//   });
// };
// /**
//  * Allows you to register multiple new easing functions
//  */
// export const registerEasingFunctions = (...obj: typeof EasingFunctions[]) => {
//   Object.assign(EasingFunctions, ...obj);
// };

var linear = function (x) {
    return x;
};
var Start = 1;
var Middle = 0.5;
var End = 0;
function step(count, pos) {
    return function (x) {
        if (x >= 1) {
            return 1;
        }
        var stepSize = 1 / count;
        x += pos * stepSize;
        return x - (x % stepSize);
    };
}
var numberString = '\\s*(-?\\d+\\.?\\d*|-?\\.\\d+)\\s*';
var cubicBezierRe = new RegExp('cubic-bezier\\(' +
    numberString +
    ',' +
    numberString +
    ',' +
    numberString +
    ',' +
    numberString +
    '\\)');
var step1Re = /steps\(\s*(\d+)\s*\)/;
var step2Re = /steps\(\s*(\d+)\s*,\s*(start|middle|end)\s*\)/;
function parseEasingFunction(normalizedEasing) {
    var cubicData = cubicBezierRe.exec(normalizedEasing);
    if (cubicData) {
        // @ts-ignore
        return bezier.apply(void 0, tslib.__spreadArray([], tslib.__read(cubicData.slice(1).map(Number)), false));
    }
    var step1Data = step1Re.exec(normalizedEasing);
    if (step1Data) {
        return step(Number(step1Data[1]), End);
    }
    var step2Data = step2Re.exec(normalizedEasing);
    if (step2Data) {
        // @ts-ignore
        return step(Number(step2Data[1]), { start: Start, middle: Middle, end: End }[step2Data[2]]);
    }
    return getEasingFunction(normalizedEasing);
}
function calculateActiveDuration(timing) {
    // @ts-ignore
    return Math.abs(repeatedDuration(timing) / (timing.playbackRate || 1));
}
function repeatedDuration(timing) {
    var _a;
    // https://drafts.csswg.org/web-animations/#calculating-the-active-duration
    if (timing.duration === 0 || timing.iterations === 0) {
        return 0;
    }
    // @see https://developer.mozilla.org/en-US/docs/Web/API/EffectTiming/duration#value
    // if (timing.duration === 'auto') {
    //   timing.duration = 0;
    // }
    return (timing.duration === 'auto' ? 0 : Number(timing.duration)) * ((_a = timing.iterations) !== null && _a !== void 0 ? _a : 1);
}
var PhaseNone = 0;
var PhaseBefore = 1;
var PhaseAfter = 2;
var PhaseActive = 3;
function calculatePhase(activeDuration, localTime, timing) {
    // https://drafts.csswg.org/web-animations/#animation-effect-phases-and-states
    if (localTime === null) {
        return PhaseNone;
    }
    var endTime = timing.endTime;
    if (localTime < Math.min(timing.delay, endTime)) {
        return PhaseBefore;
    }
    if (localTime >= Math.min(timing.delay + activeDuration + timing.endDelay, endTime)) {
        return PhaseAfter;
    }
    return PhaseActive;
}
function calculateActiveTime(activeDuration, fillMode, localTime, phase, delay) {
    // https://drafts.csswg.org/web-animations/#calculating-the-active-time
    switch (phase) {
        case PhaseBefore:
            if (fillMode === 'backwards' || fillMode === 'both')
                return 0;
            return null;
        case PhaseActive:
            return localTime - delay;
        case PhaseAfter:
            if (fillMode === 'forwards' || fillMode === 'both')
                return activeDuration;
            return null;
        case PhaseNone:
            return null;
    }
}
function calculateOverallProgress(iterationDuration, phase, iterations, activeTime, iterationStart) {
    // https://drafts.csswg.org/web-animations/#calculating-the-overall-progress
    var overallProgress = iterationStart;
    if (iterationDuration === 0) {
        if (phase !== PhaseBefore) {
            overallProgress += iterations;
        }
    }
    else {
        overallProgress += activeTime / iterationDuration;
    }
    return overallProgress;
}
function calculateSimpleIterationProgress(overallProgress, iterationStart, phase, iterations, activeTime, iterationDuration) {
    // https://drafts.csswg.org/web-animations/#calculating-the-simple-iteration-progress
    var simpleIterationProgress = overallProgress === Infinity ? iterationStart % 1 : overallProgress % 1;
    if (simpleIterationProgress === 0 &&
        phase === PhaseAfter &&
        iterations !== 0 &&
        (activeTime !== 0 || iterationDuration === 0)) {
        simpleIterationProgress = 1;
    }
    return simpleIterationProgress;
}
function calculateCurrentIteration(phase, iterations, simpleIterationProgress, overallProgress) {
    // https://drafts.csswg.org/web-animations/#calculating-the-current-iteration
    if (phase === PhaseAfter && iterations === Infinity) {
        return Infinity;
    }
    if (simpleIterationProgress === 1) {
        return Math.floor(overallProgress) - 1;
    }
    return Math.floor(overallProgress);
}
function calculateDirectedProgress(playbackDirection, currentIteration, simpleIterationProgress) {
    // https://drafts.csswg.org/web-animations/#calculating-the-directed-progress
    var currentDirection = playbackDirection;
    if (playbackDirection !== 'normal' && playbackDirection !== 'reverse') {
        var d = currentIteration;
        if (playbackDirection === 'alternate-reverse') {
            d += 1;
        }
        currentDirection = 'normal';
        if (d !== Infinity && d % 2 !== 0) {
            currentDirection = 'reverse';
        }
    }
    if (currentDirection === 'normal') {
        return simpleIterationProgress;
    }
    return 1 - simpleIterationProgress;
}
function calculateIterationProgress(activeDuration, localTime, timing) {
    var phase = calculatePhase(activeDuration, localTime, timing);
    var activeTime = calculateActiveTime(activeDuration, timing.fill, localTime, phase, timing.delay);
    if (activeTime === null)
        return null;
    var duration = timing.duration === 'auto' ? 0 : timing.duration;
    var overallProgress = calculateOverallProgress(duration, phase, timing.iterations, activeTime, timing.iterationStart);
    var simpleIterationProgress = calculateSimpleIterationProgress(overallProgress, timing.iterationStart, phase, timing.iterations, activeTime, duration);
    var currentIteration = calculateCurrentIteration(phase, timing.iterations, simpleIterationProgress, overallProgress);
    var directedProgress = calculateDirectedProgress(timing.direction, currentIteration, simpleIterationProgress);
    timing.currentIteration = currentIteration;
    timing.progress = directedProgress;
    // https://drafts.csswg.org/web-animations/#calculating-the-transformed-progress
    // https://drafts.csswg.org/web-animations/#calculating-the-iteration-progress
    return timing.easingFunction(directedProgress);
}

function convertEffectInput(keyframes, timing, target) {
    var propertySpecificKeyframeGroups = makePropertySpecificKeyframeGroups(keyframes, timing);
    var interpolations = makeInterpolations(propertySpecificKeyframeGroups, target);
    return function (target, fraction) {
        if (fraction !== null) {
            interpolations
                .filter(function (interpolation) {
                return (fraction >= interpolation.applyFrom &&
                    fraction < interpolation.applyTo);
            })
                .forEach(function (interpolation) {
                var offsetFraction = fraction - interpolation.startOffset;
                var localDuration = interpolation.endOffset - interpolation.startOffset;
                var scaledLocalTime = localDuration === 0
                    ? 0
                    : interpolation.easingFunction(offsetFraction / localDuration);
                // apply updated attribute
                target.setAttribute(interpolation.property, interpolation.interpolation(scaledLocalTime), false, false);
                // if (interpolation.property === 'visibility') {
                //   console.log(
                //     scaledLocalTime,
                //     interpolation.interpolation(scaledLocalTime),
                //   );
                // }
            });
        }
        else {
            for (var property in propertySpecificKeyframeGroups)
                if (isNotReservedWord(property)) {
                    // clear attribute
                    target.setAttribute(property, null);
                }
        }
    };
}
function isNotReservedWord(member) {
    return (member !== 'offset' &&
        member !== 'easing' &&
        member !== 'composite' &&
        member !== 'computedOffset');
}
function makePropertySpecificKeyframeGroups(keyframes, timing) {
    var propertySpecificKeyframeGroups = {};
    for (var i = 0; i < keyframes.length; i++) {
        for (var member in keyframes[i]) {
            if (isNotReservedWord(member)) {
                var propertySpecificKeyframe = {
                    offset: keyframes[i].offset,
                    computedOffset: keyframes[i].computedOffset,
                    easing: keyframes[i].easing,
                    easingFunction: parseEasingFunction(keyframes[i].easing) || timing.easingFunction,
                    value: keyframes[i][member],
                };
                propertySpecificKeyframeGroups[member] =
                    propertySpecificKeyframeGroups[member] || [];
                propertySpecificKeyframeGroups[member].push(propertySpecificKeyframe);
            }
        }
    }
    return propertySpecificKeyframeGroups;
}
function makeInterpolations(propertySpecificKeyframeGroups, target) {
    var interpolations = [];
    for (var groupName in propertySpecificKeyframeGroups) {
        var keyframes = propertySpecificKeyframeGroups[groupName];
        for (var i = 0; i < keyframes.length - 1; i++) {
            var startIndex = i;
            var endIndex = i + 1;
            var startOffset = keyframes[startIndex].computedOffset;
            var endOffset = keyframes[endIndex].computedOffset;
            var applyFrom = startOffset;
            var applyTo = endOffset;
            if (i === 0) {
                applyFrom = -Infinity;
                if (endOffset === 0) {
                    endIndex = startIndex;
                }
            }
            if (i === keyframes.length - 2) {
                applyTo = Infinity;
                if (startOffset === 1) {
                    startIndex = endIndex;
                }
            }
            interpolations.push({
                applyFrom: applyFrom,
                applyTo: applyTo,
                startOffset: keyframes[startIndex].computedOffset,
                endOffset: keyframes[endIndex].computedOffset,
                easingFunction: keyframes[startIndex].easingFunction,
                property: groupName,
                interpolation: propertyInterpolation(groupName, keyframes[startIndex].value, keyframes[endIndex].value, target),
            });
        }
    }
    interpolations.sort(function (leftInterpolation, rightInterpolation) {
        return leftInterpolation.startOffset - rightInterpolation.startOffset;
    });
    return interpolations;
}
var InterpolationFactory = function (from, to, 
// eslint-disable-next-line @typescript-eslint/ban-types
convertToString) {
    return function (f) {
        var interpolated = interpolate(from, to, f);
        return !gLite.runtime.enableCSSParsing && util.isNumber(interpolated)
            ? interpolated
            : convertToString(interpolated);
    };
};
function propertyInterpolation(property, left, right, target) {
    var metadata = gLite.propertyMetadataCache[property];
    // discrete step
    // if (property === 'visibility') {
    //   return function (t: number) {
    //     if (t === 0) return left;
    //     if (t === 1) return right;
    //     debugger;
    //     return t < 0.5 ? left : right;
    //   };
    // }
    if (metadata && metadata.syntax && metadata.int) {
        var propertyHandler = gLite.runtime.styleValueRegistry.getPropertySyntax(metadata.syntax);
        if (propertyHandler) {
            var usedLeft = void 0;
            var usedRight = void 0;
            if (gLite.runtime.enableCSSParsing) {
                var computedLeft = gLite.runtime.styleValueRegistry.parseProperty(property, left, target, false);
                var computedRight = gLite.runtime.styleValueRegistry.parseProperty(property, right, target, false);
                usedLeft = gLite.runtime.styleValueRegistry.computeProperty(property, computedLeft, target, false);
                usedRight = gLite.runtime.styleValueRegistry.computeProperty(property, computedRight, target, false);
            }
            else {
                var parser = propertyHandler.parserWithCSSDisabled;
                usedLeft = parser ? parser(left, target) : left;
                usedRight = parser ? parser(right, target) : right;
            }
            // merger [left, right, n2string()]
            var interpolationArgs = propertyHandler.mixer(usedLeft, usedRight, target);
            if (interpolationArgs) {
                var interp_1 = InterpolationFactory.apply(void 0, tslib.__spreadArray([], tslib.__read(interpolationArgs), false));
                return function (t) {
                    if (t === 0)
                        return left;
                    if (t === 1)
                        return right;
                    return interp_1(t);
                };
            }
        }
    }
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    return InterpolationFactory(false, true, function (bool) {
        return bool ? right : left;
    });
}
/**
 * interpolate with number, boolean, number[], boolean[]
 */
function interpolate(from, to, f) {
    if (typeof from === 'number' && typeof to === 'number') {
        return from * (1 - f) + to * f;
    }
    if ((typeof from === 'boolean' && typeof to === 'boolean') ||
        (typeof from === 'string' && typeof to === 'string') // skip string, eg. path ['M', 10, 10]
    ) {
        return f < 0.5 ? from : to;
    }
    if (Array.isArray(from) && Array.isArray(to)) {
        // interpolate arrays/matrix
        var fromLength = from.length;
        var toLength = to.length;
        var length_1 = Math.max(fromLength, toLength);
        var r = [];
        for (var i = 0; i < length_1; i++) {
            r.push(interpolate(from[i < fromLength ? i : fromLength - 1], to[i < toLength ? i : toLength - 1], f));
        }
        return r;
    }
    throw new Error('Mismatched interpolation arguments ' + from + ':' + to);
}

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/API/EffectTiming
 */
var AnimationEffectTiming = /** @class */ (function () {
    function AnimationEffectTiming() {
        /**
         * @see https://developer.mozilla.org/en-US/docs/Web/API/EffectTiming/delay
         */
        this.delay = 0;
        /**
         * @see https://developer.mozilla.org/en-US/docs/Web/API/EffectTiming/direction
         */
        this.direction = 'normal';
        /**
         * @see https://developer.mozilla.org/en-US/docs/Web/API/EffectTiming/duration
         */
        this.duration = 'auto';
        /**
         * @see https://developer.mozilla.org/en-US/docs/Web/API/EffectTiming/easing
         */
        this._easing = 'linear';
        this.easingFunction = linear;
        /**
         * @see https://developer.mozilla.org/en-US/docs/Web/API/EffectTiming/endDelay
         */
        this.endDelay = 0;
        /**
         * @see https://developer.mozilla.org/en-US/docs/Web/API/EffectTiming/fill
         */
        this.fill = 'auto';
        /**
         * @see https://developer.mozilla.org/en-US/docs/Web/API/EffectTiming/iterationStart
         */
        this.iterationStart = 0;
        /**
         * @see https://developer.mozilla.org/en-US/docs/Web/API/EffectTiming/iterations
         */
        this.iterations = 1;
        this.currentIteration = null;
        this.progress = null;
    }
    Object.defineProperty(AnimationEffectTiming.prototype, "easing", {
        get: function () {
            return this._easing;
        },
        set: function (value) {
            this.easingFunction = parseEasingFunction(value);
            this._easing = value;
        },
        enumerable: false,
        configurable: true
    });
    return AnimationEffectTiming;
}());

/**
 * @example
  {
    translateY: [200, 300],
    scale: [1, 10],
  }

 * groups' length can be different, the following config should generate 3 frames:
  @example
  {
    translateY: [200, 300, 400],
    scale: [1, 10],
  }
 */
function convertToArrayForm(effectInput) {
    var normalizedEffectInput = [];
    for (var property in effectInput) {
        // skip reserved props
        if (property in ['easing', 'offset', 'composite']) {
            continue;
        }
        // @ts-ignore
        var values = effectInput[property];
        if (!Array.isArray(values)) {
            values = [values];
        }
        var numKeyframes = values.length;
        for (var i = 0; i < numKeyframes; i++) {
            if (!normalizedEffectInput[i]) {
                var keyframe = {};
                if ('offset' in effectInput) {
                    keyframe.offset = Number(effectInput.offset);
                }
                if ('easing' in effectInput) {
                    // @ts-ignore
                    keyframe.easing = effectInput.easing;
                }
                if ('composite' in effectInput) {
                    // @ts-ignore
                    keyframe.composite = effectInput.composite;
                }
                normalizedEffectInput[i] = keyframe;
            }
            if (values[i] !== undefined && values[i] !== null) {
                normalizedEffectInput[i][property] = values[i];
            }
        }
    }
    normalizedEffectInput.sort(function (a, b) {
        return (a.computedOffset || 0) - (b.computedOffset || 0);
    });
    return normalizedEffectInput;
}
function normalizeKeyframes(effectInput, timing) {
    if (effectInput === null) {
        return [];
    }
    if (!Array.isArray(effectInput)) {
        effectInput = convertToArrayForm(effectInput);
    }
    var keyframes = effectInput.map(function (originalKeyframe) {
        var keyframe = {};
        if (timing === null || timing === void 0 ? void 0 : timing.composite) {
            // This will be auto if the composite operation specified on the effect is being used.
            // @see https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API/Keyframe_Formats
            keyframe.composite = 'auto';
        }
        for (var member in originalKeyframe) {
            var memberValue = originalKeyframe[member];
            if (member === 'offset') {
                if (memberValue !== null) {
                    memberValue = Number(memberValue);
                    if (!isFinite(memberValue))
                        throw new Error('Keyframe offsets must be numbers.');
                    if (memberValue < 0 || memberValue > 1)
                        throw new Error('Keyframe offsets must be between 0 and 1.');
                    keyframe.computedOffset = memberValue;
                }
            }
            else if (member === 'composite') {
                // TODO: Support add & accumulate in KeyframeEffect.composite
                // @see https://developer.mozilla.org/en-US/docs/Web/API/KeyframeEffect/composite
                if (['replace', 'add', 'accumulate', 'auto'].indexOf(memberValue) === -1) {
                    throw new Error("".concat(memberValue, " compositing is not supported"));
                }
            }
            else ;
            // assign to keyframe, no need to parse shorthand value
            keyframe[member] = memberValue;
        }
        if (keyframe.offset === undefined) {
            keyframe.offset = null;
        }
        if (keyframe.easing === undefined) {
            // override with timing.easing
            keyframe.easing = (timing === null || timing === void 0 ? void 0 : timing.easing) || 'linear';
        }
        if (keyframe.composite === undefined) {
            keyframe.composite = 'auto';
        }
        return keyframe;
    });
    var everyFrameHasOffset = true;
    var previousOffset = -Infinity;
    for (var i = 0; i < keyframes.length; i++) {
        var offset = keyframes[i].offset;
        if (!util.isNil(offset)) {
            if (offset < previousOffset) {
                throw new TypeError('Keyframes are not loosely sorted by offset. Sort or specify offsets.');
            }
            previousOffset = offset;
        }
        else {
            everyFrameHasOffset = false;
        }
    }
    keyframes = keyframes.filter(function (keyframe) {
        return Number(keyframe.offset) >= 0 && Number(keyframe.offset) <= 1;
    });
    function spaceKeyframes() {
        var _a, _b;
        var length = keyframes.length;
        keyframes[length - 1].computedOffset = Number((_a = keyframes[length - 1].offset) !== null && _a !== void 0 ? _a : 1);
        if (length > 1) {
            keyframes[0].computedOffset = Number((_b = keyframes[0].offset) !== null && _b !== void 0 ? _b : 0);
        }
        var previousIndex = 0;
        var previousOffset = Number(keyframes[0].computedOffset);
        for (var i = 1; i < length; i++) {
            var offset = keyframes[i].computedOffset;
            if (!util.isNil(offset) && !util.isNil(previousOffset)) {
                for (var j = 1; j < i - previousIndex; j++)
                    keyframes[previousIndex + j].computedOffset =
                        previousOffset + ((Number(offset) - previousOffset) * j) / (i - previousIndex);
                previousIndex = i;
                previousOffset = Number(offset);
            }
        }
    }
    if (!everyFrameHasOffset)
        spaceKeyframes();
    return keyframes;
}

var fills = 'backwards|forwards|both|none'.split('|');
var directions = 'reverse|alternate|alternate-reverse'.split('|');
function makeTiming(timingInput, forGroup) {
    var timing = new AnimationEffectTiming();
    if (forGroup) {
        timing.fill = 'both';
        timing.duration = 'auto';
    }
    if (typeof timingInput === 'number' && !isNaN(timingInput)) {
        timing.duration = timingInput;
    }
    else if (timingInput !== undefined) {
        Object.keys(timingInput).forEach(function (property) {
            if (timingInput[property] !== undefined &&
                timingInput[property] !== null &&
                timingInput[property] !== 'auto') {
                if (typeof timing[property] === 'number' || property === 'duration') {
                    if (typeof timingInput[property] !== 'number' ||
                        isNaN(timingInput[property])) {
                        return;
                    }
                }
                if (property === 'fill' &&
                    fills.indexOf(timingInput[property]) === -1) {
                    return;
                }
                if (property === 'direction' &&
                    directions.indexOf(timingInput[property]) === -1) {
                    return;
                }
                // @ts-ignore
                timing[property] = timingInput[property];
            }
        });
    }
    return timing;
}
function normalizeTimingInput(timingInput, forGroup) {
    timingInput = numericTimingToObject(timingInput !== null && timingInput !== void 0 ? timingInput : { duration: 'auto' });
    return makeTiming(timingInput, forGroup);
}
function numericTimingToObject(timingInput) {
    if (typeof timingInput === 'number') {
        if (isNaN(timingInput)) {
            timingInput = { duration: 'auto' };
        }
        else {
            timingInput = { duration: timingInput };
        }
    }
    return timingInput;
}
/**
 * @see https://developer.mozilla.org/en-US/docs/Web/API/KeyframeEffect
 * @example
  const circleDownKeyframes = new KeyframeEffect(
    circle, // element to animate
    [
      { transform: 'translateY(0)' }, // keyframe
      { transform: 'translateY(100)' } // keyframe
    ],
    { duration: 3000, fill: 'forwards' } // keyframe options
  );
 *
 */
var KeyframeEffect = /** @class */ (function () {
    function KeyframeEffect(target, effectInput, timingInput) {
        var _this = this;
        this.composite = 'replace';
        this.iterationComposite = 'replace';
        this.target = target;
        this.timing = normalizeTimingInput(timingInput, false);
        this.timing.effect = this;
        this.timing.activeDuration = calculateActiveDuration(this.timing);
        this.timing.endTime = Math.max(0, this.timing.delay + this.timing.activeDuration + this.timing.endDelay);
        this.normalizedKeyframes = normalizeKeyframes(effectInput, this.timing);
        this.interpolations = convertEffectInput(this.normalizedKeyframes, this.timing, this.target);
        // 不支持 proxy 时降级成 this.timing
        var Proxy = gLite.runtime.globalThis.Proxy;
        this.computedTiming = Proxy
            ? new Proxy(this.timing, {
                get: function (target, prop) {
                    if (prop === 'duration') {
                        return target.duration === 'auto' ? 0 : target.duration;
                    }
                    else if (prop === 'fill') {
                        return target.fill === 'auto' ? 'none' : target.fill;
                    }
                    else if (prop === 'localTime') {
                        return (_this.animation && _this.animation.currentTime) || null;
                    }
                    else if (prop === 'currentIteration') {
                        if (!_this.animation || _this.animation.playState !== 'running') {
                            return null;
                        }
                        return target.currentIteration || 0;
                    }
                    else if (prop === 'progress') {
                        if (!_this.animation || _this.animation.playState !== 'running') {
                            return null;
                        }
                        return target.progress || 0;
                    }
                    return target[prop];
                },
                set: function () {
                    return true;
                },
            })
            : this.timing;
    }
    KeyframeEffect.prototype.applyInterpolations = function () {
        this.interpolations(this.target, Number(this.timeFraction));
    };
    KeyframeEffect.prototype.update = function (localTime) {
        if (localTime === null) {
            return false;
        }
        this.timeFraction = calculateIterationProgress(this.timing.activeDuration, localTime, this.timing);
        return this.timeFraction !== null;
    };
    KeyframeEffect.prototype.getKeyframes = function () {
        return this.normalizedKeyframes;
    };
    KeyframeEffect.prototype.setKeyframes = function (keyframes) {
        this.normalizedKeyframes = normalizeKeyframes(keyframes);
    };
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/API/AnimationEffect/getComputedTiming
     */
    KeyframeEffect.prototype.getComputedTiming = function () {
        return this.computedTiming;
    };
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/API/AnimationEffect/getTiming
     */
    KeyframeEffect.prototype.getTiming = function () {
        return this.timing;
    };
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/API/AnimationEffect/updateTiming
     */
    KeyframeEffect.prototype.updateTiming = function (timing) {
        var _this = this;
        Object.keys(timing || {}).forEach(function (name) {
            _this.timing[name] = timing[name];
        });
    };
    return KeyframeEffect;
}());

function compareAnimations(leftAnimation, rightAnimation) {
    return Number(leftAnimation.id) - Number(rightAnimation.id);
}
/**
 * @see https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/web-animations-js/index.d.ts
 */
var AnimationTimeline = /** @class */ (function () {
    function AnimationTimeline(document) {
        var _this = this;
        this.document = document;
        /**
         * all active animations
         */
        this.animations = [];
        this.ticking = false;
        this.timelineTicking = false;
        this.hasRestartedThisFrame = false;
        this.animationsWithPromises = [];
        this.inTick = false;
        this.pendingEffects = [];
        this.currentTime = null;
        this.rafId = 0;
        this.rafCallbacks = [];
        this.webAnimationsNextTick = function (t) {
            _this.currentTime = t;
            _this.discardAnimations();
            if (_this.animations.length === 0) {
                _this.timelineTicking = false;
            }
            else {
                _this.requestAnimationFrame(_this.webAnimationsNextTick);
            }
        };
        this.processRafCallbacks = function (t) {
            var processing = _this.rafCallbacks;
            _this.rafCallbacks = [];
            if (t < Number(_this.currentTime))
                t = Number(_this.currentTime);
            _this.animations.sort(compareAnimations);
            _this.animations = _this.tick(t, true, _this.animations)[0];
            processing.forEach(function (entry) {
                entry[1](t);
            });
            _this.applyPendingEffects();
        };
    }
    AnimationTimeline.prototype.getAnimations = function () {
        this.discardAnimations();
        return this.animations.slice();
    };
    AnimationTimeline.prototype.isTicking = function () {
        return this.inTick;
    };
    AnimationTimeline.prototype.play = function (target, keyframes, options) {
        var effect = new KeyframeEffect(target, keyframes, options);
        var animation = new Animation(effect, this);
        this.animations.push(animation);
        this.restartWebAnimationsNextTick();
        animation.updatePromises();
        animation.play();
        animation.updatePromises();
        return animation;
    };
    // RAF is supposed to be the last script to occur before frame rendering but not
    // all browsers behave like this. This function is for synchonously updating an
    // animation's effects whenever its state is mutated by script to work around
    // incorrect script execution ordering by the browser.
    AnimationTimeline.prototype.applyDirtiedAnimation = function (animation) {
        var _this = this;
        if (this.inTick) {
            return;
        }
        // update active animations in displayobject
        animation.markTarget();
        var animations = animation.targetAnimations();
        animations.sort(compareAnimations);
        // clear inactive animations
        var inactiveAnimations = this.tick(Number(this.currentTime), false, animations.slice())[1];
        inactiveAnimations.forEach(function (animation) {
            var index = _this.animations.indexOf(animation);
            if (index !== -1) {
                _this.animations.splice(index, 1);
            }
        });
        this.applyPendingEffects();
    };
    AnimationTimeline.prototype.restart = function () {
        if (!this.ticking) {
            this.ticking = true;
            this.requestAnimationFrame(function () { });
            this.hasRestartedThisFrame = true;
        }
        return this.hasRestartedThisFrame;
    };
    AnimationTimeline.prototype.destroy = function () {
        this.document.defaultView.cancelAnimationFrame(this.frameId);
    };
    AnimationTimeline.prototype.applyPendingEffects = function () {
        this.pendingEffects.forEach(function (effect) {
            effect === null || effect === void 0 ? void 0 : effect.applyInterpolations();
        });
        this.pendingEffects = [];
    };
    AnimationTimeline.prototype.updateAnimationsPromises = function () {
        this.animationsWithPromises = this.animationsWithPromises.filter(function (animation) {
            return animation.updatePromises();
        });
    };
    AnimationTimeline.prototype.discardAnimations = function () {
        this.updateAnimationsPromises();
        this.animations = this.animations.filter(function (animation) {
            return animation.playState !== 'finished' && animation.playState !== 'idle';
        });
    };
    AnimationTimeline.prototype.restartWebAnimationsNextTick = function () {
        if (!this.timelineTicking) {
            this.timelineTicking = true;
            this.requestAnimationFrame(this.webAnimationsNextTick);
        }
    };
    AnimationTimeline.prototype.rAF = function (f) {
        var id = this.rafId++;
        if (this.rafCallbacks.length === 0) {
            this.frameId = this.document.defaultView.requestAnimationFrame(this.processRafCallbacks);
        }
        this.rafCallbacks.push([id, f]);
        return id;
    };
    AnimationTimeline.prototype.requestAnimationFrame = function (f) {
        var _this = this;
        return this.rAF(function (x) {
            _this.updateAnimationsPromises();
            f(x);
            _this.updateAnimationsPromises();
        });
    };
    AnimationTimeline.prototype.tick = function (t, isAnimationFrame, updatingAnimations) {
        var _a, _b;
        var _this = this;
        this.inTick = true;
        this.hasRestartedThisFrame = false;
        this.currentTime = t;
        this.ticking = false;
        var newPendingClears = [];
        var newPendingEffects = [];
        var activeAnimations = [];
        var inactiveAnimations = [];
        updatingAnimations.forEach(function (animation) {
            animation.tick(t, isAnimationFrame);
            if (!animation._inEffect) {
                newPendingClears.push(animation.effect);
                animation.unmarkTarget();
            }
            else {
                newPendingEffects.push(animation.effect);
                animation.markTarget();
            }
            if (animation._needsTick)
                _this.ticking = true;
            var alive = animation._inEffect || animation._needsTick;
            animation._inTimeline = alive;
            if (alive) {
                activeAnimations.push(animation);
            }
            else {
                inactiveAnimations.push(animation);
            }
        });
        (_a = this.pendingEffects).push.apply(_a, tslib.__spreadArray([], tslib.__read(newPendingClears), false));
        (_b = this.pendingEffects).push.apply(_b, tslib.__spreadArray([], tslib.__read(newPendingEffects), false));
        if (this.ticking)
            this.requestAnimationFrame(function () { });
        this.inTick = false;
        return [activeAnimations, inactiveAnimations];
    };
    return AnimationTimeline;
}());

gLite.runtime.EasingFunction = parseEasingFunction;
gLite.runtime.AnimationTimeline = AnimationTimeline;

exports.Animation = Animation;
exports.AnimationEvent = AnimationEvent;
exports.AnimationTimeline = AnimationTimeline;
exports.EasingFunctions = EasingFunctions;
exports.KeyframeEffect = KeyframeEffect;
exports.compareAnimations = compareAnimations;
exports.makeTiming = makeTiming;
exports.normalizeKeyframes = normalizeKeyframes;
exports.normalizeTimingInput = normalizeTimingInput;
exports.numericTimingToObject = numericTimingToObject;
//# sourceMappingURL=index.js.map

}, function(modId) {var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1731211820588);
})()
//miniprogram-npm-outsideDeps=["@antv/g-lite","tslib","@antv/util"]
//# sourceMappingURL=index.js.map