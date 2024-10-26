module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1729954661695, function(require, module, exports) {


var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isNodePattern = isNodePattern;
exports.throwError = throwError;
exports.scan = scan;
exports.scanIterator = scanIterator;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _marked =
/*#__PURE__*/
_regenerator["default"].mark(scanIterator);

function isNodePattern(cb) {
  if (typeof cb === "undefined") {
    return false;
  }

  if (typeof cb !== "function") {
    throw new TypeError("Callback must be a function");
  }

  return true;
}

function throwError(error, cb) {
  if (typeof error === "string") {
    error = new Error(error);
  }

  if (typeof cb === "function") {
    return cb.call(this, error);
  }

  throw error;
}

function scan(image, x, y, w, h, f) {
  // round input
  x = Math.round(x);
  y = Math.round(y);
  w = Math.round(w);
  h = Math.round(h);

  for (var _y = y; _y < y + h; _y++) {
    for (var _x = x; _x < x + w; _x++) {
      var idx = image.bitmap.width * _y + _x << 2;
      f.call(image, _x, _y, idx);
    }
  }

  return image;
}

function scanIterator(image, x, y, w, h) {
  var _y, _x, idx;

  return _regenerator["default"].wrap(function scanIterator$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          // round input
          x = Math.round(x);
          y = Math.round(y);
          w = Math.round(w);
          h = Math.round(h);
          _y = y;

        case 5:
          if (!(_y < y + h)) {
            _context.next = 17;
            break;
          }

          _x = x;

        case 7:
          if (!(_x < x + w)) {
            _context.next = 14;
            break;
          }

          idx = image.bitmap.width * _y + _x << 2;
          _context.next = 11;
          return {
            x: _x,
            y: _y,
            idx: idx,
            image: image
          };

        case 11:
          _x++;
          _context.next = 7;
          break;

        case 14:
          _y++;
          _context.next = 5;
          break;

        case 17:
        case "end":
          return _context.stop();
      }
    }
  }, _marked);
}
//# sourceMappingURL=index.js.map
}, function(modId) {var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1729954661695);
})()
//miniprogram-npm-outsideDeps=["@babel/runtime/helpers/interopRequireDefault","@babel/runtime/regenerator"]
//# sourceMappingURL=index.js.map