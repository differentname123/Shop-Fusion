module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1731211820005, function(require, module, exports) {


var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _path = _interopRequireDefault(require("path"));

var _loadBmfont = _interopRequireDefault(require("load-bmfont"));

var _utils = require("@jimp/utils");

var _measureText = require("./measure-text");

function xOffsetBasedOnAlignment(constants, font, line, maxWidth, alignment) {
  if (alignment === constants.HORIZONTAL_ALIGN_LEFT) {
    return 0;
  }

  if (alignment === constants.HORIZONTAL_ALIGN_CENTER) {
    return (maxWidth - (0, _measureText.measureText)(font, line)) / 2;
  }

  return maxWidth - (0, _measureText.measureText)(font, line);
}

function drawCharacter(image, font, x, y, _char) {
  if (_char.width > 0 && _char.height > 0) {
    var characterPage = font.pages[_char.page];
    image.blit(characterPage, x + _char.xoffset, y + _char.yoffset, _char.x, _char.y, _char.width, _char.height);
  }

  return image;
}

function printText(font, x, y, text, defaultCharWidth) {
  for (var i = 0; i < text.length; i++) {
    var _char2 = void 0;

    if (font.chars[text[i]]) {
      _char2 = text[i];
    } else if (/\s/.test(text[i])) {
      _char2 = "";
    } else {
      _char2 = "?";
    }

    var fontChar = font.chars[_char2] || {};
    var fontKerning = font.kernings[_char2];
    drawCharacter(this, font, x, y, fontChar || {});
    var kerning = fontKerning && fontKerning[text[i + 1]] ? fontKerning[text[i + 1]] : 0;
    x += kerning + (fontChar.xadvance || defaultCharWidth);
  }
}

function splitLines(font, text, maxWidth) {
  var words = text.split(" ");
  var lines = [];
  var currentLine = [];
  var longestLine = 0;
  words.forEach(function (word) {
    var line = [].concat((0, _toConsumableArray2["default"])(currentLine), [word]).join(" ");
    var length = (0, _measureText.measureText)(font, line);

    if (length <= maxWidth) {
      if (length > longestLine) {
        longestLine = length;
      }

      currentLine.push(word);
    } else {
      lines.push(currentLine);
      currentLine = [word];
    }
  });
  lines.push(currentLine);
  return {
    lines: lines,
    longestLine: longestLine
  };
}

function loadPages(Jimp, dir, pages) {
  var newPages = pages.map(function (page) {
    return Jimp.read(dir + "/" + page);
  });
  return Promise.all(newPages);
}

var dir = process.env.DIRNAME || "".concat(__dirname, "/../");

var _default = function _default() {
  return {
    constants: {
      measureText: _measureText.measureText,
      measureTextHeight: _measureText.measureTextHeight,
      FONT_SANS_8_BLACK: _path["default"].join(dir, "fonts/open-sans/open-sans-8-black/open-sans-8-black.fnt"),
      FONT_SANS_10_BLACK: _path["default"].join(dir, "fonts/open-sans/open-sans-10-black/open-sans-10-black.fnt"),
      FONT_SANS_12_BLACK: _path["default"].join(dir, "fonts/open-sans/open-sans-12-black/open-sans-12-black.fnt"),
      FONT_SANS_14_BLACK: _path["default"].join(dir, "fonts/open-sans/open-sans-14-black/open-sans-14-black.fnt"),
      FONT_SANS_16_BLACK: _path["default"].join(dir, "fonts/open-sans/open-sans-16-black/open-sans-16-black.fnt"),
      FONT_SANS_32_BLACK: _path["default"].join(dir, "fonts/open-sans/open-sans-32-black/open-sans-32-black.fnt"),
      FONT_SANS_64_BLACK: _path["default"].join(dir, "fonts/open-sans/open-sans-64-black/open-sans-64-black.fnt"),
      FONT_SANS_128_BLACK: _path["default"].join(dir, "fonts/open-sans/open-sans-128-black/open-sans-128-black.fnt"),
      FONT_SANS_8_WHITE: _path["default"].join(dir, "fonts/open-sans/open-sans-8-white/open-sans-8-white.fnt"),
      FONT_SANS_16_WHITE: _path["default"].join(dir, "fonts/open-sans/open-sans-16-white/open-sans-16-white.fnt"),
      FONT_SANS_32_WHITE: _path["default"].join(dir, "fonts/open-sans/open-sans-32-white/open-sans-32-white.fnt"),
      FONT_SANS_64_WHITE: _path["default"].join(dir, "fonts/open-sans/open-sans-64-white/open-sans-64-white.fnt"),
      FONT_SANS_128_WHITE: _path["default"].join(dir, "fonts/open-sans/open-sans-128-white/open-sans-128-white.fnt"),

      /**
       * Loads a bitmap font from a file
       * @param {string} file the file path of a .fnt file
       * @param {function(Error, Jimp)} cb (optional) a function to call when the font is loaded
       * @returns {Promise} a promise
       */
      loadFont: function loadFont(file, cb) {
        var _this = this;

        if (typeof file !== "string") return _utils.throwError.call(this, "file must be a string", cb);
        return new Promise(function (resolve, reject) {
          cb = cb || function (err, font) {
            if (err) reject(err);else resolve(font);
          };

          (0, _loadBmfont["default"])(file, function (err, font) {
            var chars = {};
            var kernings = {};

            if (err) {
              return _utils.throwError.call(_this, err, cb);
            }

            for (var i = 0; i < font.chars.length; i++) {
              chars[String.fromCharCode(font.chars[i].id)] = font.chars[i];
            }

            for (var _i = 0; _i < font.kernings.length; _i++) {
              var firstString = String.fromCharCode(font.kernings[_i].first);
              kernings[firstString] = kernings[firstString] || {};
              kernings[firstString][String.fromCharCode(font.kernings[_i].second)] = font.kernings[_i].amount;
            }

            loadPages(_this, _path["default"].dirname(file), font.pages).then(function (pages) {
              cb(null, {
                chars: chars,
                kernings: kernings,
                pages: pages,
                common: font.common,
                info: font.info
              });
            });
          });
        });
      }
    },
    "class": {
      /**
       * Draws a text on a image on a given boundary
       * @param {Jimp} font a bitmap font loaded from `Jimp.loadFont` command
       * @param {number} x the x position to start drawing the text
       * @param {number} y the y position to start drawing the text
       * @param {any} text the text to draw (string or object with `text`, `alignmentX`, and/or `alignmentY`)
       * @param {number} maxWidth (optional) the boundary width to draw in
       * @param {number} maxHeight (optional) the boundary height to draw in
       * @param {function(Error, Jimp)} cb (optional) a function to call when the text is written
       * @returns {Jimp} this for chaining of methods
       */
      print: function print(font, x, y, text, maxWidth, maxHeight, cb) {
        var _this2 = this;

        if (typeof maxWidth === "function" && typeof cb === "undefined") {
          cb = maxWidth;
          maxWidth = Infinity;
        }

        if (typeof maxWidth === "undefined") {
          maxWidth = Infinity;
        }

        if (typeof maxHeight === "function" && typeof cb === "undefined") {
          cb = maxHeight;
          maxHeight = Infinity;
        }

        if (typeof maxHeight === "undefined") {
          maxHeight = Infinity;
        }

        if ((0, _typeof2["default"])(font) !== "object") {
          return _utils.throwError.call(this, "font must be a Jimp loadFont", cb);
        }

        if (typeof x !== "number" || typeof y !== "number" || typeof maxWidth !== "number") {
          return _utils.throwError.call(this, "x, y and maxWidth must be numbers", cb);
        }

        if (typeof maxWidth !== "number") {
          return _utils.throwError.call(this, "maxWidth must be a number", cb);
        }

        if (typeof maxHeight !== "number") {
          return _utils.throwError.call(this, "maxHeight must be a number", cb);
        }

        var alignmentX;
        var alignmentY;

        if ((0, _typeof2["default"])(text) === "object" && text.text !== null && text.text !== undefined) {
          alignmentX = text.alignmentX || this.constructor.HORIZONTAL_ALIGN_LEFT;
          alignmentY = text.alignmentY || this.constructor.VERTICAL_ALIGN_TOP;
          var _text = text;
          text = _text.text;
        } else {
          alignmentX = this.constructor.HORIZONTAL_ALIGN_LEFT;
          alignmentY = this.constructor.VERTICAL_ALIGN_TOP;
          text = text.toString();
        }

        if (maxHeight !== Infinity && alignmentY === this.constructor.VERTICAL_ALIGN_BOTTOM) {
          y += maxHeight - (0, _measureText.measureTextHeight)(font, text, maxWidth);
        } else if (maxHeight !== Infinity && alignmentY === this.constructor.VERTICAL_ALIGN_MIDDLE) {
          y += maxHeight / 2 - (0, _measureText.measureTextHeight)(font, text, maxWidth) / 2;
        }

        var defaultCharWidth = Object.entries(font.chars)[0][1].xadvance;

        var _splitLines = splitLines(font, text, maxWidth),
            lines = _splitLines.lines,
            longestLine = _splitLines.longestLine;

        lines.forEach(function (line) {
          var lineString = line.join(" ");
          var alignmentWidth = xOffsetBasedOnAlignment(_this2.constructor, font, lineString, maxWidth, alignmentX);
          printText.call(_this2, font, x + alignmentWidth, y, lineString, defaultCharWidth);
          y += font.common.lineHeight;
        });

        if ((0, _utils.isNodePattern)(cb)) {
          cb.call(this, null, this, {
            x: x + longestLine,
            y: y
          });
        }

        return this;
      }
    }
  };
};

exports["default"] = _default;
module.exports = exports.default;
//# sourceMappingURL=index.js.map
}, function(modId) {var map = {"./measure-text":1731211820006}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1731211820006, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.measureText = measureText;
exports.measureTextHeight = measureTextHeight;

function measureText(font, text) {
  var x = 0;

  for (var i = 0; i < text.length; i++) {
    if (font.chars[text[i]]) {
      var kerning = font.kernings[text[i]] && font.kernings[text[i]][text[i + 1]] ? font.kernings[text[i]][text[i + 1]] : 0;
      x += (font.chars[text[i]].xadvance || 0) + kerning;
    }
  }

  return x;
}

function measureTextHeight(font, text, maxWidth) {
  var words = text.split(" ");
  var line = "";
  var textTotalHeight = font.common.lineHeight;

  for (var n = 0; n < words.length; n++) {
    var testLine = line + words[n] + " ";
    var testWidth = measureText(font, testLine);

    if (testWidth > maxWidth && n > 0) {
      textTotalHeight += font.common.lineHeight;
      line = words[n] + " ";
    } else {
      line = testLine;
    }
  }

  return textTotalHeight;
}
//# sourceMappingURL=measure-text.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1731211820005);
})()
//miniprogram-npm-outsideDeps=["@babel/runtime/helpers/interopRequireDefault","@babel/runtime/helpers/typeof","@babel/runtime/helpers/toConsumableArray","path","load-bmfont","@jimp/utils"]
//# sourceMappingURL=index.js.map