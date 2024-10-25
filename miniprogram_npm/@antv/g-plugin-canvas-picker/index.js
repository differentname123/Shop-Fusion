module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1729528802049, function(require, module, exports) {


var tslib = require('tslib');
var gLite = require('@antv/g-lite');
var glMatrix = require('gl-matrix');
var gMath = require('@antv/g-math');
var util = require('@antv/util');

var tmpVec3a = glMatrix.vec3.create();
var tmpVec3b = glMatrix.vec3.create();
var tmpVec3c = glMatrix.vec3.create();
var tmpMat4 = glMatrix.mat4.create();
/**
 * pick shape(s) with Mouse/Touch event
 *
 * 1. find AABB with r-tree
 * 2. do math calculation with geometry in an accurate way
 */
var CanvasPickerPlugin = /** @class */ (function () {
    function CanvasPickerPlugin() {
        var _this = this;
        this.isHit = function (displayObject, position, worldTransform, isClipPath) {
            // use picker for current shape's type
            var pick = _this.context.pointInPathPickerFactory[displayObject.nodeName];
            if (pick) {
                // invert with world matrix
                var invertWorldMat = glMatrix.mat4.invert(tmpMat4, worldTransform);
                // transform client position to local space, do picking in local space
                var localPosition = glMatrix.vec3.transformMat4(tmpVec3b, glMatrix.vec3.set(tmpVec3c, position[0], position[1], 0), invertWorldMat);
                // account for anchor
                var halfExtents = displayObject.getGeometryBounds().halfExtents;
                var anchor = displayObject.parsedStyle.anchor;
                localPosition[0] += ((anchor && anchor[0]) || 0) * halfExtents[0] * 2;
                localPosition[1] += ((anchor && anchor[1]) || 0) * halfExtents[1] * 2;
                if (pick(displayObject, new gLite.Point(localPosition[0], localPosition[1]), isClipPath, _this.isPointInPath, _this.context, _this.runtime)) {
                    return true;
                }
            }
            return false;
        };
        /**
         * use native picking method
         * @see https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/isPointInPath
         */
        this.isPointInPath = function (displayObject, position) {
            var context = _this.runtime.offscreenCanvasCreator.getOrCreateContext(_this.context.config.offscreenCanvas);
            var generatePath = _this.context.pathGeneratorFactory[displayObject.nodeName];
            if (generatePath) {
                context.beginPath();
                generatePath(context, displayObject.parsedStyle);
                context.closePath();
            }
            return context.isPointInPath(position.x, position.y);
        };
    }
    CanvasPickerPlugin.prototype.apply = function (context, runtime) {
        var _this = this;
        var _a;
        var renderingService = context.renderingService, renderingContext = context.renderingContext;
        this.context = context;
        this.runtime = runtime;
        var document = (_a = renderingContext.root) === null || _a === void 0 ? void 0 : _a.ownerDocument;
        renderingService.hooks.pick.tapPromise(CanvasPickerPlugin.tag, function (result) { return tslib.__awaiter(_this, void 0, void 0, function () {
            return tslib.__generator(this, function (_a) {
                return [2 /*return*/, this.pick(document, result)];
            });
        }); });
        renderingService.hooks.pickSync.tap(CanvasPickerPlugin.tag, function (result) {
            return _this.pick(document, result);
        });
    };
    CanvasPickerPlugin.prototype.pick = function (document, result) {
        var e_1, _a;
        var topmost = result.topmost, _b = result.position, x = _b.x, y = _b.y;
        // position in world space
        var position = glMatrix.vec3.set(tmpVec3a, x, y, 0);
        // query by AABB first with spatial index(r-tree)
        var hitTestList = document.elementsFromBBox(position[0], position[1], position[0], position[1]);
        // test with clip path & origin shape
        // @see https://github.com/antvis/g/issues/1064
        var pickedDisplayObjects = [];
        try {
            for (var hitTestList_1 = tslib.__values(hitTestList), hitTestList_1_1 = hitTestList_1.next(); !hitTestList_1_1.done; hitTestList_1_1 = hitTestList_1.next()) {
                var displayObject = hitTestList_1_1.value;
                var worldTransform = displayObject.getWorldTransform();
                var isHitOriginShape = this.isHit(displayObject, position, worldTransform, false);
                if (isHitOriginShape) {
                    // should look up in the ancestor node
                    var clipped = gLite.findClosestClipPathTarget(displayObject);
                    if (clipped) {
                        var clipPath = clipped.parsedStyle.clipPath;
                        var isHitClipPath = this.isHit(clipPath, position, clipPath.getWorldTransform(), true);
                        if (isHitClipPath) {
                            if (topmost) {
                                result.picked = [displayObject];
                                return result;
                            }
                            else {
                                pickedDisplayObjects.push(displayObject);
                            }
                        }
                    }
                    else {
                        if (topmost) {
                            result.picked = [displayObject];
                            return result;
                        }
                        else {
                            pickedDisplayObjects.push(displayObject);
                        }
                    }
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (hitTestList_1_1 && !hitTestList_1_1.done && (_a = hitTestList_1.return)) _a.call(hitTestList_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        result.picked = pickedDisplayObjects;
        return result;
    };
    CanvasPickerPlugin.tag = 'CanvasPicker';
    return CanvasPickerPlugin;
}());

function isPointInPath$7(displayObject, position, isClipPath) {
    var _a = displayObject.parsedStyle, r = _a.r, fill = _a.fill, stroke = _a.stroke, lineWidth = _a.lineWidth, increasedLineWidthForHitTesting = _a.increasedLineWidthForHitTesting, pointerEvents = _a.pointerEvents;
    var halfLineWidth = ((lineWidth || 0) + (increasedLineWidthForHitTesting || 0)) / 2;
    var absDistance = gMath.distance(r, r, position.x, position.y);
    var _b = tslib.__read(gLite.isFillOrStrokeAffected(pointerEvents, fill, stroke), 2), hasFill = _b[0], hasStroke = _b[1];
    if ((hasFill && hasStroke) || isClipPath) {
        return absDistance <= r + halfLineWidth;
    }
    if (hasFill) {
        return absDistance <= r;
    }
    if (hasStroke) {
        return absDistance >= r - halfLineWidth && absDistance <= r + halfLineWidth;
    }
    return false;
}

function ellipseDistance(squareX, squareY, rx, ry) {
    return squareX / (rx * rx) + squareY / (ry * ry);
}
function isPointInPath$6(displayObject, position, isClipPath) {
    var _a = displayObject.parsedStyle, rx = _a.rx, ry = _a.ry, fill = _a.fill, stroke = _a.stroke, lineWidth = _a.lineWidth, increasedLineWidthForHitTesting = _a.increasedLineWidthForHitTesting, pointerEvents = _a.pointerEvents;
    var x = position.x, y = position.y;
    var _b = tslib.__read(gLite.isFillOrStrokeAffected(pointerEvents, fill, stroke), 2), hasFill = _b[0], hasStroke = _b[1];
    var halfLineWith = ((lineWidth || 0) + (increasedLineWidthForHitTesting || 0)) / 2;
    var squareX = (x - rx) * (x - rx);
    var squareY = (y - ry) * (y - ry);
    // 使用椭圆的公式： x*x/rx*rx + y*y/ry*ry = 1;
    if ((hasFill && hasStroke) || isClipPath) {
        return (ellipseDistance(squareX, squareY, rx + halfLineWith, ry + halfLineWith) <=
            1);
    }
    if (hasFill) {
        return ellipseDistance(squareX, squareY, rx, ry) <= 1;
    }
    if (hasStroke) {
        return (ellipseDistance(squareX, squareY, rx - halfLineWith, ry - halfLineWith) >=
            1 &&
            ellipseDistance(squareX, squareY, rx + halfLineWith, ry + halfLineWith) <=
                1);
    }
    return false;
}

function inBox(minX, minY, width, height, x, y) {
    return x >= minX && x <= minX + width && y >= minY && y <= minY + height;
}
function inRect(minX, minY, width, height, lineWidth, x, y) {
    var halfWidth = lineWidth / 2;
    // 将四个边看做矩形来检测，比边的检测算法要快
    return (inBox(minX - halfWidth, minY - halfWidth, width, lineWidth, x, y) || // 上边
        inBox(minX + width - halfWidth, minY - halfWidth, lineWidth, height, x, y) || // 右边
        inBox(minX + halfWidth, minY + height - halfWidth, width, lineWidth, x, y) || // 下边
        inBox(minX - halfWidth, minY + halfWidth, lineWidth, height, x, y)); // 左边
}
function inArc(cx, cy, r, startAngle, endAngle, lineWidth, x, y) {
    var angle = (Math.atan2(y - cy, x - cx) + Math.PI * 2) % (Math.PI * 2); // 转换到 0 - 2 * Math.PI 之间
    // if (angle < startAngle || angle > endAngle) {
    //   return false;
    // }
    var point = {
        x: cx + r * Math.cos(angle),
        y: cy + r * Math.sin(angle),
    };
    return gMath.distance(point.x, point.y, x, y) <= lineWidth / 2;
}
function inLine(x1, y1, x2, y2, lineWidth, x, y) {
    var minX = Math.min(x1, x2);
    var maxX = Math.max(x1, x2);
    var minY = Math.min(y1, y2);
    var maxY = Math.max(y1, y2);
    var halfWidth = lineWidth / 2;
    // 因为目前的方案是计算点到直线的距离，而有可能会在延长线上，所以要先判断是否在包围盒内
    // 这种方案会在水平或者竖直的情况下载线的延长线上有半 lineWidth 的误差
    if (!(x >= minX - halfWidth &&
        x <= maxX + halfWidth &&
        y >= minY - halfWidth &&
        y <= maxY + halfWidth)) {
        return false;
    }
    // 因为已经计算了包围盒，所以仅需要计算到直线的距离即可，可以显著提升性能
    return gMath.linePointToLine(x1, y1, x2, y2, x, y) <= lineWidth / 2;
}
function inPolyline(points, lineWidth, x, y, isClose) {
    var count = points.length;
    if (count < 2) {
        return false;
    }
    for (var i = 0; i < count - 1; i++) {
        var x1 = points[i][0];
        var y1 = points[i][1];
        var x2 = points[i + 1][0];
        var y2 = points[i + 1][1];
        if (inLine(x1, y1, x2, y2, lineWidth, x, y)) {
            return true;
        }
    }
    // 如果封闭，则计算起始点和结束点的边
    if (isClose) {
        var first = points[0];
        var last = points[count - 1];
        if (inLine(first[0], first[1], last[0], last[1], lineWidth, x, y)) {
            return true;
        }
    }
    return false;
}
// 多边形的射线检测，参考：https://blog.csdn.net/WilliamSun0122/article/details/77994526
var tolerance = 1e-6;
// 三态函数，判断两个double在eps精度下的大小关系
function dcmp(x) {
    if (Math.abs(x) < tolerance) {
        return 0;
    }
    return x < 0 ? -1 : 1;
}
// 判断点Q是否在p1和p2的线段上
function onSegment(p1, p2, q) {
    if ((q[0] - p1[0]) * (p2[1] - p1[1]) === (p2[0] - p1[0]) * (q[1] - p1[1]) &&
        Math.min(p1[0], p2[0]) <= q[0] &&
        q[0] <= Math.max(p1[0], p2[0]) &&
        Math.min(p1[1], p2[1]) <= q[1] &&
        q[1] <= Math.max(p1[1], p2[1])) {
        return true;
    }
    return false;
}
// 判断点P在多边形内-射线法
function inPolygon(points, x, y) {
    var isHit = false;
    var n = points.length;
    if (n <= 2) {
        // svg 中点小于 3 个时，不显示，也无法被拾取
        return false;
    }
    for (var i = 0; i < n; i++) {
        var p1 = points[i];
        var p2 = points[(i + 1) % n];
        if (onSegment(p1, p2, [x, y])) {
            // 点在多边形一条边上
            return true;
        }
        // 前一个判断min(p1[1],p2[1])<P.y<=max(p1[1],p2[1])
        // 后一个判断被测点 在 射线与边交点 的左边
        if (dcmp(p1[1] - y) > 0 !== dcmp(p2[1] - y) > 0 &&
            dcmp(x - ((y - p1[1]) * (p1[0] - p2[0])) / (p1[1] - p2[1]) - p1[0]) < 0) {
            isHit = !isHit;
        }
    }
    return isHit;
}
function inPolygons(polygons, x, y) {
    var isHit = false;
    for (var i = 0; i < polygons.length; i++) {
        var points = polygons[i];
        isHit = inPolygon(points, x, y);
        if (isHit) {
            break;
        }
    }
    return isHit;
}

function isPointInPath$5(displayObject, position, isClipPath) {
    var _a = displayObject.parsedStyle, x1 = _a.x1, y1 = _a.y1, x2 = _a.x2, y2 = _a.y2, lineWidth = _a.lineWidth, increasedLineWidthForHitTesting = _a.increasedLineWidthForHitTesting, _b = _a.defX, x = _b === void 0 ? 0 : _b, _c = _a.defY, y = _c === void 0 ? 0 : _c, pointerEvents = _a.pointerEvents, fill = _a.fill, stroke = _a.stroke;
    var _d = tslib.__read(gLite.isFillOrStrokeAffected(pointerEvents, fill, stroke), 2), hasStroke = _d[1];
    if ((!hasStroke && !isClipPath) || !lineWidth) {
        return false;
    }
    return inLine(x1, y1, x2, y2, (lineWidth || 0) + (increasedLineWidthForHitTesting || 0), position.x + x, position.y + y);
}

// TODO: replace it with method in @antv/util
function isPointInStroke(segments, lineWidth, px, py, length) {
    var isHit = false;
    var halfWidth = lineWidth / 2;
    for (var i = 0; i < segments.length; i++) {
        var segment = segments[i];
        var currentPoint = segment.currentPoint, params = segment.params, prePoint = segment.prePoint, box = segment.box;
        // 如果在前面已经生成过包围盒，直接按照包围盒计算
        if (box &&
            !inBox(box.x - halfWidth, box.y - halfWidth, box.width + lineWidth, box.height + lineWidth, px, py)) {
            continue;
        }
        switch (segment.command) {
            // L 和 Z 都是直线， M 不进行拾取
            case 'L':
            case 'Z':
                isHit = inLine(prePoint[0], prePoint[1], currentPoint[0], currentPoint[1], lineWidth, px, py);
                if (isHit) {
                    return true;
                }
                break;
            case 'Q':
                var qDistance = gMath.quadPointDistance(prePoint[0], prePoint[1], params[1], params[2], params[3], params[4], px, py);
                isHit = qDistance <= lineWidth / 2;
                if (isHit) {
                    return true;
                }
                break;
            case 'C':
                var cDistance = gMath.cubicPointDistance(prePoint[0], // 上一段结束位置, 即 C 的起始点
                prePoint[1], params[1], // 'C' 的参数，1、2 为第一个控制点，3、4 为第二个控制点，5、6 为结束点
                params[2], params[3], params[4], params[5], params[6], px, py, length);
                isHit = cDistance <= lineWidth / 2;
                if (isHit) {
                    return true;
                }
                break;
            case 'A':
                // cache conversion result
                if (!segment.cubicParams) {
                    segment.cubicParams = util.arcToCubic(prePoint[0], prePoint[1], params[1], params[2], params[3], params[4], params[5], params[6], params[7], undefined);
                }
                var args = segment.cubicParams;
                // fixArc
                var prePointInCubic = prePoint;
                for (var i_1 = 0; i_1 < args.length; i_1 += 6) {
                    var cDistance_1 = gMath.cubicPointDistance(prePointInCubic[0], // 上一段结束位置, 即 C 的起始点
                    prePointInCubic[1], args[i_1], args[i_1 + 1], args[i_1 + 2], args[i_1 + 3], args[i_1 + 4], args[i_1 + 5], px, py, length);
                    prePointInCubic = [args[i_1 + 4], args[i_1 + 5]];
                    isHit = cDistance_1 <= lineWidth / 2;
                    if (isHit) {
                        return true;
                    }
                }
                break;
        }
    }
    return isHit;
}
function isPointInPath$4(displayObject, position, isClipPath, isPointInPath, renderingPluginContext, runtime) {
    var _a = displayObject.parsedStyle, lineWidth = _a.lineWidth, increasedLineWidthForHitTesting = _a.increasedLineWidthForHitTesting, stroke = _a.stroke, fill = _a.fill, _b = _a.defX, x = _b === void 0 ? 0 : _b, _c = _a.defY, y = _c === void 0 ? 0 : _c, path = _a.path, pointerEvents = _a.pointerEvents;
    var segments = path.segments, hasArc = path.hasArc, polylines = path.polylines, polygons = path.polygons;
    var _d = tslib.__read(gLite.isFillOrStrokeAffected(pointerEvents, 
    // Only a closed path can be filled.
    (polygons === null || polygons === void 0 ? void 0 : polygons.length) && fill, stroke), 2), hasFill = _d[0], hasStroke = _d[1];
    var totalLength = gLite.getOrCalculatePathTotalLength(displayObject);
    var isHit = false;
    if (hasFill || isClipPath) {
        if (hasArc) {
            // 存在曲线时，暂时使用 canvas 的 api 计算，后续可以进行多边形切割
            isHit = isPointInPath(displayObject, position);
        }
        else {
            // 提取出来的多边形包含闭合的和非闭合的，在这里统一按照多边形处理
            isHit =
                inPolygons(polygons, position.x + x, position.y + y) ||
                    inPolygons(polylines, position.x + x, position.y + y);
        }
        return isHit;
    }
    else if (hasStroke || isClipPath) {
        isHit = isPointInStroke(segments, (lineWidth || 0) + (increasedLineWidthForHitTesting || 0), position.x + x, position.y + y, totalLength);
    }
    return isHit;
}

function isPointInPath$3(displayObject, position, isClipPath) {
    var _a = displayObject.parsedStyle, stroke = _a.stroke, fill = _a.fill, lineWidth = _a.lineWidth, increasedLineWidthForHitTesting = _a.increasedLineWidthForHitTesting, points = _a.points, _b = _a.defX, x = _b === void 0 ? 0 : _b, _c = _a.defY, y = _c === void 0 ? 0 : _c, pointerEvents = _a.pointerEvents;
    var _d = tslib.__read(gLite.isFillOrStrokeAffected(pointerEvents, fill, stroke), 2), hasFill = _d[0], hasStroke = _d[1];
    var isHit = false;
    if (hasStroke || isClipPath) {
        isHit = inPolyline(points.points, (lineWidth || 0) + (increasedLineWidthForHitTesting || 0), position.x + x, position.y + y, true);
    }
    if (!isHit && (hasFill || isClipPath)) {
        isHit = inPolygon(points.points, position.x + x, position.y + y);
    }
    return isHit;
}

function isPointInPath$2(displayObject, position, isClipPath) {
    var _a = displayObject.parsedStyle, lineWidth = _a.lineWidth, increasedLineWidthForHitTesting = _a.increasedLineWidthForHitTesting, points = _a.points, _b = _a.defX, x = _b === void 0 ? 0 : _b, _c = _a.defY, y = _c === void 0 ? 0 : _c, pointerEvents = _a.pointerEvents, fill = _a.fill, stroke = _a.stroke;
    var _d = tslib.__read(gLite.isFillOrStrokeAffected(pointerEvents, fill, stroke), 2), hasStroke = _d[1];
    if ((!hasStroke && !isClipPath) || !lineWidth) {
        return false;
    }
    return inPolyline(points.points, (lineWidth || 0) + (increasedLineWidthForHitTesting || 0), position.x + x, position.y + y, false);
}

function isPointInPath$1(displayObject, position, isClipPath, isPointInPath, runtime) {
    var _a = displayObject.parsedStyle, radius = _a.radius, fill = _a.fill, stroke = _a.stroke, lineWidth = _a.lineWidth, increasedLineWidthForHitTesting = _a.increasedLineWidthForHitTesting, width = _a.width, height = _a.height, pointerEvents = _a.pointerEvents;
    var _b = tslib.__read(gLite.isFillOrStrokeAffected(pointerEvents, fill, stroke), 2), hasFill = _b[0], hasStroke = _b[1];
    var hasRadius = radius && radius.some(function (r) { return r !== 0; });
    var lineWidthForHitTesting = (lineWidth || 0) + (increasedLineWidthForHitTesting || 0);
    // 无圆角时的策略
    if (!hasRadius) {
        var halfWidth = lineWidthForHitTesting / 2;
        // 同时填充和带有边框
        if ((hasFill && hasStroke) || isClipPath) {
            return inBox(0 - halfWidth, 0 - halfWidth, width + halfWidth, height + halfWidth, position.x, position.y);
        }
        // 仅填充
        if (hasFill) {
            return inBox(0, 0, width, height, position.x, position.y);
        }
        if (hasStroke) {
            return inRect(0, 0, width, height, lineWidthForHitTesting, position.x, position.y);
        }
    }
    else {
        var isHit = false;
        if (hasStroke || isClipPath) {
            isHit = inRectWithRadius(0, 0, width, height, radius.map(function (r) {
                return util.clamp(r, 0, Math.min(Math.abs(width) / 2, Math.abs(height) / 2));
            }), lineWidthForHitTesting, position.x, position.y);
        }
        // 仅填充时带有圆角的矩形直接通过图形拾取
        // 以后可以改成纯数学的近似拾取，将圆弧切割成多边形
        if (!isHit && (hasFill || isClipPath)) {
            isHit = isPointInPath(displayObject, position);
        }
        return isHit;
    }
    return false;
}
function inRectWithRadius(minX, minY, width, height, radiusArray, lineWidth, x, y) {
    var _a = tslib.__read(radiusArray, 4), tlr = _a[0], trr = _a[1], brr = _a[2], blr = _a[3];
    return (inLine(minX + tlr, minY, minX + width - trr, minY, lineWidth, x, y) ||
        inLine(minX + width, minY + trr, minX + width, minY + height - brr, lineWidth, x, y) ||
        inLine(minX + width - brr, minY + height, minX + blr, minY + height, lineWidth, x, y) ||
        inLine(minX, minY + height - blr, minX, minY + tlr, lineWidth, x, y) ||
        inArc(minX + width - trr, minY + trr, trr, 1.5 * Math.PI, 2 * Math.PI, lineWidth, x, y) ||
        inArc(minX + width - brr, minY + height - brr, brr, 0, 0.5 * Math.PI, lineWidth, x, y) ||
        inArc(minX + blr, minY + height - blr, blr, 0.5 * Math.PI, Math.PI, lineWidth, x, y) ||
        inArc(minX + tlr, minY + tlr, tlr, Math.PI, 1.5 * Math.PI, lineWidth, x, y));
}

function isPointInPath(displayObject, position, isClipPath, isPointInPath, renderingPluginContext, runtime) {
    var _a = displayObject.parsedStyle, pointerEvents = _a.pointerEvents, width = _a.width, height = _a.height;
    if (pointerEvents === 'non-transparent-pixel') {
        var offscreenCanvas = renderingPluginContext.config.offscreenCanvas;
        var canvas = runtime.offscreenCanvasCreator.getOrCreateCanvas(offscreenCanvas);
        var context = runtime.offscreenCanvasCreator.getOrCreateContext(offscreenCanvas, {
            willReadFrequently: true,
        });
        canvas.width = width;
        canvas.height = height;
        renderingPluginContext.defaultStyleRendererFactory[gLite.Shape.IMAGE].render(context, displayObject.parsedStyle, displayObject, undefined, undefined, undefined);
        var imagedata = context.getImageData(position.x, position.y, 1, 1).data;
        return imagedata.every(function (component) { return component !== 0; });
    }
    return true;
}

var Plugin = /** @class */ (function (_super) {
    tslib.__extends(Plugin, _super);
    function Plugin() {
        var _this = _super.apply(this, tslib.__spreadArray([], tslib.__read(arguments), false)) || this;
        _this.name = 'canvas-picker';
        return _this;
    }
    Plugin.prototype.init = function () {
        var _a;
        var trueFunc = function () { return true; };
        var pointInPathPickerFactory = (_a = {},
            _a[gLite.Shape.CIRCLE] = isPointInPath$7,
            _a[gLite.Shape.ELLIPSE] = isPointInPath$6,
            _a[gLite.Shape.RECT] = isPointInPath$1,
            _a[gLite.Shape.LINE] = isPointInPath$5,
            _a[gLite.Shape.POLYLINE] = isPointInPath$2,
            _a[gLite.Shape.POLYGON] = isPointInPath$3,
            _a[gLite.Shape.PATH] = isPointInPath$4,
            _a[gLite.Shape.TEXT] = trueFunc,
            _a[gLite.Shape.GROUP] = null,
            _a[gLite.Shape.IMAGE] = isPointInPath,
            _a[gLite.Shape.HTML] = null,
            _a[gLite.Shape.MESH] = null,
            _a);
        // @ts-ignore
        this.context.pointInPathPickerFactory = pointInPathPickerFactory;
        this.addRenderingPlugin(new CanvasPickerPlugin());
    };
    Plugin.prototype.destroy = function () {
        // @ts-ignore
        delete this.context.pointInPathPickerFactory;
        this.removeAllRenderingPlugins();
    };
    return Plugin;
}(gLite.AbstractRendererPlugin));

exports.Plugin = Plugin;
//# sourceMappingURL=index.js.map

}, function(modId) {var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1729528802049);
})()
//miniprogram-npm-outsideDeps=["tslib","@antv/g-lite","gl-matrix","@antv/g-math","@antv/util"]
//# sourceMappingURL=index.js.map