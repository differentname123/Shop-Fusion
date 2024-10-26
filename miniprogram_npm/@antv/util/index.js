module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1729954662266, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
tslib_1.__exportStar(require("./color"), exports);
tslib_1.__exportStar(require("./matrix"), exports);
tslib_1.__exportStar(require("./path"), exports);
tslib_1.__exportStar(require("./lodash"), exports);
tslib_1.__exportStar(require("./math"), exports);
tslib_1.__exportStar(require("./dom"), exports);
//# sourceMappingURL=index.js.map
}, function(modId) {var map = {"./color":1729954662267,"./matrix":1729954662382,"./path":1729954662387,"./lodash":1729954662272,"./math":1729954662439,"./dom":1729954662442}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662267, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.toCSSGradient = exports.toRGB = exports.gradient = exports.rgb2arr = void 0;
var rgb2arr_1 = require("./rgb2arr");
Object.defineProperty(exports, "rgb2arr", { enumerable: true, get: function () { return rgb2arr_1.rgb2arr; } });
var gradient_1 = require("./gradient");
Object.defineProperty(exports, "gradient", { enumerable: true, get: function () { return gradient_1.gradient; } });
var torgb_1 = require("./torgb");
Object.defineProperty(exports, "toRGB", { enumerable: true, get: function () { return torgb_1.toRGB; } });
var tocssgradient_1 = require("./tocssgradient");
Object.defineProperty(exports, "toCSSGradient", { enumerable: true, get: function () { return tocssgradient_1.toCSSGradient; } });
//# sourceMappingURL=index.js.map
}, function(modId) { var map = {"./rgb2arr":1729954662268,"./gradient":1729954662269,"./torgb":1729954662271,"./tocssgradient":1729954662381}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662268, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.rgb2arr = rgb2arr;
/**
 * rgb 颜色转换成数组
 * @param str
 * @returns
 */
function rgb2arr(str) {
    return [parseInt(str.substr(1, 2), 16), parseInt(str.substr(3, 2), 16), parseInt(str.substr(5, 2), 16)];
}
//# sourceMappingURL=rgb2arr.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662269, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.gradient = gradient;
var rgb2arr_1 = require("./rgb2arr");
var arr2rgb_1 = require("./arr2rgb");
var torgb_1 = require("./torgb");
/**
 * 获取颜色之间的插值
 * @param start
 * @param end
 * @param percent
 * @param index
 * @returns
 */
function getValue(start, end, percent, index) {
    return start[index] + (end[index] - start[index]) * percent;
}
/**
 * 计算颜色
 * @param points
 * @param percent
 * @returns
 */
function calColor(points, percent) {
    var fixedPercent = isNaN(Number(percent)) || percent < 0 ? 0 : percent > 1 ? 1 : Number(percent);
    var steps = points.length - 1;
    var step = Math.floor(steps * fixedPercent);
    var left = steps * fixedPercent - step;
    var start = points[step];
    var end = step === steps ? start : points[step + 1];
    return (0, arr2rgb_1.arr2rgb)([getValue(start, end, left, 0), getValue(start, end, left, 1), getValue(start, end, left, 2)]);
}
/**
 * 获取渐变函数
 * @param colors 多个颜色
 * @return 颜色值
 */
function gradient(colors) {
    var colorArray = typeof colors === 'string' ? colors.split('-') : colors;
    var points = colorArray.map(function (color) {
        return (0, rgb2arr_1.rgb2arr)(color.indexOf('#') === -1 ? (0, torgb_1.toRGB)(color) : color);
    });
    // 返回一个函数
    return function (percent) {
        return calColor(points, percent);
    };
}
//# sourceMappingURL=gradient.js.map
}, function(modId) { var map = {"./rgb2arr":1729954662268,"./arr2rgb":1729954662270,"./torgb":1729954662271}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662270, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.toHex = toHex;
exports.arr2rgb = arr2rgb;
/**
 * 将数值从 0-255 转换成 16 进制字符串
 * @param value
 * @returns
 */
function toHex(value) {
    var x16Value = Math.round(value).toString(16);
    return x16Value.length === 1 ? "0".concat(x16Value) : x16Value;
}
/**
 * 数组转换成颜色
 * @param arr
 * @returns
 */
function arr2rgb(arr) {
    return "#".concat(toHex(arr[0])).concat(toHex(arr[1])).concat(toHex(arr[2]));
}
//# sourceMappingURL=arr2rgb.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662271, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.toRGB = void 0;
var lodash_1 = require("../lodash");
var arr2rgb_1 = require("./arr2rgb");
var RGB_REG = /rgba?\(([\s.,0-9]+)\)/;
/**
 * 创建辅助 tag 取颜色
 * @returns
 */
function getTmp() {
    var i = document.getElementById('antv-web-colour-picker');
    if (i) {
        return i;
    }
    i = document.createElement('i');
    i.id = 'antv-web-colour-picker';
    i.title = 'Web Colour Picker';
    i.style.display = 'none';
    document.body.appendChild(i);
    return i;
}
/**
 * 将颜色转换到 rgb 的格式
 * @param {color} color 颜色
 * @return 将颜色转换到 '#ffffff' 的格式
 */
function toRGBString(color) {
    // 如果已经是 rgb的格式
    if (color[0] === '#' && color.length === 7) {
        return color;
    }
    var iEl = getTmp();
    iEl.style.color = color;
    var rst = document.defaultView.getComputedStyle(iEl, '').getPropertyValue('color');
    var matches = RGB_REG.exec(rst);
    var cArray = matches[1].split(/\s*,\s*/).map(function (s) { return Number(s); });
    rst = (0, arr2rgb_1.arr2rgb)(cArray);
    return rst;
}
/**
 * export with memoize.
 * @param color
 * @returns
 */
exports.toRGB = (0, lodash_1.memoize)(toRGBString, function (color) { return color; }, 256);
//# sourceMappingURL=torgb.js.map
}, function(modId) { var map = {"../lodash":1729954662272,"./arr2rgb":1729954662270}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662272, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.has = exports.forIn = exports.toRadian = exports.toInteger = exports.toDegree = exports.mod = exports.minBy = exports.min = exports.maxBy = exports.max = exports.isPositive = exports.isOdd = exports.isNumberEqual = exports.isNegative = exports.isInteger = exports.isEven = exports.isDecimal = exports.fixedBase = exports.clamp = exports.parseRadius = exports.number2color = exports.wrapBehavior = exports.getWrapBehavior = exports.groupToMap = exports.groupBy = exports.group = exports.some = exports.every = exports.filter = exports.endsWith = exports.startsWith = exports.last = exports.head = exports.valuesOfKey = exports.uniq = exports.union = exports.sortBy = exports.remove = exports.reduce = exports.pullAt = exports.pull = exports.getRange = exports.flattenDeep = exports.flatten = exports.firstValue = exports.findIndex = exports.find = exports.difference = exports.includes = exports.contains = void 0;
exports.set = exports.get = exports.assign = exports.mix = exports.mapValues = exports.map = exports.isEqualWith = exports.isEqual = exports.isEmpty = exports.indexOf = exports.extend = exports.each = exports.deepMix = exports.memoize = exports.debounce = exports.clone = exports.augment = exports.clearAnimationFrame = exports.requestAnimationFrame = exports.isElement = exports.isUndefined = exports.isType = exports.isString = exports.isRegExp = exports.isPrototype = exports.isPlainObject = exports.isObjectLike = exports.isObject = exports.isNumber = exports.isNull = exports.isNil = exports.isFinite = exports.isFunction = exports.isError = exports.isDate = exports.isBoolean = exports.isArrayLike = exports.isArray = exports.isArguments = exports.getType = exports.upperFirst = exports.upperCase = exports.substitute = exports.lowerFirst = exports.lowerCase = exports.values = exports.isMatch = exports.keys = exports.hasValue = exports.hasKey = void 0;
exports.Cache = exports.size = exports.identity = exports.noop = exports.uniqueId = exports.toString = exports.toArray = exports.throttle = exports.omit = exports.pick = void 0;
var tslib_1 = require("tslib");
// array
var contains_1 = require("./contains");
Object.defineProperty(exports, "contains", { enumerable: true, get: function () { return tslib_1.__importDefault(contains_1).default; } });
Object.defineProperty(exports, "includes", { enumerable: true, get: function () { return tslib_1.__importDefault(contains_1).default; } });
var difference_1 = require("./difference");
Object.defineProperty(exports, "difference", { enumerable: true, get: function () { return tslib_1.__importDefault(difference_1).default; } });
var find_1 = require("./find");
Object.defineProperty(exports, "find", { enumerable: true, get: function () { return tslib_1.__importDefault(find_1).default; } });
var find_index_1 = require("./find-index");
Object.defineProperty(exports, "findIndex", { enumerable: true, get: function () { return tslib_1.__importDefault(find_index_1).default; } });
var first_value_1 = require("./first-value");
Object.defineProperty(exports, "firstValue", { enumerable: true, get: function () { return tslib_1.__importDefault(first_value_1).default; } });
var flatten_1 = require("./flatten");
Object.defineProperty(exports, "flatten", { enumerable: true, get: function () { return tslib_1.__importDefault(flatten_1).default; } });
var flatten_deep_1 = require("./flatten-deep");
Object.defineProperty(exports, "flattenDeep", { enumerable: true, get: function () { return tslib_1.__importDefault(flatten_deep_1).default; } });
var get_range_1 = require("./get-range");
Object.defineProperty(exports, "getRange", { enumerable: true, get: function () { return tslib_1.__importDefault(get_range_1).default; } });
var pull_1 = require("./pull");
Object.defineProperty(exports, "pull", { enumerable: true, get: function () { return tslib_1.__importDefault(pull_1).default; } });
var pull_at_1 = require("./pull-at");
Object.defineProperty(exports, "pullAt", { enumerable: true, get: function () { return tslib_1.__importDefault(pull_at_1).default; } });
var reduce_1 = require("./reduce");
Object.defineProperty(exports, "reduce", { enumerable: true, get: function () { return tslib_1.__importDefault(reduce_1).default; } });
var remove_1 = require("./remove");
Object.defineProperty(exports, "remove", { enumerable: true, get: function () { return tslib_1.__importDefault(remove_1).default; } });
var sort_by_1 = require("./sort-by");
Object.defineProperty(exports, "sortBy", { enumerable: true, get: function () { return tslib_1.__importDefault(sort_by_1).default; } });
var union_1 = require("./union");
Object.defineProperty(exports, "union", { enumerable: true, get: function () { return tslib_1.__importDefault(union_1).default; } });
var uniq_1 = require("./uniq");
Object.defineProperty(exports, "uniq", { enumerable: true, get: function () { return tslib_1.__importDefault(uniq_1).default; } });
var values_of_key_1 = require("./values-of-key");
Object.defineProperty(exports, "valuesOfKey", { enumerable: true, get: function () { return tslib_1.__importDefault(values_of_key_1).default; } });
var head_1 = require("./head");
Object.defineProperty(exports, "head", { enumerable: true, get: function () { return tslib_1.__importDefault(head_1).default; } });
var last_1 = require("./last");
Object.defineProperty(exports, "last", { enumerable: true, get: function () { return tslib_1.__importDefault(last_1).default; } });
var starts_with_1 = require("./starts-with");
Object.defineProperty(exports, "startsWith", { enumerable: true, get: function () { return tslib_1.__importDefault(starts_with_1).default; } });
var ends_with_1 = require("./ends-with");
Object.defineProperty(exports, "endsWith", { enumerable: true, get: function () { return tslib_1.__importDefault(ends_with_1).default; } });
var filter_1 = require("./filter");
Object.defineProperty(exports, "filter", { enumerable: true, get: function () { return tslib_1.__importDefault(filter_1).default; } });
var every_1 = require("./every");
Object.defineProperty(exports, "every", { enumerable: true, get: function () { return tslib_1.__importDefault(every_1).default; } });
var some_1 = require("./some");
Object.defineProperty(exports, "some", { enumerable: true, get: function () { return tslib_1.__importDefault(some_1).default; } });
var group_1 = require("./group");
Object.defineProperty(exports, "group", { enumerable: true, get: function () { return tslib_1.__importDefault(group_1).default; } });
var group_by_1 = require("./group-by");
Object.defineProperty(exports, "groupBy", { enumerable: true, get: function () { return tslib_1.__importDefault(group_by_1).default; } });
var group_to_map_1 = require("./group-to-map");
Object.defineProperty(exports, "groupToMap", { enumerable: true, get: function () { return tslib_1.__importDefault(group_to_map_1).default; } });
// event
var get_wrap_behavior_1 = require("./get-wrap-behavior");
Object.defineProperty(exports, "getWrapBehavior", { enumerable: true, get: function () { return tslib_1.__importDefault(get_wrap_behavior_1).default; } });
var wrap_behavior_1 = require("./wrap-behavior");
Object.defineProperty(exports, "wrapBehavior", { enumerable: true, get: function () { return tslib_1.__importDefault(wrap_behavior_1).default; } });
// format
var number2color_1 = require("./number2color");
Object.defineProperty(exports, "number2color", { enumerable: true, get: function () { return tslib_1.__importDefault(number2color_1).default; } });
var parse_radius_1 = require("./parse-radius");
Object.defineProperty(exports, "parseRadius", { enumerable: true, get: function () { return tslib_1.__importDefault(parse_radius_1).default; } });
// math
var clamp_1 = require("./clamp");
Object.defineProperty(exports, "clamp", { enumerable: true, get: function () { return tslib_1.__importDefault(clamp_1).default; } });
var fixed_base_1 = require("./fixed-base");
Object.defineProperty(exports, "fixedBase", { enumerable: true, get: function () { return tslib_1.__importDefault(fixed_base_1).default; } });
var is_decimal_1 = require("./is-decimal");
Object.defineProperty(exports, "isDecimal", { enumerable: true, get: function () { return tslib_1.__importDefault(is_decimal_1).default; } });
var is_even_1 = require("./is-even");
Object.defineProperty(exports, "isEven", { enumerable: true, get: function () { return tslib_1.__importDefault(is_even_1).default; } });
var is_integer_1 = require("./is-integer");
Object.defineProperty(exports, "isInteger", { enumerable: true, get: function () { return tslib_1.__importDefault(is_integer_1).default; } });
var is_negative_1 = require("./is-negative");
Object.defineProperty(exports, "isNegative", { enumerable: true, get: function () { return tslib_1.__importDefault(is_negative_1).default; } });
var is_number_equal_1 = require("./is-number-equal");
Object.defineProperty(exports, "isNumberEqual", { enumerable: true, get: function () { return tslib_1.__importDefault(is_number_equal_1).default; } });
var is_odd_1 = require("./is-odd");
Object.defineProperty(exports, "isOdd", { enumerable: true, get: function () { return tslib_1.__importDefault(is_odd_1).default; } });
var is_positive_1 = require("./is-positive");
Object.defineProperty(exports, "isPositive", { enumerable: true, get: function () { return tslib_1.__importDefault(is_positive_1).default; } });
var max_1 = require("./max");
Object.defineProperty(exports, "max", { enumerable: true, get: function () { return tslib_1.__importDefault(max_1).default; } });
var max_by_1 = require("./max-by");
Object.defineProperty(exports, "maxBy", { enumerable: true, get: function () { return tslib_1.__importDefault(max_by_1).default; } });
var min_1 = require("./min");
Object.defineProperty(exports, "min", { enumerable: true, get: function () { return tslib_1.__importDefault(min_1).default; } });
var min_by_1 = require("./min-by");
Object.defineProperty(exports, "minBy", { enumerable: true, get: function () { return tslib_1.__importDefault(min_by_1).default; } });
var mod_1 = require("./mod");
Object.defineProperty(exports, "mod", { enumerable: true, get: function () { return tslib_1.__importDefault(mod_1).default; } });
var to_degree_1 = require("./to-degree");
Object.defineProperty(exports, "toDegree", { enumerable: true, get: function () { return tslib_1.__importDefault(to_degree_1).default; } });
var to_integer_1 = require("./to-integer");
Object.defineProperty(exports, "toInteger", { enumerable: true, get: function () { return tslib_1.__importDefault(to_integer_1).default; } });
var to_radian_1 = require("./to-radian");
Object.defineProperty(exports, "toRadian", { enumerable: true, get: function () { return tslib_1.__importDefault(to_radian_1).default; } });
// object
var for_in_1 = require("./for-in");
Object.defineProperty(exports, "forIn", { enumerable: true, get: function () { return tslib_1.__importDefault(for_in_1).default; } });
var has_1 = require("./has");
Object.defineProperty(exports, "has", { enumerable: true, get: function () { return tslib_1.__importDefault(has_1).default; } });
var has_key_1 = require("./has-key");
Object.defineProperty(exports, "hasKey", { enumerable: true, get: function () { return tslib_1.__importDefault(has_key_1).default; } });
var has_value_1 = require("./has-value");
Object.defineProperty(exports, "hasValue", { enumerable: true, get: function () { return tslib_1.__importDefault(has_value_1).default; } });
var keys_1 = require("./keys");
Object.defineProperty(exports, "keys", { enumerable: true, get: function () { return tslib_1.__importDefault(keys_1).default; } });
var is_match_1 = require("./is-match");
Object.defineProperty(exports, "isMatch", { enumerable: true, get: function () { return tslib_1.__importDefault(is_match_1).default; } });
var values_1 = require("./values");
Object.defineProperty(exports, "values", { enumerable: true, get: function () { return tslib_1.__importDefault(values_1).default; } });
// string
var lower_case_1 = require("./lower-case");
Object.defineProperty(exports, "lowerCase", { enumerable: true, get: function () { return tslib_1.__importDefault(lower_case_1).default; } });
var lower_first_1 = require("./lower-first");
Object.defineProperty(exports, "lowerFirst", { enumerable: true, get: function () { return tslib_1.__importDefault(lower_first_1).default; } });
var substitute_1 = require("./substitute");
Object.defineProperty(exports, "substitute", { enumerable: true, get: function () { return tslib_1.__importDefault(substitute_1).default; } });
var upper_case_1 = require("./upper-case");
Object.defineProperty(exports, "upperCase", { enumerable: true, get: function () { return tslib_1.__importDefault(upper_case_1).default; } });
var upper_first_1 = require("./upper-first");
Object.defineProperty(exports, "upperFirst", { enumerable: true, get: function () { return tslib_1.__importDefault(upper_first_1).default; } });
// type
var get_type_1 = require("./get-type");
Object.defineProperty(exports, "getType", { enumerable: true, get: function () { return tslib_1.__importDefault(get_type_1).default; } });
var is_arguments_1 = require("./is-arguments");
Object.defineProperty(exports, "isArguments", { enumerable: true, get: function () { return tslib_1.__importDefault(is_arguments_1).default; } });
var is_array_1 = require("./is-array");
Object.defineProperty(exports, "isArray", { enumerable: true, get: function () { return tslib_1.__importDefault(is_array_1).default; } });
var is_array_like_1 = require("./is-array-like");
Object.defineProperty(exports, "isArrayLike", { enumerable: true, get: function () { return tslib_1.__importDefault(is_array_like_1).default; } });
var is_boolean_1 = require("./is-boolean");
Object.defineProperty(exports, "isBoolean", { enumerable: true, get: function () { return tslib_1.__importDefault(is_boolean_1).default; } });
var is_date_1 = require("./is-date");
Object.defineProperty(exports, "isDate", { enumerable: true, get: function () { return tslib_1.__importDefault(is_date_1).default; } });
var is_error_1 = require("./is-error");
Object.defineProperty(exports, "isError", { enumerable: true, get: function () { return tslib_1.__importDefault(is_error_1).default; } });
var is_function_1 = require("./is-function");
Object.defineProperty(exports, "isFunction", { enumerable: true, get: function () { return tslib_1.__importDefault(is_function_1).default; } });
var is_finite_1 = require("./is-finite");
Object.defineProperty(exports, "isFinite", { enumerable: true, get: function () { return tslib_1.__importDefault(is_finite_1).default; } });
var is_nil_1 = require("./is-nil");
Object.defineProperty(exports, "isNil", { enumerable: true, get: function () { return tslib_1.__importDefault(is_nil_1).default; } });
var is_null_1 = require("./is-null");
Object.defineProperty(exports, "isNull", { enumerable: true, get: function () { return tslib_1.__importDefault(is_null_1).default; } });
var is_number_1 = require("./is-number");
Object.defineProperty(exports, "isNumber", { enumerable: true, get: function () { return tslib_1.__importDefault(is_number_1).default; } });
var is_object_1 = require("./is-object");
Object.defineProperty(exports, "isObject", { enumerable: true, get: function () { return tslib_1.__importDefault(is_object_1).default; } });
var is_object_like_1 = require("./is-object-like");
Object.defineProperty(exports, "isObjectLike", { enumerable: true, get: function () { return tslib_1.__importDefault(is_object_like_1).default; } });
var is_plain_object_1 = require("./is-plain-object");
Object.defineProperty(exports, "isPlainObject", { enumerable: true, get: function () { return tslib_1.__importDefault(is_plain_object_1).default; } });
var is_prototype_1 = require("./is-prototype");
Object.defineProperty(exports, "isPrototype", { enumerable: true, get: function () { return tslib_1.__importDefault(is_prototype_1).default; } });
var is_reg_exp_1 = require("./is-reg-exp");
Object.defineProperty(exports, "isRegExp", { enumerable: true, get: function () { return tslib_1.__importDefault(is_reg_exp_1).default; } });
var is_string_1 = require("./is-string");
Object.defineProperty(exports, "isString", { enumerable: true, get: function () { return tslib_1.__importDefault(is_string_1).default; } });
var is_type_1 = require("./is-type");
Object.defineProperty(exports, "isType", { enumerable: true, get: function () { return tslib_1.__importDefault(is_type_1).default; } });
var is_undefined_1 = require("./is-undefined");
Object.defineProperty(exports, "isUndefined", { enumerable: true, get: function () { return tslib_1.__importDefault(is_undefined_1).default; } });
var is_element_1 = require("./is-element");
Object.defineProperty(exports, "isElement", { enumerable: true, get: function () { return tslib_1.__importDefault(is_element_1).default; } });
var request_animation_frame_1 = require("./request-animation-frame");
Object.defineProperty(exports, "requestAnimationFrame", { enumerable: true, get: function () { return tslib_1.__importDefault(request_animation_frame_1).default; } });
var clear_animation_frame_1 = require("./clear-animation-frame");
Object.defineProperty(exports, "clearAnimationFrame", { enumerable: true, get: function () { return tslib_1.__importDefault(clear_animation_frame_1).default; } });
// other
var augment_1 = require("./augment");
Object.defineProperty(exports, "augment", { enumerable: true, get: function () { return tslib_1.__importDefault(augment_1).default; } });
var clone_1 = require("./clone");
Object.defineProperty(exports, "clone", { enumerable: true, get: function () { return tslib_1.__importDefault(clone_1).default; } });
var debounce_1 = require("./debounce");
Object.defineProperty(exports, "debounce", { enumerable: true, get: function () { return tslib_1.__importDefault(debounce_1).default; } });
var memoize_1 = require("./memoize");
Object.defineProperty(exports, "memoize", { enumerable: true, get: function () { return tslib_1.__importDefault(memoize_1).default; } });
var deep_mix_1 = require("./deep-mix");
Object.defineProperty(exports, "deepMix", { enumerable: true, get: function () { return tslib_1.__importDefault(deep_mix_1).default; } });
var each_1 = require("./each");
Object.defineProperty(exports, "each", { enumerable: true, get: function () { return tslib_1.__importDefault(each_1).default; } });
var extend_1 = require("./extend");
Object.defineProperty(exports, "extend", { enumerable: true, get: function () { return tslib_1.__importDefault(extend_1).default; } });
var index_of_1 = require("./index-of");
Object.defineProperty(exports, "indexOf", { enumerable: true, get: function () { return tslib_1.__importDefault(index_of_1).default; } });
var is_empty_1 = require("./is-empty");
Object.defineProperty(exports, "isEmpty", { enumerable: true, get: function () { return tslib_1.__importDefault(is_empty_1).default; } });
var is_equal_1 = require("./is-equal");
Object.defineProperty(exports, "isEqual", { enumerable: true, get: function () { return tslib_1.__importDefault(is_equal_1).default; } });
var is_equal_with_1 = require("./is-equal-with");
Object.defineProperty(exports, "isEqualWith", { enumerable: true, get: function () { return tslib_1.__importDefault(is_equal_with_1).default; } });
var map_1 = require("./map");
Object.defineProperty(exports, "map", { enumerable: true, get: function () { return tslib_1.__importDefault(map_1).default; } });
var map_values_1 = require("./map-values");
Object.defineProperty(exports, "mapValues", { enumerable: true, get: function () { return tslib_1.__importDefault(map_values_1).default; } });
var mix_1 = require("./mix");
Object.defineProperty(exports, "mix", { enumerable: true, get: function () { return tslib_1.__importDefault(mix_1).default; } });
Object.defineProperty(exports, "assign", { enumerable: true, get: function () { return tslib_1.__importDefault(mix_1).default; } });
var get_1 = require("./get");
Object.defineProperty(exports, "get", { enumerable: true, get: function () { return tslib_1.__importDefault(get_1).default; } });
var set_1 = require("./set");
Object.defineProperty(exports, "set", { enumerable: true, get: function () { return tslib_1.__importDefault(set_1).default; } });
var pick_1 = require("./pick");
Object.defineProperty(exports, "pick", { enumerable: true, get: function () { return tslib_1.__importDefault(pick_1).default; } });
var omit_1 = require("./omit");
Object.defineProperty(exports, "omit", { enumerable: true, get: function () { return tslib_1.__importDefault(omit_1).default; } });
var throttle_1 = require("./throttle");
Object.defineProperty(exports, "throttle", { enumerable: true, get: function () { return tslib_1.__importDefault(throttle_1).default; } });
var to_array_1 = require("./to-array");
Object.defineProperty(exports, "toArray", { enumerable: true, get: function () { return tslib_1.__importDefault(to_array_1).default; } });
var to_string_1 = require("./to-string");
Object.defineProperty(exports, "toString", { enumerable: true, get: function () { return tslib_1.__importDefault(to_string_1).default; } });
var unique_id_1 = require("./unique-id");
Object.defineProperty(exports, "uniqueId", { enumerable: true, get: function () { return tslib_1.__importDefault(unique_id_1).default; } });
var noop_1 = require("./noop");
Object.defineProperty(exports, "noop", { enumerable: true, get: function () { return tslib_1.__importDefault(noop_1).default; } });
var identity_1 = require("./identity");
Object.defineProperty(exports, "identity", { enumerable: true, get: function () { return tslib_1.__importDefault(identity_1).default; } });
var size_1 = require("./size");
Object.defineProperty(exports, "size", { enumerable: true, get: function () { return tslib_1.__importDefault(size_1).default; } });
// 不知道为什么，需要把这个 export，不然 ts 会报类型错误
var cache_1 = require("./cache");
Object.defineProperty(exports, "Cache", { enumerable: true, get: function () { return tslib_1.__importDefault(cache_1).default; } });
//# sourceMappingURL=index.js.map
}, function(modId) { var map = {"./contains":1729954662273,"./difference":1729954662275,"./find":1729954662277,"./find-index":1729954662288,"./first-value":1729954662289,"./flatten":1729954662290,"./flatten-deep":1729954662291,"./get-range":1729954662292,"./pull":1729954662295,"./pull-at":1729954662296,"./reduce":1729954662297,"./remove":1729954662298,"./sort-by":1729954662299,"./union":1729954662301,"./uniq":1729954662302,"./values-of-key":1729954662303,"./head":1729954662304,"./last":1729954662305,"./starts-with":1729954662306,"./ends-with":1729954662307,"./filter":1729954662276,"./every":1729954662308,"./some":1729954662309,"./group":1729954662310,"./group-by":1729954662312,"./group-to-map":1729954662311,"./get-wrap-behavior":1729954662313,"./wrap-behavior":1729954662314,"./number2color":1729954662315,"./parse-radius":1729954662316,"./clamp":1729954662317,"./fixed-base":1729954662318,"./is-decimal":1729954662319,"./is-even":1729954662321,"./is-integer":1729954662322,"./is-negative":1729954662323,"./is-number-equal":1729954662324,"./is-odd":1729954662325,"./is-positive":1729954662326,"./max":1729954662293,"./max-by":1729954662327,"./min":1729954662294,"./min-by":1729954662328,"./mod":1729954662329,"./to-degree":1729954662330,"./to-integer":1729954662331,"./to-radian":1729954662332,"./for-in":1729954662333,"./has":1729954662334,"./has-key":1729954662335,"./has-value":1729954662336,"./keys":1729954662281,"./is-match":1729954662279,"./values":1729954662337,"./lower-case":1729954662338,"./lower-first":1729954662340,"./substitute":1729954662341,"./upper-case":1729954662342,"./upper-first":1729954662343,"./get-type":1729954662344,"./is-arguments":1729954662345,"./is-array":1729954662283,"./is-array-like":1729954662274,"./is-boolean":1729954662346,"./is-date":1729954662347,"./is-error":1729954662348,"./is-function":1729954662278,"./is-finite":1729954662349,"./is-nil":1729954662280,"./is-null":1729954662350,"./is-number":1729954662320,"./is-object":1729954662284,"./is-object-like":1729954662286,"./is-plain-object":1729954662285,"./is-prototype":1729954662351,"./is-reg-exp":1729954662352,"./is-string":1729954662300,"./is-type":1729954662287,"./is-undefined":1729954662353,"./is-element":1729954662354,"./request-animation-frame":1729954662355,"./clear-animation-frame":1729954662356,"./augment":1729954662357,"./clone":1729954662359,"./debounce":1729954662360,"./memoize":1729954662361,"./deep-mix":1729954662362,"./each":1729954662282,"./extend":1729954662363,"./index-of":1729954662364,"./is-empty":1729954662365,"./is-equal":1729954662366,"./is-equal-with":1729954662367,"./map":1729954662368,"./map-values":1729954662369,"./mix":1729954662358,"./get":1729954662370,"./set":1729954662371,"./pick":1729954662372,"./omit":1729954662373,"./throttle":1729954662374,"./to-array":1729954662375,"./to-string":1729954662339,"./unique-id":1729954662376,"./noop":1729954662377,"./identity":1729954662378,"./size":1729954662379,"./cache":1729954662380}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662273, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var is_array_like_1 = tslib_1.__importDefault(require("./is-array-like"));
var contains = function (arr, value) {
    if (!(0, is_array_like_1.default)(arr)) {
        return false;
    }
    return arr.indexOf(value) > -1;
};
exports.default = contains;
//# sourceMappingURL=contains.js.map
}, function(modId) { var map = {"./is-array-like":1729954662274}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662274, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
var isArrayLike = function (value) {
    /**
     * isArrayLike([1, 2, 3]) => true
     * isArrayLike(document.body.children) => true
     * isArrayLike('abc') => true
     * isArrayLike(Function) => false
     */
    return value !== null && typeof value !== 'function' && isFinite(value.length);
};
exports.default = isArrayLike;
//# sourceMappingURL=is-array-like.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662275, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var filter_1 = tslib_1.__importDefault(require("./filter"));
var contains_1 = tslib_1.__importDefault(require("./contains"));
/**
 * Flattens `array` a single level deep.
 *
 * @param {Array} arr The array to inspect.
 * @param {Array} values The values to exclude.
 * @return {Array} Returns the new array of filtered values.
 * @example
 * difference([2, 1], [2, 3]);  // => [1]
 */
var difference = function (arr, values) {
    if (values === void 0) { values = []; }
    return (0, filter_1.default)(arr, function (value) { return !(0, contains_1.default)(values, value); });
};
exports.default = difference;
//# sourceMappingURL=difference.js.map
}, function(modId) { var map = {"./filter":1729954662276,"./contains":1729954662273}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662276, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var is_array_like_1 = tslib_1.__importDefault(require("./is-array-like"));
var filter = function (arr, func) {
    if (!(0, is_array_like_1.default)(arr)) {
        return arr;
    }
    var result = [];
    for (var index = 0; index < arr.length; index++) {
        var value = arr[index];
        if (func(value, index)) {
            result.push(value);
        }
    }
    return result;
};
exports.default = filter;
//# sourceMappingURL=filter.js.map
}, function(modId) { var map = {"./is-array-like":1729954662274}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662277, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var is_function_1 = tslib_1.__importDefault(require("./is-function"));
var is_match_1 = tslib_1.__importDefault(require("./is-match"));
var is_array_1 = tslib_1.__importDefault(require("./is-array"));
var is_plain_object_1 = tslib_1.__importDefault(require("./is-plain-object"));
function find(arr, predicate) {
    if (!(0, is_array_1.default)(arr))
        return null;
    var _predicate;
    if ((0, is_function_1.default)(predicate)) {
        _predicate = predicate;
    }
    if ((0, is_plain_object_1.default)(predicate)) {
        _predicate = function (a) { return (0, is_match_1.default)(a, predicate); };
    }
    if (_predicate) {
        for (var i = 0; i < arr.length; i += 1) {
            if (_predicate(arr[i])) {
                return arr[i];
            }
        }
    }
    return null;
}
exports.default = find;
//# sourceMappingURL=find.js.map
}, function(modId) { var map = {"./is-function":1729954662278,"./is-match":1729954662279,"./is-array":1729954662283,"./is-plain-object":1729954662285}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662278, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.default = isFunction;
/**
 * 判断值是否为函数
 * @return 是否为函数
 */
function isFunction(value) {
    return typeof value === 'function';
}
//# sourceMappingURL=is-function.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662279, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var is_nil_1 = tslib_1.__importDefault(require("./is-nil"));
var keys_1 = tslib_1.__importDefault(require("./keys"));
function isMatch(obj, attrs) {
    var _keys = (0, keys_1.default)(attrs);
    var length = _keys.length;
    if ((0, is_nil_1.default)(obj))
        return !length;
    for (var i = 0; i < length; i += 1) {
        var key = _keys[i];
        if (attrs[key] !== obj[key] || !(key in obj)) {
            return false;
        }
    }
    return true;
}
exports.default = isMatch;
//# sourceMappingURL=is-match.js.map
}, function(modId) { var map = {"./is-nil":1729954662280,"./keys":1729954662281}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662280, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.default = isNil;
/**
 * 判断值是否为 null 或 undefined
 * @return 是否为 null 或 undefined
 */
function isNil(value) {
    return value === null || value === undefined;
}
//# sourceMappingURL=is-nil.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662281, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var each_1 = tslib_1.__importDefault(require("./each"));
var is_function_1 = tslib_1.__importDefault(require("./is-function"));
var keys = Object.keys
    ? function (obj) { return Object.keys(obj); }
    : function (obj) {
        var result = [];
        (0, each_1.default)(obj, function (value, key) {
            if (!((0, is_function_1.default)(obj) && key === 'prototype')) {
                result.push(key);
            }
        });
        return result;
    };
exports.default = keys;
//# sourceMappingURL=keys.js.map
}, function(modId) { var map = {"./each":1729954662282,"./is-function":1729954662278}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662282, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var is_array_1 = tslib_1.__importDefault(require("./is-array"));
var is_object_1 = tslib_1.__importDefault(require("./is-object"));
function each(elements, func) {
    if (!elements) {
        return;
    }
    var rst;
    if ((0, is_array_1.default)(elements)) {
        for (var i = 0, len = elements.length; i < len; i++) {
            rst = func(elements[i], i);
            if (rst === false) {
                break;
            }
        }
    }
    else if ((0, is_object_1.default)(elements)) {
        for (var k in elements) {
            if (elements.hasOwnProperty(k)) {
                rst = func(elements[k], k);
                if (rst === false) {
                    break;
                }
            }
        }
    }
}
exports.default = each;
//# sourceMappingURL=each.js.map
}, function(modId) { var map = {"./is-array":1729954662283,"./is-object":1729954662284}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662283, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.default = isArray;
/**
 * 判断值是否为数组
 * @return 是否为数组
 */
function isArray(value) {
    return Array.isArray(value);
}
//# sourceMappingURL=is-array.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662284, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (function (value) {
    /**
     * isObject({}) => true
     * isObject([1, 2, 3]) => true
     * isObject(Function) => true
     * isObject(null) => false
     */
    var type = typeof value;
    return (value !== null && type === 'object') || type === 'function';
});
//# sourceMappingURL=is-object.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662285, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var is_object_like_1 = tslib_1.__importDefault(require("./is-object-like"));
var is_type_1 = tslib_1.__importDefault(require("./is-type"));
var isPlainObject = function (value) {
    /**
     * isObjectLike(new Foo) => false
     * isObjectLike([1, 2, 3]) => false
     * isObjectLike({ x: 0, y: 0 }) => true
     * isObjectLike(Object.create(null)) => true
     */
    if (!(0, is_object_like_1.default)(value) || !(0, is_type_1.default)(value, 'Object')) {
        return false;
    }
    if (Object.getPrototypeOf(value) === null) {
        return true;
    }
    var proto = value;
    while (Object.getPrototypeOf(proto) !== null) {
        proto = Object.getPrototypeOf(proto);
    }
    return Object.getPrototypeOf(value) === proto;
};
exports.default = isPlainObject;
//# sourceMappingURL=is-plain-object.js.map
}, function(modId) { var map = {"./is-object-like":1729954662286,"./is-type":1729954662287}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662286, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
var isObjectLike = function (value) {
    /**
     * isObjectLike({}) => true
     * isObjectLike([1, 2, 3]) => true
     * isObjectLike(Function) => false
     * isObjectLike(null) => false
     */
    return typeof value === 'object' && value !== null;
};
exports.default = isObjectLike;
//# sourceMappingURL=is-object-like.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662287, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
var toString = {}.toString;
var isType = function (value, type) { return toString.call(value) === '[object ' + type + ']'; };
exports.default = isType;
//# sourceMappingURL=is-type.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662288, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
function findIndex(arr, predicate, fromIndex) {
    if (fromIndex === void 0) { fromIndex = 0; }
    for (var i = fromIndex; i < arr.length; i++) {
        if (predicate(arr[i], i)) {
            // 找到终止循环
            return i;
        }
    }
    return -1;
}
exports.default = findIndex;
//# sourceMappingURL=find-index.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662289, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var is_nil_1 = tslib_1.__importDefault(require("./is-nil"));
var is_array_1 = tslib_1.__importDefault(require("./is-array"));
var firstValue = function (data, name) {
    var rst = null;
    for (var i = 0; i < data.length; i++) {
        var obj = data[i];
        var value = obj[name];
        if (!(0, is_nil_1.default)(value)) {
            if ((0, is_array_1.default)(value)) {
                rst = value[0]; // todo 这里是否应该使用递归，调用 firstValue @绝云
            }
            else {
                rst = value;
            }
            break;
        }
    }
    return rst;
};
exports.default = firstValue;
//# sourceMappingURL=first-value.js.map
}, function(modId) { var map = {"./is-nil":1729954662280,"./is-array":1729954662283}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662290, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var is_array_1 = tslib_1.__importDefault(require("./is-array"));
/**
 * Flattens `array` a single level deep.
 *
 * @param {Array} arr The array to flatten.
 * @return {Array} Returns the new flattened array.
 * @example
 *
 * flatten([1, [2, [3, [4]], 5]]);  // => [1, 2, [3, [4]], 5]
 */
var flatten = function (arr) {
    if (!(0, is_array_1.default)(arr)) {
        return [];
    }
    var rst = [];
    for (var i = 0; i < arr.length; i++) {
        rst = rst.concat(arr[i]);
    }
    return rst;
};
exports.default = flatten;
//# sourceMappingURL=flatten.js.map
}, function(modId) { var map = {"./is-array":1729954662283}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662291, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var is_array_1 = tslib_1.__importDefault(require("./is-array"));
/**
 * Flattens `array` a single level deep.
 *
 * @param {Array} arr The array to flatten.
 * @param {Array} result The array to return.
 * @return {Array} Returns the new flattened array.
 * @example
 *
 * flattenDeep([1, [2, [3, [4]], 5]]);  // => [1, 2, 3, 4, 5]
 */
var flattenDeep = function (arr, result) {
    if (result === void 0) { result = []; }
    if (!(0, is_array_1.default)(arr)) {
        result.push(arr);
    }
    else {
        for (var i = 0; i < arr.length; i += 1) {
            flattenDeep(arr[i], result);
        }
    }
    return result;
};
exports.default = flattenDeep;
//# sourceMappingURL=flatten-deep.js.map
}, function(modId) { var map = {"./is-array":1729954662283}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662292, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var is_array_1 = tslib_1.__importDefault(require("./is-array"));
var max_1 = tslib_1.__importDefault(require("./max"));
var min_1 = tslib_1.__importDefault(require("./min"));
var getRange = function (values) {
    // 存在 NaN 时，min,max 判定会出问题
    var filterValues = values.filter(function (v) { return !isNaN(v); });
    if (!filterValues.length) {
        // 如果没有数值则直接返回0
        return {
            min: 0,
            max: 0,
        };
    }
    if ((0, is_array_1.default)(values[0])) {
        var tmp = [];
        for (var i = 0; i < values.length; i++) {
            tmp = tmp.concat(values[i]);
        }
        filterValues = tmp;
    }
    var max = (0, max_1.default)(filterValues);
    var min = (0, min_1.default)(filterValues);
    return {
        min: min,
        max: max,
    };
};
exports.default = getRange;
//# sourceMappingURL=get-range.js.map
}, function(modId) { var map = {"./is-array":1729954662283,"./max":1729954662293,"./min":1729954662294}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662293, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.default = max;
/**
 * 计算数组的最大值
 * @param arr 数组
 * @return 最大值
 */
function max(arr) {
    if (!Array.isArray(arr))
        return -Infinity;
    var length = arr.length;
    if (!length)
        return -Infinity;
    var max = arr[0];
    for (var i = 1; i < length; i++) {
        max = Math.max(max, arr[i]);
    }
    return max;
}
//# sourceMappingURL=max.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662294, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var is_array_1 = tslib_1.__importDefault(require("./is-array"));
/**
 * @param {Array} arr The array to iterate over.
 * @return {*} Returns the minimum value.
 * @example
 *
 * min([1, 2]);
 * // => 1
 *
 * min([]);
 * // => undefined
 *
 * const data = new Array(1250010).fill(1).map((d,idx) => idx);
 *
 * min(data);
 * // => 1250010
 * // Math.min(...data) will encounter "Maximum call stack size exceeded" error
 */
exports.default = (function (arr) {
    if (!(0, is_array_1.default)(arr)) {
        return undefined;
    }
    return arr.reduce(function (prev, curr) {
        return Math.min(prev, curr);
    }, arr[0]);
});
//# sourceMappingURL=min.js.map
}, function(modId) { var map = {"./is-array":1729954662283}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662295, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
var arrPrototype = Array.prototype;
var splice = arrPrototype.splice;
var indexOf = arrPrototype.indexOf;
var pull = function (arr) {
    var values = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        values[_i - 1] = arguments[_i];
    }
    for (var i = 0; i < values.length; i++) {
        var value = values[i];
        var fromIndex = -1;
        while ((fromIndex = indexOf.call(arr, value)) > -1) {
            splice.call(arr, fromIndex, 1);
        }
    }
    return arr;
};
exports.default = pull;
//# sourceMappingURL=pull.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662296, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var is_array_like_1 = tslib_1.__importDefault(require("./is-array-like"));
var splice = Array.prototype.splice;
var pullAt = function pullAt(arr, indexes) {
    if (!(0, is_array_like_1.default)(arr)) {
        return [];
    }
    var length = arr ? indexes.length : 0;
    var last = length - 1;
    while (length--) {
        var previous = void 0;
        var index = indexes[length];
        if (length === last || index !== previous) {
            previous = index;
            splice.call(arr, index, 1);
        }
    }
    return arr;
};
exports.default = pullAt;
//# sourceMappingURL=pull-at.js.map
}, function(modId) { var map = {"./is-array-like":1729954662274}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662297, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var each_1 = tslib_1.__importDefault(require("./each"));
var is_array_1 = tslib_1.__importDefault(require("./is-array"));
var is_plain_object_1 = tslib_1.__importDefault(require("./is-plain-object"));
var reduce = function (arr, fn, init) {
    if (!(0, is_array_1.default)(arr) && !(0, is_plain_object_1.default)(arr)) {
        return arr;
    }
    var result = init;
    (0, each_1.default)(arr, function (data, i) {
        result = fn(result, data, i);
    });
    return result;
};
exports.default = reduce;
//# sourceMappingURL=reduce.js.map
}, function(modId) { var map = {"./each":1729954662282,"./is-array":1729954662283,"./is-plain-object":1729954662285}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662298, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var is_array_like_1 = tslib_1.__importDefault(require("./is-array-like"));
var pull_at_1 = tslib_1.__importDefault(require("./pull-at"));
var remove = function (arr, predicate) {
    /**
     * const arr = [1, 2, 3, 4]
     * const evens = remove(arr, n => n % 2 == 0)
     * console.log(arr) // => [1, 3]
     * console.log(evens) // => [2, 4]
     */
    var result = [];
    if (!(0, is_array_like_1.default)(arr)) {
        return result;
    }
    var i = -1;
    var indexes = [];
    var length = arr.length;
    while (++i < length) {
        var value = arr[i];
        if (predicate(value, i, arr)) {
            result.push(value);
            indexes.push(i);
        }
    }
    (0, pull_at_1.default)(arr, indexes);
    return result;
};
exports.default = remove;
//# sourceMappingURL=remove.js.map
}, function(modId) { var map = {"./is-array-like":1729954662274,"./pull-at":1729954662296}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662299, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var is_array_1 = tslib_1.__importDefault(require("./is-array"));
var is_string_1 = tslib_1.__importDefault(require("./is-string"));
var is_function_1 = tslib_1.__importDefault(require("./is-function"));
function sortBy(arr, key) {
    var comparer;
    if ((0, is_function_1.default)(key)) {
        comparer = function (a, b) { return key(a) - key(b); };
    }
    else {
        var keys_1 = [];
        if ((0, is_string_1.default)(key)) {
            keys_1.push(key);
        }
        else if ((0, is_array_1.default)(key)) {
            keys_1 = key;
        }
        comparer = function (a, b) {
            for (var i = 0; i < keys_1.length; i += 1) {
                var prop = keys_1[i];
                if (a[prop] > b[prop]) {
                    return 1;
                }
                if (a[prop] < b[prop]) {
                    return -1;
                }
            }
            return 0;
        };
    }
    arr.sort(comparer);
    return arr;
}
exports.default = sortBy;
//# sourceMappingURL=sort-by.js.map
}, function(modId) { var map = {"./is-array":1729954662283,"./is-string":1729954662300,"./is-function":1729954662278}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662300, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.default = isString;
/**
 * 判断值是否为字符串
 * @return 是否为字符串
 */
function isString(value) {
    return typeof value === 'string';
}
//# sourceMappingURL=is-string.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662301, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var uniq_1 = tslib_1.__importDefault(require("./uniq"));
var union = function () {
    var sources = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        sources[_i] = arguments[_i];
    }
    return (0, uniq_1.default)([].concat.apply([], sources));
};
exports.default = union;
//# sourceMappingURL=union.js.map
}, function(modId) { var map = {"./uniq":1729954662302}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662302, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.default = uniq;
function uniq(arr, cache) {
    if (cache === void 0) { cache = new Map(); }
    var r = [];
    if (Array.isArray(arr)) {
        for (var i = 0, len = arr.length; i < len; i++) {
            var item = arr[i];
            // 加一个 cache，提升性能
            if (!cache.has(item)) {
                r.push(item);
                cache.set(item, true);
            }
        }
    }
    return r;
}
//# sourceMappingURL=uniq.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662303, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var is_array_1 = tslib_1.__importDefault(require("./is-array"));
var is_nil_1 = tslib_1.__importDefault(require("./is-nil"));
exports.default = (function (data, name) {
    var rst = [];
    var tmpMap = {};
    for (var i = 0; i < data.length; i++) {
        var obj = data[i];
        var value = obj[name];
        if (!(0, is_nil_1.default)(value)) {
            // flatten
            if (!(0, is_array_1.default)(value)) {
                value = [value];
            }
            for (var j = 0; j < value.length; j++) {
                var val = value[j];
                // unique
                if (!tmpMap[val]) {
                    rst.push(val);
                    tmpMap[val] = true;
                }
            }
        }
    }
    return rst;
});
//# sourceMappingURL=values-of-key.js.map
}, function(modId) { var map = {"./is-array":1729954662283,"./is-nil":1729954662280}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662304, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.default = head;
var tslib_1 = require("tslib");
var is_array_like_1 = tslib_1.__importDefault(require("./is-array-like"));
function head(o) {
    if ((0, is_array_like_1.default)(o)) {
        return o[0];
    }
    return undefined;
}
//# sourceMappingURL=head.js.map
}, function(modId) { var map = {"./is-array-like":1729954662274}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662305, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.default = last;
var tslib_1 = require("tslib");
var is_array_like_1 = tslib_1.__importDefault(require("./is-array-like"));
function last(o) {
    if ((0, is_array_like_1.default)(o)) {
        var arr = o;
        return arr[arr.length - 1];
    }
    return undefined;
}
//# sourceMappingURL=last.js.map
}, function(modId) { var map = {"./is-array-like":1729954662274}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662306, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var is_array_1 = tslib_1.__importDefault(require("./is-array"));
var is_string_1 = tslib_1.__importDefault(require("./is-string"));
function startsWith(arr, e) {
    return (0, is_array_1.default)(arr) || (0, is_string_1.default)(arr) ? arr[0] === e : false;
}
exports.default = startsWith;
//# sourceMappingURL=starts-with.js.map
}, function(modId) { var map = {"./is-array":1729954662283,"./is-string":1729954662300}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662307, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var is_array_1 = tslib_1.__importDefault(require("./is-array"));
var is_string_1 = tslib_1.__importDefault(require("./is-string"));
function endsWith(arr, e) {
    return (0, is_array_1.default)(arr) || (0, is_string_1.default)(arr) ? arr[arr.length - 1] === e : false;
}
exports.default = endsWith;
//# sourceMappingURL=ends-with.js.map
}, function(modId) { var map = {"./is-array":1729954662283,"./is-string":1729954662300}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662308, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 只要有一个不满足条件就返回 false
 * @param arr
 * @param func
 */
var every = function (arr, func) {
    for (var i = 0; i < arr.length; i++) {
        if (!func(arr[i], i))
            return false;
    }
    return true;
};
exports.default = every;
//# sourceMappingURL=every.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662309, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 只要有一个满足条件就返回 true
 * @param arr
 * @param func
 */
var some = function (arr, func) {
    for (var i = 0; i < arr.length; i++) {
        if (func(arr[i], i))
            return true;
    }
    return false;
};
exports.default = some;
//# sourceMappingURL=some.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662310, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var group_to_map_1 = tslib_1.__importDefault(require("./group-to-map"));
exports.default = (function (data, condition) {
    if (!condition) {
        // 没有条件，则自身改成数组
        return [data];
    }
    var groups = (0, group_to_map_1.default)(data, condition);
    var array = [];
    for (var i in groups) {
        array.push(groups[i]);
    }
    return array;
});
//# sourceMappingURL=group.js.map
}, function(modId) { var map = {"./group-to-map":1729954662311}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662311, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.default = groupToMap;
var tslib_1 = require("tslib");
var is_array_1 = tslib_1.__importDefault(require("./is-array"));
var is_function_1 = tslib_1.__importDefault(require("./is-function"));
var group_by_1 = tslib_1.__importDefault(require("./group-by"));
/**
 * 将数据分组成 map
 * @param data
 * @param condition
 */
function groupToMap(data, condition) {
    if (!condition) {
        return {
            0: data,
        };
    }
    if (!(0, is_function_1.default)(condition)) {
        // 如果是字符串，则按照 a*b 风格成数组
        var paramscondition_1 = (0, is_array_1.default)(condition) ? condition : condition.replace(/\s+/g, '').split('*');
        condition = function (row) {
            var unique = '_'; // 避免出现数字作为Key的情况，会进行按照数字的排序
            // 根据字段列表的值，拼接成 key
            for (var i = 0, l = paramscondition_1.length; i < l; i++) {
                unique += row[paramscondition_1[i]] && row[paramscondition_1[i]].toString();
            }
            return unique;
        };
    }
    return (0, group_by_1.default)(data, condition);
}
//# sourceMappingURL=group-to-map.js.map
}, function(modId) { var map = {"./is-array":1729954662283,"./is-function":1729954662278,"./group-by":1729954662312}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662312, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var is_array_1 = tslib_1.__importDefault(require("./is-array"));
var is_function_1 = tslib_1.__importDefault(require("./is-function"));
var hasOwnProperty = Object.prototype.hasOwnProperty;
function groupBy(data, condition) {
    if (!condition || !(0, is_array_1.default)(data)) {
        return {};
    }
    var result = {};
    // 兼容方法和 字符串的写法
    var predicate = (0, is_function_1.default)(condition) ? condition : function (item) { return item[condition]; };
    var key;
    for (var i = 0; i < data.length; i++) {
        var item = data[i];
        key = predicate(item);
        if (hasOwnProperty.call(result, key)) {
            result[key].push(item);
        }
        else {
            result[key] = [item];
        }
    }
    return result;
}
exports.default = groupBy;
//# sourceMappingURL=group-by.js.map
}, function(modId) { var map = {"./is-array":1729954662283,"./is-function":1729954662278}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662313, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 获取封装的事件
 * @protected
 * @param  {Object} obj   对象
 * @param  {String} action 事件名称
 * @return {Function}        返回事件处理函数
 */
function getWrapBehavior(obj, action) {
    return obj['_wrap_' + action];
}
exports.default = getWrapBehavior;
//# sourceMappingURL=get-wrap-behavior.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662314, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 封装事件，便于使用上下文this,和便于解除事件时使用
 * @protected
 * @param  {Object} obj   对象
 * @param  {String} action 事件名称
 * @return {Function}        返回事件处理函数
 */
function wrapBehavior(obj, action) {
    if (obj['_wrap_' + action]) {
        return obj['_wrap_' + action];
    }
    var method = function (e) {
        obj[action](e);
    };
    obj['_wrap_' + action] = method;
    return method;
}
exports.default = wrapBehavior;
//# sourceMappingURL=wrap-behavior.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662315, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
var numColorCache = {};
function numberToColor(num) {
    // 增加缓存
    var color = numColorCache[num];
    if (!color) {
        var str = num.toString(16);
        for (var i = str.length; i < 6; i++) {
            str = '0' + str;
        }
        color = '#' + str;
        numColorCache[num] = color;
    }
    return color;
}
exports.default = numberToColor;
//# sourceMappingURL=number2color.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662316, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var is_array_1 = tslib_1.__importDefault(require("./is-array"));
function parseRadius(radius) {
    var r1 = 0, r2 = 0, r3 = 0, r4 = 0;
    if ((0, is_array_1.default)(radius)) {
        if (radius.length === 1) {
            r1 = r2 = r3 = r4 = radius[0];
        }
        else if (radius.length === 2) {
            r1 = r3 = radius[0];
            r2 = r4 = radius[1];
        }
        else if (radius.length === 3) {
            r1 = radius[0];
            r2 = r4 = radius[1];
            r3 = radius[2];
        }
        else {
            r1 = radius[0];
            r2 = radius[1];
            r3 = radius[2];
            r4 = radius[3];
        }
    }
    else {
        r1 = r2 = r3 = r4 = radius;
    }
    return {
        r1: r1,
        r2: r2,
        r3: r3,
        r4: r4,
    };
}
exports.default = parseRadius;
//# sourceMappingURL=parse-radius.js.map
}, function(modId) { var map = {"./is-array":1729954662283}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662317, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
var clamp = function (a, min, max) {
    if (a < min) {
        return min;
    }
    else if (a > max) {
        return max;
    }
    return a;
};
exports.default = clamp;
//# sourceMappingURL=clamp.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662318, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
var fixedBase = function (v, base) {
    var str = base.toString();
    var index = str.indexOf('.');
    if (index === -1) {
        return Math.round(v);
    }
    var length = str.substr(index + 1).length;
    if (length > 20) {
        length = 20;
    }
    return parseFloat(v.toFixed(length));
};
exports.default = fixedBase;
//# sourceMappingURL=fixed-base.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662319, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.default = isDecimal;
var tslib_1 = require("tslib");
var is_number_1 = tslib_1.__importDefault(require("./is-number"));
/**
 * 判断值是否为小数
 * @return 是否为小数
 */
function isDecimal(num) {
    return (0, is_number_1.default)(num) && num % 1 !== 0;
}
//# sourceMappingURL=is-decimal.js.map
}, function(modId) { var map = {"./is-number":1729954662320}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662320, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.default = isNumber;
/**
 * 判断值是否为数字
 * @return 是否为数字
 */
function isNumber(value) {
    return typeof value === 'number';
}
//# sourceMappingURL=is-number.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662321, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.default = isEven;
var tslib_1 = require("tslib");
var is_number_1 = tslib_1.__importDefault(require("./is-number"));
/**
 * 判断值是否为偶数
 * @return 是否为偶数
 */
function isEven(num) {
    return (0, is_number_1.default)(num) && num % 2 === 0;
}
//# sourceMappingURL=is-even.js.map
}, function(modId) { var map = {"./is-number":1729954662320}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662322, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.default = isInteger;
var tslib_1 = require("tslib");
var is_number_1 = tslib_1.__importDefault(require("./is-number"));
/**
 * 判断值是否为整数
 * @return 是否为整数
 */
function isInteger(value) {
    return (0, is_number_1.default)(value) && value % 1 === 0;
}
//# sourceMappingURL=is-integer.js.map
}, function(modId) { var map = {"./is-number":1729954662320}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662323, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.default = isNegative;
var tslib_1 = require("tslib");
var is_number_1 = tslib_1.__importDefault(require("./is-number"));
/**
 * 判断值是否为负数
 * @return 是否为负数
 */
function isNegative(num) {
    return (0, is_number_1.default)(num) && num < 0;
}
//# sourceMappingURL=is-negative.js.map
}, function(modId) { var map = {"./is-number":1729954662320}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662324, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.default = isNumberEqual;
var PRECISION = 0.00001; // numbers less than this is considered as 0
/**
 * 判断两个数是否相等
 * @return 是否相等
 */
function isNumberEqual(a, b, precision) {
    if (precision === void 0) { precision = PRECISION; }
    return a === b || Math.abs(a - b) < precision;
}
//# sourceMappingURL=is-number-equal.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662325, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.default = isOdd;
var tslib_1 = require("tslib");
var is_number_1 = tslib_1.__importDefault(require("./is-number"));
/**
 * 判断值是否为奇数
 * @return 是否为奇数
 */
function isOdd(num) {
    return (0, is_number_1.default)(num) && num % 2 !== 0;
}
//# sourceMappingURL=is-odd.js.map
}, function(modId) { var map = {"./is-number":1729954662320}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662326, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var is_number_1 = tslib_1.__importDefault(require("./is-number"));
var isPositive = function (num) {
    return (0, is_number_1.default)(num) && num > 0;
};
exports.default = isPositive;
//# sourceMappingURL=is-positive.js.map
}, function(modId) { var map = {"./is-number":1729954662320}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662327, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var is_array_1 = tslib_1.__importDefault(require("./is-array"));
var is_function_1 = tslib_1.__importDefault(require("./is-function"));
/**
 * @param {Array} arr The array to iterate over.
 * @param {Function} [fn] The iteratee invoked per element.
 * @return {*} Returns the maximum value.
 * @example
 *
 * var objects = [{ 'n': 1 }, { 'n': 2 }];
 *
 * maxBy(objects, function(o) { return o.n; });
 * // => { 'n': 2 }
 *
 * maxBy(objects, 'n');
 * // => { 'n': 2 }
 */
exports.default = (function (arr, fn) {
    if (!(0, is_array_1.default)(arr)) {
        return undefined;
    }
    var maxItem;
    var max = -Infinity;
    for (var i = 0; i < arr.length; i++) {
        var item = arr[i];
        var v = (0, is_function_1.default)(fn) ? fn(item) : item[fn];
        if (v > max) {
            maxItem = item;
            max = v;
        }
    }
    return maxItem;
});
//# sourceMappingURL=max-by.js.map
}, function(modId) { var map = {"./is-array":1729954662283,"./is-function":1729954662278}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662328, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var is_array_1 = tslib_1.__importDefault(require("./is-array"));
var is_function_1 = tslib_1.__importDefault(require("./is-function"));
/**
 * @param {Array} arr The array to iterate over.
 * @param {Function} [fn] The iteratee invoked per element.
 * @return {*} Returns the minimum value.
 * @example
 *
 * var objects = [{ 'n': 1 }, { 'n': 2 }];
 *
 * minBy(objects, function(o) { return o.n; });
 * // => { 'n': 1 }
 *
 * minBy(objects, 'n');
 * // => { 'n': 1 }
 */
exports.default = (function (arr, fn) {
    if (!(0, is_array_1.default)(arr)) {
        return undefined;
    }
    var minItem;
    var min = Infinity;
    for (var i = 0; i < arr.length; i++) {
        var item = arr[i];
        var v = (0, is_function_1.default)(fn) ? fn(item) : item[fn];
        if (v < min) {
            minItem = item;
            min = v;
        }
    }
    return minItem;
});
//# sourceMappingURL=min-by.js.map
}, function(modId) { var map = {"./is-array":1729954662283,"./is-function":1729954662278}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662329, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
var mod = function (n, m) {
    return ((n % m) + m) % m;
};
exports.default = mod;
//# sourceMappingURL=mod.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662330, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
var DEGREE = 180 / Math.PI;
var toDegree = function (radian) {
    return DEGREE * radian;
};
exports.default = toDegree;
//# sourceMappingURL=to-degree.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662331, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.default = parseInt;
//# sourceMappingURL=to-integer.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662332, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
var RADIAN = Math.PI / 180;
var toRadian = function (degree) {
    return RADIAN * degree;
};
exports.default = toRadian;
//# sourceMappingURL=to-radian.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662333, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var each_1 = tslib_1.__importDefault(require("./each"));
exports.default = each_1.default;
//# sourceMappingURL=for-in.js.map
}, function(modId) { var map = {"./each":1729954662282}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662334, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (function (obj, key) { return obj.hasOwnProperty(key); });
//# sourceMappingURL=has.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662335, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var has_1 = tslib_1.__importDefault(require("./has"));
exports.default = has_1.default;
//# sourceMappingURL=has-key.js.map
}, function(modId) { var map = {"./has":1729954662334}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662336, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var contains_1 = tslib_1.__importDefault(require("./contains"));
var values_1 = tslib_1.__importDefault(require("./values"));
exports.default = (function (obj, value) { return (0, contains_1.default)((0, values_1.default)(obj), value); });
//# sourceMappingURL=has-value.js.map
}, function(modId) { var map = {"./contains":1729954662273,"./values":1729954662337}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662337, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var each_1 = tslib_1.__importDefault(require("./each"));
var is_function_1 = tslib_1.__importDefault(require("./is-function"));
// @ts-ignore
var values = Object.values
    ? function (obj) { return Object.values(obj); }
    : function (obj) {
        var result = [];
        (0, each_1.default)(obj, function (value, key) {
            if (!((0, is_function_1.default)(obj) && key === 'prototype')) {
                result.push(value);
            }
        });
        return result;
    };
exports.default = values;
//# sourceMappingURL=values.js.map
}, function(modId) { var map = {"./each":1729954662282,"./is-function":1729954662278}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662338, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var to_string_1 = tslib_1.__importDefault(require("./to-string"));
var lowerCase = function (str) {
    return (0, to_string_1.default)(str).toLowerCase();
};
exports.default = lowerCase;
//# sourceMappingURL=lower-case.js.map
}, function(modId) { var map = {"./to-string":1729954662339}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662339, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var is_nil_1 = tslib_1.__importDefault(require("./is-nil"));
exports.default = (function (value) {
    if ((0, is_nil_1.default)(value))
        return '';
    return value.toString();
});
//# sourceMappingURL=to-string.js.map
}, function(modId) { var map = {"./is-nil":1729954662280}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662340, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var to_string_1 = tslib_1.__importDefault(require("./to-string"));
var lowerFirst = function (value) {
    var str = (0, to_string_1.default)(value);
    return str.charAt(0).toLowerCase() + str.substring(1);
};
exports.default = lowerFirst;
//# sourceMappingURL=lower-first.js.map
}, function(modId) { var map = {"./to-string":1729954662339}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662341, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
function substitute(str, o) {
    if (!str || !o) {
        return str;
    }
    return str.replace(/\\?\{([^{}]+)\}/g, function (match, name) {
        if (match.charAt(0) === '\\') {
            return match.slice(1);
        }
        return o[name] === undefined ? '' : o[name];
    });
}
exports.default = substitute;
//# sourceMappingURL=substitute.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662342, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var to_string_1 = tslib_1.__importDefault(require("./to-string"));
var upperCase = function (str) {
    return (0, to_string_1.default)(str).toUpperCase();
};
exports.default = upperCase;
//# sourceMappingURL=upper-case.js.map
}, function(modId) { var map = {"./to-string":1729954662339}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662343, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var to_string_1 = tslib_1.__importDefault(require("./to-string"));
var upperFirst = function (value) {
    var str = (0, to_string_1.default)(value);
    return str.charAt(0).toUpperCase() + str.substring(1);
};
exports.default = upperFirst;
//# sourceMappingURL=upper-first.js.map
}, function(modId) { var map = {"./to-string":1729954662339}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662344, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
var toString = {}.toString;
var getType = function (value) {
    return toString
        .call(value)
        .replace(/^\[object /, '')
        .replace(/]$/, '');
};
exports.default = getType;
//# sourceMappingURL=get-type.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662345, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
/**
 * 是否是参数类型
 *
 * @param {Object} value 测试的值
 * @return {Boolean}
 */
var is_type_1 = tslib_1.__importDefault(require("./is-type"));
var isArguments = function (value) {
    return (0, is_type_1.default)(value, 'Arguments');
};
exports.default = isArguments;
//# sourceMappingURL=is-arguments.js.map
}, function(modId) { var map = {"./is-type":1729954662287}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662346, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
/**
 * 是否是布尔类型
 *
 * @param {Object} value 测试的值
 * @return {Boolean}
 */
var is_type_1 = tslib_1.__importDefault(require("./is-type"));
var isBoolean = function (value) {
    return (0, is_type_1.default)(value, 'Boolean');
};
exports.default = isBoolean;
//# sourceMappingURL=is-boolean.js.map
}, function(modId) { var map = {"./is-type":1729954662287}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662347, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.default = isDate;
/**
 * 判断值是否为 Date
 * @return 是否为 Date
 */
function isDate(value) {
    return value instanceof Date;
}
//# sourceMappingURL=is-date.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662348, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
/**
 * 是否是参数类型
 *
 * @param {Object} value 测试的值
 * @return {Boolean}
 */
var is_type_1 = tslib_1.__importDefault(require("./is-type"));
var isError = function (value) {
    return (0, is_type_1.default)(value, 'Error');
};
exports.default = isError;
//# sourceMappingURL=is-error.js.map
}, function(modId) { var map = {"./is-type":1729954662287}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662349, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
var tslib_1 = require("tslib");
var is_number_1 = tslib_1.__importDefault(require("./is-number"));
/**
 * 判断值是否为有限数
 * @return 是否为有限数
 */
function default_1(value) {
    return (0, is_number_1.default)(value) && isFinite(value);
}
//# sourceMappingURL=is-finite.js.map
}, function(modId) { var map = {"./is-number":1729954662320}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662350, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.default = isNull;
/**
 * 判断值是否为 null
 * @return 是否为 null
 */
function isNull(value) {
    return value === null;
}
//# sourceMappingURL=is-null.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662351, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
var objectProto = Object.prototype;
var isPrototype = function (value) {
    var Ctor = value && value.constructor;
    var proto = (typeof Ctor === 'function' && Ctor.prototype) || objectProto;
    return value === proto;
};
exports.default = isPrototype;
//# sourceMappingURL=is-prototype.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662352, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var is_type_1 = tslib_1.__importDefault(require("./is-type"));
var isRegExp = function (str) {
    return (0, is_type_1.default)(str, 'RegExp');
};
exports.default = isRegExp;
//# sourceMappingURL=is-reg-exp.js.map
}, function(modId) { var map = {"./is-type":1729954662287}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662353, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
var isUndefined = function (value) {
    return value === undefined;
};
exports.default = isUndefined;
//# sourceMappingURL=is-undefined.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662354, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.default = isElement;
/**
 * 判断值是否为 HTML Element 或 Document
 * @return 是否为 HTML Element 或 Document
 */
function isElement(value) {
    return value instanceof Element || value instanceof Document;
}
//# sourceMappingURL=is-element.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662355, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.default = requestAnimationFrame;
function requestAnimationFrame(fn) {
    var method = window.requestAnimationFrame ||
        // @ts-ignore
        window.webkitRequestAnimationFrame ||
        // @ts-ignore
        window.mozRequestAnimationFrame ||
        // @ts-ignore
        window.msRequestAnimationFrame ||
        function (f) {
            return setTimeout(f, 16);
        };
    return method(fn);
}
//# sourceMappingURL=request-animation-frame.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662356, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.default = cancelAnimationFrame;
function cancelAnimationFrame(handler) {
    var method = window.cancelAnimationFrame ||
        // @ts-ignore
        window.webkitCancelAnimationFrame ||
        // @ts-ignore
        window.mozCancelAnimationFrame ||
        // @ts-ignore
        window.msCancelAnimationFrame ||
        clearTimeout;
    method(handler);
}
//# sourceMappingURL=clear-animation-frame.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662357, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var mix_1 = tslib_1.__importDefault(require("./mix"));
var is_function_1 = tslib_1.__importDefault(require("./is-function"));
var augment = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var c = args[0];
    for (var i = 1; i < args.length; i++) {
        var obj = args[i];
        if ((0, is_function_1.default)(obj)) {
            obj = obj.prototype;
        }
        (0, mix_1.default)(c.prototype, obj);
    }
};
exports.default = augment;
//# sourceMappingURL=augment.js.map
}, function(modId) { var map = {"./mix":1729954662358,"./is-function":1729954662278}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662358, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.default = mix;
// FIXME: Mutable param should be forbidden in static lang.
function _mix(dist, obj) {
    for (var key in obj) {
        if (obj.hasOwnProperty(key) && key !== 'constructor' && obj[key] !== undefined) {
            dist[key] = obj[key];
        }
    }
}
function mix(dist, src1, src2, src3) {
    if (src1)
        _mix(dist, src1);
    if (src2)
        _mix(dist, src2);
    if (src3)
        _mix(dist, src3);
    return dist;
}
//# sourceMappingURL=mix.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662359, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var is_array_1 = tslib_1.__importDefault(require("./is-array"));
var clone = function (obj) {
    if (typeof obj !== 'object' || obj === null) {
        return obj;
    }
    var rst;
    if ((0, is_array_1.default)(obj)) {
        rst = [];
        for (var i = 0, l = obj.length; i < l; i++) {
            if (typeof obj[i] === 'object' && obj[i] != null) {
                rst[i] = clone(obj[i]);
            }
            else {
                rst[i] = obj[i];
            }
        }
    }
    else {
        rst = {};
        for (var k in obj) {
            if (typeof obj[k] === 'object' && obj[k] != null) {
                rst[k] = clone(obj[k]);
            }
            else {
                rst[k] = obj[k];
            }
        }
    }
    return rst;
};
exports.default = clone;
//# sourceMappingURL=clone.js.map
}, function(modId) { var map = {"./is-array":1729954662283}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662360, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
function debounce(func, wait, immediate) {
    var timeout;
    return function () {
        var context = this, args = arguments;
        var later = function () {
            timeout = null;
            if (!immediate) {
                func.apply(context, args);
            }
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) {
            func.apply(context, args);
        }
    };
}
exports.default = debounce;
//# sourceMappingURL=debounce.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662361, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.default = memoize;
function flru(max) {
    var num, curr, prev;
    var limit = max || 1;
    function keep(key, value) {
        if (++num > limit) {
            prev = curr;
            reset(1);
            ++num;
        }
        curr[key] = value;
    }
    function reset(isPartial) {
        num = 0;
        curr = Object.create(null);
        isPartial || (prev = Object.create(null));
    }
    reset();
    return {
        clear: reset,
        has: function (key) {
            return curr[key] !== void 0 || prev[key] !== void 0;
        },
        get: function (key) {
            var val = curr[key];
            if (val !== void 0)
                return val;
            if ((val = prev[key]) !== void 0) {
                keep(key, val);
                return val;
            }
        },
        set: function (key, value) {
            if (curr[key] !== void 0) {
                curr[key] = value;
            }
            else {
                keep(key, value);
            }
        },
    };
}
var CacheMap = new Map();
/**
 * 缓存函数的计算结果，避免重复计算
 * @example
 * _.memoize(calColor);
 * _.memoize(calColor, (...args) => args[0]);
 * @param fn 缓存的函数
 * @param resolver 生成缓存 key 的函数
 * @param maxSize lru 缓存的大小
 */
function memoize(fn, resolver, maxSize) {
    if (maxSize === void 0) { maxSize = 128; }
    var memoized = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        // 使用方法构造 key，如果不存在 resolver，则直接取第一个参数作为 key
        var key = resolver ? resolver.apply(this, args) : args[0];
        if (!CacheMap.has(fn))
            CacheMap.set(fn, flru(maxSize));
        var cache = CacheMap.get(fn);
        if (cache.has(key))
            return cache.get(key);
        var result = fn.apply(this, args);
        cache.set(key, result);
        return result;
    };
    return memoized;
}
//# sourceMappingURL=memoize.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662362, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var is_array_1 = tslib_1.__importDefault(require("./is-array"));
var is_plain_object_1 = tslib_1.__importDefault(require("./is-plain-object"));
var MAX_MIX_LEVEL = 5;
function hasOwn(object, property) {
    if (Object.hasOwn) {
        return Object.hasOwn(object, property);
    }
    if (object == null) {
        throw new TypeError('Cannot convert undefined or null to object');
    }
    return Object.prototype.hasOwnProperty.call(Object(object), property);
}
function _deepMix(dist, src, level, maxLevel) {
    level = level || 0;
    maxLevel = maxLevel || MAX_MIX_LEVEL;
    for (var key in src) {
        if (hasOwn(src, key)) {
            var value = src[key];
            if (value !== null && (0, is_plain_object_1.default)(value)) {
                if (!(0, is_plain_object_1.default)(dist[key])) {
                    dist[key] = {};
                }
                if (level < maxLevel) {
                    _deepMix(dist[key], value, level + 1, maxLevel);
                }
                else {
                    dist[key] = src[key];
                }
            }
            else if ((0, is_array_1.default)(value)) {
                dist[key] = [];
                dist[key] = dist[key].concat(value);
            }
            else if (value !== undefined) {
                dist[key] = value;
            }
        }
    }
}
// todo 重写
var deepMix = function (rst) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    for (var i = 0; i < args.length; i += 1) {
        _deepMix(rst, args[i]);
    }
    return rst;
};
exports.default = deepMix;
//# sourceMappingURL=deep-mix.js.map
}, function(modId) { var map = {"./is-array":1729954662283,"./is-plain-object":1729954662285}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662363, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var mix_1 = tslib_1.__importDefault(require("./mix"));
var is_function_1 = tslib_1.__importDefault(require("./is-function"));
var extend = function (subclass, superclass, overrides, staticOverrides) {
    // 如果只提供父类构造函数，则自动生成子类构造函数
    if (!(0, is_function_1.default)(superclass)) {
        overrides = superclass;
        superclass = subclass;
        subclass = function () { };
    }
    var create = Object.create
        ? function (proto, c) {
            return Object.create(proto, {
                constructor: {
                    value: c,
                },
            });
        }
        : function (proto, c) {
            function Tmp() { }
            Tmp.prototype = proto;
            var o = new Tmp();
            o.constructor = c;
            return o;
        };
    var superObj = create(superclass.prototype, subclass); // new superclass(),//实例化父类作为子类的prototype
    subclass.prototype = (0, mix_1.default)(superObj, subclass.prototype); // 指定子类的prototype
    subclass.superclass = create(superclass.prototype, superclass);
    (0, mix_1.default)(superObj, overrides);
    (0, mix_1.default)(subclass, staticOverrides);
    return subclass;
};
exports.default = extend;
//# sourceMappingURL=extend.js.map
}, function(modId) { var map = {"./mix":1729954662358,"./is-function":1729954662278}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662364, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var is_array_like_1 = tslib_1.__importDefault(require("./is-array-like"));
var indexOf = function (arr, obj) {
    if (!(0, is_array_like_1.default)(arr)) {
        return -1;
    }
    var m = Array.prototype.indexOf;
    if (m) {
        return m.call(arr, obj);
    }
    var index = -1;
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] === obj) {
            index = i;
            break;
        }
    }
    return index;
};
exports.default = indexOf;
//# sourceMappingURL=index-of.js.map
}, function(modId) { var map = {"./is-array-like":1729954662274}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662365, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var is_nil_1 = tslib_1.__importDefault(require("./is-nil"));
var is_array_like_1 = tslib_1.__importDefault(require("./is-array-like"));
var get_type_1 = tslib_1.__importDefault(require("./get-type"));
var is_prototype_1 = tslib_1.__importDefault(require("./is-prototype"));
var hasOwnProperty = Object.prototype.hasOwnProperty;
function isEmpty(value) {
    /**
     * isEmpty(null) => true
     * isEmpty() => true
     * isEmpty(true) => true
     * isEmpty(1) => true
     * isEmpty([1, 2, 3]) => false
     * isEmpty('abc') => false
     * isEmpty({ a: 1 }) => false
     */
    if ((0, is_nil_1.default)(value)) {
        return true;
    }
    if ((0, is_array_like_1.default)(value)) {
        return !value.length;
    }
    var type = (0, get_type_1.default)(value);
    if (type === 'Map' || type === 'Set') {
        return !value.size;
    }
    if ((0, is_prototype_1.default)(value)) {
        return !Object.keys(value).length;
    }
    for (var key in value) {
        if (hasOwnProperty.call(value, key)) {
            return false;
        }
    }
    return true;
}
exports.default = isEmpty;
//# sourceMappingURL=is-empty.js.map
}, function(modId) { var map = {"./is-nil":1729954662280,"./is-array-like":1729954662274,"./get-type":1729954662344,"./is-prototype":1729954662351}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662366, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var is_object_like_1 = tslib_1.__importDefault(require("./is-object-like"));
var is_array_like_1 = tslib_1.__importDefault(require("./is-array-like"));
var is_string_1 = tslib_1.__importDefault(require("./is-string"));
var isEqual = function (value, other) {
    if (value === other) {
        return true;
    }
    if (!value || !other) {
        return false;
    }
    if ((0, is_string_1.default)(value) || (0, is_string_1.default)(other)) {
        return false;
    }
    if ((0, is_array_like_1.default)(value) || (0, is_array_like_1.default)(other)) {
        if (value.length !== other.length) {
            return false;
        }
        var rst = true;
        for (var i = 0; i < value.length; i++) {
            rst = isEqual(value[i], other[i]);
            if (!rst) {
                break;
            }
        }
        return rst;
    }
    if ((0, is_object_like_1.default)(value) || (0, is_object_like_1.default)(other)) {
        var valueKeys = Object.keys(value);
        var otherKeys = Object.keys(other);
        if (valueKeys.length !== otherKeys.length) {
            return false;
        }
        var rst = true;
        for (var i = 0; i < valueKeys.length; i++) {
            rst = isEqual(value[valueKeys[i]], other[valueKeys[i]]);
            if (!rst) {
                break;
            }
        }
        return rst;
    }
    return false;
};
exports.default = isEqual;
//# sourceMappingURL=is-equal.js.map
}, function(modId) { var map = {"./is-object-like":1729954662286,"./is-array-like":1729954662274,"./is-string":1729954662300}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662367, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var is_function_1 = tslib_1.__importDefault(require("./is-function"));
var is_equal_1 = tslib_1.__importDefault(require("./is-equal"));
/**
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @param {Function} [fn] The function to customize comparisons.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * function isGreeting(value) {
 *   return /^h(?:i|ello)$/.test(value);
 * }
 *
 * function customizer(objValue, othValue) {
 *   if (isGreeting(objValue) && isGreeting(othValue)) {
 *     return true;
 *   }
 * }
 *
 * var array = ['hello', 'goodbye'];
 * var other = ['hi', 'goodbye'];
 *
 * isEqualWith(array, other, customizer);  // => true
 */
exports.default = (function (value, other, fn) {
    if (!(0, is_function_1.default)(fn)) {
        return (0, is_equal_1.default)(value, other);
    }
    return !!fn(value, other);
});
//# sourceMappingURL=is-equal-with.js.map
}, function(modId) { var map = {"./is-function":1729954662278,"./is-equal":1729954662366}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662368, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var is_array_like_1 = tslib_1.__importDefault(require("./is-array-like"));
var map = function (arr, func) {
    if (!(0, is_array_like_1.default)(arr)) {
        // @ts-ignore
        return arr;
    }
    var result = [];
    for (var index = 0; index < arr.length; index++) {
        var value = arr[index];
        result.push(func(value, index));
    }
    return result;
};
exports.default = map;
//# sourceMappingURL=map.js.map
}, function(modId) { var map = {"./is-array-like":1729954662274}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662369, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var is_nil_1 = tslib_1.__importDefault(require("./is-nil"));
var is_object_1 = tslib_1.__importDefault(require("./is-object"));
var identity = function (v) { return v; };
exports.default = (function (object, func) {
    if (func === void 0) { func = identity; }
    var r = {};
    if ((0, is_object_1.default)(object) && !(0, is_nil_1.default)(object)) {
        Object.keys(object).forEach(function (key) {
            // @ts-ignore
            r[key] = func(object[key], key);
        });
    }
    return r;
});
//# sourceMappingURL=map-values.js.map
}, function(modId) { var map = {"./is-nil":1729954662280,"./is-object":1729954662284}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662370, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var is_string_1 = tslib_1.__importDefault(require("./is-string"));
/**
 * https://github.com/developit/dlv/blob/master/index.js
 * @param obj
 * @param key
 * @param defaultValue
 */
exports.default = (function (obj, key, defaultValue) {
    var p = 0;
    var keyArr = (0, is_string_1.default)(key) ? key.split('.') : key;
    while (obj && p < keyArr.length) {
        obj = obj[keyArr[p++]];
    }
    return obj === undefined || p < keyArr.length ? defaultValue : obj;
});
//# sourceMappingURL=get.js.map
}, function(modId) { var map = {"./is-string":1729954662300}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662371, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var is_object_1 = tslib_1.__importDefault(require("./is-object"));
var is_string_1 = tslib_1.__importDefault(require("./is-string"));
var is_number_1 = tslib_1.__importDefault(require("./is-number"));
/**
 * https://github.com/developit/dlv/blob/master/index.js
 * @param obj
 * @param path
 * @param value
 */
exports.default = (function (obj, path, value) {
    var o = obj;
    var keyArr = (0, is_string_1.default)(path) ? path.split('.') : path;
    keyArr.forEach(function (key, idx) {
        // 不是最后一个
        if (idx < keyArr.length - 1) {
            if (!(0, is_object_1.default)(o[key])) {
                o[key] = (0, is_number_1.default)(keyArr[idx + 1]) ? [] : {};
            }
            o = o[key];
        }
        else {
            o[key] = value;
        }
    });
    return obj;
});
//# sourceMappingURL=set.js.map
}, function(modId) { var map = {"./is-object":1729954662284,"./is-string":1729954662300,"./is-number":1729954662320}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662372, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var each_1 = tslib_1.__importDefault(require("./each"));
var is_plain_object_1 = tslib_1.__importDefault(require("./is-plain-object"));
var hasOwnProperty = Object.prototype.hasOwnProperty;
exports.default = (function (object, keys) {
    if (object === null || !(0, is_plain_object_1.default)(object)) {
        return {};
    }
    var result = {};
    (0, each_1.default)(keys, function (key) {
        if (hasOwnProperty.call(object, key)) {
            result[key] = object[key];
        }
    });
    return result;
});
//# sourceMappingURL=pick.js.map
}, function(modId) { var map = {"./each":1729954662282,"./is-plain-object":1729954662285}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662373, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var reduce_1 = tslib_1.__importDefault(require("./reduce"));
exports.default = (function (obj, keys) {
    return (0, reduce_1.default)(obj, function (r, curr, key) {
        if (!keys.includes(key)) {
            r[key] = curr;
        }
        return r;
    }, {});
});
//# sourceMappingURL=omit.js.map
}, function(modId) { var map = {"./reduce":1729954662297}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662374, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (function (func, wait, options) {
    var timeout, context, args, result;
    var previous = 0;
    if (!options)
        options = {};
    var later = function () {
        previous = options.leading === false ? 0 : Date.now();
        timeout = null;
        result = func.apply(context, args);
        if (!timeout)
            context = args = null;
    };
    var throttled = function () {
        var now = Date.now();
        if (!previous && options.leading === false)
            previous = now;
        var remaining = wait - (now - previous);
        context = this;
        args = arguments;
        if (remaining <= 0 || remaining > wait) {
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }
            previous = now;
            result = func.apply(context, args);
            if (!timeout)
                context = args = null;
        }
        else if (!timeout && options.trailing !== false) {
            timeout = setTimeout(later, remaining);
        }
        return result;
    };
    throttled.cancel = function () {
        clearTimeout(timeout);
        previous = 0;
        timeout = context = args = null;
    };
    return throttled;
});
//# sourceMappingURL=throttle.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662375, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var is_array_like_1 = tslib_1.__importDefault(require("./is-array-like"));
exports.default = (function (value) {
    return (0, is_array_like_1.default)(value) ? Array.prototype.slice.call(value) : [];
});
//# sourceMappingURL=to-array.js.map
}, function(modId) { var map = {"./is-array-like":1729954662274}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662376, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
var map = {};
exports.default = (function (prefix) {
    prefix = prefix || 'g';
    if (!map[prefix]) {
        map[prefix] = 1;
    }
    else {
        map[prefix] += 1;
    }
    return prefix + map[prefix];
});
//# sourceMappingURL=unique-id.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662377, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (function () { });
//# sourceMappingURL=noop.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662378, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (function (v) { return v; });
//# sourceMappingURL=identity.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662379, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.default = size;
var tslib_1 = require("tslib");
var is_nil_1 = tslib_1.__importDefault(require("./is-nil"));
var is_array_like_1 = tslib_1.__importDefault(require("./is-array-like"));
function size(o) {
    if ((0, is_nil_1.default)(o)) {
        return 0;
    }
    if ((0, is_array_like_1.default)(o)) {
        return o.length;
    }
    return Object.keys(o).length;
}
//# sourceMappingURL=size.js.map
}, function(modId) { var map = {"./is-nil":1729954662280,"./is-array-like":1729954662274}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662380, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * k-v 存储
 */
var default_1 = /** @class */ (function () {
    function default_1() {
        this.map = {};
    }
    default_1.prototype.has = function (key) {
        return this.map[key] !== undefined;
    };
    default_1.prototype.get = function (key, def) {
        var v = this.map[key];
        return v === undefined ? def : v;
    };
    default_1.prototype.set = function (key, value) {
        this.map[key] = value;
    };
    default_1.prototype.clear = function () {
        this.map = {};
    };
    default_1.prototype.delete = function (key) {
        delete this.map[key];
    };
    default_1.prototype.size = function () {
        return Object.keys(this.map).length;
    };
    return default_1;
}());
exports.default = default_1;
//# sourceMappingURL=cache.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662381, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.toCSSGradient = toCSSGradient;
var regexLG = /^l\s*\(\s*([\d.]+)\s*\)\s*(.*)/i;
var regexRG = /^r\s*\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*\)\s*(.*)/i;
var regexColorStop = /[\d.]+:(#[^\s]+|[^)]+\))/gi;
function isGradientColor(val) {
    return /^[r,R,L,l]{1}[\s]*\(/.test(val);
}
function toCSSGradient(gradientColor) {
    if (isGradientColor(gradientColor)) {
        var cssColor_1;
        var steps = void 0;
        if (gradientColor[0] === 'l') {
            // 线性渐变
            var arr = regexLG.exec(gradientColor);
            var angle = +arr[1] + 90; // css 和 g 的渐变起始角度不同
            steps = arr[2];
            cssColor_1 = "linear-gradient(".concat(angle, "deg, ");
        }
        else if (gradientColor[0] === 'r') {
            // 径向渐变
            cssColor_1 = 'radial-gradient(';
            var arr = regexRG.exec(gradientColor);
            steps = arr[4];
        }
        var colorStops_1 = steps.match(regexColorStop);
        colorStops_1.forEach(function (item, index) {
            var itemArr = item.split(':');
            cssColor_1 += "".concat(itemArr[1], " ").concat(Number(itemArr[0]) * 100, "%");
            if (index !== colorStops_1.length - 1) {
                cssColor_1 += ', ';
            }
        });
        cssColor_1 += ')';
        return cssColor_1;
    }
    return gradientColor;
}
//# sourceMappingURL=tocssgradient.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662382, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.vertical = exports.direction = exports.angleTo = exports.transform = void 0;
/**
 * @description 扩展方法，提供 gl-matrix 为提供的方法
 **/
var transform_1 = require("./transform");
Object.defineProperty(exports, "transform", { enumerable: true, get: function () { return transform_1.transform; } });
var angle_to_1 = require("./angle-to");
Object.defineProperty(exports, "angleTo", { enumerable: true, get: function () { return angle_to_1.angleTo; } });
var direction_1 = require("./direction");
Object.defineProperty(exports, "direction", { enumerable: true, get: function () { return direction_1.direction; } });
var vertical_1 = require("./vertical");
Object.defineProperty(exports, "vertical", { enumerable: true, get: function () { return vertical_1.vertical; } });
//# sourceMappingURL=index.js.map
}, function(modId) { var map = {"./transform":1729954662383,"./angle-to":1729954662384,"./direction":1729954662385,"./vertical":1729954662386}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662383, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.transform = transform;
var gl_matrix_1 = require("gl-matrix");
function leftTranslate(out, a, v) {
    var transMat = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    gl_matrix_1.mat3.fromTranslation(transMat, v);
    return gl_matrix_1.mat3.multiply(out, transMat, a);
}
function leftRotate(out, a, rad) {
    var rotateMat = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    gl_matrix_1.mat3.fromRotation(rotateMat, rad);
    return gl_matrix_1.mat3.multiply(out, rotateMat, a);
}
function leftScale(out, a, v) {
    var scaleMat = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    gl_matrix_1.mat3.fromScaling(scaleMat, v);
    return gl_matrix_1.mat3.multiply(out, scaleMat, a);
}
function leftMultiply(out, a, a1) {
    return gl_matrix_1.mat3.multiply(out, a1, a);
}
/**
 * 根据 actions 来做 transform
 * @param m
 * @param actions
 */
function transform(m, actions) {
    var matrix = m ? [].concat(m) : [1, 0, 0, 0, 1, 0, 0, 0, 1];
    for (var i = 0, len = actions.length; i < len; i++) {
        var action = actions[i];
        switch (action[0]) {
            case 't':
                leftTranslate(matrix, matrix, [action[1], action[2]]);
                break;
            case 's':
                leftScale(matrix, matrix, [action[1], action[2]]);
                break;
            case 'r':
                leftRotate(matrix, matrix, action[1]);
                break;
            case 'm':
                leftMultiply(matrix, matrix, action[1]);
                break;
            default:
                break;
        }
    }
    return matrix;
}
//# sourceMappingURL=transform.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662384, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.angleTo = angleTo;
var gl_matrix_1 = require("gl-matrix");
var direction_1 = require("./direction");
/**
 * 二维向量 v1 到 v2 的夹角
 * @param v1
 * @param v2
 * @param direct
 */
function angleTo(v1, v2, direct) {
    var ang = gl_matrix_1.vec2.angle(v1, v2);
    var angleLargeThanPI = (0, direction_1.direction)(v1, v2) >= 0;
    if (direct) {
        if (angleLargeThanPI) {
            return Math.PI * 2 - ang;
        }
        return ang;
    }
    if (angleLargeThanPI) {
        return ang;
    }
    return Math.PI * 2 - ang;
}
//# sourceMappingURL=angle-to.js.map
}, function(modId) { var map = {"./direction":1729954662385}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662385, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.direction = direction;
/**
 * 向量 v1 到 向量 v2 夹角的方向
 * @param  {Array} v1 向量
 * @param  {Array} v2 向量
 * @return {Boolean} >= 0 顺时针 < 0 逆时针
 */
function direction(v1, v2) {
    return v1[0] * v2[1] - v2[0] * v1[1];
}
//# sourceMappingURL=direction.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662386, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.vertical = vertical;
/**
 * 计算二维向量的垂直向量
 * @param out
 * @param v
 * @param flag
 */
function vertical(out, v, flag) {
    if (flag) {
        out[0] = v[1];
        out[1] = -1 * v[0];
    }
    else {
        out[0] = -1 * v[1];
        out[1] = v[0];
    }
    return out;
}
//# sourceMappingURL=vertical.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662387, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.equalizeSegments = exports.distanceSquareRoot = exports.isPointInStroke = exports.getPointAtLength = exports.getDrawDirection = exports.getPathArea = exports.getRotatedCurve = exports.getPathBBoxTotalLength = exports.getTotalLength = exports.getPathBBox = exports.arcToCubic = exports.reverseCurve = exports.normalizePath = exports.clonePath = exports.path2Array = exports.path2Absolute = exports.path2Curve = exports.path2String = void 0;
var tslib_1 = require("tslib");
var path_2_string_1 = require("./convert/path-2-string");
Object.defineProperty(exports, "path2String", { enumerable: true, get: function () { return path_2_string_1.path2String; } });
var path_2_curve_1 = require("./convert/path-2-curve");
Object.defineProperty(exports, "path2Curve", { enumerable: true, get: function () { return path_2_curve_1.path2Curve; } });
var path_2_absolute_1 = require("./convert/path-2-absolute");
Object.defineProperty(exports, "path2Absolute", { enumerable: true, get: function () { return path_2_absolute_1.path2Absolute; } });
var path_2_array_1 = require("./convert/path-2-array");
Object.defineProperty(exports, "path2Array", { enumerable: true, get: function () { return path_2_array_1.path2Array; } });
var clone_path_1 = require("./process/clone-path");
Object.defineProperty(exports, "clonePath", { enumerable: true, get: function () { return clone_path_1.clonePath; } });
var normalize_path_1 = require("./process/normalize-path");
Object.defineProperty(exports, "normalizePath", { enumerable: true, get: function () { return normalize_path_1.normalizePath; } });
var reverse_curve_1 = require("./process/reverse-curve");
Object.defineProperty(exports, "reverseCurve", { enumerable: true, get: function () { return reverse_curve_1.reverseCurve; } });
var arc_2_cubic_1 = require("./process/arc-2-cubic");
Object.defineProperty(exports, "arcToCubic", { enumerable: true, get: function () { return arc_2_cubic_1.arcToCubic; } });
var get_path_bbox_1 = require("./util/get-path-bbox");
Object.defineProperty(exports, "getPathBBox", { enumerable: true, get: function () { return get_path_bbox_1.getPathBBox; } });
var get_total_length_1 = require("./util/get-total-length");
Object.defineProperty(exports, "getTotalLength", { enumerable: true, get: function () { return get_total_length_1.getTotalLength; } });
var get_path_bbox_total_length_1 = require("./util/get-path-bbox-total-length");
Object.defineProperty(exports, "getPathBBoxTotalLength", { enumerable: true, get: function () { return get_path_bbox_total_length_1.getPathBBoxTotalLength; } });
var get_rotated_curve_1 = require("./util/get-rotated-curve");
Object.defineProperty(exports, "getRotatedCurve", { enumerable: true, get: function () { return get_rotated_curve_1.getRotatedCurve; } });
var get_path_area_1 = require("./util/get-path-area");
Object.defineProperty(exports, "getPathArea", { enumerable: true, get: function () { return get_path_area_1.getPathArea; } });
var get_draw_direction_1 = require("./util/get-draw-direction");
Object.defineProperty(exports, "getDrawDirection", { enumerable: true, get: function () { return get_draw_direction_1.getDrawDirection; } });
var get_point_at_length_1 = require("./util/get-point-at-length");
Object.defineProperty(exports, "getPointAtLength", { enumerable: true, get: function () { return get_point_at_length_1.getPointAtLength; } });
var is_point_in_stroke_1 = require("./util/is-point-in-stroke");
Object.defineProperty(exports, "isPointInStroke", { enumerable: true, get: function () { return is_point_in_stroke_1.isPointInStroke; } });
var distance_square_root_1 = require("./util/distance-square-root");
Object.defineProperty(exports, "distanceSquareRoot", { enumerable: true, get: function () { return distance_square_root_1.distanceSquareRoot; } });
var equalize_segments_1 = require("./util/equalize-segments");
Object.defineProperty(exports, "equalizeSegments", { enumerable: true, get: function () { return equalize_segments_1.equalizeSegments; } });
tslib_1.__exportStar(require("./types"), exports);
//# sourceMappingURL=index.js.map
}, function(modId) { var map = {"./convert/path-2-string":1729954662388,"./convert/path-2-curve":1729954662390,"./convert/path-2-absolute":1729954662398,"./convert/path-2-array":1729954662418,"./process/clone-path":1729954662419,"./process/normalize-path":1729954662393,"./process/reverse-curve":1729954662420,"./process/arc-2-cubic":1729954662413,"./util/get-path-bbox":1729954662421,"./util/get-total-length":1729954662428,"./util/get-path-bbox-total-length":1729954662429,"./util/get-rotated-curve":1729954662430,"./util/get-path-area":1729954662431,"./util/get-draw-direction":1729954662432,"./util/get-point-at-length":1729954662433,"./util/is-point-in-stroke":1729954662434,"./util/distance-square-root":1729954662424,"./util/equalize-segments":1729954662437,"./types":1729954662438}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662388, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.path2String = path2String;
var round_path_1 = require("../process/round-path");
/**
 * Returns a valid `d` attribute string value created
 * by rounding values and concatenating the `pathArray` segments.
 */
function path2String(path, round) {
    if (round === void 0) { round = 'off'; }
    return (0, round_path_1.roundPath)(path, round)
        .map(function (x) { return x[0] + x.slice(1).join(' '); })
        .join('');
}
//# sourceMappingURL=path-2-string.js.map
}, function(modId) { var map = {"../process/round-path":1729954662389}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662389, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.roundPath = roundPath;
/**
 * Rounds the values of a `PathArray` instance to
 * a specified amount of decimals and returns it.
 */
function roundPath(path, round) {
    if (round === 'off')
        return [].concat(path);
    // to round values to the power
    // the `round` value must be integer
    var pow = typeof round === 'number' && round >= 1 ? Math.pow(10, round) : 1;
    return path.map(function (pi) {
        var values = pi
            .slice(1)
            .map(Number)
            .map(function (n) { return (round ? Math.round(n * pow) / pow : Math.round(n)); });
        // @ts-ignore
        return [pi[0]].concat(values);
    });
}
//# sourceMappingURL=round-path.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662390, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.path2Curve = path2Curve;
var tslib_1 = require("tslib");
var params_parser_1 = require("../parser/params-parser");
var fix_arc_1 = require("../process/fix-arc");
var normalize_path_1 = require("../process/normalize-path");
var is_curve_array_1 = require("../util/is-curve-array");
var segment_2_cubic_1 = require("../process/segment-2-cubic");
// import { fixPath } from '../process/fix-path';
function path2Curve(pathInput, needZCommandIndexes) {
    if (needZCommandIndexes === void 0) { needZCommandIndexes = false; }
    if ((0, is_curve_array_1.isCurveArray)(pathInput)) {
        var cloned = [].concat(pathInput);
        if (needZCommandIndexes) {
            return [cloned, []];
        }
        else {
            return cloned;
        }
    }
    // fixPath will remove 'Z' command
    // const path = fixPath(normalizePath(pathInput));
    var path = (0, normalize_path_1.normalizePath)(pathInput);
    var params = tslib_1.__assign({}, params_parser_1.paramsParser);
    var allPathCommands = [];
    var pathCommand = '';
    var ii = path.length;
    var segment;
    var seglen;
    var zCommandIndexes = [];
    for (var i = 0; i < ii; i += 1) {
        if (path[i])
            pathCommand = path[i][0];
        allPathCommands[i] = pathCommand;
        var curveSegment = (0, segment_2_cubic_1.segmentToCubic)(path[i], params);
        path[i] = curveSegment;
        (0, fix_arc_1.fixArc)(path, allPathCommands, i);
        ii = path.length; // solves curveArrays ending in Z
        // keep Z command account for lineJoin
        // @see https://github.com/antvis/util/issues/68
        if (pathCommand === 'Z') {
            zCommandIndexes.push(i);
        }
        segment = path[i];
        seglen = segment.length;
        params.x1 = +segment[seglen - 2];
        params.y1 = +segment[seglen - 1];
        params.x2 = +segment[seglen - 4] || params.x1;
        params.y2 = +segment[seglen - 3] || params.y1;
    }
    // validate
    if (needZCommandIndexes) {
        return [path, zCommandIndexes];
    }
    else {
        return path;
    }
}
//# sourceMappingURL=path-2-curve.js.map
}, function(modId) { var map = {"../parser/params-parser":1729954662391,"../process/fix-arc":1729954662392,"../process/normalize-path":1729954662393,"../util/is-curve-array":1729954662411,"../process/segment-2-cubic":1729954662412}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662391, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.paramsParser = void 0;
exports.paramsParser = {
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 0,
    x: 0,
    y: 0,
    qx: null,
    qy: null,
};
//# sourceMappingURL=params-parser.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662392, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.fixArc = fixArc;
function fixArc(pathArray, allPathCommands, i) {
    if (pathArray[i].length > 7) {
        pathArray[i].shift();
        var pi = pathArray[i];
        // const ni = i + 1;
        var ni = i;
        while (pi.length) {
            // if created multiple C:s, their original seg is saved
            allPathCommands[i] = 'A';
            // @ts-ignore
            pathArray.splice((ni += 1), 0, ['C'].concat(pi.splice(0, 6)));
        }
        pathArray.splice(i, 1);
    }
}
//# sourceMappingURL=fix-arc.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662393, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizePath = normalizePath;
var tslib_1 = require("tslib");
var is_normalized_array_1 = require("../util/is-normalized-array");
var params_parser_1 = require("../parser/params-parser");
var path_2_absolute_1 = require("../convert/path-2-absolute");
var normalize_segment_1 = require("./normalize-segment");
/**
 * @example
 * const path = 'M0 0 H50';
 * const normalizedPath = SVGPathCommander.normalizePath(path);
 * // result => [['M', 0, 0], ['L', 50, 0]]
 */
function normalizePath(pathInput) {
    if ((0, is_normalized_array_1.isNormalizedArray)(pathInput)) {
        return [].concat(pathInput);
    }
    var path = (0, path_2_absolute_1.path2Absolute)(pathInput);
    var params = tslib_1.__assign({}, params_parser_1.paramsParser);
    for (var i = 0; i < path.length; i += 1) {
        // Save current path command
        path[i] = (0, normalize_segment_1.normalizeSegment)(path[i], params);
        var segment = path[i];
        var seglen = segment.length;
        params.x1 = +segment[seglen - 2];
        params.y1 = +segment[seglen - 1];
        params.x2 = +segment[seglen - 4] || params.x1;
        params.y2 = +segment[seglen - 3] || params.y1;
    }
    return path;
}
//# sourceMappingURL=normalize-path.js.map
}, function(modId) { var map = {"../util/is-normalized-array":1729954662394,"../parser/params-parser":1729954662391,"../convert/path-2-absolute":1729954662398,"./normalize-segment":1729954662410}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662394, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.isNormalizedArray = isNormalizedArray;
var is_absolute_array_1 = require("./is-absolute-array");
/**
 * Iterates an array to check if it's a `PathArray`
 * with all segments are in non-shorthand notation
 * with absolute values.
 */
function isNormalizedArray(path) {
    return (0, is_absolute_array_1.isAbsoluteArray)(path) && path.every(function (_a) {
        var pc = _a[0];
        return 'ACLMQZ'.includes(pc);
    });
}
//# sourceMappingURL=is-normalized-array.js.map
}, function(modId) { var map = {"./is-absolute-array":1729954662395}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662395, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.isAbsoluteArray = isAbsoluteArray;
var is_path_array_1 = require("./is-path-array");
/**
 * Iterates an array to check if it's a `PathArray`
 * with all absolute values.
 */
function isAbsoluteArray(path) {
    return ((0, is_path_array_1.isPathArray)(path) &&
        // @ts-ignore -- `isPathArray` also checks if it's `Array`
        path.every(function (_a) {
            var x = _a[0];
            return x === x.toUpperCase();
        }));
}
//# sourceMappingURL=is-absolute-array.js.map
}, function(modId) { var map = {"./is-path-array":1729954662396}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662396, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.isPathArray = isPathArray;
var params_count_1 = require("../parser/params-count");
/**
 * Iterates an array to check if it's an actual `PathArray`.
 */
function isPathArray(path) {
    return (Array.isArray(path) &&
        path.every(function (seg) {
            var lk = seg[0].toLowerCase();
            return params_count_1.paramsCount[lk] === seg.length - 1 && 'achlmqstvz'.includes(lk);
        }));
}
//# sourceMappingURL=is-path-array.js.map
}, function(modId) { var map = {"../parser/params-count":1729954662397}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662397, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.paramsCount = void 0;
exports.paramsCount = {
    a: 7,
    c: 6,
    h: 1,
    l: 2,
    m: 2,
    r: 4,
    q: 4,
    s: 4,
    t: 2,
    v: 1,
    z: 0,
};
//# sourceMappingURL=params-count.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662398, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.path2Absolute = path2Absolute;
var is_absolute_array_1 = require("../util/is-absolute-array");
var parse_path_string_1 = require("../parser/parse-path-string");
function path2Absolute(pathInput) {
    if ((0, is_absolute_array_1.isAbsoluteArray)(pathInput)) {
        return [].concat(pathInput);
    }
    var path = (0, parse_path_string_1.parsePathString)(pathInput);
    // if (!path || !path.length) {
    //   return [['M', 0, 0]];
    // }
    var x = 0;
    var y = 0;
    var mx = 0;
    var my = 0;
    // @ts-ignore
    return path.map(function (segment) {
        var values = segment.slice(1).map(Number);
        var pathCommand = segment[0];
        var absCommand = pathCommand.toUpperCase();
        if (pathCommand === 'M') {
            x = values[0], y = values[1];
            mx = x;
            my = y;
            return ['M', x, y];
        }
        var absoluteSegment;
        if (pathCommand !== absCommand) {
            switch (absCommand) {
                case 'A':
                    absoluteSegment = [
                        absCommand,
                        values[0],
                        values[1],
                        values[2],
                        values[3],
                        values[4],
                        values[5] + x,
                        values[6] + y,
                    ];
                    break;
                case 'V':
                    absoluteSegment = [absCommand, values[0] + y];
                    break;
                case 'H':
                    absoluteSegment = [absCommand, values[0] + x];
                    break;
                default: {
                    // use brakets for `eslint: no-case-declaration`
                    // https://stackoverflow.com/a/50753272/803358
                    var absValues = values.map(function (n, j) { return n + (j % 2 ? y : x); });
                    // for n, l, c, s, q, t
                    // @ts-ignore
                    absoluteSegment = [absCommand].concat(absValues);
                }
            }
        }
        else {
            // @ts-ignore
            absoluteSegment = [absCommand].concat(values);
        }
        var segLength = absoluteSegment.length;
        switch (absCommand) {
            case 'Z':
                x = mx;
                y = my;
                break;
            case 'H':
                x = absoluteSegment[1];
                break;
            case 'V':
                y = absoluteSegment[1];
                break;
            default:
                x = absoluteSegment[segLength - 2];
                y = absoluteSegment[segLength - 1];
                if (absCommand === 'M') {
                    mx = x;
                    my = y;
                }
        }
        return absoluteSegment;
    });
}
//# sourceMappingURL=path-2-absolute.js.map
}, function(modId) { var map = {"../util/is-absolute-array":1729954662395,"../parser/parse-path-string":1729954662399}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662399, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePathString = parsePathString;
var is_path_array_1 = require("../util/is-path-array");
var scan_segment_1 = require("./scan-segment");
var skip_spaces_1 = require("./skip-spaces");
var path_parser_1 = require("./path-parser");
/**
 * Parses a path string value and returns an array
 * of segments we like to call `pathArray`.
 */
function parsePathString(pathInput) {
    if ((0, is_path_array_1.isPathArray)(pathInput)) {
        return [].concat(pathInput);
    }
    var path = new path_parser_1.PathParser(pathInput);
    (0, skip_spaces_1.skipSpaces)(path);
    while (path.index < path.max && !path.err.length) {
        (0, scan_segment_1.scanSegment)(path);
    }
    return path.err ? path.err : path.segments;
}
//# sourceMappingURL=parse-path-string.js.map
}, function(modId) { var map = {"../util/is-path-array":1729954662396,"./scan-segment":1729954662400,"./skip-spaces":1729954662405,"./path-parser":1729954662409}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662400, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.scanSegment = scanSegment;
var finalize_segment_1 = require("./finalize-segment");
var params_count_1 = require("./params-count");
var scan_flag_1 = require("./scan-flag");
var scan_param_1 = require("./scan-param");
var skip_spaces_1 = require("./skip-spaces");
var is_path_command_1 = require("./is-path-command");
var is_digit_start_1 = require("./is-digit-start");
var is_arc_command_1 = require("./is-arc-command");
/**
 * Scans every character in the path string to determine
 * where a segment starts and where it ends.
 */
function scanSegment(path) {
    var max = path.max, pathValue = path.pathValue, index = path.index;
    var cmdCode = pathValue.charCodeAt(index);
    var reqParams = params_count_1.paramsCount[pathValue[index].toLowerCase()];
    path.segmentStart = index;
    if (!(0, is_path_command_1.isPathCommand)(cmdCode)) {
        path.err = "[path-util]: Invalid path value \"".concat(pathValue[index], "\" is not a path command");
        return;
    }
    path.index += 1;
    (0, skip_spaces_1.skipSpaces)(path);
    path.data = [];
    if (!reqParams) {
        // Z
        (0, finalize_segment_1.finalizeSegment)(path);
        return;
    }
    for (;;) {
        for (var i = reqParams; i > 0; i -= 1) {
            if ((0, is_arc_command_1.isArcCommand)(cmdCode) && (i === 3 || i === 4))
                (0, scan_flag_1.scanFlag)(path);
            else
                (0, scan_param_1.scanParam)(path);
            if (path.err.length) {
                return;
            }
            path.data.push(path.param);
            (0, skip_spaces_1.skipSpaces)(path);
            // after ',' param is mandatory
            if (path.index < max && pathValue.charCodeAt(path.index) === 0x2c /* , */) {
                path.index += 1;
                (0, skip_spaces_1.skipSpaces)(path);
            }
        }
        if (path.index >= path.max) {
            break;
        }
        // Stop on next segment
        if (!(0, is_digit_start_1.isDigitStart)(pathValue.charCodeAt(path.index))) {
            break;
        }
    }
    (0, finalize_segment_1.finalizeSegment)(path);
}
//# sourceMappingURL=scan-segment.js.map
}, function(modId) { var map = {"./finalize-segment":1729954662401,"./params-count":1729954662397,"./scan-flag":1729954662402,"./scan-param":1729954662403,"./skip-spaces":1729954662405,"./is-path-command":1729954662407,"./is-digit-start":1729954662404,"./is-arc-command":1729954662408}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662401, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.finalizeSegment = finalizeSegment;
var params_count_1 = require("./params-count");
/**
 * Breaks the parsing of a pathString once a segment is finalized.
 */
function finalizeSegment(path) {
    var pathCommand = path.pathValue[path.segmentStart];
    var LK = pathCommand.toLowerCase();
    var data = path.data;
    while (data.length >= params_count_1.paramsCount[LK]) {
        // overloaded `moveTo`
        // https://github.com/rveciana/svg-path-properties/blob/master/src/parse.ts
        if (LK === 'm' && data.length > 2) {
            // @ts-ignore
            path.segments.push([pathCommand].concat(data.splice(0, 2)));
            LK = 'l';
            pathCommand = pathCommand === 'm' ? 'l' : 'L';
        }
        else {
            // @ts-ignore
            path.segments.push([pathCommand].concat(data.splice(0, params_count_1.paramsCount[LK])));
        }
        if (!params_count_1.paramsCount[LK]) {
            break;
        }
    }
}
//# sourceMappingURL=finalize-segment.js.map
}, function(modId) { var map = {"./params-count":1729954662397}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662402, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.scanFlag = scanFlag;
/**
 * Validates an A (arc-to) specific path command value.
 * Usually a `large-arc-flag` or `sweep-flag`.
 */
function scanFlag(path) {
    var index = path.index, pathValue = path.pathValue;
    var code = pathValue.charCodeAt(index);
    if (code === 0x30 /* 0 */) {
        path.param = 0;
        path.index += 1;
        return;
    }
    if (code === 0x31 /* 1 */) {
        path.param = 1;
        path.index += 1;
        return;
    }
    path.err = "[path-util]: invalid Arc flag \"".concat(pathValue[index], "\", expecting 0 or 1 at index ").concat(index);
}
//# sourceMappingURL=scan-flag.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662403, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.scanParam = scanParam;
var is_digit_start_1 = require("./is-digit-start");
/**
 * Validates every character of the path string,
 * every path command, negative numbers or floating point numbers.
 */
function scanParam(path) {
    var max = path.max, pathValue = path.pathValue, start = path.index;
    var index = start;
    var zeroFirst = false;
    var hasCeiling = false;
    var hasDecimal = false;
    var hasDot = false;
    var ch;
    if (index >= max) {
        // path.err = 'SvgPath: missed param (at pos ' + index + ')';
        path.err = "[path-util]: Invalid path value at index ".concat(index, ", \"pathValue\" is missing param");
        return;
    }
    ch = pathValue.charCodeAt(index);
    if (ch === 0x2b /* + */ || ch === 0x2d /* - */) {
        index += 1;
        // ch = (index < max) ? pathValue.charCodeAt(index) : 0;
        ch = pathValue.charCodeAt(index);
    }
    // This logic is shamelessly borrowed from Esprima
    // https://github.com/ariya/esprimas
    if (!(0, is_digit_start_1.isDigit)(ch) && ch !== 0x2e /* . */) {
        // path.err = 'SvgPath: param should start with 0..9 or `.` (at pos ' + index + ')';
        path.err = "[path-util]: Invalid path value at index ".concat(index, ", \"").concat(pathValue[index], "\" is not a number");
        return;
    }
    if (ch !== 0x2e /* . */) {
        zeroFirst = ch === 0x30 /* 0 */;
        index += 1;
        ch = pathValue.charCodeAt(index);
        if (zeroFirst && index < max) {
            // decimal number starts with '0' such as '09' is illegal.
            if (ch && (0, is_digit_start_1.isDigit)(ch)) {
                // path.err = 'SvgPath: numbers started with `0` such as `09`
                // are illegal (at pos ' + start + ')';
                path.err = "[path-util]: Invalid path value at index ".concat(start, ", \"").concat(pathValue[start], "\" illegal number");
                return;
            }
        }
        while (index < max && (0, is_digit_start_1.isDigit)(pathValue.charCodeAt(index))) {
            index += 1;
            hasCeiling = true;
        }
        ch = pathValue.charCodeAt(index);
    }
    if (ch === 0x2e /* . */) {
        hasDot = true;
        index += 1;
        while ((0, is_digit_start_1.isDigit)(pathValue.charCodeAt(index))) {
            index += 1;
            hasDecimal = true;
        }
        ch = pathValue.charCodeAt(index);
    }
    if (ch === 0x65 /* e */ || ch === 0x45 /* E */) {
        if (hasDot && !hasCeiling && !hasDecimal) {
            path.err = "[path-util]: Invalid path value at index ".concat(index, ", \"").concat(pathValue[index], "\" invalid float exponent");
            return;
        }
        index += 1;
        ch = pathValue.charCodeAt(index);
        if (ch === 0x2b /* + */ || ch === 0x2d /* - */) {
            index += 1;
        }
        if (index < max && (0, is_digit_start_1.isDigit)(pathValue.charCodeAt(index))) {
            while (index < max && (0, is_digit_start_1.isDigit)(pathValue.charCodeAt(index))) {
                index += 1;
            }
        }
        else {
            path.err = "[path-util]: Invalid path value at index ".concat(index, ", \"").concat(pathValue[index], "\" invalid integer exponent");
            return;
        }
    }
    path.index = index;
    path.param = +path.pathValue.slice(start, index);
}
//# sourceMappingURL=scan-param.js.map
}, function(modId) { var map = {"./is-digit-start":1729954662404}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662404, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.isDigitStart = isDigitStart;
exports.isDigit = isDigit;
/**
 * Checks if the character is or belongs to a number.
 * [0-9]|+|-|.
 */
function isDigitStart(code) {
    return ((code >= 48 && code <= 57) /* 0..9 */ || code === 0x2b /* + */ || code === 0x2d /* - */ || code === 0x2e); /* . */
}
function isDigit(code) {
    return code >= 48 && code <= 57; // 0..9
}
//# sourceMappingURL=is-digit-start.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662405, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.skipSpaces = skipSpaces;
var is_space_1 = require("./is-space");
/**
 * Points the parser to the next character in the
 * path string every time it encounters any kind of
 * space character.
 */
function skipSpaces(path) {
    var pathValue = path.pathValue, max = path.max;
    while (path.index < max && (0, is_space_1.isSpace)(pathValue.charCodeAt(path.index))) {
        path.index += 1;
    }
}
//# sourceMappingURL=skip-spaces.js.map
}, function(modId) { var map = {"./is-space":1729954662406}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662406, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.isSpace = isSpace;
/**
 * Checks if the character is a space.
 */
function isSpace(ch) {
    var specialSpaces = [
        0x1680, 0x180e, 0x2000, 0x2001, 0x2002, 0x2003, 0x2004, 0x2005, 0x2006, 0x2007, 0x2008, 0x2009, 0x200a, 0x202f,
        0x205f, 0x3000, 0xfeff,
    ];
    /* istanbul ignore next */
    return (ch === 0x0a ||
        ch === 0x0d ||
        ch === 0x2028 ||
        ch === 0x2029 || // Line terminators
        // White spaces
        ch === 0x20 ||
        ch === 0x09 ||
        ch === 0x0b ||
        ch === 0x0c ||
        ch === 0xa0 ||
        (ch >= 0x1680 && specialSpaces.includes(ch)));
}
//# sourceMappingURL=is-space.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662407, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.isPathCommand = isPathCommand;
/**
 * Checks if the character is a path command.
 */
function isPathCommand(code) {
    // eslint-disable-next-line no-bitwise -- Impossible to satisfy
    switch (code | 0x20) {
        case 0x6d /* m */:
        case 0x7a /* z */:
        case 0x6c /* l */:
        case 0x68 /* h */:
        case 0x76 /* v */:
        case 0x63 /* c */:
        case 0x73 /* s */:
        case 0x71 /* q */:
        case 0x74 /* t */:
        case 0x61 /* a */:
            // case 0x72/* r */:
            return true;
        default:
            return false;
    }
}
//# sourceMappingURL=is-path-command.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662408, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.isArcCommand = isArcCommand;
/**
 * Checks if the character is an A (arc-to) path command.
 */
function isArcCommand(code) {
    return (code | 0x20) === 0x61;
}
//# sourceMappingURL=is-arc-command.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662409, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.PathParser = void 0;
/**
 * The `PathParser` is used by the `parsePathString` static method
 * to generate a `pathArray`.
 */
var PathParser = /** @class */ (function () {
    function PathParser(pathString) {
        this.pathValue = pathString;
        // @ts-ignore
        this.segments = [];
        this.max = pathString.length;
        this.index = 0;
        this.param = 0.0;
        this.segmentStart = 0;
        this.data = [];
        this.err = '';
    }
    return PathParser;
}());
exports.PathParser = PathParser;
//# sourceMappingURL=path-parser.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662410, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeSegment = normalizeSegment;
/**
 * Normalizes a single segment of a `PathArray` object.
 * eg. H/V -> L, T -> Q
 */
function normalizeSegment(segment, params) {
    var pathCommand = segment[0];
    var px1 = params.x1, py1 = params.y1, px2 = params.x2, py2 = params.y2;
    var values = segment.slice(1).map(Number);
    var result = segment;
    if (!'TQ'.includes(pathCommand)) {
        // optional but good to be cautious
        params.qx = null;
        params.qy = null;
    }
    if (pathCommand === 'H') {
        result = ['L', segment[1], py1];
    }
    else if (pathCommand === 'V') {
        result = ['L', px1, segment[1]];
    }
    else if (pathCommand === 'S') {
        var x1 = px1 * 2 - px2;
        var y1 = py1 * 2 - py2;
        params.x1 = x1;
        params.y1 = y1;
        result = ['C', x1, y1].concat(values);
    }
    else if (pathCommand === 'T') {
        var qx = px1 * 2 - params.qx;
        var qy = py1 * 2 - params.qy;
        params.qx = qx;
        params.qy = qy;
        result = ['Q', qx, qy].concat(values);
    }
    else if (pathCommand === 'Q') {
        var nqx = values[0], nqy = values[1];
        params.qx = nqx;
        params.qy = nqy;
    }
    return result;
}
//# sourceMappingURL=normalize-segment.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662411, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.isCurveArray = isCurveArray;
var is_normalized_array_1 = require("./is-normalized-array");
/**
 * Iterates an array to check if it's a `PathArray`
 * with all C (cubic bezier) segments.
 *
 * @param {string | PathArray} path the `Array` to be checked
 * @returns {boolean} iteration result
 */
function isCurveArray(path) {
    return (0, is_normalized_array_1.isNormalizedArray)(path) && path.every(function (_a) {
        var pc = _a[0];
        return 'MC'.includes(pc);
    });
}
//# sourceMappingURL=is-curve-array.js.map
}, function(modId) { var map = {"./is-normalized-array":1729954662394}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662412, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.segmentToCubic = segmentToCubic;
var arc_2_cubic_1 = require("./arc-2-cubic");
var quad_2_cubic_1 = require("./quad-2-cubic");
var line_2_cubic_1 = require("./line-2-cubic");
function segmentToCubic(segment, params) {
    var pathCommand = segment[0];
    var values = segment.slice(1).map(Number);
    var x = values[0], y = values[1];
    var args;
    var px1 = params.x1, py1 = params.y1, px = params.x, py = params.y;
    if (!'TQ'.includes(pathCommand)) {
        params.qx = null;
        params.qy = null;
    }
    switch (pathCommand) {
        case 'M':
            params.x = x;
            params.y = y;
            return segment;
        case 'A':
            args = [px1, py1].concat(values);
            // @ts-ignore
            return ['C'].concat((0, arc_2_cubic_1.arcToCubic)(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8], args[9]));
        case 'Q':
            params.qx = x;
            params.qy = y;
            args = [px1, py1].concat(values);
            // @ts-ignore
            return ['C'].concat((0, quad_2_cubic_1.quadToCubic)(args[0], args[1], args[2], args[3], args[4], args[5]));
        case 'L':
            // @ts-ignore
            return ['C'].concat((0, line_2_cubic_1.lineToCubic)(px1, py1, x, y));
        case 'Z':
            // prevent NaN from divide 0
            if (px1 === px && py1 === py) {
                return ['C', px1, py1, px, py, px, py];
            }
            // @ts-ignore
            return ['C'].concat((0, line_2_cubic_1.lineToCubic)(px1, py1, px, py));
        default:
    }
    return segment;
}
//# sourceMappingURL=segment-2-cubic.js.map
}, function(modId) { var map = {"./arc-2-cubic":1729954662413,"./quad-2-cubic":1729954662415,"./line-2-cubic":1729954662416}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662413, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.arcToCubic = arcToCubic;
var rotate_vector_1 = require("../util/rotate-vector");
/**
 * Converts A (arc-to) segments to C (cubic-bezier-to).
 *
 * For more information of where this math came from visit:
 * http://www.w3.org/TR/SVG11/implnote.html#ArcImplementationNotes
 */
function arcToCubic(X1, Y1, RX, RY, angle, LAF, SF, X2, Y2, recursive) {
    var x1 = X1;
    var y1 = Y1;
    var rx = RX;
    var ry = RY;
    var x2 = X2;
    var y2 = Y2;
    // for more information of where this Math came from visit:
    // http://www.w3.org/TR/SVG11/implnote.html#ArcImplementationNotes
    var d120 = (Math.PI * 120) / 180;
    var rad = (Math.PI / 180) * (+angle || 0);
    /** @type {number[]} */
    var res = [];
    var xy;
    var f1;
    var f2;
    var cx;
    var cy;
    if (!recursive) {
        xy = (0, rotate_vector_1.rotateVector)(x1, y1, -rad);
        x1 = xy.x;
        y1 = xy.y;
        xy = (0, rotate_vector_1.rotateVector)(x2, y2, -rad);
        x2 = xy.x;
        y2 = xy.y;
        var x = (x1 - x2) / 2;
        var y = (y1 - y2) / 2;
        var h = (x * x) / (rx * rx) + (y * y) / (ry * ry);
        if (h > 1) {
            h = Math.sqrt(h);
            rx *= h;
            ry *= h;
        }
        var rx2 = rx * rx;
        var ry2 = ry * ry;
        var k = (LAF === SF ? -1 : 1) *
            Math.sqrt(Math.abs((rx2 * ry2 - rx2 * y * y - ry2 * x * x) / (rx2 * y * y + ry2 * x * x)));
        cx = (k * rx * y) / ry + (x1 + x2) / 2;
        cy = (k * -ry * x) / rx + (y1 + y2) / 2;
        // eslint-disable-next-line no-bitwise -- Impossible to satisfy no-bitwise
        f1 = Math.asin(((((y1 - cy) / ry) * Math.pow(10, 9)) >> 0) / Math.pow(10, 9));
        // eslint-disable-next-line no-bitwise -- Impossible to satisfy no-bitwise
        f2 = Math.asin(((((y2 - cy) / ry) * Math.pow(10, 9)) >> 0) / Math.pow(10, 9));
        f1 = x1 < cx ? Math.PI - f1 : f1;
        f2 = x2 < cx ? Math.PI - f2 : f2;
        if (f1 < 0)
            f1 = Math.PI * 2 + f1;
        if (f2 < 0)
            f2 = Math.PI * 2 + f2;
        if (SF && f1 > f2) {
            f1 -= Math.PI * 2;
        }
        if (!SF && f2 > f1) {
            f2 -= Math.PI * 2;
        }
    }
    else {
        f1 = recursive[0], f2 = recursive[1], cx = recursive[2], cy = recursive[3];
    }
    var df = f2 - f1;
    if (Math.abs(df) > d120) {
        var f2old = f2;
        var x2old = x2;
        var y2old = y2;
        f2 = f1 + d120 * (SF && f2 > f1 ? 1 : -1);
        x2 = cx + rx * Math.cos(f2);
        y2 = cy + ry * Math.sin(f2);
        res = arcToCubic(x2, y2, rx, ry, angle, 0, SF, x2old, y2old, [f2, f2old, cx, cy]);
    }
    df = f2 - f1;
    var c1 = Math.cos(f1);
    var s1 = Math.sin(f1);
    var c2 = Math.cos(f2);
    var s2 = Math.sin(f2);
    var t = Math.tan(df / 4);
    var hx = (4 / 3) * rx * t;
    var hy = (4 / 3) * ry * t;
    var m1 = [x1, y1];
    var m2 = [x1 + hx * s1, y1 - hy * c1];
    var m3 = [x2 + hx * s2, y2 - hy * c2];
    var m4 = [x2, y2];
    m2[0] = 2 * m1[0] - m2[0];
    m2[1] = 2 * m1[1] - m2[1];
    if (recursive) {
        return m2.concat(m3, m4, res);
        // return [...m2, ...m3, ...m4, ...res];
    }
    res = m2.concat(m3, m4, res);
    // res = [...m2, ...m3, ...m4, ...res];
    var newres = [];
    for (var i = 0, ii = res.length; i < ii; i += 1) {
        newres[i] = i % 2 ? (0, rotate_vector_1.rotateVector)(res[i - 1], res[i], rad).y : (0, rotate_vector_1.rotateVector)(res[i], res[i + 1], rad).x;
    }
    return newres;
}
// const TAU = Math.PI * 2;
// const mapToEllipse = (
//   { x, y }: { x: number; y: number },
//   rx: number,
//   ry: number,
//   cosphi: number,
//   sinphi: number,
//   centerx: number,
//   centery: number,
// ) => {
//   x *= rx;
//   y *= ry;
//   const xp = cosphi * x - sinphi * y;
//   const yp = sinphi * x + cosphi * y;
//   return {
//     x: xp + centerx,
//     y: yp + centery,
//   };
// };
// const approxUnitArc = (ang1: number, ang2: number) => {
//   // If 90 degree circular arc, use a constant
//   // as derived from http://spencermortensen.com/articles/bezier-circle
//   const a =
//     ang2 === 1.5707963267948966
//       ? 0.551915024494
//       : ang2 === -1.5707963267948966
//       ? -0.551915024494
//       : (4 / 3) * Math.tan(ang2 / 4);
//   const x1 = Math.cos(ang1);
//   const y1 = Math.sin(ang1);
//   const x2 = Math.cos(ang1 + ang2);
//   const y2 = Math.sin(ang1 + ang2);
//   return [
//     {
//       x: x1 - y1 * a,
//       y: y1 + x1 * a,
//     },
//     {
//       x: x2 + y2 * a,
//       y: y2 - x2 * a,
//     },
//     {
//       x: x2,
//       y: y2,
//     },
//   ];
// };
// const vectorAngle = (ux: number, uy: number, vx: number, vy: number) => {
//   const sign = ux * vy - uy * vx < 0 ? -1 : 1;
//   let dot = ux * vx + uy * vy;
//   if (dot > 1) {
//     dot = 1;
//   }
//   if (dot < -1) {
//     dot = -1;
//   }
//   return sign * Math.acos(dot);
// };
// const getArcCenter = (
//   px: any,
//   py: any,
//   cx: any,
//   cy: any,
//   rx: number,
//   ry: number,
//   largeArcFlag: number,
//   sweepFlag: number,
//   sinphi: number,
//   cosphi: number,
//   pxp: number,
//   pyp: number,
// ) => {
//   const rxsq = Math.pow(rx, 2);
//   const rysq = Math.pow(ry, 2);
//   const pxpsq = Math.pow(pxp, 2);
//   const pypsq = Math.pow(pyp, 2);
//   let radicant = rxsq * rysq - rxsq * pypsq - rysq * pxpsq;
//   if (radicant < 0) {
//     radicant = 0;
//   }
//   radicant /= rxsq * pypsq + rysq * pxpsq;
//   radicant = Math.sqrt(radicant) * (largeArcFlag === sweepFlag ? -1 : 1);
//   const centerxp = ((radicant * rx) / ry) * pyp;
//   const centeryp = ((radicant * -ry) / rx) * pxp;
//   const centerx = cosphi * centerxp - sinphi * centeryp + (px + cx) / 2;
//   const centery = sinphi * centerxp + cosphi * centeryp + (py + cy) / 2;
//   const vx1 = (pxp - centerxp) / rx;
//   const vy1 = (pyp - centeryp) / ry;
//   const vx2 = (-pxp - centerxp) / rx;
//   const vy2 = (-pyp - centeryp) / ry;
//   const ang1 = vectorAngle(1, 0, vx1, vy1);
//   let ang2 = vectorAngle(vx1, vy1, vx2, vy2);
//   if (sweepFlag === 0 && ang2 > 0) {
//     ang2 -= TAU;
//   }
//   if (sweepFlag === 1 && ang2 < 0) {
//     ang2 += TAU;
//   }
//   return [centerx, centery, ang1, ang2];
// };
// const arcToBezier = ({ px, py, cx, cy, rx, ry, xAxisRotation = 0, largeArcFlag = 0, sweepFlag = 0 }) => {
//   const curves = [];
//   if (rx === 0 || ry === 0) {
//     return [{ x1: 0, y1: 0, x2: 0, y2: 0, x: cx, y: cy }];
//   }
//   const sinphi = Math.sin((xAxisRotation * TAU) / 360);
//   const cosphi = Math.cos((xAxisRotation * TAU) / 360);
//   const pxp = (cosphi * (px - cx)) / 2 + (sinphi * (py - cy)) / 2;
//   const pyp = (-sinphi * (px - cx)) / 2 + (cosphi * (py - cy)) / 2;
//   if (pxp === 0 && pyp === 0) {
//     return [{ x1: 0, y1: 0, x2: 0, y2: 0, x: cx, y: cy }];
//   }
//   rx = Math.abs(rx);
//   ry = Math.abs(ry);
//   const lambda = Math.pow(pxp, 2) / Math.pow(rx, 2) + Math.pow(pyp, 2) / Math.pow(ry, 2);
//   if (lambda > 1) {
//     rx *= Math.sqrt(lambda);
//     ry *= Math.sqrt(lambda);
//   }
//   let [centerx, centery, ang1, ang2] = getArcCenter(
//     px,
//     py,
//     cx,
//     cy,
//     rx,
//     ry,
//     largeArcFlag,
//     sweepFlag,
//     sinphi,
//     cosphi,
//     pxp,
//     pyp,
//   );
//   // If 'ang2' == 90.0000000001, then `ratio` will evaluate to
//   // 1.0000000001. This causes `segments` to be greater than one, which is an
//   // unecessary split, and adds extra points to the bezier curve. To alleviate
//   // this issue, we round to 1.0 when the ratio is close to 1.0.
//   let ratio = Math.abs(ang2) / (TAU / 4);
//   if (Math.abs(1.0 - ratio) < 0.0000001) {
//     ratio = 1.0;
//   }
//   const segments = Math.max(Math.ceil(ratio), 1);
//   ang2 /= segments;
//   for (let i = 0; i < segments; i++) {
//     curves.push(approxUnitArc(ang1, ang2));
//     ang1 += ang2;
//   }
//   return curves.map((curve) => {
//     const { x: x1, y: y1 } = mapToEllipse(curve[0], rx, ry, cosphi, sinphi, centerx, centery);
//     const { x: x2, y: y2 } = mapToEllipse(curve[1], rx, ry, cosphi, sinphi, centerx, centery);
//     const { x, y } = mapToEllipse(curve[2], rx, ry, cosphi, sinphi, centerx, centery);
//     return { x1, y1, x2, y2, x, y };
//   });
// };
// export function arcToCubic(
//   x1: number,
//   y1: number,
//   rx: number,
//   ry: number,
//   angle: number,
//   LAF: number,
//   SF: number,
//   x2: number,
//   y2: number,
// ) {
//   const curves = arcToBezier({
//     px: x1,
//     py: y1,
//     cx: x2,
//     cy: y2,
//     rx,
//     ry,
//     xAxisRotation: angle,
//     largeArcFlag: LAF,
//     sweepFlag: SF,
//   });
//   return curves.reduce((prev, cur) => {
//     const { x1, y1, x2, y2, x, y } = cur;
//     prev.push(x1, y1, x2, y2, x, y);
//     return prev;
//   }, [] as number[]);
// }
//# sourceMappingURL=arc-2-cubic.js.map
}, function(modId) { var map = {"../util/rotate-vector":1729954662414}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662414, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.rotateVector = rotateVector;
function rotateVector(x, y, rad) {
    var X = x * Math.cos(rad) - y * Math.sin(rad);
    var Y = x * Math.sin(rad) + y * Math.cos(rad);
    return { x: X, y: Y };
}
//# sourceMappingURL=rotate-vector.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662415, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.quadToCubic = quadToCubic;
function quadToCubic(x1, y1, qx, qy, x2, y2) {
    var r13 = 1 / 3;
    var r23 = 2 / 3;
    return [
        r13 * x1 + r23 * qx, // cpx1
        r13 * y1 + r23 * qy, // cpy1
        r13 * x2 + r23 * qx, // cpx2
        r13 * y2 + r23 * qy, // cpy2
        x2,
        y2, // x,y
    ];
}
//# sourceMappingURL=quad-2-cubic.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662416, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.lineToCubic = void 0;
var tslib_1 = require("tslib");
var mid_point_1 = require("../util/mid-point");
var lineToCubic = function (x1, y1, x2, y2) {
    var t = 0.5;
    var mid = (0, mid_point_1.midPoint)([x1, y1], [x2, y2], t);
    return tslib_1.__spreadArray(tslib_1.__spreadArray([], mid, true), [x2, y2, x2, y2], false);
};
exports.lineToCubic = lineToCubic;
//# sourceMappingURL=line-2-cubic.js.map
}, function(modId) { var map = {"../util/mid-point":1729954662417}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662417, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.midPoint = midPoint;
function midPoint(a, b, t) {
    var ax = a[0];
    var ay = a[1];
    var bx = b[0];
    var by = b[1];
    return [ax + (bx - ax) * t, ay + (by - ay) * t];
}
//# sourceMappingURL=mid-point.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662418, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.path2Array = path2Array;
var parse_path_string_1 = require("../parser/parse-path-string");
function path2Array(pathInput) {
    return (0, parse_path_string_1.parsePathString)(pathInput);
}
//# sourceMappingURL=path-2-array.js.map
}, function(modId) { var map = {"../parser/parse-path-string":1729954662399}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662419, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.clonePath = clonePath;
function clonePath(path) {
    return path.map(function (x) { return (Array.isArray(x) ? [].concat(x) : x); });
}
//# sourceMappingURL=clone-path.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662420, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.reverseCurve = reverseCurve;
// reverse CURVE based pathArray segments only
function reverseCurve(pathArray) {
    var rotatedCurve = pathArray
        .slice(1)
        .map(function (x, i, curveOnly) {
        // @ts-ignore
        return !i ? pathArray[0].slice(1).concat(x.slice(1)) : curveOnly[i - 1].slice(-2).concat(x.slice(1));
    })
        // @ts-ignore
        .map(function (x) { return x.map(function (y, i) { return x[x.length - i - 2 * (1 - (i % 2))]; }); })
        .reverse();
    return [['M'].concat(rotatedCurve[0].slice(0, 2))].concat(rotatedCurve.map(function (x) { return ['C'].concat(x.slice(2)); }));
}
//# sourceMappingURL=reverse-curve.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662421, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.getPathBBox = getPathBBox;
var tslib_1 = require("tslib");
var path_length_factory_1 = require("./path-length-factory");
/**
 * Returns the bounding box of a shape.
 */
function getPathBBox(path, options) {
    if (!path) {
        return {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            x2: 0,
            y2: 0,
            cx: 0,
            cy: 0,
            cz: 0,
        };
    }
    var _a = (0, path_length_factory_1.pathLengthFactory)(path, undefined, tslib_1.__assign(tslib_1.__assign({}, options), { length: false })), _b = _a.min, xMin = _b.x, yMin = _b.y, _c = _a.max, xMax = _c.x, yMax = _c.y;
    var width = xMax - xMin;
    var height = yMax - yMin;
    return {
        width: width,
        height: height,
        x: xMin,
        y: yMin,
        x2: xMax,
        y2: yMax,
        cx: xMin + width / 2,
        cy: yMin + height / 2,
        // an estimted guess
        cz: Math.max(width, height) + Math.min(width, height) / 2,
    };
}
//# sourceMappingURL=get-path-bbox.js.map
}, function(modId) { var map = {"./path-length-factory":1729954662422}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662422, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.pathLengthFactory = pathLengthFactory;
var normalize_path_1 = require("../process/normalize-path");
var segment_line_factory_1 = require("./segment-line-factory");
var segment_arc_factory_1 = require("./segment-arc-factory");
var segment_cubic_factory_1 = require("./segment-cubic-factory");
var segment_quad_factory_1 = require("./segment-quad-factory");
/**
 * Returns a {x,y} point at a given length
 * of a shape, the shape total length and
 * the shape minimum and maximum {x,y} coordinates.
 */
function pathLengthFactory(pathInput, distance, options) {
    var _a, _b, _c, _d, _e, _f;
    var path = (0, normalize_path_1.normalizePath)(pathInput);
    var distanceIsNumber = typeof distance === 'number';
    var isM;
    var data = [];
    var pathCommand;
    var x = 0;
    var y = 0;
    var mx = 0;
    var my = 0;
    var seg;
    var MIN = [];
    var MAX = [];
    var length = 0;
    var min = { x: 0, y: 0 };
    var max = min;
    var point = min;
    var POINT = min;
    var LENGTH = 0;
    for (var i = 0, ll = path.length; i < ll; i += 1) {
        seg = path[i];
        pathCommand = seg[0];
        isM = pathCommand === 'M';
        data = !isM ? [x, y].concat(seg.slice(1)) : data;
        // this segment is always ZERO
        /* istanbul ignore else */
        if (isM) {
            // remember mx, my for Z
            mx = seg[1], my = seg[2];
            min = { x: mx, y: my };
            max = min;
            length = 0;
            if (distanceIsNumber && distance < 0.001) {
                POINT = min;
            }
        }
        else if (pathCommand === 'L') {
            (_a = (0, segment_line_factory_1.segmentLineFactory)(data[0], data[1], data[2], data[3], (distance || 0) - LENGTH), length = _a.length, min = _a.min, max = _a.max, point = _a.point);
        }
        else if (pathCommand === 'A') {
            (_b = (0, segment_arc_factory_1.segmentArcFactory)(data[0], data[1], data[2], data[3], data[4], data[5], data[6], data[7], data[8], (distance || 0) - LENGTH, options || {}), length = _b.length, min = _b.min, max = _b.max, point = _b.point);
        }
        else if (pathCommand === 'C') {
            (_c = (0, segment_cubic_factory_1.segmentCubicFactory)(data[0], data[1], data[2], data[3], data[4], data[5], data[6], data[7], (distance || 0) - LENGTH, options || {}), length = _c.length, min = _c.min, max = _c.max, point = _c.point);
        }
        else if (pathCommand === 'Q') {
            (_d = (0, segment_quad_factory_1.segmentQuadFactory)(data[0], data[1], data[2], data[3], data[4], data[5], (distance || 0) - LENGTH, options || {}), length = _d.length, min = _d.min, max = _d.max, point = _d.point);
        }
        else if (pathCommand === 'Z') {
            data = [x, y, mx, my];
            (_e = (0, segment_line_factory_1.segmentLineFactory)(data[0], data[1], data[2], data[3], (distance || 0) - LENGTH), length = _e.length, min = _e.min, max = _e.max, point = _e.point);
        }
        if (distanceIsNumber && LENGTH < distance && LENGTH + length >= distance) {
            POINT = point;
        }
        MAX.push(max);
        MIN.push(min);
        LENGTH += length;
        _f = pathCommand !== 'Z' ? seg.slice(-2) : [mx, my], x = _f[0], y = _f[1];
    }
    // native `getPointAtLength` behavior when the given distance
    // is higher than total length
    if (distanceIsNumber && distance >= LENGTH) {
        POINT = { x: x, y: y };
    }
    return {
        length: LENGTH,
        point: POINT,
        min: {
            x: Math.min.apply(null, MIN.map(function (n) { return n.x; })),
            y: Math.min.apply(null, MIN.map(function (n) { return n.y; })),
        },
        max: {
            x: Math.max.apply(null, MAX.map(function (n) { return n.x; })),
            y: Math.max.apply(null, MAX.map(function (n) { return n.y; })),
        },
    };
}
//# sourceMappingURL=path-length-factory.js.map
}, function(modId) { var map = {"../process/normalize-path":1729954662393,"./segment-line-factory":1729954662423,"./segment-arc-factory":1729954662425,"./segment-cubic-factory":1729954662426,"./segment-quad-factory":1729954662427}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662423, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.segmentLineFactory = segmentLineFactory;
var mid_point_1 = require("./mid-point");
var distance_square_root_1 = require("./distance-square-root");
/**
 * Returns a {x,y} point at a given length, the total length and
 * the minimum and maximum {x,y} coordinates of a line (L,V,H,Z) segment.
 */
function segmentLineFactory(x1, y1, x2, y2, distance) {
    var length = (0, distance_square_root_1.distanceSquareRoot)([x1, y1], [x2, y2]);
    var point = { x: 0, y: 0 };
    if (typeof distance === 'number') {
        if (distance <= 0) {
            point = { x: x1, y: y1 };
        }
        else if (distance >= length) {
            point = { x: x2, y: y2 };
        }
        else {
            var _a = (0, mid_point_1.midPoint)([x1, y1], [x2, y2], distance / length), x = _a[0], y = _a[1];
            point = { x: x, y: y };
        }
    }
    return {
        length: length,
        point: point,
        min: {
            x: Math.min(x1, x2),
            y: Math.min(y1, y2),
        },
        max: {
            x: Math.max(x1, x2),
            y: Math.max(y1, y2),
        },
    };
}
//# sourceMappingURL=segment-line-factory.js.map
}, function(modId) { var map = {"./mid-point":1729954662417,"./distance-square-root":1729954662424}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662424, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.distanceSquareRoot = distanceSquareRoot;
function distanceSquareRoot(a, b) {
    return Math.sqrt((a[0] - b[0]) * (a[0] - b[0]) + (a[1] - b[1]) * (a[1] - b[1]));
}
//# sourceMappingURL=distance-square-root.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662425, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.segmentArcFactory = segmentArcFactory;
var segment_line_factory_1 = require("./segment-line-factory");
var distance_square_root_1 = require("./distance-square-root");
function angleBetween(v0, v1) {
    var v0x = v0.x, v0y = v0.y;
    var v1x = v1.x, v1y = v1.y;
    var p = v0x * v1x + v0y * v1y;
    var n = Math.sqrt((Math.pow(v0x, 2) + Math.pow(v0y, 2)) * (Math.pow(v1x, 2) + Math.pow(v1y, 2)));
    var sign = v0x * v1y - v0y * v1x < 0 ? -1 : 1;
    var angle = sign * Math.acos(p / n);
    return angle;
}
/**
 * Returns a {x,y} point at a given length, the total length and
 * the minimum and maximum {x,y} coordinates of a C (cubic-bezier) segment.
 * @see https://github.com/MadLittleMods/svg-curve-lib/blob/master/src/js/svg-curve-lib.js
 */
function getPointAtArcSegmentLength(x1, y1, RX, RY, angle, LAF, SF, x, y, t) {
    var abs = Math.abs, sin = Math.sin, cos = Math.cos, sqrt = Math.sqrt, PI = Math.PI;
    var rx = abs(RX);
    var ry = abs(RY);
    var xRot = ((angle % 360) + 360) % 360;
    var xRotRad = xRot * (PI / 180);
    if (x1 === x && y1 === y) {
        return { x: x1, y: y1 };
    }
    if (rx === 0 || ry === 0) {
        return (0, segment_line_factory_1.segmentLineFactory)(x1, y1, x, y, t).point;
    }
    var dx = (x1 - x) / 2;
    var dy = (y1 - y) / 2;
    var transformedPoint = {
        x: cos(xRotRad) * dx + sin(xRotRad) * dy,
        y: -sin(xRotRad) * dx + cos(xRotRad) * dy,
    };
    var radiiCheck = Math.pow(transformedPoint.x, 2) / Math.pow(rx, 2) + Math.pow(transformedPoint.y, 2) / Math.pow(ry, 2);
    if (radiiCheck > 1) {
        rx *= sqrt(radiiCheck);
        ry *= sqrt(radiiCheck);
    }
    var cSquareNumerator = Math.pow(rx, 2) * Math.pow(ry, 2) - Math.pow(rx, 2) * Math.pow(transformedPoint.y, 2) - Math.pow(ry, 2) * Math.pow(transformedPoint.x, 2);
    var cSquareRootDenom = Math.pow(rx, 2) * Math.pow(transformedPoint.y, 2) + Math.pow(ry, 2) * Math.pow(transformedPoint.x, 2);
    var cRadicand = cSquareNumerator / cSquareRootDenom;
    cRadicand = cRadicand < 0 ? 0 : cRadicand;
    var cCoef = (LAF !== SF ? 1 : -1) * sqrt(cRadicand);
    var transformedCenter = {
        x: cCoef * ((rx * transformedPoint.y) / ry),
        y: cCoef * (-(ry * transformedPoint.x) / rx),
    };
    var center = {
        x: cos(xRotRad) * transformedCenter.x - sin(xRotRad) * transformedCenter.y + (x1 + x) / 2,
        y: sin(xRotRad) * transformedCenter.x + cos(xRotRad) * transformedCenter.y + (y1 + y) / 2,
    };
    var startVector = {
        x: (transformedPoint.x - transformedCenter.x) / rx,
        y: (transformedPoint.y - transformedCenter.y) / ry,
    };
    var startAngle = angleBetween({ x: 1, y: 0 }, startVector);
    var endVector = {
        x: (-transformedPoint.x - transformedCenter.x) / rx,
        y: (-transformedPoint.y - transformedCenter.y) / ry,
    };
    var sweepAngle = angleBetween(startVector, endVector);
    if (!SF && sweepAngle > 0) {
        sweepAngle -= 2 * PI;
    }
    else if (SF && sweepAngle < 0) {
        sweepAngle += 2 * PI;
    }
    sweepAngle %= 2 * PI;
    var alpha = startAngle + sweepAngle * t;
    var ellipseComponentX = rx * cos(alpha);
    var ellipseComponentY = ry * sin(alpha);
    var point = {
        x: cos(xRotRad) * ellipseComponentX - sin(xRotRad) * ellipseComponentY + center.x,
        y: sin(xRotRad) * ellipseComponentX + cos(xRotRad) * ellipseComponentY + center.y,
    };
    // to be used later
    // point.ellipticalArcStartAngle = startAngle;
    // point.ellipticalArcEndAngle = startAngle + sweepAngle;
    // point.ellipticalArcAngle = alpha;
    // point.ellipticalArcCenter = center;
    // point.resultantRx = rx;
    // point.resultantRy = ry;
    return point;
}
/**
 * Returns a {x,y} point at a given length, the total length and
 * the shape minimum and maximum {x,y} coordinates of an A (arc-to) segment.
 *
 * For better performance, it can skip calculate bbox or length in some scenario.
 */
function segmentArcFactory(X1, Y1, RX, RY, angle, LAF, SF, X2, Y2, distance, options) {
    var _a;
    var _b = options.bbox, bbox = _b === void 0 ? true : _b, _c = options.length, length = _c === void 0 ? true : _c, _d = options.sampleSize, sampleSize = _d === void 0 ? 30 : _d;
    var distanceIsNumber = typeof distance === 'number';
    var x = X1;
    var y = Y1;
    var LENGTH = 0;
    var prev = [x, y, LENGTH];
    var cur = [x, y];
    var t = 0;
    var POINT = { x: 0, y: 0 };
    var POINTS = [{ x: x, y: y }];
    if (distanceIsNumber && distance <= 0) {
        POINT = { x: x, y: y };
    }
    // bad perf when size > 100
    for (var j = 0; j <= sampleSize; j += 1) {
        t = j / sampleSize;
        (_a = getPointAtArcSegmentLength(X1, Y1, RX, RY, angle, LAF, SF, X2, Y2, t), x = _a.x, y = _a.y);
        if (bbox) {
            POINTS.push({ x: x, y: y });
        }
        if (length) {
            LENGTH += (0, distance_square_root_1.distanceSquareRoot)(cur, [x, y]);
        }
        cur = [x, y];
        if (distanceIsNumber && LENGTH >= distance && distance > prev[2]) {
            var dv = (LENGTH - distance) / (LENGTH - prev[2]);
            POINT = {
                x: cur[0] * (1 - dv) + prev[0] * dv,
                y: cur[1] * (1 - dv) + prev[1] * dv,
            };
        }
        prev = [x, y, LENGTH];
    }
    if (distanceIsNumber && distance >= LENGTH) {
        POINT = { x: X2, y: Y2 };
    }
    return {
        length: LENGTH,
        point: POINT,
        min: {
            x: Math.min.apply(null, POINTS.map(function (n) { return n.x; })),
            y: Math.min.apply(null, POINTS.map(function (n) { return n.y; })),
        },
        max: {
            x: Math.max.apply(null, POINTS.map(function (n) { return n.x; })),
            y: Math.max.apply(null, POINTS.map(function (n) { return n.y; })),
        },
    };
}
//# sourceMappingURL=segment-arc-factory.js.map
}, function(modId) { var map = {"./segment-line-factory":1729954662423,"./distance-square-root":1729954662424}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662426, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.segmentCubicFactory = segmentCubicFactory;
var distance_square_root_1 = require("./distance-square-root");
/**
 * Returns a {x,y} point at a given length, the total length and
 * the minimum and maximum {x,y} coordinates of a C (cubic-bezier) segment.
 */
function getPointAtCubicSegmentLength(x1, y1, c1x, c1y, c2x, c2y, x2, y2, t) {
    var t1 = 1 - t;
    return {
        x: Math.pow(t1, 3) * x1 + 3 * Math.pow(t1, 2) * t * c1x + 3 * t1 * Math.pow(t, 2) * c2x + Math.pow(t, 3) * x2,
        y: Math.pow(t1, 3) * y1 + 3 * Math.pow(t1, 2) * t * c1y + 3 * t1 * Math.pow(t, 2) * c2y + Math.pow(t, 3) * y2,
    };
}
/**
 * Returns the length of a C (cubic-bezier) segment
 * or an {x,y} point at a given length.
 */
function segmentCubicFactory(x1, y1, c1x, c1y, c2x, c2y, x2, y2, distance, options) {
    var _a;
    var _b = options.bbox, bbox = _b === void 0 ? true : _b, _c = options.length, length = _c === void 0 ? true : _c, _d = options.sampleSize, sampleSize = _d === void 0 ? 10 : _d;
    var distanceIsNumber = typeof distance === 'number';
    var x = x1;
    var y = y1;
    var LENGTH = 0;
    var prev = [x, y, LENGTH];
    var cur = [x, y];
    var t = 0;
    var POINT = { x: 0, y: 0 };
    var POINTS = [{ x: x, y: y }];
    if (distanceIsNumber && distance <= 0) {
        POINT = { x: x, y: y };
    }
    // bad perf when size = 300
    for (var j = 0; j <= sampleSize; j += 1) {
        t = j / sampleSize;
        (_a = getPointAtCubicSegmentLength(x1, y1, c1x, c1y, c2x, c2y, x2, y2, t), x = _a.x, y = _a.y);
        if (bbox) {
            POINTS.push({ x: x, y: y });
        }
        if (length) {
            LENGTH += (0, distance_square_root_1.distanceSquareRoot)(cur, [x, y]);
        }
        cur = [x, y];
        if (distanceIsNumber && LENGTH >= distance && distance > prev[2]) {
            var dv = (LENGTH - distance) / (LENGTH - prev[2]);
            POINT = {
                x: cur[0] * (1 - dv) + prev[0] * dv,
                y: cur[1] * (1 - dv) + prev[1] * dv,
            };
        }
        prev = [x, y, LENGTH];
    }
    if (distanceIsNumber && distance >= LENGTH) {
        POINT = { x: x2, y: y2 };
    }
    return {
        length: LENGTH,
        point: POINT,
        min: {
            x: Math.min.apply(null, POINTS.map(function (n) { return n.x; })),
            y: Math.min.apply(null, POINTS.map(function (n) { return n.y; })),
        },
        max: {
            x: Math.max.apply(null, POINTS.map(function (n) { return n.x; })),
            y: Math.max.apply(null, POINTS.map(function (n) { return n.y; })),
        },
    };
}
//# sourceMappingURL=segment-cubic-factory.js.map
}, function(modId) { var map = {"./distance-square-root":1729954662424}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662427, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.segmentQuadFactory = segmentQuadFactory;
var distance_square_root_1 = require("./distance-square-root");
/**
 * Returns the {x,y} coordinates of a point at a
 * given length of a quadratic-bezier segment.
 *
 * @see https://github.com/substack/point-at-length
 */
function getPointAtQuadSegmentLength(x1, y1, cx, cy, x2, y2, t) {
    var t1 = 1 - t;
    return {
        x: Math.pow(t1, 2) * x1 + 2 * t1 * t * cx + Math.pow(t, 2) * x2,
        y: Math.pow(t1, 2) * y1 + 2 * t1 * t * cy + Math.pow(t, 2) * y2,
    };
}
/**
 * Returns a {x,y} point at a given length, the total length and
 * the minimum and maximum {x,y} coordinates of a Q (quadratic-bezier) segment.
 */
function segmentQuadFactory(x1, y1, qx, qy, x2, y2, distance, options) {
    var _a;
    var _b = options.bbox, bbox = _b === void 0 ? true : _b, _c = options.length, length = _c === void 0 ? true : _c, _d = options.sampleSize, sampleSize = _d === void 0 ? 10 : _d;
    var distanceIsNumber = typeof distance === 'number';
    var x = x1;
    var y = y1;
    var LENGTH = 0;
    var prev = [x, y, LENGTH];
    var cur = [x, y];
    var t = 0;
    var POINT = { x: 0, y: 0 };
    var POINTS = [{ x: x, y: y }];
    if (distanceIsNumber && distance <= 0) {
        POINT = { x: x, y: y };
    }
    for (var j = 0; j <= sampleSize; j += 1) {
        t = j / sampleSize;
        (_a = getPointAtQuadSegmentLength(x1, y1, qx, qy, x2, y2, t), x = _a.x, y = _a.y);
        if (bbox) {
            POINTS.push({ x: x, y: y });
        }
        if (length) {
            LENGTH += (0, distance_square_root_1.distanceSquareRoot)(cur, [x, y]);
        }
        cur = [x, y];
        if (distanceIsNumber && LENGTH >= distance && distance > prev[2]) {
            var dv = (LENGTH - distance) / (LENGTH - prev[2]);
            POINT = {
                x: cur[0] * (1 - dv) + prev[0] * dv,
                y: cur[1] * (1 - dv) + prev[1] * dv,
            };
        }
        prev = [x, y, LENGTH];
    }
    /* istanbul ignore else */
    if (distanceIsNumber && distance >= LENGTH) {
        POINT = { x: x2, y: y2 };
    }
    return {
        length: LENGTH,
        point: POINT,
        min: {
            x: Math.min.apply(null, POINTS.map(function (n) { return n.x; })),
            y: Math.min.apply(null, POINTS.map(function (n) { return n.y; })),
        },
        max: {
            x: Math.max.apply(null, POINTS.map(function (n) { return n.x; })),
            y: Math.max.apply(null, POINTS.map(function (n) { return n.y; })),
        },
    };
}
//# sourceMappingURL=segment-quad-factory.js.map
}, function(modId) { var map = {"./distance-square-root":1729954662424}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662428, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.getTotalLength = getTotalLength;
var tslib_1 = require("tslib");
var path_length_factory_1 = require("./path-length-factory");
/**
 * Returns the shape total length, or the equivalent to `shape.getTotalLength()`.
 *
 * The `normalizePath` version is lighter, faster, more efficient and more accurate
 * with paths that are not `curveArray`.
 */
function getTotalLength(pathInput, options) {
    return (0, path_length_factory_1.pathLengthFactory)(pathInput, undefined, tslib_1.__assign(tslib_1.__assign({}, options), { bbox: false, length: true })).length;
}
//# sourceMappingURL=get-total-length.js.map
}, function(modId) { var map = {"./path-length-factory":1729954662422}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662429, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.getPathBBoxTotalLength = getPathBBoxTotalLength;
var tslib_1 = require("tslib");
var path_length_factory_1 = require("./path-length-factory");
/**
 * Returns the bounding box of a shape.
 */
function getPathBBoxTotalLength(path, options) {
    if (!path) {
        return {
            length: 0,
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            x2: 0,
            y2: 0,
            cx: 0,
            cy: 0,
            cz: 0,
        };
    }
    var _a = (0, path_length_factory_1.pathLengthFactory)(path, undefined, tslib_1.__assign(tslib_1.__assign({}, options), { bbox: true, length: true })), length = _a.length, _b = _a.min, xMin = _b.x, yMin = _b.y, _c = _a.max, xMax = _c.x, yMax = _c.y;
    var width = xMax - xMin;
    var height = yMax - yMin;
    return {
        length: length,
        width: width,
        height: height,
        x: xMin,
        y: yMin,
        x2: xMax,
        y2: yMax,
        cx: xMin + width / 2,
        cy: yMin + height / 2,
        // an estimted guess
        cz: Math.max(width, height) + Math.min(width, height) / 2,
    };
}
//# sourceMappingURL=get-path-bbox-total-length.js.map
}, function(modId) { var map = {"./path-length-factory":1729954662422}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662430, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.getRotatedCurve = getRotatedCurve;
var distance_square_root_1 = require("./distance-square-root");
function getRotations(a) {
    var segCount = a.length;
    var pointCount = segCount - 1;
    return a.map(function (f, idx) {
        return a.map(function (p, i) {
            var oldSegIdx = idx + i;
            var seg;
            if (i === 0 || (a[oldSegIdx] && a[oldSegIdx][0] === 'M')) {
                seg = a[oldSegIdx];
                return ['M'].concat(seg.slice(-2));
            }
            if (oldSegIdx >= segCount)
                oldSegIdx -= pointCount;
            return a[oldSegIdx];
        });
    });
}
function getRotatedCurve(a, b) {
    var segCount = a.length - 1;
    var lineLengths = [];
    var computedIndex = 0;
    var sumLensSqrd = 0;
    var rotations = getRotations(a);
    rotations.forEach(function (r, i) {
        a.slice(1).forEach(function (s, j) {
            // @ts-ignore
            sumLensSqrd += (0, distance_square_root_1.distanceSquareRoot)(a[(i + j) % segCount].slice(-2), b[j % segCount].slice(-2));
        });
        lineLengths[i] = sumLensSqrd;
        sumLensSqrd = 0;
    });
    computedIndex = lineLengths.indexOf(Math.min.apply(null, lineLengths));
    return rotations[computedIndex];
}
//# sourceMappingURL=get-rotated-curve.js.map
}, function(modId) { var map = {"./distance-square-root":1729954662424}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662431, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.getPathArea = getPathArea;
var path_2_curve_1 = require("../convert/path-2-curve");
/**
 * Returns the area of a single cubic-bezier segment.
 *
 * http://objectmix.com/graphics/133553-area-closed-bezier-curve.html
 */
function getCubicSegArea(x1, y1, c1x, c1y, c2x, c2y, x2, y2) {
    // https://stackoverflow.com/a/15845996
    return ((3 *
        ((y2 - y1) * (c1x + c2x) -
            (x2 - x1) * (c1y + c2y) +
            c1y * (x1 - c2x) -
            c1x * (y1 - c2y) +
            y2 * (c2x + x1 / 3) -
            x2 * (c2y + y1 / 3))) /
        20);
}
/**
 * Returns the area of a shape.
 * @author Jürg Lehni & Jonathan Puckey
 *
 * @see https://github.com/paperjs/paper.js/blob/develop/src/path/Path.js
 */
function getPathArea(path) {
    var x = 0;
    var y = 0;
    var len = 0;
    return (0, path_2_curve_1.path2Curve)(path)
        .map(function (seg) {
        var _a;
        switch (seg[0]) {
            case 'M':
                x = seg[1], y = seg[2];
                return 0;
            default:
                // @ts-ignore
                var _b = seg.slice(1), c1x = _b[0], c1y = _b[1], c2x = _b[2], c2y = _b[3], x2 = _b[4], y2 = _b[5];
                len = getCubicSegArea(x, y, c1x, c1y, c2x, c2y, x2, y2);
                _a = seg.slice(-2), x = _a[0], y = _a[1];
                return len;
        }
    })
        .reduce(function (a, b) { return a + b; }, 0);
}
// export function getPathArea(pathArray: AbsoluteArray) {
//   let x = 0;
//   let y = 0;
//   let mx = 0;
//   let my = 0;
//   let len = 0;
//   return pathArray
//     .map((seg) => {
//       switch (seg[0]) {
//         case 'M':
//         case 'Z':
//           mx = seg[0] === 'M' ? seg[1] : mx;
//           my = seg[0] === 'M' ? seg[2] : my;
//           x = mx;
//           y = my;
//           return 0;
//         default:
//           // @ts-ignore
//           len = getCubicSegArea.apply(0, [x, y].concat(seg.slice(1)));
//           [x, y] = seg.slice(-2) as [number, number];
//           return len;
//       }
//     })
//     .reduce((a, b) => a + b, 0);
// }
//# sourceMappingURL=get-path-area.js.map
}, function(modId) { var map = {"../convert/path-2-curve":1729954662390}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662432, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.getDrawDirection = getDrawDirection;
var get_path_area_1 = require("./get-path-area");
function getDrawDirection(pathArray) {
    return (0, get_path_area_1.getPathArea)(pathArray) >= 0;
}
//# sourceMappingURL=get-draw-direction.js.map
}, function(modId) { var map = {"./get-path-area":1729954662431}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662433, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.getPointAtLength = getPointAtLength;
var tslib_1 = require("tslib");
var path_length_factory_1 = require("./path-length-factory");
/**
 * Returns [x,y] coordinates of a point at a given length of a shape.
 */
function getPointAtLength(pathInput, distance, options) {
    return (0, path_length_factory_1.pathLengthFactory)(pathInput, distance, tslib_1.__assign(tslib_1.__assign({}, options), { bbox: false, length: true })).point;
}
//# sourceMappingURL=get-point-at-length.js.map
}, function(modId) { var map = {"./path-length-factory":1729954662422}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662434, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.isPointInStroke = isPointInStroke;
var get_properties_at_point_1 = require("./get-properties-at-point");
/**
 * Checks if a given point is in the stroke of a path.
 */
function isPointInStroke(pathInput, point) {
    var distance = (0, get_properties_at_point_1.getPropertiesAtPoint)(pathInput, point).distance;
    return Math.abs(distance) < 0.001; // 0.01 might be more permissive
}
//# sourceMappingURL=is-point-in-stroke.js.map
}, function(modId) { var map = {"./get-properties-at-point":1729954662435}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662435, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.getPropertiesAtPoint = getPropertiesAtPoint;
var parse_path_string_1 = require("../parser/parse-path-string");
var normalize_path_1 = require("../process/normalize-path");
var get_point_at_length_1 = require("./get-point-at-length");
var get_properties_at_length_1 = require("./get-properties-at-length");
var get_total_length_1 = require("./get-total-length");
/**
 * Returns the point and segment in path closest to a given point as well as
 * the distance to the path stroke.
 * @see https://bl.ocks.org/mbostock/8027637
 */
function getPropertiesAtPoint(pathInput, point) {
    var path = (0, parse_path_string_1.parsePathString)(pathInput);
    var normalPath = (0, normalize_path_1.normalizePath)(path);
    var pathLength = (0, get_total_length_1.getTotalLength)(path);
    var distanceTo = function (p) {
        var dx = p.x - point.x;
        var dy = p.y - point.y;
        return dx * dx + dy * dy;
    };
    var precision = 8;
    var scan;
    var scanDistance = 0;
    var closest;
    var bestLength = 0;
    var bestDistance = Infinity;
    // linear scan for coarse approximation
    for (var scanLength = 0; scanLength <= pathLength; scanLength += precision) {
        scan = (0, get_point_at_length_1.getPointAtLength)(normalPath, scanLength);
        scanDistance = distanceTo(scan);
        if (scanDistance < bestDistance) {
            closest = scan;
            bestLength = scanLength;
            bestDistance = scanDistance;
        }
    }
    // binary search for precise estimate
    precision /= 2;
    var before;
    var after;
    var beforeLength = 0;
    var afterLength = 0;
    var beforeDistance = 0;
    var afterDistance = 0;
    while (precision > 0.5) {
        beforeLength = bestLength - precision;
        before = (0, get_point_at_length_1.getPointAtLength)(normalPath, beforeLength);
        beforeDistance = distanceTo(before);
        afterLength = bestLength + precision;
        after = (0, get_point_at_length_1.getPointAtLength)(normalPath, afterLength);
        afterDistance = distanceTo(after);
        if (beforeLength >= 0 && beforeDistance < bestDistance) {
            closest = before;
            bestLength = beforeLength;
            bestDistance = beforeDistance;
        }
        else if (afterLength <= pathLength && afterDistance < bestDistance) {
            closest = after;
            bestLength = afterLength;
            bestDistance = afterDistance;
        }
        else {
            precision /= 2;
        }
    }
    var segment = (0, get_properties_at_length_1.getPropertiesAtLength)(path, bestLength);
    var distance = Math.sqrt(bestDistance);
    return { closest: closest, distance: distance, segment: segment };
}
//# sourceMappingURL=get-properties-at-point.js.map
}, function(modId) { var map = {"../parser/parse-path-string":1729954662399,"../process/normalize-path":1729954662393,"./get-point-at-length":1729954662433,"./get-properties-at-length":1729954662436,"./get-total-length":1729954662428}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662436, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.getPropertiesAtLength = getPropertiesAtLength;
var parse_path_string_1 = require("../parser/parse-path-string");
var get_total_length_1 = require("./get-total-length");
/**
 * Returns the segment, its index and length as well as
 * the length to that segment at a given length in a path.
 */
function getPropertiesAtLength(pathInput, distance) {
    var pathArray = (0, parse_path_string_1.parsePathString)(pathInput);
    if (typeof pathArray === 'string') {
        throw TypeError(pathArray);
    }
    var pathTemp = pathArray.slice();
    var pathLength = (0, get_total_length_1.getTotalLength)(pathTemp);
    var index = pathTemp.length - 1;
    var lengthAtSegment = 0;
    var length = 0;
    var segment = pathArray[0];
    var _a = segment.slice(-2), x = _a[0], y = _a[1];
    var point = { x: x, y: y };
    // If the path is empty, return 0.
    if (index <= 0 || !distance || !Number.isFinite(distance)) {
        return {
            segment: segment,
            index: 0,
            length: length,
            point: point,
            lengthAtSegment: lengthAtSegment,
        };
    }
    if (distance >= pathLength) {
        pathTemp = pathArray.slice(0, -1);
        lengthAtSegment = (0, get_total_length_1.getTotalLength)(pathTemp);
        length = pathLength - lengthAtSegment;
        return {
            segment: pathArray[index],
            index: index,
            length: length,
            lengthAtSegment: lengthAtSegment,
        };
    }
    var segments = [];
    while (index > 0) {
        segment = pathTemp[index];
        pathTemp = pathTemp.slice(0, -1);
        lengthAtSegment = (0, get_total_length_1.getTotalLength)(pathTemp);
        length = pathLength - lengthAtSegment;
        pathLength = lengthAtSegment;
        segments.push({
            segment: segment,
            index: index,
            length: length,
            lengthAtSegment: lengthAtSegment,
        });
        index -= 1;
    }
    return segments.find(function (_a) {
        var l = _a.lengthAtSegment;
        return l <= distance;
    });
}
//# sourceMappingURL=get-properties-at-length.js.map
}, function(modId) { var map = {"../parser/parse-path-string":1729954662399,"./get-total-length":1729954662428}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662437, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.equalizeSegments = equalizeSegments;
var mid_point_1 = require("./mid-point");
var segment_cubic_factory_1 = require("./segment-cubic-factory");
function splitCubic(pts, t) {
    if (t === void 0) { t = 0.5; }
    var p0 = pts.slice(0, 2);
    var p1 = pts.slice(2, 4);
    var p2 = pts.slice(4, 6);
    var p3 = pts.slice(6, 8);
    var p4 = (0, mid_point_1.midPoint)(p0, p1, t);
    var p5 = (0, mid_point_1.midPoint)(p1, p2, t);
    var p6 = (0, mid_point_1.midPoint)(p2, p3, t);
    var p7 = (0, mid_point_1.midPoint)(p4, p5, t);
    var p8 = (0, mid_point_1.midPoint)(p5, p6, t);
    var p9 = (0, mid_point_1.midPoint)(p7, p8, t);
    return [
        // @ts-ignore
        ['C'].concat(p4, p7, p9),
        // @ts-ignore
        ['C'].concat(p8, p6, p3),
    ];
}
function getCurveArray(segments) {
    return segments.map(function (segment, i, pathArray) {
        // @ts-ignore
        var segmentData = i && pathArray[i - 1].slice(-2).concat(segment.slice(1));
        // @ts-ignore
        var curveLength = i
            ? (0, segment_cubic_factory_1.segmentCubicFactory)(segmentData[0], segmentData[1], segmentData[2], segmentData[3], segmentData[4], segmentData[5], segmentData[6], segmentData[7], segmentData[8], { bbox: false }).length
            : 0;
        var subsegs;
        if (i) {
            // must be [segment,segment]
            subsegs = curveLength ? splitCubic(segmentData) : [segment, segment];
        }
        else {
            subsegs = [segment];
        }
        return {
            s: segment,
            ss: subsegs,
            l: curveLength,
        };
    });
}
function equalizeSegments(path1, path2, TL) {
    var c1 = getCurveArray(path1);
    var c2 = getCurveArray(path2);
    var L1 = c1.length;
    var L2 = c2.length;
    var l1 = c1.filter(function (x) { return x.l; }).length;
    var l2 = c2.filter(function (x) { return x.l; }).length;
    var m1 = c1.filter(function (x) { return x.l; }).reduce(function (a, _a) {
        var l = _a.l;
        return a + l;
    }, 0) / l1 || 0;
    var m2 = c2.filter(function (x) { return x.l; }).reduce(function (a, _a) {
        var l = _a.l;
        return a + l;
    }, 0) / l2 || 0;
    var tl = TL || Math.max(L1, L2);
    var mm = [m1, m2];
    var dif = [tl - L1, tl - L2];
    var canSplit = 0;
    var result = [c1, c2].map(function (x, i) {
        // @ts-ignore
        return x.l === tl
            ? x.map(function (y) { return y.s; })
            : x
                .map(function (y, j) {
                canSplit = j && dif[i] && y.l >= mm[i];
                dif[i] -= canSplit ? 1 : 0;
                return canSplit ? y.ss : [y.s];
            })
                .flat();
    });
    return result[0].length === result[1].length ? result : equalizeSegments(result[0], result[1], tl);
}
//# sourceMappingURL=equalize-segments.js.map
}, function(modId) { var map = {"./mid-point":1729954662417,"./segment-cubic-factory":1729954662426}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662438, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
//# sourceMappingURL=types.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662439, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.isPolygonsIntersect = exports.isPointInPolygon = void 0;
var is_point_in_polygon_1 = require("./is-point-in-polygon");
Object.defineProperty(exports, "isPointInPolygon", { enumerable: true, get: function () { return is_point_in_polygon_1.isPointInPolygon; } });
var is_polygons_intersect_1 = require("./is-polygons-intersect");
Object.defineProperty(exports, "isPolygonsIntersect", { enumerable: true, get: function () { return is_polygons_intersect_1.isPolygonsIntersect; } });
//# sourceMappingURL=index.js.map
}, function(modId) { var map = {"./is-point-in-polygon":1729954662440,"./is-polygons-intersect":1729954662441}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662440, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.isPointInPolygon = isPointInPolygon;
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
function isPointInPolygon(points, x, y) {
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
//# sourceMappingURL=is-point-in-polygon.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662441, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.isPolygonsIntersect = isPolygonsIntersect;
var is_point_in_polygon_1 = require("./is-point-in-polygon");
var isBetween = function (value, min, max) { return value >= min && value <= max; };
function getLineIntersect(p0, p1, p2, p3) {
    var tolerance = 0.001;
    var E = {
        x: p2.x - p0.x,
        y: p2.y - p0.y,
    };
    var D0 = {
        x: p1.x - p0.x,
        y: p1.y - p0.y,
    };
    var D1 = {
        x: p3.x - p2.x,
        y: p3.y - p2.y,
    };
    var kross = D0.x * D1.y - D0.y * D1.x;
    var sqrKross = kross * kross;
    var sqrLen0 = D0.x * D0.x + D0.y * D0.y;
    var sqrLen1 = D1.x * D1.x + D1.y * D1.y;
    var point = null;
    if (sqrKross > tolerance * sqrLen0 * sqrLen1) {
        var s = (E.x * D1.y - E.y * D1.x) / kross;
        var t = (E.x * D0.y - E.y * D0.x) / kross;
        if (isBetween(s, 0, 1) && isBetween(t, 0, 1)) {
            point = {
                x: p0.x + s * D0.x,
                y: p0.y + s * D0.y,
            };
        }
    }
    return point;
}
function parseToLines(points) {
    var lines = [];
    var count = points.length;
    for (var i = 0; i < count - 1; i++) {
        var point = points[i];
        var next = points[i + 1];
        lines.push({
            from: {
                x: point[0],
                y: point[1],
            },
            to: {
                x: next[0],
                y: next[1],
            },
        });
    }
    if (lines.length > 1) {
        var first = points[0];
        var last = points[count - 1];
        lines.push({
            from: {
                x: last[0],
                y: last[1],
            },
            to: {
                x: first[0],
                y: first[1],
            },
        });
    }
    return lines;
}
function lineIntersectPolygon(lines, line) {
    var isIntersect = false;
    lines.forEach(function (l) {
        if (getLineIntersect(l.from, l.to, line.from, line.to)) {
            isIntersect = true;
            return false;
        }
    });
    return isIntersect;
}
function getBBox(points) {
    var xArr = points.map(function (p) { return p[0]; });
    var yArr = points.map(function (p) { return p[1]; });
    return {
        minX: Math.min.apply(null, xArr),
        maxX: Math.max.apply(null, xArr),
        minY: Math.min.apply(null, yArr),
        maxY: Math.max.apply(null, yArr),
    };
}
function intersectBBox(box1, box2) {
    return !(box2.minX > box1.maxX || box2.maxX < box1.minX || box2.minY > box1.maxY || box2.maxY < box1.minY);
}
/**
 * @see https://stackoverflow.com/questions/753140/how-do-i-determine-if-two-convex-polygons-intersect
 */
function isPolygonsIntersect(points1, points2) {
    // 空数组，或者一个点返回 false
    if (points1.length < 2 || points2.length < 2) {
        return false;
    }
    var bbox1 = getBBox(points1);
    var bbox2 = getBBox(points2);
    // 判定包围盒是否相交，比判定点是否在多边形内要快的多，可以筛选掉大多数情况
    if (!intersectBBox(bbox1, bbox2)) {
        return false;
    }
    var isIn = false;
    // 判定点是否在多边形内部，一旦有一个点在另一个多边形内，则返回
    points2.forEach(function (point) {
        if ((0, is_point_in_polygon_1.isPointInPolygon)(points1, point[0], point[1])) {
            isIn = true;
            return false;
        }
    });
    if (isIn) {
        return true;
    }
    // 两个多边形都需要判定
    points1.forEach(function (point) {
        if ((0, is_point_in_polygon_1.isPointInPolygon)(points2, point[0], point[1])) {
            isIn = true;
            return false;
        }
    });
    if (isIn) {
        return true;
    }
    var lines1 = parseToLines(points1);
    var lines2 = parseToLines(points2);
    var isIntersect = false;
    lines2.forEach(function (line) {
        if (lineIntersectPolygon(lines1, line)) {
            isIntersect = true;
            return false;
        }
    });
    return isIntersect;
}
//# sourceMappingURL=is-polygons-intersect.js.map
}, function(modId) { var map = {"./is-point-in-polygon":1729954662440}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662442, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.modifyCSS = exports.createDOM = void 0;
var create_dom_1 = require("./create-dom");
Object.defineProperty(exports, "createDOM", { enumerable: true, get: function () { return create_dom_1.createDOM; } });
var modify_css_1 = require("./modify-css");
Object.defineProperty(exports, "modifyCSS", { enumerable: true, get: function () { return modify_css_1.modifyCSS; } });
//# sourceMappingURL=index.js.map
}, function(modId) { var map = {"./create-dom":1729954662443,"./modify-css":1729954662444}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662443, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.createDOM = createDOM;
/**
 * Create DOM from a html string.
 * @param str
 * @returns
 */
function createDOM(str) {
    var container = document.createElement('div');
    container.innerHTML = str;
    var dom = container.childNodes[0];
    if (dom && container.contains(dom)) {
        container.removeChild(dom);
    }
    return dom;
}
//# sourceMappingURL=create-dom.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1729954662444, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.modifyCSS = modifyCSS;
/**
 * Modify the CSS of a DOM.
 * @param dom
 * @param css
 * @returns
 */
function modifyCSS(dom, css) {
    if (!dom)
        return;
    Object.keys(css).forEach(function (key) {
        dom.style[key] = css[key];
    });
    return dom;
}
//# sourceMappingURL=modify-css.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1729954662266);
})()
//miniprogram-npm-outsideDeps=["tslib","gl-matrix"]
//# sourceMappingURL=index.js.map