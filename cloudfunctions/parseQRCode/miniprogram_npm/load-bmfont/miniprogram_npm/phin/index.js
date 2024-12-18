module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1731211820284, function(require, module, exports) {
const {URL} = require('url')

const centra = require('centra')

const unspecifiedFollowRedirectsDefault = 20

/**
* phin options object. phin also supports all options from <a href="https://nodejs.org/api/http.html#http_http_request_options_callback">http.request(options, callback)</a> by passing them on to this method (or similar).
* @typedef {Object} phinOptions
* @property {string} url - URL to request (autodetect infers from this URL)
* @property {string} [method=GET] - Request method ('GET', 'POST', etc.)
* @property {string|Buffer|object} [data] - Data to send as request body (phin may attempt to convert this data to a string if it isn't already)
* @property {Object} [form] - Object to send as form data (sets 'Content-Type' and 'Content-Length' headers, as well as request body) (overwrites 'data' option if present)
* @property {Object} [headers={}] - Request headers
* @property {Object} [core={}] - Custom core HTTP options
* @property {string} [parse=none] - Response parsing. Errors will be given if the response can't be parsed. 'none' returns body as a `Buffer`, 'json' attempts to parse the body as JSON, and 'string' attempts to parse the body as a string
* @property {boolean} [followRedirects=false] - Enable HTTP redirect following
* @property {boolean} [stream=false] - Enable streaming of response. (Removes body property)
* @property {boolean} [compression=false] - Enable compression for request
* @property {?number} [timeout=null] - Request timeout in milliseconds
* @property {string} [hostname=autodetect] - URL hostname
* @property {Number} [port=autodetect] - URL port
* @property {string} [path=autodetect] - URL path
*/

/**
* Response data
* @callback phinResponseCallback
* @param {?(Error|string)} error - Error if any occurred in request, otherwise null.
* @param {?http.serverResponse} phinResponse - phin response object. Like <a href='https://nodejs.org/api/http.html#http_class_http_serverresponse'>http.ServerResponse</a> but has a body property containing response body, unless stream. If stream option is enabled, a stream property will be provided to callback with a readable stream.
*/

/**
* Sends an HTTP request
* @param {phinOptions|string} options - phin options object (or string for auto-detection)
* @returns {Promise<http.serverResponse>} - phin-adapted response object
*/
const phin = async (opts) => {
	if (typeof(opts) !== 'string') {
		if (!opts.hasOwnProperty('url')) {
			throw new Error('Missing url option from options for request method.')
		}
	}

	const req = centra(typeof opts === 'object' ? opts.url : opts, opts.method || 'GET')

	if (opts.headers) req.header(opts.headers)
	if (opts.stream) req.stream()
	if (opts.timeout) req.timeout(opts.timeout)
	if (opts.data) req.body(opts.data)
	if (opts.form) req.body(opts.form, 'form')
	if (opts.compression) req.compress()

	if (opts.followRedirects) {
		if (opts.followRedirects === true) {
			req.followRedirects(unspecifiedFollowRedirectsDefault)
		} else if (typeof opts.followRedirects === 'number') {
			req.followRedirects(opts.followRedirects)
		}
	}

	if (typeof opts.core === 'object') {
		Object.keys(opts.core).forEach((optName) => {
			req.option(optName, opts.core[optName])
		})
	}

	const res = await req.send()

	if (opts.stream) {
		res.stream = res

		return res
	}
	else {
		res.coreRes.body = res.body

		if (opts.parse) {
			if (opts.parse === 'json') {
				res.coreRes.body = await res.json()
	
				return res.coreRes
			}
			else if (opts.parse === 'string') {
				res.coreRes.body = res.coreRes.body.toString()

				return res.coreRes
			}
		}
		
		return res.coreRes
	}
}

// If we're running Node.js 8+, let's promisify it

phin.promisified = phin

phin.unpromisified = (opts, cb) => {
	phin(opts).then((data) => {
		if (cb) cb(null, data)
	}).catch((err) => {
		if (cb) cb(err, null)
	})
}

// Defaults

phin.defaults = (defaultOpts) => async (opts) => {
	const nops = typeof opts === 'string' ? {'url': opts} : opts

	Object.keys(defaultOpts).forEach((doK) => {
		if (!nops.hasOwnProperty(doK) || nops[doK] === null) {
			nops[doK] = defaultOpts[doK]
		}
	})

	return await phin(nops)
}

module.exports = phin

}, function(modId) {var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1731211820284);
})()
//miniprogram-npm-outsideDeps=["url","centra"]
//# sourceMappingURL=index.js.map