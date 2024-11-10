module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1731211820586, function(require, module, exports) {


var tslib = require('tslib');
var gLite = require('@antv/g-lite');

/**
 * pick shape(s) with Mouse/Touch event
 *
 * 1. find AABB with r-tree
 * 2. use elementFromPoint
 */
var SVGPickerPlugin = /** @class */ (function () {
    function SVGPickerPlugin() {
    }
    SVGPickerPlugin.prototype.apply = function (context, runtime) {
        var _this = this;
        var doc = context.config.document, renderingService = context.renderingService, 
        // @ts-ignore
        svgElementMap = context.svgElementMap;
        renderingService.hooks.pick.tapPromise(SVGPickerPlugin.tag, function (result) { return tslib.__awaiter(_this, void 0, void 0, function () {
            return tslib.__generator(this, function (_a) {
                return [2 /*return*/, this.pick(svgElementMap, doc, result)];
            });
        }); });
        renderingService.hooks.pickSync.tap(SVGPickerPlugin.tag, function (result) {
            return _this.pick(svgElementMap, doc, result);
        });
    };
    SVGPickerPlugin.prototype.pick = function (svgElementMap, doc, result) {
        var e_1, _a;
        var topmost = result.topmost, _b = result.position, clientX = _b.clientX, clientY = _b.clientY;
        try {
            var targets = [];
            try {
                // @see https://developer.mozilla.org/zh-CN/docs/Web/API/Document/elementsFromPoint
                for (var _c = tslib.__values((doc || document).elementsFromPoint(clientX, clientY)), _d = _c.next(); !_d.done; _d = _c.next()) {
                    var element = _d.value;
                    if (element.shadowRoot && element.shadowRoot !== doc) {
                        return this.pick(svgElementMap, element.shadowRoot, result);
                    }
                    else {
                        var target = svgElementMap.get(element);
                        // don't need to account for `visibility` since DOM API already does
                        if (target && target.isInteractive()) {
                            targets.push(target);
                            if (topmost) {
                                result.picked = targets;
                                return result;
                            }
                        }
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                }
                finally { if (e_1) throw e_1.error; }
            }
            result.picked = targets;
        }
        catch (e) {
            result.picked = [];
        }
        return result;
    };
    SVGPickerPlugin.tag = 'SVGPicker';
    return SVGPickerPlugin;
}());

var Plugin = /** @class */ (function (_super) {
    tslib.__extends(Plugin, _super);
    function Plugin() {
        var _this = _super.apply(this, tslib.__spreadArray([], tslib.__read(arguments), false)) || this;
        _this.name = 'svg-picker';
        return _this;
    }
    Plugin.prototype.init = function () {
        this.addRenderingPlugin(new SVGPickerPlugin());
    };
    Plugin.prototype.destroy = function () {
        this.removeAllRenderingPlugins();
    };
    return Plugin;
}(gLite.AbstractRendererPlugin));

exports.Plugin = Plugin;
//# sourceMappingURL=index.js.map

}, function(modId) {var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1731211820586);
})()
//miniprogram-npm-outsideDeps=["tslib","@antv/g-lite"]
//# sourceMappingURL=index.js.map