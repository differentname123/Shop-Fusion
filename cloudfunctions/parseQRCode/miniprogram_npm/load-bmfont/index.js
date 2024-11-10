module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1731211820285, function(require, module, exports) {
var fs = require('fs')
var url = require('url')
var path = require('path')
var request = require('phin')
var parseASCII = require('parse-bmfont-ascii')
var parseXML = require('parse-bmfont-xml')
var readBinary = require('parse-bmfont-binary')
var mime = require('mime')
var noop = function() {}
var isBinary = require('./lib/is-binary')

function parseFont(file, data, cb) {
  var result, binary

  if (isBinary(data)) {
    if (typeof data === 'string') data = Buffer.from(data, 'binary')
    binary = true
  } else data = data.toString().trim()

  try {
    if (binary) result = readBinary(data)
    else if (/json/.test(mime.lookup(file)) || data.charAt(0) === '{')
      result = JSON.parse(data)
    else if (/xml/.test(mime.lookup(file)) || data.charAt(0) === '<')
      result = parseXML(data)
    else result = parseASCII(data)
  } catch (e) {
    cb(e)
    cb = noop
  }

  cb(null, result)
}

module.exports = function loadFont(opt, cb) {
  cb = typeof cb === 'function' ? cb : noop

  if (typeof opt === 'string') opt = { uri: opt, url: opt }
  else if (!opt) opt = {}

  var file = opt.uri || opt.url
  
  function handleData(err, data) {
    if (err) return cb(err)
    parseFont(file, data.body || data, cb)
  }

  if (url.parse(file).host) {
    request(opt).then(function (res) {
      handleData(null, res)
    }).catch(function (err) {
      handleData(err)
    })
  } else {
    fs.readFile(file, opt, handleData)
  }
}

}, function(modId) {var map = {"./lib/is-binary":1731211820286}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1731211820286, function(require, module, exports) {
var equal = require('buffer-equal')
var HEADER = Buffer.from([66, 77, 70, 3])

module.exports = function(buf) {
  if (typeof buf === 'string')
    return buf.substring(0, 3) === 'BMF'
  return buf.length > 4 && equal(buf.slice(0, 4), HEADER)
}
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1731211820285);
})()
//miniprogram-npm-outsideDeps=["fs","url","path","phin","parse-bmfont-ascii","parse-bmfont-xml","parse-bmfont-binary","mime","buffer-equal"]
//# sourceMappingURL=index.js.map