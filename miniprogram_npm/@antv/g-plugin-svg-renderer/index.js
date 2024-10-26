module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1729954662264, function(require, module, exports) {


var tslib = require('tslib');
var gLite = require('@antv/g-lite');
var util = require('@antv/util');
var glMatrix = require('gl-matrix');

var ElementSVG = /** @class */ (function () {
    function ElementSVG() {
    }
    ElementSVG.tag = 'c-svg-element';
    return ElementSVG;
}());

function updateImageElementAttribute($el, parsedStyle) {
    var _a = parsedStyle.img, img = _a === void 0 ? '' : _a, width = parsedStyle.width, height = parsedStyle.height;
    $el.setAttribute('x', '0');
    $el.setAttribute('y', '0');
    if (util.isString(img)) {
        $el.setAttribute('href', img);
    }
    else if (img instanceof Image) {
        if (!width) {
            $el.setAttribute('width', "".concat(img.width));
            // TODO: set renderable.boundsDirty
            // this.attr('width', img.width);
        }
        if (!height) {
            $el.setAttribute('height', "".concat(img.height));
            // this.attr('height', img.height);
        }
        $el.setAttribute('href', img.src);
    }
    else if (
    // @ts-ignore
    img instanceof HTMLElement &&
        util.isString(img.nodeName) &&
        img.nodeName.toUpperCase() === 'CANVAS') {
        $el.setAttribute('href', img.toDataURL());
        // @ts-ignore
    }
    else if (img instanceof ImageData) {
        var canvas = document.createElement('canvas');
        // @ts-ignore
        canvas.setAttribute('width', "".concat(img.width));
        // @ts-ignore
        canvas.setAttribute('height', "".concat(img.height));
        var context = canvas.getContext('2d');
        if (context) {
            context.putImageData(img, 0, 0);
            if (!width) {
                // @ts-ignore
                $el.setAttribute('width', "".concat(img.width));
                // this.attr('width', img.width);
            }
            if (!height) {
                // @ts-ignore
                $el.setAttribute('height', "".concat(img.height));
                // this.attr('height', img.height);
            }
            $el.setAttribute('href', canvas.toDataURL());
        }
    }
}

function updateLineElementAttribute($el, parsedStyle) {
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
    // @see https://github.com/antvis/g/issues/1038
    $el.setAttribute('x1', "".concat(x1 - defX + startOffsetX));
    $el.setAttribute('y1', "".concat(y1 - defY + startOffsetY));
    $el.setAttribute('x2', "".concat(x2 - defX + endOffsetX));
    $el.setAttribute('y2', "".concat(y2 - defY + endOffsetY));
}

function updatePathElementAttribute($el, parsedStyle) {
    var path = parsedStyle.path, _a = parsedStyle.defX, defX = _a === void 0 ? 0 : _a, _b = parsedStyle.defY, defY = _b === void 0 ? 0 : _b, markerStart = parsedStyle.markerStart, markerEnd = parsedStyle.markerEnd, markerStartOffset = parsedStyle.markerStartOffset, markerEndOffset = parsedStyle.markerEndOffset;
    var startOffsetX = 0;
    var startOffsetY = 0;
    var endOffsetX = 0;
    var endOffsetY = 0;
    var rad = 0;
    var x;
    var y;
    if (markerStart && gLite.isDisplayObject(markerStart) && markerStartOffset) {
        var _c = tslib.__read(markerStart.parentNode.getStartTangent(), 2), p1 = _c[0], p2 = _c[1];
        x = p1[0] - p2[0];
        y = p1[1] - p2[1];
        rad = Math.atan2(y, x);
        startOffsetX = Math.cos(rad) * (markerStartOffset || 0);
        startOffsetY = Math.sin(rad) * (markerStartOffset || 0);
    }
    if (markerEnd && gLite.isDisplayObject(markerEnd) && markerEndOffset) {
        var _d = tslib.__read(markerEnd.parentNode.getEndTangent(), 2), p1 = _d[0], p2 = _d[1];
        x = p1[0] - p2[0];
        y = p1[1] - p2[1];
        rad = Math.atan2(y, x);
        endOffsetX = Math.cos(rad) * (markerEndOffset || 0);
        endOffsetY = Math.sin(rad) * (markerEndOffset || 0);
    }
    $el.setAttribute('d', gLite.translatePathToString(path.absolutePath, defX, defY, startOffsetX, startOffsetY, endOffsetX, endOffsetY));
}

function updatePolylineElementAttribute($el, parsedStyle) {
    var points = parsedStyle.points.points, _a = parsedStyle.defX, defX = _a === void 0 ? 0 : _a, _b = parsedStyle.defY, defY = _b === void 0 ? 0 : _b, markerStart = parsedStyle.markerStart, markerStartOffset = parsedStyle.markerStartOffset, markerEnd = parsedStyle.markerEnd, markerEndOffset = parsedStyle.markerEndOffset;
    var length = points.length;
    if (points && length >= 2) {
        var startOffsetX_1 = 0;
        var startOffsetY_1 = 0;
        var endOffsetX_1 = 0;
        var endOffsetY_1 = 0;
        var rad = 0;
        var x = void 0;
        var y = void 0;
        if (markerStart && gLite.isDisplayObject(markerStart) && markerStartOffset) {
            x = points[1][0] - points[0][0];
            y = points[1][1] - points[0][1];
            rad = Math.atan2(y, x);
            startOffsetX_1 = Math.cos(rad) * (markerStartOffset || 0);
            startOffsetY_1 = Math.sin(rad) * (markerStartOffset || 0);
        }
        if (markerEnd && gLite.isDisplayObject(markerEnd) && markerEndOffset) {
            x = points[length - 2][0] - points[length - 1][0];
            y = points[length - 2][1] - points[length - 1][1];
            rad = Math.atan2(y, x);
            endOffsetX_1 = Math.cos(rad) * (markerEndOffset || 0);
            endOffsetY_1 = Math.sin(rad) * (markerEndOffset || 0);
        }
        $el.setAttribute('points', points
            .map(function (point, i) {
            var offsetX = 0;
            var offsetY = 0;
            if (i === 0) {
                offsetX = startOffsetX_1;
                offsetY = startOffsetY_1;
            }
            else if (i === length - 1) {
                offsetX = endOffsetX_1;
                offsetY = endOffsetY_1;
            }
            return "".concat(point[0] - defX + offsetX, ",").concat(point[1] - defY + offsetY);
        })
            .join(' '));
    }
}

function updateRectElementAttribute($el, parsedStyle) {
    var radius = parsedStyle.radius, width = parsedStyle.width, height = parsedStyle.height;
    // CSSKeyword: auto
    if (!isFinite(width) || !isFinite(height)) {
        return;
    }
    var hasRadius = radius && radius.some(function (r) { return r !== 0; });
    var d = '';
    if (!hasRadius) {
        d = "M 0,0 l ".concat(width, ",0 l 0,").concat(height, " l").concat(-width, " 0 z");
    }
    else {
        var _a = tslib.__read(radius.map(function (r) {
            return util.clamp(r, 0, Math.min(Math.abs(width) / 2, Math.abs(height) / 2));
        }), 4), tlr = _a[0], trr = _a[1], brr = _a[2], blr = _a[3];
        var signX = width > 0 ? 1 : -1;
        var signY = height > 0 ? 1 : -1;
        // sweep-flag @see https://developer.mozilla.org/zh-CN/docs/Web/SVG/Tutorial/Paths#arcs
        var sweepFlag = signX + signY !== 0 ? 1 : 0;
        d = [
            ["M ".concat(signX * tlr, ",0")],
            ["l ".concat(width - signX * (tlr + trr), ",0")],
            ["a ".concat(trr, ",").concat(trr, ",0,0,").concat(sweepFlag, ",").concat(signX * trr, ",").concat(signY * trr)],
            ["l 0,".concat(height - signY * (trr + brr))],
            ["a ".concat(brr, ",").concat(brr, ",0,0,").concat(sweepFlag, ",").concat(-signX * brr, ",").concat(signY * brr)],
            ["l ".concat(signX * (brr + blr) - width, ",0")],
            ["a ".concat(blr, ",").concat(blr, ",0,0,").concat(sweepFlag, ",").concat(-signX * blr, ",").concat(-signY * blr)],
            ["l 0,".concat(signY * (blr + tlr) - height)],
            ["a ".concat(tlr, ",").concat(tlr, ",0,0,").concat(sweepFlag, ",").concat(signX * tlr, ",").concat(-signY * tlr)],
            ['z'],
        ].join(' ');
    }
    $el.setAttribute('d', d);
}

function createSVGElement(type, doc) {
    return (doc || document).createElementNS('http://www.w3.org/2000/svg', type);
}

var FILTER_PREFIX = 'g-filter-';
/**
 * use SVG filters, eg. blur, brightness, contrast...
 * @see https://developer.mozilla.org/zh-CN/docs/Web/SVG/Element/filter
 */
function createOrUpdateFilter(document, $def, object, $el, filters) {
    // eg. filter="url(#f1) url(#f2)"
    var filterName = FILTER_PREFIX + object.entity;
    var $existedFilters = $def.querySelectorAll("[name=".concat(filterName, "]"));
    if ($existedFilters.length) {
        $existedFilters.forEach(function ($filter) {
            $def.removeChild($filter);
        });
    }
    if (filters.length === 0) {
        // 'none'
        $el === null || $el === void 0 ? void 0 : $el.removeAttribute('filter');
    }
    else {
        var filterIds_1 = filters.map(function (_a, i) {
            var name = _a.name, params = _a.params;
            var $filter = createSVGElement('filter', document);
            // @see https://github.com/antvis/g/issues/1025
            $filter.setAttribute('filterUnits', 'userSpaceOnUse');
            if (name === 'blur') {
                createBlur(document, $filter, params);
            }
            else if (name === 'brightness') {
                createBrightness(document, $filter, params);
            }
            else if (name === 'drop-shadow') {
                createDropShadow(document, $filter, params);
            }
            else if (name === 'contrast') {
                createContrast(document, $filter, params);
            }
            else if (name === 'grayscale') {
                createGrayscale(document, $filter, params);
            }
            else if (name === 'sepia') {
                createSepia(document, $filter, params);
            }
            else if (name === 'saturate') {
                createSaturate(document, $filter, params);
            }
            else if (name === 'hue-rotate') {
                createHueRotate(document, $filter, params);
            }
            else if (name === 'invert') {
                createInvert(document, $filter, params);
            }
            $filter.id = "".concat(filterName, "-").concat(i);
            $filter.setAttribute('name', filterName);
            $def.appendChild($filter);
            return $filter.id;
        });
        // @see https://github.com/antvis/G/issues/1114
        setTimeout(function () {
            $el === null || $el === void 0 ? void 0 : $el.setAttribute('filter', filterIds_1.map(function (filterId) { return "url(#".concat(filterId, ")"); }).join(' '));
        });
    }
}
function convertToAbsoluteValue(param) {
    return param.unit === gLite.UnitType.kPercentage ? param.value / 100 : param.value;
}
/**
 * @see https://drafts.fxtf.org/filter-effects/#blurEquivalent
 */
function createBlur(document, $filter, params) {
    var $feGaussianBlur = createSVGElement('feGaussianBlur', document);
    $feGaussianBlur.setAttribute('in', 'SourceGraphic');
    $feGaussianBlur.setAttribute('stdDeviation', "".concat(params[0].value));
    $filter.appendChild($feGaussianBlur);
}
function createFeComponentTransfer(document, $filter, _a) {
    var type = _a.type, slope = _a.slope, intercept = _a.intercept, tableValues = _a.tableValues;
    var $feComponentTransfer = createSVGElement('feComponentTransfer', document);
    [
        createSVGElement('feFuncR', document),
        createSVGElement('feFuncG', document),
        createSVGElement('feFuncB', document),
    ].forEach(function ($feFunc) {
        $feFunc.setAttribute('type', type);
        if (type === 'table') {
            $feFunc.setAttribute('tableValues', "".concat(tableValues));
        }
        else {
            $feFunc.setAttribute('slope', "".concat(slope));
            $feFunc.setAttribute('intercept', "".concat(intercept));
        }
        $feComponentTransfer.appendChild($feFunc);
    });
    $filter.appendChild($feComponentTransfer);
}
function createContrast(document, $filter, params) {
    var slope = convertToAbsoluteValue(params[0]);
    createFeComponentTransfer(document, $filter, {
        type: 'linear',
        slope: slope,
        intercept: -(0.5 * slope) + 0.5,
    });
}
function createInvert(document, $filter, params) {
    var amount = convertToAbsoluteValue(params[0]);
    createFeComponentTransfer(document, $filter, {
        type: 'table',
        tableValues: "".concat(amount, " ").concat(1 - amount),
    });
}
function createBrightness(document, $filter, params) {
    var slope = convertToAbsoluteValue(params[0]);
    createFeComponentTransfer(document, $filter, {
        type: 'linear',
        slope: slope,
        intercept: 0,
    });
}
function createSaturate(document, $filter, params) {
    var amount = convertToAbsoluteValue(params[0]);
    var $feColorMatrix = createSVGElement('feColorMatrix', document);
    $feColorMatrix.setAttribute('type', 'saturate');
    $feColorMatrix.setAttribute('values', "".concat(amount));
    $filter.appendChild($feColorMatrix);
}
function createHueRotate(document, $filter, params) {
    var $feColorMatrix = createSVGElement('feColorMatrix', document);
    $feColorMatrix.setAttribute('type', 'hueRotate');
    // $feColorMatrix.setAttribute('values', `${params[0].to(UnitType.kDegrees).value}`);
    // FIXME: convert to degrees
    $feColorMatrix.setAttribute('values', "".concat(params[0].value));
    $filter.appendChild($feColorMatrix);
}
function createDropShadow(document, $filter, params) {
    var shadowOffsetX = params[0].value;
    var shadowOffsetY = params[1].value;
    var shadowBlur = params[2].value;
    // @ts-ignore
    var shadowColor = params[3].formatted;
    var $feGaussianBlur = createSVGElement('feGaussianBlur', document);
    $feGaussianBlur.setAttribute('in', 'SourceAlpha');
    $feGaussianBlur.setAttribute('stdDeviation', "".concat(shadowBlur));
    $filter.appendChild($feGaussianBlur);
    var $feOffset = createSVGElement('feOffset', document);
    $feOffset.setAttribute('dx', "".concat(shadowOffsetX));
    $feOffset.setAttribute('dy', "".concat(shadowOffsetY));
    $feOffset.setAttribute('result', 'offsetblur');
    $filter.appendChild($feOffset);
    var $feFlood = createSVGElement('feFlood', document);
    $feFlood.setAttribute('flood-color', shadowColor);
    $filter.appendChild($feFlood);
    var $feComposite = createSVGElement('feComposite', document);
    $feComposite.setAttribute('in2', 'offsetblur');
    $feComposite.setAttribute('operator', 'in');
    $filter.appendChild($feComposite);
    var $feMerge = createSVGElement('feMerge', document);
    $filter.appendChild($feMerge);
    var $feMergeNode1 = createSVGElement('feMergeNode', document);
    var $feMergeNode2 = createSVGElement('feMergeNode', document);
    $feMergeNode2.setAttribute('in', 'SourceGraphic');
    $feMerge.appendChild($feMergeNode1);
    $feMerge.appendChild($feMergeNode2);
}
function createFeColorMatrix(document, $filter, matrix) {
    var $feColorMatrix = createSVGElement('feColorMatrix', document);
    $feColorMatrix.setAttribute('type', 'matrix');
    $feColorMatrix.setAttribute('values', matrix.join(' '));
    $filter.appendChild($feColorMatrix);
}
/**
 * @see https://drafts.fxtf.org/filter-effects/#grayscaleEquivalent
 */
function createGrayscale(document, $filter, params) {
    var amount = convertToAbsoluteValue(params[0]);
    createFeColorMatrix(document, $filter, [
        0.2126 + 0.7874 * (1 - amount),
        0.7152 - 0.7152 * (1 - amount),
        0.0722 - 0.0722 * (1 - amount),
        0,
        0,
        0.2126 - 0.2126 * (1 - amount),
        0.7152 + 0.2848 * (1 - amount),
        0.0722 - 0.0722 * (1 - amount),
        0,
        0,
        0.2126 - 0.2126 * (1 - amount),
        0.7152 - 0.7152 * (1 - amount),
        0.0722 + 0.9278 * (1 - amount),
        0,
        0,
        0,
        0,
        0,
        1,
        0,
    ]);
}
/**
 * @see https://drafts.fxtf.org/filter-effects/#sepiaEquivalent
 */
function createSepia(document, $filter, params) {
    var amount = convertToAbsoluteValue(params[0]);
    createFeColorMatrix(document, $filter, [
        0.393 + 0.607 * (1 - amount),
        0.769 - 0.769 * (1 - amount),
        0.189 - 0.189 * (1 - amount),
        0,
        0,
        0.349 - 0.349 * (1 - amount),
        0.686 + 0.314 * (1 - amount),
        0.168 - 0.168 * (1 - amount),
        0,
        0,
        0.272 - 0.272 * (1 - amount),
        0.534 - 0.534 * (1 - amount),
        0.131 + 0.869 * (1 - amount),
        0,
        0,
        0,
        0,
        0,
        1,
        0,
    ]);
}

var PATTERN_PREFIX = 'g-pattern-';
var cacheKey2IDMap = {};
var counter = 0;
function resetPatternCounter() {
    counter = 0;
    cacheKey2IDMap = {};
}
function createOrUpdateGradientAndPattern(document, $def, object, $el, parsedColor, name, createImage, plugin) {
    // eg. clipPath don't have fill/stroke
    if (!parsedColor) {
        return '';
    }
    if (gLite.isCSSRGB(parsedColor)) {
        // keep using currentColor @see https://github.com/d3/d3-axis/issues/49
        if (object.style[name] === 'currentColor') {
            $el === null || $el === void 0 ? void 0 : $el.setAttribute(name, 'currentColor');
        }
        else {
            // constant value, eg. '#fff'
            $el === null || $el === void 0 ? void 0 : $el.setAttribute(name, parsedColor.isNone ? 'none' : parsedColor.toString());
        }
    }
    else if (gLite.isPattern(parsedColor)) {
        var patternId = createOrUpdatePattern(document, $def, object, parsedColor, createImage, plugin);
        // use style instead of attribute when applying <pattern>
        // @see https://stackoverflow.com/a/7723115
        $el.style[name] = "url(#".concat(patternId, ")");
        return patternId;
    }
    else {
        if (parsedColor.length === 1) {
            var gradientId = createOrUpdateGradient(document, object, $def, $el, parsedColor[0]);
            $el === null || $el === void 0 ? void 0 : $el.setAttribute(name, "url(#".concat(gradientId, ")"));
            return gradientId;
        }
        else {
            // @see https://stackoverflow.com/questions/20671502/can-i-blend-gradients-in-svg
            var filterId = createOrUpdateMultiGradient(document, object, $def, $el, parsedColor);
            $el === null || $el === void 0 ? void 0 : $el.setAttribute('filter', "url(#".concat(filterId, ")"));
            $el === null || $el === void 0 ? void 0 : $el.setAttribute('fill', 'black');
            return filterId;
        }
    }
    return '';
}
function generateCacheKey(src, options) {
    if (options === void 0) { options = {}; }
    var cacheKey = '';
    if (gLite.isCSSGradientValue(src)) {
        var type = src.type, value = src.value;
        if (type === gLite.GradientType.LinearGradient ||
            type === gLite.GradientType.RadialGradient) {
            // @ts-ignore
            var _a = tslib.__assign(tslib.__assign({}, value), options), type_1 = _a.type, width = _a.width, height = _a.height, steps = _a.steps, angle = _a.angle, cx = _a.cx, cy = _a.cy, size = _a.size;
            cacheKey = "gradient-".concat(type_1, "-").concat((angle === null || angle === void 0 ? void 0 : angle.toString()) || 0, "-").concat((cx === null || cx === void 0 ? void 0 : cx.toString()) || 0, "-").concat((cy === null || cy === void 0 ? void 0 : cy.toString()) || 0, "-").concat((size === null || size === void 0 ? void 0 : size.toString()) || 0, "-").concat(width, "-").concat(height, "-").concat(steps
                .map(function (_a) {
                var offset = _a.offset, color = _a.color;
                return "".concat(offset).concat(color);
            })
                .join('-'));
        }
    }
    else if (gLite.isPattern(src)) {
        if (util.isString(src.image)) {
            cacheKey = "pattern-".concat(src.image, "-").concat(src.repetition);
        }
        else if (src.image.nodeName === 'rect') {
            // use rect's entity as key
            cacheKey = "pattern-rect-".concat(src.image.entity);
        }
        else {
            cacheKey = "pattern-".concat(counter);
        }
    }
    if (cacheKey) {
        if (!cacheKey2IDMap[cacheKey]) {
            cacheKey2IDMap[cacheKey] = PATTERN_PREFIX + "".concat(counter++);
        }
    }
    return cacheKey2IDMap[cacheKey];
}
function formatTransform(transform) {
    // @see https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/patternTransform
    // should remove unit: rotate(20deg) -> rotate(20)
    return gLite.parseTransform(transform)
        .map(function (parsed) {
        var t = parsed.t, d = parsed.d;
        if (t === 'translate') {
            return "translate(".concat(d[0].value, " ").concat(d[1].value, ")");
        }
        else if (t === 'translatex') {
            return "translate(".concat(d[0].value, " 0)");
        }
        else if (t === 'translatey') {
            return "translate(0 ".concat(d[0].value, ")");
        }
        else if (t === 'rotate') {
            return "rotate(".concat(d[0].value, ")");
        }
        else if (t === 'scale') {
            // scale(1) scale(1, 1)
            var newScale = (d === null || d === void 0 ? void 0 : d.map(function (s) { return s.value; })) || [1, 1];
            return "scale(".concat(newScale[0], ", ").concat(newScale[1], ")");
        }
        else if (t === 'scalex') {
            var newScale = (d === null || d === void 0 ? void 0 : d.map(function (s) { return s.value; })) || [1];
            return "scale(".concat(newScale[0], ", 1)");
        }
        else if (t === 'scaley') {
            var newScale = (d === null || d === void 0 ? void 0 : d.map(function (s) { return s.value; })) || [1];
            return "scale(1, ".concat(newScale[0], ")");
        }
        else if (t === 'skew') {
            var newSkew = (d === null || d === void 0 ? void 0 : d.map(function (s) { return s.value; })) || [0, 0];
            return "skewX(".concat(newSkew[0], ") skewY(").concat(newSkew[1], ")");
        }
        else if (t === 'skewx') {
            var newSkew = (d === null || d === void 0 ? void 0 : d.map(function (s) { return s.value; })) || [0];
            return "skewX(".concat(newSkew[0], ")");
        }
        else if (t === 'skewy') {
            var newSkew = (d === null || d === void 0 ? void 0 : d.map(function (s) { return s.value; })) || [0];
            return "skewY(".concat(newSkew[0], ")");
        }
        else if (t === 'matrix') {
            var _a = tslib.__read(d.map(function (s) { return s.value; }), 6), a = _a[0], b = _a[1], c = _a[2], dd = _a[3], tx = _a[4], ty = _a[5];
            return "matrix(".concat(a, " ").concat(b, " ").concat(c, " ").concat(dd, " ").concat(tx, " ").concat(ty, ")");
        }
    })
        .join(' ');
}
function create$Pattern(document, $def, object, pattern, patternId, width, height) {
    var repetition = pattern.repetition, transform = pattern.transform;
    // @see https://developer.mozilla.org/zh-CN/docs/Web/SVG/Element/pattern
    var $pattern = createSVGElement('pattern', document);
    if (transform) {
        $pattern.setAttribute('patternTransform', formatTransform(transform));
    }
    $pattern.setAttribute('patternUnits', 'userSpaceOnUse');
    $pattern.id = patternId;
    $def.appendChild($pattern);
    $pattern.setAttribute('x', '0');
    $pattern.setAttribute('y', '0');
    var halfExtents = object.getGeometryBounds().halfExtents;
    // There is no equivalent to CSS no-repeat for SVG patterns
    // @see https://stackoverflow.com/a/33481956
    var patternWidth = width;
    var patternHeight = height;
    if (repetition === 'repeat-x') {
        patternHeight = halfExtents[1] * 2;
    }
    else if (repetition === 'repeat-y') {
        patternWidth = halfExtents[0] * 2;
    }
    else if (repetition === 'no-repeat') {
        patternWidth = halfExtents[0] * 2;
        patternHeight = halfExtents[1] * 2;
    }
    $pattern.setAttribute('width', "".concat(patternWidth));
    $pattern.setAttribute('height', "".concat(patternHeight));
    return $pattern;
}
function createOrUpdatePattern(document, $def, object, pattern, createImage, plugin) {
    var patternId = generateCacheKey(pattern);
    var $existed = $def.querySelector("#".concat(patternId));
    if (!$existed) {
        var image = pattern.image;
        var imageURL = '';
        if (util.isString(image)) {
            imageURL = image;
        }
        else {
            if (gLite.isBrowser) {
                if (image instanceof HTMLImageElement) {
                    imageURL = image.src;
                }
                else if (image instanceof HTMLCanvasElement) {
                    imageURL = image.toDataURL();
                }
                else ;
            }
        }
        if (imageURL) {
            var $image_1 = createSVGElement('image', document);
            // use href instead of xlink:href
            // @see https://stackoverflow.com/a/13379007
            $image_1.setAttribute('href', imageURL);
            var img_1;
            if (createImage) {
                img_1 = createImage(imageURL);
            }
            else if (gLite.isBrowser) {
                img_1 = new window.Image();
            }
            if (!imageURL.match(/^data:/i)) {
                img_1.crossOrigin = 'Anonymous';
                $image_1.setAttribute('crossorigin', 'anonymous');
            }
            img_1.src = imageURL;
            var onload_1 = function () {
                var $pattern = create$Pattern(document, $def, object, pattern, patternId, img_1.width, img_1.height);
                $def.appendChild($pattern);
                $pattern.appendChild($image_1);
                $image_1.setAttribute('x', '0');
                $image_1.setAttribute('y', '0');
                $image_1.setAttribute('width', "".concat(img_1.width));
                $image_1.setAttribute('height', "".concat(img_1.height));
            };
            if (img_1.complete) {
                onload_1();
            }
            else {
                img_1.onload = onload_1;
                // Fix onload() bug in IE9
                // img.src = img.src;
            }
        }
        if (image.nodeName === 'rect') {
            var _a = image.parsedStyle, width = _a.width, height = _a.height;
            var $pattern = create$Pattern(document, $def, image, pattern, patternId, width, height);
            // traverse subtree of pattern
            image.forEach(function (object) {
                plugin.createSVGDom(document, object, null);
                // @ts-ignore
                var svgElement = object.elementSVG;
                // apply local RTS transformation to <group> wrapper
                // account for anchor
                var localTransform = object.getLocalTransform();
                plugin.applyTransform(svgElement.$groupEl, localTransform);
            });
            // @ts-ignore
            var svgElement = image.elementSVG;
            $pattern.appendChild(svgElement.$groupEl);
        }
    }
    return patternId;
}
function createOrUpdateGradient(document, object, $def, $el, parsedColor) {
    var bounds = object.getGeometryBounds();
    var width = (bounds && bounds.halfExtents[0] * 2) || 0;
    var height = (bounds && bounds.halfExtents[1] * 2) || 0;
    var gradientId = generateCacheKey(parsedColor, { width: width, height: height });
    var $existed = $def.querySelector("#".concat(gradientId));
    if (!$existed) {
        // <linearGradient> <radialGradient>
        // @see https://developer.mozilla.org/zh-CN/docs/Web/SVG/Element/linearGradient
        // @see https://developer.mozilla.org/zh-CN/docs/Web/SVG/Element/radialGradient
        $existed = createSVGElement(parsedColor.type === gLite.GradientType.LinearGradient
            ? 'linearGradient'
            : 'radialGradient', document);
        // @see https://github.com/antvis/g/issues/1025
        $existed.setAttribute('gradientUnits', 'userSpaceOnUse');
        // add stops
        var innerHTML_1 = '';
        parsedColor.value.steps
            // sort by offset @see https://github.com/antvis/G/issues/1171
            .sort(function (a, b) { return a.offset.value - b.offset.value; })
            .forEach(function (_a) {
            var offset = _a.offset, color = _a.color;
            // TODO: support absolute unit like `px`
            innerHTML_1 += "<stop offset=\"".concat(offset.value / 100, "\" stop-color=\"").concat(color, "\"></stop>");
        });
        $existed.innerHTML = innerHTML_1;
        $existed.id = gradientId;
        $def.appendChild($existed);
    }
    if (parsedColor.type === gLite.GradientType.LinearGradient) {
        var angle = parsedColor.value.angle;
        var _a = gLite.computeLinearGradient(width, height, angle), x1 = _a.x1, y1 = _a.y1, x2 = _a.x2, y2 = _a.y2;
        $existed.setAttribute('x1', "".concat(x1));
        $existed.setAttribute('y1', "".concat(y1));
        $existed.setAttribute('x2', "".concat(x2));
        $existed.setAttribute('y2', "".concat(y2));
        // $existed.setAttribute('gradientTransform', `rotate(${angle})`);
    }
    else {
        var _b = parsedColor.value, cx = _b.cx, cy = _b.cy, size = _b.size;
        var _c = gLite.computeRadialGradient(width, height, cx, cy, size), x = _c.x, y = _c.y, r = _c.r;
        $existed.setAttribute('cx', "".concat(x));
        $existed.setAttribute('cy', "".concat(y));
        $existed.setAttribute('r', "".concat(r));
    }
    return gradientId;
}
function createOrUpdateMultiGradient(document, object, $def, $el, gradients) {
    var filterId = FILTER_PREFIX + object.entity + '-gradient';
    var $existed = $def.querySelector("#".concat(filterId));
    if (!$existed) {
        $existed = createSVGElement('filter', document);
        $existed.setAttribute('filterUnits', 'userSpaceOnUse');
        // @see https://github.com/antvis/g/issues/1025
        $existed.setAttribute('x', '0%');
        $existed.setAttribute('y', '0%');
        $existed.setAttribute('width', '100%');
        $existed.setAttribute('height', '100%');
        $existed.id = filterId;
        $def.appendChild($existed);
    }
    /**
     * <rect id="wave-rect" x="0" y="0" width="100%" height="100%" fill="url(#wave)"></rect>
     * <filter id="blend-it" x="0%" y="0%" width="100%" height="100%">
          <feImage xlink:href="#wave-rect" result="myWave" x="100" y="100"/>
          <feImage xlink:href="#ry-rect" result="myRY"  x="100" y="100"/>
          <feBlend in="myWave" in2="myRY" mode="multiply" result="blendedGrad"/>
          <feComposite in="blendedGrad" in2="SourceGraphic" operator="in"/>
      </filter>
     */
    var blended = 0;
    gradients.forEach(function (gradient, i) {
        var gradientId = createOrUpdateGradient(document, object, $def, $el, gradient);
        var rectId = gradientId + '_rect';
        var $rect = createSVGElement('rect', document);
        $rect.setAttribute('x', '0');
        $rect.setAttribute('y', '0');
        $rect.setAttribute('width', '100%');
        $rect.setAttribute('height', '100%');
        $rect.setAttribute('fill', "url(#".concat(gradientId, ")"));
        $rect.id = rectId;
        $def.appendChild($rect);
        var $feImage = createSVGElement('feImage', document);
        $feImage.setAttribute('href', "#".concat(rectId));
        $feImage.setAttribute('result', "".concat(filterId, "-").concat(i));
        $existed.appendChild($feImage);
        if (i > 0) {
            var $feBlend = createSVGElement('feBlend', document);
            $feBlend.setAttribute('in', i === 1 ? "".concat(filterId, "-").concat(i - 1) : "".concat(filterId, "-blended-").concat(blended - 1));
            $feBlend.setAttribute('in2', "".concat(filterId, "-").concat(i));
            $feBlend.setAttribute('result', "".concat(filterId, "-blended-").concat(blended++));
            // @see https://developer.mozilla.org/zh-CN/docs/Web/CSS/blend-mode
            $feBlend.setAttribute('mode', 'multiply');
            $existed.appendChild($feBlend);
        }
    });
    var $feComposite = createSVGElement('feComposite', document);
    $feComposite.setAttribute('in', "".concat(filterId, "-blended-").concat(blended));
    $feComposite.setAttribute('in2', 'SourceGraphic');
    $feComposite.setAttribute('operator', 'in');
    $existed.appendChild($feComposite);
    return filterId;
}

var FILTER_DROPSHADOW_PREFIX = 'g-filter-dropshadow-';
/**
 * use SVG filters
 * @see https://developer.mozilla.org/zh-CN/docs/Web/SVG/Element/filter
 */
function createOrUpdateShadow(document, $def, object, $el, name) {
    var _a = object.parsedStyle, shadowType = _a.shadowType, shadowBlur = _a.shadowBlur, shadowColor = _a.shadowColor, shadowOffsetX = _a.shadowOffsetX, shadowOffsetY = _a.shadowOffsetY;
    var hasShadow = !util.isNil(shadowColor) && shadowBlur > 0;
    var shadowId = FILTER_DROPSHADOW_PREFIX + object.entity;
    var $existedFilter = $def.querySelector("#".concat(shadowId));
    if ($existedFilter) {
        var existedShadowType = $existedFilter.getAttribute('data-type');
        if (existedShadowType !== shadowType || !hasShadow) {
            // remove existed shadow
            $existedFilter.remove();
            $existedFilter = null;
        }
    }
    // <Group> also has shadowType as its default value
    // only apply shadow when blur > 0
    if (hasShadow) {
        // use filter <feDropShadow>
        // @see https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feDropShadow
        $el === null || $el === void 0 ? void 0 : $el.setAttribute('filter', "url(#".concat(shadowId, ")"));
    }
    else {
        $el === null || $el === void 0 ? void 0 : $el.removeAttribute('filter');
        return;
    }
    if (!$existedFilter) {
        $existedFilter = createSVGElement('filter', document);
        $existedFilter.setAttribute('data-type', shadowType);
        if (shadowType === 'outer') {
            var $feDropShadow = createSVGElement('feDropShadow', document);
            $feDropShadow.setAttribute('dx', "".concat((shadowOffsetX || 0) / 2));
            $feDropShadow.setAttribute('dy', "".concat((shadowOffsetY || 0) / 2));
            $feDropShadow.setAttribute('stdDeviation', "".concat((shadowBlur || 0) / 4));
            $feDropShadow.setAttribute('flood-color', shadowColor.toString());
            $existedFilter.appendChild($feDropShadow);
        }
        else if (shadowType === 'inner') {
            var $feComponentTransfer = createSVGElement('feComponentTransfer', document);
            $feComponentTransfer.setAttribute('in', 'SourceAlpha');
            var $feFuncA = createSVGElement('feFuncA', document);
            $feFuncA.setAttribute('type', 'table');
            $feFuncA.setAttribute('tableValues', '1 0');
            $feComponentTransfer.appendChild($feFuncA);
            $existedFilter.appendChild($feComponentTransfer);
            var $feGaussianBlur = createSVGElement('feGaussianBlur', document);
            $feGaussianBlur.setAttribute('stdDeviation', "".concat((shadowBlur || 0) / 4));
            $existedFilter.appendChild($feGaussianBlur);
            var $feOffset = createSVGElement('feOffset', document);
            $feOffset.setAttribute('dx', "".concat((shadowOffsetX || 0) / 2));
            $feOffset.setAttribute('dy', "".concat((shadowOffsetY || 0) / 2));
            $feOffset.setAttribute('result', 'offsetblur');
            $existedFilter.appendChild($feOffset);
            var $feFlood = createSVGElement('feFlood', document);
            $feFlood.setAttribute('flood-color', shadowColor.toString());
            $feFlood.setAttribute('result', 'color');
            $existedFilter.appendChild($feFlood);
            var $feComposite = createSVGElement('feComposite', document);
            $feComposite.setAttribute('in2', 'offsetblur');
            $feComposite.setAttribute('operator', 'in');
            $existedFilter.appendChild($feComposite);
            var $feComposite2 = createSVGElement('feComposite', document);
            $feComposite2.setAttribute('in2', 'SourceAlpha');
            $feComposite2.setAttribute('operator', 'in');
            $existedFilter.appendChild($feComposite2);
            var $feMerge = createSVGElement('feMerge', document);
            $existedFilter.appendChild($feMerge);
            var $feMergeNode = createSVGElement('feMergeNode', document);
            $feMergeNode.setAttribute('in', 'SourceGraphic');
            var $feMergeNode2 = createSVGElement('feMergeNode', document);
            $feMerge.appendChild($feMergeNode);
            $feMerge.appendChild($feMergeNode2);
        }
        $existedFilter.id = shadowId;
        // @see https://github.com/antvis/g/issues/1025
        $existedFilter.setAttribute('filterUnits', 'userSpaceOnUse');
        $def.appendChild($existedFilter);
        return;
    }
    if (shadowType === 'inner') {
        var $feGaussianBlur = $existedFilter.children[1];
        var $feOffset = $existedFilter.children[2];
        var $feFlood = $existedFilter.children[3];
        if (name === 'shadowColor') {
            $feFlood.setAttribute('flood-color', shadowColor.toString());
        }
        else if (name === 'shadowBlur') {
            // half the blur radius
            // @see https://drafts.csswg.org/css-backgrounds/#shadow-blur
            // @see https://css-tricks.com/breaking-css-box-shadow-vs-drop-shadow/
            $feGaussianBlur.setAttribute('stdDeviation', "".concat((shadowBlur || 0) / 4));
        }
        else if (name === 'shadowOffsetX') {
            $feOffset.setAttribute('dx', "".concat((shadowOffsetX || 0) / 2));
        }
        else if (name === 'shadowOffsetY') {
            $feOffset.setAttribute('dy', "".concat((shadowOffsetY || 0) / 2));
        }
    }
    else if (shadowType === 'outer') {
        var $feDropShadow = $existedFilter.children[0];
        if (name === 'shadowColor') {
            $feDropShadow.setAttribute('flood-color', shadowColor.toString());
        }
        else if (name === 'shadowBlur') {
            // half the blur radius
            // @see https://drafts.csswg.org/css-backgrounds/#shadow-blur
            // @see https://css-tricks.com/breaking-css-box-shadow-vs-drop-shadow/
            $feDropShadow.setAttribute('stdDeviation', "".concat((shadowBlur || 0) / 4));
        }
        else if (name === 'shadowOffsetX') {
            $feDropShadow.setAttribute('dx', "".concat((shadowOffsetX || 0) / 2));
        }
        else if (name === 'shadowOffsetY') {
            $feDropShadow.setAttribute('dy', "".concat((shadowOffsetY || 0) / 2));
        }
    }
}

var urlRegexp = /url\("?#(.*)\)/;
var DefElementManager = /** @class */ (function () {
    function DefElementManager(context) {
        this.context = context;
        this.gradientCache = {};
    }
    DefElementManager.prototype.getDefElement = function () {
        return this.$def;
    };
    DefElementManager.prototype.init = function () {
        var document = this.context.config.document;
        var $svg = this.context.contextService.getContext();
        this.$def = createSVGElement('defs', document);
        $svg.appendChild(this.$def);
    };
    DefElementManager.prototype.clear = function (entity) {
        var _this = this;
        Object.keys(this.gradientCache).forEach(function (id) {
            _this.clearUnusedDefElement(_this.gradientCache, id, entity);
        });
    };
    DefElementManager.prototype.clearUnusedDefElement = function (cache, id, entity) {
        if (cache[id] && cache[id].size === 1 && cache[id].has(entity)) {
            var targetElement = this.$def.querySelector("#".concat(id));
            if (targetElement) {
                this.$def.removeChild(targetElement);
            }
        }
    };
    DefElementManager.prototype.createOrUpdateGradientAndPattern = function (object, $el, parsedColor, name, plugin) {
        var _a = this.context.config, doc = _a.document, createImage = _a.createImage;
        if ($el) {
            var attributeValue = '';
            if (gLite.isPattern(parsedColor)) {
                // `fill: url(#${patternId})`
                attributeValue = $el.style[name];
            }
            else {
                // `url(#${gradientId})`
                attributeValue = $el.getAttribute(name) || '';
            }
            var matches = attributeValue.match(urlRegexp);
            if (matches && matches.length > 1) {
                this.clearUnusedDefElement(this.gradientCache, matches[1].replace('"', ''), object.entity);
            }
            var newDefElementId = createOrUpdateGradientAndPattern(doc || document, this.$def, object, $el, parsedColor, name, createImage, plugin);
            if (newDefElementId) {
                if (!this.gradientCache[newDefElementId]) {
                    this.gradientCache[newDefElementId] = new Set();
                }
                this.gradientCache[newDefElementId].add(object.entity);
            }
        }
    };
    DefElementManager.prototype.createOrUpdateShadow = function (object, $el, name) {
        var doc = this.context.config.document;
        createOrUpdateShadow(doc || document, this.$def, object, $el, name);
    };
    DefElementManager.prototype.createOrUpdateFilter = function (object, $el, filters) {
        var doc = this.context.config.document;
        createOrUpdateFilter(doc || document, this.$def, object, $el, filters);
    };
    return DefElementManager;
}());

function numberToLongString(x) {
    return x.toFixed(6).replace('.000000', '');
}
function convertHTML(str) {
    var regex = /[&|<|>|"|']/g;
    return str.replace(regex, function (match) {
        if (match === '&') {
            return '&amp;';
        }
        else if (match === '<') {
            return '&lt;';
        }
        else if (match === '>') {
            return '&gt;';
        }
        else if (match === '"') {
            return '&quot;';
        }
        else {
            return '&apos;';
        }
    });
}

var SVG_ATTR_MAP = {
    opacity: 'opacity',
    fillStyle: 'fill',
    fill: 'fill',
    fillRule: 'fill-rule',
    fillOpacity: 'fill-opacity',
    strokeStyle: 'stroke',
    strokeOpacity: 'stroke-opacity',
    stroke: 'stroke',
    clipPath: 'clip-path',
    textPath: 'text-path',
    r: 'r',
    rx: 'rx',
    ry: 'ry',
    width: 'width',
    height: 'height',
    lineCap: 'stroke-linecap',
    lineJoin: 'stroke-linejoin',
    lineWidth: 'stroke-width',
    lineDash: 'stroke-dasharray',
    lineDashOffset: 'stroke-dashoffset',
    miterLimit: 'stroke-miterlimit',
    font: 'font',
    fontSize: 'font-size',
    fontStyle: 'font-style',
    fontVariant: 'font-variant',
    fontWeight: 'font-weight',
    fontFamily: 'font-family',
    letterSpacing: 'letter-spacing',
    startArrow: 'marker-start',
    endArrow: 'marker-end',
    class: 'class',
    id: 'id',
    // style: 'style',
    preserveAspectRatio: 'preserveAspectRatio',
    visibility: 'visibility',
    anchor: 'anchor',
    shadowColor: 'flood-color',
    shadowBlur: 'stdDeviation',
    shadowOffsetX: 'dx',
    shadowOffsetY: 'dy',
    filter: 'filter',
    innerHTML: 'innerHTML',
    textAlign: 'text-anchor',
    pointerEvents: 'pointer-events',
};
var FORMAT_VALUE_MAP = {
    textAlign: {
        inherit: 'inherit',
        left: 'left',
        start: 'left',
        center: 'middle',
        right: 'end',
        end: 'end',
    },
};
var DEFAULT_VALUE_MAP = {
    textAlign: 'inherit',
    // textBaseline: 'alphabetic',
    // @see https://www.w3.org/TR/SVG/painting.html#LineCaps
    lineCap: 'butt',
    // @see https://www.w3.org/TR/SVG/painting.html#LineJoin
    lineJoin: 'miter',
    // @see https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/stroke-width
    lineWidth: '1px',
    opacity: '1',
    fillOpacity: '1',
    fillRule: 'nonzero',
    strokeOpacity: '1',
    strokeWidth: '0',
    strokeMiterLimit: '4',
    letterSpacing: '0',
    fontSize: 'inherit',
    fontFamily: 'inherit',
    pointerEvents: 'auto',
};
/**
 * G_SVG_PREFIX + nodeName + entity
 *
 * eg. g_svg_circle_345
 */
var G_SVG_PREFIX = 'g-svg';
var CLIP_PATH_PREFIX = 'clip-path-';
var TEXT_PATH_PREFIX = 'text-path-';
var SVGRendererPlugin = /** @class */ (function () {
    function SVGRendererPlugin(pluginOptions, defElementManager, context) {
        this.pluginOptions = pluginOptions;
        this.defElementManager = defElementManager;
        this.context = context;
        /**
         * Will be used in g-plugin-svg-picker for finding relative SVG element of current DisplayObject.
         */
        this.svgElementMap = new WeakMap();
        /**
         * render at the end of frame
         */
        this.renderQueue = [];
        /**
         * dirty attributes at the end of frame
         */
        this.dirtyAttributes = new WeakMap();
        /**
         * reorder after mounted
         */
        this.pendingReorderQueue = new Set();
        /**
         * <use> elements in <clipPath>, which should be sync with clipPath
         *
         * @example
         * <clipPath transform="matrix(1,0,0,1,-100,-155)" id="clip-path-0-2">
         *  <use href="#g_svg_circle_0" transform="matrix(1.477115,0,0,1.477115,150,150)">
         *  </use>
         * </clipPath>
         */
        this.clipPathUseMap = new WeakMap();
    }
    SVGRendererPlugin.prototype.apply = function (context) {
        var _this = this;
        var renderingService = context.renderingService, renderingContext = context.renderingContext;
        this.context = context;
        // @ts-ignore
        this.context.svgElementMap = this.svgElementMap;
        var canvas = renderingContext.root.ownerDocument.defaultView;
        var document = this.context.config.document;
        var handleMounted = function (e) {
            var object = e.target;
            // should remove clipPath already existed in <defs>
            var $useRefs = _this.clipPathUseMap.get(object);
            if ($useRefs) {
                var $def = _this.defElementManager.getDefElement();
                var existed = $def.querySelector("#".concat(_this.getId(object)));
                if (existed) {
                    existed.remove();
                }
            }
            // create SVG DOM Node
            _this.createSVGDom(document, object, _this.$camera);
        };
        var handleUnmounted = function (e) {
            var object = e.target;
            _this.defElementManager.clear(object.entity);
            _this.clipPathUseMap.delete(object);
            _this.removeSVGDom(object);
        };
        var reorderChildren = function (object) {
            var _a, _b;
            var parent = object.parentNode;
            // @ts-ignore
            var $groupEl = (_b = (_a = object.parentNode) === null || _a === void 0 ? void 0 : _a.elementSVG) === null || _b === void 0 ? void 0 : _b.$groupEl;
            var children = ((parent === null || parent === void 0 ? void 0 : parent.children) || []).slice();
            if ($groupEl) {
                _this.reorderChildren(document, $groupEl, children);
            }
        };
        var handleReparent = function (e) {
            var object = e.target;
            reorderChildren(object);
        };
        var handleAttributeChanged = function (e) {
            var object = e.target;
            // @see https://github.com/antvis/g/issues/994
            // @ts-ignore
            if (!object.elementSVG) {
                return;
            }
            var attrName = e.attrName;
            var attribtues = _this.dirtyAttributes.get(object);
            if (!attribtues) {
                _this.dirtyAttributes.set(object, []);
                attribtues = _this.dirtyAttributes.get(object);
            }
            attribtues.push(attrName);
        };
        var handleGeometryBoundsChanged = function (e) {
            var _a;
            var object = e.target;
            // @ts-ignore
            var $el = (_a = object.elementSVG) === null || _a === void 0 ? void 0 : _a.$el;
            var _b = object.parsedStyle, fill = _b.fill, stroke = _b.stroke, clipPath = _b.clipPath;
            if (fill && !gLite.isCSSRGB(fill)) {
                _this.defElementManager.createOrUpdateGradientAndPattern(object, $el, fill, 'fill', _this);
            }
            if (stroke && !gLite.isCSSRGB(stroke)) {
                _this.defElementManager.createOrUpdateGradientAndPattern(object, $el, stroke, 'stroke', _this);
            }
            if (clipPath) {
                var parentInvert = glMatrix.mat4.invert(glMatrix.mat4.create(), object.getWorldTransform());
                var clipPathId = CLIP_PATH_PREFIX + clipPath.entity + '-' + object.entity;
                var $def = _this.defElementManager.getDefElement();
                var $existed = $def.querySelector("#".concat(clipPathId));
                if ($existed) {
                    _this.applyTransform($existed, parentInvert);
                }
            }
        };
        renderingService.hooks.init.tap(SVGRendererPlugin.tag, function () {
            var _a = _this.context.config, background = _a.background, document = _a.document;
            // <defs>
            _this.defElementManager.init();
            var $svg = _this.context.contextService.getContext();
            if (background) {
                $svg.style.background = background;
            }
            // @see https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/color-interpolation-filters
            $svg.setAttribute('color-interpolation-filters', 'sRGB');
            _this.$camera = createSVGElement('g', document);
            _this.$camera.id = "".concat(G_SVG_PREFIX, "-camera");
            _this.applyTransform(_this.$camera, _this.context.camera.getOrthoMatrix());
            $svg.appendChild(_this.$camera);
            canvas.addEventListener(gLite.ElementEvent.MOUNTED, handleMounted);
            canvas.addEventListener(gLite.ElementEvent.UNMOUNTED, handleUnmounted);
            canvas.addEventListener(gLite.ElementEvent.REPARENT, handleReparent);
            canvas.addEventListener(gLite.ElementEvent.ATTR_MODIFIED, handleAttributeChanged);
            canvas.addEventListener(gLite.ElementEvent.BOUNDS_CHANGED, handleGeometryBoundsChanged);
        });
        renderingService.hooks.destroy.tap(SVGRendererPlugin.tag, function () {
            canvas.removeEventListener(gLite.ElementEvent.MOUNTED, handleMounted);
            canvas.removeEventListener(gLite.ElementEvent.UNMOUNTED, handleUnmounted);
            canvas.removeEventListener(gLite.ElementEvent.REPARENT, handleReparent);
            canvas.removeEventListener(gLite.ElementEvent.ATTR_MODIFIED, handleAttributeChanged);
            canvas.removeEventListener(gLite.ElementEvent.BOUNDS_CHANGED, handleGeometryBoundsChanged);
            resetPatternCounter();
        });
        renderingService.hooks.render.tap(SVGRendererPlugin.tag, function (object) {
            _this.renderQueue.push(object);
        });
        renderingService.hooks.beginFrame.tap(SVGRendererPlugin.tag, function () {
            var doc = _this.context.config.document;
            if (_this.pendingReorderQueue.size) {
                _this.pendingReorderQueue.forEach(function (object) {
                    var _a;
                    var children = ((object === null || object === void 0 ? void 0 : object.children) || []).slice();
                    var $parentGroupEl = 
                    // @ts-ignore
                    (_a = object === null || object === void 0 ? void 0 : object.elementSVG) === null || _a === void 0 ? void 0 : _a.$groupEl;
                    if ($parentGroupEl) {
                        _this.reorderChildren(doc || document, $parentGroupEl, children || []);
                    }
                });
                _this.pendingReorderQueue.clear();
            }
        });
        renderingService.hooks.endFrame.tap(SVGRendererPlugin.tag, function () {
            if (renderingContext.renderReasons.has(gLite.RenderReason.CAMERA_CHANGED)) {
                _this.applyTransform(_this.$camera, _this.context.camera.getOrthoMatrix());
            }
            _this.renderQueue.forEach(function (object) {
                var _a, _b;
                var $el = (_a = object.elementSVG) === null || _a === void 0 ? void 0 : _a.$el;
                var $groupEl = (_b = object.elementSVG) === null || _b === void 0 ? void 0 : _b.$groupEl;
                if ($el && $groupEl) {
                    // apply local RTS transformation to <group> wrapper
                    // account for anchor
                    var localTransform = object.getLocalTransform();
                    _this.applyTransform($groupEl, localTransform);
                    // clipped shapes should also be informed
                    var $useRefs = _this.clipPathUseMap.get(object);
                    if ($useRefs && $useRefs.length) {
                        $useRefs.forEach(function ($use) {
                            // <clipPath transform="matrix()"><circle /></clipPath>
                            _this.applyTransform($use, object.getWorldTransform());
                            // const parentInvert = mat4.invert(
                            //   mat4.create(),
                            //   (object as DisplayObject).getWorldTransform(),
                            // );
                            // this.applyTransform($clipPath, parentInvert);
                        });
                    }
                    // finish rendering, clear dirty flag
                    object.renderable.dirty = false;
                }
                // update dirty attributes
                var attributes = _this.dirtyAttributes.get(object);
                if (attributes) {
                    attributes.forEach(function (attrName) {
                        if (attrName === 'zIndex') {
                            reorderChildren(object);
                        }
                        else if (attrName === 'increasedLineWidthForHitTesting') {
                            _this.createOrUpdateHitArea(object, $el, $groupEl);
                        }
                        _this.updateAttribute(object, [attrName]);
                    });
                    _this.dirtyAttributes.delete(object);
                }
            });
            _this.renderQueue = [];
        });
    };
    SVGRendererPlugin.prototype.getId = function (object) {
        return object.id || "".concat(G_SVG_PREFIX, "-").concat(object.entity);
    };
    SVGRendererPlugin.prototype.reorderChildren = function (doc, $groupEl, children) {
        // need to reorder parent's children
        children.sort(function (a, b) { return a.sortable.renderOrder - b.sortable.renderOrder; });
        if (children.length) {
            // create empty fragment
            var fragment_1 = (doc || document).createDocumentFragment();
            children.forEach(function (child) {
                if (child.isConnected) {
                    var $el = child.elementSVG.$groupEl;
                    if ($el) {
                        fragment_1.appendChild($el);
                    }
                }
            });
            $groupEl.appendChild(fragment_1);
        }
    };
    SVGRendererPlugin.prototype.applyTransform = function ($el, rts) {
        // use proper precision avoiding too long string in `transform`
        // @see https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Transformations
        $el.setAttribute('transform', "matrix(".concat(numberToLongString(rts[0]), ",").concat(numberToLongString(rts[1]), ",").concat(numberToLongString(rts[4]), ",").concat(numberToLongString(rts[5]), ",").concat(numberToLongString(rts[12]), ",").concat(numberToLongString(rts[13]), ")"));
    };
    SVGRendererPlugin.prototype.applyAttributes = function (object) {
        var elementSVG = object.elementSVG;
        var $el = elementSVG === null || elementSVG === void 0 ? void 0 : elementSVG.$el;
        var $groupEl = elementSVG === null || elementSVG === void 0 ? void 0 : elementSVG.$groupEl;
        if ($el && $groupEl) {
            var nodeName = object.nodeName, attributes = object.attributes;
            if (nodeName !== gLite.Shape.HTML) {
                $el.setAttribute('fill', 'none');
            }
            if (nodeName === gLite.Shape.IMAGE) {
                $el.setAttribute('preserveAspectRatio', 'none');
            }
            // apply attributes
            this.updateAttribute(object, Object.keys(attributes));
        }
    };
    SVGRendererPlugin.prototype.updateAttribute = function (object, attributes) {
        var _this = this;
        var enableCSSParsing = this.context.enableCSSParsing;
        var document = this.context.config.document;
        var _a = object
            .elementSVG, $el = _a.$el, $groupEl = _a.$groupEl, $hitTestingEl = _a.$hitTestingEl;
        var parsedStyle = object.parsedStyle, computedStyle = object.computedStyle, nodeName = object.nodeName;
        var shouldUpdateElementAttribute = attributes.some(function (name) {
            // @ts-ignore
            return _this.context.SVGElementLifeCycleContribution.shouldUpdateElementAttribute(object, name);
        });
        // need re-generate path
        if (shouldUpdateElementAttribute && $el) {
            [$el, $hitTestingEl].forEach(function ($el) {
                if ($el) {
                    // @ts-ignore
                    _this.context.SVGElementLifeCycleContribution.updateElementAttribute(object, $el, _this.svgElementMap);
                    if (object.nodeName !== gLite.Shape.TEXT) {
                        _this.updateAnchorWithTransform(object);
                    }
                }
            });
        }
        // update common attributes
        attributes.forEach(function (name) {
            var _a, _b;
            var usedName = SVG_ATTR_MAP[name];
            var computedValue = enableCSSParsing
                ? computedStyle[name]
                : parsedStyle[name];
            var computedValueStr = !util.isNil(computedValue) && computedValue.toString();
            var formattedValueStr = ((_a = FORMAT_VALUE_MAP[name]) === null || _a === void 0 ? void 0 : _a[computedValueStr]) || computedValueStr;
            var usedValue = parsedStyle[name];
            var inherited = usedName && !!((_b = gLite.propertyMetadataCache[name]) === null || _b === void 0 ? void 0 : _b.inh);
            // <foreignObject>
            if (nodeName === gLite.Shape.HTML) {
                if (name === 'fill') {
                    $el.style.background = usedValue.toString();
                }
                else if (name === 'stroke') {
                    $el.style['border-color'] = usedValue.toString();
                    $el.style['border-style'] = 'solid';
                }
                else if (name === 'lineWidth') {
                    $el.style['border-width'] = "".concat(usedValue || 0, "px");
                }
                else if (name === 'lineDash') {
                    $el.style['border-style'] = 'dashed';
                }
                else if (name === 'innerHTML') {
                    _this.createOrUpdateInnerHTML(document, $el, usedValue);
                }
                else if (name === 'width' || name === 'height' || name === 'class') {
                    // width & height are both required for <foreignObject> and cannot be used as style.
                    $el.setAttribute(name, usedValue.toString());
                }
                else if (name !== 'x' &&
                    name !== 'y' &&
                    !util.isNil(object.style[name]) &&
                    object.style[name] !== '') {
                    $el.style[name] = object.style[name];
                }
            }
            else {
                if (!usedName ||
                    ((nodeName === gLite.Shape.GROUP || object.isCustomElement) &&
                        !enableCSSParsing &&
                        (inherited || usedName === 'fill' || usedName === 'stroke'))) {
                    return;
                }
                if (name === 'fill') {
                    _this.defElementManager.createOrUpdateGradientAndPattern(object, $el, usedValue, usedName, _this);
                }
                else if (name === 'stroke') {
                    _this.defElementManager.createOrUpdateGradientAndPattern(object, $el, usedValue, usedName, _this);
                }
                else if (enableCSSParsing && inherited) {
                    // use computed value
                    // update `visibility` on <group>
                    if (computedValueStr !== 'unset' &&
                        computedValueStr !== DEFAULT_VALUE_MAP[name]) {
                        $groupEl === null || $groupEl === void 0 ? void 0 : $groupEl.setAttribute(usedName, formattedValueStr);
                    }
                    else {
                        $groupEl === null || $groupEl === void 0 ? void 0 : $groupEl.removeAttribute(usedName);
                    }
                }
                else if (name === 'clipPath') {
                    _this.createOrUpdateClipOrTextPath(document, usedValue, object);
                }
                else if (name === 'textPath') {
                    _this.createOrUpdateClipOrTextPath(document, usedValue, object, true);
                }
                else if (name === 'shadowType' ||
                    name === 'shadowColor' ||
                    name === 'shadowBlur' ||
                    name === 'shadowOffsetX' ||
                    name === 'shadowOffsetY') {
                    _this.defElementManager.createOrUpdateShadow(object, $el, name);
                }
                else if (name === 'filter') {
                    _this.defElementManager.createOrUpdateFilter(object, $el, usedValue);
                }
                else if (name === 'anchor') {
                    // text' anchor is controlled by `textAnchor` property
                    if (nodeName !== gLite.Shape.TEXT) {
                        _this.updateAnchorWithTransform(object);
                    }
                }
                else {
                    if (!util.isNil(computedValue)) {
                        // use computed value so that we can use cascaded effect in SVG
                        // ignore 'unset' and default value
                        [$el, $hitTestingEl].forEach(function ($el) {
                            if ($el && usedName) {
                                if (computedValueStr !== 'unset' &&
                                    computedValueStr !== DEFAULT_VALUE_MAP[name]) {
                                    $el.setAttribute(usedName, formattedValueStr);
                                }
                                else {
                                    $el.removeAttribute(usedName);
                                }
                            }
                        });
                    }
                }
            }
        });
    };
    SVGRendererPlugin.prototype.createSVGDom = function (document, object, root, noWrapWithGroup) {
        var _a;
        if (noWrapWithGroup === void 0) { noWrapWithGroup = false; }
        // create svg element
        // @ts-ignore
        object.elementSVG = new ElementSVG();
        // @ts-ignore
        var svgElement = object.elementSVG;
        // use <group> as default, eg. CustomElement
        var $el = 
        // @ts-ignore
        this.context.SVGElementLifeCycleContribution.createElement(object, this.svgElementMap);
        if ($el) {
            var $groupEl = void 0;
            // save $el on parsedStyle, which will be returned in getDomElement()
            if (object.nodeName === gLite.Shape.HTML) {
                object.parsedStyle.$el = $el;
            }
            if (this.pluginOptions.outputSVGElementId) {
                // use user-defined id first.
                $el.id = this.getId(object);
            }
            if (this.pluginOptions.outputSVGElementName && object.name) {
                $el.setAttribute('name', object.name);
            }
            if (($el.hasAttribute('data-wrapgroup') || $el.nodeName !== 'g') &&
                !noWrapWithGroup) {
                $groupEl = createSVGElement('g', document);
                // if (this.pluginOptions.outputSVGElementId) {
                //   $groupEl.id = $el.id + '-g';
                // }
                $groupEl.appendChild($el);
            }
            else {
                $groupEl = $el;
            }
            svgElement.$el = $el;
            svgElement.$groupEl = $groupEl;
            // apply attributes at first time
            this.applyAttributes(object);
            // create hitArea if necessary
            this.createOrUpdateHitArea(object, $el, $groupEl);
            var $parentGroupEl = root ||
                // @ts-ignore
                (object.parentNode && ((_a = object.parentNode.elementSVG) === null || _a === void 0 ? void 0 : _a.$groupEl));
            if ($parentGroupEl) {
                $parentGroupEl.appendChild($groupEl);
                // need reorder children later
                this.pendingReorderQueue.add(object.parentNode);
            }
        }
    };
    SVGRendererPlugin.prototype.removeSVGDom = function (object) {
        var _a;
        // @ts-ignore
        var $groupEl = (_a = object.elementSVG) === null || _a === void 0 ? void 0 : _a.$groupEl;
        if ($groupEl && $groupEl.parentNode) {
            $groupEl.parentNode.removeChild($groupEl);
            // @ts-ignore
            this.context.SVGElementLifeCycleContribution.destroyElement(object, $groupEl);
            // object.entity.removeComponent(ElementSVG, true);
        }
    };
    SVGRendererPlugin.prototype.createOrUpdateHitArea = function (object, $el, $groupEl) {
        var svgElement = object.elementSVG;
        var $hitTestingEl = svgElement.$hitTestingEl;
        var increasedLineWidthForHitTesting = Number(object.parsedStyle.increasedLineWidthForHitTesting);
        // account for hitArea
        if (increasedLineWidthForHitTesting) {
            if (!$hitTestingEl) {
                $hitTestingEl = $el.cloneNode();
                // clear attributes like `filter` `font-size`
                ['filter'].forEach(function (attribute) {
                    $hitTestingEl.removeAttribute(attribute);
                });
                // hitArea should be 'transparent' but not 'none'
                var hasFill = $el.getAttribute('fill') !== 'none';
                $hitTestingEl.setAttribute('fill', hasFill ? 'transparent' : 'none');
                $hitTestingEl.setAttribute('stroke', 'transparent');
                $groupEl.appendChild($hitTestingEl);
                svgElement.$hitTestingEl = $hitTestingEl;
                // g-plugin-svg-picker will use this map to find target object
                this.svgElementMap.set($hitTestingEl, object);
            }
            // increase interactive line width
            $hitTestingEl.setAttribute('stroke-width', "".concat(increasedLineWidthForHitTesting + object.parsedStyle.lineWidth));
        }
        else {
            if ($hitTestingEl) {
                $groupEl.removeChild($hitTestingEl);
                svgElement.$hitTestingEl = null;
            }
        }
    };
    SVGRendererPlugin.prototype.createOrUpdateInnerHTML = function (doc, $el, usedValue) {
        var $div = (doc || document).createElement('div');
        if (typeof usedValue === 'string') {
            $div.innerHTML = usedValue;
        }
        else {
            $div.appendChild(usedValue);
        }
        $el.innerHTML = '';
        $el.appendChild($div);
    };
    SVGRendererPlugin.prototype.createOrUpdateClipOrTextPath = function (document, clipPath, object, isTextPath) {
        if (isTextPath === void 0) { isTextPath = false; }
        var $groupEl = object.elementSVG.$groupEl;
        var PREFIX = isTextPath ? TEXT_PATH_PREFIX : CLIP_PATH_PREFIX;
        var attributeNameCamel = isTextPath ? 'g' : 'clipPath';
        var attributeNameHyphen = isTextPath ? 'text-path' : 'clip-path';
        if (clipPath) {
            var clipPathId = PREFIX + clipPath.entity + '-' + object.entity;
            var $def = this.defElementManager.getDefElement();
            var existed = $def.querySelector("#".concat(clipPathId));
            if (!existed) {
                var $clipPath = void 0;
                if (isTextPath) {
                    // use <path> directly instead of wrapping with <g>
                    this.createSVGDom(document, clipPath, null, true);
                    // @ts-ignore
                    $clipPath = clipPath.elementSVG.$el;
                }
                else {
                    // the clipPath is allowed to be detached from canvas
                    if (!clipPath.isConnected) {
                        var $existedClipPath = $def.querySelector("#".concat(this.getId(clipPath)));
                        if (!$existedClipPath) {
                            this.createSVGDom(document, clipPath, $def, true);
                        }
                    }
                    // create <clipPath> dom node
                    $clipPath = createSVGElement(attributeNameCamel, document);
                    var $use = createSVGElement('use', document);
                    // @ts-ignore
                    $use.setAttribute('href', "#".concat(clipPath.elementSVG.$el.id));
                    $clipPath.appendChild($use);
                    var $useRefs = this.clipPathUseMap.get(clipPath);
                    if (!$useRefs) {
                        this.clipPathUseMap.set(clipPath, []);
                        $useRefs = this.clipPathUseMap.get(clipPath);
                    }
                    $useRefs.push($use);
                    // <clipPath transform="matrix()"><circle /></clipPath>
                    this.applyTransform($use, clipPath.getWorldTransform());
                    var parentInvert = glMatrix.mat4.invert(glMatrix.mat4.create(), object.getWorldTransform());
                    this.applyTransform($clipPath, parentInvert);
                }
                if (this.pluginOptions.outputSVGElementId) {
                    $clipPath.id = clipPathId;
                }
                // append it to <defs>
                $def.appendChild($clipPath);
            }
            // apply attributes
            this.applyAttributes(clipPath);
            if (!isTextPath) {
                // apply clipPath to $group
                // @see https://github.com/antvis/g/issues/961
                $groupEl.setAttribute(attributeNameHyphen, "url(#".concat(clipPathId, ")"));
            }
        }
        else {
            if (!isTextPath) {
                // remove clip path
                $groupEl.removeAttribute(attributeNameHyphen);
            }
        }
    };
    /**
     * the origin is bounding box's top left corner
     */
    SVGRendererPlugin.prototype.updateAnchorWithTransform = function (object) {
        var _a, _b;
        var bounds = object.getGeometryBounds();
        var width = (bounds && bounds.halfExtents[0] * 2) || 0;
        var height = (bounds && bounds.halfExtents[1] * 2) || 0;
        var anchor = (object.parsedStyle || {}).anchor;
        [
            (_a = object.elementSVG) === null || _a === void 0 ? void 0 : _a.$el,
            (_b = object.elementSVG) === null || _b === void 0 ? void 0 : _b.$hitTestingEl,
        ].forEach(function ($el) {
            if ($el) {
                var tx = -(anchor[0] * width);
                var ty = -(anchor[1] * height);
                if (tx !== 0 || ty !== 0) {
                    // apply anchor to element's `transform` property
                    $el.setAttribute('transform', 
                    // can't use percent unit like translate(-50%, -50%)
                    // @see https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/transform#translate
                    "translate(".concat(tx, ",").concat(ty, ")"));
                }
                if (object.nodeName === gLite.Shape.CIRCLE ||
                    object.nodeName === gLite.Shape.ELLIPSE) {
                    $el.setAttribute('cx', "".concat(width / 2));
                    $el.setAttribute('cy', "".concat(height / 2));
                }
            }
        });
    };
    SVGRendererPlugin.tag = 'SVGRenderer';
    return SVGRendererPlugin;
}());

// @see https://github.com/plouc/nivo/issues/164
var BASELINE_MAP = {
    top: 'hanging', // Use hanging here.
    middle: 'central',
    bottom: 'text-after-edge', // FIXME: It is not a standard property.
    alphabetic: 'alphabetic',
    ideographic: 'ideographic',
    hanging: 'hanging',
};
function updateTextElementAttribute($el, parsedStyle, text, runtime) {
    var lineWidth = parsedStyle.lineWidth, dx = parsedStyle.dx, dy = parsedStyle.dy, textPath = parsedStyle.textPath, _a = parsedStyle.textPathSide, textPathSide = _a === void 0 ? 'left' : _a, _b = parsedStyle.textPathStartOffset, textPathStartOffset = _b === void 0 ? 0 : _b, _c = parsedStyle.textDecorationLine, textDecorationLine = _c === void 0 ? '' : _c, _d = parsedStyle.textDecorationColor, textDecorationColor = _d === void 0 ? '' : _d, _e = parsedStyle.textDecorationStyle, textDecorationStyle = _e === void 0 ? '' : _e, metrics = parsedStyle.metrics;
    var textBaseline = parsedStyle.textBaseline;
    if (!runtime.enableCSSParsing && textBaseline === 'alphabetic') {
        textBaseline = 'bottom';
    }
    $el.setAttribute('dominant-baseline', BASELINE_MAP[textBaseline]);
    $el.setAttribute('paint-order', 'stroke');
    var lines = metrics.lines, lineHeight = metrics.lineHeight, height = metrics.height;
    var lineNum = lines.length;
    var styleCSSText = '';
    if (dx !== 0 || dy !== 0) {
        styleCSSText += "transform:translate(".concat(dx, "px, ").concat(dy, "px);");
    }
    if (textDecorationLine && textDecorationLine !== 'none') {
        // use CSS text-decoration since the implementation in SVG is not good enough
        styleCSSText += "text-decoration:".concat(textDecorationLine, " ").concat(textDecorationStyle, " ").concat(textDecorationColor, ";");
    }
    if (styleCSSText) {
        $el.setAttribute('style', styleCSSText);
    }
    if (lineNum === 1) {
        var textContent = convertHTML(lines[0]);
        $el.setAttribute('dx', "".concat(lineWidth / 2));
        // Since `text-after-edge` is not a standard property value, we use `dy` instead.
        if (textBaseline === 'bottom' || textBaseline === 'top') {
            $el.setAttribute('dominant-baseline', BASELINE_MAP['middle']);
            $el.setAttribute('dy', textBaseline === 'bottom' ? "-".concat(height / 2, "px") : "".concat(height / 2, "px"));
        }
        // <textPath> only support one line
        // @see https://developer.mozilla.org/en-US/docs/Web/SVG/Element/textPath
        if (textPath) {
            // clear existed text content first
            $el.innerHTML = '';
            // append <textPath href="#MyPath">text</textPath>
            var $textPath = createSVGElement('textPath', $el.ownerDocument);
            $textPath.setAttribute('href', "#".concat(TEXT_PATH_PREFIX + textPath.entity));
            if (textPathSide !== 'left') {
                $textPath.setAttribute('side', textPathSide);
            }
            if (textPathStartOffset !== 0) {
                $textPath.setAttribute('startOffset', "".concat(textPathStartOffset));
            }
            $textPath.innerHTML = textContent;
            $el.appendChild($textPath);
        }
        else {
            $el.innerHTML = textContent;
        }
    }
    else {
        $el.innerHTML = lines
            .map(function (line, i) {
            var dx = lineWidth / 2;
            var dy = 0;
            if (i === 0) {
                // TODO: handle other textBaseline values
                if (textBaseline === 'middle') {
                    dy = lineHeight / 2 - height / 2;
                }
                else if (textBaseline === 'top' || textBaseline === 'hanging') {
                    dy = 0;
                }
                else if (textBaseline === 'bottom' ||
                    textBaseline === 'alphabetic' ||
                    textBaseline === 'ideographic') {
                    dy = -lineHeight * (lineNum - 1);
                }
            }
            else {
                dy = lineHeight;
            }
            return "<tspan x=\"0\" dx=\"".concat(dx, "\" dy=\"").concat(dy, "\">").concat(convertHTML(line), "</tspan>");
        })
            .join('');
    }
}

var _a, _b;
var SHAPE2TAGS = (_a = {},
    _a[gLite.Shape.RECT] = 'path',
    _a[gLite.Shape.CIRCLE] = 'circle',
    _a[gLite.Shape.ELLIPSE] = 'ellipse',
    _a[gLite.Shape.IMAGE] = 'image',
    _a[gLite.Shape.GROUP] = 'g',
    _a[gLite.Shape.LINE] = 'line',
    _a[gLite.Shape.POLYLINE] = 'polyline',
    _a[gLite.Shape.POLYGON] = 'polygon',
    _a[gLite.Shape.TEXT] = 'text',
    _a[gLite.Shape.PATH] = 'path',
    _a[gLite.Shape.HTML] = 'foreignObject',
    _a);
var SHAPE_UPDATE_DEPS = (_b = {},
    _b[gLite.Shape.CIRCLE] = ['r'],
    _b[gLite.Shape.ELLIPSE] = ['rx', 'ry'],
    _b[gLite.Shape.RECT] = ['width', 'height', 'radius'],
    _b[gLite.Shape.IMAGE] = ['img', 'width', 'height'],
    _b[gLite.Shape.LINE] = [
        'x1',
        'y1',
        'x2',
        'y2',
        'markerStart',
        'markerEnd',
        'markerStartOffset',
        'markerEndOffset',
    ],
    _b[gLite.Shape.POLYLINE] = [
        'points',
        'markerStart',
        'markerEnd',
        'markerMid',
        'markerStartOffset',
        'markerEndOffset',
    ],
    _b[gLite.Shape.POLYGON] = [
        'points',
        'markerStart',
        'markerEnd',
        'markerMid',
        'markerStartOffset',
        'markerEndOffset',
    ],
    _b[gLite.Shape.PATH] = [
        'path',
        'markerStart',
        'markerEnd',
        'markerMid',
        'markerStartOffset',
        'markerEndOffset',
    ],
    _b[gLite.Shape.TEXT] = [
        'text',
        'font',
        'fontSize',
        'fontFamily',
        'fontStyle',
        'fontWeight',
        'fontVariant',
        'lineHeight',
        'letterSpacing',
        'wordWrap',
        'wordWrapWidth',
        'maxLines',
        'leading',
        'textBaseline',
        'textAlign',
        'textTransform',
        'textOverflow',
        'textPath',
        'textPathSide',
        'textPathStartOffset',
        'textDecorationLine',
        'textDecorationColor',
        'textDecorationStyle',
        // 'whiteSpace',
        'dx',
        'dy',
    ],
    _b);
var DefaultElementLifeCycleContribution = /** @class */ (function () {
    function DefaultElementLifeCycleContribution(context, runtime) {
        this.context = context;
        this.runtime = runtime;
    }
    DefaultElementLifeCycleContribution.prototype.createElement = function (object, svgElementMap) {
        var doc = this.context.config.document;
        var type = SHAPE2TAGS[object.nodeName] || 'g';
        var $el = createSVGElement(type, doc || document);
        svgElementMap.set($el, object);
        return $el;
    };
    DefaultElementLifeCycleContribution.prototype.destroyElement = function (object, $el) { };
    DefaultElementLifeCycleContribution.prototype.shouldUpdateElementAttribute = function (object, attributeName) {
        var nodeName = object.nodeName;
        return (SHAPE_UPDATE_DEPS[nodeName] || []).indexOf(attributeName) > -1;
    };
    DefaultElementLifeCycleContribution.prototype.updateElementAttribute = function (object) {
        // @ts-ignore
        var $el = object.elementSVG.$el;
        var nodeName = object.nodeName, parsedStyle = object.parsedStyle;
        switch (nodeName) {
            case gLite.Shape.IMAGE: {
                updateImageElementAttribute($el, parsedStyle);
                break;
            }
            case gLite.Shape.RECT: {
                updateRectElementAttribute($el, parsedStyle);
                break;
            }
            case gLite.Shape.LINE: {
                updateLineElementAttribute($el, parsedStyle);
                break;
            }
            case gLite.Shape.POLYGON:
            case gLite.Shape.POLYLINE: {
                updatePolylineElementAttribute($el, parsedStyle);
                break;
            }
            case gLite.Shape.PATH: {
                updatePathElementAttribute($el, parsedStyle);
                break;
            }
            case gLite.Shape.TEXT: {
                updateTextElementAttribute($el, parsedStyle, object, this.runtime);
                break;
            }
        }
    };
    return DefaultElementLifeCycleContribution;
}());

var Plugin = /** @class */ (function (_super) {
    tslib.__extends(Plugin, _super);
    function Plugin(options) {
        if (options === void 0) { options = {}; }
        var _this = _super.call(this) || this;
        _this.options = options;
        _this.name = 'svg-renderer';
        return _this;
    }
    Plugin.prototype.init = function (runtime) {
        var _a = this.options, outputSVGElementId = _a.outputSVGElementId, outputSVGElementName = _a.outputSVGElementName;
        var defElementManager = new DefElementManager(this.context);
        // default implementation
        var defaultElementLifeCycleContribution = new DefaultElementLifeCycleContribution(this.context, runtime);
        // @ts-ignore
        this.context.defaultElementLifeCycleContribution =
            defaultElementLifeCycleContribution;
        // @ts-ignore
        this.context.SVGElementLifeCycleContribution =
            defaultElementLifeCycleContribution;
        var SVGRendererPluginOptions = {
            outputSVGElementId: !util.isNil(outputSVGElementId)
                ? !!outputSVGElementId
                : true,
            outputSVGElementName: !util.isNil(outputSVGElementName)
                ? !!outputSVGElementName
                : true,
        };
        this.addRenderingPlugin(
        // @ts-ignore
        new SVGRendererPlugin(SVGRendererPluginOptions, defElementManager, this.context));
    };
    Plugin.prototype.destroy = function () {
        this.removeAllRenderingPlugins();
        // @ts-ignore
        delete this.context.defaultElementLifeCycleContribution;
        // @ts-ignore
        delete this.context.SVGElementLifeCycleContribution;
    };
    return Plugin;
}(gLite.AbstractRendererPlugin));

exports.CLIP_PATH_PREFIX = CLIP_PATH_PREFIX;
exports.DEFAULT_VALUE_MAP = DEFAULT_VALUE_MAP;
exports.DefaultElementLifeCycleContribution = DefaultElementLifeCycleContribution;
exports.ElementSVG = ElementSVG;
exports.G_SVG_PREFIX = G_SVG_PREFIX;
exports.Plugin = Plugin;
exports.SHAPE2TAGS = SHAPE2TAGS;
exports.SHAPE_UPDATE_DEPS = SHAPE_UPDATE_DEPS;
exports.SVGRendererPlugin = SVGRendererPlugin;
exports.SVG_ATTR_MAP = SVG_ATTR_MAP;
exports.TEXT_PATH_PREFIX = TEXT_PATH_PREFIX;
exports.createSVGElement = createSVGElement;
exports.updateImageElementAttribute = updateImageElementAttribute;
exports.updateLineElementAttribute = updateLineElementAttribute;
exports.updatePathElementAttribute = updatePathElementAttribute;
exports.updatePolylineElementAttribute = updatePolylineElementAttribute;
exports.updateRectElementAttribute = updateRectElementAttribute;
exports.updateTextElementAttribute = updateTextElementAttribute;
//# sourceMappingURL=index.js.map

}, function(modId) {var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1729954662264);
})()
//miniprogram-npm-outsideDeps=["tslib","@antv/g-lite","@antv/util","gl-matrix"]
//# sourceMappingURL=index.js.map