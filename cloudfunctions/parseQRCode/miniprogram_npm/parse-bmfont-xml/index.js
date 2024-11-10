module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1731211820339, function(require, module, exports) {
var xml2js = require('xml2js')
var parseAttributes = require('./parse-attribs')

module.exports = function parseBMFontXML(data) {
  data = data.toString().trim()

  var output = {
    pages: [],
    chars: [],
    kernings: []
  }

  xml2js.parseString(data, function(err, result) {
    if (err)
      throw err
    if (!result.font)
      throw "XML bitmap font doesn't have <font> root"
    result = result.font

    output.common = parseAttributes(result.common[0].$)
    output.info = parseAttributes(result.info[0].$)

    for (var i = 0; i < result.pages.length; i++) {
      var p = result.pages[i].page[0].$

      if (typeof p.id === "undefined")
        throw new Error("malformed file -- needs page id=N")
      if (typeof p.file !== "string")
        throw new Error("malformed file -- needs page file=\"path\"")

      output.pages[parseInt(p.id, 10)] = p.file
    }

    if (result.chars) {
      var chrArray = result.chars[0]['char'] || []
      for (var i = 0; i < chrArray.length; i++) {
        output.chars.push(parseAttributes(chrArray[i].$))
      }
    }

    if (result.kernings) {
      var kernArray = result.kernings[0]['kerning'] || []
      for (var i = 0; i < kernArray.length; i++) {
        output.kernings.push(parseAttributes(kernArray[i].$))
      }
    }
  })
  return output
}

}, function(modId) {var map = {"./parse-attribs":1731211820340}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1731211820340, function(require, module, exports) {
//Some versions of GlyphDesigner have a typo
//that causes some bugs with parsing. 
//Need to confirm with recent version of the software
//to see whether this is still an issue or not.
var GLYPH_DESIGNER_ERROR = 'chasrset'

module.exports = function parseAttributes(obj) {
  obj = Object.assign({}, obj)
  if (GLYPH_DESIGNER_ERROR in obj) {
    obj['charset'] = obj[GLYPH_DESIGNER_ERROR]
    delete obj[GLYPH_DESIGNER_ERROR]
  }

  for (var k in obj) {
    if (k === 'face' || k === 'charset') 
      continue
    else if (k === 'padding' || k === 'spacing')
      obj[k] = parseIntList(obj[k])
    else
      obj[k] = parseInt(obj[k], 10) 
  }
  return obj
}

function parseIntList(data) {
  return data.split(',').map(function(val) {
    return parseInt(val, 10)
  })
}
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1731211820339);
})()
//miniprogram-npm-outsideDeps=["xml2js"]
//# sourceMappingURL=index.js.map