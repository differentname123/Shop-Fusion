module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1728739681092, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _utils = require("@jimp/utils");

var _blurTables = require("./blur-tables");

/*
    Superfast Blur (0.5)
    http://www.quasimondo.com/BoxBlurForCanvas/FastBlur.js

    Copyright (c) 2011 Mario Klingemann

    Permission is hereby granted, free of charge, to any person
    obtaining a copy of this software and associated documentation
    files (the "Software"), to deal in the Software without
    restriction, including without limitation the rights to use,
    copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the
    Software is furnished to do so, subject to the following
    conditions:

    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
    OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
    HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
    WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
    FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
    OTHER DEALINGS IN THE SOFTWARE.
*/
var _default = function _default() {
  return {
    /**
     * A fast blur algorithm that produces similar effect to a Gaussian blur - but MUCH quicker
     * @param {number} r the pixel radius of the blur
     * @param {function(Error, Jimp)} cb (optional) a callback for when complete
     * @returns {Jimp} this for chaining of methods
     */
    blur: function blur(r, cb) {
      if (typeof r !== "number") return _utils.throwError.call(this, "r must be a number", cb);
      if (r < 1) return _utils.throwError.call(this, "r must be greater than 0", cb);
      var rsum;
      var gsum;
      var bsum;
      var asum;
      var x;
      var y;
      var i;
      var p;
      var p1;
      var p2;
      var yp;
      var yi;
      var yw;
      var pa;
      var wm = this.bitmap.width - 1;
      var hm = this.bitmap.height - 1; // const wh = this.bitmap.width * this.bitmap.height;

      var rad1 = r + 1;
      var mulSum = _blurTables.mulTable[r];
      var shgSum = _blurTables.shgTable[r];
      var red = [];
      var green = [];
      var blue = [];
      var alpha = [];
      var vmin = [];
      var vmax = [];
      var iterations = 2;

      while (iterations-- > 0) {
        yi = 0;
        yw = 0;

        for (y = 0; y < this.bitmap.height; y++) {
          rsum = this.bitmap.data[yw] * rad1;
          gsum = this.bitmap.data[yw + 1] * rad1;
          bsum = this.bitmap.data[yw + 2] * rad1;
          asum = this.bitmap.data[yw + 3] * rad1;

          for (i = 1; i <= r; i++) {
            p = yw + ((i > wm ? wm : i) << 2);
            rsum += this.bitmap.data[p++];
            gsum += this.bitmap.data[p++];
            bsum += this.bitmap.data[p++];
            asum += this.bitmap.data[p];
          }

          for (x = 0; x < this.bitmap.width; x++) {
            red[yi] = rsum;
            green[yi] = gsum;
            blue[yi] = bsum;
            alpha[yi] = asum;

            if (y === 0) {
              vmin[x] = ((p = x + rad1) < wm ? p : wm) << 2;
              vmax[x] = (p = x - r) > 0 ? p << 2 : 0;
            }

            p1 = yw + vmin[x];
            p2 = yw + vmax[x];
            rsum += this.bitmap.data[p1++] - this.bitmap.data[p2++];
            gsum += this.bitmap.data[p1++] - this.bitmap.data[p2++];
            bsum += this.bitmap.data[p1++] - this.bitmap.data[p2++];
            asum += this.bitmap.data[p1] - this.bitmap.data[p2];
            yi++;
          }

          yw += this.bitmap.width << 2;
        }

        for (x = 0; x < this.bitmap.width; x++) {
          yp = x;
          rsum = red[yp] * rad1;
          gsum = green[yp] * rad1;
          bsum = blue[yp] * rad1;
          asum = alpha[yp] * rad1;

          for (i = 1; i <= r; i++) {
            yp += i > hm ? 0 : this.bitmap.width;
            rsum += red[yp];
            gsum += green[yp];
            bsum += blue[yp];
            asum += alpha[yp];
          }

          yi = x << 2;

          for (y = 0; y < this.bitmap.height; y++) {
            pa = asum * mulSum >>> shgSum;
            this.bitmap.data[yi + 3] = pa; // normalize alpha

            if (pa > 255) {
              this.bitmap.data[yi + 3] = 255;
            }

            if (pa > 0) {
              pa = 255 / pa;
              this.bitmap.data[yi] = (rsum * mulSum >>> shgSum) * pa;
              this.bitmap.data[yi + 1] = (gsum * mulSum >>> shgSum) * pa;
              this.bitmap.data[yi + 2] = (bsum * mulSum >>> shgSum) * pa;
            } else {
              this.bitmap.data[yi + 2] = 0;
              this.bitmap.data[yi + 1] = 0;
              this.bitmap.data[yi] = 0;
            }

            if (x === 0) {
              vmin[y] = ((p = y + rad1) < hm ? p : hm) * this.bitmap.width;
              vmax[y] = (p = y - r) > 0 ? p * this.bitmap.width : 0;
            }

            p1 = x + vmin[y];
            p2 = x + vmax[y];
            rsum += red[p1] - red[p2];
            gsum += green[p1] - green[p2];
            bsum += blue[p1] - blue[p2];
            asum += alpha[p1] - alpha[p2];
            yi += this.bitmap.width << 2;
          }
        }
      }

      if ((0, _utils.isNodePattern)(cb)) {
        cb.call(this, null, this);
      }

      return this;
    }
  };
};

exports["default"] = _default;
module.exports = exports.default;
//# sourceMappingURL=index.js.map
}, function(modId) {var map = {"./blur-tables":1728739681093}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1728739681093, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.shgTable = exports.mulTable = void 0;
var mulTable = [1, 57, 41, 21, 203, 34, 97, 73, 227, 91, 149, 62, 105, 45, 39, 137, 241, 107, 3, 173, 39, 71, 65, 238, 219, 101, 187, 87, 81, 151, 141, 133, 249, 117, 221, 209, 197, 187, 177, 169, 5, 153, 73, 139, 133, 127, 243, 233, 223, 107, 103, 99, 191, 23, 177, 171, 165, 159, 77, 149, 9, 139, 135, 131, 253, 245, 119, 231, 224, 109, 211, 103, 25, 195, 189, 23, 45, 175, 171, 83, 81, 79, 155, 151, 147, 9, 141, 137, 67, 131, 129, 251, 123, 30, 235, 115, 113, 221, 217, 53, 13, 51, 50, 49, 193, 189, 185, 91, 179, 175, 43, 169, 83, 163, 5, 79, 155, 19, 75, 147, 145, 143, 35, 69, 17, 67, 33, 65, 255, 251, 247, 243, 239, 59, 29, 229, 113, 111, 219, 27, 213, 105, 207, 51, 201, 199, 49, 193, 191, 47, 93, 183, 181, 179, 11, 87, 43, 85, 167, 165, 163, 161, 159, 157, 155, 77, 19, 75, 37, 73, 145, 143, 141, 35, 138, 137, 135, 67, 33, 131, 129, 255, 63, 250, 247, 61, 121, 239, 237, 117, 29, 229, 227, 225, 111, 55, 109, 216, 213, 211, 209, 207, 205, 203, 201, 199, 197, 195, 193, 48, 190, 47, 93, 185, 183, 181, 179, 178, 176, 175, 173, 171, 85, 21, 167, 165, 41, 163, 161, 5, 79, 157, 78, 154, 153, 19, 75, 149, 74, 147, 73, 144, 143, 71, 141, 140, 139, 137, 17, 135, 134, 133, 66, 131, 65, 129, 1];
exports.mulTable = mulTable;
var shgTable = [0, 9, 10, 10, 14, 12, 14, 14, 16, 15, 16, 15, 16, 15, 15, 17, 18, 17, 12, 18, 16, 17, 17, 19, 19, 18, 19, 18, 18, 19, 19, 19, 20, 19, 20, 20, 20, 20, 20, 20, 15, 20, 19, 20, 20, 20, 21, 21, 21, 20, 20, 20, 21, 18, 21, 21, 21, 21, 20, 21, 17, 21, 21, 21, 22, 22, 21, 22, 22, 21, 22, 21, 19, 22, 22, 19, 20, 22, 22, 21, 21, 21, 22, 22, 22, 18, 22, 22, 21, 22, 22, 23, 22, 20, 23, 22, 22, 23, 23, 21, 19, 21, 21, 21, 23, 23, 23, 22, 23, 23, 21, 23, 22, 23, 18, 22, 23, 20, 22, 23, 23, 23, 21, 22, 20, 22, 21, 22, 24, 24, 24, 24, 24, 22, 21, 24, 23, 23, 24, 21, 24, 23, 24, 22, 24, 24, 22, 24, 24, 22, 23, 24, 24, 24, 20, 23, 22, 23, 24, 24, 24, 24, 24, 24, 24, 23, 21, 23, 22, 23, 24, 24, 24, 22, 24, 24, 24, 23, 22, 24, 24, 25, 23, 25, 25, 23, 24, 25, 25, 24, 22, 25, 25, 25, 24, 23, 24, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 23, 25, 23, 24, 25, 25, 25, 25, 25, 25, 25, 25, 25, 24, 22, 25, 25, 23, 25, 25, 20, 24, 25, 24, 25, 25, 22, 24, 25, 24, 25, 24, 25, 25, 24, 25, 25, 25, 25, 22, 25, 25, 25, 24, 25, 24, 25, 18];
exports.shgTable = shgTable;
//# sourceMappingURL=blur-tables.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1728739681092);
})()
//miniprogram-npm-outsideDeps=["@jimp/utils"]
//# sourceMappingURL=index.js.map