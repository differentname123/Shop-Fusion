module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1729528802048, function(require, module, exports) {


var tslib = require('tslib');
var gLite = require('@antv/g-lite');
var util = require('@antv/util');

function generatePath$6(context, parsedStyle) {
    var r = parsedStyle.r;
    context.arc(r, r, r, 0, Math.PI * 2, false);
}

function generatePath$5(context, parsedStyle) {
    var rxInPixels = parsedStyle.rx, ryInPixels = parsedStyle.ry;
    var rx = rxInPixels;
    var ry = ryInPixels;
    // @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/ellipse
    if (context.ellipse) {
        context.ellipse(rx, ry, rx, ry, 0, 0, Math.PI * 2, false);
    }
    else {
        // 如果不支持，则使用圆来绘制，进行变形
        var r = rx > ry ? rx : ry;
        var scaleX = rx > ry ? 1 : rx / ry;
        var scaleY = rx > ry ? ry / rx : 1;
        context.save();
        context.scale(scaleX, scaleY);
        context.arc(r, r, r, 0, Math.PI * 2);
    }
}

function generatePath$4(context, parsedStyle) {
    var x1 = parsedStyle.x1, y1 = parsedStyle.y1, x2 = parsedStyle.x2, y2 = parsedStyle.y2, _a = parsedStyle.defX, defX = _a === void 0 ? 0 : _a, _b = parsedStyle.defY, defY = _b === void 0 ? 0 : _b, markerStart = parsedStyle.markerStart, markerEnd = parsedStyle.markerEnd, markerStartOffset = parsedStyle.markerStartOffset, markerEndOffset = parsedStyle.markerEndOffset;
    var startOffsetX = 0;
    var startOffsetY = 0;
    var endOffsetX = 0;
    var endOffsetY = 0;
    var rad = 0;
    var x;
    var y;
    if (markerStart && gLite.isDisplayObject(markerStart) && markerStartOffset) {
        x = x2 - x1;
        y = y2 - y1;
        rad = Math.atan2(y, x);
        startOffsetX = Math.cos(rad) * (markerStartOffset || 0);
        startOffsetY = Math.sin(rad) * (markerStartOffset || 0);
    }
    if (markerEnd && gLite.isDisplayObject(markerEnd) && markerEndOffset) {
        x = x1 - x2;
        y = y1 - y2;
        rad = Math.atan2(y, x);
        endOffsetX = Math.cos(rad) * (markerEndOffset || 0);
        endOffsetY = Math.sin(rad) * (markerEndOffset || 0);
    }
    context.moveTo(x1 - defX + startOffsetX, y1 - defY + startOffsetY);
    context.lineTo(x2 - defX + endOffsetX, y2 - defY + endOffsetY);
}

function generatePath$3(context, parsedStyle) {
    var _a = parsedStyle.defX, defX = _a === void 0 ? 0 : _a, _b = parsedStyle.defY, defY = _b === void 0 ? 0 : _b, markerStart = parsedStyle.markerStart, markerEnd = parsedStyle.markerEnd, markerStartOffset = parsedStyle.markerStartOffset, markerEndOffset = parsedStyle.markerEndOffset;
    var _c = parsedStyle.path, absolutePath = _c.absolutePath, segments = _c.segments;
    var startOffsetX = 0;
    var startOffsetY = 0;
    var endOffsetX = 0;
    var endOffsetY = 0;
    var rad = 0;
    var x;
    var y;
    if (markerStart && gLite.isDisplayObject(markerStart) && markerStartOffset) {
        var _d = tslib.__read(markerStart.parentNode.getStartTangent(), 2), p1 = _d[0], p2 = _d[1];
        x = p1[0] - p2[0];
        y = p1[1] - p2[1];
        rad = Math.atan2(y, x);
        startOffsetX = Math.cos(rad) * (markerStartOffset || 0);
        startOffsetY = Math.sin(rad) * (markerStartOffset || 0);
    }
    if (markerEnd && gLite.isDisplayObject(markerEnd) && markerEndOffset) {
        var _e = tslib.__read(markerEnd.parentNode.getEndTangent(), 2), p1 = _e[0], p2 = _e[1];
        x = p1[0] - p2[0];
        y = p1[1] - p2[1];
        rad = Math.atan2(y, x);
        endOffsetX = Math.cos(rad) * (markerEndOffset || 0);
        endOffsetY = Math.sin(rad) * (markerEndOffset || 0);
    }
    for (var i = 0; i < absolutePath.length; i++) {
        var params = absolutePath[i];
        var command = params[0];
        var nextSegment = absolutePath[i + 1];
        var useStartOffset = i === 0 && (startOffsetX !== 0 || startOffsetY !== 0);
        var useEndOffset = (i === absolutePath.length - 1 ||
            (nextSegment && (nextSegment[0] === 'M' || nextSegment[0] === 'Z'))) &&
            endOffsetX !== 0 &&
            endOffsetY !== 0;
        switch (command) {
            case 'M':
                // Use start marker offset
                if (useStartOffset) {
                    context.moveTo(params[1] - defX + startOffsetX, params[2] - defY + startOffsetY);
                    context.lineTo(params[1] - defX, params[2] - defY);
                }
                else {
                    context.moveTo(params[1] - defX, params[2] - defY);
                }
                break;
            case 'L':
                if (useEndOffset) {
                    context.lineTo(params[1] - defX + endOffsetX, params[2] - defY + endOffsetY);
                }
                else {
                    context.lineTo(params[1] - defX, params[2] - defY);
                }
                break;
            case 'Q':
                context.quadraticCurveTo(params[1] - defX, params[2] - defY, params[3] - defX, params[4] - defY);
                if (useEndOffset) {
                    context.lineTo(params[3] - defX + endOffsetX, params[4] - defY + endOffsetY);
                }
                break;
            case 'C':
                context.bezierCurveTo(params[1] - defX, params[2] - defY, params[3] - defX, params[4] - defY, params[5] - defX, params[6] - defY);
                if (useEndOffset) {
                    context.lineTo(params[5] - defX + endOffsetX, params[6] - defY + endOffsetY);
                }
                break;
            case 'A': {
                var arcParams = segments[i].arcParams;
                var cx = arcParams.cx, cy = arcParams.cy, rx = arcParams.rx, ry = arcParams.ry, startAngle = arcParams.startAngle, endAngle = arcParams.endAngle, xRotation = arcParams.xRotation, sweepFlag = arcParams.sweepFlag;
                // @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/ellipse
                if (context.ellipse) {
                    context.ellipse(cx - defX, cy - defY, rx, ry, xRotation, startAngle, endAngle, !!(1 - sweepFlag));
                }
                else {
                    // @see https://stackoverflow.com/a/47494351
                    var r = rx > ry ? rx : ry;
                    var scaleX = rx > ry ? 1 : rx / ry;
                    var scaleY = rx > ry ? ry / rx : 1;
                    context.translate(cx - defX, cy - defY);
                    context.rotate(xRotation);
                    context.scale(scaleX, scaleY);
                    context.arc(0, 0, r, startAngle, endAngle, !!(1 - sweepFlag));
                    context.scale(1 / scaleX, 1 / scaleY);
                    context.rotate(-xRotation);
                    context.translate(-(cx - defX), -(cy - defY));
                }
                if (useEndOffset) {
                    context.lineTo(params[6] - defX + endOffsetX, params[7] - defY + endOffsetY);
                }
                break;
            }
            case 'Z':
                context.closePath();
                break;
        }
    }
}

function generatePath$2(context, parsedStyle) {
    var _a = parsedStyle.defX, defX = _a === void 0 ? 0 : _a, _b = parsedStyle.defY, defY = _b === void 0 ? 0 : _b, markerStart = parsedStyle.markerStart, markerEnd = parsedStyle.markerEnd, markerStartOffset = parsedStyle.markerStartOffset, markerEndOffset = parsedStyle.markerEndOffset;
    var points = parsedStyle.points.points;
    var length = points.length;
    var x1 = points[0][0] - defX;
    var y1 = points[0][1] - defY;
    var x2 = points[length - 1][0] - defX;
    var y2 = points[length - 1][1] - defY;
    var startOffsetX = 0;
    var startOffsetY = 0;
    var endOffsetX = 0;
    var endOffsetY = 0;
    var rad = 0;
    var x;
    var y;
    if (markerStart && gLite.isDisplayObject(markerStart) && markerStartOffset) {
        x = points[1][0] - points[0][0];
        y = points[1][1] - points[0][1];
        rad = Math.atan2(y, x);
        startOffsetX = Math.cos(rad) * (markerStartOffset || 0);
        startOffsetY = Math.sin(rad) * (markerStartOffset || 0);
    }
    if (markerEnd && gLite.isDisplayObject(markerEnd) && markerEndOffset) {
        x = points[length - 1][0] - points[0][0];
        y = points[length - 1][1] - points[0][1];
        rad = Math.atan2(y, x);
        endOffsetX = Math.cos(rad) * (markerEndOffset || 0);
        endOffsetY = Math.sin(rad) * (markerEndOffset || 0);
    }
    context.moveTo(x1 + (startOffsetX || endOffsetX), y1 + (startOffsetY || endOffsetY));
    for (var i = 1; i < length - 1; i++) {
        var point = points[i];
        context.lineTo(point[0] - defX, point[1] - defY);
    }
    context.lineTo(x2, y2);
}

function generatePath$1(context, parsedStyle) {
    var _a = parsedStyle.defX, defX = _a === void 0 ? 0 : _a, _b = parsedStyle.defY, defY = _b === void 0 ? 0 : _b, markerStart = parsedStyle.markerStart, markerEnd = parsedStyle.markerEnd, markerStartOffset = parsedStyle.markerStartOffset, markerEndOffset = parsedStyle.markerEndOffset;
    var points = parsedStyle.points.points;
    var length = points.length;
    var x1 = points[0][0] - defX;
    var y1 = points[0][1] - defY;
    var x2 = points[length - 1][0] - defX;
    var y2 = points[length - 1][1] - defY;
    var startOffsetX = 0;
    var startOffsetY = 0;
    var endOffsetX = 0;
    var endOffsetY = 0;
    var rad = 0;
    var x;
    var y;
    if (markerStart && gLite.isDisplayObject(markerStart) && markerStartOffset) {
        x = points[1][0] - points[0][0];
        y = points[1][1] - points[0][1];
        rad = Math.atan2(y, x);
        startOffsetX = Math.cos(rad) * (markerStartOffset || 0);
        startOffsetY = Math.sin(rad) * (markerStartOffset || 0);
    }
    if (markerEnd && gLite.isDisplayObject(markerEnd) && markerEndOffset) {
        x = points[length - 2][0] - points[length - 1][0];
        y = points[length - 2][1] - points[length - 1][1];
        rad = Math.atan2(y, x);
        endOffsetX = Math.cos(rad) * (markerEndOffset || 0);
        endOffsetY = Math.sin(rad) * (markerEndOffset || 0);
    }
    context.moveTo(x1 + startOffsetX, y1 + startOffsetY);
    for (var i = 1; i < length - 1; i++) {
        var point = points[i];
        context.lineTo(point[0] - defX, point[1] - defY);
    }
    context.lineTo(x2 + endOffsetX, y2 + endOffsetY);
}

function generatePath(context, parsedStyle) {
    var radius = parsedStyle.radius, width = parsedStyle.width, height = parsedStyle.height;
    var w = width;
    var h = height;
    var hasRadius = radius && radius.some(function (r) { return r !== 0; });
    if (!hasRadius) {
        // Canvas support negative width/height of rect
        context.rect(0, 0, w, h);
    }
    else {
        var signX = width > 0 ? 1 : -1;
        var signY = height > 0 ? 1 : -1;
        var sweepFlag = signX + signY === 0;
        var _a = tslib.__read(radius.map(function (r) {
            return util.clamp(r, 0, Math.min(Math.abs(w) / 2, Math.abs(h) / 2));
        }), 4), tlr = _a[0], trr = _a[1], brr = _a[2], blr = _a[3];
        context.moveTo(signX * tlr, 0);
        context.lineTo(w - signX * trr, 0);
        if (trr !== 0) {
            context.arc(w - signX * trr, signY * trr, trr, (-signY * Math.PI) / 2, signX > 0 ? 0 : Math.PI, sweepFlag);
        }
        context.lineTo(w, h - signY * brr);
        if (brr !== 0) {
            context.arc(w - signX * brr, h - signY * brr, brr, signX > 0 ? 0 : Math.PI, signY > 0 ? Math.PI / 2 : 1.5 * Math.PI, sweepFlag);
        }
        context.lineTo(signX * blr, h);
        if (blr !== 0) {
            context.arc(signX * blr, h - signY * blr, blr, signY > 0 ? Math.PI / 2 : -Math.PI / 2, signX > 0 ? Math.PI : 0, sweepFlag);
        }
        context.lineTo(0, signY * tlr);
        if (tlr !== 0) {
            context.arc(signX * tlr, signY * tlr, tlr, signX > 0 ? Math.PI : 0, signY > 0 ? Math.PI * 1.5 : Math.PI / 2, sweepFlag);
        }
    }
}

var Plugin = /** @class */ (function (_super) {
    tslib.__extends(Plugin, _super);
    function Plugin() {
        var _this = _super.apply(this, tslib.__spreadArray([], tslib.__read(arguments), false)) || this;
        _this.name = 'canvas-path-generator';
        return _this;
    }
    Plugin.prototype.init = function () {
        var _a;
        var pathGeneratorFactory = (_a = {},
            _a[gLite.Shape.CIRCLE] = generatePath$6,
            _a[gLite.Shape.ELLIPSE] = generatePath$5,
            _a[gLite.Shape.RECT] = generatePath,
            _a[gLite.Shape.LINE] = generatePath$4,
            _a[gLite.Shape.POLYLINE] = generatePath$1,
            _a[gLite.Shape.POLYGON] = generatePath$2,
            _a[gLite.Shape.PATH] = generatePath$3,
            _a[gLite.Shape.TEXT] = undefined,
            _a[gLite.Shape.GROUP] = undefined,
            _a[gLite.Shape.IMAGE] = undefined,
            _a[gLite.Shape.HTML] = undefined,
            _a[gLite.Shape.MESH] = undefined,
            _a);
        // @ts-ignore
        this.context.pathGeneratorFactory = pathGeneratorFactory;
    };
    Plugin.prototype.destroy = function () {
        // @ts-ignore
        delete this.context.pathGeneratorFactory;
    };
    return Plugin;
}(gLite.AbstractRendererPlugin));

exports.Plugin = Plugin;
//# sourceMappingURL=index.js.map

}, function(modId) {var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1729528802048);
})()
//miniprogram-npm-outsideDeps=["tslib","@antv/g-lite","@antv/util"]
//# sourceMappingURL=index.js.map