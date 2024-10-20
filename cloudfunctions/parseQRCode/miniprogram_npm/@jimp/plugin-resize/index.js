module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1728739681109, function(require, module, exports) {


var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _utils = require("@jimp/utils");

var _resize = _interopRequireDefault(require("./modules/resize"));

var _resize2 = _interopRequireDefault(require("./modules/resize2"));

var _default = function _default() {
  return {
    constants: {
      RESIZE_NEAREST_NEIGHBOR: "nearestNeighbor",
      RESIZE_BILINEAR: "bilinearInterpolation",
      RESIZE_BICUBIC: "bicubicInterpolation",
      RESIZE_HERMITE: "hermiteInterpolation",
      RESIZE_BEZIER: "bezierInterpolation"
    },
    "class": {
      /**
       * Resizes the image to a set width and height using a 2-pass bilinear algorithm
       * @param {number} w the width to resize the image to (or Jimp.AUTO)
       * @param {number} h the height to resize the image to (or Jimp.AUTO)
       * @param {string} mode (optional) a scaling method (e.g. Jimp.RESIZE_BEZIER)
       * @param {function(Error, Jimp)} cb (optional) a callback for when complete
       * @returns {Jimp} this for chaining of methods
       */
      resize: function resize(w, h, mode, cb) {
        if (typeof w !== "number" || typeof h !== "number") {
          return _utils.throwError.call(this, "w and h must be numbers", cb);
        }

        if (typeof mode === "function" && typeof cb === "undefined") {
          cb = mode;
          mode = null;
        }

        if (w === this.constructor.AUTO && h === this.constructor.AUTO) {
          return _utils.throwError.call(this, "w and h cannot both be set to auto", cb);
        }

        if (w === this.constructor.AUTO) {
          w = this.bitmap.width * (h / this.bitmap.height);
        }

        if (h === this.constructor.AUTO) {
          h = this.bitmap.height * (w / this.bitmap.width);
        }

        if (w < 0 || h < 0) {
          return _utils.throwError.call(this, "w and h must be positive numbers", cb);
        } // round inputs


        w = Math.round(w);
        h = Math.round(h);

        if (typeof _resize2["default"][mode] === "function") {
          var dst = {
            data: Buffer.alloc(w * h * 4),
            width: w,
            height: h
          };

          _resize2["default"][mode](this.bitmap, dst);

          this.bitmap = dst;
        } else {
          var image = this;
          var resize = new _resize["default"](this.bitmap.width, this.bitmap.height, w, h, true, true, function (buffer) {
            image.bitmap.data = Buffer.from(buffer);
            image.bitmap.width = w;
            image.bitmap.height = h;
          });
          resize.resize(this.bitmap.data);
        }

        if ((0, _utils.isNodePattern)(cb)) {
          cb.call(this, null, this);
        }

        return this;
      }
    }
  };
};

exports["default"] = _default;
module.exports = exports.default;
//# sourceMappingURL=index.js.map
}, function(modId) {var map = {"./modules/resize":1728739681110,"./modules/resize2":1728739681111}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1728739681110, function(require, module, exports) {


// JavaScript Image Resizer (c) 2012 - Grant Galitz
// Released to public domain 29 July 2013: https://github.com/grantgalitz/JS-Image-Resizer/issues/4
function Resize(widthOriginal, heightOriginal, targetWidth, targetHeight, blendAlpha, interpolationPass, resizeCallback) {
  this.widthOriginal = Math.abs(Math.floor(widthOriginal) || 0);
  this.heightOriginal = Math.abs(Math.floor(heightOriginal) || 0);
  this.targetWidth = Math.abs(Math.floor(targetWidth) || 0);
  this.targetHeight = Math.abs(Math.floor(targetHeight) || 0);
  this.colorChannels = blendAlpha ? 4 : 3;
  this.interpolationPass = Boolean(interpolationPass);
  this.resizeCallback = typeof resizeCallback === "function" ? resizeCallback : function () {};
  this.targetWidthMultipliedByChannels = this.targetWidth * this.colorChannels;
  this.originalWidthMultipliedByChannels = this.widthOriginal * this.colorChannels;
  this.originalHeightMultipliedByChannels = this.heightOriginal * this.colorChannels;
  this.widthPassResultSize = this.targetWidthMultipliedByChannels * this.heightOriginal;
  this.finalResultSize = this.targetWidthMultipliedByChannels * this.targetHeight;
  this.initialize();
}

Resize.prototype.initialize = function () {
  // Perform some checks:
  if (this.widthOriginal > 0 && this.heightOriginal > 0 && this.targetWidth > 0 && this.targetHeight > 0) {
    this.configurePasses();
  } else {
    throw new Error("Invalid settings specified for the resizer.");
  }
};

Resize.prototype.configurePasses = function () {
  if (this.widthOriginal === this.targetWidth) {
    // Bypass the width resizer pass:
    this.resizeWidth = this.bypassResizer;
  } else {
    // Setup the width resizer pass:
    this.ratioWeightWidthPass = this.widthOriginal / this.targetWidth;

    if (this.ratioWeightWidthPass < 1 && this.interpolationPass) {
      this.initializeFirstPassBuffers(true);
      this.resizeWidth = this.colorChannels === 4 ? this.resizeWidthInterpolatedRGBA : this.resizeWidthInterpolatedRGB;
    } else {
      this.initializeFirstPassBuffers(false);
      this.resizeWidth = this.colorChannels === 4 ? this.resizeWidthRGBA : this.resizeWidthRGB;
    }
  }

  if (this.heightOriginal === this.targetHeight) {
    // Bypass the height resizer pass:
    this.resizeHeight = this.bypassResizer;
  } else {
    // Setup the height resizer pass:
    this.ratioWeightHeightPass = this.heightOriginal / this.targetHeight;

    if (this.ratioWeightHeightPass < 1 && this.interpolationPass) {
      this.initializeSecondPassBuffers(true);
      this.resizeHeight = this.resizeHeightInterpolated;
    } else {
      this.initializeSecondPassBuffers(false);
      this.resizeHeight = this.colorChannels === 4 ? this.resizeHeightRGBA : this.resizeHeightRGB;
    }
  }
};

Resize.prototype._resizeWidthInterpolatedRGBChannels = function (buffer, fourthChannel) {
  var channelsNum = fourthChannel ? 4 : 3;
  var ratioWeight = this.ratioWeightWidthPass;
  var outputBuffer = this.widthBuffer;
  var weight = 0;
  var finalOffset = 0;
  var pixelOffset = 0;
  var firstWeight = 0;
  var secondWeight = 0;
  var targetPosition; // Handle for only one interpolation input being valid for start calculation:

  for (targetPosition = 0; weight < 1 / 3; targetPosition += channelsNum, weight += ratioWeight) {
    for (finalOffset = targetPosition, pixelOffset = 0; finalOffset < this.widthPassResultSize; pixelOffset += this.originalWidthMultipliedByChannels, finalOffset += this.targetWidthMultipliedByChannels) {
      outputBuffer[finalOffset] = buffer[pixelOffset];
      outputBuffer[finalOffset + 1] = buffer[pixelOffset + 1];
      outputBuffer[finalOffset + 2] = buffer[pixelOffset + 2];
      if (fourthChannel) outputBuffer[finalOffset + 3] = buffer[pixelOffset + 3];
    }
  } // Adjust for overshoot of the last pass's counter:


  weight -= 1 / 3;
  var interpolationWidthSourceReadStop;

  for (interpolationWidthSourceReadStop = this.widthOriginal - 1; weight < interpolationWidthSourceReadStop; targetPosition += channelsNum, weight += ratioWeight) {
    // Calculate weightings:
    secondWeight = weight % 1;
    firstWeight = 1 - secondWeight; // Interpolate:

    for (finalOffset = targetPosition, pixelOffset = Math.floor(weight) * channelsNum; finalOffset < this.widthPassResultSize; pixelOffset += this.originalWidthMultipliedByChannels, finalOffset += this.targetWidthMultipliedByChannels) {
      outputBuffer[finalOffset + 0] = buffer[pixelOffset + 0] * firstWeight + buffer[pixelOffset + channelsNum + 0] * secondWeight;
      outputBuffer[finalOffset + 1] = buffer[pixelOffset + 1] * firstWeight + buffer[pixelOffset + channelsNum + 1] * secondWeight;
      outputBuffer[finalOffset + 2] = buffer[pixelOffset + 2] * firstWeight + buffer[pixelOffset + channelsNum + 2] * secondWeight;
      if (fourthChannel) outputBuffer[finalOffset + 3] = buffer[pixelOffset + 3] * firstWeight + buffer[pixelOffset + channelsNum + 3] * secondWeight;
    }
  } // Handle for only one interpolation input being valid for end calculation:


  for (interpolationWidthSourceReadStop = this.originalWidthMultipliedByChannels - channelsNum; targetPosition < this.targetWidthMultipliedByChannels; targetPosition += channelsNum) {
    for (finalOffset = targetPosition, pixelOffset = interpolationWidthSourceReadStop; finalOffset < this.widthPassResultSize; pixelOffset += this.originalWidthMultipliedByChannels, finalOffset += this.targetWidthMultipliedByChannels) {
      outputBuffer[finalOffset] = buffer[pixelOffset];
      outputBuffer[finalOffset + 1] = buffer[pixelOffset + 1];
      outputBuffer[finalOffset + 2] = buffer[pixelOffset + 2];
      if (fourthChannel) outputBuffer[finalOffset + 3] = buffer[pixelOffset + 3];
    }
  }

  return outputBuffer;
};

Resize.prototype._resizeWidthRGBChannels = function (buffer, fourthChannel) {
  var channelsNum = fourthChannel ? 4 : 3;
  var ratioWeight = this.ratioWeightWidthPass;
  var ratioWeightDivisor = 1 / ratioWeight;
  var nextLineOffsetOriginalWidth = this.originalWidthMultipliedByChannels - channelsNum + 1;
  var nextLineOffsetTargetWidth = this.targetWidthMultipliedByChannels - channelsNum + 1;
  var output = this.outputWidthWorkBench;
  var outputBuffer = this.widthBuffer;
  var trustworthyColorsCount = this.outputWidthWorkBenchOpaquePixelsCount;
  var weight = 0;
  var amountToNext = 0;
  var actualPosition = 0;
  var currentPosition = 0;
  var line = 0;
  var pixelOffset = 0;
  var outputOffset = 0;
  var multiplier = 1;
  var r = 0;
  var g = 0;
  var b = 0;
  var a = 0;

  do {
    for (line = 0; line < this.originalHeightMultipliedByChannels;) {
      output[line++] = 0;
      output[line++] = 0;
      output[line++] = 0;

      if (fourthChannel) {
        output[line++] = 0;
        trustworthyColorsCount[line / channelsNum - 1] = 0;
      }
    }

    weight = ratioWeight;

    do {
      amountToNext = 1 + actualPosition - currentPosition;
      multiplier = Math.min(weight, amountToNext);

      for (line = 0, pixelOffset = actualPosition; line < this.originalHeightMultipliedByChannels; pixelOffset += nextLineOffsetOriginalWidth) {
        r = buffer[pixelOffset];
        g = buffer[++pixelOffset];
        b = buffer[++pixelOffset];
        a = fourthChannel ? buffer[++pixelOffset] : 255; // Ignore RGB values if pixel is completely transparent

        output[line++] += (a ? r : 0) * multiplier;
        output[line++] += (a ? g : 0) * multiplier;
        output[line++] += (a ? b : 0) * multiplier;

        if (fourthChannel) {
          output[line++] += a * multiplier;
          trustworthyColorsCount[line / channelsNum - 1] += a ? multiplier : 0;
        }
      }

      if (weight >= amountToNext) {
        actualPosition += channelsNum;
        currentPosition = actualPosition;
        weight -= amountToNext;
      } else {
        currentPosition += weight;
        break;
      }
    } while (weight > 0 && actualPosition < this.originalWidthMultipliedByChannels);

    for (line = 0, pixelOffset = outputOffset; line < this.originalHeightMultipliedByChannels; pixelOffset += nextLineOffsetTargetWidth) {
      weight = fourthChannel ? trustworthyColorsCount[line / channelsNum] : 1;
      multiplier = fourthChannel ? weight ? 1 / weight : 0 : ratioWeightDivisor;
      outputBuffer[pixelOffset] = output[line++] * multiplier;
      outputBuffer[++pixelOffset] = output[line++] * multiplier;
      outputBuffer[++pixelOffset] = output[line++] * multiplier;
      if (fourthChannel) outputBuffer[++pixelOffset] = output[line++] * ratioWeightDivisor;
    }

    outputOffset += channelsNum;
  } while (outputOffset < this.targetWidthMultipliedByChannels);

  return outputBuffer;
};

Resize.prototype._resizeHeightRGBChannels = function (buffer, fourthChannel) {
  var ratioWeight = this.ratioWeightHeightPass;
  var ratioWeightDivisor = 1 / ratioWeight;
  var output = this.outputHeightWorkBench;
  var outputBuffer = this.heightBuffer;
  var trustworthyColorsCount = this.outputHeightWorkBenchOpaquePixelsCount;
  var weight = 0;
  var amountToNext = 0;
  var actualPosition = 0;
  var currentPosition = 0;
  var pixelOffset = 0;
  var outputOffset = 0;
  var caret = 0;
  var multiplier = 1;
  var r = 0;
  var g = 0;
  var b = 0;
  var a = 0;

  do {
    for (pixelOffset = 0; pixelOffset < this.targetWidthMultipliedByChannels;) {
      output[pixelOffset++] = 0;
      output[pixelOffset++] = 0;
      output[pixelOffset++] = 0;

      if (fourthChannel) {
        output[pixelOffset++] = 0;
        trustworthyColorsCount[pixelOffset / 4 - 1] = 0;
      }
    }

    weight = ratioWeight;

    do {
      amountToNext = 1 + actualPosition - currentPosition;
      multiplier = Math.min(weight, amountToNext);
      caret = actualPosition;

      for (pixelOffset = 0; pixelOffset < this.targetWidthMultipliedByChannels;) {
        r = buffer[caret++];
        g = buffer[caret++];
        b = buffer[caret++];
        a = fourthChannel ? buffer[caret++] : 255; // Ignore RGB values if pixel is completely transparent

        output[pixelOffset++] += (a ? r : 0) * multiplier;
        output[pixelOffset++] += (a ? g : 0) * multiplier;
        output[pixelOffset++] += (a ? b : 0) * multiplier;

        if (fourthChannel) {
          output[pixelOffset++] += a * multiplier;
          trustworthyColorsCount[pixelOffset / 4 - 1] += a ? multiplier : 0;
        }
      }

      if (weight >= amountToNext) {
        actualPosition = caret;
        currentPosition = actualPosition;
        weight -= amountToNext;
      } else {
        currentPosition += weight;
        break;
      }
    } while (weight > 0 && actualPosition < this.widthPassResultSize);

    for (pixelOffset = 0; pixelOffset < this.targetWidthMultipliedByChannels;) {
      weight = fourthChannel ? trustworthyColorsCount[pixelOffset / 4] : 1;
      multiplier = fourthChannel ? weight ? 1 / weight : 0 : ratioWeightDivisor;
      outputBuffer[outputOffset++] = Math.round(output[pixelOffset++] * multiplier);
      outputBuffer[outputOffset++] = Math.round(output[pixelOffset++] * multiplier);
      outputBuffer[outputOffset++] = Math.round(output[pixelOffset++] * multiplier);

      if (fourthChannel) {
        outputBuffer[outputOffset++] = Math.round(output[pixelOffset++] * ratioWeightDivisor);
      }
    }
  } while (outputOffset < this.finalResultSize);

  return outputBuffer;
};

Resize.prototype.resizeWidthInterpolatedRGB = function (buffer) {
  return this._resizeWidthInterpolatedRGBChannels(buffer, false);
};

Resize.prototype.resizeWidthInterpolatedRGBA = function (buffer) {
  return this._resizeWidthInterpolatedRGBChannels(buffer, true);
};

Resize.prototype.resizeWidthRGB = function (buffer) {
  return this._resizeWidthRGBChannels(buffer, false);
};

Resize.prototype.resizeWidthRGBA = function (buffer) {
  return this._resizeWidthRGBChannels(buffer, true);
};

Resize.prototype.resizeHeightInterpolated = function (buffer) {
  var ratioWeight = this.ratioWeightHeightPass;
  var outputBuffer = this.heightBuffer;
  var weight = 0;
  var finalOffset = 0;
  var pixelOffset = 0;
  var pixelOffsetAccumulated = 0;
  var pixelOffsetAccumulated2 = 0;
  var firstWeight = 0;
  var secondWeight = 0;
  var interpolationHeightSourceReadStop; // Handle for only one interpolation input being valid for start calculation:

  for (; weight < 1 / 3; weight += ratioWeight) {
    for (pixelOffset = 0; pixelOffset < this.targetWidthMultipliedByChannels;) {
      outputBuffer[finalOffset++] = Math.round(buffer[pixelOffset++]);
    }
  } // Adjust for overshoot of the last pass's counter:


  weight -= 1 / 3;

  for (interpolationHeightSourceReadStop = this.heightOriginal - 1; weight < interpolationHeightSourceReadStop; weight += ratioWeight) {
    // Calculate weightings:
    secondWeight = weight % 1;
    firstWeight = 1 - secondWeight; // Interpolate:

    pixelOffsetAccumulated = Math.floor(weight) * this.targetWidthMultipliedByChannels;
    pixelOffsetAccumulated2 = pixelOffsetAccumulated + this.targetWidthMultipliedByChannels;

    for (pixelOffset = 0; pixelOffset < this.targetWidthMultipliedByChannels; ++pixelOffset) {
      outputBuffer[finalOffset++] = Math.round(buffer[pixelOffsetAccumulated++] * firstWeight + buffer[pixelOffsetAccumulated2++] * secondWeight);
    }
  } // Handle for only one interpolation input being valid for end calculation:


  while (finalOffset < this.finalResultSize) {
    for (pixelOffset = 0, pixelOffsetAccumulated = interpolationHeightSourceReadStop * this.targetWidthMultipliedByChannels; pixelOffset < this.targetWidthMultipliedByChannels; ++pixelOffset) {
      outputBuffer[finalOffset++] = Math.round(buffer[pixelOffsetAccumulated++]);
    }
  }

  return outputBuffer;
};

Resize.prototype.resizeHeightRGB = function (buffer) {
  return this._resizeHeightRGBChannels(buffer, false);
};

Resize.prototype.resizeHeightRGBA = function (buffer) {
  return this._resizeHeightRGBChannels(buffer, true);
};

Resize.prototype.resize = function (buffer) {
  this.resizeCallback(this.resizeHeight(this.resizeWidth(buffer)));
};

Resize.prototype.bypassResizer = function (buffer) {
  // Just return the buffer passed:
  return buffer;
};

Resize.prototype.initializeFirstPassBuffers = function (BILINEARAlgo) {
  // Initialize the internal width pass buffers:
  this.widthBuffer = this.generateFloatBuffer(this.widthPassResultSize);

  if (!BILINEARAlgo) {
    this.outputWidthWorkBench = this.generateFloatBuffer(this.originalHeightMultipliedByChannels);

    if (this.colorChannels > 3) {
      this.outputWidthWorkBenchOpaquePixelsCount = this.generateFloat64Buffer(this.heightOriginal);
    }
  }
};

Resize.prototype.initializeSecondPassBuffers = function (BILINEARAlgo) {
  // Initialize the internal height pass buffers:
  this.heightBuffer = this.generateUint8Buffer(this.finalResultSize);

  if (!BILINEARAlgo) {
    this.outputHeightWorkBench = this.generateFloatBuffer(this.targetWidthMultipliedByChannels);

    if (this.colorChannels > 3) {
      this.outputHeightWorkBenchOpaquePixelsCount = this.generateFloat64Buffer(this.targetWidth);
    }
  }
};

Resize.prototype.generateFloatBuffer = function (bufferLength) {
  // Generate a float32 typed array buffer:
  try {
    return new Float32Array(bufferLength);
  } catch (error) {
    return [];
  }
};

Resize.prototype.generateFloat64Buffer = function (bufferLength) {
  // Generate a float64 typed array buffer:
  try {
    return new Float64Array(bufferLength);
  } catch (error) {
    return [];
  }
};

Resize.prototype.generateUint8Buffer = function (bufferLength) {
  // Generate a uint8 typed array buffer:
  try {
    return new Uint8Array(bufferLength);
  } catch (error) {
    return [];
  }
};

module.exports = Resize;
//# sourceMappingURL=resize.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1728739681111, function(require, module, exports) {


/**
 * Copyright (c) 2015 Guyon Roche
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:</p>
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
module.exports = {
  nearestNeighbor: function nearestNeighbor(src, dst) {
    var wSrc = src.width;
    var hSrc = src.height;
    var wDst = dst.width;
    var hDst = dst.height;
    var bufSrc = src.data;
    var bufDst = dst.data;

    for (var i = 0; i < hDst; i++) {
      for (var j = 0; j < wDst; j++) {
        var posDst = (i * wDst + j) * 4;
        var iSrc = Math.floor(i * hSrc / hDst);
        var jSrc = Math.floor(j * wSrc / wDst);
        var posSrc = (iSrc * wSrc + jSrc) * 4;
        bufDst[posDst++] = bufSrc[posSrc++];
        bufDst[posDst++] = bufSrc[posSrc++];
        bufDst[posDst++] = bufSrc[posSrc++];
        bufDst[posDst++] = bufSrc[posSrc++];
      }
    }
  },
  bilinearInterpolation: function bilinearInterpolation(src, dst) {
    var wSrc = src.width;
    var hSrc = src.height;
    var wDst = dst.width;
    var hDst = dst.height;
    var bufSrc = src.data;
    var bufDst = dst.data;

    var interpolate = function interpolate(k, kMin, vMin, kMax, vMax) {
      // special case - k is integer
      if (kMin === kMax) {
        return vMin;
      }

      return Math.round((k - kMin) * vMax + (kMax - k) * vMin);
    };

    var assign = function assign(pos, offset, x, xMin, xMax, y, yMin, yMax) {
      var posMin = (yMin * wSrc + xMin) * 4 + offset;
      var posMax = (yMin * wSrc + xMax) * 4 + offset;
      var vMin = interpolate(x, xMin, bufSrc[posMin], xMax, bufSrc[posMax]); // special case, y is integer

      if (yMax === yMin) {
        bufDst[pos + offset] = vMin;
      } else {
        posMin = (yMax * wSrc + xMin) * 4 + offset;
        posMax = (yMax * wSrc + xMax) * 4 + offset;
        var vMax = interpolate(x, xMin, bufSrc[posMin], xMax, bufSrc[posMax]);
        bufDst[pos + offset] = interpolate(y, yMin, vMin, yMax, vMax);
      }
    };

    for (var i = 0; i < hDst; i++) {
      for (var j = 0; j < wDst; j++) {
        var posDst = (i * wDst + j) * 4; // x & y in src coordinates

        var x = j * wSrc / wDst;
        var xMin = Math.floor(x);
        var xMax = Math.min(Math.ceil(x), wSrc - 1);
        var y = i * hSrc / hDst;
        var yMin = Math.floor(y);
        var yMax = Math.min(Math.ceil(y), hSrc - 1);
        assign(posDst, 0, x, xMin, xMax, y, yMin, yMax);
        assign(posDst, 1, x, xMin, xMax, y, yMin, yMax);
        assign(posDst, 2, x, xMin, xMax, y, yMin, yMax);
        assign(posDst, 3, x, xMin, xMax, y, yMin, yMax);
      }
    }
  },
  _interpolate2D: function _interpolate2D(src, dst, options, interpolate) {
    var bufSrc = src.data;
    var bufDst = dst.data;
    var wSrc = src.width;
    var hSrc = src.height;
    var wDst = dst.width;
    var hDst = dst.height; // when dst smaller than src/2, interpolate first to a multiple between 0.5 and 1.0 src, then sum squares

    var wM = Math.max(1, Math.floor(wSrc / wDst));
    var wDst2 = wDst * wM;
    var hM = Math.max(1, Math.floor(hSrc / hDst));
    var hDst2 = hDst * hM; // ===========================================================
    // Pass 1 - interpolate rows
    // buf1 has width of dst2 and height of src

    var buf1 = Buffer.alloc(wDst2 * hSrc * 4);

    for (var i = 0; i < hSrc; i++) {
      for (var j = 0; j < wDst2; j++) {
        // i in src coords, j in dst coords
        // calculate x in src coords
        // this interpolation requires 4 sample points and the two inner ones must be real
        // the outer points can be fudged for the edges.
        // therefore (wSrc-1)/wDst2
        var x = j * (wSrc - 1) / wDst2;
        var xPos = Math.floor(x);
        var t = x - xPos;
        var srcPos = (i * wSrc + xPos) * 4;
        var buf1Pos = (i * wDst2 + j) * 4;

        for (var k = 0; k < 4; k++) {
          var kPos = srcPos + k;
          var x0 = xPos > 0 ? bufSrc[kPos - 4] : 2 * bufSrc[kPos] - bufSrc[kPos + 4];
          var x1 = bufSrc[kPos];
          var x2 = bufSrc[kPos + 4];
          var x3 = xPos < wSrc - 2 ? bufSrc[kPos + 8] : 2 * bufSrc[kPos + 4] - bufSrc[kPos];
          buf1[buf1Pos + k] = interpolate(x0, x1, x2, x3, t);
        }
      }
    } // this._writeFile(wDst2, hSrc, buf1, "out/buf1.jpg");
    // ===========================================================
    // Pass 2 - interpolate columns
    // buf2 has width and height of dst2


    var buf2 = Buffer.alloc(wDst2 * hDst2 * 4);

    for (var _i = 0; _i < hDst2; _i++) {
      for (var _j = 0; _j < wDst2; _j++) {
        // i&j in dst2 coords
        // calculate y in buf1 coords
        // this interpolation requires 4 sample points and the two inner ones must be real
        // the outer points can be fudged for the edges.
        // therefore (hSrc-1)/hDst2
        var y = _i * (hSrc - 1) / hDst2;
        var yPos = Math.floor(y);

        var _t = y - yPos;

        var _buf1Pos = (yPos * wDst2 + _j) * 4;

        var buf2Pos = (_i * wDst2 + _j) * 4;

        for (var _k = 0; _k < 4; _k++) {
          var _kPos = _buf1Pos + _k;

          var y0 = yPos > 0 ? buf1[_kPos - wDst2 * 4] : 2 * buf1[_kPos] - buf1[_kPos + wDst2 * 4];
          var y1 = buf1[_kPos];
          var y2 = buf1[_kPos + wDst2 * 4];
          var y3 = yPos < hSrc - 2 ? buf1[_kPos + wDst2 * 8] : 2 * buf1[_kPos + wDst2 * 4] - buf1[_kPos];
          buf2[buf2Pos + _k] = interpolate(y0, y1, y2, y3, _t);
        }
      }
    } // this._writeFile(wDst2, hDst2, buf2, "out/buf2.jpg");
    // ===========================================================
    // Pass 3 - scale to dst


    var m = wM * hM;

    if (m > 1) {
      for (var _i2 = 0; _i2 < hDst; _i2++) {
        for (var _j2 = 0; _j2 < wDst; _j2++) {
          // i&j in dst bounded coords
          var r = 0;
          var g = 0;
          var b = 0;
          var a = 0;
          var realColors = 0;

          for (var _y = 0; _y < hM; _y++) {
            var _yPos = _i2 * hM + _y;

            for (var _x = 0; _x < wM; _x++) {
              var _xPos = _j2 * wM + _x;

              var xyPos = (_yPos * wDst2 + _xPos) * 4;
              var pixelAlpha = buf2[xyPos + 3];

              if (pixelAlpha) {
                r += buf2[xyPos];
                g += buf2[xyPos + 1];
                b += buf2[xyPos + 2];
                realColors++;
              }

              a += pixelAlpha;
            }
          }

          var pos = (_i2 * wDst + _j2) * 4;
          bufDst[pos] = realColors ? Math.round(r / realColors) : 0;
          bufDst[pos + 1] = realColors ? Math.round(g / realColors) : 0;
          bufDst[pos + 2] = realColors ? Math.round(b / realColors) : 0;
          bufDst[pos + 3] = Math.round(a / m);
        }
      }
    } else {
      // replace dst buffer with buf2
      dst.data = buf2;
    }
  },
  bicubicInterpolation: function bicubicInterpolation(src, dst, options) {
    var interpolateCubic = function interpolateCubic(x0, x1, x2, x3, t) {
      var a0 = x3 - x2 - x0 + x1;
      var a1 = x0 - x1 - a0;
      var a2 = x2 - x0;
      var a3 = x1;
      return Math.max(0, Math.min(255, a0 * (t * t * t) + a1 * (t * t) + a2 * t + a3));
    };

    return this._interpolate2D(src, dst, options, interpolateCubic);
  },
  hermiteInterpolation: function hermiteInterpolation(src, dst, options) {
    var interpolateHermite = function interpolateHermite(x0, x1, x2, x3, t) {
      var c0 = x1;
      var c1 = 0.5 * (x2 - x0);
      var c2 = x0 - 2.5 * x1 + 2 * x2 - 0.5 * x3;
      var c3 = 0.5 * (x3 - x0) + 1.5 * (x1 - x2);
      return Math.max(0, Math.min(255, Math.round(((c3 * t + c2) * t + c1) * t + c0)));
    };

    return this._interpolate2D(src, dst, options, interpolateHermite);
  },
  bezierInterpolation: function bezierInterpolation(src, dst, options) {
    // between 2 points y(n), y(n+1), use next points out, y(n-1), y(n+2)
    // to predict control points (a & b) to be placed at n+0.5
    //  ya(n) = y(n) + (y(n+1)-y(n-1))/4
    //  yb(n) = y(n+1) - (y(n+2)-y(n))/4
    // then use std bezier to interpolate [n,n+1)
    //  y(n+t) = y(n)*(1-t)^3 + 3 * ya(n)*(1-t)^2*t + 3 * yb(n)*(1-t)*t^2 + y(n+1)*t^3
    //  note the 3* factor for the two control points
    // for edge cases, can choose:
    //  y(-1) = y(0) - 2*(y(1)-y(0))
    //  y(w) = y(w-1) + 2*(y(w-1)-y(w-2))
    // but can go with y(-1) = y(0) and y(w) = y(w-1)
    var interpolateBezier = function interpolateBezier(x0, x1, x2, x3, t) {
      // x1, x2 are the knots, use x0 and x3 to calculate control points
      var cp1 = x1 + (x2 - x0) / 4;
      var cp2 = x2 - (x3 - x1) / 4;
      var nt = 1 - t;
      var c0 = x1 * nt * nt * nt;
      var c1 = 3 * cp1 * nt * nt * t;
      var c2 = 3 * cp2 * nt * t * t;
      var c3 = x2 * t * t * t;
      return Math.max(0, Math.min(255, Math.round(c0 + c1 + c2 + c3)));
    };

    return this._interpolate2D(src, dst, options, interpolateBezier);
  }
};
//# sourceMappingURL=resize2.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1728739681109);
})()
//miniprogram-npm-outsideDeps=["@babel/runtime/helpers/interopRequireDefault","@jimp/utils"]
//# sourceMappingURL=index.js.map