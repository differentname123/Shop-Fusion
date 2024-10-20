module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1728739681079, function(require, module, exports) {


var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addConstants = addConstants;
exports.addJimpMethods = addJimpMethods;
exports.jimpEvMethod = jimpEvMethod;
exports.jimpEvChange = jimpEvChange;
Object.defineProperty(exports, "addType", {
  enumerable: true,
  get: function get() {
    return MIME.addType;
  }
});
exports["default"] = void 0;

var _construct2 = _interopRequireDefault(require("@babel/runtime/helpers/construct"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _events = _interopRequireDefault(require("events"));

var _utils = require("@jimp/utils");

var _anyBase = _interopRequireDefault(require("any-base"));

var _mkdirp = _interopRequireDefault(require("mkdirp"));

var _pixelmatch = _interopRequireDefault(require("pixelmatch"));

var _tinycolor = _interopRequireDefault(require("tinycolor2"));

var _phash = _interopRequireDefault(require("./modules/phash"));

var _request = _interopRequireDefault(require("./request"));

var _composite = _interopRequireDefault(require("./composite"));

var _promisify = _interopRequireDefault(require("./utils/promisify"));

var MIME = _interopRequireWildcard(require("./utils/mime"));

var _imageBitmap = require("./utils/image-bitmap");

var constants = _interopRequireWildcard(require("./constants"));

var alphabet = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$_"; // an array storing the maximum string length of hashes at various bases
// 0 and 1 do not exist as possible hash lengths

var maxHashLength = [NaN, NaN];

for (var i = 2; i < 65; i++) {
  var maxHash = (0, _anyBase["default"])(_anyBase["default"].BIN, alphabet.slice(0, i))(new Array(64 + 1).join("1"));
  maxHashLength.push(maxHash.length);
} // no operation


function noop() {} // error checking methods


function isArrayBuffer(test) {
  return Object.prototype.toString.call(test).toLowerCase().indexOf("arraybuffer") > -1;
} // Prepare a Buffer object from the arrayBuffer. Necessary in the browser > node conversion,
// But this function is not useful when running in node directly


function bufferFromArrayBuffer(arrayBuffer) {
  var buffer = Buffer.alloc(arrayBuffer.byteLength);
  var view = new Uint8Array(arrayBuffer);

  for (var _i = 0; _i < buffer.length; ++_i) {
    buffer[_i] = view[_i];
  }

  return buffer;
}

function loadFromURL(options, cb) {
  (0, _request["default"])(options, function (err, response, data) {
    if (err) {
      return cb(err);
    }

    if ("headers" in response && "location" in response.headers) {
      options.url = response.headers.location;
      return loadFromURL(options, cb);
    }

    if ((0, _typeof2["default"])(data) === "object" && Buffer.isBuffer(data)) {
      return cb(null, data);
    }

    var msg = "Could not load Buffer from <" + options.url + "> " + "(HTTP: " + response.statusCode + ")";
    return new Error(msg);
  });
}

function loadBufferFromPath(src, cb) {
  if (_fs["default"] && typeof _fs["default"].readFile === "function" && !src.match(/^(http|ftp)s?:\/\/./)) {
    _fs["default"].readFile(src, cb);
  } else {
    loadFromURL({
      url: src
    }, cb);
  }
}

function isRawRGBAData(obj) {
  return obj && (0, _typeof2["default"])(obj) === "object" && typeof obj.width === "number" && typeof obj.height === "number" && (Buffer.isBuffer(obj.data) || obj.data instanceof Uint8Array || typeof Uint8ClampedArray === "function" && obj.data instanceof Uint8ClampedArray) && (obj.data.length === obj.width * obj.height * 4 || obj.data.length === obj.width * obj.height * 3);
}

function makeRGBABufferFromRGB(buffer) {
  if (buffer.length % 3 !== 0) {
    throw new Error("Buffer length is incorrect");
  }

  var rgbaBuffer = Buffer.allocUnsafe(buffer.length / 3 * 4);
  var j = 0;

  for (var _i2 = 0; _i2 < buffer.length; _i2++) {
    rgbaBuffer[j] = buffer[_i2];

    if ((_i2 + 1) % 3 === 0) {
      rgbaBuffer[++j] = 255;
    }

    j++;
  }

  return rgbaBuffer;
}

var emptyBitmap = {
  data: null,
  width: null,
  height: null
};
/**
 * Jimp constructor (from a file)
 * @param path a path to the image
 * @param {function(Error, Jimp)} cb (optional) a function to call when the image is parsed to a bitmap
 */

/**
 * Jimp constructor (from a url with options)
 * @param options { url, otherOptions}
 * @param {function(Error, Jimp)} cb (optional) a function to call when the image is parsed to a bitmap
 */

/**
 * Jimp constructor (from another Jimp image or raw image data)
 * @param image a Jimp image to clone
 * @param {function(Error, Jimp)} cb a function to call when the image is parsed to a bitmap
 */

/**
 * Jimp constructor (from a Buffer)
 * @param data a Buffer containing the image data
 * @param {function(Error, Jimp)} cb a function to call when the image is parsed to a bitmap
 */

/**
 * Jimp constructor (to generate a new image)
 * @param w the width of the image
 * @param h the height of the image
 * @param {function(Error, Jimp)} cb (optional) a function to call when the image is parsed to a bitmap
 */

/**
 * Jimp constructor (to generate a new image)
 * @param w the width of the image
 * @param h the height of the image
 * @param background color to fill the image with
 * @param {function(Error, Jimp)} cb (optional) a function to call when the image is parsed to a bitmap
 */

var Jimp =
/*#__PURE__*/
function (_EventEmitter) {
  (0, _inherits2["default"])(Jimp, _EventEmitter);

  // An object representing a bitmap in memory, comprising:
  //  - data: a buffer of the bitmap data
  //  - width: the width of the image in pixels
  //  - height: the height of the image in pixels
  // Default colour to use for new pixels
  // Default MIME is PNG
  // Exif data for the image
  // Whether Transparency supporting formats will be exported as RGB or RGBA
  function Jimp() {
    var _this;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    (0, _classCallCheck2["default"])(this, Jimp);
    _this = (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(Jimp).call(this));
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "bitmap", emptyBitmap);
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_background", 0x00000000);
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_originalMime", Jimp.MIME_PNG);
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_exif", null);
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_rgba", true);
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "writeAsync", function (path) {
      return (0, _promisify["default"])(_this.write, (0, _assertThisInitialized2["default"])(_this), path);
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "getBase64Async", function (mime) {
      return (0, _promisify["default"])(_this.getBase64, (0, _assertThisInitialized2["default"])(_this), mime);
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "getBuffer", _imageBitmap.getBuffer);
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "getBufferAsync", _imageBitmap.getBufferAsync);
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "getPixelColour", _this.getPixelColor);
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "setPixelColour", _this.setPixelColor);
    var jimpInstance = (0, _assertThisInitialized2["default"])(_this);
    var cb = noop;

    if (isArrayBuffer(args[0])) {
      args[0] = bufferFromArrayBuffer(args[0]);
    }

    function finish() {
      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      var err = args[0];
      var evData = err || {};
      evData.methodName = "constructor";
      setTimeout(function () {
        var _cb;

        // run on next tick.
        if (err && cb === noop) {
          jimpInstance.emitError("constructor", err);
        } else if (!err) {
          jimpInstance.emitMulti("constructor", "initialized");
        }

        (_cb = cb).call.apply(_cb, [jimpInstance].concat(args));
      }, 1);
    }

    if (typeof args[0] === "number" && typeof args[1] === "number" || parseInt(args[0], 10) && parseInt(args[1], 10)) {
      // create a new image
      var w = parseInt(args[0], 10);
      var h = parseInt(args[1], 10);
      cb = args[2]; // with a hex color

      if (typeof args[2] === "number") {
        _this._background = args[2];
        cb = args[3];
      } // with a css color


      if (typeof args[2] === "string") {
        _this._background = Jimp.cssColorToHex(args[2]);
        cb = args[3];
      }

      if (typeof cb === "undefined") {
        cb = noop;
      }

      if (typeof cb !== "function") {
        return (0, _possibleConstructorReturn2["default"])(_this, _utils.throwError.call((0, _assertThisInitialized2["default"])(_this), "cb must be a function", finish));
      }

      _this.bitmap = {
        data: Buffer.alloc(w * h * 4),
        width: w,
        height: h
      };

      for (var _i3 = 0; _i3 < _this.bitmap.data.length; _i3 += 4) {
        _this.bitmap.data.writeUInt32BE(_this._background, _i3);
      }

      finish(null, (0, _assertThisInitialized2["default"])(_this));
    } else if ((0, _typeof2["default"])(args[0]) === "object" && args[0].url) {
      cb = args[1] || noop;

      if (typeof cb !== "function") {
        return (0, _possibleConstructorReturn2["default"])(_this, _utils.throwError.call((0, _assertThisInitialized2["default"])(_this), "cb must be a function", finish));
      }

      loadFromURL(args[0], function (err, data) {
        if (err) {
          return _utils.throwError.call((0, _assertThisInitialized2["default"])(_this), err, finish);
        }

        _this.parseBitmap(data, args[0].url, finish);
      });
    } else if (args[0] instanceof Jimp) {
      // clone an existing Jimp
      var original = args[0];
      cb = args[1];

      if (typeof cb === "undefined") {
        cb = noop;
      }

      if (typeof cb !== "function") {
        return (0, _possibleConstructorReturn2["default"])(_this, _utils.throwError.call((0, _assertThisInitialized2["default"])(_this), "cb must be a function", finish));
      }

      _this.bitmap = {
        data: Buffer.from(original.bitmap.data),
        width: original.bitmap.width,
        height: original.bitmap.height
      };
      _this._quality = original._quality;
      _this._deflateLevel = original._deflateLevel;
      _this._deflateStrategy = original._deflateStrategy;
      _this._filterType = original._filterType;
      _this._rgba = original._rgba;
      _this._background = original._background;
      _this._originalMime = original._originalMime;
      finish(null, (0, _assertThisInitialized2["default"])(_this));
    } else if (isRawRGBAData(args[0])) {
      var imageData = args[0];
      cb = args[1] || noop;
      var isRGBA = imageData.width * imageData.height * 4 === imageData.data.length;
      var buffer = isRGBA ? Buffer.from(imageData.data) : makeRGBABufferFromRGB(imageData.data);
      _this.bitmap = {
        data: buffer,
        width: imageData.width,
        height: imageData.height
      };
      finish(null, (0, _assertThisInitialized2["default"])(_this));
    } else if (typeof args[0] === "string") {
      // read from a path
      var path = args[0];
      cb = args[1];

      if (typeof cb === "undefined") {
        cb = noop;
      }

      if (typeof cb !== "function") {
        return (0, _possibleConstructorReturn2["default"])(_this, _utils.throwError.call((0, _assertThisInitialized2["default"])(_this), "cb must be a function", finish));
      }

      loadBufferFromPath(path, function (err, data) {
        if (err) {
          return _utils.throwError.call((0, _assertThisInitialized2["default"])(_this), err, finish);
        }

        _this.parseBitmap(data, path, finish);
      });
    } else if ((0, _typeof2["default"])(args[0]) === "object" && Buffer.isBuffer(args[0])) {
      // read from a buffer
      var data = args[0];
      cb = args[1];

      if (typeof cb !== "function") {
        return (0, _possibleConstructorReturn2["default"])(_this, _utils.throwError.call((0, _assertThisInitialized2["default"])(_this), "cb must be a function", finish));
      }

      _this.parseBitmap(data, null, finish);
    } else {
      // Allow client libs to add new ways to build a Jimp object.
      // Extra constructors must be added by `Jimp.appendConstructorOption()`
      cb = args[args.length - 1];

      if (typeof cb !== "function") {
        // TODO: try to solve the args after cb problem.
        cb = args[args.length - 2];

        if (typeof cb !== "function") {
          cb = noop;
        }
      }

      var extraConstructor = Jimp.__extraConstructors.find(function (c) {
        return c.test.apply(c, args);
      });

      if (extraConstructor) {
        new Promise(function (resolve, reject) {
          var _extraConstructor$run;

          (_extraConstructor$run = extraConstructor.run).call.apply(_extraConstructor$run, [(0, _assertThisInitialized2["default"])(_this), resolve, reject].concat(args));
        }).then(function () {
          return finish(null, (0, _assertThisInitialized2["default"])(_this));
        })["catch"](finish);
      } else {
        return (0, _possibleConstructorReturn2["default"])(_this, _utils.throwError.call((0, _assertThisInitialized2["default"])(_this), "No matching constructor overloading was found. " + "Please see the docs for how to call the Jimp constructor.", finish));
      }
    }

    return _this;
  }
  /**
   * Parse a bitmap with the loaded image types.
   *
   * @param {Buffer} data raw image data
   * @param {string} path optional path to file
   * @param {function(Error, Jimp)} finish (optional) a callback for when complete
   * @memberof Jimp
   */


  (0, _createClass2["default"])(Jimp, [{
    key: "parseBitmap",
    value: function parseBitmap(data, path, finish) {
      _imageBitmap.parseBitmap.call(this, data, null, finish);
    }
    /**
     * Sets the type of the image (RGB or RGBA) when saving in a format that supports transparency (default is RGBA)
     * @param {boolean} bool A Boolean, true to use RGBA or false to use RGB
     * @param {function(Error, Jimp)} cb (optional) a callback for when complete
     * @returns {Jimp} this for chaining of methods
     */

  }, {
    key: "rgba",
    value: function rgba(bool, cb) {
      if (typeof bool !== "boolean") {
        return _utils.throwError.call(this, "bool must be a boolean, true for RGBA or false for RGB", cb);
      }

      this._rgba = bool;

      if ((0, _utils.isNodePattern)(cb)) {
        cb.call(this, null, this);
      }

      return this;
    }
    /**
     * Emit for multiple listeners
     * @param {string} methodName name of the method to emit an error for
     * @param {string} eventName name of the eventName to emit an error for
     * @param {object} data to emit
     */

  }, {
    key: "emitMulti",
    value: function emitMulti(methodName, eventName) {
      var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      data = Object.assign(data, {
        methodName: methodName,
        eventName: eventName
      });
      this.emit("any", data);

      if (methodName) {
        this.emit(methodName, data);
      }

      this.emit(eventName, data);
    }
  }, {
    key: "emitError",
    value: function emitError(methodName, err) {
      this.emitMulti(methodName, "error", err);
    }
    /**
     * Get the current height of the image
     * @return {number} height of the image
     */

  }, {
    key: "getHeight",
    value: function getHeight() {
      return this.bitmap.height;
    }
    /**
     * Get the current width of the image
     * @return {number} width of the image
     */

  }, {
    key: "getWidth",
    value: function getWidth() {
      return this.bitmap.width;
    }
    /**
     * Nicely format Jimp object when sent to the console e.g. console.log(image)
     * @returns {string} pretty printed
     */

  }, {
    key: "inspect",
    value: function inspect() {
      return "<Jimp " + (this.bitmap === emptyBitmap ? "pending..." : this.bitmap.width + "x" + this.bitmap.height) + ">";
    }
    /**
     * Nicely format Jimp object when converted to a string
     * @returns {string} pretty printed
     */

  }, {
    key: "toString",
    value: function toString() {
      return "[object Jimp]";
    }
    /**
     * Returns the original MIME of the image (default: "image/png")
     * @returns {string} the MIME
     */

  }, {
    key: "getMIME",
    value: function getMIME() {
      var mime = this._originalMime || Jimp.MIME_PNG;
      return mime;
    }
    /**
     * Returns the appropriate file extension for the original MIME of the image (default: "png")
     * @returns {string} the file extension
     */

  }, {
    key: "getExtension",
    value: function getExtension() {
      var mime = this.getMIME();
      return MIME.getExtension(mime);
    }
    /**
     * Writes the image to a file
     * @param {string} path a path to the destination file
     * @param {function(Error, Jimp)} cb (optional) a function to call when the image is saved to disk
     * @returns {Jimp} this for chaining of methods
     */

  }, {
    key: "write",
    value: function write(path, cb) {
      var _this2 = this;

      if (!_fs["default"] || !_fs["default"].createWriteStream) {
        throw new Error("Cant access the filesystem. You can use the getBase64 method.");
      }

      if (typeof path !== "string") {
        return _utils.throwError.call(this, "path must be a string", cb);
      }

      if (typeof cb === "undefined") {
        cb = noop;
      }

      if (typeof cb !== "function") {
        return _utils.throwError.call(this, "cb must be a function", cb);
      }

      var mime = MIME.getType(path) || this.getMIME();

      var pathObj = _path["default"].parse(path);

      if (pathObj.dir) {
        _mkdirp["default"].sync(pathObj.dir);
      }

      this.getBuffer(mime, function (err, buffer) {
        if (err) {
          return _utils.throwError.call(_this2, err, cb);
        }

        var stream = _fs["default"].createWriteStream(path);

        stream.on("open", function () {
          stream.write(buffer);
          stream.end();
        }).on("error", function (err) {
          return _utils.throwError.call(_this2, err, cb);
        });
        stream.on("finish", function () {
          cb.call(_this2, null, _this2);
        });
      });
      return this;
    }
  }, {
    key: "getBase64",

    /**
     * Converts the image to a base 64 string
     * @param {string} mime the mime type of the image data to be created
     * @param {function(Error, Jimp)} cb a Node-style function to call with the buffer as the second argument
     * @returns {Jimp} this for chaining of methods
     */
    value: function getBase64(mime, cb) {
      if (mime === Jimp.AUTO) {
        // allow auto MIME detection
        mime = this.getMIME();
      }

      if (typeof mime !== "string") {
        return _utils.throwError.call(this, "mime must be a string", cb);
      }

      if (typeof cb !== "function") {
        return _utils.throwError.call(this, "cb must be a function", cb);
      }

      this.getBuffer(mime, function (err, data) {
        if (err) {
          return _utils.throwError.call(this, err, cb);
        }

        var src = "data:" + mime + ";base64," + data.toString("base64");
        cb.call(this, null, src);
      });
      return this;
    }
  }, {
    key: "hash",

    /**
     * Generates a perceptual hash of the image <https://en.wikipedia.org/wiki/Perceptual_hashing>. And pads the string. Can configure base.
     * @param {number} base (optional) a number between 2 and 64 representing the base for the hash (e.g. 2 is binary, 10 is decimal, 16 is hex, 64 is base 64). Defaults to 64.
     * @param {function(Error, Jimp)} cb (optional) a callback for when complete
     * @returns {string} a string representing the hash
     */
    value: function hash(base, cb) {
      base = base || 64;

      if (typeof base === "function") {
        cb = base;
        base = 64;
      }

      if (typeof base !== "number") {
        return _utils.throwError.call(this, "base must be a number", cb);
      }

      if (base < 2 || base > 64) {
        return _utils.throwError.call(this, "base must be a number between 2 and 64", cb);
      }

      var hash = this.pHash();
      hash = (0, _anyBase["default"])(_anyBase["default"].BIN, alphabet.slice(0, base))(hash);

      while (hash.length < maxHashLength[base]) {
        hash = "0" + hash; // pad out with leading zeros
      }

      if ((0, _utils.isNodePattern)(cb)) {
        cb.call(this, null, hash);
      }

      return hash;
    }
    /**
     * Calculates the perceptual hash
     * @returns {number} the perceptual hash
     */

  }, {
    key: "pHash",
    value: function pHash() {
      var pHash = new _phash["default"]();
      return pHash.getHash(this);
    }
    /**
     * Calculates the hamming distance of the current image and a hash based on their perceptual hash
     * @param {hash} compareHash hash to compare to
     * @returns {number} a number ranging from 0 to 1, 0 means they are believed to be identical
     */

  }, {
    key: "distanceFromHash",
    value: function distanceFromHash(compareHash) {
      var pHash = new _phash["default"]();
      var currentHash = pHash.getHash(this);
      return pHash.distance(currentHash, compareHash);
    }
    /**
     * Converts the image to a buffer
     * @param {string} mime the mime type of the image buffer to be created
     * @param {function(Error, Jimp)} cb a Node-style function to call with the buffer as the second argument
     * @returns {Jimp} this for chaining of methods
     */

  }, {
    key: "getPixelIndex",

    /**
     * Returns the offset of a pixel in the bitmap buffer
     * @param {number} x the x coordinate
     * @param {number} y the y coordinate
     * @param {number} edgeHandling (optional) define how to sum pixels from outside the border
     * @param {number} cb (optional) a callback for when complete
     * @returns {number} the index of the pixel or -1 if not found
     */
    value: function getPixelIndex(x, y, edgeHandling, cb) {
      var xi;
      var yi;

      if (typeof edgeHandling === "function" && typeof cb === "undefined") {
        cb = edgeHandling;
        edgeHandling = null;
      }

      if (!edgeHandling) {
        edgeHandling = Jimp.EDGE_EXTEND;
      }

      if (typeof x !== "number" || typeof y !== "number") {
        return _utils.throwError.call(this, "x and y must be numbers", cb);
      } // round input


      x = Math.round(x);
      y = Math.round(y);
      xi = x;
      yi = y;

      if (edgeHandling === Jimp.EDGE_EXTEND) {
        if (x < 0) xi = 0;
        if (x >= this.bitmap.width) xi = this.bitmap.width - 1;
        if (y < 0) yi = 0;
        if (y >= this.bitmap.height) yi = this.bitmap.height - 1;
      }

      if (edgeHandling === Jimp.EDGE_WRAP) {
        if (x < 0) {
          xi = this.bitmap.width + x;
        }

        if (x >= this.bitmap.width) {
          xi = x % this.bitmap.width;
        }

        if (y < 0) {
          xi = this.bitmap.height + y;
        }

        if (y >= this.bitmap.height) {
          yi = y % this.bitmap.height;
        }
      }

      var i = this.bitmap.width * yi + xi << 2; // if out of bounds index is -1

      if (xi < 0 || xi >= this.bitmap.width) {
        i = -1;
      }

      if (yi < 0 || yi >= this.bitmap.height) {
        i = -1;
      }

      if ((0, _utils.isNodePattern)(cb)) {
        cb.call(this, null, i);
      }

      return i;
    }
    /**
     * Returns the hex colour value of a pixel
     * @param {number} x the x coordinate
     * @param {number} y the y coordinate
     * @param {function(Error, Jimp)} cb (optional) a callback for when complete
     * @returns {number} the color of the pixel
     */

  }, {
    key: "getPixelColor",
    value: function getPixelColor(x, y, cb) {
      if (typeof x !== "number" || typeof y !== "number") return _utils.throwError.call(this, "x and y must be numbers", cb); // round input

      x = Math.round(x);
      y = Math.round(y);
      var idx = this.getPixelIndex(x, y);
      var hex = this.bitmap.data.readUInt32BE(idx);

      if ((0, _utils.isNodePattern)(cb)) {
        cb.call(this, null, hex);
      }

      return hex;
    }
  }, {
    key: "setPixelColor",

    /**
     * Returns the hex colour value of a pixel
     * @param {number} hex color to set
     * @param {number} x the x coordinate
     * @param {number} y the y coordinate
     * @param {function(Error, Jimp)} cb (optional) a callback for when complete
     * @returns {number} the index of the pixel or -1 if not found
     */
    value: function setPixelColor(hex, x, y, cb) {
      if (typeof hex !== "number" || typeof x !== "number" || typeof y !== "number") return _utils.throwError.call(this, "hex, x and y must be numbers", cb); // round input

      x = Math.round(x);
      y = Math.round(y);
      var idx = this.getPixelIndex(x, y);
      this.bitmap.data.writeUInt32BE(hex, idx);

      if ((0, _utils.isNodePattern)(cb)) {
        cb.call(this, null, this);
      }

      return this;
    }
  }, {
    key: "hasAlpha",

    /**
     * Determine if the image contains opaque pixels.
     * @return {boolean} hasAlpha whether the image contains opaque pixels
     */
    value: function hasAlpha() {
      for (var yIndex = 0; yIndex < this.bitmap.height; yIndex++) {
        for (var xIndex = 0; xIndex < this.bitmap.width; xIndex++) {
          var idx = this.bitmap.width * yIndex + xIndex << 2;
          var alpha = this.bitmap.data[idx + 3];

          if (alpha !== 0xff) {
            return true;
          }
        }
      }

      return false;
    }
    /**
     * Iterate scan through a region of the bitmap
     * @param {number} x the x coordinate to begin the scan at
     * @param {number} y the y coordinate to begin the scan at
     * @param w the width of the scan region
     * @param h the height of the scan region
     * @returns {IterableIterator<{x: number, y: number, idx: number, image: Jimp}>}
     */

  }, {
    key: "scanIterator",
    value: function scanIterator(x, y, w, h) {
      if (typeof x !== "number" || typeof y !== "number") {
        return _utils.throwError.call(this, "x and y must be numbers");
      }

      if (typeof w !== "number" || typeof h !== "number") {
        return _utils.throwError.call(this, "w and h must be numbers");
      }

      return (0, _utils.scanIterator)(this, x, y, w, h);
    }
  }]);
  return Jimp;
}(_events["default"]);

function addConstants(constants) {
  var jimpInstance = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Jimp;
  Object.entries(constants).forEach(function (_ref) {
    var _ref2 = (0, _slicedToArray2["default"])(_ref, 2),
        name = _ref2[0],
        value = _ref2[1];

    jimpInstance[name] = value;
  });
}

function addJimpMethods(methods) {
  var jimpInstance = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Jimp;
  Object.entries(methods).forEach(function (_ref3) {
    var _ref4 = (0, _slicedToArray2["default"])(_ref3, 2),
        name = _ref4[0],
        value = _ref4[1];

    jimpInstance.prototype[name] = value;
  });
}

addConstants(constants);
addJimpMethods({
  composite: _composite["default"]
});
Jimp.__extraConstructors = [];
/**
 * Allow client libs to add new ways to build a Jimp object.
 * @param {string} name identify the extra constructor.
 * @param {function} test a function that returns true when it accepts the arguments passed to the main constructor.
 * @param {function} run where the magic happens.
 */

Jimp.appendConstructorOption = function (name, test, run) {
  Jimp.__extraConstructors.push({
    name: name,
    test: test,
    run: run
  });
};
/**
 * Read an image from a file or a Buffer. Takes the same args as the constructor
 * @returns {Promise} a promise
 */


Jimp.read = function () {
  for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
    args[_key3] = arguments[_key3];
  }

  return new Promise(function (resolve, reject) {
    // eslint-disable-next-line no-new
    (0, _construct2["default"])(Jimp, args.concat([function (err, image) {
      if (err) reject(err);else resolve(image);
    }]));
  });
};

Jimp.create = Jimp.read;
/**
 * A static helper method that converts RGBA values to a single integer value
 * @param {number} r the red value (0-255)
 * @param {number} g the green value (0-255)
 * @param {number} b the blue value (0-255)
 * @param {number} a the alpha value (0-255)
 * @param {function(Error, Jimp)} cb (optional) A callback for when complete
 * @returns {number} an single integer colour value
 */

Jimp.rgbaToInt = function (r, g, b, a, cb) {
  if (typeof r !== "number" || typeof g !== "number" || typeof b !== "number" || typeof a !== "number") {
    return _utils.throwError.call(this, "r, g, b and a must be numbers", cb);
  }

  if (r < 0 || r > 255) {
    return _utils.throwError.call(this, "r must be between 0 and 255", cb);
  }

  if (g < 0 || g > 255) {
    _utils.throwError.call(this, "g must be between 0 and 255", cb);
  }

  if (b < 0 || b > 255) {
    return _utils.throwError.call(this, "b must be between 0 and 255", cb);
  }

  if (a < 0 || a > 255) {
    return _utils.throwError.call(this, "a must be between 0 and 255", cb);
  }

  r = Math.round(r);
  b = Math.round(b);
  g = Math.round(g);
  a = Math.round(a);
  var i = r * Math.pow(256, 3) + g * Math.pow(256, 2) + b * Math.pow(256, 1) + a * Math.pow(256, 0);

  if ((0, _utils.isNodePattern)(cb)) {
    cb.call(this, null, i);
  }

  return i;
};
/**
 * A static helper method that converts RGBA values to a single integer value
 * @param {number} i a single integer value representing an RGBA colour (e.g. 0xFF0000FF for red)
 * @param {function(Error, Jimp)} cb (optional) A callback for when complete
 * @returns {object} an object with the properties r, g, b and a representing RGBA values
 */


Jimp.intToRGBA = function (i, cb) {
  if (typeof i !== "number") {
    return _utils.throwError.call(this, "i must be a number", cb);
  }

  var rgba = {};
  rgba.r = Math.floor(i / Math.pow(256, 3));
  rgba.g = Math.floor((i - rgba.r * Math.pow(256, 3)) / Math.pow(256, 2));
  rgba.b = Math.floor((i - rgba.r * Math.pow(256, 3) - rgba.g * Math.pow(256, 2)) / Math.pow(256, 1));
  rgba.a = Math.floor((i - rgba.r * Math.pow(256, 3) - rgba.g * Math.pow(256, 2) - rgba.b * Math.pow(256, 1)) / Math.pow(256, 0));

  if ((0, _utils.isNodePattern)(cb)) {
    cb.call(this, null, rgba);
  }

  return rgba;
};
/**
 * Converts a css color (Hex, 8-digit (RGBA) Hex, RGB, RGBA, HSL, HSLA, HSV, HSVA, Named) to a hex number
 * @param {string} cssColor a number
 * @returns {number} a hex number representing a color
 */


Jimp.cssColorToHex = function (cssColor) {
  cssColor = cssColor || 0; // 0, null, undefined, NaN

  if (typeof cssColor === "number") return Number(cssColor);
  return parseInt((0, _tinycolor["default"])(cssColor).toHex8(), 16);
};
/**
 * Limits a number to between 0 or 255
 * @param {number} n a number
 * @returns {number} the number limited to between 0 or 255
 */


Jimp.limit255 = function (n) {
  n = Math.max(n, 0);
  n = Math.min(n, 255);
  return n;
};
/**
 * Diffs two images and returns
 * @param {Jimp} img1 a Jimp image to compare
 * @param {Jimp} img2 a Jimp image to compare
 * @param {number} threshold (optional) a number, 0 to 1, the smaller the value the more sensitive the comparison (default: 0.1)
 * @returns {object} an object { percent: percent similar, diff: a Jimp image highlighting differences }
 */


Jimp.diff = function (img1, img2) {
  var threshold = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0.1;
  if (!(img1 instanceof Jimp) || !(img2 instanceof Jimp)) return _utils.throwError.call(this, "img1 and img2 must be an Jimp images");
  var bmp1 = img1.bitmap;
  var bmp2 = img2.bitmap;

  if (bmp1.width !== bmp2.width || bmp1.height !== bmp2.height) {
    if (bmp1.width * bmp1.height > bmp2.width * bmp2.height) {
      // img1 is bigger
      img1 = img1.cloneQuiet().resize(bmp2.width, bmp2.height);
    } else {
      // img2 is bigger (or they are the same in area)
      img2 = img2.cloneQuiet().resize(bmp1.width, bmp1.height);
    }
  }

  if (typeof threshold !== "number" || threshold < 0 || threshold > 1) {
    return _utils.throwError.call(this, "threshold must be a number between 0 and 1");
  }

  var diff = new Jimp(bmp1.width, bmp1.height, 0xffffffff);
  var numDiffPixels = (0, _pixelmatch["default"])(bmp1.data, bmp2.data, diff.bitmap.data, diff.bitmap.width, diff.bitmap.height, {
    threshold: threshold
  });
  return {
    percent: numDiffPixels / (diff.bitmap.width * diff.bitmap.height),
    image: diff
  };
};
/**
 * Calculates the hamming distance of two images based on their perceptual hash
 * @param {Jimp} img1 a Jimp image to compare
 * @param {Jimp} img2 a Jimp image to compare
 * @returns {number} a number ranging from 0 to 1, 0 means they are believed to be identical
 */


Jimp.distance = function (img1, img2) {
  var phash = new _phash["default"]();
  var hash1 = phash.getHash(img1);
  var hash2 = phash.getHash(img2);
  return phash.distance(hash1, hash2);
};
/**
 * Calculates the hamming distance of two images based on their perceptual hash
 * @param {hash} hash1 a pHash
 * @param {hash} hash2 a pHash
 * @returns {number} a number ranging from 0 to 1, 0 means they are believed to be identical
 */


Jimp.compareHashes = function (hash1, hash2) {
  var phash = new _phash["default"]();
  return phash.distance(hash1, hash2);
};
/**
 * Compute color difference
 * 0 means no difference, 1 means maximum difference.
 * @param {number} rgba1:    first color to compare.
 * @param {number} rgba2:    second color to compare.
 * Both parameters must be an color object {r:val, g:val, b:val, a:val}
 * Where `a` is optional and `val` is an integer between 0 and 255.
 * @returns {number} float between 0 and 1.
 */


Jimp.colorDiff = function (rgba1, rgba2) {
  var pow = function pow(n) {
    return Math.pow(n, 2);
  };

  var max = Math.max;
  var maxVal = 255 * 255 * 3;

  if (rgba1.a !== 0 && !rgba1.a) {
    rgba1.a = 255;
  }

  if (rgba2.a !== 0 && !rgba2.a) {
    rgba2.a = 255;
  }

  return (max(pow(rgba1.r - rgba2.r), pow(rgba1.r - rgba2.r - rgba1.a + rgba2.a)) + max(pow(rgba1.g - rgba2.g), pow(rgba1.g - rgba2.g - rgba1.a + rgba2.a)) + max(pow(rgba1.b - rgba2.b), pow(rgba1.b - rgba2.b - rgba1.a + rgba2.a))) / maxVal;
};
/**
 * Helper to create Jimp methods that emit events before and after its execution.
 * @param {string} methodName   The name to be appended to Jimp prototype.
 * @param {string} evName       The event name to be called.
 *                     It will be prefixed by `before-` and emitted when on method call.
 *                     It will be appended by `ed` and emitted after the method run.
 * @param {function} method       A function implementing the method itself.
 * It will also create a quiet version that will not emit events, to not
 * mess the user code with many `changed` event calls. You can call with
 * `methodName + "Quiet"`.
 *
 * The emitted event comes with a object parameter to the listener with the
 * `methodName` as one attribute.
 */


function jimpEvMethod(methodName, evName, method) {
  var evNameBefore = "before-" + evName;
  var evNameAfter = evName.replace(/e$/, "") + "ed";

  Jimp.prototype[methodName] = function () {
    var wrappedCb;

    for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
      args[_key4] = arguments[_key4];
    }

    var cb = args[method.length - 1];
    var jimpInstance = this;

    if (typeof cb === "function") {
      wrappedCb = function wrappedCb() {
        for (var _len5 = arguments.length, args = new Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
          args[_key5] = arguments[_key5];
        }

        var err = args[0],
            data = args[1];

        if (err) {
          jimpInstance.emitError(methodName, err);
        } else {
          jimpInstance.emitMulti(methodName, evNameAfter, (0, _defineProperty2["default"])({}, methodName, data));
        }

        cb.apply(this, args);
      };

      args[args.length - 1] = wrappedCb;
    } else {
      wrappedCb = false;
    }

    this.emitMulti(methodName, evNameBefore);
    var result;

    try {
      result = method.apply(this, args);

      if (!wrappedCb) {
        this.emitMulti(methodName, evNameAfter, (0, _defineProperty2["default"])({}, methodName, result));
      }
    } catch (error) {
      error.methodName = methodName;
      this.emitError(methodName, error);
    }

    return result;
  };

  Jimp.prototype[methodName + "Quiet"] = method;
}
/**
 * Creates a new image that is a clone of this one.
 * @param {function(Error, Jimp)} cb (optional) A callback for when complete
 * @returns the new image
 */


jimpEvMethod("clone", "clone", function (cb) {
  var clone = new Jimp(this);

  if ((0, _utils.isNodePattern)(cb)) {
    cb.call(clone, null, clone);
  }

  return clone;
});
/**
 * Simplify jimpEvMethod call for the common `change` evName.
 * @param {string} methodName name of the method
 * @param {function} method to watch changes for
 */

function jimpEvChange(methodName, method) {
  jimpEvMethod(methodName, "change", method);
}
/**
 * Sets the type of the image (RGB or RGBA) when saving as PNG format (default is RGBA)
 * @param b A Boolean, true to use RGBA or false to use RGB
 * @param {function(Error, Jimp)} cb (optional) a callback for when complete
 * @returns {Jimp} this for chaining of methods
 */


jimpEvChange("background", function (hex, cb) {
  if (typeof hex !== "number") {
    return _utils.throwError.call(this, "hex must be a hexadecimal rgba value", cb);
  }

  this._background = hex;

  if ((0, _utils.isNodePattern)(cb)) {
    cb.call(this, null, this);
  }

  return this;
});
/**
 * Scans through a region of the bitmap, calling a function for each pixel.
 * @param {number} x the x coordinate to begin the scan at
 * @param {number} y the y coordinate to begin the scan at
 * @param w the width of the scan region
 * @param h the height of the scan region
 * @param f a function to call on even pixel; the (x, y) position of the pixel
 * and the index of the pixel in the bitmap buffer are passed to the function
 * @param {function(Error, Jimp)} cb (optional) a callback for when complete
 * @returns {Jimp} this for chaining of methods
 */

jimpEvChange("scan", function (x, y, w, h, f, cb) {
  if (typeof x !== "number" || typeof y !== "number") {
    return _utils.throwError.call(this, "x and y must be numbers", cb);
  }

  if (typeof w !== "number" || typeof h !== "number") {
    return _utils.throwError.call(this, "w and h must be numbers", cb);
  }

  if (typeof f !== "function") {
    return _utils.throwError.call(this, "f must be a function", cb);
  }

  var result = (0, _utils.scan)(this, x, y, w, h, f);

  if ((0, _utils.isNodePattern)(cb)) {
    cb.call(this, null, result);
  }

  return result;
});

if (process.env.ENVIRONMENT === "BROWSER") {
  // For use in a web browser or web worker

  /* global self */
  var gl;

  if (typeof window !== "undefined" && (typeof window === "undefined" ? "undefined" : (0, _typeof2["default"])(window)) === "object") {
    gl = window;
  }

  if (typeof self !== "undefined" && (typeof self === "undefined" ? "undefined" : (0, _typeof2["default"])(self)) === "object") {
    gl = self;
  }

  gl.Jimp = Jimp;
  gl.Buffer = Buffer;
}

var _default = Jimp;
exports["default"] = _default;
//# sourceMappingURL=index.js.map
}, function(modId) {var map = {"./modules/phash":1728739681080,"./request":1728739681081,"./composite":1728739681082,"./utils/promisify":1728739681085,"./utils/mime":1728739681086,"./utils/image-bitmap":1728739681087,"./constants":1728739681083}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1728739681080, function(require, module, exports) {


/*
Copyright (c) 2011 Elliot Shepherd

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/
// https://code.google.com/p/ironchef-team21/source/browse/ironchef_team21/src/ImagePHash.java

/*
 * pHash-like image hash.
 * Author: Elliot Shepherd (elliot@jarofworms.com
 * Based On: http://www.hackerfactor.com/blog/index.php?/archives/432-Looks-Like-It.html
 */
function ImagePHash(size, smallerSize) {
  this.size = this.size || size;
  this.smallerSize = this.smallerSize || smallerSize;
  initCoefficients(this.size);
}

ImagePHash.prototype.size = 32;
ImagePHash.prototype.smallerSize = 8;

ImagePHash.prototype.distance = function (s1, s2) {
  var counter = 0;

  for (var k = 0; k < s1.length; k++) {
    if (s1[k] !== s2[k]) {
      counter++;
    }
  }

  return counter / s1.length;
}; // Returns a 'binary string' (like. 001010111011100010) which is easy to do a hamming distance on.


ImagePHash.prototype.getHash = function (img) {
  /* 1. Reduce size.
   * Like Average Hash, pHash starts with a small image.
   * However, the image is larger than 8x8; 32x32 is a good size.
   * This is really done to simplify the DCT computation and not
   * because it is needed to reduce the high frequencies.
   */
  img = img.clone().resize(this.size, this.size);
  /* 2. Reduce color.
   * The image is reduced to a grayscale just to further simplify
   * the number of computations.
   */

  img.grayscale();
  var vals = [];

  for (var x = 0; x < img.bitmap.width; x++) {
    vals[x] = [];

    for (var y = 0; y < img.bitmap.height; y++) {
      vals[x][y] = intToRGBA(img.getPixelColor(x, y)).b;
    }
  }
  /* 3. Compute the DCT.
   * The DCT separates the image into a collection of frequencies
   * and scalars. While JPEG uses an 8x8 DCT, this algorithm uses
   * a 32x32 DCT.
   */


  var dctVals = applyDCT(vals, this.size);
  /* 4. Reduce the DCT.
   * This is the magic step. While the DCT is 32x32, just keep the
   * top-left 8x8. Those represent the lowest frequencies in the
   * picture.
   */

  /* 5. Compute the average value.
   * Like the Average Hash, compute the mean DCT value (using only
   * the 8x8 DCT low-frequency values and excluding the first term
   * since the DC coefficient can be significantly different from
   * the other values and will throw off the average).
   */

  var total = 0;

  for (var _x = 0; _x < this.smallerSize; _x++) {
    for (var _y = 0; _y < this.smallerSize; _y++) {
      total += dctVals[_x][_y];
    }
  }

  var avg = total / (this.smallerSize * this.smallerSize);
  /* 6. Further reduce the DCT.
   * This is the magic step. Set the 64 hash bits to 0 or 1
   * depending on whether each of the 64 DCT values is above or
   * below the average value. The result doesn't tell us the
   * actual low frequencies; it just tells us the very-rough
   * relative scale of the frequencies to the mean. The result
   * will not vary as long as the overall structure of the image
   * remains the same; this can survive gamma and color histogram
   * adjustments without a problem.
   */

  var hash = "";

  for (var _x2 = 0; _x2 < this.smallerSize; _x2++) {
    for (var _y2 = 0; _y2 < this.smallerSize; _y2++) {
      hash += dctVals[_x2][_y2] > avg ? "1" : "0";
    }
  }

  return hash;
}; // DCT function stolen from http://stackoverflow.com/questions/4240490/problems-with-dct-and-idct-algorithm-in-java


function intToRGBA(i) {
  var rgba = {};
  rgba.r = Math.floor(i / Math.pow(256, 3));
  rgba.g = Math.floor((i - rgba.r * Math.pow(256, 3)) / Math.pow(256, 2));
  rgba.b = Math.floor((i - rgba.r * Math.pow(256, 3) - rgba.g * Math.pow(256, 2)) / Math.pow(256, 1));
  rgba.a = Math.floor((i - rgba.r * Math.pow(256, 3) - rgba.g * Math.pow(256, 2) - rgba.b * Math.pow(256, 1)) / Math.pow(256, 0));
  return rgba;
}

var c = [];

function initCoefficients(size) {
  for (var i = 1; i < size; i++) {
    c[i] = 1;
  }

  c[0] = 1 / Math.sqrt(2.0);
}

function applyDCT(f, size) {
  var N = size;
  var F = [];

  for (var u = 0; u < N; u++) {
    F[u] = [];

    for (var v = 0; v < N; v++) {
      var sum = 0;

      for (var i = 0; i < N; i++) {
        for (var j = 0; j < N; j++) {
          sum += Math.cos((2 * i + 1) / (2.0 * N) * u * Math.PI) * Math.cos((2 * j + 1) / (2.0 * N) * v * Math.PI) * f[i][j];
        }
      }

      sum *= c[u] * c[v] / 4;
      F[u][v] = sum;
    }
  }

  return F;
}

module.exports = ImagePHash;
//# sourceMappingURL=phash.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1728739681081, function(require, module, exports) {


var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

/* global XMLHttpRequest */
if (process.browser || process.env.ENVIRONMENT === "BROWSER" || typeof process.versions.electron !== "undefined" && process.type === "renderer" && typeof XMLHttpRequest === "function") {
  // If we run into a browser or the electron renderer process,
  // use XHR method instead of Request node module.
  module.exports = function (options, cb) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", options.url, true);
    xhr.responseType = "arraybuffer";
    xhr.addEventListener("load", function () {
      if (xhr.status < 400) {
        try {
          var data = Buffer.from(this.response);
          cb(null, xhr, data);
        } catch (error) {
          return cb(new Error("Response is not a buffer for url " + options.url + ". Error: " + error.message));
        }
      } else {
        cb(new Error("HTTP Status " + xhr.status + " for url " + options.url));
      }
    });
    xhr.addEventListener("error", function (e) {
      cb(e);
    });
    xhr.send();
  };
} else {
  module.exports = function (_ref, cb) {
    var options = (0, _extends2["default"])({}, _ref);

    var p = require("phin");

    p(_objectSpread({
      compression: true
    }, options), function (err, res) {
      if (err === null) {
        cb(null, res, res.body);
      } else {
        cb(err);
      }
    });
  };
}
//# sourceMappingURL=request.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1728739681082, function(require, module, exports) {


var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = composite;

var _utils = require("@jimp/utils");

var constants = _interopRequireWildcard(require("../constants"));

var compositeModes = _interopRequireWildcard(require("./composite-modes"));

/**
 * Composites a source image over to this image respecting alpha channels
 * @param {Jimp} src the source Jimp instance
 * @param {number} x the x position to blit the image
 * @param {number} y the y position to blit the image
 * @param {object} options determine what mode to use
 * @param {function(Error, Jimp)} cb (optional) a callback for when complete
 * @returns {Jimp} this for chaining of methods
 */
function composite(src, x, y) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  var cb = arguments.length > 4 ? arguments[4] : undefined;

  if (typeof options === "function") {
    cb = options;
    options = {};
  }

  if (!(src instanceof this.constructor)) {
    return _utils.throwError.call(this, "The source must be a Jimp image", cb);
  }

  if (typeof x !== "number" || typeof y !== "number") {
    return _utils.throwError.call(this, "x and y must be numbers", cb);
  }

  var _options = options,
      mode = _options.mode,
      opacitySource = _options.opacitySource,
      opacityDest = _options.opacityDest;

  if (!mode) {
    mode = constants.BLEND_SOURCE_OVER;
  }

  if (typeof opacitySource !== "number" || opacitySource < 0 || opacitySource > 1) {
    opacitySource = 1.0;
  }

  if (typeof opacityDest !== "number" || opacityDest < 0 || opacityDest > 1) {
    opacityDest = 1.0;
  } // eslint-disable-next-line import/namespace


  var blendmode = compositeModes[mode]; // round input

  x = Math.round(x);
  y = Math.round(y);
  var baseImage = this;

  if (opacityDest !== 1.0) {
    baseImage.opacity(opacityDest);
  }

  src.scanQuiet(0, 0, src.bitmap.width, src.bitmap.height, function (sx, sy, idx) {
    var dstIdx = baseImage.getPixelIndex(x + sx, y + sy, constants.EDGE_CROP);
    var blended = blendmode({
      r: this.bitmap.data[idx + 0] / 255,
      g: this.bitmap.data[idx + 1] / 255,
      b: this.bitmap.data[idx + 2] / 255,
      a: this.bitmap.data[idx + 3] / 255
    }, {
      r: baseImage.bitmap.data[dstIdx + 0] / 255,
      g: baseImage.bitmap.data[dstIdx + 1] / 255,
      b: baseImage.bitmap.data[dstIdx + 2] / 255,
      a: baseImage.bitmap.data[dstIdx + 3] / 255
    }, opacitySource);
    baseImage.bitmap.data[dstIdx + 0] = this.constructor.limit255(blended.r * 255);
    baseImage.bitmap.data[dstIdx + 1] = this.constructor.limit255(blended.g * 255);
    baseImage.bitmap.data[dstIdx + 2] = this.constructor.limit255(blended.b * 255);
    baseImage.bitmap.data[dstIdx + 3] = this.constructor.limit255(blended.a * 255);
  });

  if ((0, _utils.isNodePattern)(cb)) {
    cb.call(this, null, this);
  }

  return this;
}

module.exports = exports.default;
//# sourceMappingURL=index.js.map
}, function(modId) { var map = {"../constants":1728739681083,"./composite-modes":1728739681084}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1728739681083, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.EDGE_CROP = exports.EDGE_WRAP = exports.EDGE_EXTEND = exports.BLEND_EXCLUSION = exports.BLEND_DIFFERENCE = exports.BLEND_HARDLIGHT = exports.BLEND_LIGHTEN = exports.BLEND_DARKEN = exports.BLEND_OVERLAY = exports.BLEND_SCREEN = exports.BLEND_ADD = exports.BLEND_MULTIPLY = exports.BLEND_DESTINATION_OVER = exports.BLEND_SOURCE_OVER = exports.VERTICAL_ALIGN_BOTTOM = exports.VERTICAL_ALIGN_MIDDLE = exports.VERTICAL_ALIGN_TOP = exports.HORIZONTAL_ALIGN_RIGHT = exports.HORIZONTAL_ALIGN_CENTER = exports.HORIZONTAL_ALIGN_LEFT = exports.AUTO = void 0;
// used to auto resizing etc.
var AUTO = -1; // Align modes for cover, contain, bit masks

exports.AUTO = AUTO;
var HORIZONTAL_ALIGN_LEFT = 1;
exports.HORIZONTAL_ALIGN_LEFT = HORIZONTAL_ALIGN_LEFT;
var HORIZONTAL_ALIGN_CENTER = 2;
exports.HORIZONTAL_ALIGN_CENTER = HORIZONTAL_ALIGN_CENTER;
var HORIZONTAL_ALIGN_RIGHT = 4;
exports.HORIZONTAL_ALIGN_RIGHT = HORIZONTAL_ALIGN_RIGHT;
var VERTICAL_ALIGN_TOP = 8;
exports.VERTICAL_ALIGN_TOP = VERTICAL_ALIGN_TOP;
var VERTICAL_ALIGN_MIDDLE = 16;
exports.VERTICAL_ALIGN_MIDDLE = VERTICAL_ALIGN_MIDDLE;
var VERTICAL_ALIGN_BOTTOM = 32; // blend modes

exports.VERTICAL_ALIGN_BOTTOM = VERTICAL_ALIGN_BOTTOM;
var BLEND_SOURCE_OVER = "srcOver";
exports.BLEND_SOURCE_OVER = BLEND_SOURCE_OVER;
var BLEND_DESTINATION_OVER = "dstOver";
exports.BLEND_DESTINATION_OVER = BLEND_DESTINATION_OVER;
var BLEND_MULTIPLY = "multiply";
exports.BLEND_MULTIPLY = BLEND_MULTIPLY;
var BLEND_ADD = "add";
exports.BLEND_ADD = BLEND_ADD;
var BLEND_SCREEN = "screen";
exports.BLEND_SCREEN = BLEND_SCREEN;
var BLEND_OVERLAY = "overlay";
exports.BLEND_OVERLAY = BLEND_OVERLAY;
var BLEND_DARKEN = "darken";
exports.BLEND_DARKEN = BLEND_DARKEN;
var BLEND_LIGHTEN = "lighten";
exports.BLEND_LIGHTEN = BLEND_LIGHTEN;
var BLEND_HARDLIGHT = "hardLight";
exports.BLEND_HARDLIGHT = BLEND_HARDLIGHT;
var BLEND_DIFFERENCE = "difference";
exports.BLEND_DIFFERENCE = BLEND_DIFFERENCE;
var BLEND_EXCLUSION = "exclusion"; // Edge Handling

exports.BLEND_EXCLUSION = BLEND_EXCLUSION;
var EDGE_EXTEND = 1;
exports.EDGE_EXTEND = EDGE_EXTEND;
var EDGE_WRAP = 2;
exports.EDGE_WRAP = EDGE_WRAP;
var EDGE_CROP = 3;
exports.EDGE_CROP = EDGE_CROP;
//# sourceMappingURL=constants.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1728739681084, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.srcOver = srcOver;
exports.dstOver = dstOver;
exports.multiply = multiply;
exports.add = add;
exports.screen = screen;
exports.overlay = overlay;
exports.darken = darken;
exports.lighten = lighten;
exports.hardLight = hardLight;
exports.difference = difference;
exports.exclusion = exclusion;

function srcOver(src, dst) {
  var ops = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;
  src.a *= ops;
  var a = dst.a + src.a - dst.a * src.a;
  var r = (src.r * src.a + dst.r * dst.a * (1 - src.a)) / a;
  var g = (src.g * src.a + dst.g * dst.a * (1 - src.a)) / a;
  var b = (src.b * src.a + dst.b * dst.a * (1 - src.a)) / a;
  return {
    r: r,
    g: g,
    b: b,
    a: a
  };
}

function dstOver(src, dst) {
  var ops = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;
  src.a *= ops;
  var a = dst.a + src.a - dst.a * src.a;
  var r = (dst.r * dst.a + src.r * src.a * (1 - dst.a)) / a;
  var g = (dst.g * dst.a + src.g * src.a * (1 - dst.a)) / a;
  var b = (dst.b * dst.a + src.b * src.a * (1 - dst.a)) / a;
  return {
    r: r,
    g: g,
    b: b,
    a: a
  };
}

function multiply(src, dst) {
  var ops = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;
  src.a *= ops;
  var a = dst.a + src.a - dst.a * src.a;
  var sra = src.r * src.a;
  var sga = src.g * src.a;
  var sba = src.b * src.a;
  var dra = dst.r * dst.a;
  var dga = dst.g * dst.a;
  var dba = dst.b * dst.a;
  var r = (sra * dra + sra * (1 - dst.a) + dra * (1 - src.a)) / a;
  var g = (sga * dga + sga * (1 - dst.a) + dga * (1 - src.a)) / a;
  var b = (sba * dba + sba * (1 - dst.a) + dba * (1 - src.a)) / a;
  return {
    r: r,
    g: g,
    b: b,
    a: a
  };
}

function add(src, dst) {
  var ops = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;
  src.a *= ops;
  var a = dst.a + src.a - dst.a * src.a;
  var sra = src.r * src.a;
  var sga = src.g * src.a;
  var sba = src.b * src.a;
  var dra = dst.r * dst.a;
  var dga = dst.g * dst.a;
  var dba = dst.b * dst.a;
  var r = (sra + dra) / a;
  var g = (sga + dga) / a;
  var b = (sba + dba) / a;
  return {
    r: r,
    g: g,
    b: b,
    a: a
  };
}

function screen(src, dst) {
  var ops = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;
  src.a *= ops;
  var a = dst.a + src.a - dst.a * src.a;
  var sra = src.r * src.a;
  var sga = src.g * src.a;
  var sba = src.b * src.a;
  var dra = dst.r * dst.a;
  var dga = dst.g * dst.a;
  var dba = dst.b * dst.a;
  var r = (sra * dst.a + dra * src.a - sra * dra + sra * (1 - dst.a) + dra * (1 - src.a)) / a;
  var g = (sga * dst.a + dga * src.a - sga * dga + sga * (1 - dst.a) + dga * (1 - src.a)) / a;
  var b = (sba * dst.a + dba * src.a - sba * dba + sba * (1 - dst.a) + dba * (1 - src.a)) / a;
  return {
    r: r,
    g: g,
    b: b,
    a: a
  };
}

function overlay(src, dst) {
  var ops = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;
  src.a *= ops;
  var a = dst.a + src.a - dst.a * src.a;
  var sra = src.r * src.a;
  var sga = src.g * src.a;
  var sba = src.b * src.a;
  var dra = dst.r * dst.a;
  var dga = dst.g * dst.a;
  var dba = dst.b * dst.a;
  var r = (2 * dra <= dst.a ? 2 * sra * dra + sra * (1 - dst.a) + dra * (1 - src.a) : sra * (1 + dst.a) + dra * (1 + src.a) - 2 * dra * sra - dst.a * src.a) / a;
  var g = (2 * dga <= dst.a ? 2 * sga * dga + sga * (1 - dst.a) + dga * (1 - src.a) : sga * (1 + dst.a) + dga * (1 + src.a) - 2 * dga * sga - dst.a * src.a) / a;
  var b = (2 * dba <= dst.a ? 2 * sba * dba + sba * (1 - dst.a) + dba * (1 - src.a) : sba * (1 + dst.a) + dba * (1 + src.a) - 2 * dba * sba - dst.a * src.a) / a;
  return {
    r: r,
    g: g,
    b: b,
    a: a
  };
}

function darken(src, dst) {
  var ops = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;
  src.a *= ops;
  var a = dst.a + src.a - dst.a * src.a;
  var sra = src.r * src.a;
  var sga = src.g * src.a;
  var sba = src.b * src.a;
  var dra = dst.r * dst.a;
  var dga = dst.g * dst.a;
  var dba = dst.b * dst.a;
  var r = (Math.min(sra * dst.a, dra * src.a) + sra * (1 - dst.a) + dra * (1 - src.a)) / a;
  var g = (Math.min(sga * dst.a, dga * src.a) + sga * (1 - dst.a) + dga * (1 - src.a)) / a;
  var b = (Math.min(sba * dst.a, dba * src.a) + sba * (1 - dst.a) + dba * (1 - src.a)) / a;
  return {
    r: r,
    g: g,
    b: b,
    a: a
  };
}

function lighten(src, dst) {
  var ops = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;
  src.a *= ops;
  var a = dst.a + src.a - dst.a * src.a;
  var sra = src.r * src.a;
  var sga = src.g * src.a;
  var sba = src.b * src.a;
  var dra = dst.r * dst.a;
  var dga = dst.g * dst.a;
  var dba = dst.b * dst.a;
  var r = (Math.max(sra * dst.a, dra * src.a) + sra * (1 - dst.a) + dra * (1 - src.a)) / a;
  var g = (Math.max(sga * dst.a, dga * src.a) + sga * (1 - dst.a) + dga * (1 - src.a)) / a;
  var b = (Math.max(sba * dst.a, dba * src.a) + sba * (1 - dst.a) + dba * (1 - src.a)) / a;
  return {
    r: r,
    g: g,
    b: b,
    a: a
  };
}

function hardLight(src, dst) {
  var ops = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;
  src.a *= ops;
  var a = dst.a + src.a - dst.a * src.a;
  var sra = src.r * src.a;
  var sga = src.g * src.a;
  var sba = src.b * src.a;
  var dra = dst.r * dst.a;
  var dga = dst.g * dst.a;
  var dba = dst.b * dst.a;
  var r = (2 * sra <= src.a ? 2 * sra * dra + sra * (1 - dst.a) + dra * (1 - src.a) : sra * (1 + dst.a) + dra * (1 + src.a) - 2 * dra * sra - dst.a * src.a) / a;
  var g = (2 * sga <= src.a ? 2 * sga * dga + sga * (1 - dst.a) + dga * (1 - src.a) : sga * (1 + dst.a) + dga * (1 + src.a) - 2 * dga * sga - dst.a * src.a) / a;
  var b = (2 * sba <= src.a ? 2 * sba * dba + sba * (1 - dst.a) + dba * (1 - src.a) : sba * (1 + dst.a) + dba * (1 + src.a) - 2 * dba * sba - dst.a * src.a) / a;
  return {
    r: r,
    g: g,
    b: b,
    a: a
  };
}

function difference(src, dst) {
  var ops = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;
  src.a *= ops;
  var a = dst.a + src.a - dst.a * src.a;
  var sra = src.r * src.a;
  var sga = src.g * src.a;
  var sba = src.b * src.a;
  var dra = dst.r * dst.a;
  var dga = dst.g * dst.a;
  var dba = dst.b * dst.a;
  var r = (sra + dra - 2 * Math.min(sra * dst.a, dra * src.a)) / a;
  var g = (sga + dga - 2 * Math.min(sga * dst.a, dga * src.a)) / a;
  var b = (sba + dba - 2 * Math.min(sba * dst.a, dba * src.a)) / a;
  return {
    r: r,
    g: g,
    b: b,
    a: a
  };
}

function exclusion(src, dst) {
  var ops = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;
  src.a *= ops;
  var a = dst.a + src.a - dst.a * src.a;
  var sra = src.r * src.a;
  var sga = src.g * src.a;
  var sba = src.b * src.a;
  var dra = dst.r * dst.a;
  var dga = dst.g * dst.a;
  var dba = dst.b * dst.a;
  var r = (sra * dst.a + dra * src.a - 2 * sra * dra + sra * (1 - dst.a) + dra * (1 - src.a)) / a;
  var g = (sga * dst.a + dga * src.a - 2 * sga * dga + sga * (1 - dst.a) + dga * (1 - src.a)) / a;
  var b = (sba * dst.a + dba * src.a - 2 * sba * dba + sba * (1 - dst.a) + dba * (1 - src.a)) / a;
  return {
    r: r,
    g: g,
    b: b,
    a: a
  };
}
//# sourceMappingURL=composite-modes.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1728739681085, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var promisify = function promisify(fun, ctx) {
  for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    args[_key - 2] = arguments[_key];
  }

  return new Promise(function (resolve, reject) {
    args.push(function (err, data) {
      if (err) {
        reject(err);
      }

      resolve(data);
    });
    fun.bind(ctx).apply(void 0, args);
  });
};

var _default = promisify;
exports["default"] = _default;
module.exports = exports.default;
//# sourceMappingURL=promisify.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1728739681086, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getExtension = exports.getType = exports.addType = void 0;
var mimeTypes = {};

var findType = function findType(extension) {
  return Object.entries(mimeTypes).find(function (type) {
    return type[1].includes(extension);
  }) || [];
};

var addType = function addType(mime, extensions) {
  mimeTypes[mime] = extensions;
};
/**
 * Lookup a mime type based on extension
 * @param {string} path path to find extension for
 * @returns {string} mime found mime type
 */


exports.addType = addType;

var getType = function getType(path) {
  var pathParts = path.split("/").slice(-1);
  var extension = pathParts[pathParts.length - 1].split(".").pop();
  var type = findType(extension);
  return type[0];
};
/**
 * Return file extension associated with a mime type
 * @param {string} type mime type to look up
 * @returns {string} extension file extension
 */


exports.getType = getType;

var getExtension = function getExtension(type) {
  return (mimeTypes[type.toLowerCase()] || [])[0];
};

exports.getExtension = getExtension;
//# sourceMappingURL=mime.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1728739681087, function(require, module, exports) {


var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseBitmap = parseBitmap;
exports.getBuffer = getBuffer;
exports.getBufferAsync = getBufferAsync;

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _fileType = _interopRequireDefault(require("file-type"));

var _exifParser = _interopRequireDefault(require("exif-parser"));

var _utils = require("@jimp/utils");

var constants = _interopRequireWildcard(require("../constants"));

var MIME = _interopRequireWildcard(require("./mime"));

var _promisify = _interopRequireDefault(require("./promisify"));

function getMIMEFromBuffer(buffer, path) {
  var fileTypeFromBuffer;
  return _regenerator["default"].async(function getMIMEFromBuffer$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return _regenerator["default"].awrap(_fileType["default"].fromBuffer(buffer));

        case 2:
          fileTypeFromBuffer = _context.sent;

          if (!fileTypeFromBuffer) {
            _context.next = 5;
            break;
          }

          return _context.abrupt("return", fileTypeFromBuffer.mime);

        case 5:
          if (!path) {
            _context.next = 7;
            break;
          }

          return _context.abrupt("return", MIME.getType(path));

        case 7:
          return _context.abrupt("return", null);

        case 8:
        case "end":
          return _context.stop();
      }
    }
  });
}
/*
 * Obtains image orientation from EXIF metadata.
 *
 * @param img {Jimp} a Jimp image object
 * @returns {number} a number 1-8 representing EXIF orientation,
 *          in particular 1 if orientation tag is missing
 */


function getExifOrientation(img) {
  return img._exif && img._exif.tags && img._exif.tags.Orientation || 1;
}
/**
 * Returns a function which translates EXIF-rotated coordinates into
 * non-rotated ones.
 *
 * Transformation reference: http://sylvana.net/jpegcrop/exif_orientation.html.
 *
 * @param img {Jimp} a Jimp image object
 * @returns {function} transformation function for transformBitmap().
 */


function getExifOrientationTransformation(img) {
  var w = img.getWidth();
  var h = img.getHeight();

  switch (getExifOrientation(img)) {
    case 1:
      // Horizontal (normal)
      // does not need to be supported here
      return null;

    case 2:
      // Mirror horizontal
      return function (x, y) {
        return [w - x - 1, y];
      };

    case 3:
      // Rotate 180
      return function (x, y) {
        return [w - x - 1, h - y - 1];
      };

    case 4:
      // Mirror vertical
      return function (x, y) {
        return [x, h - y - 1];
      };

    case 5:
      // Mirror horizontal and rotate 270 CW
      return function (x, y) {
        return [y, x];
      };

    case 6:
      // Rotate 90 CW
      return function (x, y) {
        return [y, h - x - 1];
      };

    case 7:
      // Mirror horizontal and rotate 90 CW
      return function (x, y) {
        return [w - y - 1, h - x - 1];
      };

    case 8:
      // Rotate 270 CW
      return function (x, y) {
        return [w - y - 1, x];
      };

    default:
      return null;
  }
}
/*
 * Transforms bitmap in place (moves pixels around) according to given
 * transformation function.
 *
 * @param img {Jimp} a Jimp image object, which bitmap is supposed to
 *        be transformed
 * @param width {number} bitmap width after the transformation
 * @param height {number} bitmap height after the transformation
 * @param transformation {function} transformation function which defines pixel
 *        mapping between new and source bitmap. It takes a pair of coordinates
 *        in the target, and returns a respective pair of coordinates in
 *        the source bitmap, i.e. has following form:
 *        `function(new_x, new_y) { return [src_x, src_y] }`.
 */


function transformBitmap(img, width, height, transformation) {
  // Underscore-prefixed values are related to the source bitmap
  // Their counterparts with no prefix are related to the target bitmap
  var _data = img.bitmap.data;
  var _width = img.bitmap.width;
  var data = Buffer.alloc(_data.length);

  for (var x = 0; x < width; x++) {
    for (var y = 0; y < height; y++) {
      var _transformation = transformation(x, y),
          _transformation2 = (0, _slicedToArray2["default"])(_transformation, 2),
          _x = _transformation2[0],
          _y = _transformation2[1];

      var idx = width * y + x << 2;

      var _idx = _width * _y + _x << 2;

      var pixel = _data.readUInt32BE(_idx);

      data.writeUInt32BE(pixel, idx);
    }
  }

  img.bitmap.data = data;
  img.bitmap.width = width;
  img.bitmap.height = height;
}
/*
 * Automagically rotates an image based on its EXIF data (if present).
 * @param img {Jimp} a Jimp image object
 */


function exifRotate(img) {
  if (getExifOrientation(img) < 2) return;
  var transformation = getExifOrientationTransformation(img);
  var swapDimensions = getExifOrientation(img) > 4;
  var newWidth = swapDimensions ? img.bitmap.height : img.bitmap.width;
  var newHeight = swapDimensions ? img.bitmap.width : img.bitmap.height;
  transformBitmap(img, newWidth, newHeight, transformation);
} // parses a bitmap from the constructor to the JIMP bitmap property


function parseBitmap(data, path, cb) {
  var mime, _mime;

  return _regenerator["default"].async(function parseBitmap$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.next = 2;
          return _regenerator["default"].awrap(getMIMEFromBuffer(data, path));

        case 2:
          mime = _context2.sent;

          if (!(typeof mime !== "string")) {
            _context2.next = 5;
            break;
          }

          return _context2.abrupt("return", cb(new Error("Could not find MIME for Buffer <" + path + ">")));

        case 5:
          this._originalMime = mime.toLowerCase();
          _context2.prev = 6;
          _mime = this.getMIME();

          if (!this.constructor.decoders[_mime]) {
            _context2.next = 12;
            break;
          }

          this.bitmap = this.constructor.decoders[_mime](data);
          _context2.next = 13;
          break;

        case 12:
          return _context2.abrupt("return", _utils.throwError.call(this, "Unsupported MIME type: " + _mime, cb));

        case 13:
          _context2.next = 18;
          break;

        case 15:
          _context2.prev = 15;
          _context2.t0 = _context2["catch"](6);
          return _context2.abrupt("return", cb.call(this, _context2.t0, this));

        case 18:
          try {
            this._exif = _exifParser["default"].create(data).parse();
            exifRotate(this); // EXIF data
          } catch (error) {
            /* meh */
          }

          cb.call(this, null, this);
          return _context2.abrupt("return", this);

        case 21:
        case "end":
          return _context2.stop();
      }
    }
  }, null, this, [[6, 15]]);
}

function compositeBitmapOverBackground(Jimp, image) {
  return new Jimp(image.bitmap.width, image.bitmap.height, image._background).composite(image, 0, 0).bitmap;
}
/**
 * Converts the image to a buffer
 * @param {string} mime the mime type of the image buffer to be created
 * @param {function(Error, Jimp)} cb a Node-style function to call with the buffer as the second argument
 * @returns {Jimp} this for chaining of methods
 */


function getBuffer(mime, cb) {
  if (mime === constants.AUTO) {
    // allow auto MIME detection
    mime = this.getMIME();
  }

  if (typeof mime !== "string") {
    return _utils.throwError.call(this, "mime must be a string", cb);
  }

  if (typeof cb !== "function") {
    return _utils.throwError.call(this, "cb must be a function", cb);
  }

  mime = mime.toLowerCase();

  if (this._rgba && this.constructor.hasAlpha[mime]) {
    this.bitmap.data = Buffer.from(this.bitmap.data);
  } else {
    // when format doesn't support alpha
    // composite onto a new image so that the background shows through alpha channels
    this.bitmap.data = compositeBitmapOverBackground(this.constructor, this).data;
  }

  if (this.constructor.encoders[mime]) {
    var buffer = this.constructor.encoders[mime](this);
    cb.call(this, null, buffer);
  } else {
    cb.call(this, "Unsupported MIME type: " + mime);
  }

  return this;
}

function getBufferAsync(mime) {
  return (0, _promisify["default"])(getBuffer, this, mime);
}
//# sourceMappingURL=image-bitmap.js.map
}, function(modId) { var map = {"../constants":1728739681083,"./mime":1728739681086,"./promisify":1728739681085}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1728739681079);
})()
//miniprogram-npm-outsideDeps=["@babel/runtime/helpers/interopRequireWildcard","@babel/runtime/helpers/interopRequireDefault","@babel/runtime/helpers/construct","@babel/runtime/helpers/slicedToArray","@babel/runtime/helpers/classCallCheck","@babel/runtime/helpers/createClass","@babel/runtime/helpers/possibleConstructorReturn","@babel/runtime/helpers/getPrototypeOf","@babel/runtime/helpers/assertThisInitialized","@babel/runtime/helpers/inherits","@babel/runtime/helpers/defineProperty","@babel/runtime/helpers/typeof","fs","path","events","@jimp/utils","any-base","mkdirp","pixelmatch","tinycolor2","@babel/runtime/helpers/extends","phin","@babel/runtime/regenerator","file-type","exif-parser"]
//# sourceMappingURL=index.js.map