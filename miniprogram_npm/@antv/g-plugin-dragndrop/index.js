module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1729954662258, function(require, module, exports) {


var tslib = require('tslib');
var gLite = require('@antv/g-lite');
var util = require('@antv/util');

var DragndropPlugin = /** @class */ (function () {
    function DragndropPlugin(dragndropPluginOptions) {
        this.dragndropPluginOptions = dragndropPluginOptions;
    }
    DragndropPlugin.prototype.apply = function (context) {
        var _this = this;
        var renderingService = context.renderingService, renderingContext = context.renderingContext;
        var document = renderingContext.root.ownerDocument;
        // TODO: should we add an option like `draggable` to Canvas
        var canvas = document.defaultView;
        var handlePointerdown = function (event) {
            var target = event.target;
            var isDocument = target === document;
            var draggableEventTarget = isDocument && _this.dragndropPluginOptions.isDocumentDraggable
                ? document
                : target.closest && target.closest('[draggable=true]');
            // `draggable` may be set on ancestor nodes:
            // @see https://github.com/antvis/G/issues/1088
            if (draggableEventTarget) {
                // delay triggering dragstart event
                var dragstartTriggered_1 = false;
                var dragstartTimeStamp_1 = event.timeStamp;
                var dragstartClientCoordinates_1 = [
                    event.clientX,
                    event.clientY,
                ];
                var currentDroppable_1 = null;
                var lastDragClientCoordinates_1 = [event.clientX, event.clientY];
                // @ts-ignore
                // eslint-disable-next-line no-inner-declarations
                var handlePointermove_1 = function (event) { return tslib.__awaiter(_this, void 0, void 0, function () {
                    var timeElapsed, distanceMoved, point, elementsBelow, elementBelow, droppableBelow;
                    return tslib.__generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                if (!dragstartTriggered_1) {
                                    timeElapsed = event.timeStamp - dragstartTimeStamp_1;
                                    distanceMoved = util.distanceSquareRoot([event.clientX, event.clientY], dragstartClientCoordinates_1);
                                    // check thresholds
                                    if (timeElapsed <=
                                        this.dragndropPluginOptions.dragstartTimeThreshold ||
                                        distanceMoved <=
                                            this.dragndropPluginOptions.dragstartDistanceThreshold) {
                                        return [2 /*return*/];
                                    }
                                    // @see https://developer.mozilla.org/zh-CN/docs/Web/API/Document/dragstart_event
                                    event.type = 'dragstart';
                                    draggableEventTarget.dispatchEvent(event);
                                    dragstartTriggered_1 = true;
                                }
                                // @see https://developer.mozilla.org/zh-CN/docs/Web/API/Document/drag_event
                                event.type = 'drag';
                                // @ts-ignore
                                event.dx = event.clientX - lastDragClientCoordinates_1[0];
                                // @ts-ignore
                                event.dy = event.clientY - lastDragClientCoordinates_1[1];
                                draggableEventTarget.dispatchEvent(event);
                                lastDragClientCoordinates_1 = [event.clientX, event.clientY];
                                if (!!isDocument) return [3 /*break*/, 2];
                                point = this.dragndropPluginOptions.overlap === 'pointer'
                                    ? [event.canvasX, event.canvasY]
                                    : target.getBounds().center;
                                return [4 /*yield*/, document.elementsFromPoint(point[0], point[1])];
                            case 1:
                                elementsBelow = _a.sent();
                                elementBelow = elementsBelow[elementsBelow.indexOf(target) + 1];
                                droppableBelow = (elementBelow === null || elementBelow === void 0 ? void 0 : elementBelow.closest('[droppable=true]')) ||
                                    (this.dragndropPluginOptions.isDocumentDroppable
                                        ? document
                                        : null);
                                if (currentDroppable_1 !== droppableBelow) {
                                    if (currentDroppable_1) {
                                        // null when we were not over a droppable before this event
                                        // @see https://developer.mozilla.org/zh-CN/docs/Web/API/Document/dragleave_event
                                        event.type = 'dragleave';
                                        event.target = currentDroppable_1;
                                        currentDroppable_1.dispatchEvent(event);
                                    }
                                    if (droppableBelow) {
                                        // @see https://developer.mozilla.org/zh-CN/docs/Web/API/Document/dragleave_event
                                        event.type = 'dragenter';
                                        event.target = droppableBelow;
                                        droppableBelow.dispatchEvent(event);
                                    }
                                    currentDroppable_1 = droppableBelow;
                                    if (currentDroppable_1) {
                                        // null if we're not coming over a droppable now
                                        // @see https://developer.mozilla.org/zh-CN/docs/Web/API/Document/dragover_event
                                        event.type = 'dragover';
                                        event.target = currentDroppable_1;
                                        currentDroppable_1.dispatchEvent(event);
                                    }
                                }
                                _a.label = 2;
                            case 2: return [2 /*return*/];
                        }
                    });
                }); };
                canvas.addEventListener('pointermove', handlePointermove_1);
                var stopDragging = function (originalPointerUpEvent) {
                    if (dragstartTriggered_1) {
                        // prevent click event being triggerd
                        // @see https://github.com/antvis/G/issues/1091
                        originalPointerUpEvent.detail = {
                            preventClick: true,
                        };
                        // clone event first
                        var event_1 = originalPointerUpEvent.clone();
                        // drop should fire before dragend
                        // @see https://javascript.tutorialink.com/is-there-a-defined-ordering-between-dragend-and-drop-events/
                        if (currentDroppable_1) {
                            // @see https://developer.mozilla.org/zh-CN/docs/Web/API/Document/drop_event
                            event_1.type = 'drop';
                            event_1.target = currentDroppable_1;
                            currentDroppable_1.dispatchEvent(event_1);
                        }
                        // @see https://developer.mozilla.org/zh-CN/docs/Web/API/Document/dragend_event
                        event_1.type = 'dragend';
                        draggableEventTarget.dispatchEvent(event_1);
                        dragstartTriggered_1 = false;
                    }
                    canvas.removeEventListener('pointermove', handlePointermove_1);
                };
                target.addEventListener('pointerup', stopDragging, { once: true });
                target.addEventListener('pointerupoutside', stopDragging, {
                    once: true,
                });
            }
        };
        renderingService.hooks.init.tap(DragndropPlugin.tag, function () {
            canvas.addEventListener('pointerdown', handlePointerdown);
        });
        renderingService.hooks.destroy.tap(DragndropPlugin.tag, function () {
            canvas.removeEventListener('pointerdown', handlePointerdown);
        });
    };
    DragndropPlugin.tag = 'Dragndrop';
    return DragndropPlugin;
}());

var Plugin = /** @class */ (function (_super) {
    tslib.__extends(Plugin, _super);
    function Plugin(options) {
        if (options === void 0) { options = {}; }
        var _this = _super.call(this) || this;
        _this.options = options;
        _this.name = 'dragndrop';
        return _this;
    }
    Plugin.prototype.init = function () {
        this.addRenderingPlugin(new DragndropPlugin(tslib.__assign({ overlap: 'pointer', isDocumentDraggable: false, isDocumentDroppable: false, dragstartDistanceThreshold: 0, dragstartTimeThreshold: 0 }, this.options)));
    };
    Plugin.prototype.destroy = function () {
        this.removeAllRenderingPlugins();
    };
    Plugin.prototype.setOptions = function (options) {
        Object.assign(this.plugins[0].dragndropPluginOptions, options);
    };
    return Plugin;
}(gLite.AbstractRendererPlugin));

exports.Plugin = Plugin;
//# sourceMappingURL=index.js.map

}, function(modId) {var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1729954662258);
})()
//miniprogram-npm-outsideDeps=["tslib","@antv/g-lite","@antv/util"]
//# sourceMappingURL=index.js.map