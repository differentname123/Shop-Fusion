module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1731211820582, function(require, module, exports) {


var tslib = require('tslib');
var gLite = require('@antv/g-lite');

/**
 * TODO: use clock from g later.
 */
var clock = typeof performance === 'object' && performance.now ? performance : Date;
// 计算滑动的方向
var calcDirection = function (start, end) {
    var xDistance = end.x - start.x;
    var yDistance = end.y - start.y;
    // x 的距离大于y 说明是横向，否则就是纵向
    if (Math.abs(xDistance) > Math.abs(yDistance)) {
        return xDistance > 0 ? 'right' : 'left';
    }
    return yDistance > 0 ? 'down' : 'up';
};
// 计算2点之间的距离
var calcDistance = function (point1, point2) {
    var xDistance = Math.abs(point2.x - point1.x);
    var yDistance = Math.abs(point2.y - point1.y);
    return Math.sqrt(xDistance * xDistance + yDistance * yDistance);
};
var getCenter = function (point1, point2) {
    var x = point1.x + (point2.x - point1.x) / 2;
    var y = point1.y + (point2.y - point1.y) / 2;
    return { x: x, y: y };
};

var PRESS_DELAY = 250;
var GesturePlugin = /** @class */ (function () {
    function GesturePlugin(options) {
        var _this = this;
        this.options = options;
        this.evCache = [];
        this.startPoints = [];
        // 用来记录当前触发的事件
        this.processEvent = {};
        this.throttleTimer = 0;
        this.emitThrottles = [];
        this._start = function (ev, target) {
            var _a;
            // 每次触点开始都重置事件
            _this.reset();
            // 记录touch start 的时间
            _this.startTime = clock.now();
            var _b = _this, evCache = _b.evCache, startPoints = _b.startPoints;
            if (ev) {
                var pointerId_1 = ev.pointerId, x = ev.x, y = ev.y;
                // evcache 已经存在的 pointerId, 做替换
                var existIdx = evCache.findIndex(function (item) { return pointerId_1 === item.pointerId; });
                if (existIdx !== -1) {
                    evCache.splice(existIdx, 1);
                }
                // evCache 不存在的 pointerId, 添加
                evCache.push({
                    pointerId: pointerId_1,
                    x: x,
                    y: y,
                    ev: ev,
                });
                // @ts-ignore 对齐touches evCache 存在，touches 不存在，移除
                var evTouches = tslib.__spreadArray([], tslib.__read((((_a = ev.nativeEvent) === null || _a === void 0 ? void 0 : _a.touches) || [])), false);
                var _loop_1 = function (i) {
                    var isInTouches = evTouches.find(function (touch) {
                        return evCache[i].pointerId === touch.identifier;
                    });
                    // 在touches中存在
                    if (isInTouches) {
                        return "continue";
                    }
                    // 在touches中不存在
                    evCache.splice(i, 1);
                };
                for (var i = evCache.length - 1; i > -1; i--) {
                    _loop_1(i);
                }
            }
            // 重置 startPoints
            startPoints.length = evCache.length;
            for (var i = 0; i < evCache.length; i++) {
                var _c = evCache[i], x = _c.x, y = _c.y;
                var point = { x: x, y: y };
                startPoints[i] = point;
            }
            // 单指事件
            if (startPoints.length === 1) {
                var event_1 = evCache[0].ev;
                // 如果touchstart后停顿250ms, 则也触发press事件
                // @ts-ignore
                _this.pressTimeout = setTimeout(function () {
                    // 这里固定触发press事件
                    var eventType = 'press';
                    var direction = 'none';
                    event_1.direction = direction;
                    event_1.deltaX = 0;
                    event_1.deltaY = 0;
                    event_1.points = startPoints;
                    _this.emitStart(eventType, event_1, target);
                    event_1.type = eventType;
                    target.dispatchEvent(event_1);
                    _this.eventType = eventType;
                    _this.direction = direction;
                    _this.movingTarget = target;
                }, PRESS_DELAY);
                return;
            }
            // 目前只处理双指
            _this.startDistance = calcDistance(startPoints[0], startPoints[1]);
            _this.center = getCenter(startPoints[0], startPoints[1]);
        };
        this._move = function (ev, target) {
            _this.clearPressTimeout();
            var _a = _this, startPoints = _a.startPoints, evCache = _a.evCache;
            if (!startPoints.length)
                return;
            var x = ev.x, y = ev.y, pointerId = ev.pointerId;
            // Find this event in the cache and update its record with this event
            for (var i = 0, len = evCache.length; i < len; i++) {
                if (pointerId === evCache[i].pointerId) {
                    evCache[i] = {
                        pointerId: pointerId,
                        x: x,
                        y: y,
                        ev: ev,
                    };
                    break;
                }
            }
            var point = { x: x, y: y };
            var points = evCache.map(function (ev) {
                return { x: ev.x, y: ev.y };
            });
            // 记录最后2次move的时间和坐标，为了给swipe事件用
            var now = clock.now();
            _this.prevMoveTime = _this.lastMoveTime;
            _this.prevMovePoint = _this.lastMovePoint;
            _this.lastMoveTime = now;
            _this.lastMovePoint = point;
            if (startPoints.length === 1) {
                var startPoint = startPoints[0];
                var deltaX = x - startPoint.x;
                var deltaY = y - startPoint.y;
                var direction = _this.direction || calcDirection(startPoint, point);
                _this.direction = direction;
                // 获取press或者pan的事件类型
                // press 按住滑动, pan表示平移
                // 如果start后立刻move，则触发pan, 如果有停顿，则触发press
                var eventType = _this.getEventType(point, target, ev);
                ev.direction = direction;
                ev.deltaX = deltaX;
                ev.deltaY = deltaY;
                ev.points = points;
                _this.emitStart(eventType, ev, target);
                ev.type = eventType;
                _this.refreshAndGetTarget(target).dispatchEvent(ev);
                return;
            }
            // 多指触控
            var startDistance = _this.startDistance;
            var currentDistance = calcDistance(points[0], points[1]);
            // 缩放比例
            ev.zoom = currentDistance / startDistance;
            ev.center = _this.center;
            ev.points = points;
            // 触发缩放事件
            _this.emitStart('pinch', ev, target);
            // touch 多指会被拆成多个手指的 move, 会触发多次 move，所以这里需要做节流
            _this._throttleEmit('pinch', ev, target);
        };
        this._end = function (ev, target) {
            var _a = _this, evCache = _a.evCache, startPoints = _a.startPoints;
            var points = evCache.map(function (ev) {
                return { x: ev.x, y: ev.y };
            });
            ev.points = points;
            _this.emitEnd(ev, _this.refreshAndGetTarget(target));
            // 单指
            if (evCache.length === 1) {
                // swipe事件处理, 在end之后触发
                var now = clock.now();
                var lastMoveTime = _this.lastMoveTime;
                // 做这个判断是为了最后一次touchmove后到end前，是否还有一个停顿的过程
                // 100 是拍的一个值，理论这个值会很短，一般不卡顿的话在10ms以内
                if (now - lastMoveTime < 100) {
                    var prevMoveTime = _this.prevMoveTime || _this.startTime;
                    var intervalTime = lastMoveTime - prevMoveTime;
                    // 时间间隔一定要大于0, 否则计算没意义
                    if (intervalTime > 0) {
                        var prevMovePoint = _this.prevMovePoint || startPoints[0];
                        var lastMovePoint = _this.lastMovePoint || startPoints[0];
                        // move速率
                        var velocity = calcDistance(prevMovePoint, lastMovePoint) / intervalTime;
                        // 0.3 是参考hammerjs的设置
                        if (velocity > 0.3) {
                            ev.velocity = velocity;
                            ev.direction = calcDirection(prevMovePoint, lastMovePoint);
                            ev.type = 'swipe';
                            target.dispatchEvent(ev);
                        }
                    }
                }
            }
            // remove event from cache
            for (var i = 0, len = evCache.length; i < len; i++) {
                if (evCache[i].pointerId === ev.pointerId) {
                    evCache.splice(i, 1);
                    startPoints.splice(i, 1);
                    break;
                }
            }
            _this.reset();
            // 多指离开 1 指后，重新触发一次start
            if (evCache.length > 0) {
                _this._start(undefined, target);
            }
        };
        this._cancel = function (ev, target) {
            var evCache = _this.evCache;
            var points = evCache.map(function (ev) {
                return { x: ev.x, y: ev.y };
            });
            ev.points = points;
            _this.emitEnd(ev, _this.refreshAndGetTarget(target));
            _this.evCache = [];
            _this.reset();
        };
    }
    GesturePlugin.prototype.apply = function (context) {
        var _this = this;
        var renderingService = context.renderingService, renderingContext = context.renderingContext;
        var document = renderingContext.root.ownerDocument;
        var canvas = document.defaultView;
        this.canvas = canvas;
        var getGestureEventTarget = function (target) {
            var isDocument = target === document;
            return isDocument && _this.options.isDocumentGestureEnabled
                ? document
                : target;
        };
        var handlePointermove = function (ev) {
            var target = getGestureEventTarget(ev.target);
            target && _this._move(ev, target);
        };
        var handlePointerdown = function (ev) {
            var target = getGestureEventTarget(ev.target);
            target && _this._start(ev, target);
        };
        var handlePointerup = function (ev) {
            var target = getGestureEventTarget(ev.target);
            target && _this._end(ev, target);
        };
        var handlePointercancel = function (ev) {
            var target = getGestureEventTarget(ev.target);
            target && _this._cancel(ev, target);
        };
        var handlePointercanceloutside = function (ev) {
            var target = getGestureEventTarget(ev.target);
            target && _this._end(ev, target);
        };
        renderingService.hooks.init.tap(GesturePlugin.tag, function () {
            canvas.addEventListener('pointermove', handlePointermove);
            canvas.addEventListener('pointerdown', handlePointerdown);
            canvas.addEventListener('pointerup', handlePointerup);
            canvas.addEventListener('pointercancel', handlePointercancel);
            canvas.addEventListener('pointerupoutside', handlePointercanceloutside);
        });
        renderingService.hooks.destroy.tap(GesturePlugin.tag, function () {
            canvas.removeEventListener('pointermove', handlePointermove);
            canvas.removeEventListener('pointerdown', handlePointerdown);
            canvas.removeEventListener('pointerup', handlePointerup);
            canvas.removeEventListener('pointercancel', handlePointercancel);
            canvas.removeEventListener('pointerupoutside', handlePointercanceloutside);
        });
    };
    GesturePlugin.prototype.getEventType = function (point, target, ev) {
        var _a = this, eventType = _a.eventType, startTime = _a.startTime, startPoints = _a.startPoints;
        if (eventType) {
            return eventType;
        }
        // move的时候缓存节点，后续move和end都会使用这个target派发事件
        this.movingTarget = target;
        // 冒泡路径中是否有pan事件
        this.isPanListenerInPath = ev.path.some(function (ele) { var _a, _b; return !!((_b = (_a = ele.emitter) === null || _a === void 0 ? void 0 : _a.eventNames()) === null || _b === void 0 ? void 0 : _b.includes('pan')); });
        var type;
        // 如果没有pan事件的监听，默认都是press
        if (!this.isPanListenerInPath) {
            type = 'press';
        }
        else {
            // 如果有pan事件的处理，press则需要停顿250ms, 且移动距离小于10
            var now = clock.now();
            if (now - startTime > PRESS_DELAY &&
                calcDistance(startPoints[0], point) < 10) {
                type = 'press';
            }
            else {
                type = 'pan';
            }
        }
        this.eventType = type;
        return type;
    };
    GesturePlugin.prototype.enable = function (eventType) {
        this.processEvent[eventType] = true;
    };
    // 是否进行中的事件
    GesturePlugin.prototype.isProcess = function (eventType) {
        return this.processEvent[eventType];
    };
    // 触发start事件
    GesturePlugin.prototype.emitStart = function (type, ev, target) {
        if (this.isProcess(type)) {
            return;
        }
        this.enable(type);
        ev.type = "".concat(type, "start");
        target.dispatchEvent(ev);
    };
    // 触发事件
    GesturePlugin.prototype._throttleEmit = function (type, ev, target) {
        var _this = this;
        // 主要是节流处理
        this.pushEvent(type, ev);
        var _a = this, throttleTimer = _a.throttleTimer, emitThrottles = _a.emitThrottles, processEvent = _a.processEvent;
        if (throttleTimer) {
            return;
        }
        this.throttleTimer = this.canvas.requestAnimationFrame(function () {
            for (var i = 0, len = emitThrottles.length; i < len; i++) {
                var _a = emitThrottles[i], type_1 = _a.type, ev_1 = _a.ev;
                if (processEvent[type_1]) {
                    ev_1.type = type_1;
                    target.dispatchEvent(ev_1);
                }
            }
            // 清空
            _this.throttleTimer = 0;
            _this.emitThrottles.length = 0;
        });
    };
    // 触发end事件
    GesturePlugin.prototype.emitEnd = function (ev, target) {
        var processEvent = this.processEvent;
        Object.keys(processEvent).forEach(function (type) {
            ev.type = "".concat(type, "end");
            target.dispatchEvent(ev);
            delete processEvent[type];
        });
    };
    GesturePlugin.prototype.pushEvent = function (type, ev) {
        var emitThrottles = this.emitThrottles;
        var newEvent = { type: type, ev: ev };
        for (var i = 0, len = emitThrottles.length; i < len; i++) {
            if (emitThrottles[i].type === type) {
                emitThrottles.splice(i, 1, newEvent);
                return;
            }
        }
        emitThrottles.push(newEvent);
    };
    GesturePlugin.prototype.clearPressTimeout = function () {
        if (this.pressTimeout) {
            clearTimeout(this.pressTimeout);
            this.pressTimeout = null;
        }
    };
    GesturePlugin.prototype.refreshAndGetTarget = function (target) {
        if (this.movingTarget) {
            // @ts-ignore
            if (this.movingTarget && !this.movingTarget.isConnected) {
                this.movingTarget = target;
            }
            return this.movingTarget;
        }
        return target;
    };
    GesturePlugin.prototype.reset = function () {
        this.clearPressTimeout();
        this.startTime = 0;
        this.startDistance = 0;
        this.direction = null;
        this.eventType = null;
        this.prevMoveTime = 0;
        this.prevMovePoint = null;
        this.lastMoveTime = 0;
        this.lastMovePoint = null;
        this.movingTarget = null;
        this.isPanListenerInPath = null;
    };
    GesturePlugin.tag = 'Gesture';
    return GesturePlugin;
}());

var Plugin = /** @class */ (function (_super) {
    tslib.__extends(Plugin, _super);
    function Plugin(options) {
        if (options === void 0) { options = {}; }
        var _this = _super.call(this) || this;
        _this.options = options;
        _this.name = 'gesture';
        return _this;
    }
    Plugin.prototype.init = function () {
        this.addRenderingPlugin(new GesturePlugin(tslib.__assign({ isDocumentGestureEnabled: false }, this.options)));
    };
    Plugin.prototype.destroy = function () {
        this.removeAllRenderingPlugins();
    };
    return Plugin;
}(gLite.AbstractRendererPlugin));

exports.Plugin = Plugin;
//# sourceMappingURL=index.js.map

}, function(modId) {var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1731211820582);
})()
//miniprogram-npm-outsideDeps=["tslib","@antv/g-lite"]
//# sourceMappingURL=index.js.map