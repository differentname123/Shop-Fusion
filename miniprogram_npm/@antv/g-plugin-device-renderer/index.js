module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1731211820580, function(require, module, exports) {


var tslib = require('tslib');
var gLite = require('@antv/g-lite');
var util = require('@antv/util');
var gDeviceApi = require('@antv/g-device-api');
var glMatrix = require('gl-matrix');
var EventEmitter = require('eventemitter3');
var earcut = require('earcut');
var gMath = require('@antv/g-math');

var Renderable3D = /** @class */ (function () {
    function Renderable3D() {
        this.drawcalls = [];
    }
    Renderable3D.tag = 'c-renderable-3d';
    return Renderable3D;
}());

var LightPool = /** @class */ (function () {
    function LightPool() {
        /**
         * lights
         */
        this.lights = [];
    }
    LightPool.prototype.addLight = function (light) {
        this.lights.push(light);
        this.sortLights();
    };
    LightPool.prototype.removeLight = function (light) {
        var i = this.lights.indexOf(light);
        this.lights.splice(i, 1);
        this.sortLights();
    };
    LightPool.prototype.addFog = function (fog) {
        this.fog = fog;
    };
    LightPool.prototype.removeFog = function (fog) {
        this.fog = null;
    };
    LightPool.prototype.getFog = function () {
        return this.fog;
    };
    LightPool.prototype.getAllLights = function () {
        return this.lights;
    };
    /**
     * USE_LIGHT
     * NUM_AMBIENT_LIGHTS
     * NUM_DIR_LIGHTS
     */
    LightPool.prototype.getDefines = function () {
        var defines = {
            USE_LIGHT: !!this.lights.length,
        };
        this.lights.forEach(function (light) {
            if (!defines[light.define]) {
                defines[light.define] = 0;
            }
            defines[light.define]++;
        });
        return defines;
    };
    LightPool.prototype.sortLights = function () {
        this.lights.sort(function (a, b) { return a.order - b.order; });
    };
    return LightPool;
}());

var Mesh = /** @class */ (function (_super) {
    tslib.__extends(Mesh, _super);
    function Mesh(_a) {
        var _this = this;
        var style = _a.style, rest = tslib.__rest(_a, ["style"]);
        _this = _super.call(this, tslib.__assign({ type: gLite.Shape.MESH, style: tslib.__assign({ x: '', y: '', z: '', lineWidth: 0, anchor: [0.5, 0.5, 0.5] }, style) }, rest)) || this;
        _this.cullable.enable = false;
        _this.style.geometry.meshes.push(_this);
        _this.style.material.meshes.push(_this);
        return _this;
    }
    // getVertexBufferData(bufferIndex: number) {
    //   return this.style.geometry.vertexBuffers[bufferIndex];
    // }
    // setVertexBufferData(descriptor: {
    //   bufferIndex: number;
    //   byteOffset: number;
    //   data: ArrayBufferView;
    // }) {}
    Mesh.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        // detach from geometry
        var meshes = this.style.geometry.meshes;
        var index = meshes.indexOf(this);
        meshes.splice(index, 1);
        // detach from material
        meshes = this.style.material.meshes;
        index = meshes.indexOf(this);
        meshes.splice(index, 1);
    };
    return Mesh;
}(gLite.DisplayObject));

var MeshUpdater = /** @class */ (function () {
    function MeshUpdater() {
    }
    MeshUpdater.prototype.update = function (parsedStyle) {
        var geometry = parsedStyle.geometry;
        var aabb = geometry.computeBoundingBox();
        var max = aabb.getMax();
        var min = aabb.getMin();
        var width = max[0] - min[0];
        var height = max[1] - min[1];
        var depth = max[2] - min[2];
        return {
            width: width,
            height: height,
            depth: depth,
        };
    };
    return MeshUpdater;
}());

var PickingIdGenerator = /** @class */ (function () {
    function PickingIdGenerator() {
        this.counter = 0;
        this.id2DisplayObjectMap = {};
    }
    PickingIdGenerator.prototype.getId = function (displayObject) {
        var id = this.counter++;
        this.id2DisplayObjectMap[id] = displayObject;
        return id;
    };
    PickingIdGenerator.prototype.getById = function (id) {
        return this.id2DisplayObjectMap[id];
    };
    PickingIdGenerator.prototype.deleteById = function (id) {
        delete this.id2DisplayObjectMap[id];
    };
    PickingIdGenerator.prototype.reset = function () {
        this.counter = 0;
        this.id2DisplayObjectMap = {};
    };
    PickingIdGenerator.prototype.decodePickingColor = function (color) {
        var _a = tslib.__read(color, 3), i1 = _a[0], i2 = _a[1], i3 = _a[2];
        var index = i1 + i2 * 256 + i3 * 65536 - 1;
        return index;
    };
    PickingIdGenerator.prototype.encodePickingColor = function (featureIdx) {
        return [
            (featureIdx + 1) & 255,
            ((featureIdx + 1) >> 8) & 255,
            (((featureIdx + 1) >> 8) >> 8) & 255,
        ];
    };
    return PickingIdGenerator;
}());

var DeviceProgram = /** @class */ (function () {
    function DeviceProgram() {
        this.name = '(unnamed)';
        // Compiled program.
        this.preprocessedVert = '';
        this.preprocessedFrag = '';
        // Inputs.
        this.both = '';
        this.vert = '';
        this.frag = '';
        this.defines = {};
    }
    DeviceProgram.prototype.definesChanged = function () {
        this.preprocessedVert = '';
        this.preprocessedFrag = '';
    };
    DeviceProgram.prototype.setDefineString = function (name, v) {
        if (v !== null) {
            if (this.defines[name] === v)
                return false;
            this.defines[name] = v;
        }
        else {
            if (util.isNil(this.defines[name]))
                return false;
            delete this.defines[name];
        }
        this.definesChanged();
        return true;
    };
    DeviceProgram.prototype.setDefineBool = function (name, v) {
        return this.setDefineString(name, v ? '1' : null);
    };
    DeviceProgram.prototype.getDefineString = function (name) {
        return gDeviceApi.nullify(this.defines[name]);
    };
    DeviceProgram.prototype.getDefineBool = function (name) {
        var str = this.getDefineString(name);
        if (str !== null)
            gDeviceApi.assert(str === '1');
        return str !== null;
    };
    return DeviceProgram;
}());

// This is a very basic linear allocator. We allocate offsets in-order.
var DynamicUniformBuffer = /** @class */ (function () {
    function DynamicUniformBuffer(device) {
        /**
         * Word count, 4 bytes per word
         */
        this.currentBufferWordSize = -1;
        this.currentWordOffset = 0;
        this.buffer = null;
        this.shadowBufferF32 = null;
        this.shadowBufferU8 = null;
        this.device = device;
        var limits = device.queryLimits();
        this.uniformBufferWordAlignment = limits.uniformBufferWordAlignment;
        this.uniformBufferMaxPageWordSize = limits.uniformBufferMaxPageWordSize;
    }
    DynamicUniformBuffer.prototype.isSupportedUBO = function () {
        // UBO not supported in WebGL1
        return this.device.queryVendorInfo().platformString !== 'WebGL1';
    };
    DynamicUniformBuffer.prototype.findPageIndex = function (wordOffset) {
        return (wordOffset / this.uniformBufferMaxPageWordSize) | 0;
    };
    DynamicUniformBuffer.prototype.allocateChunk = function (wordCount) {
        wordCount = gDeviceApi.alignNonPowerOfTwo(wordCount, this.uniformBufferWordAlignment);
        gDeviceApi.assert(wordCount < this.uniformBufferMaxPageWordSize);
        var wordOffset = this.currentWordOffset;
        // If we straddle the page, then put it at the start of the next one.
        if (this.findPageIndex(wordOffset) !==
            this.findPageIndex(wordOffset + wordCount - 1))
            wordOffset = gDeviceApi.alignNonPowerOfTwo(wordOffset, this.uniformBufferMaxPageWordSize);
        this.currentWordOffset = wordOffset + wordCount;
        this.ensureShadowBuffer(wordOffset, wordCount);
        return wordOffset;
    };
    DynamicUniformBuffer.prototype.ensureShadowBuffer = function (wordOffset, wordCount) {
        if (this.shadowBufferU8 === null || this.shadowBufferF32 === null) {
            var newWordCount = gDeviceApi.alignNonPowerOfTwo(this.currentWordOffset, this.uniformBufferMaxPageWordSize);
            this.shadowBufferU8 = new Uint8Array(newWordCount * 4);
            this.shadowBufferF32 = new Float32Array(this.shadowBufferU8.buffer);
        }
        else if (wordOffset + wordCount >= this.shadowBufferF32.length) {
            gDeviceApi.assert(wordOffset < this.currentWordOffset &&
                wordOffset + wordCount <= this.currentWordOffset);
            // Grow logarithmically, aligned to page size.
            var newWordCount = gDeviceApi.alignNonPowerOfTwo(Math.max(this.currentWordOffset, this.shadowBufferF32.length * 2), this.uniformBufferMaxPageWordSize);
            var newBuffer = new Uint8Array(newWordCount * 4);
            newBuffer.set(this.shadowBufferU8, 0);
            this.shadowBufferU8 = newBuffer;
            this.shadowBufferF32 = new Float32Array(this.shadowBufferU8.buffer);
            if (!(this.currentWordOffset <= newWordCount))
                throw new Error("Assert fail: this.currentWordOffset [".concat(this.currentWordOffset, "] <= newWordCount [").concat(newWordCount, "]"));
        }
    };
    /**
     * Return the CPU data buffer used internally. Fill this in to submit data to the CPU. Write to
     * it with the offset that was returned from {@see allocateChunk}.
     */
    DynamicUniformBuffer.prototype.mapBufferF32 = function () {
        return gDeviceApi.assertExists(this.shadowBufferF32);
    };
    DynamicUniformBuffer.prototype.prepareToRender = function () {
        if (this.shadowBufferF32 === null) {
            return;
        }
        var shadowBufferF32 = gDeviceApi.assertExists(this.shadowBufferF32);
        if (shadowBufferF32.length !== this.currentBufferWordSize) {
            this.currentBufferWordSize = shadowBufferF32.length;
            if (this.buffer !== null) {
                this.buffer.destroy();
            }
            this.buffer = this.device.createBuffer({
                // in bytes length
                viewOrSize: this.currentBufferWordSize * 4,
                usage: gDeviceApi.BufferUsage.UNIFORM,
                hint: gDeviceApi.BufferFrequencyHint.DYNAMIC,
            });
        }
        var wordCount = gDeviceApi.alignNonPowerOfTwo(this.currentWordOffset, this.uniformBufferMaxPageWordSize);
        if (!(wordCount <= this.currentBufferWordSize))
            throw new Error("Assert fail: wordCount [".concat(wordCount, "] (").concat(this.currentWordOffset, " aligned ").concat(this.uniformBufferMaxPageWordSize, ") <= this.currentBufferWordSize [").concat(this.currentBufferWordSize, "]"));
        if (this.isSupportedUBO()) {
            var buffer = gDeviceApi.assertExists(this.buffer);
            buffer.setSubData(0, this.shadowBufferU8, 0, wordCount * 4);
        }
        // Reset the offset for next frame.
        this.currentWordOffset = 0;
    };
    DynamicUniformBuffer.prototype.destroy = function () {
        if (this.buffer !== null)
            this.buffer.destroy();
        this.shadowBufferF32 = null;
        this.shadowBufferU8 = null;
    };
    return DynamicUniformBuffer;
}());

// Jenkins One-at-a-Time hash from http://www.burtleburtle.net/bob/hash/doobs.html
function hashCodeNumberUpdate(hash, v) {
    hash += v;
    hash += hash << 10;
    hash += hash >>> 6;
    return hash >>> 0;
}
function hashCodeNumberFinish(hash) {
    hash += hash << 3;
    hash ^= hash >>> 11;
    hash += hash << 15;
    return hash >>> 0;
}
// Pass this as a hash function to use a one-bucket HashMap (equivalent to linear search in an array),
// which can be efficient for small numbers of items.
function nullHashFunc(k) {
    return 0;
}
var HashBucket = /** @class */ (function () {
    function HashBucket() {
        this.keys = [];
        this.values = [];
    }
    return HashBucket;
}());
var HashMap = /** @class */ (function () {
    function HashMap(keyEqualFunc, keyHashFunc) {
        this.keyEqualFunc = keyEqualFunc;
        this.keyHashFunc = keyHashFunc;
        this.buckets = new Map();
    }
    HashMap.prototype.findBucketIndex = function (bucket, k) {
        for (var i = 0; i < bucket.keys.length; i++)
            if (this.keyEqualFunc(k, bucket.keys[i]))
                return i;
        return -1;
    };
    HashMap.prototype.findBucket = function (k) {
        var bw = this.keyHashFunc(k);
        return this.buckets.get(bw);
    };
    HashMap.prototype.get = function (k) {
        var bucket = this.findBucket(k);
        if (bucket === undefined)
            return null;
        var bi = this.findBucketIndex(bucket, k);
        if (bi < 0)
            return null;
        return bucket.values[bi];
    };
    HashMap.prototype.add = function (k, v) {
        var bw = this.keyHashFunc(k);
        if (this.buckets.get(bw) === undefined)
            this.buckets.set(bw, new HashBucket());
        var bucket = this.buckets.get(bw);
        bucket.keys.push(k);
        bucket.values.push(v);
    };
    HashMap.prototype.delete = function (k) {
        var bucket = this.findBucket(k);
        if (bucket === undefined)
            return;
        var bi = this.findBucketIndex(bucket, k);
        if (bi === -1)
            return;
        bucket.keys.splice(bi, 1);
        bucket.values.splice(bi, 1);
    };
    HashMap.prototype.clear = function () {
        this.buckets.clear();
    };
    HashMap.prototype.size = function () {
        var e_1, _a;
        var acc = 0;
        try {
            for (var _b = tslib.__values(this.buckets.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var bucket = _c.value;
                acc += bucket.values.length;
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return acc;
    };
    HashMap.prototype.values = function () {
        var _a, _b, bucket, j, e_2_1;
        var e_2, _c;
        return tslib.__generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 7, 8, 9]);
                    _a = tslib.__values(this.buckets.values()), _b = _a.next();
                    _d.label = 1;
                case 1:
                    if (!!_b.done) return [3 /*break*/, 6];
                    bucket = _b.value;
                    j = bucket.values.length - 1;
                    _d.label = 2;
                case 2:
                    if (!(j >= 0)) return [3 /*break*/, 5];
                    return [4 /*yield*/, bucket.values[j]];
                case 3:
                    _d.sent();
                    _d.label = 4;
                case 4:
                    j--;
                    return [3 /*break*/, 2];
                case 5:
                    _b = _a.next();
                    return [3 /*break*/, 1];
                case 6: return [3 /*break*/, 9];
                case 7:
                    e_2_1 = _d.sent();
                    e_2 = { error: e_2_1 };
                    return [3 /*break*/, 9];
                case 8:
                    try {
                        if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                    }
                    finally { if (e_2) throw e_2.error; }
                    return [7 /*endfinally*/];
                case 9: return [2 /*return*/];
            }
        });
    };
    return HashMap;
}());

function preprocessProgramObj_GLSL(device, obj) {
    var defines = obj.defines !== undefined ? obj.defines : null;
    var vert = obj.both !== undefined ? obj.both + obj.vert : obj.vert;
    var frag = obj.both !== undefined ? obj.both + obj.frag : obj.frag;
    return gDeviceApi.preprocessProgram_GLSL(device.queryVendorInfo(), vert, frag, defines);
}
function programDescriptorSimpleEquals(a, b) {
    gDeviceApi.assert(a.preprocessedVert !== '' && b.preprocessedVert !== '');
    gDeviceApi.assert(a.preprocessedFrag !== '' && b.preprocessedFrag !== '');
    return (a.preprocessedVert === b.preprocessedVert &&
        a.preprocessedFrag === b.preprocessedFrag);
}
function programDescriptorSimpleCopy(a) {
    var preprocessedVert = a.preprocessedVert;
    var preprocessedFrag = a.preprocessedFrag;
    var vert = a.vert;
    var frag = a.frag;
    return { preprocessedVert: preprocessedVert, preprocessedFrag: preprocessedFrag, vert: vert, frag: frag };
}
function blendStateHash(hash, a) {
    hash = hashCodeNumberUpdate(hash, a.blendMode);
    hash = hashCodeNumberUpdate(hash, a.blendSrcFactor);
    hash = hashCodeNumberUpdate(hash, a.blendDstFactor);
    return hash;
}
function attachmentStateHash(hash, a) {
    hash = blendStateHash(hash, a.rgbBlendState);
    hash = blendStateHash(hash, a.alphaBlendState);
    hash = hashCodeNumberUpdate(hash, a.channelWriteMask);
    return hash;
}
function colorHash(hash, a) {
    hash = hashCodeNumberUpdate(hash, (a.r << 24) | (a.g << 16) | (a.b << 8) | a.a);
    return hash;
}
function megaStateDescriptorHash(hash, a) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    for (var i = 0; i < a.attachmentsState.length; i++)
        hash = attachmentStateHash(hash, a.attachmentsState[i]);
    hash = colorHash(hash, a.blendConstant);
    hash = hashCodeNumberUpdate(hash, a.depthCompare);
    hash = hashCodeNumberUpdate(hash, a.depthWrite ? 1 : 0);
    hash = hashCodeNumberUpdate(hash, (_a = a.stencilFront) === null || _a === void 0 ? void 0 : _a.compare);
    hash = hashCodeNumberUpdate(hash, (_b = a.stencilFront) === null || _b === void 0 ? void 0 : _b.passOp);
    hash = hashCodeNumberUpdate(hash, (_c = a.stencilFront) === null || _c === void 0 ? void 0 : _c.failOp);
    hash = hashCodeNumberUpdate(hash, (_d = a.stencilFront) === null || _d === void 0 ? void 0 : _d.depthFailOp);
    hash = hashCodeNumberUpdate(hash, (_e = a.stencilBack) === null || _e === void 0 ? void 0 : _e.compare);
    hash = hashCodeNumberUpdate(hash, (_f = a.stencilBack) === null || _f === void 0 ? void 0 : _f.passOp);
    hash = hashCodeNumberUpdate(hash, (_g = a.stencilBack) === null || _g === void 0 ? void 0 : _g.failOp);
    hash = hashCodeNumberUpdate(hash, (_h = a.stencilBack) === null || _h === void 0 ? void 0 : _h.depthFailOp);
    hash = hashCodeNumberUpdate(hash, a.stencilWrite ? 1 : 0);
    hash = hashCodeNumberUpdate(hash, a.cullMode);
    hash = hashCodeNumberUpdate(hash, a.frontFace ? 1 : 0);
    hash = hashCodeNumberUpdate(hash, a.polygonOffset ? 1 : 0);
    return hash;
}
function renderPipelineDescriptorHash(a) {
    var hash = 0;
    hash = hashCodeNumberUpdate(hash, a.program.id);
    if (a.inputLayout !== null)
        hash = hashCodeNumberUpdate(hash, a.inputLayout.id);
    hash = megaStateDescriptorHash(hash, a.megaStateDescriptor);
    for (var i = 0; i < a.colorAttachmentFormats.length; i++)
        hash = hashCodeNumberUpdate(hash, a.colorAttachmentFormats[i] || 0);
    hash = hashCodeNumberUpdate(hash, a.depthStencilAttachmentFormat || 0);
    return hashCodeNumberFinish(hash);
}
function bindingsDescriptorHash(a) {
    var hash = 0;
    for (var i = 0; i < a.samplerBindings.length; i++) {
        var binding = a.samplerBindings[i];
        if (binding !== null && binding.texture !== null)
            hash = hashCodeNumberUpdate(hash, binding.texture.id);
    }
    for (var i = 0; i < a.uniformBufferBindings.length; i++) {
        var binding = a.uniformBufferBindings[i];
        if (binding !== null && binding.buffer !== null) {
            hash = hashCodeNumberUpdate(hash, binding.buffer.id);
            hash = hashCodeNumberUpdate(hash, binding.binding);
            hash = hashCodeNumberUpdate(hash, binding.offset);
            hash = hashCodeNumberUpdate(hash, binding.size);
        }
    }
    return hashCodeNumberFinish(hash);
}
var RenderCache = /** @class */ (function () {
    function RenderCache(device) {
        this.bindingsCache = new HashMap(gDeviceApi.bindingsDescriptorEquals, bindingsDescriptorHash);
        this.renderPipelinesCache = new HashMap(gDeviceApi.renderPipelineDescriptorEquals, renderPipelineDescriptorHash);
        this.inputLayoutsCache = new HashMap(gDeviceApi.inputLayoutDescriptorEquals, nullHashFunc);
        this.programCache = new HashMap(programDescriptorSimpleEquals, nullHashFunc);
        this.samplerCache = new HashMap(gDeviceApi.samplerDescriptorEquals, nullHashFunc);
        this.device = device;
    }
    RenderCache.prototype.createBindings = function (descriptor) {
        var bindings = this.bindingsCache.get(descriptor);
        if (bindings === null) {
            var descriptorCopy = gDeviceApi.bindingsDescriptorCopy(descriptor);
            descriptorCopy.uniformBufferBindings =
                descriptorCopy.uniformBufferBindings.filter(function (_a) {
                    var size = _a.size;
                    return size > 0;
                });
            bindings = this.device.createBindings(descriptorCopy);
            this.bindingsCache.add(descriptorCopy, bindings);
        }
        return bindings;
    };
    RenderCache.prototype.createRenderPipeline = function (descriptor) {
        var renderPipeline = this.renderPipelinesCache.get(descriptor);
        if (renderPipeline === null) {
            var descriptorCopy = gDeviceApi.renderPipelineDescriptorCopy(descriptor);
            descriptorCopy.colorAttachmentFormats =
                descriptorCopy.colorAttachmentFormats.filter(function (f) { return f; });
            renderPipeline = this.device.createRenderPipeline(descriptorCopy);
            this.renderPipelinesCache.add(descriptorCopy, renderPipeline);
        }
        return renderPipeline;
    };
    RenderCache.prototype.createInputLayout = function (descriptor) {
        // remove hollows
        descriptor.vertexBufferDescriptors =
            descriptor.vertexBufferDescriptors.filter(function (d) { return !!d; });
        var inputLayout = this.inputLayoutsCache.get(descriptor);
        if (inputLayout === null) {
            var descriptorCopy = gDeviceApi.inputLayoutDescriptorCopy(descriptor);
            inputLayout = this.device.createInputLayout(descriptorCopy);
            this.inputLayoutsCache.add(descriptorCopy, inputLayout);
        }
        return inputLayout;
    };
    RenderCache.prototype.createProgramSimple = function (deviceProgram) {
        var vert = deviceProgram.vert, frag = deviceProgram.frag, preprocessedFrag = deviceProgram.preprocessedFrag, preprocessedVert = deviceProgram.preprocessedVert;
        var program = null;
        if (preprocessedVert && preprocessedFrag) {
            program = this.programCache.get({
                vert: vert,
                frag: frag,
                preprocessedFrag: preprocessedFrag,
                preprocessedVert: preprocessedVert,
            });
        }
        if (program === null) {
            var _a = preprocessProgramObj_GLSL(this.device, deviceProgram), preprocessedVert_1 = _a.preprocessedVert, preprocessedFrag_1 = _a.preprocessedFrag;
            deviceProgram.preprocessedVert = preprocessedVert_1;
            deviceProgram.preprocessedFrag = preprocessedFrag_1;
            var descriptorCopy = programDescriptorSimpleCopy(deviceProgram);
            program = this.device['createProgramSimple']({
                vertex: {
                    glsl: preprocessedVert_1,
                },
                fragment: {
                    glsl: preprocessedFrag_1,
                },
            }, vert);
            this.programCache.add(descriptorCopy, program);
        }
        return program;
    };
    RenderCache.prototype.createSampler = function (descriptor) {
        var sampler = this.samplerCache.get(descriptor);
        if (sampler === null) {
            sampler = this.device.createSampler(descriptor);
            this.samplerCache.add(descriptor, sampler);
        }
        return sampler;
    };
    RenderCache.prototype.destroy = function () {
        var e_1, _a, e_2, _b, e_3, _c, e_4, _d, e_5, _e;
        try {
            for (var _f = tslib.__values(this.bindingsCache.values()), _g = _f.next(); !_g.done; _g = _f.next()) {
                var bindings = _g.value;
                bindings.destroy();
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_g && !_g.done && (_a = _f.return)) _a.call(_f);
            }
            finally { if (e_1) throw e_1.error; }
        }
        try {
            for (var _h = tslib.__values(this.renderPipelinesCache.values()), _j = _h.next(); !_j.done; _j = _h.next()) {
                var renderPipeline = _j.value;
                renderPipeline.destroy();
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_j && !_j.done && (_b = _h.return)) _b.call(_h);
            }
            finally { if (e_2) throw e_2.error; }
        }
        try {
            for (var _k = tslib.__values(this.inputLayoutsCache.values()), _l = _k.next(); !_l.done; _l = _k.next()) {
                var inputLayout = _l.value;
                inputLayout.destroy();
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (_l && !_l.done && (_c = _k.return)) _c.call(_k);
            }
            finally { if (e_3) throw e_3.error; }
        }
        try {
            for (var _m = tslib.__values(this.programCache.values()), _o = _m.next(); !_o.done; _o = _m.next()) {
                var program = _o.value;
                program.destroy();
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (_o && !_o.done && (_d = _m.return)) _d.call(_m);
            }
            finally { if (e_4) throw e_4.error; }
        }
        try {
            for (var _p = tslib.__values(this.samplerCache.values()), _q = _p.next(); !_q.done; _q = _p.next()) {
                var sampler = _q.value;
                sampler.destroy();
            }
        }
        catch (e_5_1) { e_5 = { error: e_5_1 }; }
        finally {
            try {
                if (_q && !_q.done && (_e = _p.return)) _e.call(_p);
            }
            finally { if (e_5) throw e_5.error; }
        }
        this.bindingsCache.clear();
        this.renderPipelinesCache.clear();
        this.inputLayoutsCache.clear();
        this.programCache.clear();
        this.samplerCache.clear();
    };
    return RenderCache;
}());

exports.ToneMapping = void 0;
(function (ToneMapping) {
    ToneMapping["NONE"] = "none";
    ToneMapping["LINEAR"] = "LinearToneMapping";
    ToneMapping["REINHARD"] = "ReinhardToneMapping";
    ToneMapping["CINEON"] = "OptimizedCineonToneMapping";
    ToneMapping["ACES_FILMIC"] = "ACESFilmicToneMapping";
    ToneMapping["CUSTOM"] = "CustomToneMapping";
})(exports.ToneMapping || (exports.ToneMapping = {}));

exports.RGAttachmentSlot = void 0;
(function (RGAttachmentSlot) {
    RGAttachmentSlot[RGAttachmentSlot["Color0"] = 0] = "Color0";
    RGAttachmentSlot[RGAttachmentSlot["Color1"] = 1] = "Color1";
    RGAttachmentSlot[RGAttachmentSlot["Color2"] = 2] = "Color2";
    RGAttachmentSlot[RGAttachmentSlot["Color3"] = 3] = "Color3";
    RGAttachmentSlot[RGAttachmentSlot["ColorMax"] = 3] = "ColorMax";
    RGAttachmentSlot[RGAttachmentSlot["DepthStencil"] = 4] = "DepthStencil";
})(exports.RGAttachmentSlot || (exports.RGAttachmentSlot = {}));

var RenderGraphPass = /** @class */ (function () {
    function RenderGraphPass() {
        // RenderTargetAttachmentSlot => renderTargetID
        this.renderTargetIDs = [];
        this.renderTargetLevels = [];
        // RenderTargetAttachmentSlot => resolveTextureID
        this.resolveTextureOutputIDs = [];
        // RenderTargetAttachmentSlot => Texture
        this.resolveTextureOutputExternalTextures = [];
        this.resolveTextureOutputExternalTextureLevel = [];
        // List of resolveTextureIDs that we have a reference to.
        this.resolveTextureInputIDs = [];
        // RGAttachmentSlot => refcount.
        this.renderTargetExtraRefs = [];
        this.resolveTextureInputTextures = [];
        this.renderTargets = [];
        // Execution state computed by scheduling.
        this.descriptor = {
            colorAttachment: [],
            colorAttachmentLevel: [],
            colorResolveTo: [],
            colorResolveToLevel: [],
            colorStore: [],
            depthStencilAttachment: null,
            depthStencilResolveTo: null,
            depthStencilStore: true,
            colorClearColor: ['load'],
            depthClearValue: 'load',
            stencilClearValue: 'load',
            occlusionQueryPool: null,
        };
        this.viewportX = 0;
        this.viewportY = 0;
        this.viewportW = 1;
        this.viewportH = 1;
        // Execution callback from user.
        this.execFunc = null;
        this.postFunc = null;
        this.debugThumbnails = [];
    }
    RenderGraphPass.prototype.setDebugName = function (debugName) {
        this.debugName = debugName;
    };
    RenderGraphPass.prototype.pushDebugThumbnail = function (attachmentSlot) {
        this.debugThumbnails[attachmentSlot] = true;
    };
    RenderGraphPass.prototype.setViewport = function (x, y, w, h) {
        this.viewportX = x;
        this.viewportY = y;
        this.viewportW = w;
        this.viewportH = h;
    };
    RenderGraphPass.prototype.attachRenderTargetID = function (attachmentSlot, renderTargetID, level) {
        if (level === void 0) { level = 0; }
        gDeviceApi.assert(this.renderTargetIDs[attachmentSlot] === undefined);
        this.renderTargetIDs[attachmentSlot] = renderTargetID;
        this.renderTargetLevels[attachmentSlot] = level;
    };
    RenderGraphPass.prototype.attachResolveTexture = function (resolveTextureID) {
        this.resolveTextureInputIDs.push(resolveTextureID);
    };
    RenderGraphPass.prototype.attachOcclusionQueryPool = function (queryPool) {
        this.descriptor.occlusionQueryPool = queryPool;
    };
    RenderGraphPass.prototype.exec = function (func) {
        gDeviceApi.assert(this.execFunc === null);
        this.execFunc = func;
    };
    RenderGraphPass.prototype.post = function (func) {
        gDeviceApi.assert(this.postFunc === null);
        this.postFunc = func;
    };
    RenderGraphPass.prototype.addExtraRef = function (slot) {
        this.renderTargetExtraRefs[slot] = true;
    };
    return RenderGraphPass;
}());

var RGRenderTarget = /** @class */ (function () {
    function RGRenderTarget(device, desc) {
        this.dimension = gDeviceApi.TextureDimension.TEXTURE_2D;
        this.depthOrArrayLayers = 1;
        this.mipLevelCount = 1;
        this.width = 0;
        this.height = 0;
        this.sampleCount = 0;
        this.usage = gDeviceApi.TextureUsage.RENDER_TARGET;
        this.needsClear = true;
        this.texture = null;
        this.age = 0;
        this.format = desc.format;
        this.width = desc.width;
        this.height = desc.height;
        this.sampleCount = desc.sampleCount;
        gDeviceApi.assert(this.sampleCount >= 1);
        if (this.sampleCount > 1) {
            // MSAA render targets must be backed by attachments.
            this.attachment = device.createRenderTarget(this);
        }
        else {
            // Single-sampled textures can be backed by regular textures.
            this.texture = device.createTexture(this);
            this.attachment = device.createRenderTargetFromTexture(this.texture);
        }
    }
    RGRenderTarget.prototype.setDebugName = function (device, debugName) {
        this.debugName = debugName;
        if (this.texture !== null) {
            device.setResourceName(this.texture, this.debugName);
        }
        device.setResourceName(this.attachment, this.debugName);
    };
    RGRenderTarget.prototype.matchesDescription = function (desc) {
        return (this.format === desc.format &&
            this.width === desc.width &&
            this.height === desc.height &&
            this.sampleCount === desc.sampleCount);
    };
    RGRenderTarget.prototype.reset = function (desc) {
        gDeviceApi.assert(this.matchesDescription(desc));
        this.age = 0;
    };
    RGRenderTarget.prototype.destroy = function () {
        this.attachment.destroy();
    };
    return RGRenderTarget;
}());

// Whenever we need to resolve a multi-sampled render target to a single-sampled texture,
// we record an extra single-sampled texture here.
var SingleSampledTexture = /** @class */ (function () {
    function SingleSampledTexture(device, desc) {
        this.dimension = gDeviceApi.TextureDimension.TEXTURE_2D;
        this.depthOrArrayLayers = 1;
        this.mipLevelCount = 1;
        this.usage = gDeviceApi.TextureUsage.RENDER_TARGET;
        this.width = 0;
        this.height = 0;
        this.age = 0;
        this.format = desc.format;
        this.width = desc.width;
        this.height = desc.height;
        this.texture = device.createTexture(this);
    }
    SingleSampledTexture.prototype.matchesDescription = function (desc) {
        return (this.format === desc.format &&
            this.width === desc.width &&
            this.height === desc.height);
    };
    SingleSampledTexture.prototype.reset = function (desc) {
        gDeviceApi.assert(this.matchesDescription(desc));
        this.age = 0;
    };
    SingleSampledTexture.prototype.destroy = function () {
        this.texture.destroy();
    };
    return SingleSampledTexture;
}());

var GraphImpl = /** @class */ (function () {
    function GraphImpl() {
        // [Symbol.species]?: 'RGGraph';
        // Used for determining scheduling.
        this.renderTargetDescriptions = [];
        this.resolveTextureRenderTargetIDs = [];
        this.passes = [];
        // Debugging.
        this.renderTargetDebugNames = [];
    }
    return GraphImpl;
}());
var RenderGraph = /** @class */ (function () {
    function RenderGraph(device) {
        // For scope callbacks.
        this.currentPass = null;
        //#region Resource Creation & Caching
        this.renderTargetDeadPool = [];
        this.singleSampledTextureDeadPool = [];
        //#endregion
        //#region Graph Builder
        this.currentGraph = null;
        //#endregion
        //#region Scheduling
        this.renderTargetOutputCount = [];
        this.renderTargetResolveCount = [];
        this.resolveTextureUseCount = [];
        this.renderTargetAliveForID = [];
        this.singleSampledTextureForResolveTextureID = [];
        this.device = device;
    }
    RenderGraph.prototype.acquireRenderTargetForDescription = function (desc) {
        for (var i = 0; i < this.renderTargetDeadPool.length; i++) {
            var freeRenderTarget = this.renderTargetDeadPool[i];
            if (freeRenderTarget.matchesDescription(desc)) {
                // Pop it off the list.
                freeRenderTarget.reset(desc);
                this.renderTargetDeadPool.splice(i--, 1);
                return freeRenderTarget;
            }
        }
        // Allocate a new render target.
        return new RGRenderTarget(this.device, desc);
    };
    RenderGraph.prototype.acquireSingleSampledTextureForDescription = function (desc) {
        for (var i = 0; i < this.singleSampledTextureDeadPool.length; i++) {
            var freeSingleSampledTexture = this.singleSampledTextureDeadPool[i];
            if (freeSingleSampledTexture.matchesDescription(desc)) {
                // Pop it off the list.
                freeSingleSampledTexture.reset(desc);
                this.singleSampledTextureDeadPool.splice(i--, 1);
                return freeSingleSampledTexture;
            }
        }
        // Allocate a new resolve texture.
        return new SingleSampledTexture(this.device, desc);
    };
    RenderGraph.prototype.beginGraphBuilder = function () {
        gDeviceApi.assert(this.currentGraph === null);
        this.currentGraph = new GraphImpl();
    };
    RenderGraph.prototype.pushPass = function (setupFunc) {
        var pass = new RenderGraphPass();
        setupFunc(pass);
        this.currentGraph.passes.push(pass);
    };
    RenderGraph.prototype.createRenderTargetID = function (desc, debugName) {
        this.currentGraph.renderTargetDebugNames.push(debugName);
        return this.currentGraph.renderTargetDescriptions.push(desc) - 1;
    };
    RenderGraph.prototype.createResolveTextureID = function (renderTargetID) {
        return (this.currentGraph.resolveTextureRenderTargetIDs.push(renderTargetID) - 1);
    };
    /**
     * 查找最靠近输出的一个关联目标 RT 的 RGPass
     */
    RenderGraph.prototype.findMostRecentPassThatAttachedRenderTarget = function (renderTargetID) {
        for (var i = this.currentGraph.passes.length - 1; i >= 0; i--) {
            var pass = this.currentGraph.passes[i];
            if (pass.renderTargetIDs.includes(renderTargetID))
                return pass;
        }
        return null;
    };
    RenderGraph.prototype.resolveRenderTargetPassAttachmentSlot = function (pass, attachmentSlot) {
        var renderPass = pass;
        if (renderPass.resolveTextureOutputIDs[attachmentSlot] === undefined) {
            var renderTargetID = renderPass.renderTargetIDs[attachmentSlot];
            var resolveTextureID = this.createResolveTextureID(renderTargetID);
            renderPass.resolveTextureOutputIDs[attachmentSlot] = resolveTextureID;
        }
        return renderPass.resolveTextureOutputIDs[attachmentSlot];
    };
    RenderGraph.prototype.findPassForResolveRenderTarget = function (renderTargetID) {
        // Find the last pass that rendered to this render target, and resolve it now.
        // If you wanted a previous snapshot copy of it, you should have created a separate,
        // intermediate pass to copy that out. Perhaps we should have a helper for that use case?
        // If there was no pass that wrote to this RT, well there's no point in resolving it, is there?
        var renderPass = gDeviceApi.assertExists(this.findMostRecentPassThatAttachedRenderTarget(renderTargetID));
        // Check which attachment we're in. This could possibly be explicit from the user, but it's
        // easy enough to find...
        var attachmentSlot = renderPass.renderTargetIDs.indexOf(renderTargetID);
        // Check that the pass isn't resolving its attachment to another texture. Can't do both!
        gDeviceApi.assert(renderPass.resolveTextureOutputExternalTextures[attachmentSlot] ===
            undefined);
        return renderPass;
    };
    RenderGraph.prototype.resolveRenderTarget = function (renderTargetID) {
        var renderPass = this.findPassForResolveRenderTarget(renderTargetID);
        var attachmentSlot = renderPass.renderTargetIDs.indexOf(renderTargetID);
        return this.resolveRenderTargetPassAttachmentSlot(renderPass, attachmentSlot);
    };
    RenderGraph.prototype.resolveRenderTargetToExternalTexture = function (renderTargetID, texture, level) {
        if (level === void 0) { level = 0; }
        var renderPass = this.findPassForResolveRenderTarget(renderTargetID);
        var attachmentSlot = renderPass.renderTargetIDs.indexOf(renderTargetID);
        // We shouldn't be resolving to a resolve texture ID in this case.
        gDeviceApi.assert(renderPass.resolveTextureOutputIDs[attachmentSlot] === undefined);
        renderPass.resolveTextureOutputExternalTextures[attachmentSlot] = texture;
        renderPass.resolveTextureOutputExternalTextureLevel[attachmentSlot] = level;
    };
    RenderGraph.prototype.getRenderTargetDescription = function (renderTargetID) {
        return gDeviceApi.assertExists(this.currentGraph.renderTargetDescriptions[renderTargetID]);
    };
    RenderGraph.prototype.scheduleAddUseCount = function (graph, pass) {
        for (var slot = 0; slot < pass.renderTargetIDs.length; slot++) {
            var renderTargetID = pass.renderTargetIDs[slot];
            if (renderTargetID === undefined)
                continue;
            this.renderTargetOutputCount[renderTargetID]++;
            if (pass.renderTargetExtraRefs[slot])
                this.renderTargetOutputCount[renderTargetID]++;
        }
        for (var i = 0; i < pass.resolveTextureInputIDs.length; i++) {
            var resolveTextureID = pass.resolveTextureInputIDs[i];
            if (resolveTextureID === undefined)
                continue;
            this.resolveTextureUseCount[resolveTextureID]++;
            var renderTargetID = graph.resolveTextureRenderTargetIDs[resolveTextureID];
            this.renderTargetResolveCount[renderTargetID]++;
        }
    };
    RenderGraph.prototype.acquireRenderTargetForID = function (graph, renderTargetID) {
        if (renderTargetID === undefined)
            return null;
        gDeviceApi.assert(this.renderTargetOutputCount[renderTargetID] > 0);
        if (!this.renderTargetAliveForID[renderTargetID]) {
            var desc = graph.renderTargetDescriptions[renderTargetID];
            var newRenderTarget = this.acquireRenderTargetForDescription(desc);
            newRenderTarget.setDebugName(this.device, graph.renderTargetDebugNames[renderTargetID]);
            this.renderTargetAliveForID[renderTargetID] = newRenderTarget;
        }
        return this.renderTargetAliveForID[renderTargetID];
    };
    RenderGraph.prototype.releaseRenderTargetForID = function (renderTargetID, forOutput) {
        if (renderTargetID === undefined)
            return null;
        var renderTarget = gDeviceApi.assertExists(this.renderTargetAliveForID[renderTargetID]);
        if (forOutput) {
            gDeviceApi.assert(this.renderTargetOutputCount[renderTargetID] > 0);
            this.renderTargetOutputCount[renderTargetID]--;
        }
        else {
            gDeviceApi.assert(this.renderTargetResolveCount[renderTargetID] > 0);
            this.renderTargetResolveCount[renderTargetID]--;
        }
        if (this.renderTargetOutputCount[renderTargetID] === 0 &&
            this.renderTargetResolveCount[renderTargetID] === 0) {
            // This was the last reference to this RT -- steal it from the alive list, and put it back into the pool.
            renderTarget.needsClear = true;
            delete this.renderTargetAliveForID[renderTargetID];
            this.renderTargetDeadPool.push(renderTarget);
        }
        return renderTarget;
    };
    RenderGraph.prototype.acquireResolveTextureInputTextureForID = function (graph, resolveTextureID) {
        var renderTargetID = graph.resolveTextureRenderTargetIDs[resolveTextureID];
        gDeviceApi.assert(this.resolveTextureUseCount[resolveTextureID] > 0);
        this.resolveTextureUseCount[resolveTextureID]--;
        var renderTarget = gDeviceApi.assertExists(this.releaseRenderTargetForID(renderTargetID, false));
        if (this.singleSampledTextureForResolveTextureID[resolveTextureID] !==
            undefined) {
            // The resolved texture belonging to this RT is backed by our own single-sampled texture.
            var singleSampledTexture = this.singleSampledTextureForResolveTextureID[resolveTextureID];
            if (this.resolveTextureUseCount[resolveTextureID] === 0) {
                // Release this single-sampled texture back to the pool, if this is the last use of it.
                this.singleSampledTextureDeadPool.push(singleSampledTexture);
            }
            return singleSampledTexture.texture;
        }
        else {
            // The resolved texture belonging to this RT is backed by our render target.
            return gDeviceApi.assertExists(renderTarget.texture);
        }
    };
    RenderGraph.prototype.determineResolveParam = function (graph, pass, slot) {
        var renderTargetID = pass.renderTargetIDs[slot];
        var resolveTextureOutputID = pass.resolveTextureOutputIDs[slot];
        var externalTexture = pass.resolveTextureOutputExternalTextures[slot];
        // We should have either an output ID or an external texture, not both.
        var hasResolveTextureOutputID = resolveTextureOutputID !== undefined;
        var hasExternalTexture = externalTexture !== undefined;
        gDeviceApi.assert(!(hasResolveTextureOutputID && hasExternalTexture));
        var resolveTo = null;
        var store = false;
        var level = 0;
        if (this.renderTargetOutputCount[renderTargetID] > 1) {
            // A future pass is going to render to this RT, we need to store the results.
            store = true;
        }
        if (hasResolveTextureOutputID) {
            gDeviceApi.assert(graph.resolveTextureRenderTargetIDs[resolveTextureOutputID] ===
                renderTargetID);
            gDeviceApi.assert(this.resolveTextureUseCount[resolveTextureOutputID] > 0);
            gDeviceApi.assert(this.renderTargetOutputCount[renderTargetID] > 0);
            var renderTarget = gDeviceApi.assertExists(this.renderTargetAliveForID[renderTargetID]);
            // If we're the last user of this RT, then we don't need to resolve -- the texture itself will be enough.
            // Note that this isn't exactly an exactly correct algorithm. If we have pass A writing to RenderTargetA,
            // pass B resolving RenderTargetA to ResolveTextureA, and pass C writing to RenderTargetA, then we don't
            // strictly need to copy, but in order to determine that at the time of pass A, we'd need a much fancier
            // schedule than just tracking refcounts...
            if (renderTarget.texture !== null &&
                this.renderTargetOutputCount[renderTargetID] === 1) {
                resolveTo = null;
                store = true;
            }
            else {
                if (!this.singleSampledTextureForResolveTextureID[resolveTextureOutputID]) {
                    var desc = gDeviceApi.assertExists(graph.renderTargetDescriptions[renderTargetID]);
                    this.singleSampledTextureForResolveTextureID[resolveTextureOutputID] =
                        this.acquireSingleSampledTextureForDescription(desc);
                    this.device.setResourceName(this.singleSampledTextureForResolveTextureID[resolveTextureOutputID]
                        .texture, renderTarget.debugName + " (Resolve ".concat(resolveTextureOutputID, ")"));
                }
                resolveTo =
                    this.singleSampledTextureForResolveTextureID[resolveTextureOutputID]
                        .texture;
            }
        }
        else if (hasExternalTexture) {
            resolveTo = externalTexture;
            level = pass.resolveTextureOutputExternalTextureLevel[slot];
        }
        else {
            resolveTo = null;
        }
        return { resolveTo: resolveTo, store: store, level: level };
    };
    RenderGraph.prototype.schedulePass = function (graph, pass) {
        var depthStencilRenderTargetID = pass.renderTargetIDs[exports.RGAttachmentSlot.DepthStencil];
        for (var slot = exports.RGAttachmentSlot.Color0; slot <= exports.RGAttachmentSlot.ColorMax; slot++) {
            var colorRenderTargetID = pass.renderTargetIDs[slot];
            var colorRenderTarget = this.acquireRenderTargetForID(graph, colorRenderTargetID);
            pass.renderTargets[slot] = colorRenderTarget;
            pass.descriptor.colorAttachment[slot] =
                colorRenderTarget !== null ? colorRenderTarget.attachment : null;
            pass.descriptor.colorAttachmentLevel[slot] =
                pass.renderTargetLevels[slot];
            var _a = this.determineResolveParam(graph, pass, slot), resolveTo_1 = _a.resolveTo, store_1 = _a.store, level = _a.level;
            pass.descriptor.colorResolveTo[slot] = resolveTo_1;
            pass.descriptor.colorResolveToLevel[slot] = level;
            pass.descriptor.colorStore[slot] = store_1;
            pass.descriptor.colorClearColor[slot] =
                colorRenderTarget !== null && colorRenderTarget.needsClear
                    ? graph.renderTargetDescriptions[colorRenderTargetID].colorClearColor
                    : 'load';
        }
        var depthStencilRenderTarget = this.acquireRenderTargetForID(graph, depthStencilRenderTargetID);
        pass.renderTargets[exports.RGAttachmentSlot.DepthStencil] =
            depthStencilRenderTarget;
        pass.descriptor.depthStencilAttachment =
            depthStencilRenderTarget !== null
                ? depthStencilRenderTarget.attachment
                : null;
        var _b = this.determineResolveParam(graph, pass, exports.RGAttachmentSlot.DepthStencil), resolveTo = _b.resolveTo, store = _b.store;
        pass.descriptor.depthStencilResolveTo = resolveTo;
        pass.descriptor.depthStencilStore = store;
        pass.descriptor.depthClearValue =
            depthStencilRenderTarget !== null && depthStencilRenderTarget.needsClear
                ? graph.renderTargetDescriptions[depthStencilRenderTargetID]
                    .depthClearValue
                : 'load';
        pass.descriptor.stencilClearValue =
            depthStencilRenderTarget !== null && depthStencilRenderTarget.needsClear
                ? graph.renderTargetDescriptions[depthStencilRenderTargetID]
                    .stencilClearValue
                : 'load';
        var rtWidth = 0;
        var rtHeight = 0;
        var rtSampleCount = 0;
        for (var i = 0; i < pass.renderTargets.length; i++) {
            var renderTarget = pass.renderTargets[i];
            if (!renderTarget)
                continue;
            var width = renderTarget.width >>> pass.renderTargetLevels[i];
            var height = renderTarget.height >>> pass.renderTargetLevels[i];
            if (rtWidth === 0) {
                rtWidth = width;
                rtHeight = height;
                rtSampleCount = renderTarget.sampleCount;
            }
            gDeviceApi.assert(width === rtWidth);
            gDeviceApi.assert(height === rtHeight);
            gDeviceApi.assert(renderTarget.sampleCount === rtSampleCount);
            renderTarget.needsClear = false;
        }
        if (rtWidth > 0 && rtHeight > 0) {
            pass.viewportX *= rtWidth;
            pass.viewportY *= rtHeight;
            pass.viewportW *= rtWidth;
            pass.viewportH *= rtHeight;
        }
        for (var i = 0; i < pass.resolveTextureInputIDs.length; i++) {
            var resolveTextureID = pass.resolveTextureInputIDs[i];
            pass.resolveTextureInputTextures[i] =
                this.acquireResolveTextureInputTextureForID(graph, resolveTextureID);
        }
        for (var i = 0; i < pass.renderTargetIDs.length; i++)
            this.releaseRenderTargetForID(pass.renderTargetIDs[i], true);
        for (var slot = 0; slot < pass.renderTargetExtraRefs.length; slot++)
            if (pass.renderTargetExtraRefs[slot])
                this.releaseRenderTargetForID(pass.renderTargetIDs[slot], true);
    };
    RenderGraph.prototype.scheduleGraph = function (graph) {
        gDeviceApi.assert(this.renderTargetOutputCount.length === 0);
        gDeviceApi.assert(this.renderTargetResolveCount.length === 0);
        gDeviceApi.assert(this.resolveTextureUseCount.length === 0);
        // Go through and increment the age of everything in our dead pools to mark that it's old.
        for (var i = 0; i < this.renderTargetDeadPool.length; i++)
            this.renderTargetDeadPool[i].age++;
        for (var i = 0; i < this.singleSampledTextureDeadPool.length; i++)
            this.singleSampledTextureDeadPool[i].age++;
        // Schedule our resources -- first, count up all uses of resources, then hand them out.
        // Initialize our accumulators.
        gDeviceApi.fillArray(this.renderTargetOutputCount, graph.renderTargetDescriptions.length, 0);
        gDeviceApi.fillArray(this.renderTargetResolveCount, graph.renderTargetDescriptions.length, 0);
        gDeviceApi.fillArray(this.resolveTextureUseCount, graph.resolveTextureRenderTargetIDs.length, 0);
        // Count.
        for (var i = 0; i < graph.passes.length; i++)
            this.scheduleAddUseCount(graph, graph.passes[i]);
        // Now hand out resources.
        for (var i = 0; i < graph.passes.length; i++)
            this.schedulePass(graph, graph.passes[i]);
        // Double-check that all resources were handed out.
        for (var i = 0; i < this.renderTargetOutputCount.length; i++)
            gDeviceApi.assert(this.renderTargetOutputCount[i] === 0);
        for (var i = 0; i < this.renderTargetResolveCount.length; i++)
            gDeviceApi.assert(this.renderTargetResolveCount[i] === 0);
        for (var i = 0; i < this.resolveTextureUseCount.length; i++)
            gDeviceApi.assert(this.resolveTextureUseCount[i] === 0);
        for (var i = 0; i < this.renderTargetAliveForID.length; i++)
            gDeviceApi.assert(this.renderTargetAliveForID[i] === undefined);
        // Now go through and kill anything that's over our age threshold (hasn't been used in a bit)
        var ageThreshold = 1;
        for (var i = 0; i < this.renderTargetDeadPool.length; i++) {
            if (this.renderTargetDeadPool[i].age >= ageThreshold) {
                this.renderTargetDeadPool[i].destroy();
                this.renderTargetDeadPool.splice(i--, 1);
            }
        }
        for (var i = 0; i < this.singleSampledTextureDeadPool.length; i++) {
            if (this.singleSampledTextureDeadPool[i].age >= ageThreshold) {
                this.singleSampledTextureDeadPool[i].destroy();
                this.singleSampledTextureDeadPool.splice(i--, 1);
            }
        }
        // Clear out our transient scheduling state.
        this.renderTargetResolveCount.length = 0;
        this.renderTargetOutputCount.length = 0;
        this.resolveTextureUseCount.length = 0;
    };
    //#endregion
    //#region Execution
    RenderGraph.prototype.execPass = function (pass) {
        gDeviceApi.assert(this.currentPass === null);
        this.currentPass = pass;
        var renderPass = this.device.createRenderPass(pass.descriptor);
        renderPass.pushDebugGroup(pass.debugName);
        renderPass.setViewport(pass.viewportX, pass.viewportY, pass.viewportW, pass.viewportH);
        if (pass.execFunc !== null)
            pass.execFunc(renderPass, this);
        renderPass.popDebugGroup();
        this.device.submitPass(renderPass);
        if (pass.postFunc !== null)
            pass.postFunc(this);
        this.currentPass = null;
    };
    RenderGraph.prototype.execGraph = function (graph) {
        var _this = this;
        this.scheduleGraph(graph);
        this.device.beginFrame();
        graph.passes.forEach(function (pass) {
            _this.execPass(pass);
        });
        this.device.endFrame();
        // Clear our transient scope state.
        this.singleSampledTextureForResolveTextureID.length = 0;
    };
    RenderGraph.prototype.execute = function () {
        var graph = gDeviceApi.assertExists(this.currentGraph);
        this.execGraph(graph);
        this.currentGraph = null;
    };
    RenderGraph.prototype.getDebug = function () {
        return this;
    };
    //#endregion
    //#region GfxrGraphBuilderDebug
    RenderGraph.prototype.getPasses = function () {
        return this.currentGraph.passes;
    };
    RenderGraph.prototype.getPassDebugThumbnails = function (pass) {
        return pass.debugThumbnails;
    };
    RenderGraph.prototype.getPassRenderTargetID = function (pass, slot) {
        return pass.renderTargetIDs[slot];
    };
    RenderGraph.prototype.getRenderTargetIDDebugName = function (renderTargetID) {
        return this.currentGraph.renderTargetDebugNames[renderTargetID];
    };
    //#endregion
    //#region GfxrPassScope
    RenderGraph.prototype.getResolveTextureForID = function (resolveTextureID) {
        var currentGraphPass = this.currentPass;
        var i = currentGraphPass.resolveTextureInputIDs.indexOf(resolveTextureID);
        gDeviceApi.assert(i >= 0);
        return gDeviceApi.assertExists(currentGraphPass.resolveTextureInputTextures[i]);
    };
    RenderGraph.prototype.getRenderTargetAttachment = function (slot) {
        var currentGraphPass = this.currentPass;
        var renderTarget = currentGraphPass.renderTargets[slot];
        if (!renderTarget)
            return null;
        return renderTarget.attachment;
    };
    RenderGraph.prototype.getRenderTargetTexture = function (slot) {
        var currentGraphPass = this.currentPass;
        var renderTarget = currentGraphPass.renderTargets[slot];
        if (!renderTarget)
            return null;
        return renderTarget.texture;
    };
    //#endregion
    RenderGraph.prototype.newGraphBuilder = function () {
        this.beginGraphBuilder();
        return this;
    };
    RenderGraph.prototype.destroy = function () {
        // At the time this is called, we shouldn't have anything alive.
        for (var i = 0; i < this.renderTargetAliveForID.length; i++)
            gDeviceApi.assert(this.renderTargetAliveForID[i] === undefined);
        for (var i = 0; i < this.singleSampledTextureForResolveTextureID.length; i++)
            gDeviceApi.assert(this.singleSampledTextureForResolveTextureID[i] === undefined);
        for (var i = 0; i < this.renderTargetDeadPool.length; i++)
            this.renderTargetDeadPool[i].destroy();
        for (var i = 0; i < this.singleSampledTextureDeadPool.length; i++)
            this.singleSampledTextureDeadPool[i].destroy();
    };
    return RenderGraph;
}());

// Suggested values for the "layer" of makeSortKey. These are rough groups, and you can define your own
// ordering within the rough groups (e.g. you might use BACKGROUND + 1, or BACKGROUND + 2).
// TRANSLUCENT is meant to be used as a bitflag. It's special as it changes the behavior of the generic sort key
// functions like makeSortKey and setSortKeyDepth.
exports.RendererLayer = void 0;
(function (RendererLayer) {
    RendererLayer[RendererLayer["BACKGROUND"] = 0] = "BACKGROUND";
    RendererLayer[RendererLayer["ALPHA_TEST"] = 16] = "ALPHA_TEST";
    RendererLayer[RendererLayer["OPAQUE"] = 32] = "OPAQUE";
    RendererLayer[RendererLayer["TRANSLUCENT"] = 128] = "TRANSLUCENT";
})(exports.RendererLayer || (exports.RendererLayer = {}));
var MAX_DEPTH = 0x10000;
var DEPTH_BITS = 16;
function makeDepthKey(depth, flipDepth, maxDepth) {
    if (maxDepth === void 0) { maxDepth = MAX_DEPTH; }
    // Input depth here is: 0 is the closest to the camera, positive values are further away. Negative values (behind camera) are clamped to 0.
    // normalizedDepth: 0.0 is closest to camera, 1.0 is farthest from camera.
    // These values are flipped if flipDepth is set.
    var normalizedDepth = util.clamp(depth, 0, maxDepth) / maxDepth;
    if (flipDepth)
        normalizedDepth = 1.0 - normalizedDepth;
    var depthKey = normalizedDepth * ((1 << DEPTH_BITS) - 1);
    return depthKey & 0xffff;
}
// Common sort key kinds.
// Indexed:     TLLLLLLL IIIIIIII IIIIIIII IIIIIIII
// Opaque:      0LLLLLLL PPPPPPPP PPPPPPPP DDDDDDDD
// Translucent: 1LLLLLLL DDDDDDDD DDDDDDDD BBBBBBBB
function getSortKeyLayer(sortKey) {
    return (sortKey >>> 24) & 0xff;
}
function setSortKeyLayer(sortKey, layer) {
    return ((sortKey & 0x00ffffff) | ((layer & 0xff) << 24)) >>> 0;
}
function setSortKeyProgramKey(sortKey, programKey) {
    var isTransparent = !!((sortKey >>> 31) & 1);
    if (isTransparent)
        return sortKey;
    else
        return ((sortKey & 0xff0000ff) | ((programKey & 0xffff) << 8)) >>> 0;
}
function setSortKeyBias(sortKey, bias) {
    var isTransparent = !!((sortKey >>> 31) & 1);
    if (isTransparent)
        return ((sortKey & 0xffffff00) | (bias & 0xff)) >>> 0;
    else
        return sortKey;
}
function makeSortKeyOpaque(layer, programKey) {
    return setSortKeyLayer(setSortKeyProgramKey(0, programKey), layer);
}
function setSortKeyOpaqueDepth(sortKey, depthKey) {
    gDeviceApi.assert(depthKey >= 0);
    return ((sortKey & 0xffffff00) | ((depthKey >>> 8) & 0xff)) >>> 0;
}
function makeSortKeyTranslucent(layer) {
    return setSortKeyLayer(0, layer);
}
function setSortKeyTranslucentDepth(sortKey, depthKey) {
    gDeviceApi.assert(depthKey >= 0);
    return ((sortKey & 0xff0000ff) | (depthKey << 8)) >>> 0;
}
function makeSortKey(layer, programKey) {
    if (programKey === void 0) { programKey = 0; }
    if (layer & exports.RendererLayer.TRANSLUCENT)
        return makeSortKeyTranslucent(layer);
    else
        return makeSortKeyOpaque(layer, programKey);
}
function setSortKeyDepthKey(sortKey, depthKey) {
    var isTranslucent = !!((sortKey >>> 31) & 1);
    return isTranslucent
        ? setSortKeyTranslucentDepth(sortKey, depthKey)
        : setSortKeyOpaqueDepth(sortKey, depthKey);
}
function setSortKeyDepth(sortKey, depth, maxDepth) {
    if (maxDepth === void 0) { maxDepth = MAX_DEPTH; }
    var isTranslucent = !!((sortKey >>> 31) & 1);
    var depthKey = makeDepthKey(depth, isTranslucent, maxDepth);
    return isTranslucent
        ? setSortKeyTranslucentDepth(sortKey, depthKey)
        : setSortKeyOpaqueDepth(sortKey, depthKey);
}
function getSortKeyDepth(sortKey) {
    var isTranslucent = !!((sortKey >>> 31) & 1);
    if (isTranslucent)
        return (sortKey >>> 8) & 0xffff;
    else {
        return ((sortKey >>> 8) & 0xfffc) | (sortKey & 0x03);
    }
}

var mtxOpenGLFromD3D = glMatrix.mat4.fromValues(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 2, 0, 0, 0, -1, 1);
// Converts a projection matrix from D3D-style Z range [0, 1] to OpenGL-style Z range [-1, 1]
function projectionMatrixOpenGLFromD3D(m) {
    glMatrix.mat4.mul(m, mtxOpenGLFromD3D, m);
}
var mtxD3DFromOpenGL = glMatrix.mat4.fromValues(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0.5, 0, 0, 0, 0.5, 1);
// Converts a projection matrix from OpenGL-style Z range [-1, 1] to D3D-style Z range [0, 1]
function projectionMatrixD3DFromOpenGL(m) {
    glMatrix.mat4.mul(m, mtxD3DFromOpenGL, m);
}
/**
 * Convert a projection matrix {@param m} between differing clip spaces.
 *
 * There are two kinds of clip-space conventions in active use in graphics APIs, differing in the
 * range of the Z axis: OpenGL (and thus GL ES and WebGL) use a Z range of [-1, 1] which matches
 * the X and Y axis ranges. Direct3D, Vulkan, Metal, and WebGPU all use a Z range of [0, 1], which
 * differs from the X and Y axis ranges, but makes sense from the perspective of a camera: a camera
 * can see to the left and right of it, above and below it, but only in front and not behind it.
 *
 * The [0, 1] convention for Z range also has better characteristics for "reversed depth". Since
 * floating point numbers have higher precision around 0 than around 1. We then get to choose where
 * to put the extra precise bits: close to the near plane, or close to the far plane.
 *
 * With OpenGL's [-1, 1] convention, both -1 and 1 have similar amounts of precision, so we don't
 * get to make the same choice, and our higher precision around 0 is stuck in the middle of the
 * scene, which doesn't particularly help.
 *
 * The gl-matrix library has two different kinds of entry points: {@method mat4.perpsective} will
 * generate a matrix with a [-1, 1] clip space, corresponding to {@see ClipSpaceNearZ.NegativeOne},
 * but {@method mat4.perspectiveZO} will generate a matrix with a [0, 1] clip space, corresponding
 * to {@see ClipSpaceNearZ.Zero}.
 *
 * This function does nothing if {@param dst} and {@param src} are the same.
 */
function projectionMatrixConvertClipSpaceNearZ(m, dst, src) {
    if (dst === src)
        return;
    if (dst === gDeviceApi.ClipSpaceNearZ.NEGATIVE_ONE)
        projectionMatrixOpenGLFromD3D(m);
    else if (dst === gDeviceApi.ClipSpaceNearZ.ZERO)
        projectionMatrixD3DFromOpenGL(m);
}

function fillVec3v(d, offs, v, v3) {
    if (v3 === void 0) { v3 = 0; }
    d[offs + 0] = v[0];
    d[offs + 1] = v[1];
    d[offs + 2] = v[2];
    d[offs + 3] = v3;
    return 4;
}
function fillVec4(d, offs, v0, v1, v2, v3) {
    if (v1 === void 0) { v1 = 0; }
    if (v2 === void 0) { v2 = 0; }
    if (v3 === void 0) { v3 = 0; }
    d[offs + 0] = v0;
    d[offs + 1] = v1;
    d[offs + 2] = v2;
    d[offs + 3] = v3;
    return 4;
}
function fillVec4v(d, offs, v) {
    d[offs + 0] = v[0];
    d[offs + 1] = v[1];
    d[offs + 2] = v[2];
    d[offs + 3] = v[3];
    return 4;
}
function fillColor(d, offs, c, a) {
    if (a === void 0) { a = c.a; }
    d[offs + 0] = c.r;
    d[offs + 1] = c.g;
    d[offs + 2] = c.b;
    d[offs + 3] = a;
    return 4;
}
// All of our matrices are row-major.
function fillMatrix4x4(d, offs, m) {
    // d[offs + 0] = m[0];
    // d[offs + 1] = m[4];
    // d[offs + 2] = m[8];
    // d[offs + 3] = m[12];
    // d[offs + 4] = m[1];
    // d[offs + 5] = m[5];
    // d[offs + 6] = m[9];
    // d[offs + 7] = m[13];
    // d[offs + 8] = m[2];
    // d[offs + 9] = m[6];
    // d[offs + 10] = m[10];
    // d[offs + 11] = m[14];
    // d[offs + 12] = m[3];
    // d[offs + 13] = m[7];
    // d[offs + 14] = m[11];
    // d[offs + 15] = m[15];
    d[offs + 0] = m[0];
    d[offs + 1] = m[1];
    d[offs + 2] = m[2];
    d[offs + 3] = m[3];
    d[offs + 4] = m[4];
    d[offs + 5] = m[5];
    d[offs + 6] = m[6];
    d[offs + 7] = m[7];
    d[offs + 8] = m[8];
    d[offs + 9] = m[9];
    d[offs + 10] = m[10];
    d[offs + 11] = m[11];
    d[offs + 12] = m[12];
    d[offs + 13] = m[13];
    d[offs + 14] = m[14];
    d[offs + 15] = m[15];
    return 4 * 4;
}
// export function fillMatrix4x3(d: Float32Array, offs: number, m: ReadonlyMat4): number {
//   d[offs + 0] = m[0];
//   d[offs + 1] = m[4];
//   d[offs + 2] = m[8];
//   d[offs + 3] = m[12];
//   d[offs + 4] = m[1];
//   d[offs + 5] = m[5];
//   d[offs + 6] = m[9];
//   d[offs + 7] = m[13];
//   d[offs + 8] = m[2];
//   d[offs + 9] = m[6];
//   d[offs + 10] = m[10];
//   d[offs + 11] = m[14];
//   return 4 * 3;
// }
// export function fillMatrix3x2(d: Float32Array, offs: number, m: ReadonlyMat2d): number {
//   // 3x2 matrices are actually sent across as 4x2.
//   const ma = m[0],
//     mb = m[1];
//   const mc = m[2],
//     md = m[3];
//   const mx = m[4],
//     my = m[5];
//   d[offs + 0] = ma;
//   d[offs + 1] = mc;
//   d[offs + 2] = mx;
//   d[offs + 3] = 0;
//   d[offs + 4] = mb;
//   d[offs + 5] = md;
//   d[offs + 6] = my;
//   d[offs + 7] = 0;
//   return 4 * 2;
// }
// export function fillMatrix4x2(d: Float32Array, offs: number, m: ReadonlyMat4): number {
//   // The bottom two rows are basically just ignored in a 4x2.
//   d[offs + 0] = m[0];
//   d[offs + 1] = m[4];
//   d[offs + 2] = m[8];
//   d[offs + 3] = m[12];
//   d[offs + 4] = m[1];
//   d[offs + 5] = m[5];
//   d[offs + 6] = m[9];
//   d[offs + 7] = m[13];
//   return 4 * 2;
// }

exports.RenderInstFlags = void 0;
(function (RenderInstFlags) {
    RenderInstFlags[RenderInstFlags["None"] = 0] = "None";
    RenderInstFlags[RenderInstFlags["Indexed"] = 1] = "Indexed";
    RenderInstFlags[RenderInstFlags["AllowSkippingIfPipelineNotReady"] = 2] = "AllowSkippingIfPipelineNotReady";
    // Mostly for error checking.
    RenderInstFlags[RenderInstFlags["Template"] = 4] = "Template";
    RenderInstFlags[RenderInstFlags["Draw"] = 8] = "Draw";
    // Which flags are inherited from templates...
    RenderInstFlags[RenderInstFlags["InheritedFlags"] = 3] = "InheritedFlags";
})(exports.RenderInstFlags || (exports.RenderInstFlags = {}));
var RenderInst = /** @class */ (function () {
    function RenderInst() {
        this.sortKey = 0;
        // Debugging pointer for whomever wants it...
        this.debug = null;
        this.uniforms = [];
        this.bindingDescriptors = gDeviceApi.nArray(1, function () { return ({
            bindingLayout: null,
            samplerBindings: [],
            uniformBufferBindings: [],
        }); });
        this.dynamicUniformBufferByteOffsets = gDeviceApi.nArray(4, function () { return 0; });
        this.flags = 0;
        this.vertexBuffers = null;
        this.indexBuffer = null;
        this.drawStart = 0;
        this.drawCount = 0;
        this.drawInstanceCount = 0;
        this.renderPipelineDescriptor = {
            inputLayout: null,
            megaStateDescriptor: gDeviceApi.copyMegaState(gDeviceApi.defaultMegaState),
            program: null,
            topology: gDeviceApi.PrimitiveTopology.TRIANGLES,
            colorAttachmentFormats: [],
            depthStencilAttachmentFormat: null,
            sampleCount: 1,
        };
        this.reset();
    }
    /**
     * Resets a render inst to be boring, so it can re-enter the pool.
     * Normally, you should not need to call this.
     */
    RenderInst.prototype.reset = function () {
        this.sortKey = 0;
        this.flags = exports.RenderInstFlags.AllowSkippingIfPipelineNotReady;
        this.vertexBuffers = null;
        this.indexBuffer = null;
        this.renderPipelineDescriptor.inputLayout = null;
    };
    /**
     * Copies the fields from another render inst {@param o} to this render inst.
     * Normally, you should not need to call this.
     */
    RenderInst.prototype.setFromTemplate = function (o) {
        var _a, _b;
        gDeviceApi.setMegaStateFlags(this.renderPipelineDescriptor.megaStateDescriptor, o.renderPipelineDescriptor.megaStateDescriptor);
        this.renderPipelineDescriptor.program = o.renderPipelineDescriptor.program;
        this.renderPipelineDescriptor.inputLayout =
            o.renderPipelineDescriptor.inputLayout;
        this.renderPipelineDescriptor.topology =
            o.renderPipelineDescriptor.topology;
        this.renderPipelineDescriptor.colorAttachmentFormats.length = Math.max(this.renderPipelineDescriptor.colorAttachmentFormats.length, o.renderPipelineDescriptor.colorAttachmentFormats.length);
        for (var i = 0; i < o.renderPipelineDescriptor.colorAttachmentFormats.length; i++)
            this.renderPipelineDescriptor.colorAttachmentFormats[i] =
                o.renderPipelineDescriptor.colorAttachmentFormats[i];
        this.renderPipelineDescriptor.depthStencilAttachmentFormat =
            o.renderPipelineDescriptor.depthStencilAttachmentFormat;
        this.renderPipelineDescriptor.sampleCount =
            o.renderPipelineDescriptor.sampleCount;
        this.uniformBuffer = o.uniformBuffer;
        this.uniforms = tslib.__spreadArray([], tslib.__read(o.uniforms), false);
        this.drawCount = o.drawCount;
        this.drawStart = o.drawStart;
        this.drawInstanceCount = o.drawInstanceCount;
        this.vertexBuffers = o.vertexBuffers;
        this.indexBuffer = o.indexBuffer;
        this.flags =
            (this.flags & ~exports.RenderInstFlags.InheritedFlags) |
                (o.flags & exports.RenderInstFlags.InheritedFlags);
        this.sortKey = o.sortKey;
        var tbd = this.bindingDescriptors[0], obd = o.bindingDescriptors[0];
        this.setBindingLayout({
            numSamplers: (_a = obd.samplerBindings) === null || _a === void 0 ? void 0 : _a.length,
            numUniformBuffers: (_b = obd.uniformBufferBindings) === null || _b === void 0 ? void 0 : _b.length,
        });
        for (var i = 0; i <
            Math.min(tbd.uniformBufferBindings.length, obd.uniformBufferBindings.length); i++)
            tbd.uniformBufferBindings[i].size =
                o.bindingDescriptors[0].uniformBufferBindings[i].size;
        this.setSamplerBindingsFromTextureMappings(obd.samplerBindings);
        for (var i = 0; i < o.dynamicUniformBufferByteOffsets.length; i++)
            this.dynamicUniformBufferByteOffsets[i] =
                o.dynamicUniformBufferByteOffsets[i];
    };
    RenderInst.prototype.validate = function () {
        var _a;
        // Validate uniform buffer bindings.
        for (var i = 0; i < this.bindingDescriptors.length; i++) {
            var bd = this.bindingDescriptors[i];
            for (var j = 0; j < ((_a = bd.uniformBufferBindings) === null || _a === void 0 ? void 0 : _a.length); j++)
                gDeviceApi.assert(bd.uniformBufferBindings[j].size > 0);
        }
        gDeviceApi.assert(this.drawCount > 0);
    };
    /**
     * Set the {@see Program} that this render inst will render with. This is part of the automatic
     * pipeline building facilities. At render time, a pipeline will be automatically and constructed from
     * the pipeline parameters.
     */
    RenderInst.prototype.setProgram = function (program) {
        this.renderPipelineDescriptor.program = program;
    };
    /**
     * Set the {@see MegaStateDescriptor} that this render inst will render with. This is part of the automatic
     * pipeline building facilities. At render time, a pipeline will be automatically and constructed from
     * the pipeline parameters.
     */
    RenderInst.prototype.setMegaStateFlags = function (r) {
        gDeviceApi.setMegaStateFlags(this.renderPipelineDescriptor.megaStateDescriptor, r);
        return this.renderPipelineDescriptor.megaStateDescriptor;
    };
    /**
     * Retrieve the {@see MegaStateDescriptor} property bag that this will render with. This is similar to
     * {@see setMegaStateFlags} but allows you to set fields directly on the internal property bag, rather than
     * merge them. This can be slightly more efficient.
     */
    RenderInst.prototype.getMegaStateFlags = function () {
        return this.renderPipelineDescriptor.megaStateDescriptor;
    };
    /**
     * Sets the vertex input configuration to be used by this render instance.
     * The {@see InputLayout} is used to construct the pipeline as part of the automatic pipeline building
     * facilities, while the {@see VertexBufferDescriptor} and {@see IndexBufferDescriptor} is used for the render.
     */
    RenderInst.prototype.setVertexInput = function (inputLayout, vertexBuffers, indexBuffer) {
        this.vertexBuffers = vertexBuffers;
        this.indexBuffer = indexBuffer;
        this.renderPipelineDescriptor.inputLayout = inputLayout;
    };
    RenderInst.prototype.setBindingLayout = function (bindingLayout) {
        gDeviceApi.assert(bindingLayout.numUniformBuffers <
            this.dynamicUniformBufferByteOffsets.length);
        for (var i = this.bindingDescriptors[0].uniformBufferBindings.length; i < bindingLayout.numUniformBuffers; i++)
            this.bindingDescriptors[0].uniformBufferBindings.push({
                binding: i,
                buffer: null,
                size: 0,
            });
        for (var i = this.bindingDescriptors[0].samplerBindings.length; i < bindingLayout.numSamplers; i++)
            this.bindingDescriptors[0].samplerBindings.push({
                sampler: null,
                texture: null,
            });
    };
    RenderInst.prototype.drawIndexes = function (indexCount, indexStart) {
        if (indexStart === void 0) { indexStart = 0; }
        this.flags = gDeviceApi.setBitFlagEnabled(this.flags, exports.RenderInstFlags.Indexed, true);
        this.drawCount = indexCount;
        this.drawStart = indexStart;
        this.drawInstanceCount = 1;
    };
    RenderInst.prototype.drawIndexesInstanced = function (indexCount, instanceCount, indexStart) {
        if (indexStart === void 0) { indexStart = 0; }
        this.flags = gDeviceApi.setBitFlagEnabled(this.flags, exports.RenderInstFlags.Indexed, true);
        this.drawCount = indexCount;
        this.drawStart = indexStart;
        this.drawInstanceCount = instanceCount;
    };
    RenderInst.prototype.drawPrimitives = function (primitiveCount, primitiveStart) {
        if (primitiveStart === void 0) { primitiveStart = 0; }
        this.flags = gDeviceApi.setBitFlagEnabled(this.flags, exports.RenderInstFlags.Indexed, false);
        this.drawCount = primitiveCount;
        this.drawStart = primitiveStart;
        this.drawInstanceCount = 1;
    };
    /**
     * account for WebGL1
     */
    RenderInst.prototype.setUniforms = function (bufferIndex, uniforms) {
        if (uniforms.length === 0) {
            return;
        }
        // use later in WebGL1
        this.uniforms[bufferIndex] = uniforms;
        // calc buffer size
        var offset = 0;
        var uboBuffer = [];
        uniforms.forEach(function (uniform) {
            var value = uniform.value;
            // number | number[] | Float32Array
            if (util.isNumber(value) ||
                Array.isArray(value) ||
                value instanceof Float32Array) {
                var array = util.isNumber(value) ? [value] : value;
                var formatByteSize = array.length > 4 ? 4 : array.length;
                // std140 UBO layout
                var emptySpace_1 = 4 - (offset % 4);
                if (emptySpace_1 !== 4) {
                    if (emptySpace_1 >= formatByteSize) ;
                    else {
                        offset += emptySpace_1;
                        for (var j = 0; j < emptySpace_1; j++) {
                            uboBuffer.push(0); // padding
                        }
                    }
                }
                offset += array.length;
                uboBuffer.push.apply(uboBuffer, tslib.__spreadArray([], tslib.__read(array), false));
            }
        });
        // padding
        var emptySpace = 4 - (uboBuffer.length % 4);
        if (emptySpace !== 4) {
            for (var j = 0; j < emptySpace; j++) {
                uboBuffer.push(0);
            }
        }
        // upload UBO
        var offs = this.allocateUniformBuffer(bufferIndex, uboBuffer.length);
        var d = this.mapUniformBufferF32(bufferIndex);
        for (var i = 0; i < uboBuffer.length; i += 4) {
            offs += fillVec4(d, offs, uboBuffer[i], uboBuffer[i + 1], uboBuffer[i + 2], uboBuffer[i + 3]);
        }
    };
    RenderInst.prototype.setUniformBuffer = function (uniformBuffer) {
        this.uniformBuffer = uniformBuffer;
    };
    /**
     * Allocates {@param wordCount} words from the uniform buffer and assigns it to the buffer
     * slot at index {@param bufferIndex}. As a convenience, this also directly returns the same
     * offset into the uniform buffer, in words, that would be returned by a subsequent call to
     * {@see getUniformBufferOffset}.
     */
    RenderInst.prototype.allocateUniformBuffer = function (bufferIndex, wordCount) {
        var _a;
        gDeviceApi.assert(((_a = this.bindingDescriptors[0].uniformBufferBindings) === null || _a === void 0 ? void 0 : _a.length) <
            this.dynamicUniformBufferByteOffsets.length);
        this.dynamicUniformBufferByteOffsets[bufferIndex] =
            this.uniformBuffer.allocateChunk(wordCount) << 2;
        var dst = this.bindingDescriptors[0].uniformBufferBindings[bufferIndex];
        dst.size = wordCount << 2;
        return this.getUniformBufferOffset(bufferIndex);
    };
    /**
     * Returns the offset into the uniform buffer, in words, that is assigned to the buffer slot
     * at index {@param bufferIndex}, to be used with e.g. {@see mapUniformBufferF32}.
     */
    RenderInst.prototype.getUniformBufferOffset = function (bufferIndex) {
        var wordOffset = this.dynamicUniformBufferByteOffsets[bufferIndex] >>> 2;
        return wordOffset;
    };
    /**
     * This is a convenience wrapper for {@see RenderDynamicUniformBuffer.mapBufferF32}, but uses
     * the values previously assigned for the uniform buffer slot at index {@param bufferIndex}.
     * Like {@see RenderDynamicUniformBuffer.mapBufferF32}, this does not return a slice for the
     * buffer; you need to write to it with the correct uniform buffer offset; this will usually be
     * returned by {@see allocateUniformBuffer}.
     */
    RenderInst.prototype.mapUniformBufferF32 = function (bufferIndex) {
        return this.uniformBuffer.mapBufferF32();
    };
    /**
     * Retrieve the {@see RenderDynamicUniformBuffer} that this render inst will use to allocate.
     */
    RenderInst.prototype.getUniformBuffer = function () {
        return this.uniformBuffer;
    };
    /**
     * Sets the {@param SamplerBinding}s in use by this render instance.
     *
     * Note that {@see RenderInst} has a method of doing late binding, intended to solve cases where live render
     * targets are used, which can have difficult control flow consequences for users. Pass a string instead of a
     * SamplerBinding to record that it can be resolved later, and use {@see RenderInst.resolveLateSamplerBinding}
     * or equivalent to fill it in later.
     */
    RenderInst.prototype.setSamplerBindingsFromTextureMappings = function (mappings) {
        mappings = mappings.filter(function (m) { return m; });
        for (var i = 0; i < this.bindingDescriptors[0].samplerBindings.length; i++) {
            var dst = this.bindingDescriptors[0].samplerBindings[i];
            var binding = mappings[i];
            if (binding === undefined || binding === null) {
                dst.texture = null;
                dst.sampler = null;
                continue;
            }
            dst.texture = binding.texture;
            dst.sampler = binding.sampler;
        }
    };
    /**
     * Sets whether this render inst should be skipped if the render pipeline isn't ready.
     *
     * Some draws of objects can be skipped if the pipelines aren't ready. Others are more
     * crucial to draw, and so this can be set to force for the pipeline to become available.
     *
     * By default, this is true.
     */
    RenderInst.prototype.setAllowSkippingIfPipelineNotReady = function (v) {
        this.flags = gDeviceApi.setBitFlagEnabled(this.flags, exports.RenderInstFlags.AllowSkippingIfPipelineNotReady, v);
    };
    RenderInst.prototype.setAttachmentFormatsFromRenderPass = function (device, passRenderer) {
        var passDescriptor = device.queryRenderPass(passRenderer);
        var sampleCount = -1;
        for (var i = 0; i < passDescriptor.colorAttachment.length; i++) {
            var colorAttachmentDescriptor = passDescriptor.colorAttachment[i] !== null
                ? device.queryRenderTarget(passDescriptor.colorAttachment[i])
                : null;
            this.renderPipelineDescriptor.colorAttachmentFormats[i] =
                colorAttachmentDescriptor !== null
                    ? colorAttachmentDescriptor.format
                    : null;
            if (colorAttachmentDescriptor !== null) {
                if (sampleCount === -1)
                    sampleCount = colorAttachmentDescriptor.sampleCount;
                else
                    gDeviceApi.assert(sampleCount === colorAttachmentDescriptor.sampleCount);
            }
        }
        var depthStencilAttachmentDescriptor = passDescriptor.depthStencilAttachment !== null
            ? device.queryRenderTarget(passDescriptor.depthStencilAttachment)
            : null;
        this.renderPipelineDescriptor.depthStencilAttachmentFormat =
            depthStencilAttachmentDescriptor !== null
                ? depthStencilAttachmentDescriptor.format
                : null;
        if (depthStencilAttachmentDescriptor !== null) {
            if (sampleCount === -1)
                sampleCount = depthStencilAttachmentDescriptor.sampleCount;
            else
                gDeviceApi.assert(sampleCount == depthStencilAttachmentDescriptor.sampleCount);
        }
        gDeviceApi.assert(sampleCount > 0);
        this.renderPipelineDescriptor.sampleCount = sampleCount;
    };
    RenderInst.prototype.drawOnPass = function (cache, passRenderer) {
        var _this = this;
        var device = cache.device;
        this.setAttachmentFormatsFromRenderPass(device, passRenderer);
        var gfxPipeline = cache.createRenderPipeline(this.renderPipelineDescriptor);
        var pipelineReady = device.pipelineQueryReady(gfxPipeline);
        if (!pipelineReady) {
            if (this.flags & exports.RenderInstFlags.AllowSkippingIfPipelineNotReady) {
                return false;
            }
            device.pipelineForceReady(gfxPipeline);
        }
        passRenderer.setPipeline(gfxPipeline);
        passRenderer.setVertexInput(this.renderPipelineDescriptor.inputLayout, this.vertexBuffers, this.indexBuffer);
        // upload uniforms
        for (var i = 0; i < this.bindingDescriptors[0].uniformBufferBindings.length; i++) {
            this.bindingDescriptors[0].uniformBufferBindings[i].buffer = gDeviceApi.assertExists(this.uniformBuffer.buffer);
            this.bindingDescriptors[0].uniformBufferBindings[i].offset =
                this.dynamicUniformBufferByteOffsets[i];
        }
        if (this.renderPipelineDescriptor.program.gl_program) {
            this.uniforms.forEach(function (uniforms) {
                var uniformsMap = {};
                uniforms.forEach(function (_a) {
                    var name = _a.name, value = _a.value;
                    uniformsMap[name] = value;
                });
                _this.renderPipelineDescriptor.program.setUniformsLegacy(uniformsMap);
            });
        }
        // TODO: Support multiple binding descriptors.
        var gfxBindings = cache.createBindings(tslib.__assign(tslib.__assign({}, this.bindingDescriptors[0]), { pipeline: gfxPipeline }));
        passRenderer.setBindings(gfxBindings);
        if (this.flags & exports.RenderInstFlags.Indexed) {
            passRenderer.drawIndexed(this.drawCount, this.drawInstanceCount, this.drawStart, 0, 0);
        }
        else {
            passRenderer.draw(this.drawCount, this.drawInstanceCount, this.drawStart, 0);
        }
        return true;
    };
    return RenderInst;
}());

var renderInstCompareNone = null;
function renderInstCompareSortKey(a, b) {
    return a.sortKey - b.sortKey;
}
exports.RenderInstExecutionOrder = void 0;
(function (RenderInstExecutionOrder) {
    RenderInstExecutionOrder[RenderInstExecutionOrder["Forwards"] = 0] = "Forwards";
    RenderInstExecutionOrder[RenderInstExecutionOrder["Backwards"] = 1] = "Backwards";
})(exports.RenderInstExecutionOrder || (exports.RenderInstExecutionOrder = {}));
var RenderInstList = /** @class */ (function () {
    function RenderInstList(compareFunction, executionOrder) {
        if (compareFunction === void 0) { compareFunction = renderInstCompareSortKey; }
        if (executionOrder === void 0) { executionOrder = exports.RenderInstExecutionOrder.Forwards; }
        this.renderInsts = [];
        this.usePostSort = false;
        this.compareFunction = compareFunction;
        this.executionOrder = executionOrder;
    }
    /**
     * Determine whether to use post-sorting, based on some heuristics.
     */
    RenderInstList.prototype.checkUsePostSort = function () {
        // Over a certain threshold, it's faster to push and then sort than insort directly...
        this.usePostSort =
            this.compareFunction !== null && this.renderInsts.length >= 500;
    };
    /**
     * Insert a render inst to the list. This directly inserts the render inst to
     * the position specified by the compare function, so the render inst must be
     * fully constructed at this point.
     */
    RenderInstList.prototype.insertSorted = function (renderInst) {
        if (this.compareFunction === null) {
            this.renderInsts.push(renderInst);
        }
        else if (this.usePostSort) {
            this.renderInsts.push(renderInst);
        }
        else {
            gDeviceApi.spliceBisectRight(this.renderInsts, renderInst, this.compareFunction);
        }
        this.checkUsePostSort();
    };
    RenderInstList.prototype.submitRenderInst = function (renderInst) {
        // TODO: drawCount = 0
        // renderInst.validate();
        renderInst.flags |= exports.RenderInstFlags.Draw;
        this.insertSorted(renderInst);
    };
    RenderInstList.prototype.ensureSorted = function () {
        if (this.usePostSort) {
            if (this.renderInsts.length !== 0)
                this.renderInsts.sort(this.compareFunction);
            this.usePostSort = false;
        }
    };
    RenderInstList.prototype.drawOnPassRendererNoReset = function (cache, passRenderer) {
        this.ensureSorted();
        if (this.executionOrder === exports.RenderInstExecutionOrder.Forwards) {
            for (var i = 0; i < this.renderInsts.length; i++)
                this.renderInsts[i].drawOnPass(cache, passRenderer);
        }
        else {
            for (var i = this.renderInsts.length - 1; i >= 0; i--)
                this.renderInsts[i].drawOnPass(cache, passRenderer);
        }
    };
    RenderInstList.prototype.reset = function () {
        this.renderInsts.length = 0;
    };
    RenderInstList.prototype.drawOnPassRenderer = function (cache, passRenderer) {
        this.drawOnPassRendererNoReset(cache, passRenderer);
        this.reset();
    };
    return RenderInstList;
}());

var RenderInstPool = /** @class */ (function () {
    function RenderInstPool() {
        // The pool contains all render insts that we've ever created.
        this.pool = [];
        // The number of render insts currently allocated out to the user.
        this.allocCount = 0;
    }
    RenderInstPool.prototype.allocRenderInstIndex = function () {
        this.allocCount++;
        if (this.allocCount > this.pool.length) {
            this.pool.push(new RenderInst());
        }
        return this.allocCount - 1;
    };
    RenderInstPool.prototype.popRenderInst = function () {
        this.allocCount--;
    };
    RenderInstPool.prototype.reset = function () {
        for (var i = 0; i < this.pool.length; i++) {
            this.pool[i].reset();
        }
        this.allocCount = 0;
    };
    RenderInstPool.prototype.destroy = function () {
        this.pool.length = 0;
        this.allocCount = 0;
    };
    return RenderInstPool;
}());

var RenderInstManager = /** @class */ (function () {
    function RenderInstManager(renderCache) {
        this.renderCache = renderCache;
        this.instPool = new RenderInstPool();
        this.templatePool = new RenderInstPool();
        this.simpleRenderInstList = new RenderInstList();
        this.currentRenderInstList = this.simpleRenderInstList;
    }
    /**
     * Creates a new RenderInst object and returns it. If there is a template
     * pushed onto the template stack, then its values will be used as a base for this
     * render inst.
     */
    RenderInstManager.prototype.newRenderInst = function () {
        var templateIndex = this.templatePool.allocCount - 1;
        var renderInstIndex = this.instPool.allocRenderInstIndex();
        var renderInst = this.instPool.pool[renderInstIndex];
        renderInst.debug = null;
        if (templateIndex >= 0)
            renderInst.setFromTemplate(this.templatePool.pool[templateIndex]);
        return renderInst;
    };
    /**
     * Submits RenderInst to the current render inst list. Note that
     * this assumes the render inst was fully filled in, so do not modify it
     * after submitting it.
     */
    RenderInstManager.prototype.submitRenderInst = function (renderInst, list) {
        if (list === void 0) { list = this.currentRenderInstList; }
        list.submitRenderInst(renderInst);
    };
    /**
     * Sets the currently active render inst list. This is the list that will
     * be used by @param submitRenderInst}. If you use this function, please
     * make sure to call {@see disableSimpleMode} when the RenderInstManager
     * is created, to ensure that nobody uses the "legacy" APIs. Failure to do
     * so might cause memory leaks or other problems.
     */
    RenderInstManager.prototype.setCurrentRenderInstList = function (list) {
        gDeviceApi.assert(this.simpleRenderInstList === null);
        this.currentRenderInstList = list;
    };
    /**
     * Pushes a new template render inst to the template stack. All properties set
     * on the topmost template on the template stack will be the defaults for both
     * for any future render insts created. Once done with a template, call
     * {@param popTemplateRenderInst} to pop it off the template stack.
     */
    RenderInstManager.prototype.pushTemplateRenderInst = function () {
        var templateIndex = this.templatePool.allocCount - 1;
        var newTemplateIndex = this.templatePool.allocRenderInstIndex();
        var newTemplate = this.templatePool.pool[newTemplateIndex];
        if (templateIndex >= 0)
            newTemplate.setFromTemplate(this.templatePool.pool[templateIndex]);
        newTemplate.flags |= exports.RenderInstFlags.Template;
        return newTemplate;
    };
    RenderInstManager.prototype.popTemplateRenderInst = function () {
        this.templatePool.popRenderInst();
    };
    /**
     * Retrieves the current template render inst on the top of the template stack.
     */
    RenderInstManager.prototype.getTemplateRenderInst = function () {
        var templateIndex = this.templatePool.allocCount - 1;
        return this.templatePool.pool[templateIndex];
    };
    /**
     * Reset all allocated render insts. This should be called at the end of the frame,
     * once done with all of the allocated render insts and render inst lists.
     */
    RenderInstManager.prototype.resetRenderInsts = function () {
        // Retire the existing render insts.
        this.instPool.reset();
        if (this.simpleRenderInstList !== null)
            this.simpleRenderInstList.reset();
        // Ensure we aren't leaking templates.
        gDeviceApi.assert(this.templatePool.allocCount === 0);
    };
    RenderInstManager.prototype.destroy = function () {
        this.instPool.destroy();
        this.renderCache.destroy();
    };
    /**
     * Disables the "simple" render inst list management API.
     */
    RenderInstManager.prototype.disableSimpleMode = function () {
        // This is a one-way street!
        this.simpleRenderInstList = null;
    };
    // /**
    //  * Execute all scheduled render insts in {@param list} onto the {@param RenderPass},
    //  * using {@param device} and {@param cache} to create any device-specific resources
    //  * necessary to complete the draws.
    //  */
    // drawListOnPassRenderer(list: RenderInstList, passRenderer: RenderPass): void {
    //   list.drawOnPassRenderer(this.renderCache, passRenderer);
    // }
    RenderInstManager.prototype.drawOnPassRenderer = function (passRenderer) {
        var list = gDeviceApi.assertExists(this.simpleRenderInstList);
        list.drawOnPassRenderer(this.renderCache, passRenderer);
    };
    RenderInstManager.prototype.drawOnPassRendererNoReset = function (passRenderer) {
        var list = gDeviceApi.assertExists(this.simpleRenderInstList);
        list.drawOnPassRendererNoReset(this.renderCache, passRenderer);
    };
    return RenderInstManager;
}());

var RenderHelper = /** @class */ (function () {
    function RenderHelper(parameters) {
        this.parameters = parameters;
    }
    RenderHelper.prototype.getDevice = function () {
        return this.device;
    };
    RenderHelper.prototype.setDevice = function (device) {
        this.device = device;
        this.renderCache = new RenderCache(device);
        this.renderGraph = new RenderGraph(this.device);
        this.renderInstManager = new RenderInstManager(this.renderCache);
        this.uniformBuffer = new DynamicUniformBuffer(this.device);
        // this.debugThumbnails = new DebugThumbnailDrawer(this);
    };
    RenderHelper.prototype.pushTemplateRenderInst = function () {
        var template = this.renderInstManager.pushTemplateRenderInst();
        template.setUniformBuffer(this.uniformBuffer);
        return template;
    };
    RenderHelper.prototype.prepareToRender = function () {
        this.uniformBuffer.prepareToRender();
    };
    RenderHelper.prototype.destroy = function () {
        if (this.uniformBuffer) {
            this.uniformBuffer.destroy();
        }
        if (this.renderInstManager) {
            this.renderInstManager.destroy();
        }
        if (this.renderCache) {
            this.renderCache.destroy();
        }
        if (this.renderGraph) {
            this.renderGraph.destroy();
        }
    };
    // getDebugTextDrawer(): TextDrawer | null {
    //   return null;
    // }
    RenderHelper.prototype.getCache = function () {
        return this.renderCache;
    };
    RenderHelper.prototype.getDefines = function () {
        var _a, _b, _c;
        return {
            USE_TONEMAPPING: ((_a = this.parameters) === null || _a === void 0 ? void 0 : _a.toneMapping) &&
                ((_b = this.parameters) === null || _b === void 0 ? void 0 : _b.toneMapping) !== exports.ToneMapping.NONE,
            toneMapping: (_c = this.parameters) === null || _c === void 0 ? void 0 : _c.toneMapping,
        };
    };
    return RenderHelper;
}());

var RGRenderTargetDescription = /** @class */ (function () {
    function RGRenderTargetDescription(format) {
        this.format = format;
        this.width = 0;
        this.height = 0;
        this.sampleCount = 0;
        this.colorClearColor = 'load';
        this.depthClearValue = 'load';
        this.stencilClearValue = 'load';
    }
    /**
     * Set the dimensions of a render target description.
     */
    RGRenderTargetDescription.prototype.setDimensions = function (width, height, sampleCount) {
        this.width = width;
        this.height = height;
        this.sampleCount = sampleCount;
    };
    RGRenderTargetDescription.prototype.copyDimensions = function (desc) {
        this.width = desc.width;
        this.height = desc.height;
        this.sampleCount = desc.sampleCount;
    };
    return RGRenderTargetDescription;
}());

function makeAttachmentClearDescriptor(clearColor) {
    return {
        colorClearColor: clearColor,
        // depthClearValue: reverseDepthForClearValue(1.0),
        depthClearValue: 1,
        stencilClearValue: 0.0,
    };
}
var standardFullClearRenderPassDescriptor = makeAttachmentClearDescriptor(gDeviceApi.colorNewFromRGBA(0.88, 0.88, 0.88, 1.0));
var opaqueBlackFullClearRenderPassDescriptor = makeAttachmentClearDescriptor(gDeviceApi.OpaqueBlack);
var opaqueWhiteFullClearRenderPassDescriptor = makeAttachmentClearDescriptor(gDeviceApi.OpaqueWhite);
exports.AntialiasingMode = void 0;
(function (AntialiasingMode) {
    AntialiasingMode[AntialiasingMode["None"] = 0] = "None";
    AntialiasingMode[AntialiasingMode["FXAA"] = 1] = "FXAA";
    AntialiasingMode[AntialiasingMode["MSAAx4"] = 2] = "MSAAx4";
})(exports.AntialiasingMode || (exports.AntialiasingMode = {}));
function selectFormatSimple(slot) {
    if (slot === exports.RGAttachmentSlot.Color0) {
        return gDeviceApi.Format.U8_RGBA_RT;
    }
    else if (slot === exports.RGAttachmentSlot.DepthStencil) {
        return gDeviceApi.Format.D24_S8;
    }
    else {
        throw new Error('whoops');
    }
}
function selectSampleCount(renderInput) {
    if (renderInput.antialiasingMode === exports.AntialiasingMode.MSAAx4) {
        return 4;
    }
    else {
        return 1;
    }
}
function setBackbufferDescSimple(desc, renderInput) {
    var sampleCount = selectSampleCount(renderInput);
    desc.setDimensions(renderInput.backbufferWidth, renderInput.backbufferHeight, sampleCount);
}
function makeBackbufferDescSimple(slot, renderInput, clearDescriptor) {
    var pixelFormat = selectFormatSimple(slot);
    var desc = new RGRenderTargetDescription(pixelFormat);
    setBackbufferDescSimple(desc, renderInput);
    if (clearDescriptor !== null) {
        desc.colorClearColor = clearDescriptor.colorClearColor;
        desc.depthClearValue = clearDescriptor.depthClearValue;
        desc.stencilClearValue = clearDescriptor.stencilClearValue;
    }
    return desc;
}

var TextureMapping = /** @class */ (function () {
    function TextureMapping() {
        this.texture = null;
        this.sampler = null;
        this.width = 0;
        this.height = 0;
        this.lodBias = 0;
    }
    // GL sucks. This is a convenience when building texture matrices.
    // The core renderer does not use this code at all.
    // flipY: boolean = false;
    TextureMapping.prototype.reset = function () {
        this.texture = null;
        this.sampler = null;
        this.width = 0;
        this.height = 0;
        this.lodBias = 0;
        // this.flipY = false;
    };
    TextureMapping.prototype.copy = function (other) {
        this.texture = other.texture;
        this.sampler = other.sampler;
        this.width = other.width;
        this.height = other.height;
        this.lodBias = other.lodBias;
        // this.flipY = other.flipY;
    };
    return TextureMapping;
}());

// Public API for saving off copies of images for temporal-style effects.
var TemporalTexture = /** @class */ (function () {
    function TemporalTexture() {
        // These names might be a bit confusing, but they're named relative to the graph.
        // outputTexture is the target of a resolve, inputTexture is the source for sampling.
        this.inputTexture = null;
        this.outputTexture = null;
    }
    TemporalTexture.prototype.setDescription = function (device, desc) {
        // Updating the description will happen at the start of the frame,
        // so we need to keep the inputTexture alive (the previous frame's texture),
        // and create a new outputTexture.
        if (this.inputTexture !== this.outputTexture) {
            if (this.inputTexture !== null)
                this.inputTexture.destroy();
            // Set the input texture to our old output texture.
            this.inputTexture = this.outputTexture;
        }
        gDeviceApi.assert(this.inputTexture === this.outputTexture);
        if (this.outputTexture !== null &&
            this.outputTexture.matchesDescription(desc))
            return;
        this.outputTexture = new SingleSampledTexture(device, desc);
        if (this.inputTexture === null)
            this.inputTexture = this.outputTexture;
    };
    TemporalTexture.prototype.getTextureForSampling = function () {
        return this.inputTexture !== null ? this.inputTexture.texture : null;
    };
    TemporalTexture.prototype.getTextureForResolving = function () {
        var _a;
        return (_a = this.outputTexture) === null || _a === void 0 ? void 0 : _a.texture;
    };
    TemporalTexture.prototype.destroy = function () {
        if (this.outputTexture !== null &&
            this.outputTexture !== this.inputTexture) {
            this.outputTexture.destroy();
            this.outputTexture = null;
        }
        if (this.inputTexture !== null) {
            this.inputTexture.destroy();
            this.inputTexture = null;
        }
    };
    return TemporalTexture;
}());

var Light = /** @class */ (function (_super) {
    tslib.__extends(Light, _super);
    function Light(_a) {
        if (_a === void 0) { _a = {}; }
        var style = _a.style, rest = tslib.__rest(_a, ["style"]);
        return _super.call(this, tslib.__assign({ type: Light.tag, style: tslib.__assign({ intensity: Math.PI }, style) }, rest)) || this;
    }
    Light.tag = 'light';
    return Light;
}(gLite.DisplayObject));

exports.FogType = void 0;
(function (FogType) {
    FogType[FogType["NONE"] = 0] = "NONE";
    FogType[FogType["EXP"] = 1] = "EXP";
    FogType[FogType["EXP2"] = 2] = "EXP2";
    FogType[FogType["LINEAR"] = 3] = "LINEAR";
})(exports.FogType || (exports.FogType = {}));
var Fog = /** @class */ (function (_super) {
    tslib.__extends(Fog, _super);
    function Fog(_a) {
        if (_a === void 0) { _a = {}; }
        var style = _a.style, rest = tslib.__rest(_a, ["style"]);
        return _super.call(this, tslib.__assign({ type: Fog.tag, style: tslib.__assign({ type: exports.FogType.NONE, fill: 'black', start: 1, end: 1000, density: 0 }, style) }, rest)) || this;
    }
    Fog.tag = 'fog';
    return Fog;
}(gLite.DisplayObject));

function makeDataBuffer(device, usage, data, hint) {
    if (hint === void 0) { hint = gDeviceApi.BufferFrequencyHint.STATIC; }
    var buffer = device.createBuffer({
        viewOrSize: data.byteLength,
        usage: usage,
        hint: hint,
    });
    buffer.setSubData(0, new Uint8Array(data));
    return buffer;
}
exports.GeometryEvent = void 0;
(function (GeometryEvent) {
    GeometryEvent["CHANGED"] = "changed";
})(exports.GeometryEvent || (exports.GeometryEvent = {}));
/**
 * just hold descriptors of buffers & indices, won't use underlying GPU resources
 */
var BufferGeometry = /** @class */ (function (_super) {
    tslib.__extends(BufferGeometry, _super);
    function BufferGeometry(device, props) {
        if (props === void 0) { props = {}; }
        var _this = _super.call(this) || this;
        _this.device = device;
        _this.props = props;
        _this.drawMode = gDeviceApi.PrimitiveTopology.TRIANGLES;
        _this.vertexBuffers = [];
        _this.vertices = [];
        _this.inputLayoutDescriptor = {
            vertexBufferDescriptors: [],
            indexBufferFormat: null,
            program: null,
        };
        _this.vertexCount = 0;
        _this.instancedCount = 0;
        _this.indexStart = 0;
        _this.primitiveStart = 0;
        _this.dirty = true;
        _this.meshes = [];
        return _this;
    }
    BufferGeometry.prototype.validate = function (mesh) {
        return true;
    };
    BufferGeometry.prototype.build = function (meshes) { };
    BufferGeometry.prototype.computeBoundingBox = function () {
        return new gLite.AABB();
    };
    BufferGeometry.prototype.setIndexBuffer = function (indices) {
        if (this.indexBuffer) {
            this.indexBuffer.destroy();
        }
        this.indexBuffer = makeDataBuffer(this.device, gDeviceApi.BufferUsage.INDEX, new Uint32Array(ArrayBuffer.isView(indices) ? indices.buffer : indices)
            .buffer);
        this.indices = indices;
        this.inputLayoutDescriptor.indexBufferFormat = gDeviceApi.Format.U32_R;
        return this;
    };
    BufferGeometry.prototype.setVertexBuffer = function (descriptor) {
        var _this = this;
        var bufferIndex = descriptor.bufferIndex, byteStride = descriptor.byteStride, stepMode = descriptor.stepMode, attributes = descriptor.attributes, data = descriptor.data;
        this.inputLayoutDescriptor.vertexBufferDescriptors[bufferIndex] = {
            arrayStride: byteStride,
            stepMode: stepMode,
            attributes: [],
        };
        this.vertices[bufferIndex] = data;
        attributes.forEach(function (_a) {
            var format = _a.format, bufferByteOffset = _a.bufferByteOffset, location = _a.location, divisor = _a.divisor; _a.byteStride;
            var existed = _this.inputLayoutDescriptor.vertexBufferDescriptors[bufferIndex].attributes.find(function (e) { return e.shaderLocation === location; });
            if (existed) {
                existed.format = format;
                existed.offset = bufferByteOffset;
                existed.divisor = divisor;
            }
            else {
                _this.inputLayoutDescriptor.vertexBufferDescriptors[bufferIndex].attributes.push({
                    format: format,
                    offset: bufferByteOffset,
                    shaderLocation: location,
                    divisor: divisor,
                });
            }
        });
        // create GPUBuffer
        if (this.vertexBuffers[bufferIndex]) {
            this.vertexBuffers[bufferIndex].destroy();
        }
        var buffer = makeDataBuffer(this.device, gDeviceApi.BufferUsage.VERTEX, data.buffer, gDeviceApi.BufferFrequencyHint.DYNAMIC);
        this.vertexBuffers[bufferIndex] = buffer;
        return this;
    };
    BufferGeometry.prototype.getVertexBuffer = function (bufferIndex) {
        return this.vertexBuffers[bufferIndex];
    };
    BufferGeometry.prototype.updateVertexBuffer = function (bufferIndex, location, index, data) {
        var bufferDescriptor = this.inputLayoutDescriptor.vertexBufferDescriptors[bufferIndex];
        if (!bufferDescriptor) {
            return;
        }
        var arrayStride = bufferDescriptor.arrayStride;
        var descriptor = this.inputLayoutDescriptor.vertexBufferDescriptors[bufferIndex].attributes.find(function (d) { return d.shaderLocation === location; });
        if (descriptor) {
            var vertexBuffer = this.getVertexBuffer(bufferIndex);
            var offset = index * arrayStride;
            vertexBuffer.setSubData(descriptor.offset + offset, data);
            // TODO: update vertices
            // this.vertices[bufferIndex] = data;
        }
        this.emit(exports.GeometryEvent.CHANGED);
    };
    BufferGeometry.prototype.updateIndices = function (indices, offset) {
        if (offset === void 0) { offset = 0; }
        if (this.indexBuffer) {
            this.indexBuffer.setSubData(offset, new Uint8Array(ArrayBuffer.isView(indices) ? indices : new Uint32Array(indices)));
        }
        return this;
    };
    BufferGeometry.prototype.destroy = function () {
        this.vertexBuffers.forEach(function (buffer) {
            if (buffer) {
                buffer.destroy();
            }
        });
        if (this.indexBuffer) {
            this.indexBuffer.destroy();
        }
        this.inputLayoutDescriptor.vertexBufferDescriptors = [];
        this.indexBuffer = undefined;
        this.vertexBuffers = [];
        this.indices = undefined;
        this.vertices = [];
        this.vertexCount = 0;
        this.instancedCount = 0;
    };
    return BufferGeometry;
}(EventEmitter));

var vert$5 = "#define GLSLIFY 1\nlayout(location = 0) in vec2 a_Position;\n\nout vec2 v_TexCoord;\n\nvoid main() {\n  v_TexCoord = 0.5 * (a_Position + 1.0);\n  gl_Position = vec4(a_Position, 0., 1.);\n\n  #ifdef VIEWPORT_ORIGIN_TL\n    v_TexCoord.y = 1.0 - v_TexCoord.y;\n  #endif\n}"; // eslint-disable-line

var frag$5 = "#define GLSLIFY 1\nuniform sampler2D u_Texture;\nin vec2 v_TexCoord;\n\nout vec4 outputColor;\n\nfloat MonochromeNTSC(vec3 t_Color) {\n  // NTSC primaries.\n  return dot(t_Color.rgb, vec3(0.299, 0.587, 0.114));\n}\n\nvec4 FXAA(PD_SAMPLER_2D(t_Texture), in vec2 t_PixelCenter, in vec2 t_InvResolution) {\n  // FXAA v2, based on implementations:\n  // http://www.geeks3d.com/20110405/fxaa-fast-approximate-anti-aliasing-demo-glsl-opengl-test-radeon-geforce/\n  // https://github.com/mitsuhiko/webgl-meincraft\n\n  float lumaMM = MonochromeNTSC(texture(PU_SAMPLER_2D(t_Texture), t_PixelCenter.xy).rgb);\n\n  #if 1\n    vec2 t_PixelTopLeft = t_PixelCenter.xy - t_InvResolution.xy * 0.5;\n    float lumaNW = MonochromeNTSC(texture(PU_SAMPLER_2D(t_Texture), t_PixelTopLeft.xy)             .rgb);\n    float lumaNE = MonochromeNTSC(texture(PU_SAMPLER_2D(t_Texture), t_PixelTopLeft.xy + vec2(1.0, 0.0)).rgb);\n    float lumaSW = MonochromeNTSC(texture(PU_SAMPLER_2D(t_Texture), t_PixelTopLeft.xy + vec2(0.0, 1.0)).rgb);\n    float lumaSE = MonochromeNTSC(texture(PU_SAMPLER_2D(t_Texture), t_PixelTopLeft.xy + vec2(1.0, 1.0)).rgb);\n  #else\n    // We're at the pixel center -- pixel edges are 0.5 units away.\n    // NOTE(jstpierre): mitsuhiko's port seems to get this wrong?\n    vec2 t_PixelSize = t_InvResolution.xy * 0.5;\n\n    float lumaNW = MonochromeNTSC(texture(PU_SAMPLER_2D(t_Texture), t_PixelCenter.xy + t_PixelSize * vec2(-1.0, -1.0)).rgb);\n    float lumaNE = MonochromeNTSC(texture(PU_SAMPLER_2D(t_Texture), t_PixelCenter.xy + t_PixelSize * vec2( 1.0, -1.0)).rgb);\n    float lumaSW = MonochromeNTSC(texture(PU_SAMPLER_2D(t_Texture), t_PixelCenter.xy + t_PixelSize * vec2(-1.0,  1.0)).rgb);\n    float lumaSE = MonochromeNTSC(texture(PU_SAMPLER_2D(t_Texture), t_PixelCenter.xy + t_PixelSize * vec2( 1.0,  1.0)).rgb);\n  #endif\n\n  vec2 dir; \n  dir.x = -((lumaNW + lumaNE) - (lumaSW + lumaSE));\n  dir.y =  ((lumaNW + lumaSW) - (lumaNE + lumaSE));\n\n  const float FXAA_REDUCE_MIN = 1.0/128.0;\n  const float FXAA_REDUCE_MUL = 1.0/8.0;\n  const float FXAA_SPAN_MAX = 8.0;\n\n  float dirReduce = max(\n      (lumaNW + lumaNE + lumaSW + lumaSE) * (0.25 * FXAA_REDUCE_MUL),\n      FXAA_REDUCE_MIN);\n\n  float rcpDirMin = 1.0/(min(abs(dir.x), abs(dir.y)) + dirReduce);\n  dir = min(vec2( FXAA_SPAN_MAX,  FXAA_SPAN_MAX), max(vec2(-FXAA_SPAN_MAX, -FXAA_SPAN_MAX), dir * rcpDirMin)) * u_InvResolution.xy;\n\n  float lumaMin = min(lumaMM, min(min(lumaNW, lumaNE), min(lumaSW, lumaSE)));\n  float lumaMax = max(lumaMM, max(max(lumaNW, lumaNE), max(lumaSW, lumaSE)));\n\n  vec4 rgbA = (1.0/2.0) * (\n      texture(PU_SAMPLER_2D(t_Texture), t_PixelCenter.xy + dir * (1.0/3.0 - 0.5)) +\n      texture(PU_SAMPLER_2D(t_Texture), t_PixelCenter.xy + dir * (2.0/3.0 - 0.5)));\n  vec4 rgbB = rgbA * (1.0/2.0) + (1.0/4.0) * (\n      texture(PU_SAMPLER_2D(t_Texture), t_PixelCenter.xy + dir * (0.0/3.0 - 0.5)) +\n      texture(PU_SAMPLER_2D(t_Texture), t_PixelCenter.xy + dir * (3.0/3.0 - 0.5)));\n  float lumaB = MonochromeNTSC(rgbB.rgb);\n\n  vec4 rgbOutput = ((lumaB < lumaMin) || (lumaB > lumaMax)) ? rgbA : rgbB;\n  return rgbOutput;\n}\n\nvoid main() {\n  outputColor = FXAA(PP_SAMPLER_2D(u_Texture), v_TexCoord.xy, u_InvResolution.xy);\n}"; // eslint-disable-line

var FXAAProgram = /** @class */ (function (_super) {
    tslib.__extends(FXAAProgram, _super);
    function FXAAProgram() {
        var _this = _super.apply(this, tslib.__spreadArray([], tslib.__read(arguments), false)) || this;
        _this.features = {};
        _this.both = "\nlayout(std140) uniform ub_Params {\n    vec4 u_Misc[1];\n};\n#define u_InvResolution (u_Misc[0].xy)\n";
        _this.vert = vert$5;
        _this.frag = frag$5;
        return _this;
    }
    return FXAAProgram;
}(DeviceProgram));
var textureMapping = gDeviceApi.nArray(1, function () { return new TextureMapping(); });
var geometry;
var inputLayout;
function pushFXAAPass(builder, renderHelper, renderInput, mainColorTargetID) {
    builder.pushPass(function (pass) {
        pass.setDebugName('FXAA');
        pass.attachRenderTargetID(exports.RGAttachmentSlot.Color0, mainColorTargetID);
        var mainColorResolveTextureID = builder.resolveRenderTarget(mainColorTargetID);
        pass.attachResolveTexture(mainColorResolveTextureID);
        var renderInst = renderHelper.renderInstManager.newRenderInst();
        renderInst.setUniformBuffer(renderHelper.uniformBuffer);
        renderInst.setAllowSkippingIfPipelineNotReady(false);
        renderInst.setMegaStateFlags(gDeviceApi.fullscreenMegaState);
        renderInst.setBindingLayout({ numUniformBuffers: 1, numSamplers: 1 });
        renderInst.drawPrimitives(3);
        // since gl_VertexID is not available in GLSL 100, we need to use a geometry
        var offs = renderInst.allocateUniformBuffer(0, 4);
        var d = renderInst.mapUniformBufferF32(0);
        fillVec4(d, offs, 1.0 / renderInput.backbufferWidth, 1.0 / renderInput.backbufferHeight);
        var fxaaProgram = new FXAAProgram();
        var program = renderHelper.renderCache.createProgramSimple(fxaaProgram);
        renderInst.setProgram(program);
        if (!geometry) {
            geometry = new BufferGeometry(renderHelper.getDevice());
            geometry.setVertexBuffer({
                bufferIndex: 0,
                byteStride: 4 * 2,
                stepMode: gDeviceApi.VertexStepMode.VERTEX,
                attributes: [
                    {
                        format: gDeviceApi.Format.F32_RG,
                        bufferByteOffset: 4 * 0,
                        location: 0,
                    },
                ],
                // rendering a fullscreen triangle instead of quad
                // @see https://www.saschawillems.de/blog/2016/08/13/vulkan-tutorial-on-rendering-a-fullscreen-quad-without-buffers/
                data: new Float32Array([1, 3, -3, -1, 1, -1]),
            });
            geometry.vertexCount = 3;
            inputLayout = renderHelper
                .getCache()
                .createInputLayout(geometry.inputLayoutDescriptor);
        }
        pass.exec(function (passRenderer, scope) {
            textureMapping[0].texture = scope.getResolveTextureForID(mainColorResolveTextureID);
            renderInst.setSamplerBindingsFromTextureMappings(textureMapping);
            renderInst.setVertexInput(inputLayout, geometry.vertexBuffers.map(function (buffer) { return ({
                buffer: buffer,
                byteOffset: 0,
            }); }), null);
            renderInst.drawOnPass(renderHelper.renderCache, passRenderer);
        });
    });
}

// scene uniform block index
var SceneUniformBufferIndex = 0;
// uniforms in scene level
var SceneUniform;
(function (SceneUniform) {
    SceneUniform["PROJECTION_MATRIX"] = "u_ProjectionMatrix";
    SceneUniform["VIEW_MATRIX"] = "u_ViewMatrix";
    SceneUniform["CAMERA_POSITION"] = "u_CameraPosition";
    SceneUniform["DEVICE_PIXEL_RATIO"] = "u_DevicePixelRatio";
    SceneUniform["VIEWPORT"] = "u_Viewport";
    SceneUniform["IS_ORTHO"] = "u_IsOrtho";
    SceneUniform["IS_PICKING"] = "u_IsPicking";
})(SceneUniform || (SceneUniform = {}));
var RenderGraphPlugin = /** @class */ (function () {
    function RenderGraphPlugin(renderHelper, lightPool, texturePool, batchManager, options) {
        this.renderHelper = renderHelper;
        this.lightPool = lightPool;
        this.texturePool = texturePool;
        this.batchManager = batchManager;
        this.options = options;
        this.renderLists = {
            /**
             * used in main forward rendering pass
             */
            world: new RenderInstList(),
            /**
             * used in picking pass, should disable blending
             */
            picking: new RenderInstList(),
        };
    }
    RenderGraphPlugin.prototype.getDevice = function () {
        return this.device;
    };
    RenderGraphPlugin.prototype.getSwapChain = function () {
        return this.swapChain;
    };
    RenderGraphPlugin.prototype.getRenderLists = function () {
        return this.renderLists;
    };
    RenderGraphPlugin.prototype.apply = function (context) {
        var _this = this;
        this.context = context;
        var renderingService = context.renderingService, renderingContext = context.renderingContext, config = context.config;
        var canvas = renderingContext.root.ownerDocument.defaultView;
        config.disableRenderHooks = true;
        var handleMounted = function (e) {
            var object = e.target;
            // collect lights
            if (object.nodeName === Light.tag) {
                _this.lightPool.addLight(object);
                return;
            }
            else if (object.nodeName === Fog.tag) {
                _this.lightPool.addFog(object);
                return;
            }
            // @ts-ignore
            if (!object.renderable3D) {
                // @ts-ignore
                object.renderable3D = new Renderable3D();
            }
            _this.batchManager.add(object);
        };
        var handleUnmounted = function (e) {
            var _a, _b;
            var object = e.target;
            if (object.nodeName === Light.tag) {
                _this.lightPool.removeLight(object);
                return;
            }
            else if (object.nodeName === Fog.tag) {
                _this.lightPool.removeFog(object);
                return;
            }
            else if (object.nodeName === gLite.Shape.MESH) {
                if ((_a = object.style.geometry) === null || _a === void 0 ? void 0 : _a.meshes) {
                    var index = object.style.geometry.meshes.indexOf(object);
                    if (index > -1) {
                        object.style.geometry.meshes.splice(index, 1);
                    }
                }
                if ((_b = object.style.material) === null || _b === void 0 ? void 0 : _b.meshes) {
                    var index = object.style.material.meshes.indexOf(object);
                    if (index > -1) {
                        object.style.material.meshes.splice(index, 1);
                    }
                }
            }
            if (_this.swapChain) {
                _this.batchManager.remove(object);
            }
            // @ts-ignore
            delete object.renderable3D;
            // entity.removeComponent(Geometry3D, true);
            // entity.removeComponent(Material3D, true);
            // entity.removeComponent(Renderable3D, true);
        };
        var handleAttributeChanged = function (e) {
            if (_this.swapChain) {
                var object = e.target;
                var attrName = e.attrName, newValue = e.newValue;
                if (attrName === 'zIndex') {
                    object.parentNode.forEach(function (child) {
                        _this.batchManager.changeRenderOrder(child, child.sortable.renderOrder);
                    });
                }
                else {
                    _this.batchManager.updateAttribute(object, attrName, newValue);
                }
            }
        };
        var handleBoundsChanged = function (e) {
            if (_this.swapChain) {
                var object = e.target;
                _this.batchManager.updateAttribute(object, 'modelMatrix', null);
            }
        };
        renderingService.hooks.initAsync.tapPromise(RenderGraphPlugin.tag, function () { return tslib.__awaiter(_this, void 0, void 0, function () {
            var $canvas, _a, width, height, _b;
            var _this = this;
            return tslib.__generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        canvas.addEventListener(gLite.ElementEvent.MOUNTED, handleMounted);
                        canvas.addEventListener(gLite.ElementEvent.UNMOUNTED, handleUnmounted);
                        canvas.addEventListener(gLite.ElementEvent.ATTR_MODIFIED, handleAttributeChanged);
                        canvas.addEventListener(gLite.ElementEvent.BOUNDS_CHANGED, handleBoundsChanged);
                        this.context.config.renderer.getConfig().enableDirtyRectangleRendering =
                            false;
                        $canvas = this.context.contextService.getDomElement();
                        _a = this.context.config, width = _a.width, height = _a.height;
                        this.context.contextService.resize(width, height);
                        // create swap chain and get device
                        // @ts-ignore
                        _b = this;
                        return [4 /*yield*/, this.context.deviceContribution.createSwapChain($canvas)];
                    case 1:
                        // create swap chain and get device
                        // @ts-ignore
                        _b.swapChain = _c.sent();
                        this.device = this.swapChain.getDevice();
                        this.renderHelper.setDevice(this.device);
                        this.renderHelper.renderInstManager.disableSimpleMode();
                        this.swapChain.configureSwapChain($canvas.width, $canvas.height);
                        canvas.addEventListener(gLite.CanvasEvent.RESIZE, function () {
                            _this.swapChain.configureSwapChain($canvas.width, $canvas.height);
                        });
                        this.batchManager.attach(tslib.__assign({ device: this.device }, context));
                        return [2 /*return*/];
                }
            });
        }); });
        renderingService.hooks.destroy.tap(RenderGraphPlugin.tag, function () {
            _this.renderHelper.destroy();
            _this.batchManager.destroy();
            _this.texturePool.destroy();
            canvas.removeEventListener(gLite.ElementEvent.MOUNTED, handleMounted);
            canvas.removeEventListener(gLite.ElementEvent.UNMOUNTED, handleUnmounted);
            canvas.removeEventListener(gLite.ElementEvent.ATTR_MODIFIED, handleAttributeChanged);
            canvas.removeEventListener(gLite.ElementEvent.BOUNDS_CHANGED, handleBoundsChanged);
            _this.device.destroy();
            _this.device.checkForLeaks();
            config.disableRenderHooks = false;
        });
        /**
         * build frame graph at the beginning of each frame
         */
        renderingService.hooks.beginFrame.tap(RenderGraphPlugin.tag, function () {
            var _a;
            var canvas = _this.swapChain.getCanvas();
            var renderInstManager = _this.renderHelper.renderInstManager;
            _this.builder = _this.renderHelper.renderGraph.newGraphBuilder();
            var clearColor;
            if (_this.context.config.background === 'transparent') {
                clearColor = gDeviceApi.TransparentBlack;
            }
            else {
                // use canvas.background
                var backgroundColor = gLite.parseColor(_this.context.config.background);
                clearColor = _this.context.config.background
                    ? // use premultipliedAlpha
                        // @see https://canvatechblog.com/alpha-blending-and-webgl-99feb392779e
                        gDeviceApi.colorNewFromRGBA((Number(backgroundColor.r) / 255) * Number(backgroundColor.alpha), (Number(backgroundColor.g) / 255) * Number(backgroundColor.alpha), (Number(backgroundColor.b) / 255) * Number(backgroundColor.alpha), Number(backgroundColor.alpha))
                    : gDeviceApi.TransparentWhite;
            }
            // retrieve at each frame since canvas may resize
            var renderInput = {
                backbufferWidth: canvas.width,
                backbufferHeight: canvas.height,
                antialiasingMode: exports.AntialiasingMode.None,
            };
            // create main Color RT
            var mainRenderDesc = makeBackbufferDescSimple(exports.RGAttachmentSlot.Color0, renderInput, makeAttachmentClearDescriptor(clearColor));
            // create main Depth RT
            var mainDepthDesc = makeBackbufferDescSimple(exports.RGAttachmentSlot.DepthStencil, renderInput, opaqueWhiteFullClearRenderPassDescriptor);
            var mainColorTargetID = _this.builder.createRenderTargetID(mainRenderDesc, 'Main Color');
            var mainDepthTargetID = _this.builder.createRenderTargetID(mainDepthDesc, 'Main Depth');
            // main render pass
            _this.builder.pushPass(function (pass) {
                pass.setDebugName('Main Render Pass');
                pass.attachRenderTargetID(exports.RGAttachmentSlot.Color0, mainColorTargetID);
                pass.attachRenderTargetID(exports.RGAttachmentSlot.DepthStencil, mainDepthTargetID);
                pass.exec(function (passRenderer) {
                    _this.renderLists.world.drawOnPassRenderer(renderInstManager.renderCache, passRenderer);
                });
            });
            // TODO: other post-processing passes
            if ((_a = _this.options) === null || _a === void 0 ? void 0 : _a.enableFXAA) {
                // FXAA
                pushFXAAPass(_this.builder, _this.renderHelper, renderInput, mainColorTargetID);
            }
            // output to screen
            _this.builder.resolveRenderTargetToExternalTexture(mainColorTargetID, _this.swapChain.getOnscreenTexture());
        });
        renderingService.hooks.endFrame.tap(RenderGraphPlugin.tag, function () {
            var renderInstManager = _this.renderHelper.renderInstManager;
            // TODO: time for GPU Animation
            // const timeInMilliseconds = window.performance.now();
            // Push our outer template, which contains the dynamic UBO bindings...
            var template = _this.renderHelper.pushTemplateRenderInst();
            // SceneParams: binding = 0, ObjectParams: binding = 1
            template.setBindingLayout({ numUniformBuffers: 2, numSamplers: 0 });
            template.setMegaStateFlags(gDeviceApi.setAttachmentStateSimple({
                depthWrite: true,
                blendConstant: gDeviceApi.TransparentBlack,
            }, {
                rgbBlendMode: gDeviceApi.BlendMode.ADD,
                alphaBlendMode: gDeviceApi.BlendMode.ADD,
                rgbBlendSrcFactor: gDeviceApi.BlendFactor.SRC_ALPHA,
                alphaBlendSrcFactor: gDeviceApi.BlendFactor.ONE,
                rgbBlendDstFactor: gDeviceApi.BlendFactor.ONE_MINUS_SRC_ALPHA,
                alphaBlendDstFactor: gDeviceApi.BlendFactor.ONE_MINUS_SRC_ALPHA,
            }));
            // Update Scene Params
            var _a = _this.context.config, width = _a.width, height = _a.height;
            var camera = _this.context.camera;
            template.setUniforms(SceneUniformBufferIndex, [
                {
                    name: SceneUniform.PROJECTION_MATRIX,
                    value: camera.getPerspective(),
                },
                {
                    name: SceneUniform.VIEW_MATRIX,
                    value: camera.getViewTransform(),
                },
                {
                    name: SceneUniform.CAMERA_POSITION,
                    value: camera.getPosition(),
                },
                {
                    name: SceneUniform.DEVICE_PIXEL_RATIO,
                    value: _this.context.contextService.getDPR(),
                },
                {
                    name: SceneUniform.VIEWPORT,
                    value: [width, height],
                },
                {
                    name: SceneUniform.IS_ORTHO,
                    value: camera.isOrtho() ? 1 : 0,
                },
                {
                    name: SceneUniform.IS_PICKING,
                    value: 0,
                },
            ]);
            _this.batchManager.render(_this.renderLists.world);
            renderInstManager.popTemplateRenderInst();
            _this.renderHelper.prepareToRender();
            _this.renderHelper.renderGraph.execute();
            renderInstManager.resetRenderInsts();
            // capture here since we don't preserve drawing buffer
            if (_this.enableCapture && _this.resolveCapturePromise) {
                var _b = _this.captureOptions, type = _b.type, encoderOptions = _b.encoderOptions;
                var dataURL = _this.context.contextService.getDomElement().toDataURL(type, encoderOptions);
                _this.resolveCapturePromise(dataURL);
                _this.enableCapture = false;
                _this.captureOptions = undefined;
                _this.resolveCapturePromise = undefined;
            }
        });
    };
    /**
     * load texture in an async way and render when loaded
     */
    RenderGraphPlugin.prototype.loadTexture = function (src, descriptor, successCallback) {
        return this.texturePool.getOrCreateTexture(this.device, src, descriptor, function (t) {
            if (successCallback) {
                successCallback(t);
            }
        });
    };
    RenderGraphPlugin.prototype.toDataURL = function (options) {
        return tslib.__awaiter(this, void 0, void 0, function () {
            var _this = this;
            return tslib.__generator(this, function (_a) {
                // trigger re-render
                this.enableCapture = true;
                this.captureOptions = options;
                this.capturePromise = new Promise(function (resolve) {
                    _this.resolveCapturePromise = function (dataURL) {
                        resolve(dataURL);
                    };
                });
                return [2 /*return*/, this.capturePromise];
            });
        });
    };
    RenderGraphPlugin.tag = 'RenderGraph';
    return RenderGraphPlugin;
}());

/**
 * max depth when doing multi-layer picking
 */
var MAX_PICKING_DEPTH = 100;
/**
 * Use color-based picking in GPU
 */
var PickingPlugin = /** @class */ (function () {
    function PickingPlugin(renderHelper, renderGraphPlugin, pickingIdGenerator, batchManager) {
        this.renderHelper = renderHelper;
        this.renderGraphPlugin = renderGraphPlugin;
        this.pickingIdGenerator = pickingIdGenerator;
        this.batchManager = batchManager;
    }
    PickingPlugin.prototype.apply = function (context) {
        var _this = this;
        this.context = context;
        var renderingService = context.renderingService, renderingContext = context.renderingContext;
        var canvas = renderingContext.root.ownerDocument.defaultView;
        var handleMounted = function (e) {
            var object = e.target;
            // @ts-ignore
            if (!object.renderable3D) {
                // @ts-ignore
                object.renderable3D = new Renderable3D();
            }
            // @ts-ignore
            var renderable3D = object.renderable3D;
            // generate picking id for later use
            var pickingId = _this.pickingIdGenerator.getId(object);
            renderable3D.pickingId = pickingId;
            renderable3D.encodedPickingColor =
                _this.pickingIdGenerator.encodePickingColor(pickingId);
        };
        var handleUnmounted = function (e) {
            var object = e.target;
            // @ts-ignore
            var renderable3D = object.renderable3D;
            if (renderable3D) {
                _this.pickingIdGenerator.deleteById(renderable3D.pickingId);
            }
        };
        renderingService.hooks.init.tap(PickingPlugin.tag, function () {
            canvas.addEventListener(gLite.ElementEvent.MOUNTED, handleMounted);
            canvas.addEventListener(gLite.ElementEvent.UNMOUNTED, handleUnmounted);
        });
        renderingService.hooks.destroy.tap(PickingPlugin.tag, function () {
            canvas.removeEventListener(gLite.ElementEvent.MOUNTED, handleMounted);
            canvas.removeEventListener(gLite.ElementEvent.UNMOUNTED, handleUnmounted);
            _this.pickingIdGenerator.reset();
        });
        /**
         * Sync version is not implemented.
         */
        renderingService.hooks.pickSync.tap(PickingPlugin.tag, function (result) {
            return _this.pick(result);
        });
        renderingService.hooks.pick.tapPromise(PickingPlugin.tag, function (result) { return tslib.__awaiter(_this, void 0, void 0, function () {
            return tslib.__generator(this, function (_a) {
                return [2 /*return*/, this.pick(result)];
            });
        }); });
    };
    PickingPlugin.prototype.pick = function (result) {
        var topmost = result.topmost, position = result.position;
        // use viewportX/Y
        var x = position.viewportX, y = position.viewportY;
        var dpr = this.context.contextService.getDPR();
        var width = this.context.config.width * dpr;
        var height = this.context.config.height * dpr;
        var xInDevicePixel = x * dpr;
        var yInDevicePixel = y * dpr;
        if (!this.renderHelper.renderGraph ||
            xInDevicePixel > width ||
            xInDevicePixel < 0 ||
            yInDevicePixel > height ||
            yInDevicePixel < 0) {
            result.picked = [];
            return result;
        }
        // implements multi-layer picking
        // @see https://github.com/antvis/g/issues/948
        var pickedDisplayObjects = this.pickByRectangleInDepth(new gLite.Rectangle(util.clamp(Math.round(xInDevicePixel), 0, width - 1), util.clamp(Math.round(yInDevicePixel), 0, height - 1), 1, 1), topmost ? 1 : MAX_PICKING_DEPTH);
        result.picked = pickedDisplayObjects;
        return result;
    };
    PickingPlugin.prototype.pickByRectangleInDepth = function (rect, depth) {
        if (depth === void 0) { depth = MAX_PICKING_DEPTH; }
        var picked = null;
        var counter = 1;
        var targets = [];
        do {
            picked = this.pickByRectangle(rect, picked);
            if (picked) {
                counter++;
                targets.push(picked);
            }
            else {
                break;
            }
        } while (picked && counter <= depth);
        if (depth > 1) {
            // restore encoded picking color
            this.restorePickingColor(targets);
        }
        return targets;
    };
    PickingPlugin.prototype.restorePickingColor = function (displayObjects) {
        var _this = this;
        displayObjects.forEach(function (picked) {
            _this.batchManager.updateAttribute(picked, 'pointerEvents', true, true);
        });
    };
    /**
     * return displayobjects in target rectangle
     */
    PickingPlugin.prototype.pickByRectangle = function (rect, picked) {
        var _this = this;
        var device = this.renderGraphPlugin.getDevice();
        var renderLists = this.renderGraphPlugin.getRenderLists();
        var renderInstManager = this.renderHelper.renderInstManager;
        var builder = this.renderHelper.renderGraph.newGraphBuilder();
        var clearColor = gDeviceApi.TransparentBlack;
        var camera = this.context.camera;
        // retrieve at each frame since canvas may resize
        var x = rect.x, y = rect.y, width = rect.width, height = rect.height;
        // use a small picking area(like 1x1) instead of a fullscreen rt
        var renderInput = {
            backbufferWidth: width,
            backbufferHeight: height,
            antialiasingMode: exports.AntialiasingMode.None,
        };
        var mainPickingDesc = makeBackbufferDescSimple(exports.RGAttachmentSlot.Color0, renderInput, makeAttachmentClearDescriptor(clearColor));
        var pickingColorTargetID = builder.createRenderTargetID(mainPickingDesc, 'Picking Color');
        // create main Depth RT
        var mainDepthDesc = makeBackbufferDescSimple(exports.RGAttachmentSlot.DepthStencil, renderInput, opaqueWhiteFullClearRenderPassDescriptor);
        var mainDepthTargetID = builder.createRenderTargetID(mainDepthDesc, 'Picking Depth');
        // account for current view offset
        var currentView = tslib.__assign({}, camera.getView());
        // prevent unused RTs like main color being destroyed
        this.renderHelper.renderGraph.renderTargetDeadPool.forEach(function (rt) {
            rt.age = -1;
        });
        // picking pass
        var target;
        builder.pushPass(function (pass) {
            pass.setDebugName('Picking Pass');
            pass.attachRenderTargetID(exports.RGAttachmentSlot.Color0, pickingColorTargetID);
            pass.attachRenderTargetID(exports.RGAttachmentSlot.DepthStencil, mainDepthTargetID);
            pass.exec(function (passRenderer) {
                renderLists.picking.drawOnPassRenderer(renderInstManager.renderCache, passRenderer);
            });
            pass.post(function (scope) {
                var texture = scope.getRenderTargetTexture(exports.RGAttachmentSlot.Color0);
                var readback = device.createReadback();
                // restore previous view
                if (currentView && currentView.enabled) {
                    camera.setViewOffset(currentView.fullWidth, currentView.fullHeight, currentView.offsetX, currentView.offsetY, currentView.width, currentView.height);
                }
                else {
                    camera.clearViewOffset();
                }
                camera.setEnableUpdate(true);
                var pickedColors;
                try {
                    pickedColors = readback.readTextureSync(texture, 0, 0, width, height, new Uint8Array(width * height * 4));
                }
                catch (e) { }
                var pickedFeatureIdx = -1;
                if (pickedColors &&
                    (pickedColors[0] !== 0 ||
                        pickedColors[1] !== 0 ||
                        pickedColors[2] !== 0)) {
                    pickedFeatureIdx =
                        _this.pickingIdGenerator.decodePickingColor(pickedColors);
                }
                if (pickedFeatureIdx > -1) {
                    var pickedDisplayObject = _this.pickingIdGenerator.getById(pickedFeatureIdx);
                    if (pickedDisplayObject &&
                        pickedDisplayObject.isVisible() &&
                        pickedDisplayObject.isInteractive()) {
                        target = pickedDisplayObject;
                    }
                }
                readback.destroy();
            });
        });
        // Push our outer template, which contains the dynamic UBO bindings...
        var template = this.renderHelper.pushTemplateRenderInst();
        // SceneParams: binding = 0, ObjectParams: binding = 1
        template.setBindingLayout({ numUniformBuffers: 2, numSamplers: 0 });
        template.setMegaStateFlags(gDeviceApi.setAttachmentStateSimple({
            depthWrite: true,
        }, {
            rgbBlendMode: gDeviceApi.BlendMode.ADD,
            rgbBlendSrcFactor: gDeviceApi.BlendFactor.ONE,
            rgbBlendDstFactor: gDeviceApi.BlendFactor.ZERO,
            alphaBlendMode: gDeviceApi.BlendMode.ADD,
            alphaBlendSrcFactor: gDeviceApi.BlendFactor.ONE,
            alphaBlendDstFactor: gDeviceApi.BlendFactor.ZERO,
        }));
        // Update Scene Params
        var _a = this.context.config, canvasWidth = _a.width, canvasHeight = _a.height;
        var dpr = this.context.contextService.getDPR();
        camera.setEnableUpdate(false);
        camera.setViewOffset(canvasWidth * dpr, canvasHeight * dpr, x, y, width, height);
        template.setUniforms(SceneUniformBufferIndex, [
            {
                name: SceneUniform.PROJECTION_MATRIX,
                value: camera.getPerspective(),
            },
            {
                name: SceneUniform.VIEW_MATRIX,
                value: camera.getViewTransform(),
            },
            {
                name: SceneUniform.CAMERA_POSITION,
                value: camera.getPosition(),
            },
            {
                name: SceneUniform.DEVICE_PIXEL_RATIO,
                value: this.context.contextService.getDPR(),
            },
            {
                name: SceneUniform.VIEWPORT,
                value: [width, height],
            },
            {
                name: SceneUniform.IS_ORTHO,
                value: camera.isOrtho() ? 1 : 0,
            },
            {
                name: SceneUniform.IS_PICKING,
                value: 1,
            },
        ]);
        if (picked) {
            this.batchManager.updateAttribute(picked, 'pointerEvents', false, true);
        }
        this.batchManager.render(renderLists.picking, true);
        renderInstManager.popTemplateRenderInst();
        this.renderHelper.prepareToRender();
        this.renderHelper.renderGraph.execute();
        renderInstManager.resetRenderInsts();
        return target;
    };
    PickingPlugin.tag = 'WebGLPicker';
    return PickingPlugin;
}());

/**
 * render order start from 0, our default camera's Z is 500
 */
var RENDER_ORDER_SCALE = 500 / 1000000;
/**
 * A container for multiple display objects with the same `style`,
 * eg. 1000 Circles with the same stroke color, but their position, radius can be different
 */
var Batch = /** @class */ (function () {
    function Batch() {
        this.clipPathMeshCreated = false;
        // private findClipPath(): DisplayObject | null {
        //   let node = this.instance;
        //   while (node && node.style) {
        //     if (node.style.clipPath) {
        //       return node.style.clipPath;
        //     }
        //     node = node.parentNode as DisplayObject;
        //   }
        //   return null;
        // }
        // private applyClipPath() {
        //   // find clipPath
        //   const clipPathShape = this.findClipPath();
        //   if (clipPathShape && !this.clipPathMeshCreated) {
        //     if (this.batchMeshList.length === 0) {
        //       return;
        //     }
        //     const clipPathMesh = this.meshFactory(clipPathShape.nodeName);
        //     clipPathMesh.clipPathTarget = this.instance;
        //     // draw clipPath first
        //     this.batchMeshList.unshift(clipPathMesh);
        //     this.clipPathMeshCreated = true;
        //     this.batchMeshList.forEach((mesh, i) => {
        //       mesh.clipPath = clipPathShape;
        //       if (!mesh.material) {
        //         mesh.material = new ShaderMaterial(this.device);
        //       }
        //       mesh.material.stencilRef = this.batchManager.getStencilRef(clipPathShape);
        //     });
        //   }
        //   // remove clipPath from render queue
        //   if (!clipPathShape) {
        //     if (this.batchMeshList.length && this.batchMeshList[0].clipPathTarget) {
        //       this.batchMeshList.shift();
        //     }
        //   }
        // }
    }
    Batch.prototype.beforeUploadUBO = function (renderInst, mesh) { };
    Batch.prototype.beforeInitMesh = function (mesh) { };
    Batch.prototype.afterInitMesh = function (mesh) { };
    return Batch;
}());

function isTexture(t) {
    return !!(t && t.type);
}
exports.MaterialEvent = void 0;
(function (MaterialEvent) {
    MaterialEvent["CHANGED"] = "changed";
})(exports.MaterialEvent || (exports.MaterialEvent = {}));
/**
 * an encapsulation on top of shaders
 * @see https://doc.babylonjs.com/divingDeeper/materials/using/materials_introduction
 */
var Material = /** @class */ (function (_super) {
    tslib.__extends(Material, _super);
    function Material(device, props) {
        var _this = _super.call(this) || this;
        _this.props = {};
        /**
         * relative meshes
         */
        _this.meshes = [];
        // USE_XXX
        _this.defines = {};
        _this.uniforms = {};
        _this.uboBuffer = [];
        _this.textures = {};
        _this.samplers = [];
        /**
         * need re-compiling like vs/fs changed
         */
        _this.programDirty = true;
        /**
         * need re-upload textures
         */
        _this.textureDirty = true;
        /**
         * inform geometry to rebuild, eg. wireframe
         */
        _this.geometryDirty = true;
        var _a = gDeviceApi.copyMegaState(gDeviceApi.defaultMegaState), cullMode = _a.cullMode, depthCompare = _a.depthCompare, depthWrite = _a.depthWrite, stencilFront = _a.stencilFront, stencilBack = _a.stencilBack, stencilWrite = _a.stencilWrite, frontFace = _a.frontFace, polygonOffset = _a.polygonOffset, attachmentsState = _a.attachmentsState;
        _this.device = device;
        // @ts-ignore
        _this.props = tslib.__assign({ cullMode: cullMode, depthTest: true, depthCompare: depthCompare, depthWrite: depthWrite, stencilFront: stencilFront, stencilBack: stencilBack, stencilWrite: stencilWrite, frontFace: frontFace, polygonOffset: polygonOffset, attachmentsState: attachmentsState, dithering: false, wireframe: false, wireframeColor: 'black', wireframeLineWidth: 1, vertexShader: '', fragmentShader: '' }, props);
        _this.compile();
        return _this;
    }
    Object.defineProperty(Material.prototype, "cullMode", {
        /**
         * cullFace
         */
        get: function () {
            return this.props.cullMode;
        },
        set: function (value) {
            this.props.cullMode = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Material.prototype, "frontFace", {
        get: function () {
            return this.props.frontFace;
        },
        set: function (value) {
            this.props.frontFace = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Material.prototype, "blendConstant", {
        /**
         * Blending state
         */
        get: function () {
            return this.props.blendConstant;
        },
        set: function (value) {
            this.props.blendConstant = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Material.prototype, "blendEquation", {
        get: function () {
            return this.props.blendEquation;
        },
        set: function (value) {
            this.props.blendEquation = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Material.prototype, "blendEquationAlpha", {
        get: function () {
            return this.props.blendEquationAlpha;
        },
        set: function (value) {
            this.props.blendEquationAlpha = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Material.prototype, "blendSrc", {
        get: function () {
            return this.props.blendSrc;
        },
        set: function (value) {
            this.props.blendSrc = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Material.prototype, "blendDst", {
        get: function () {
            return this.props.blendDst;
        },
        set: function (value) {
            this.props.blendDst = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Material.prototype, "blendSrcAlpha", {
        get: function () {
            return this.props.blendSrcAlpha;
        },
        set: function (value) {
            this.props.blendSrcAlpha = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Material.prototype, "blendDstAlpha", {
        get: function () {
            return this.props.blendDstAlpha;
        },
        set: function (value) {
            this.props.blendDstAlpha = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Material.prototype, "depthCompare", {
        get: function () {
            return this.props.depthCompare;
        },
        set: function (value) {
            this.props.depthCompare = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Material.prototype, "depthTest", {
        get: function () {
            return this.props.depthTest;
        },
        set: function (value) {
            this.props.depthTest = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Material.prototype, "depthWrite", {
        get: function () {
            return this.props.depthWrite;
        },
        set: function (value) {
            this.props.depthWrite = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Material.prototype, "stencilFront", {
        get: function () {
            return this.props.stencilFront;
        },
        set: function (value) {
            this.props.stencilFront = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Material.prototype, "stencilBack", {
        get: function () {
            return this.props.stencilBack;
        },
        set: function (value) {
            this.props.stencilBack = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Material.prototype, "stencilWrite", {
        get: function () {
            return this.props.stencilWrite;
        },
        set: function (value) {
            this.props.stencilWrite = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Material.prototype, "stencilRef", {
        get: function () {
            return this.props.stencilRef;
        },
        set: function (value) {
            this.props.stencilRef = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Material.prototype, "polygonOffset", {
        // @see https://developer.mozilla.org/zh-CN/docs/Web/API/WebGLRenderingContext/polygonOffset
        get: function () {
            return this.props.polygonOffset;
        },
        set: function (value) {
            this.props.polygonOffset = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Material.prototype, "dithering", {
        // gl.DITHER
        get: function () {
            return this.props.dithering;
        },
        set: function (value) {
            this.props.dithering = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Material.prototype, "wireframe", {
        // @see https://doc.babylonjs.com/divingDeeper/materials/using/materials_introduction#wireframe
        get: function () {
            return this.props.wireframe;
        },
        set: function (value) {
            if (this.props.wireframe !== value) {
                // need re-generate geometry
                this.geometryDirty = true;
                this.programDirty = true;
                this.props.wireframe = value;
                this.dispatchMutationEvent();
            }
            this.defines.USE_WIREFRAME = !!value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Material.prototype, "wireframeColor", {
        get: function () {
            return this.props.wireframeColor;
        },
        set: function (value) {
            this.props.wireframeColor = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Material.prototype, "wireframeLineWidth", {
        get: function () {
            return this.props.wireframeLineWidth;
        },
        set: function (value) {
            this.props.wireframeLineWidth = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Material.prototype, "vertexShader", {
        // shader pairs
        get: function () {
            return this.props.vertexShader;
        },
        set: function (value) {
            if (this.props.vertexShader !== value) {
                this.programDirty = true;
                this.props.vertexShader = value;
                this.compile();
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Material.prototype, "fragmentShader", {
        get: function () {
            return this.props.fragmentShader;
        },
        set: function (value) {
            if (this.props.fragmentShader !== value) {
                this.programDirty = true;
                this.props.fragmentShader = value;
                this.compile();
            }
        },
        enumerable: false,
        configurable: true
    });
    Material.prototype.compile = function () {
        var _this = this;
        // uniform sampler2D u_Texture0;
        this.props.fragmentShader.replace(/^\s*uniform\s*sampler2D\s*(.*)\s*;$/gm, function (_, name) {
            _this.samplers.push(name);
            return '';
        });
        /**
         * extract from uniform buffer object, should account for struct & pre-defines, eg.
         * layout(std140) uniform ub_ObjectParams {
         *   mat4 u_ModelMatrix;
         *   vec4 u_Color;
         *   vec4 u_StrokeColor;
         *   #ifdef NUM_DIR_LIGHTS
         *     DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
         *   #endif
         * }
         */
        this.uniformNames = gDeviceApi.getUniforms(this.props.fragmentShader);
    };
    /**
     * @example
     * material.setUniforms({
     *   u_ModelMatrix: [1, 2, 3, 4],
     *   u_Time: 1,
     *   u_Map: texture,
     * })
     */
    Material.prototype.setUniforms = function (uniforms) {
        var _this = this;
        var shoudDispatchMutationEvent = false;
        Object.keys(uniforms).forEach(function (key) {
            var value = uniforms[key];
            var existedTexture = _this.textures[key];
            if (existedTexture && existedTexture !== value) {
                // existedTexture.destroy();
                _this.textureDirty = true;
            }
            if (isTexture(value)) {
                _this.textures[key] = value;
                _this.textureDirty = true;
                value.on(gDeviceApi.TextureEvent.LOADED, function () {
                    _this.dispatchMutationEvent();
                });
            }
            else {
                _this.uniforms[key] = value;
                shoudDispatchMutationEvent = true;
            }
            if (util.isNil(uniforms[key])) {
                delete _this.textures[key];
                delete _this.uniforms[key];
            }
        });
        if (shoudDispatchMutationEvent) {
            this.dispatchMutationEvent();
        }
    };
    Material.prototype.dispatchMutationEvent = function () {
        this.emit(exports.MaterialEvent.CHANGED);
    };
    return Material;
}(EventEmitter));

var ShaderMaterial = /** @class */ (function (_super) {
    tslib.__extends(ShaderMaterial, _super);
    function ShaderMaterial(device, props) {
        var _this = _super.call(this, device, tslib.__assign({}, props)) || this;
        _this.defines = tslib.__assign(tslib.__assign({}, _this.defines), { USE_UV: false, USE_MAP: false, USE_WIREFRAME: false, USE_FOG: false, USE_LIGHT: false });
        return _this;
    }
    return ShaderMaterial;
}(Material));

function enumToObject(enumObject) {
    var result = {};
    Object.keys(enumObject).forEach(function (key) {
        if (typeof enumObject[key] === 'number') {
            result[key] = enumObject[key];
        }
    });
    return result;
}
function compareDefines(d1, d2) {
    var d1Keys = Object.keys(d1);
    var d2Keys = Object.keys(d2);
    if (d1Keys.length !== d2Keys.length) {
        return false;
    }
    return d1Keys.every(function (key) { return d1[key] === d2[key]; });
}
var definedProps = function (obj) {
    return Object.fromEntries(Object.entries(obj).filter(function (_a) {
        var _b = tslib.__read(_a, 2); _b[0]; var v = _b[1];
        return v !== undefined;
    }));
};

function packUint8ToFloat(a, b) {
    a = util.clamp(Math.floor(a), 0, 255);
    b = util.clamp(Math.floor(b), 0, 255);
    return 256 * a + b;
}

var counter = 1;
var FILL_TEXTURE_MAPPING = 'FillTextureMapping';
/**
 * WebGPU has max vertex attribute num(8)
 */
exports.VertexAttributeBufferIndex = void 0;
(function (VertexAttributeBufferIndex) {
    VertexAttributeBufferIndex[VertexAttributeBufferIndex["MODEL_MATRIX"] = 0] = "MODEL_MATRIX";
    VertexAttributeBufferIndex[VertexAttributeBufferIndex["PACKED_COLOR"] = 1] = "PACKED_COLOR";
    VertexAttributeBufferIndex[VertexAttributeBufferIndex["PACKED_STYLE"] = 2] = "PACKED_STYLE";
    VertexAttributeBufferIndex[VertexAttributeBufferIndex["PICKING_COLOR"] = 3] = "PICKING_COLOR";
    VertexAttributeBufferIndex[VertexAttributeBufferIndex["POSITION"] = 4] = "POSITION";
    VertexAttributeBufferIndex[VertexAttributeBufferIndex["NORMAL"] = 5] = "NORMAL";
    VertexAttributeBufferIndex[VertexAttributeBufferIndex["UV"] = 6] = "UV";
    VertexAttributeBufferIndex[VertexAttributeBufferIndex["BARYCENTRIC"] = 7] = "BARYCENTRIC";
    VertexAttributeBufferIndex[VertexAttributeBufferIndex["MAX"] = 8] = "MAX";
})(exports.VertexAttributeBufferIndex || (exports.VertexAttributeBufferIndex = {}));
/**
 * GL.MAX_VERTEX_ATTRIBS
 */
exports.VertexAttributeLocation = void 0;
(function (VertexAttributeLocation) {
    // TODO: bind mat4 in WebGL2 instead of decomposed 4 * vec4?
    // @see https://stackoverflow.com/questions/38853096/webgl-how-to-bind-values-to-a-mat4-attribute/38853623#38853623
    VertexAttributeLocation[VertexAttributeLocation["MODEL_MATRIX0"] = 0] = "MODEL_MATRIX0";
    VertexAttributeLocation[VertexAttributeLocation["MODEL_MATRIX1"] = 1] = "MODEL_MATRIX1";
    VertexAttributeLocation[VertexAttributeLocation["MODEL_MATRIX2"] = 2] = "MODEL_MATRIX2";
    VertexAttributeLocation[VertexAttributeLocation["MODEL_MATRIX3"] = 3] = "MODEL_MATRIX3";
    VertexAttributeLocation[VertexAttributeLocation["PACKED_COLOR"] = 4] = "PACKED_COLOR";
    VertexAttributeLocation[VertexAttributeLocation["PACKED_STYLE1"] = 5] = "PACKED_STYLE1";
    VertexAttributeLocation[VertexAttributeLocation["PACKED_STYLE2"] = 6] = "PACKED_STYLE2";
    VertexAttributeLocation[VertexAttributeLocation["PICKING_COLOR"] = 7] = "PICKING_COLOR";
    VertexAttributeLocation[VertexAttributeLocation["POSITION"] = 8] = "POSITION";
    VertexAttributeLocation[VertexAttributeLocation["NORMAL"] = 9] = "NORMAL";
    VertexAttributeLocation[VertexAttributeLocation["UV"] = 10] = "UV";
    VertexAttributeLocation[VertexAttributeLocation["BARYCENTRIC"] = 11] = "BARYCENTRIC";
    VertexAttributeLocation[VertexAttributeLocation["MAX"] = 12] = "MAX";
})(exports.VertexAttributeLocation || (exports.VertexAttributeLocation = {}));
/**
 * Draw call.
 */
var Instanced = /** @class */ (function () {
    function Instanced(renderHelper, texturePool, lightPool, object, 
    /**
     * All drawcall constructors.
     */
    drawcallCtors, 
    /**
     * index in renderer.meshes
     */
    index, context) {
        if (index === void 0) { index = -1; }
        this.renderHelper = renderHelper;
        this.texturePool = texturePool;
        this.lightPool = lightPool;
        this.drawcallCtors = drawcallCtors;
        this.index = index;
        this.context = context;
        /**
         * unique ID
         */
        this.id = counter++;
        /**
         * attribute name used for gradient or pattern
         */
        this.gradientAttributeName = 'fill';
        /**
         * instances
         */
        this.objects = [];
        this.program = new DeviceProgram();
        this.geometryDirty = true;
        /**
         * the same material maybe shared between different canvases
         */
        this.materialDirty = true;
        /**
         * texture mappings
         */
        this.textureMappings = [];
        /**
         * Divisor of instanced array.
         */
        this.divisor = 1;
        /**
         * Account for anchor and merge it into modelMatrix.
         */
        this.mergeAnchorIntoModelMatrix = false;
        this.checkNodeName = true;
        /**
         * Create a new batch if the number of instances exceeds.
         */
        this.maxInstances = Infinity;
        this.inited = false;
    }
    Object.defineProperty(Instanced.prototype, "instance", {
        get: function () {
            return this.objects[0];
        },
        enumerable: false,
        configurable: true
    });
    Instanced.prototype.init = function () {
        if (this.inited) {
            return;
        }
        this.renderer.beforeInitMesh(this);
        this.material = new ShaderMaterial(this.context.device);
        this.material.defines = tslib.__assign(tslib.__assign({}, enumToObject(exports.VertexAttributeLocation)), this.material.defines);
        this.geometry = new BufferGeometry(this.context.device);
        // make refs so that we can trigger MutationEvent on every object
        this.geometry.meshes = this.objects;
        this.material.meshes = this.objects;
        this.observeGeometryChanged();
        this.observeMaterialChanged();
        this.inited = true;
        this.renderer.afterInitMesh(this);
    };
    Instanced.prototype.observeGeometryChanged = function () {
        var _this = this;
        this.geometry.on(exports.GeometryEvent.CHANGED, function () {
            _this.geometry.meshes.forEach(function (mesh) {
                mesh.renderable.dirty = true;
            });
            _this.context.renderingService.dirtify();
        });
    };
    Instanced.prototype.observeMaterialChanged = function () {
        var _this = this;
        this.material.on(exports.MaterialEvent.CHANGED, function () {
            _this.material.meshes.forEach(function (mesh) {
                mesh.renderable.dirty = true;
            });
            _this.context.renderingService.dirtify();
        });
    };
    Instanced.prototype.shouldMergeColor = function (o1, o2, name) {
        // c1: CSSRGB | CSSGradientValue[] | Pattern, c2: CSSRGB | CSSGradientValue[] | Pattern
        // can't be merged if gradients & pattern used
        var source = o1.parsedStyle[name];
        var target = o2.parsedStyle[name];
        // constant color value
        if (gLite.isCSSRGB(source) && gLite.isCSSRGB(target)) {
            return true;
        }
        // pattern
        if (gLite.isPattern(source) &&
            gLite.isPattern(target) &&
            source.image === target.image) {
            return true;
        }
        // gradients
        if (Array.isArray(source) &&
            Array.isArray(target) &&
            o1.style[name] === o2.style[name]) {
            return true;
        }
        return false;
    };
    /**
     * should be merged into current InstancedMesh
     */
    Instanced.prototype.shouldMerge = function (object, index) {
        if (!this.instance) {
            return true;
        }
        // Path / Polyline could be rendered as Line
        if (this.checkNodeName && this.instance.nodeName !== object.nodeName) {
            return false;
        }
        // can't be merged when using clipPath
        if (object.parsedStyle.clipPath) {
            return false;
        }
        if (!this.shouldMergeColor(this.instance, object, 'fill') ||
            !this.shouldMergeColor(this.instance, object, 'stroke')) {
            return false;
        }
        return true;
    };
    Instanced.prototype.createGeometry = function (objects) {
        var _this = this;
        var modelMatrix = glMatrix.mat4.create();
        var modelViewMatrix = glMatrix.mat4.create();
        // const normalMatrix = mat3.create();
        var packedModelMatrix = [];
        var packedFillStroke = [];
        var packedStyle = [];
        var packedPicking = [];
        var divisor = this.divisor;
        // const useNormal = this.material.defines.NORMAL;
        objects.forEach(function (object) {
            var _a;
            var _b = object.parsedStyle, fill = _b.fill, stroke = _b.stroke, opacity = _b.opacity, fillOpacity = _b.fillOpacity, strokeOpacity = _b.strokeOpacity, lineWidth = _b.lineWidth, anchor = _b.anchor, visibility = _b.visibility, increasedLineWidthForHitTesting = _b.increasedLineWidthForHitTesting;
            var fillColor = [0, 0, 0, 0];
            if (gLite.isCSSRGB(fill)) {
                fillColor = [
                    Number(fill.r),
                    Number(fill.g),
                    Number(fill.b),
                    Number(fill.alpha) * 255,
                ];
            }
            var strokeColor = [0, 0, 0, 0];
            if (gLite.isCSSRGB(stroke)) {
                strokeColor = [
                    Number(stroke.r),
                    Number(stroke.g),
                    Number(stroke.b),
                    Number(stroke.alpha) * 255,
                ];
            }
            // if (this.clipPathTarget) {
            //   // account for target's rts
            //   mat4.copy(modelMatrix, object.getLocalTransform());
            //   fillColor = [255, 255, 255, 255];
            //   mat4.mul(
            //     modelMatrix,
            //     this.clipPathTarget.getWorldTransform(),
            //     modelMatrix,
            //   );
            // } else {
            //   mat4.copy(modelMatrix, object.getWorldTransform());
            // }
            glMatrix.mat4.mul(modelViewMatrix, _this.context.camera.getViewTransform(), modelMatrix);
            var encodedPickingColor = (object.isInteractive() &&
                (
                // @ts-ignore
                (_a = object.renderable3D) === null || _a === void 0 ? void 0 : _a.encodedPickingColor)) || [0, 0, 0];
            if (_this.mergeAnchorIntoModelMatrix) {
                var anchor_1 = object.parsedStyle.anchor;
                var translateX = 0;
                var translateY = 0;
                var translateZ = 0;
                var contentBounds = object.getGeometryBounds();
                if (contentBounds) {
                    var halfExtents = contentBounds.halfExtents;
                    translateX = -halfExtents[0] * anchor_1[0] * 2;
                    translateY = -halfExtents[1] * anchor_1[1] * 2;
                    translateZ = -halfExtents[2] * (anchor_1[2] || 0) * 2;
                }
                glMatrix.mat4.mul(modelMatrix, object.getWorldTransform(), // apply anchor
                glMatrix.mat4.fromTranslation(modelMatrix, glMatrix.vec3.fromValues(translateX, translateY, translateZ)));
            }
            else {
                glMatrix.mat4.copy(modelMatrix, object.getWorldTransform());
            }
            packedModelMatrix.push.apply(packedModelMatrix, tslib.__spreadArray([], tslib.__read(modelMatrix), false));
            packedFillStroke.push(packUint8ToFloat(fillColor[0], fillColor[1]), packUint8ToFloat(fillColor[2], fillColor[3]), packUint8ToFloat(strokeColor[0], strokeColor[1]), packUint8ToFloat(strokeColor[2], strokeColor[3]));
            packedStyle.push(opacity, fillOpacity, strokeOpacity, lineWidth, visibility === 'visible' ? 1 : 0, anchor[0], anchor[1], increasedLineWidthForHitTesting || 0);
            packedPicking.push.apply(packedPicking, tslib.__spreadArray(tslib.__spreadArray([], tslib.__read(encodedPickingColor), false), [object.sortable.renderOrder * RENDER_ORDER_SCALE], false));
            // if (useNormal) {
            //   // should not calc normal matrix in shader, mat3.invert is not cheap
            //   // @see https://stackoverflow.com/a/21079741
            //   mat3.fromMat4(normalMatrix, modelViewMatrix);
            //   mat3.invert(normalMatrix, normalMatrix);
            //   mat3.transpose(normalMatrix, normalMatrix);
            //   const { NORMAL_MATRIX0, NORMAL_MATRIX1, NORMAL_MATRIX2 } = this.material.defines;
            //   this.bufferGeometry.setVertexBuffer({
            //     bufferIndex: 4,
            //     byteStride: 4 * (3 * 3),
            //     stepMode: VertexStepMode.INSTANCE,
            //     attributes: [
            //       {
            //         format: Format.F32_RGB,
            //         bufferByteOffset: 4 * 0,
            //         location: Number(NORMAL_MATRIX0),
            //         divisor
            //       },
            //       {
            //         format: Format.F32_RGB,
            //         bufferByteOffset: 4 * 3,
            //         location: Number(NORMAL_MATRIX1),
            //         divisor
            //       },
            //       {
            //         format: Format.F32_RGB,
            //         bufferByteOffset: 4 * 6,
            //         location: Number(NORMAL_MATRIX2),
            //         divisor
            //       },
            //     ],
            //     data: new Float32Array(normalMatrix),
            //   });
            // }
        });
        this.geometry.instancedCount = objects.length;
        this.geometry.setVertexBuffer({
            bufferIndex: exports.VertexAttributeBufferIndex.MODEL_MATRIX,
            byteStride: 4 * (4 * 4),
            stepMode: gDeviceApi.VertexStepMode.INSTANCE,
            attributes: [
                {
                    format: gDeviceApi.Format.F32_RGBA,
                    bufferByteOffset: 4 * 0,
                    location: exports.VertexAttributeLocation.MODEL_MATRIX0,
                    divisor: divisor,
                },
                {
                    format: gDeviceApi.Format.F32_RGBA,
                    bufferByteOffset: 4 * 4,
                    location: exports.VertexAttributeLocation.MODEL_MATRIX1,
                    divisor: divisor,
                },
                {
                    format: gDeviceApi.Format.F32_RGBA,
                    bufferByteOffset: 4 * 8,
                    location: exports.VertexAttributeLocation.MODEL_MATRIX2,
                    divisor: divisor,
                },
                {
                    format: gDeviceApi.Format.F32_RGBA,
                    bufferByteOffset: 4 * 12,
                    location: exports.VertexAttributeLocation.MODEL_MATRIX3,
                    divisor: divisor,
                },
            ],
            data: new Float32Array(packedModelMatrix),
        });
        this.geometry.setVertexBuffer({
            bufferIndex: exports.VertexAttributeBufferIndex.PACKED_COLOR,
            byteStride: 4 * 4,
            stepMode: gDeviceApi.VertexStepMode.INSTANCE,
            attributes: [
                {
                    format: gDeviceApi.Format.F32_RGBA,
                    bufferByteOffset: 4 * 0,
                    location: exports.VertexAttributeLocation.PACKED_COLOR,
                    divisor: divisor,
                },
            ],
            data: new Float32Array(packedFillStroke),
        });
        this.geometry.setVertexBuffer({
            bufferIndex: exports.VertexAttributeBufferIndex.PACKED_STYLE,
            byteStride: 4 * 8,
            stepMode: gDeviceApi.VertexStepMode.INSTANCE,
            attributes: [
                {
                    format: gDeviceApi.Format.F32_RGBA,
                    bufferByteOffset: 4 * 0,
                    location: exports.VertexAttributeLocation.PACKED_STYLE1,
                    divisor: divisor,
                },
                {
                    format: gDeviceApi.Format.F32_RGBA,
                    bufferByteOffset: 4 * 4,
                    location: exports.VertexAttributeLocation.PACKED_STYLE2,
                    divisor: divisor,
                },
            ],
            data: new Float32Array(packedStyle),
        });
        this.geometry.setVertexBuffer({
            bufferIndex: exports.VertexAttributeBufferIndex.PICKING_COLOR,
            byteStride: 4 * 4,
            stepMode: gDeviceApi.VertexStepMode.INSTANCE,
            attributes: [
                {
                    format: gDeviceApi.Format.F32_RGBA,
                    bufferByteOffset: 4 * 0,
                    location: exports.VertexAttributeLocation.PICKING_COLOR,
                    divisor: divisor,
                },
            ],
            data: new Float32Array(packedPicking),
        });
    };
    Instanced.prototype.destroy = function () {
        if (this.geometry) {
            this.geometry.destroy();
        }
    };
    Instanced.prototype.applyRenderInst = function (renderInst, objects) {
        var _this = this;
        // detect if scene changed, eg. lights & fog
        var fog = this.lightPool.getFog();
        var useFog = !!fog;
        if (this.clipPathTarget || this.clipPath) {
            if (this.clipPathTarget) {
                this.material.stencilWrite = true;
                // @see https://open.gl/depthstencils
                this.material.depthWrite = false;
                this.material.stencilFront = {
                    compare: gDeviceApi.CompareFunction.ALWAYS,
                    passOp: gDeviceApi.StencilOp.REPLACE,
                };
                this.material.stencilBack = {
                    compare: gDeviceApi.CompareFunction.ALWAYS,
                    passOp: gDeviceApi.StencilOp.REPLACE,
                };
            }
            else {
                this.material.stencilWrite = false;
                this.material.depthWrite = true;
                this.material.stencilFront = {
                    compare: gDeviceApi.CompareFunction.EQUAL,
                    passOp: gDeviceApi.StencilOp.KEEP,
                };
                this.material.stencilBack = {
                    compare: gDeviceApi.CompareFunction.EQUAL,
                    passOp: gDeviceApi.StencilOp.KEEP,
                };
            }
        }
        else {
            this.material.stencilWrite = false;
        }
        if (this.materialDirty || this.material.programDirty) {
            this.createMaterial(objects);
        }
        var oldDefines = tslib.__assign({}, this.material.defines);
        this.material.defines.USE_FOG = useFog;
        this.material.defines = tslib.__assign(tslib.__assign(tslib.__assign({}, this.lightPool.getDefines()), this.material.defines), this.renderHelper.getDefines());
        // re-upload textures
        if (this.material.textureDirty) {
            this.textureMappings = [];
            // set texture mappings
            var fillTextureMapping = this.createFillGradientTextureMapping(objects);
            if (fillTextureMapping) {
                this.textureMappings.push(fillTextureMapping);
            }
            Object.keys(this.material.textures)
                .sort(function (a, b) {
                return _this.material.samplers.indexOf(a) -
                    _this.material.samplers.indexOf(b);
            })
                .forEach(function (key) {
                var mapping = new TextureMapping();
                mapping.name = key;
                mapping.texture = _this.material.textures[key];
                _this.context.device.setResourceName(mapping.texture, 'Material Texture ' + key);
                mapping.sampler = _this.renderHelper.getCache().createSampler({
                    addressModeU: gDeviceApi.AddressMode.CLAMP_TO_EDGE,
                    addressModeV: gDeviceApi.AddressMode.CLAMP_TO_EDGE,
                    minFilter: gDeviceApi.FilterMode.POINT,
                    magFilter: gDeviceApi.FilterMode.BILINEAR,
                    mipmapFilter: gDeviceApi.MipmapFilterMode.LINEAR,
                    lodMinClamp: 0,
                    lodMaxClamp: 0,
                });
                _this.textureMappings.push(mapping);
            });
            if (this.textureMappings.length) {
                this.material.defines.USE_UV = true;
                this.material.defines.USE_MAP = true;
            }
            else {
                this.material.defines.USE_UV = false;
                this.material.defines.USE_MAP = false;
            }
            this.material.textureDirty = false;
        }
        var needRecompileProgram = !compareDefines(oldDefines, this.material.defines);
        // re-compile program, eg. DEFINE changed
        if (needRecompileProgram ||
            this.material.programDirty ||
            this.materialDirty) {
            // set defines
            this.material.defines = tslib.__assign(tslib.__assign({}, this.material.defines), enumToObject(exports.VertexAttributeLocation));
            Object.keys(this.material.defines).forEach(function (key) {
                var value = _this.material.defines[key];
                if (typeof value === 'boolean') {
                    _this.program.setDefineBool(key, value);
                }
                else {
                    _this.program.setDefineString(key, "".concat(value));
                }
            });
            // build shaders
            this.program.vert = this.material.vertexShader;
            this.program.frag = this.material.fragmentShader;
            this.material.programDirty = false;
            this.materialDirty = false;
        }
        if (this.material.geometryDirty) {
            // wireframe 需要额外生成 geometry 重心坐标
            this.geometryDirty = true;
            this.material.geometryDirty = false;
        }
        if (this.geometryDirty || this.geometry.dirty) {
            // destroy first
            if (this.geometry) {
                this.geometry.destroy();
            }
            // re-create buffer geometry
            this.createGeometry(objects);
            // generate wireframe
            if (this.material.wireframe) {
                this.generateWireframe(this.geometry);
            }
            // sync to internal Geometry
            this.geometryDirty = false;
            this.geometry.dirty = false;
        }
        // cached input layout
        var program = this.renderHelper
            .getCache()
            .createProgramSimple(this.program);
        var inputLayout = this.renderHelper.getCache().createInputLayout(tslib.__assign(tslib.__assign({}, this.geometry.inputLayoutDescriptor), { program: program }));
        var useIndexes = !!this.geometry.indexBuffer;
        renderInst.renderPipelineDescriptor.topology = this.geometry.drawMode;
        renderInst.setProgram(program);
        renderInst.setVertexInput(inputLayout, this.geometry.vertexBuffers
            .filter(function (b) { return !!b; })
            .map(function (buffer) { return ({
            buffer: buffer,
            byteOffset: 0,
        }); }), useIndexes ? { buffer: this.geometry.indexBuffer, offset: 0 } : null);
        this.renderer.beforeUploadUBO(renderInst, this);
        // upload uniform buffer object
        this.uploadUBO(renderInst);
        if (useIndexes) {
            // drawElements
            renderInst.drawIndexesInstanced(this.geometry.vertexCount, this.geometry.instancedCount, this.geometry.indexStart);
        }
        else {
            // drawArrays
            renderInst.drawPrimitives(this.geometry.vertexCount, this.geometry.primitiveStart);
        }
        // FIXME: 暂时都当作非透明物体，按照创建顺序排序
        renderInst.sortKey = makeSortKeyOpaque(exports.RendererLayer.OPAQUE, objects[0].sortable.renderOrder);
    };
    /**
     * update a continuous GPU buffer
     */
    Instanced.prototype.updateBatchedAttribute = function (objects, startIndex, name, value) {
        var _this = this;
        if (objects.length === 0) {
            return;
        }
        var stylePacked = [
            'opacity',
            'fillOpacity',
            'strokeOpacity',
            'lineWidth',
            'visibility',
            'anchor',
            'increasedLineWidthForHitTesting',
        ];
        if (name === 'fill' || name === 'stroke') {
            var packedFillStroke_1 = [];
            objects.forEach(function (object) {
                var _a = object.parsedStyle, fill = _a.fill, stroke = _a.stroke;
                var fillColor = [0, 0, 0, 0];
                if (gLite.isCSSRGB(fill)) {
                    fillColor = [
                        Number(fill.r),
                        Number(fill.g),
                        Number(fill.b),
                        Number(fill.alpha) * 255,
                    ];
                }
                var strokeColor = [0, 0, 0, 0];
                if (gLite.isCSSRGB(stroke)) {
                    strokeColor = [
                        Number(stroke.r),
                        Number(stroke.g),
                        Number(stroke.b),
                        Number(stroke.alpha) * 255,
                    ];
                }
                packedFillStroke_1.push(packUint8ToFloat(fillColor[0], fillColor[1]), packUint8ToFloat(fillColor[2], fillColor[3]), packUint8ToFloat(strokeColor[0], strokeColor[1]), packUint8ToFloat(strokeColor[2], strokeColor[3]));
            });
            this.geometry.updateVertexBuffer(exports.VertexAttributeBufferIndex.PACKED_COLOR, exports.VertexAttributeLocation.PACKED_COLOR, startIndex, new Uint8Array(new Float32Array(packedFillStroke_1).buffer));
            var fill = this.instance.parsedStyle.fill;
            var i = this.textureMappings.findIndex(function (m) { return m.name === FILL_TEXTURE_MAPPING; });
            if (gLite.isCSSRGB(fill)) {
                if (i >= 0) {
                    // remove original fill texture mapping
                    this.textureMappings.splice(i, -1);
                    this.material.textureDirty = true;
                }
            }
            else {
                var fillTextureMapping = this.createFillGradientTextureMapping([
                    this.instance,
                ]);
                if (i >= 0) {
                    this.textureMappings.splice(i, 1, fillTextureMapping);
                }
                this.material.textureDirty = true;
            }
        }
        else if (stylePacked.indexOf(name) > -1) {
            var packed_1 = [];
            objects.forEach(function (object) {
                var _a = object.parsedStyle, opacity = _a.opacity, fillOpacity = _a.fillOpacity, strokeOpacity = _a.strokeOpacity, lineWidth = _a.lineWidth, visibility = _a.visibility, anchor = _a.anchor, increasedLineWidthForHitTesting = _a.increasedLineWidthForHitTesting;
                packed_1.push(opacity, fillOpacity, strokeOpacity, lineWidth, visibility === 'visible' ? 1 : 0, anchor[0], anchor[1], increasedLineWidthForHitTesting || 0);
            });
            this.geometry.updateVertexBuffer(exports.VertexAttributeBufferIndex.PACKED_STYLE, exports.VertexAttributeLocation.PACKED_STYLE1, startIndex, new Uint8Array(new Float32Array(packed_1).buffer));
        }
        else if (name === 'modelMatrix') {
            var packed_2 = [];
            var modelMatrix_1 = glMatrix.mat4.create();
            objects.forEach(function (object) {
                if (_this.mergeAnchorIntoModelMatrix) {
                    var anchor = object.parsedStyle.anchor;
                    var translateX = 0;
                    var translateY = 0;
                    var translateZ = 0;
                    var contentBounds = object.getGeometryBounds();
                    if (contentBounds) {
                        var halfExtents = contentBounds.halfExtents;
                        translateX = -halfExtents[0] * anchor[0] * 2;
                        translateY = -halfExtents[1] * anchor[1] * 2;
                        translateZ = -halfExtents[2] * (anchor[2] || 0) * 2;
                    }
                    glMatrix.mat4.mul(modelMatrix_1, object.getWorldTransform(), // apply anchor
                    glMatrix.mat4.fromTranslation(modelMatrix_1, glMatrix.vec3.fromValues(translateX, translateY, translateZ)));
                }
                else {
                    glMatrix.mat4.copy(modelMatrix_1, object.getWorldTransform());
                }
                packed_2.push.apply(packed_2, tslib.__spreadArray([], tslib.__read(modelMatrix_1), false));
            });
            this.geometry.updateVertexBuffer(exports.VertexAttributeBufferIndex.MODEL_MATRIX, exports.VertexAttributeLocation.MODEL_MATRIX0, startIndex, new Uint8Array(new Float32Array(packed_2).buffer));
        }
        else if (name === 'pointerEvents') {
            var packed_3 = [];
            objects.forEach(function (object) {
                var _a;
                var encodedPickingColor = (value &&
                    object.isInteractive() &&
                    (
                    // @ts-ignore
                    (_a = object.renderable3D) === null || _a === void 0 ? void 0 : _a.encodedPickingColor)) || [0, 0, 0];
                packed_3.push.apply(packed_3, tslib.__spreadArray(tslib.__spreadArray([], tslib.__read(encodedPickingColor), false), [object.sortable.renderOrder * RENDER_ORDER_SCALE], false));
            });
            this.geometry.updateVertexBuffer(exports.VertexAttributeBufferIndex.PICKING_COLOR, exports.VertexAttributeLocation.PICKING_COLOR, startIndex, new Uint8Array(new Float32Array(packed_3).buffer));
        }
    };
    Instanced.prototype.updateAttribute = function (objects, startIndex, name, value) {
        if (name === 'clipPath') {
            if (this.clipPath) {
                this.geometryDirty = true;
            }
        }
    };
    Instanced.prototype.changeRenderOrder = function (object, renderOrder) {
        var _a;
        var index = this.objects.indexOf(object);
        var encodedPickingColor = (object.isInteractive() &&
            (
            // @ts-ignore
            (_a = object.renderable3D) === null || _a === void 0 ? void 0 : _a.encodedPickingColor)) || [0, 0, 0];
        this.geometry.updateVertexBuffer(exports.VertexAttributeBufferIndex.PICKING_COLOR, exports.VertexAttributeLocation.PICKING_COLOR, index, new Uint8Array(new Float32Array(tslib.__spreadArray(tslib.__spreadArray([], tslib.__read(encodedPickingColor), false), [
            renderOrder * RENDER_ORDER_SCALE,
        ], false)).buffer));
    };
    Instanced.prototype.generateWireframe = function (geometry) {
        // need generate barycentric coordinates
        var indices = geometry.indices;
        var indiceNum = geometry.indices.length;
        var originalVertexBuffers = geometry.vertices.map(function (buffer) {
            // @ts-ignore
            return buffer.slice();
        });
        for (var i = exports.VertexAttributeBufferIndex.PICKING_COLOR; i < geometry.vertexBuffers.length; i++) {
            var arrayStride = geometry.inputLayoutDescriptor.vertexBufferDescriptors[i].arrayStride;
            geometry.vertices[i] = new Float32Array((arrayStride / 4) * indiceNum);
        }
        // reallocate attribute data
        var cursor = 0;
        var uniqueIndices = new Uint32Array(indiceNum);
        for (var i = 0; i < indiceNum; i++) {
            var ii = indices[i];
            for (var j = 1; j < geometry.vertices.length; j++) {
                var arrayStride = geometry.inputLayoutDescriptor.vertexBufferDescriptors[j].arrayStride;
                var size = arrayStride / 4;
                for (var k = 0; k < size; k++) {
                    geometry.vertices[j][cursor * size + k] =
                        originalVertexBuffers[j][ii * size + k];
                }
            }
            uniqueIndices[i] = cursor;
            cursor++;
        }
        for (var i = exports.VertexAttributeBufferIndex.PICKING_COLOR + 1; i < geometry.vertexBuffers.length; i++) {
            // if (i === 3) {
            //   continue;
            // }
            var _a = geometry.inputLayoutDescriptor.vertexBufferDescriptors[i], stepMode = _a.stepMode, arrayStride = _a.arrayStride;
            var descriptor = geometry.inputLayoutDescriptor.vertexBufferDescriptors[i].attributes[0];
            if (descriptor) {
                var location_1 = descriptor.shaderLocation, bufferByteOffset = descriptor.offset, format = descriptor.format, divisor = descriptor.divisor;
                geometry.setVertexBuffer({
                    bufferIndex: i,
                    byteStride: arrayStride,
                    stepMode: stepMode,
                    attributes: [
                        {
                            format: format,
                            bufferByteOffset: bufferByteOffset,
                            location: location_1,
                            divisor: divisor,
                        },
                    ],
                    data: geometry.vertices[i],
                });
            }
        }
        // create barycentric attributes
        var barycentricBuffer = new Float32Array(indiceNum * 3);
        for (var i = 0; i < indiceNum;) {
            for (var j = 0; j < 3; j++) {
                var ii = uniqueIndices[i++];
                barycentricBuffer[ii * 3 + j] = 1;
            }
        }
        geometry.setVertexBuffer({
            bufferIndex: exports.VertexAttributeBufferIndex.BARYCENTRIC,
            byteStride: 4 * 3,
            stepMode: gDeviceApi.VertexStepMode.VERTEX,
            attributes: [
                {
                    format: gDeviceApi.Format.F32_RGB,
                    bufferByteOffset: 4 * 0,
                    location: Number(exports.VertexAttributeLocation.BARYCENTRIC),
                },
            ],
            data: barycentricBuffer,
        });
        geometry.setIndexBuffer(uniqueIndices);
    };
    Instanced.prototype.beforeUploadUBO = function (renderInst, objects) { };
    Instanced.prototype.uploadUBO = function (renderInst) {
        var _this = this;
        var _a;
        var numUniformBuffers = 1; // Scene UBO
        var material = this.material;
        var lights = this.lightPool.getAllLights();
        var fog = this.lightPool.getFog();
        var useFog = !!fog;
        var useLight = (_a = material.defines.USE_LIGHT) !== null && _a !== void 0 ? _a : !!lights.length;
        var useWireframe = material.defines.USE_WIREFRAME;
        // collect uniforms
        var uniforms = [];
        if (useWireframe) {
            var wireframeColor = gLite.parseColor(material.wireframeColor);
            uniforms.push({
                name: 'u_WireframeLineColor',
                value: [
                    Number(wireframeColor.r) / 255,
                    Number(wireframeColor.g) / 255,
                    Number(wireframeColor.b) / 255,
                ],
            });
            uniforms.push({
                name: 'u_WireframeLineWidth',
                value: material.wireframeLineWidth,
            });
        }
        if (useFog) {
            this.uploadFog(uniforms, fog);
        }
        this.uploadMaterial(uniforms, material);
        if (useLight) {
            var counter_1 = {};
            lights.forEach(function (light) {
                if (!counter_1[light.define]) {
                    counter_1[light.define] = -1;
                }
                counter_1[light.define]++;
                light.uploadUBO(uniforms, counter_1[light.define]);
            });
        }
        uniforms.sort(function (a, b) {
            return _this.material.uniformNames.indexOf(a.name) -
                _this.material.uniformNames.indexOf(b.name);
        });
        // TODO: should not upload all uniforms if no change
        renderInst.setUniforms(numUniformBuffers, uniforms);
        var depthCompare = material.depthCompare, depthWrite = material.depthWrite, stencilFront = material.stencilFront, stencilBack = material.stencilBack, stencilWrite = material.stencilWrite, stencilRef = material.stencilRef, cullMode = material.cullMode, frontFace = material.frontFace, polygonOffset = material.polygonOffset, blendConstant = material.blendConstant, blendEquation = material.blendEquation, blendEquationAlpha = material.blendEquationAlpha, blendSrc = material.blendSrc, blendDst = material.blendDst, blendSrcAlpha = material.blendSrcAlpha, blendDstAlpha = material.blendDstAlpha;
        var materialMegaState = definedProps({
            blendConstant: blendConstant,
            depthCompare: depthCompare,
            depthWrite: depthWrite,
            stencilFront: stencilFront,
            stencilBack: stencilBack,
            stencilWrite: stencilWrite,
            stencilRef: stencilRef,
            cullMode: cullMode,
            frontFace: frontFace,
            polygonOffset: polygonOffset,
        });
        var currentAttachmentsState = renderInst.getMegaStateFlags().attachmentsState[0];
        renderInst.setMegaStateFlags(tslib.__assign({ attachmentsState: [
                {
                    // should not affect color buffer when drawing stencil
                    channelWriteMask: this.material.stencilWrite
                        ? gDeviceApi.ChannelWriteMask.NONE
                        : gDeviceApi.ChannelWriteMask.ALL,
                    // channelWriteMask: ChannelWriteMask.AllChannels,
                    rgbBlendState: tslib.__assign(tslib.__assign({}, currentAttachmentsState.rgbBlendState), definedProps({
                        blendMode: blendEquation,
                        blendSrcFactor: blendSrc,
                        blendDstFactor: blendDst,
                    })),
                    alphaBlendState: tslib.__assign(tslib.__assign({}, currentAttachmentsState.alphaBlendState), definedProps({
                        blendMode: blendEquationAlpha,
                        blendSrcFactor: blendSrcAlpha,
                        blendDstFactor: blendDstAlpha,
                    })),
                },
            ] }, materialMegaState));
        renderInst.setBindingLayout({
            numUniformBuffers: numUniformBuffers,
            numSamplers: this.textureMappings.length,
        });
        renderInst.setSamplerBindingsFromTextureMappings(this.textureMappings);
    };
    Instanced.prototype.uploadFog = function (uniforms, fog) {
        var _a = fog.parsedStyle, type = _a.type, fill = _a.fill, start = _a.start, end = _a.end, density = _a.density;
        if (gLite.isCSSRGB(fill)) {
            var fillColor = [
                Number(fill.r) / 255,
                Number(fill.g) / 255,
                Number(fill.b) / 255,
                Number(fill.alpha),
            ];
            uniforms.push({
                name: 'u_FogInfos',
                value: [type, start, end, density],
            });
            uniforms.push({
                name: 'u_FogColor',
                value: fillColor,
            });
        }
    };
    Instanced.prototype.uploadMaterial = function (uniforms, material) {
        // sort
        var materialUniforms = Object.keys(material.uniforms).map(function (name) { return ({
            name: name,
            value: material.uniforms[name],
        }); });
        uniforms.push.apply(uniforms, tslib.__spreadArray([], tslib.__read(materialUniforms), false));
    };
    Instanced.prototype.createFillGradientTextureMapping = function (objects) {
        var _this = this;
        var instance = objects[0];
        // should account for Line, Path, Polyline and Polyline
        var fill = instance.parsedStyle[this.gradientAttributeName];
        var texImageSource;
        // use pattern & gradient
        if (fill && (gLite.isPattern(fill) || Array.isArray(fill))) {
            if (Array.isArray(fill)) {
                this.program.setDefineBool('USE_PATTERN', false);
                this.texturePool.getOrCreateGradient({
                    gradients: fill,
                    width: 128,
                    height: 128,
                    instance: instance,
                });
            }
            else if (gLite.isPattern(fill)) {
                this.program.setDefineBool('USE_PATTERN', true);
                this.texturePool.getOrCreatePattern(fill, instance, function () {
                    // need re-render
                    objects.forEach(function (object) {
                        object.renderable.dirty = true;
                    });
                    _this.material.textureDirty = true;
                });
            }
            texImageSource = this.texturePool.getOrCreateCanvas();
            var texture = this.texturePool.getOrCreateTexture(this.context.device, texImageSource, gDeviceApi.makeTextureDescriptor2D(gDeviceApi.Format.U8_RGBA_NORM, 1, 1, 1));
            if (texture) {
                var fillMapping = new TextureMapping();
                fillMapping.name = FILL_TEXTURE_MAPPING;
                fillMapping.texture = texture;
                fillMapping.texture.on('loaded', function () {
                    // need re-render
                    objects.forEach(function (object) {
                        object.renderable.dirty = true;
                    });
                    _this.material.textureDirty = true;
                });
                this.context.device.setResourceName(fillMapping.texture, 'Fill Texture' + this.id);
                fillMapping.sampler = this.renderHelper.getCache().createSampler({
                    addressModeU: gDeviceApi.AddressMode.CLAMP_TO_EDGE,
                    addressModeV: gDeviceApi.AddressMode.CLAMP_TO_EDGE,
                    minFilter: gDeviceApi.FilterMode.POINT,
                    magFilter: gDeviceApi.FilterMode.BILINEAR,
                    mipmapFilter: gDeviceApi.MipmapFilterMode.LINEAR,
                    lodMinClamp: 0,
                    lodMaxClamp: 0,
                });
                return fillMapping;
            }
        }
        return null;
    };
    return Instanced;
}());

var frag$4 = "#define GLSLIFY 1\nlayout(std140) uniform ub_SceneParams {\n  mat4 u_ProjectionMatrix;\n  mat4 u_ViewMatrix;\n  vec3 u_CameraPosition;\n  float u_DevicePixelRatio;\n  vec2 u_Viewport;\n  float u_IsOrtho;\n  float u_IsPicking;\n};\n\nin vec4 v_PickingResult;\nin vec4 v_Color;\nin vec4 v_StrokeColor;\nin vec4 v_StylePacked1;\nin vec4 v_StylePacked2;\n#ifdef USE_UV\n  in vec2 v_Uv;\n#endif\n#ifdef USE_MAP\n  uniform sampler2D u_Map;\n#endif\n\nin vec2 v_Data;\nin vec2 v_Radius;\nin vec3 v_StylePacked3;\n\nout vec4 outputColor;\nfloat epsilon = 0.000001;\n\n/**\n * 2D signed distance field functions\n * @see http://www.iquilezles.org/www/articles/distfunctions2d/distfunctions2d.htm\n */\n\nfloat sdCircle(vec2 p, float r) {\n  return length(p) - r;\n}\n\n// @see http://www.iquilezles.org/www/articles/ellipsoids/ellipsoids.htm\nfloat sdEllipsoidApproximated(vec2 p, vec2 r) {\n  float k0 = length(p / r);\n  float k1 = length(p / (r * r));\n  return k0 * (k0 - 1.0) / k1;\n}\n\n// @see https://www.shadertoy.com/view/4llXD7\nfloat sdRoundedBox(vec2 p, vec2 b, float r) {\n  p = abs(p) - b + r;\n  return length(max(p, 0.0)) + min(max(p.x, p.y), 0.0) - r;\n}\n\nvoid main() {\n  int shape = int(floor(v_StylePacked3.x + 0.5));\n\n  vec4 u_Color = v_Color;\nvec4 u_StrokeColor = v_StrokeColor;\nfloat u_Opacity = v_StylePacked1.x;\nfloat u_FillOpacity = v_StylePacked1.y;\nfloat u_StrokeOpacity = v_StylePacked1.z;\nfloat u_StrokeWidth = v_StylePacked1.w;\nfloat u_Visible = v_StylePacked2.x;\nvec3 u_PickingColor = v_PickingResult.xyz;\n\nif (u_Visible < 0.5) {\n    discard;\n}\n  #ifdef USE_MAP\n  #ifdef USE_PATTERN\n    vec4 texelColor = texture(SAMPLER_2D(u_Map), v_Uv);\n    u_Color = texelColor;\n  #else\n    vec4 texelColor = texture(SAMPLER_2D(u_Map), v_Uv);\n    u_Color = texelColor;\n  #endif\n#endif\n\n  bool omitStroke = v_StylePacked3.z == 1.0;\n\n  vec2 r = (v_Radius - (omitStroke ? 0.0 : u_StrokeWidth)) / v_Radius.y;\n  float wh = v_Radius.x / v_Radius.y;\n\n  float dist = length(v_Data);\n  float antialiased_blur = -fwidth(dist);\n\n  float outer_df;\n  float inner_df;\n  // 'circle', 'ellipse', 'rect'\n  if (shape == 0) {\n    outer_df = sdCircle(v_Data, 1.0);\n    inner_df = sdCircle(v_Data, r.x);\n  } else if (shape == 1) {\n    outer_df = sdEllipsoidApproximated(v_Data, vec2(wh, 1.0));\n    inner_df = sdEllipsoidApproximated(v_Data, r);\n  } else if (shape == 2) {\n    bool useRadius = v_StylePacked3.y > epsilon;\n    outer_df = sdRoundedBox(v_Data, vec2(wh, 1.0), useRadius ? (v_StylePacked3.y + u_StrokeWidth / 2.0) / v_Radius.y : 0.0);\n    inner_df = sdRoundedBox(v_Data, r, useRadius ? (v_StylePacked3.y - u_StrokeWidth / 2.0) / v_Radius.y : 0.0);\n  }\n\n  float opacity_t = smoothstep(0.0, antialiased_blur, outer_df);\n\n  float color_t = u_StrokeWidth < 0.01 ? 0.0 : smoothstep(\n    antialiased_blur,\n    0.0,\n    inner_df\n  );\n\n  vec4 diffuseColor;\n  vec4 strokeColor;\n  if (u_IsPicking > 0.5) {\n    diffuseColor = vec4(u_PickingColor, 1.0);\n    strokeColor = vec4(u_PickingColor, 1.0);\n  } else {\n    diffuseColor = u_Color;\n    strokeColor = (u_StrokeColor == vec4(0) || omitStroke) ? vec4(0.0) : u_StrokeColor;\n  }\n\n  outputColor = mix(vec4(diffuseColor.rgb, diffuseColor.a * u_FillOpacity), strokeColor * u_StrokeOpacity, color_t);\n  outputColor.a = outputColor.a * u_Opacity * opacity_t;\n\n  if (outputColor.a < epsilon)\n    discard;\n\n  if (u_IsPicking > 0.5) {\n    if (u_PickingColor.x == 0.0 && u_PickingColor.y == 0.0 && u_PickingColor.z == 0.0) {\n      discard;\n    }\n  }\n}"; // eslint-disable-line

var vert$4 = "#define GLSLIFY 1\nlayout(std140) uniform ub_SceneParams {\n  mat4 u_ProjectionMatrix;\n  mat4 u_ViewMatrix;\n  vec3 u_CameraPosition;\n  float u_DevicePixelRatio;\n  vec2 u_Viewport;\n  float u_IsOrtho;\n  float u_IsPicking;\n};\n\nlayout(location = MODEL_MATRIX0) in vec4 a_ModelMatrix0;\nlayout(location = MODEL_MATRIX1) in vec4 a_ModelMatrix1;\nlayout(location = MODEL_MATRIX2) in vec4 a_ModelMatrix2;\nlayout(location = MODEL_MATRIX3) in vec4 a_ModelMatrix3;\nlayout(location = PACKED_COLOR) in vec4 a_PackedColor;\nlayout(location = PACKED_STYLE1) in vec4 a_StylePacked1;\nlayout(location = PACKED_STYLE2) in vec4 a_StylePacked2;\nlayout(location = PICKING_COLOR) in vec4 a_PickingColor;\n\nout vec4 v_PickingResult;\nout vec4 v_Color;\nout vec4 v_StrokeColor;\nout vec4 v_StylePacked1;\nout vec4 v_StylePacked2;\n\n#define COLOR_SCALE 1. / 255.\nvoid setPickingColor(vec3 pickingColor) {\n  v_PickingResult.rgb = pickingColor * COLOR_SCALE;\n}\n\nvec2 unpack_float(const float packedValue) {\n  int packedIntValue = int(packedValue);\n  int v0 = packedIntValue / 256;\n  return vec2(v0, packedIntValue - v0 * 256);\n}\nvec4 decode_color(const vec2 encodedColor) {\n  return vec4(\n    unpack_float(encodedColor[0]) / 255.0,\n    unpack_float(encodedColor[1]) / 255.0\n  );\n}\nvec4 project(vec4 pos, mat4 pm, mat4 vm, mat4 mm) {\n  return pm * vm * mm * pos;\n}\n\nbool isPerspectiveMatrix(mat4 m) {\n  return m[2][3] == -1.0;\n}\n\nvec4 billboard(vec2 offset, float rotation, bool isSizeAttenuation, mat4 pm, mat4 vm, mat4 mm) {\n  vec4 mvPosition = vm * mm * vec4(0.0, 0.0, 0.0, 1.0);\n  vec2 scale;\n  scale.x = length(vec3(mm[0][0], mm[0][1], mm[0][2]));\n  scale.y = length(vec3(mm[1][0], mm[1][1], mm[1][2]));\n\n  if (isSizeAttenuation) {\n    bool isPerspective = isPerspectiveMatrix(pm);\n    if (isPerspective) {\n      scale *= -mvPosition.z / 250.0;\n    }\n  }\n\n  vec2 alignedPosition = offset * scale;\n  vec2 rotatedPosition;\n  rotatedPosition.x = cos(rotation) * alignedPosition.x - sin(rotation) * alignedPosition.y;\n  rotatedPosition.y = sin(rotation) * alignedPosition.x + cos(rotation) * alignedPosition.y;\n\n  mvPosition.xy += rotatedPosition;\n  return pm * mvPosition;\n}\n\nlayout(location = POSITION) in vec2 a_Extrude;\n// shape, radius, omitStroke, isBillboard\nlayout(location = PACKED_STYLE3) in vec3 a_StylePacked3;\nlayout(location = SIZE) in vec4 a_Size;\n#ifdef USE_UV\n  layout(location = UV) in vec2 a_Uv;\n  out vec2 v_Uv;\n#endif\n\nout vec2 v_Data;\nout vec2 v_Radius;\nout vec3 v_StylePacked3;\n\nvoid main() {\n  vec4 a_Color = decode_color(a_PackedColor.xy);\nvec4 a_StrokeColor = decode_color(a_PackedColor.zw);\n\nmat4 u_ModelMatrix = mat4(a_ModelMatrix0, a_ModelMatrix1, a_ModelMatrix2, a_ModelMatrix3);\nvec4 u_StrokeColor = a_StrokeColor;\nfloat u_Opacity = a_StylePacked1.x;\nfloat u_FillOpacity = a_StylePacked1.y;\nfloat u_StrokeOpacity = a_StylePacked1.z;\nfloat u_StrokeWidth = a_StylePacked1.w;\nfloat u_ZIndex = a_PickingColor.w;\nvec2 u_Anchor = a_StylePacked2.yz;\nfloat u_IncreasedLineWidthForHitTesting = a_StylePacked2.w;\n\nsetPickingColor(a_PickingColor.xyz);\n\nv_Color = a_Color;\nv_StrokeColor = a_StrokeColor;\nv_StylePacked1 = a_StylePacked1;\nv_StylePacked2 = a_StylePacked2;\n\n// #ifdef CLIPSPACE_NEAR_ZERO\n//     gl_Position.z = (gl_Position.z + gl_Position.w) * 0.5;\n// #endif\n  #ifdef USE_UV\n  v_Uv = a_Uv;\n#endif\n\n  float strokeWidth;\n  if (u_IsPicking > 0.5) {\n    strokeWidth = u_IncreasedLineWidthForHitTesting + u_StrokeWidth;\n  } else {\n    strokeWidth = u_StrokeWidth;\n  }\n\n  bool omitStroke = a_StylePacked3.z == 1.0;\n  vec2 radius = a_Size.xy + vec2(omitStroke ? 0.0 : strokeWidth / 2.0);\n  vec2 offset = (a_Extrude + vec2(1.0) - 2.0 * u_Anchor.xy) * a_Size.xy + a_Extrude * vec2(omitStroke ? 0.0 : strokeWidth / 2.0);\n\n  bool isBillboard = a_Size.z > 0.5;\n  if (isBillboard) {\n    float rotation = 0.0;\n    bool isSizeAttenuation = a_Size.w > 0.5;\n    gl_Position = billboard(offset, rotation, isSizeAttenuation, u_ProjectionMatrix, u_ViewMatrix, u_ModelMatrix);\n  } else {\n    gl_Position = project(vec4(offset, u_ZIndex, 1.0), u_ProjectionMatrix, u_ViewMatrix, u_ModelMatrix);\n  }\n  \n  v_Radius = radius;\n  v_Data = vec2(a_Extrude * radius / radius.y);\n  v_StylePacked3 = a_StylePacked3;\n}"; // eslint-disable-line

var SDFVertexAttributeBufferIndex;
(function (SDFVertexAttributeBufferIndex) {
    SDFVertexAttributeBufferIndex[SDFVertexAttributeBufferIndex["PACKED_STYLE"] = 5] = "PACKED_STYLE";
})(SDFVertexAttributeBufferIndex || (SDFVertexAttributeBufferIndex = {}));
var SDFVertexAttributeLocation;
(function (SDFVertexAttributeLocation) {
    SDFVertexAttributeLocation[SDFVertexAttributeLocation["PACKED_STYLE3"] = 12] = "PACKED_STYLE3";
    SDFVertexAttributeLocation[SDFVertexAttributeLocation["SIZE"] = 13] = "SIZE";
})(SDFVertexAttributeLocation || (SDFVertexAttributeLocation = {}));
var SDF_Shape = [gLite.Shape.CIRCLE, gLite.Shape.ELLIPSE, gLite.Shape.RECT];
/**
 * Use SDF to render 2D shapes, eg. circle, ellipse.
 * Use less triangles(2) and vertices compared with normal triangulation.
 */
var SDFDrawcall = /** @class */ (function (_super) {
    tslib.__extends(SDFDrawcall, _super);
    function SDFDrawcall() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SDFDrawcall.prototype.shouldMerge = function (object, index) {
        var shouldMerge = _super.prototype.shouldMerge.call(this, object, index);
        if (!shouldMerge) {
            return false;
        }
        // if (
        //   this.needDrawStrokeSeparately(object.parsedStyle) ||
        //   this.needDrawStrokeSeparately(this.instance.parsedStyle)
        // ) {
        //   return false;
        // }
        // const { fill: instanceFill } = this.instance
        //   .parsedStyle as ParsedBaseStyleProps;
        // const { fill } = object.parsedStyle as ParsedBaseStyleProps;
        // if ((instanceFill as CSSRGB).isNone !== (fill as CSSRGB).isNone) {
        //   return false;
        // }
        return true;
    };
    SDFDrawcall.prototype.createMaterial = function (objects) {
        this.material.vertexShader = vert$4;
        this.material.fragmentShader = frag$4;
        this.material.defines = tslib.__assign(tslib.__assign({}, this.material.defines), enumToObject(SDFVertexAttributeLocation));
    };
    SDFDrawcall.prototype.createGeometry = function (objects) {
        var _this = this;
        // use default common attributes
        _super.prototype.createGeometry.call(this, objects);
        var instanced = [];
        objects.forEach(function (object, i) {
            var circle = object;
            // @ts-ignore
            var radius = circle.parsedStyle.radius;
            var omitStroke = _this.shouldOmitStroke(circle.parsedStyle);
            var size = _this.getSize(object.parsedStyle, circle.nodeName);
            instanced.push.apply(instanced, tslib.__spreadArray(tslib.__spreadArray([], tslib.__read(size), false), [circle.parsedStyle.isBillboard ? 1 : 0,
                circle.parsedStyle.isSizeAttenuation ? 1 : 0,
                SDF_Shape.indexOf(circle.nodeName),
                (radius && radius[0]) || 0,
                omitStroke ? 1 : 0], false));
        });
        this.geometry.setIndexBuffer(new Uint32Array([0, 2, 1, 0, 3, 2]));
        this.geometry.vertexCount = 6;
        this.geometry.setVertexBuffer({
            bufferIndex: exports.VertexAttributeBufferIndex.POSITION,
            byteStride: 4 * 4,
            stepMode: gDeviceApi.VertexStepMode.VERTEX,
            attributes: [
                {
                    format: gDeviceApi.Format.F32_RG,
                    bufferByteOffset: 4 * 0,
                    location: exports.VertexAttributeLocation.POSITION,
                },
                {
                    format: gDeviceApi.Format.F32_RG,
                    bufferByteOffset: 4 * 2,
                    location: exports.VertexAttributeLocation.UV,
                },
            ],
            data: new Float32Array([
                -1, -1, 0, 0, 1, -1, 1, 0, 1, 1, 1, 1, -1, 1, 0, 1,
            ]),
        });
        this.geometry.setVertexBuffer({
            bufferIndex: SDFVertexAttributeBufferIndex.PACKED_STYLE,
            byteStride: 4 * 7,
            stepMode: gDeviceApi.VertexStepMode.INSTANCE,
            attributes: [
                {
                    format: gDeviceApi.Format.F32_RGBA,
                    bufferByteOffset: 4 * 0,
                    location: SDFVertexAttributeLocation.SIZE,
                    divisor: 1,
                },
                {
                    format: gDeviceApi.Format.F32_RGB,
                    bufferByteOffset: 4 * 4,
                    location: SDFVertexAttributeLocation.PACKED_STYLE3,
                    divisor: 1,
                },
            ],
            data: new Float32Array(instanced),
        });
    };
    SDFDrawcall.prototype.updateAttribute = function (objects, startIndex, name, value) {
        var _this = this;
        _super.prototype.updateAttribute.call(this, objects, startIndex, name, value);
        this.updateBatchedAttribute(objects, startIndex, name, value);
        if (name === 'r' ||
            name === 'rx' ||
            name === 'ry' ||
            name === 'width' ||
            name === 'height' ||
            name === 'lineWidth' ||
            name === 'stroke' ||
            name === 'lineDash' ||
            name === 'strokeOpacity' ||
            name === 'radius' ||
            name === 'isBillboard' ||
            name === 'isSizeAttenuation') {
            var packed_1 = [];
            objects.forEach(function (object) {
                var circle = object;
                var omitStroke = _this.shouldOmitStroke(circle.parsedStyle);
                var _a = tslib.__read(_this.getSize(object.parsedStyle, object.nodeName), 2), halfWidth = _a[0], halfHeight = _a[1];
                var size = [halfWidth, halfHeight];
                packed_1.push.apply(packed_1, tslib.__spreadArray(tslib.__spreadArray([], tslib.__read(size), false), [circle.parsedStyle.isBillboard ? 1 : 0,
                    circle.parsedStyle.isSizeAttenuation ? 1 : 0,
                    SDF_Shape.indexOf(object.nodeName),
                    (object.parsedStyle.radius && object.parsedStyle.radius[0]) || 0,
                    omitStroke ? 1 : 0], false));
            });
            this.geometry.updateVertexBuffer(SDFVertexAttributeBufferIndex.PACKED_STYLE, SDFVertexAttributeLocation.SIZE, startIndex, new Uint8Array(new Float32Array(packed_1).buffer));
        }
    };
    SDFDrawcall.prototype.getSize = function (parsed, tagName) {
        var size = [0, 0];
        if (tagName === gLite.Shape.CIRCLE) {
            var r = parsed.r;
            size = [r, r];
        }
        else if (tagName === gLite.Shape.ELLIPSE) {
            var _a = parsed, rx = _a.rx, ry = _a.ry;
            size = [rx, ry];
        }
        else if (tagName === gLite.Shape.RECT) {
            var _b = parsed, width = _b.width, height = _b.height;
            size = [width / 2, height / 2];
        }
        return size;
    };
    SDFDrawcall.prototype.shouldOmitStroke = function (parsedStyle) {
        var lineDash = parsedStyle.lineDash, stroke = parsedStyle.stroke, strokeOpacity = parsedStyle.strokeOpacity;
        var hasStroke = stroke && !stroke.isNone;
        var hasLineDash = lineDash &&
            lineDash.length &&
            lineDash.every(function (item) { return item !== 0; });
        var hasStrokeOpacity = strokeOpacity < 1;
        return !hasStroke || (hasStroke && (hasLineDash || hasStrokeOpacity));
    };
    return SDFDrawcall;
}(Instanced));

var frag$3 = "#define GLSLIFY 1\nlayout(std140) uniform ub_SceneParams {\n  mat4 u_ProjectionMatrix;\n  mat4 u_ViewMatrix;\n  vec3 u_CameraPosition;\n  float u_DevicePixelRatio;\n  vec2 u_Viewport;\n  float u_IsOrtho;\n  float u_IsPicking;\n};\n\nin vec4 v_PickingResult;\nin vec4 v_Color;\nin vec4 v_StrokeColor;\nin vec4 v_StylePacked1;\nin vec4 v_StylePacked2;\n#ifdef USE_UV\n  in vec2 v_Uv;\n#endif\n#ifdef USE_MAP\n  uniform sampler2D u_Map;\n#endif\n\nin vec4 v_Dash;\nin vec2 v_Distance;\n\nout vec4 outputColor;\nfloat epsilon = 0.000001;\n\nvoid main() {\n  vec4 u_Color = v_Color;\nvec4 u_StrokeColor = v_StrokeColor;\nfloat u_Opacity = v_StylePacked1.x;\nfloat u_FillOpacity = v_StylePacked1.y;\nfloat u_StrokeOpacity = v_StylePacked1.z;\nfloat u_StrokeWidth = v_StylePacked1.w;\nfloat u_Visible = v_StylePacked2.x;\nvec3 u_PickingColor = v_PickingResult.xyz;\n\nif (u_Visible < 0.5) {\n    discard;\n}\n  #ifdef USE_MAP\n  #ifdef USE_PATTERN\n    vec4 texelColor = texture(SAMPLER_2D(u_Map), v_Uv);\n    u_Color = texelColor;\n  #else\n    vec4 texelColor = texture(SAMPLER_2D(u_Map), v_Uv);\n    u_Color = texelColor;\n  #endif\n#endif\n\n  if (u_IsPicking > 0.5) {\n    if (u_PickingColor.x == 0.0 && u_PickingColor.y == 0.0 && u_PickingColor.z == 0.0) {\n      discard;\n    }\n    outputColor = vec4(u_PickingColor, 1.0);\n  } else {\n    outputColor = u_StrokeColor;\n    #ifdef USE_MAP\n      outputColor = u_Color;\n    #endif\n\n    float blur;\n    if (v_Distance.y < 1.0) {\n      blur = smoothstep(0.0, v_Distance.y, 1.0 - abs(v_Distance.x));\n    } else {\n      blur = 1.0 / v_Distance.y;\n    }\n    float u_dash_offset = v_Dash.y;\n    float u_dash_array = v_Dash.z;\n    float u_dash_ratio = v_Dash.w;\n\n    outputColor.a = outputColor.a\n      * blur\n      * u_Opacity * u_StrokeOpacity\n      * (u_dash_array < 1.0 ? (ceil((u_dash_array * u_dash_ratio) - mod(v_Dash.x + u_dash_offset, u_dash_array))) : 1.0);\n\n    if (outputColor.a < epsilon) {\n      discard;\n    }\n  }\n}"; // eslint-disable-line

var vert$3 = "#define GLSLIFY 1\nlayout(std140) uniform ub_SceneParams {\n  mat4 u_ProjectionMatrix;\n  mat4 u_ViewMatrix;\n  vec3 u_CameraPosition;\n  float u_DevicePixelRatio;\n  vec2 u_Viewport;\n  float u_IsOrtho;\n  float u_IsPicking;\n};\n\nlayout(location = MODEL_MATRIX0) in vec4 a_ModelMatrix0;\nlayout(location = MODEL_MATRIX1) in vec4 a_ModelMatrix1;\nlayout(location = MODEL_MATRIX2) in vec4 a_ModelMatrix2;\nlayout(location = MODEL_MATRIX3) in vec4 a_ModelMatrix3;\nlayout(location = PACKED_COLOR) in vec4 a_PackedColor;\nlayout(location = PACKED_STYLE1) in vec4 a_StylePacked1;\nlayout(location = PACKED_STYLE2) in vec4 a_StylePacked2;\nlayout(location = PICKING_COLOR) in vec4 a_PickingColor;\n\nout vec4 v_PickingResult;\nout vec4 v_Color;\nout vec4 v_StrokeColor;\nout vec4 v_StylePacked1;\nout vec4 v_StylePacked2;\n\n#define COLOR_SCALE 1. / 255.\nvoid setPickingColor(vec3 pickingColor) {\n  v_PickingResult.rgb = pickingColor * COLOR_SCALE;\n}\n\nvec2 unpack_float(const float packedValue) {\n  int packedIntValue = int(packedValue);\n  int v0 = packedIntValue / 256;\n  return vec2(v0, packedIntValue - v0 * 256);\n}\nvec4 decode_color(const vec2 encodedColor) {\n  return vec4(\n    unpack_float(encodedColor[0]) / 255.0,\n    unpack_float(encodedColor[1]) / 255.0\n  );\n}\nvec4 project(vec4 pos, mat4 pm, mat4 vm, mat4 mm) {\n  return pm * vm * mm * pos;\n}\n\nlayout(location = POSITION) in vec3 a_Position;\nlayout(location = POINTA) in vec3 a_PointA;\nlayout(location = POINTB) in vec3 a_PointB;\nlayout(location = CAP) in float a_Cap;\n#ifdef USE_UV\n  layout(location = UV) in vec2 a_Uv;\n  out vec2 v_Uv;\n#endif\nlayout(location = DASH) in vec4 a_Dash;\n\nout vec4 v_Dash;\nout vec2 v_Distance;\n\nvoid main() {\n  vec4 a_Color = decode_color(a_PackedColor.xy);\nvec4 a_StrokeColor = decode_color(a_PackedColor.zw);\n\nmat4 u_ModelMatrix = mat4(a_ModelMatrix0, a_ModelMatrix1, a_ModelMatrix2, a_ModelMatrix3);\nvec4 u_StrokeColor = a_StrokeColor;\nfloat u_Opacity = a_StylePacked1.x;\nfloat u_FillOpacity = a_StylePacked1.y;\nfloat u_StrokeOpacity = a_StylePacked1.z;\nfloat u_StrokeWidth = a_StylePacked1.w;\nfloat u_ZIndex = a_PickingColor.w;\nvec2 u_Anchor = a_StylePacked2.yz;\nfloat u_IncreasedLineWidthForHitTesting = a_StylePacked2.w;\n\nsetPickingColor(a_PickingColor.xyz);\n\nv_Color = a_Color;\nv_StrokeColor = a_StrokeColor;\nv_StylePacked1 = a_StylePacked1;\nv_StylePacked2 = a_StylePacked2;\n\n// #ifdef CLIPSPACE_NEAR_ZERO\n//     gl_Position.z = (gl_Position.z + gl_Position.w) * 0.5;\n// #endif\n  #ifdef USE_UV\n  v_Uv = a_Uv;\n#endif\n\n  float strokeWidth;\n  if (u_IsPicking > 0.5) {\n    strokeWidth = u_IncreasedLineWidthForHitTesting + u_StrokeWidth;\n  } else {\n    strokeWidth = u_StrokeWidth;\n  }\n  float clampedStrokeWidth = max(strokeWidth, 1.0);\n\n  bool isSizeAttenuation = a_Dash.w > 0.5;\n  if (isSizeAttenuation) {\n    vec4 clip0 = project(vec4(a_PointA, 1.0), u_ProjectionMatrix, u_ViewMatrix, u_ModelMatrix);\n    vec4 clip1 = project(vec4(a_PointB, 1.0), u_ProjectionMatrix, u_ViewMatrix, u_ModelMatrix);\n    // screen space\n    vec2 screen0 = u_Viewport * (0.5 * clip0.xy / clip0.w + 0.5);\n    vec2 screen1 = u_Viewport * (0.5 * clip1.xy / clip1.w + 0.5);\n    vec2 xBasis = normalize(screen1 - screen0);\n    vec2 yBasis = vec2(-xBasis.y, xBasis.x);\n    vec2 pt0 = screen0 + clampedStrokeWidth * (a_Position.x * xBasis + a_Position.y * yBasis);\n    vec2 pt1 = screen1 + clampedStrokeWidth * (a_Position.x * xBasis + a_Position.y * yBasis);\n    vec2 pt = mix(pt0, pt1, a_Position.z);\n    vec4 clip = mix(clip0, clip1, a_Position.z);\n    gl_Position = vec4(clip.w * (2.0 * pt / u_Viewport - 1.0), clip.z, clip.w);\n  } else {\n    vec2 xBasis = a_PointB.xy - a_PointA.xy;\n    vec2 yBasis = normalize(vec2(-xBasis.y, xBasis.x));\n\n    vec2 point = a_PointA.xy + xBasis * a_Position.x + yBasis * clampedStrokeWidth * a_Position.y;\n    point = point - u_Anchor.xy * abs(xBasis);\n\n    // round & square\n    if (a_Cap > 1.0) {\n      point += sign(a_Position.x - 0.5) * normalize(xBasis) * vec2(clampedStrokeWidth / 2.0);\n    }\n    gl_Position = project(vec4(point, u_ZIndex, 1.0), u_ProjectionMatrix, u_ViewMatrix, u_ModelMatrix);\n  }\n\n  float antialiasblur = 1.0 / strokeWidth;\n  v_Distance = vec2(a_Position.y * 2.0, antialiasblur);\n  v_Dash = vec4(a_Position.x, a_Dash.xyz);\n}"; // eslint-disable-line

var meshFrag = "#define GLSLIFY 1\nlayout(std140) uniform ub_SceneParams {\n  mat4 u_ProjectionMatrix;\n  mat4 u_ViewMatrix;\n  vec3 u_CameraPosition;\n  float u_DevicePixelRatio;\n  vec2 u_Viewport;\n  float u_IsOrtho;\n  float u_IsPicking;\n};\n\nin vec4 v_PickingResult;\nin vec4 v_Color;\nin vec4 v_StrokeColor;\nin vec4 v_StylePacked1;\nin vec4 v_StylePacked2;\n#ifdef USE_UV\n  in vec2 v_Uv;\n#endif\n#ifdef USE_MAP\n  uniform sampler2D u_Map;\n#endif\n\nout vec4 outputColor;\n\nvoid main(){\n  vec4 u_Color = v_Color;\nvec4 u_StrokeColor = v_StrokeColor;\nfloat u_Opacity = v_StylePacked1.x;\nfloat u_FillOpacity = v_StylePacked1.y;\nfloat u_StrokeOpacity = v_StylePacked1.z;\nfloat u_StrokeWidth = v_StylePacked1.w;\nfloat u_Visible = v_StylePacked2.x;\nvec3 u_PickingColor = v_PickingResult.xyz;\n\nif (u_Visible < 0.5) {\n    discard;\n}\n  #ifdef USE_MAP\n  #ifdef USE_PATTERN\n    vec4 texelColor = texture(SAMPLER_2D(u_Map), v_Uv);\n    u_Color = texelColor;\n  #else\n    vec4 texelColor = texture(SAMPLER_2D(u_Map), v_Uv);\n    u_Color = texelColor;\n  #endif\n#endif\n\n  if (u_IsPicking > 0.5) {\n    if (u_PickingColor.x == 0.0 && u_PickingColor.y == 0.0 && u_PickingColor.z == 0.0) {\n      discard;\n    }\n    outputColor = vec4(u_PickingColor, 1.0);\n  } else {\n    outputColor = u_Color;\n\n    outputColor.a = outputColor.a * u_Opacity * u_FillOpacity;\n  }\n}"; // eslint-disable-line

var meshVert = "#define GLSLIFY 1\nlayout(std140) uniform ub_SceneParams {\n  mat4 u_ProjectionMatrix;\n  mat4 u_ViewMatrix;\n  vec3 u_CameraPosition;\n  float u_DevicePixelRatio;\n  vec2 u_Viewport;\n  float u_IsOrtho;\n  float u_IsPicking;\n};\nlayout(location = MODEL_MATRIX0) in vec4 a_ModelMatrix0;\nlayout(location = MODEL_MATRIX1) in vec4 a_ModelMatrix1;\nlayout(location = MODEL_MATRIX2) in vec4 a_ModelMatrix2;\nlayout(location = MODEL_MATRIX3) in vec4 a_ModelMatrix3;\nlayout(location = PACKED_COLOR) in vec4 a_PackedColor;\nlayout(location = PACKED_STYLE1) in vec4 a_StylePacked1;\nlayout(location = PACKED_STYLE2) in vec4 a_StylePacked2;\nlayout(location = PICKING_COLOR) in vec4 a_PickingColor;\n\nout vec4 v_PickingResult;\nout vec4 v_Color;\nout vec4 v_StrokeColor;\nout vec4 v_StylePacked1;\nout vec4 v_StylePacked2;\n\n#define COLOR_SCALE 1. / 255.\nvoid setPickingColor(vec3 pickingColor) {\n  v_PickingResult.rgb = pickingColor * COLOR_SCALE;\n}\n\nvec2 unpack_float(const float packedValue) {\n  int packedIntValue = int(packedValue);\n  int v0 = packedIntValue / 256;\n  return vec2(v0, packedIntValue - v0 * 256);\n}\nvec4 decode_color(const vec2 encodedColor) {\n  return vec4(\n    unpack_float(encodedColor[0]) / 255.0,\n    unpack_float(encodedColor[1]) / 255.0\n  );\n}\nvec4 project(vec4 pos, mat4 pm, mat4 vm, mat4 mm) {\n  return pm * vm * mm * pos;\n}\n\nbool isPerspectiveMatrix(mat4 m) {\n  return m[2][3] == -1.0;\n}\n\nvec4 billboard(vec2 offset, float rotation, bool isSizeAttenuation, mat4 pm, mat4 vm, mat4 mm) {\n  vec4 mvPosition = vm * mm * vec4(0.0, 0.0, 0.0, 1.0);\n  vec2 scale;\n  scale.x = length(vec3(mm[0][0], mm[0][1], mm[0][2]));\n  scale.y = length(vec3(mm[1][0], mm[1][1], mm[1][2]));\n\n  if (isSizeAttenuation) {\n    bool isPerspective = isPerspectiveMatrix(pm);\n    if (isPerspective) {\n      scale *= -mvPosition.z / 250.0;\n    }\n  }\n\n  vec2 alignedPosition = offset * scale;\n  vec2 rotatedPosition;\n  rotatedPosition.x = cos(rotation) * alignedPosition.x - sin(rotation) * alignedPosition.y;\n  rotatedPosition.y = sin(rotation) * alignedPosition.x + cos(rotation) * alignedPosition.y;\n\n  mvPosition.xy += rotatedPosition;\n  return pm * mvPosition;\n}\n\nlayout(location = POSITION) in vec3 a_Position;\nlayout(location = PACKED_STYLE3) in vec4 a_StylePacked3;\n\n#ifdef USE_UV\n  layout(location = UV) in vec2 a_Uv;\n  out vec2 v_Uv;\n#endif\n\nvoid main() {\n  vec4 a_Color = decode_color(a_PackedColor.xy);\nvec4 a_StrokeColor = decode_color(a_PackedColor.zw);\n\nmat4 u_ModelMatrix = mat4(a_ModelMatrix0, a_ModelMatrix1, a_ModelMatrix2, a_ModelMatrix3);\nvec4 u_StrokeColor = a_StrokeColor;\nfloat u_Opacity = a_StylePacked1.x;\nfloat u_FillOpacity = a_StylePacked1.y;\nfloat u_StrokeOpacity = a_StylePacked1.z;\nfloat u_StrokeWidth = a_StylePacked1.w;\nfloat u_ZIndex = a_PickingColor.w;\nvec2 u_Anchor = a_StylePacked2.yz;\nfloat u_IncreasedLineWidthForHitTesting = a_StylePacked2.w;\n\nsetPickingColor(a_PickingColor.xyz);\n\nv_Color = a_Color;\nv_StrokeColor = a_StrokeColor;\nv_StylePacked1 = a_StylePacked1;\nv_StylePacked2 = a_StylePacked2;\n\n// #ifdef CLIPSPACE_NEAR_ZERO\n//     gl_Position.z = (gl_Position.z + gl_Position.w) * 0.5;\n// #endif\n  #ifdef USE_UV\n  v_Uv = a_Uv;\n#endif\n\n  bool isBillboard = a_StylePacked3.x > 0.5;\n  if (isBillboard) {\n    float rotation = a_StylePacked3.y;\n    bool isSizeAttenuation = a_StylePacked3.z > 0.5;\n    gl_Position = billboard(a_Position.xy, rotation, isSizeAttenuation, u_ProjectionMatrix, u_ViewMatrix, u_ModelMatrix);\n  } else {\n    gl_Position = project(vec4(a_Position.xy, u_ZIndex, 1.0), u_ProjectionMatrix, u_ViewMatrix, u_ModelMatrix);\n  }\n}"; // eslint-disable-line

var frag$2 = "#define GLSLIFY 1\nlayout(std140) uniform ub_SceneParams {\n  mat4 u_ProjectionMatrix;\n  mat4 u_ViewMatrix;\n  vec3 u_CameraPosition;\n  float u_DevicePixelRatio;\n  vec2 u_Viewport;\n  float u_IsOrtho;\n  float u_IsPicking;\n};\n\nin vec4 v_PickingResult;\nin vec4 v_Color;\nin vec4 v_StrokeColor;\nin vec4 v_StylePacked1;\nin vec4 v_StylePacked2;\n#ifdef USE_UV\n  in vec2 v_Uv;\n#endif\n#ifdef USE_MAP\n  uniform sampler2D u_Map;\n#endif\n\nin vec4 v_Dash;\n\nin vec4 v_Distance;\nin vec4 v_Arc;\nin float v_Type;\nin float v_Travel;\nin float v_ScalingFactor;\n\nout vec4 outputColor;\nfloat epsilon = 0.000001;\n\nvoid main(){\n  vec4 u_Color = v_Color;\nvec4 u_StrokeColor = v_StrokeColor;\nfloat u_Opacity = v_StylePacked1.x;\nfloat u_FillOpacity = v_StylePacked1.y;\nfloat u_StrokeOpacity = v_StylePacked1.z;\nfloat u_StrokeWidth = v_StylePacked1.w;\nfloat u_Visible = v_StylePacked2.x;\nvec3 u_PickingColor = v_PickingResult.xyz;\n\nif (u_Visible < 0.5) {\n    discard;\n}\n  #ifdef USE_MAP\n  #ifdef USE_PATTERN\n    vec4 texelColor = texture(SAMPLER_2D(u_Map), v_Uv);\n    u_Color = texelColor;\n  #else\n    vec4 texelColor = texture(SAMPLER_2D(u_Map), v_Uv);\n    u_Color = texelColor;\n  #endif\n#endif\n\n  float alpha = 1.0;\n  float lineWidth = v_Distance.w;\n  if (v_Type < 0.5) {\n    float left = max(v_Distance.x - 0.5, -v_Distance.w);\n    float right = min(v_Distance.x + 0.5, v_Distance.w);\n    float near = v_Distance.y - 0.5;\n    float far = min(v_Distance.y + 0.5, 0.0);\n    float top = v_Distance.z - 0.5;\n    float bottom = min(v_Distance.z + 0.5, 0.0);\n    alpha = max(right - left, 0.0) * max(bottom - top, 0.0) * max(far - near, 0.0);\n  } else if (v_Type < 1.5) {\n    float a1 = clamp(v_Distance.x + 0.5 - lineWidth, 0.0, 1.0);\n    float a2 = clamp(v_Distance.x + 0.5 + lineWidth, 0.0, 1.0);\n    float b1 = clamp(v_Distance.y + 0.5 - lineWidth, 0.0, 1.0);\n    float b2 = clamp(v_Distance.y + 0.5 + lineWidth, 0.0, 1.0);\n    alpha = a2 * b2 - a1 * b1;\n  } else if (v_Type < 2.5) {\n    alpha *= max(min(v_Distance.x + 0.5, 1.0), 0.0);\n    alpha *= max(min(v_Distance.y + 0.5, 1.0), 0.0);\n    alpha *= max(min(v_Distance.z + 0.5, 1.0), 0.0);\n  } else if (v_Type < 3.5) {\n    float a1 = clamp(v_Distance.x + 0.5 - lineWidth, 0.0, 1.0);\n    float a2 = clamp(v_Distance.x + 0.5 + lineWidth, 0.0, 1.0);\n    float b1 = clamp(v_Distance.y + 0.5 - lineWidth, 0.0, 1.0);\n    float b2 = clamp(v_Distance.y + 0.5 + lineWidth, 0.0, 1.0);\n    float alpha_miter = a2 * b2 - a1 * b1;\n    float alpha_plane = max(min(v_Distance.z + 0.5, 1.0), 0.0);\n    float d = length(v_Arc.xy);\n    float circle_hor = max(min(v_Arc.w, d + 0.5) - max(-v_Arc.w, d - 0.5), 0.0);\n    float circle_vert = min(v_Arc.w * 2.0, 1.0);\n    float alpha_circle = circle_hor * circle_vert;\n    alpha = min(alpha_miter, max(alpha_circle, alpha_plane));\n  } else {\n    float a1 = clamp(v_Distance.x + 0.5 - lineWidth, 0.0, 1.0);\n    float a2 = clamp(v_Distance.x + 0.5 + lineWidth, 0.0, 1.0);\n    float b1 = clamp(v_Distance.y + 0.5 - lineWidth, 0.0, 1.0);\n    float b2 = clamp(v_Distance.y + 0.5 + lineWidth, 0.0, 1.0);\n    alpha = a2 * b2 - a1 * b1;\n    alpha *= max(min(v_Distance.z + 0.5, 1.0), 0.0);\n  }\n\n  float u_Dash = v_Dash.x;\n  float u_Gap = v_Dash.y;\n  float u_DashOffset = v_Dash.z;\n  if (u_Dash + u_Gap > 1.0) {\n    float travel = mod(v_Travel + u_Gap * v_ScalingFactor * 0.5 + u_DashOffset, u_Dash * v_ScalingFactor + u_Gap * v_ScalingFactor) - (u_Gap * v_ScalingFactor * 0.5);\n    float left = max(travel - 0.5, -0.5);\n    float right = min(travel + 0.5, u_Gap * v_ScalingFactor + 0.5);\n    alpha *= max(0.0, right - left);\n  }\n\n  if (u_IsPicking > 0.5) {\n    vec3 pickingColor = u_PickingColor;\n    if (pickingColor.x == 0.0 && pickingColor.y == 0.0 && pickingColor.z == 0.0) {\n      discard;\n    }\n    outputColor = vec4(pickingColor, 1.0);\n  } else {\n    outputColor = u_StrokeColor;\n    #ifdef USE_MAP\n      outputColor = u_Color;\n    #endif\n\n    outputColor.a *= alpha * u_Opacity * u_StrokeOpacity;\n    if (outputColor.a < epsilon) {\n      discard;\n    }\n  }\n}"; // eslint-disable-line

var vert$2 = "#define GLSLIFY 1\nlayout(std140) uniform ub_SceneParams {\n  mat4 u_ProjectionMatrix;\n  mat4 u_ViewMatrix;\n  vec3 u_CameraPosition;\n  float u_DevicePixelRatio;\n  vec2 u_Viewport;\n  float u_IsOrtho;\n  float u_IsPicking;\n};\n\nlayout(location = MODEL_MATRIX0) in vec4 a_ModelMatrix0;\nlayout(location = MODEL_MATRIX1) in vec4 a_ModelMatrix1;\nlayout(location = MODEL_MATRIX2) in vec4 a_ModelMatrix2;\nlayout(location = MODEL_MATRIX3) in vec4 a_ModelMatrix3;\nlayout(location = PACKED_COLOR) in vec4 a_PackedColor;\nlayout(location = PACKED_STYLE1) in vec4 a_StylePacked1;\nlayout(location = PACKED_STYLE2) in vec4 a_StylePacked2;\nlayout(location = PICKING_COLOR) in vec4 a_PickingColor;\n\nout vec4 v_PickingResult;\nout vec4 v_Color;\nout vec4 v_StrokeColor;\nout vec4 v_StylePacked1;\nout vec4 v_StylePacked2;\n\n#define COLOR_SCALE 1. / 255.\nvoid setPickingColor(vec3 pickingColor) {\n  v_PickingResult.rgb = pickingColor * COLOR_SCALE;\n}\n\nvec2 unpack_float(const float packedValue) {\n  int packedIntValue = int(packedValue);\n  int v0 = packedIntValue / 256;\n  return vec2(v0, packedIntValue - v0 * 256);\n}\nvec4 decode_color(const vec2 encodedColor) {\n  return vec4(\n    unpack_float(encodedColor[0]) / 255.0,\n    unpack_float(encodedColor[1]) / 255.0\n  );\n}\nvec4 project(vec4 pos, mat4 pm, mat4 vm, mat4 mm) {\n  return pm * vm * mm * pos;\n}\n\nbool isPerspectiveMatrix(mat4 m) {\n  return m[2][3] == -1.0;\n}\n\nvec4 billboard(vec2 offset, float rotation, bool isSizeAttenuation, mat4 pm, mat4 vm, mat4 mm) {\n  vec4 mvPosition = vm * mm * vec4(0.0, 0.0, 0.0, 1.0);\n  vec2 scale;\n  scale.x = length(vec3(mm[0][0], mm[0][1], mm[0][2]));\n  scale.y = length(vec3(mm[1][0], mm[1][1], mm[1][2]));\n\n  if (isSizeAttenuation) {\n    bool isPerspective = isPerspectiveMatrix(pm);\n    if (isPerspective) {\n      scale *= -mvPosition.z / 250.0;\n    }\n  }\n\n  vec2 alignedPosition = offset * scale;\n  vec2 rotatedPosition;\n  rotatedPosition.x = cos(rotation) * alignedPosition.x - sin(rotation) * alignedPosition.y;\n  rotatedPosition.y = sin(rotation) * alignedPosition.x + cos(rotation) * alignedPosition.y;\n\n  mvPosition.xy += rotatedPosition;\n  return pm * mvPosition;\n}\n\nlayout(location = PREV) in vec3 a_Prev;\nlayout(location = POINT1) in vec3 a_Point1;\nlayout(location = POINT2) in vec3 a_Point2;\nlayout(location = NEXT) in vec3 a_Next;\nlayout(location = VERTEX_JOINT) in float a_VertexJoint;\nlayout(location = VERTEX_NUM) in float a_VertexNum;\nlayout(location = TRAVEL) in float a_Travel;\n#ifdef USE_UV\n  layout(location = UV) in vec2 a_Uv;\n  out vec2 v_Uv;\n#endif\nlayout(location = DASH) in vec4 a_Dash;\nout vec4 v_Dash;\n\nconst float FILL = 1.0;\nconst float BEVEL = 4.0;\nconst float MITER = 8.0;\nconst float ROUND = 12.0;\nconst float JOINT_CAP_BUTT = 16.0;\nconst float JOINT_CAP_SQUARE = 18.0;\nconst float JOINT_CAP_ROUND = 20.0;\nconst float FILL_EXPAND = 24.0;\nconst float CAP_BUTT = 1.0;\nconst float CAP_SQUARE = 2.0;\nconst float CAP_ROUND = 3.0;\nconst float CAP_BUTT2 = 4.0;\n\nconst float u_Expand = 1.0;\nconst float u_MiterLimit = 5.0;\nconst float u_ScaleMode = 1.0;\nconst float u_Alignment = 0.5;\n\nout vec4 v_Distance;\nout vec4 v_Arc;\nout float v_Type;\nout float v_Travel;\nout float v_ScalingFactor;\n\nvec2 doBisect(\n  vec2 norm, float len, vec2 norm2, float len2, float dy, float inner\n) {\n  vec2 bisect = (norm + norm2) / 2.0;\n  bisect /= dot(norm, bisect);\n  vec2 shift = dy * bisect;\n  if (inner > 0.5) {\n    if (len < len2) {\n      if (abs(dy * (bisect.x * norm.y - bisect.y * norm.x)) > len) {\n        return dy * norm;\n      }\n    } else {\n      if (abs(dy * (bisect.x * norm2.y - bisect.y * norm2.x)) > len2) {\n        return dy * norm;\n      }\n    }\n  }\n  return dy * bisect;\n}\n\nvec2 clip2ScreenSpace(vec4 clip) {\n  return u_Viewport * (0.5 * clip.xy / clip.w + 0.5);\n}\n\nvoid main() {\n  vec4 a_Color = decode_color(a_PackedColor.xy);\nvec4 a_StrokeColor = decode_color(a_PackedColor.zw);\n\nmat4 u_ModelMatrix = mat4(a_ModelMatrix0, a_ModelMatrix1, a_ModelMatrix2, a_ModelMatrix3);\nvec4 u_StrokeColor = a_StrokeColor;\nfloat u_Opacity = a_StylePacked1.x;\nfloat u_FillOpacity = a_StylePacked1.y;\nfloat u_StrokeOpacity = a_StylePacked1.z;\nfloat u_StrokeWidth = a_StylePacked1.w;\nfloat u_ZIndex = a_PickingColor.w;\nvec2 u_Anchor = a_StylePacked2.yz;\nfloat u_IncreasedLineWidthForHitTesting = a_StylePacked2.w;\n\nsetPickingColor(a_PickingColor.xyz);\n\nv_Color = a_Color;\nv_StrokeColor = a_StrokeColor;\nv_StylePacked1 = a_StylePacked1;\nv_StylePacked2 = a_StylePacked2;\n\n// #ifdef CLIPSPACE_NEAR_ZERO\n//     gl_Position.z = (gl_Position.z + gl_Position.w) * 0.5;\n// #endif\n  #ifdef USE_UV\n  v_Uv = a_Uv;\n#endif\n\n  v_Dash = a_Dash;\n\n  vec2 pointA;\n  vec2 pointB;\n  vec4 clip0;\n  vec4 clip1;\n\n  float compressed = a_Dash.w;\n  float is_billboard = floor(compressed / 4.0);\n  compressed -= is_billboard * 4.0;\n  float is_size_attenuation = floor(compressed / 2.0);\n  compressed -= is_size_attenuation * 2.0;\n  float is_3d_polyline = compressed;\n\n  bool isBillboard = is_billboard > 0.5;\n  bool isSizeAttenuation = is_size_attenuation > 0.5;\n  bool is3DPolyline = is_3d_polyline > 0.5;\n  if (isBillboard) {\n    clip0 = billboard(a_Point1.xy, 0.0, isSizeAttenuation, u_ProjectionMatrix, u_ViewMatrix, u_ModelMatrix);\n    clip1 = billboard(a_Point2.xy, 0.0, isSizeAttenuation, u_ProjectionMatrix, u_ViewMatrix, u_ModelMatrix);\n  } else if (is3DPolyline) {\n    clip0 = project(vec4(a_Point1, 1.0), u_ProjectionMatrix, u_ViewMatrix, u_ModelMatrix);\n    clip1 = project(vec4(a_Point2, 1.0), u_ProjectionMatrix, u_ViewMatrix, u_ModelMatrix);\n  }\n\n  if (isBillboard || is3DPolyline) {\n    pointA = clip2ScreenSpace(clip0);\n    pointB = clip2ScreenSpace(clip1);\n  } else {\n    pointA = (u_ModelMatrix * vec4(a_Point1, 1.0)).xy;\n    pointB = (u_ModelMatrix * vec4(a_Point2, 1.0)).xy;\n  }\n\n  vec2 xBasis = pointB - pointA;\n  float len = length(xBasis);\n  vec2 forward = xBasis / len;\n  vec2 norm = vec2(forward.y, -forward.x);\n\n  float type = a_VertexJoint;\n\n  float lineWidth;\n  if (u_IsPicking > 0.5) {\n    lineWidth = u_IncreasedLineWidthForHitTesting + u_StrokeWidth;\n  } else {\n    lineWidth = u_StrokeWidth;\n  }\n\n  if (u_ScaleMode > 2.5) {\n    lineWidth *= length(u_ModelMatrix * vec4(1.0, 0.0, 0.0, 0.0));\n  } else if (u_ScaleMode > 1.5) {\n    lineWidth *= length(u_ModelMatrix * vec4(0.0, 1.0, 0.0, 0.0));\n  } else if (u_ScaleMode > 0.5) {\n    vec2 avgDiag = (u_ModelMatrix * vec4(1.0, 1.0, 0.0, 0.0)).xy;\n    lineWidth *= sqrt(dot(avgDiag, avgDiag) * 0.5);\n  }\n  float capType = floor(type / 32.0);\n  type -= capType * 32.0;\n  v_Arc = vec4(0.0);\n  lineWidth *= 0.5;\n  float lineAlignment = 2.0 * u_Alignment - 1.0;\n\n  vec2 pos;\n\n  if (capType == CAP_ROUND) {\n    if (a_VertexNum < 3.5) {\n      gl_Position = vec4(0.0, 0.0, 0.0, 1.0);\n      return;\n    }\n    type = JOINT_CAP_ROUND;\n    capType = 0.0;\n  }\n\n  if (type >= BEVEL) {\n    float dy = lineWidth + u_Expand;\n    float inner = 0.0;\n    if (a_VertexNum >= 1.5) {\n      dy = -dy;\n      inner = 1.0;\n    }\n\n    vec2 base, next, xBasis2, bisect;\n    float flag = 0.0;\n    float sign2 = 1.0;\n    if (a_VertexNum < 0.5 || a_VertexNum > 2.5 && a_VertexNum < 3.5) {\n      if (isBillboard) {\n        next = clip2ScreenSpace(billboard(a_Prev.xy, 0.0, isSizeAttenuation, u_ProjectionMatrix, u_ViewMatrix, u_ModelMatrix));\n      } else if (is3DPolyline) {\n        next = clip2ScreenSpace(project(vec4(a_Prev, 1.0), u_ProjectionMatrix, u_ViewMatrix, u_ModelMatrix));\n      } else {\n        next = (u_ModelMatrix * vec4(a_Prev, 1.0)).xy;\n      }\n\n      base = pointA;\n      flag = type - floor(type / 2.0) * 2.0;\n      sign2 = -1.0;\n    } else {\n      if (isBillboard) {\n        next = clip2ScreenSpace(billboard(a_Next.xy, 0.0, isSizeAttenuation, u_ProjectionMatrix, u_ViewMatrix, u_ModelMatrix));\n      } else if (is3DPolyline) {\n        next = clip2ScreenSpace(project(vec4(a_Next, 1.0), u_ProjectionMatrix, u_ViewMatrix, u_ModelMatrix));\n      } else {\n        next = (u_ModelMatrix * vec4(a_Next, 1.0)).xy;\n      }\n      \n      base = pointB;\n      if (type >= MITER && type < MITER + 3.5) {\n        flag = step(MITER + 1.5, type);\n        // check miter limit here?\n      }\n    }\n    xBasis2 = next - base;\n    float len2 = length(xBasis2);\n    vec2 norm2 = vec2(xBasis2.y, -xBasis2.x) / len2;\n    float D = norm.x * norm2.y - norm.y * norm2.x;\n    if (D < 0.0) {\n      inner = 1.0 - inner;\n    }\n    norm2 *= sign2;\n\n    if (abs(lineAlignment) > 0.01) {\n      float shift = lineWidth * lineAlignment;\n      pointA += norm * shift;\n      pointB += norm * shift;\n      if (abs(D) < 0.01) {\n        base += norm * shift;\n      } else {\n        base += doBisect(norm, len, norm2, len2, shift, 0.0);\n      }\n    }\n\n    float collinear = step(0.0, dot(norm, norm2));\n    v_Type = 0.0;\n    float dy2 = -1000.0;\n    float dy3 = -1000.0;\n    if (abs(D) < 0.01 && collinear < 0.5) {\n      if (type >= ROUND && type < ROUND + 1.5) {\n        type = JOINT_CAP_ROUND;\n      }\n      // TODO: BUTT here too\n    }\n\n    if (a_VertexNum < 3.5) {\n      if (abs(D) < 0.01) {\n        pos = dy * norm;\n      } else {\n        if (flag < 0.5 && inner < 0.5) {\n          pos = dy * norm;\n        } else {\n          pos = doBisect(norm, len, norm2, len2, dy, inner);\n        }\n      }\n      if (capType >= CAP_BUTT && capType < CAP_ROUND) {\n        float extra = step(CAP_SQUARE, capType) * lineWidth;\n        vec2 back = -forward;\n        if (a_VertexNum < 0.5 || a_VertexNum > 2.5) {\n          pos += back * (u_Expand + extra);\n          dy2 = u_Expand;\n        } else {\n          dy2 = dot(pos + base - pointA, back) - extra;\n        }\n      }\n      if (type >= JOINT_CAP_BUTT && type < JOINT_CAP_SQUARE + 0.5) {\n        float extra = step(JOINT_CAP_SQUARE, type) * lineWidth;\n        if (a_VertexNum < 0.5 || a_VertexNum > 2.5) {\n          dy3 = dot(pos + base - pointB, forward) - extra;\n        } else {\n          pos += forward * (u_Expand + extra);\n          dy3 = u_Expand;\n          if (capType >= CAP_BUTT) {\n            dy2 -= u_Expand + extra;\n          }\n        }\n      }\n    } else if (type >= JOINT_CAP_ROUND && type < JOINT_CAP_ROUND + 1.5) {\n      if (inner > 0.5) {\n        dy = -dy;\n        inner = 0.0;\n      }\n      vec2 d2 = abs(dy) * forward;\n      if (a_VertexNum < 4.5) {\n        dy = -dy;\n        pos = dy * norm;\n      } else if (a_VertexNum < 5.5) {\n        pos = dy * norm;\n      } else if (a_VertexNum < 6.5) {\n        pos = dy * norm + d2;\n        v_Arc.x = abs(dy);\n      } else {\n        dy = -dy;\n        pos = dy * norm + d2;\n        v_Arc.x = abs(dy);\n      }\n      dy2 = 0.0;\n      v_Arc.y = dy;\n      v_Arc.z = 0.0;\n      v_Arc.w = lineWidth;\n      v_Type = 3.0;\n    } else if (abs(D) < 0.01) {\n      pos = dy * norm;\n    } else {\n      if (type >= ROUND && type < ROUND + 1.5) {\n        if (inner > 0.5) {\n          dy = -dy;\n          inner = 0.0;\n        }\n        if (a_VertexNum < 4.5) {\n          pos = doBisect(norm, len, norm2, len2, -dy, 1.0);\n        } else if (a_VertexNum < 5.5) {\n          pos = dy * norm;\n        } else if (a_VertexNum > 7.5) {\n          pos = dy * norm2;\n        } else {\n          pos = doBisect(norm, len, norm2, len2, dy, 0.0);\n          float d2 = abs(dy);\n          if (length(pos) > abs(dy) * 1.5) {\n            if (a_VertexNum < 6.5) {\n              pos.x = dy * norm.x - d2 * norm.y;\n              pos.y = dy * norm.y + d2 * norm.x;\n            } else {\n              pos.x = dy * norm2.x + d2 * norm2.y;\n              pos.y = dy * norm2.y - d2 * norm2.x;\n            }\n          }\n        }\n        vec2 norm3 = normalize(norm + norm2);\n        float sign = step(0.0, dy) * 2.0 - 1.0;\n        v_Arc.x = sign * dot(pos, norm3);\n        v_Arc.y = pos.x * norm3.y - pos.y * norm3.x;\n        v_Arc.z = dot(norm, norm3) * lineWidth;\n        v_Arc.w = lineWidth;\n        dy = -sign * dot(pos, norm);\n        dy2 = -sign * dot(pos, norm2);\n        dy3 = v_Arc.z - v_Arc.x;\n        v_Type = 3.0;\n      } else {\n        float hit = 0.0;\n        if (type >= BEVEL && type < BEVEL + 1.5) {\n          if (dot(norm, norm2) > 0.0) {\n            type = MITER;\n          }\n        }\n        if (type >= MITER && type < MITER + 3.5) {\n          if (inner > 0.5) {\n            dy = -dy;\n            inner = 0.0;\n          }\n          float sign = step(0.0, dy) * 2.0 - 1.0;\n          pos = doBisect(norm, len, norm2, len2, dy, 0.0);\n          if (length(pos) > abs(dy) * u_MiterLimit) {\n            type = BEVEL;\n          } else {\n            if (a_VertexNum < 4.5) {\n              dy = -dy;\n              pos = doBisect(norm, len, norm2, len2, dy, 1.0);\n            } else if (a_VertexNum < 5.5) {\n              pos = dy * norm;\n            } else if (a_VertexNum > 6.5) {\n              pos = dy * norm2;\n            }\n            v_Type = 1.0;\n            dy = -sign * dot(pos, norm);\n            dy2 = -sign * dot(pos, norm2);\n            hit = 1.0;\n          }\n        }\n        if (type >= BEVEL && type < BEVEL + 1.5) {\n          if (inner > 0.5) {\n            dy = -dy;\n            inner = 0.0;\n          }\n          float d2 = abs(dy);\n          vec2 pos3 = vec2(dy * norm.x - d2 * norm.y, dy * norm.y + d2 * norm.x);\n          vec2 pos4 = vec2(dy * norm2.x + d2 * norm2.y, dy * norm2.y - d2 * norm2.x);\n          if (a_VertexNum < 4.5) {\n            pos = doBisect(norm, len, norm2, len2, -dy, 1.0);\n          } else if (a_VertexNum < 5.5) {\n            pos = dy * norm;\n          } else if (a_VertexNum > 7.5) {\n            pos = dy * norm2;\n          } else {\n            if (a_VertexNum < 6.5) {\n              pos = pos3;\n            } else {\n              pos = pos4;\n            }\n          }\n          vec2 norm3 = normalize(norm + norm2);\n          float sign = step(0.0, dy) * 2.0 - 1.0;\n          dy = -sign * dot(pos, norm);\n          dy2 = -sign * dot(pos, norm2);\n          dy3 = (-sign * dot(pos, norm3)) + lineWidth;\n          v_Type = 4.0;\n          hit = 1.0;\n        }\n        if (hit < 0.5) {\n          gl_Position = vec4(0.0, 0.0, 0.0, 1.0);\n          return;\n        }\n      }\n    }\n    pos += base;\n    v_Distance = vec4(dy, dy2, dy3, lineWidth) * u_DevicePixelRatio;\n    v_Arc = v_Arc * u_DevicePixelRatio;\n    v_Travel = a_Travel + dot(pos - pointA, vec2(-norm.y, norm.x));\n  }\n\n  v_ScalingFactor = sqrt(u_ModelMatrix[0][0] * u_ModelMatrix[0][0] + u_ModelMatrix[0][1] * u_ModelMatrix[0][1] + u_ModelMatrix[0][2] * u_ModelMatrix[0][2]);\n\n  if (isBillboard || is3DPolyline) {\n    vec4 clip = mix(clip0, clip1, 0.5);\n    gl_Position = vec4(clip.w * (2.0 * pos / u_Viewport - 1.0), clip.z, clip.w);\n  } else {\n    gl_Position = u_ProjectionMatrix * u_ViewMatrix * vec4(pos, u_ZIndex, 1.0);\n  }\n}"; // eslint-disable-line

var SEGMENT_LENGTH = 10;
var MIN_SEGMENT_NUM = 8;
var MAX_SEGMENT_NUM = 100;
function quadCurveTo(cpX, cpY, toX, toY, points, segmentNum) {
    var fromX = points[points.length - 3];
    var fromY = points[points.length - 2];
    var n = segmentNum !== null && segmentNum !== void 0 ? segmentNum : util.clamp(gMath.quadLength(fromX, fromY, cpX, cpY, toX, toY) / SEGMENT_LENGTH, MIN_SEGMENT_NUM, MAX_SEGMENT_NUM);
    var xa = 0;
    var ya = 0;
    for (var i = 1; i <= n; ++i) {
        var j = i / n;
        xa = fromX + (cpX - fromX) * j;
        ya = fromY + (cpY - fromY) * j;
        points.push(xa + (cpX + (toX - cpX) * j - xa) * j, ya + (cpY + (toY - cpY) * j - ya) * j, 0);
    }
}
function bezierCurveTo(cpX, cpY, cpX2, cpY2, toX, toY, points, segmentNum) {
    var fromX = points[points.length - 3];
    var fromY = points[points.length - 2];
    points.length -= 3;
    var n = segmentNum !== null && segmentNum !== void 0 ? segmentNum : util.clamp(gMath.cubicLength(fromX, fromY, cpX, cpY, cpX2, cpY2, toX, toY) /
        SEGMENT_LENGTH, MIN_SEGMENT_NUM, MAX_SEGMENT_NUM);
    var dt = 0;
    var dt2 = 0;
    var dt3 = 0;
    var t2 = 0;
    var t3 = 0;
    points.push(fromX, fromY, 0);
    for (var i = 1, j = 0; i <= n; ++i) {
        j = i / n;
        dt = 1 - j;
        dt2 = dt * dt;
        dt3 = dt2 * dt;
        t2 = j * j;
        t3 = t2 * j;
        points.push(dt3 * fromX + 3 * dt2 * j * cpX + 3 * dt * t2 * cpX2 + t3 * toX, dt3 * fromY + 3 * dt2 * j * cpY + 3 * dt * t2 * cpY2 + t3 * toY, 0);
    }
}

/**
 * Borrow from https://github.com/mapbox/tiny-sdf
 */
var INF = 1e20;
var TinySDF = /** @class */ (function () {
    function TinySDF(options, runtime) {
        var _a = options.fontSize, fontSize = _a === void 0 ? 24 : _a, _b = options.buffer, buffer = _b === void 0 ? 3 : _b, _c = options.radius, radius = _c === void 0 ? 8 : _c, _d = options.cutoff, cutoff = _d === void 0 ? 0.25 : _d, _e = options.fontFamily, fontFamily = _e === void 0 ? 'sans-serif' : _e, _f = options.fontWeight, fontWeight = _f === void 0 ? 'normal' : _f, _g = options.fontStyle, fontStyle = _g === void 0 ? 'normal' : _g, canvas = options.canvas;
        this.buffer = buffer;
        this.cutoff = cutoff;
        this.radius = radius;
        // make the canvas size big enough to both have the specified buffer around the glyph
        // for "halo", and account for some glyphs possibly being larger than their font size
        var size = (this.size = fontSize + buffer * 4);
        var $offscreenCanvas = runtime.offscreenCanvasCreator.getOrCreateCanvas(canvas);
        // canvas.width = canvas.height = size;
        // $offscreenCanvas.width = width * dpr;
        // $offscreenCanvas.height = height * dpr;
        $offscreenCanvas.width = size;
        $offscreenCanvas.height = size;
        var ctx = runtime.offscreenCanvasCreator.getOrCreateContext(canvas, {
            willReadFrequently: true,
        });
        this.ctx = ctx;
        // const ctx = (this.ctx = canvas.getContext('2d', {
        //   willReadFrequently: true,
        // }));
        ctx.font = "".concat(fontStyle, " ").concat(fontWeight, " ").concat(fontSize, "px ").concat(fontFamily);
        ctx.textBaseline = 'alphabetic';
        ctx.textAlign = 'left'; // Necessary so that RTL text doesn't have different alignment
        ctx.fillStyle = 'black';
        // temporary arrays for the distance transform
        this.gridOuter = new Float64Array(size * size);
        this.gridInner = new Float64Array(size * size);
        this.f = new Float64Array(size);
        this.z = new Float64Array(size + 1);
        this.v = new Uint16Array(size);
    }
    // _createCanvas(size) {
    //   const canvas = document.createElement('canvas');
    //   canvas.width = canvas.height = size;
    //   return canvas;
    // }
    TinySDF.prototype.draw = function (char) {
        var _a = this.ctx.measureText(char), glyphAdvance = _a.width, actualBoundingBoxAscent = _a.actualBoundingBoxAscent, actualBoundingBoxDescent = _a.actualBoundingBoxDescent, actualBoundingBoxLeft = _a.actualBoundingBoxLeft, actualBoundingBoxRight = _a.actualBoundingBoxRight;
        // The integer/pixel part of the top alignment is encoded in metrics.glyphTop
        // The remainder is implicitly encoded in the rasterization
        var glyphTop = Math.ceil(actualBoundingBoxAscent);
        var glyphLeft = 0;
        // If the glyph overflows the canvas size, it will be clipped at the bottom/right
        var glyphWidth = Math.max(0, Math.min(this.size - this.buffer, Math.ceil(actualBoundingBoxRight - actualBoundingBoxLeft)));
        var glyphHeight = Math.min(this.size - this.buffer, glyphTop + Math.ceil(actualBoundingBoxDescent));
        var width = glyphWidth + 2 * this.buffer;
        var height = glyphHeight + 2 * this.buffer;
        var len = Math.max(width * height, 0);
        var data = new Uint8ClampedArray(len);
        var glyph = {
            data: data,
            width: width,
            height: height,
            glyphWidth: glyphWidth,
            glyphHeight: glyphHeight,
            glyphTop: glyphTop,
            glyphLeft: glyphLeft,
            glyphAdvance: glyphAdvance,
        };
        if (glyphWidth === 0 || glyphHeight === 0)
            return glyph;
        var _b = this, ctx = _b.ctx, buffer = _b.buffer, gridInner = _b.gridInner, gridOuter = _b.gridOuter;
        ctx.clearRect(buffer, buffer, glyphWidth, glyphHeight);
        ctx.fillText(char, buffer, buffer + glyphTop);
        var imgData = ctx.getImageData(buffer, buffer, glyphWidth, glyphHeight);
        // Initialize grids outside the glyph range to alpha 0
        gridOuter.fill(INF, 0, len);
        gridInner.fill(0, 0, len);
        for (var y = 0; y < glyphHeight; y++) {
            for (var x = 0; x < glyphWidth; x++) {
                var a = imgData.data[4 * (y * glyphWidth + x) + 3] / 255; // alpha value
                if (a === 0)
                    continue; // empty pixels
                var j = (y + buffer) * width + x + buffer;
                if (a === 1) {
                    // fully drawn pixels
                    gridOuter[j] = 0;
                    gridInner[j] = INF;
                }
                else {
                    // aliased pixels
                    var d = 0.5 - a;
                    gridOuter[j] = d > 0 ? d * d : 0;
                    gridInner[j] = d < 0 ? d * d : 0;
                }
            }
        }
        edt(gridOuter, 0, 0, width, height, width, this.f, this.v, this.z);
        edt(gridInner, buffer, buffer, glyphWidth, glyphHeight, width, this.f, this.v, this.z);
        for (var i = 0; i < len; i++) {
            var d = Math.sqrt(gridOuter[i]) - Math.sqrt(gridInner[i]);
            data[i] = Math.round(255 - 255 * (d / this.radius + this.cutoff));
        }
        return glyph;
    };
    return TinySDF;
}());
// 2D Euclidean squared distance transform by Felzenszwalb & Huttenlocher https://cs.brown.edu/~pff/papers/dt-final.pdf
function edt(data, x0, y0, width, height, gridSize, f, v, z) {
    for (var x = x0; x < x0 + width; x++)
        edt1d(data, y0 * gridSize + x, gridSize, height, f, v, z);
    for (var y = y0; y < y0 + height; y++)
        edt1d(data, y * gridSize + x0, 1, width, f, v, z);
}
// 1D squared distance transform
function edt1d(grid, offset, stride, length, f, v, z) {
    v[0] = 0;
    z[0] = -INF;
    z[1] = INF;
    f[0] = grid[offset];
    for (var q = 1, k = 0, s = 0; q < length; q++) {
        f[q] = grid[offset + q * stride];
        var q2 = q * q;
        do {
            var r = v[k];
            s = (f[q] - f[r] + q2 - r * r) / (q - r) / 2;
        } while (s <= z[k] && --k > -1);
        k++;
        v[k] = q;
        z[k] = s;
        z[k + 1] = INF;
    }
    for (var q = 0, k = 0; q < length; q++) {
        while (z[k + 1] < q)
            k++;
        var r = v[k];
        var qr = q - r;
        grid[offset + q * stride] = f[r] + qr * qr;
    }
}

var LineVertexAttributeBufferIndex;
(function (LineVertexAttributeBufferIndex) {
    LineVertexAttributeBufferIndex[LineVertexAttributeBufferIndex["PACKED"] = 5] = "PACKED";
    LineVertexAttributeBufferIndex[LineVertexAttributeBufferIndex["VERTEX_NUM"] = 6] = "VERTEX_NUM";
    LineVertexAttributeBufferIndex[LineVertexAttributeBufferIndex["TRAVEL"] = 7] = "TRAVEL";
    LineVertexAttributeBufferIndex[LineVertexAttributeBufferIndex["DASH"] = 8] = "DASH";
})(LineVertexAttributeBufferIndex || (LineVertexAttributeBufferIndex = {}));
var LineVertexAttributeLocation;
(function (LineVertexAttributeLocation) {
    LineVertexAttributeLocation[LineVertexAttributeLocation["PREV"] = 8] = "PREV";
    LineVertexAttributeLocation[LineVertexAttributeLocation["POINT1"] = 9] = "POINT1";
    LineVertexAttributeLocation[LineVertexAttributeLocation["POINT2"] = 10] = "POINT2";
    LineVertexAttributeLocation[LineVertexAttributeLocation["NEXT"] = 11] = "NEXT";
    LineVertexAttributeLocation[LineVertexAttributeLocation["VERTEX_JOINT"] = 12] = "VERTEX_JOINT";
    LineVertexAttributeLocation[LineVertexAttributeLocation["VERTEX_NUM"] = 13] = "VERTEX_NUM";
    LineVertexAttributeLocation[LineVertexAttributeLocation["TRAVEL"] = 14] = "TRAVEL";
    LineVertexAttributeLocation[LineVertexAttributeLocation["DASH"] = 15] = "DASH";
})(LineVertexAttributeLocation || (LineVertexAttributeLocation = {}));
var SEGMENT_NUM$1 = 12;
function packBoolean(a, b, c) {
    return (a ? 1 : 0) * 4 + (b ? 1 : 0) * 2 + (c ? 1 : 0);
}
function is3DPolyline(object) {
    var isPolyline = object.nodeName === gLite.Shape.POLYLINE;
    if (!isPolyline) {
        return false;
    }
    // Polyline supports 3 dimensions so that each point is shaped like [x, y, z].
    var polylineControlPoints = object.parsedStyle.points.points;
    var length = polylineControlPoints.length;
    return length && !util.isNil(polylineControlPoints[0][2]);
}
/**
 * Used for Curve only contains 2 commands, e.g. [[M], [C | Q | A]]
 */
var InstancedPathDrawcall = /** @class */ (function (_super) {
    tslib.__extends(InstancedPathDrawcall, _super);
    function InstancedPathDrawcall(renderHelper, texturePool, lightPool, object, drawcallCtors, index, context) {
        var _this = _super.call(this, renderHelper, texturePool, lightPool, object, drawcallCtors, index, context) || this;
        _this.renderHelper = renderHelper;
        _this.texturePool = texturePool;
        _this.lightPool = lightPool;
        _this.mergeAnchorIntoModelMatrix = true;
        _this.segmentNum = -1;
        _this.segmentNum = _this.calcSegmentNum(object);
        _this.gradientAttributeName = 'stroke';
        return _this;
    }
    InstancedPathDrawcall.calcSubpathNum = function (object) {
        if (object.nodeName === gLite.Shape.PATH) {
            var absolutePath = object.parsedStyle.path.absolutePath;
            return absolutePath.filter(function (d) { return d[0] === 'M'; }).length;
        }
        return 1;
    };
    InstancedPathDrawcall.prototype.calcSegmentNum = function (object) {
        // FIXME: only need to collect instanced count
        var instancedCount = updateBuffer(object, false, SEGMENT_NUM$1, this.calcSubpathIndex(object)).instancedCount;
        return instancedCount;
    };
    InstancedPathDrawcall.prototype.calcSubpathIndex = function (object) {
        if (object.nodeName === gLite.Shape.PATH) {
            var fillDrawcallCount = this.drawcallCtors.filter(function (ctor) { return ctor === InstancedFillDrawcall; }).length;
            return this.index - fillDrawcallCount;
        }
        return 0;
    };
    /**
     * Paths with the same number of vertices should be merged.
     */
    InstancedPathDrawcall.prototype.shouldMerge = function (object, index) {
        var shouldMerge = _super.prototype.shouldMerge.call(this, object, index);
        if (!shouldMerge) {
            return false;
        }
        if (this.index !== index) {
            return false;
        }
        var segmentNum = this.calcSegmentNum(object);
        return this.segmentNum === segmentNum;
    };
    InstancedPathDrawcall.prototype.createMaterial = function (objects) {
        this.material.vertexShader = vert$2;
        this.material.fragmentShader = frag$2;
        this.material.defines = tslib.__assign(tslib.__assign({}, this.material.defines), enumToObject(LineVertexAttributeLocation));
    };
    InstancedPathDrawcall.prototype.createGeometry = function (objects) {
        var _this = this;
        var indices = [];
        var pointsBuffer = [];
        var travelBuffer = [];
        var packedDash = [];
        var instancedCount = 0;
        var offset = 0;
        objects.forEach(function (object) {
            var _a = updateBuffer(object, false, SEGMENT_NUM$1, _this.calcSubpathIndex(object)), pBuffer = _a.pointsBuffer, tBuffer = _a.travelBuffer, count = _a.instancedCount;
            var _b = object.parsedStyle, lineDash = _b.lineDash, lineDashOffset = _b.lineDashOffset, isBillboard = _b.isBillboard, isSizeAttenuation = _b.isSizeAttenuation;
            packedDash.push((lineDash && lineDash[0]) || 0, // DASH
            (lineDash && lineDash[1]) || 0, // GAP
            lineDashOffset || 0, packBoolean(isBillboard, isSizeAttenuation, is3DPolyline(object)));
            instancedCount += count;
            // Can't use interleaved buffer here, we should spread them like:
            // | prev - pointA - pointB - next |. This will allocate ~4x buffer memory space.
            for (var i = 0; i < pBuffer.length - 3 * 4; i += 4) {
                pointsBuffer.push(pBuffer[i], pBuffer[i + 1], pBuffer[i + 2], pBuffer[i + 3], pBuffer[i + 4], pBuffer[i + 5], pBuffer[i + 6], pBuffer[i + 7], pBuffer[i + 8], pBuffer[i + 9], pBuffer[i + 10], pBuffer[i + 11], pBuffer[i + 12], pBuffer[i + 13], pBuffer[i + 14], pBuffer[i + 15]);
            }
            travelBuffer.push.apply(travelBuffer, tslib.__spreadArray([], tslib.__read(tBuffer), false));
            indices.push(0 + offset, 2 + offset, 1 + offset, 0 + offset, 3 + offset, 2 + offset, 4 + offset, 6 + offset, 5 + offset, 4 + offset, 7 + offset, 6 + offset, 4 + offset, 7 + offset, 8 + offset);
            offset += 9;
        });
        if (pointsBuffer.length) {
            this.geometry.setVertexBuffer({
                bufferIndex: LineVertexAttributeBufferIndex.PACKED,
                byteStride: 4 * (4 + 4 + 4 + 4),
                stepMode: gDeviceApi.VertexStepMode.INSTANCE,
                attributes: [
                    {
                        format: gDeviceApi.Format.F32_RGB,
                        bufferByteOffset: 4 * 0,
                        location: LineVertexAttributeLocation.PREV,
                        divisor: 1,
                    },
                    {
                        format: gDeviceApi.Format.F32_RGB,
                        bufferByteOffset: 4 * 4,
                        location: LineVertexAttributeLocation.POINT1,
                        divisor: 1,
                    },
                    {
                        format: gDeviceApi.Format.F32_R,
                        bufferByteOffset: 4 * 7,
                        location: LineVertexAttributeLocation.VERTEX_JOINT,
                        divisor: 1,
                    },
                    {
                        format: gDeviceApi.Format.F32_RGB,
                        bufferByteOffset: 4 * 8,
                        location: LineVertexAttributeLocation.POINT2,
                        divisor: 1,
                    },
                    {
                        format: gDeviceApi.Format.F32_RGB,
                        bufferByteOffset: 4 * 12,
                        location: LineVertexAttributeLocation.NEXT,
                        divisor: 1,
                    },
                ],
                data: new Float32Array(pointsBuffer),
            });
            this.geometry.setVertexBuffer({
                bufferIndex: LineVertexAttributeBufferIndex.VERTEX_NUM,
                byteStride: 4 * 1,
                stepMode: gDeviceApi.VertexStepMode.INSTANCE,
                attributes: [
                    {
                        format: gDeviceApi.Format.F32_R,
                        bufferByteOffset: 4 * 0,
                        byteStride: 4 * 1,
                        location: LineVertexAttributeLocation.VERTEX_NUM,
                        divisor: 0,
                    },
                ],
                data: new Float32Array([0, 1, 2, 3, 4, 5, 6, 7, 8]),
            });
            this.geometry.setVertexBuffer({
                bufferIndex: LineVertexAttributeBufferIndex.TRAVEL,
                byteStride: 4 * 1,
                stepMode: gDeviceApi.VertexStepMode.INSTANCE,
                attributes: [
                    {
                        format: gDeviceApi.Format.F32_R,
                        bufferByteOffset: 4 * 0,
                        byteStride: 4 * 1,
                        location: LineVertexAttributeLocation.TRAVEL,
                        divisor: 1,
                    },
                ],
                data: new Float32Array(travelBuffer),
            });
            // this attribute only changes for each n instance
            this.divisor = instancedCount / objects.length;
            this.geometry.setVertexBuffer({
                bufferIndex: LineVertexAttributeBufferIndex.DASH,
                byteStride: 4 * 4,
                stepMode: gDeviceApi.VertexStepMode.INSTANCE,
                attributes: [
                    {
                        format: gDeviceApi.Format.F32_RGBA,
                        bufferByteOffset: 4 * 0,
                        location: LineVertexAttributeLocation.DASH,
                        divisor: this.divisor,
                    },
                ],
                data: new Float32Array(packedDash),
            });
            // use default common attributes
            _super.prototype.createGeometry.call(this, objects);
            this.geometry.vertexCount = 15;
            this.geometry.instancedCount = instancedCount;
            this.geometry.setIndexBuffer(new Uint32Array(indices));
        }
    };
    InstancedPathDrawcall.prototype.updateAttribute = function (objects, startIndex, name, value) {
        var _this = this;
        _super.prototype.updateAttribute.call(this, objects, startIndex, name, value);
        this.updateBatchedAttribute(objects, startIndex, name, value);
        if (name === 'r' ||
            name === 'rx' ||
            name === 'ry' ||
            name === 'width' ||
            name === 'height' ||
            name === 'radius' ||
            name === 'x1' ||
            name === 'y1' ||
            name === 'x2' ||
            name === 'y2' ||
            name === 'points' ||
            name === 'path' ||
            name === 'lineJoin' ||
            name === 'lineCap' ||
            name === 'markerStartOffset' ||
            name === 'markerEndOffset' ||
            name === 'markerStart' ||
            name === 'markerEnd') {
            var pointsBuffer_1 = [];
            var travelBuffer_1 = [];
            var instancedCount_1 = 0;
            objects.forEach(function (object) {
                var _a = updateBuffer(object, false, SEGMENT_NUM$1, _this.calcSubpathIndex(object)), pBuffer = _a.pointsBuffer, tBuffer = _a.travelBuffer, iCount = _a.instancedCount;
                instancedCount_1 = iCount;
                // Can't use interleaved buffer here, we should spread them like:
                // | prev - pointA - pointB - next |. This will allocate ~4x buffer memory space.
                for (var i = 0; i < pBuffer.length - 3 * 4; i += 4) {
                    pointsBuffer_1.push(pBuffer[i], pBuffer[i + 1], pBuffer[i + 2], pBuffer[i + 3], pBuffer[i + 4], pBuffer[i + 5], pBuffer[i + 6], pBuffer[i + 7], pBuffer[i + 8], pBuffer[i + 9], pBuffer[i + 10], pBuffer[i + 11], pBuffer[i + 12], pBuffer[i + 13], pBuffer[i + 14], pBuffer[i + 15]);
                }
                travelBuffer_1.push.apply(travelBuffer_1, tslib.__spreadArray([], tslib.__read(tBuffer), false));
            });
            this.geometry.updateVertexBuffer(LineVertexAttributeBufferIndex.PACKED, LineVertexAttributeLocation.PREV, startIndex * instancedCount_1, new Uint8Array(new Float32Array(pointsBuffer_1).buffer));
            this.geometry.updateVertexBuffer(LineVertexAttributeBufferIndex.TRAVEL, LineVertexAttributeLocation.TRAVEL, startIndex, new Uint8Array(new Float32Array(travelBuffer_1).buffer));
        }
        else if (name === 'lineDashOffset' ||
            name === 'lineDash' ||
            name === 'isBillboard' ||
            name === 'isSizeAttenuation') {
            var packedDash_1 = [];
            objects.forEach(function (object) {
                var _a = object.parsedStyle, lineDash = _a.lineDash, lineDashOffset = _a.lineDashOffset, isBillboard = _a.isBillboard, isSizeAttenuation = _a.isSizeAttenuation;
                packedDash_1.push((lineDash && lineDash[0]) || 0, // DASH
                (lineDash && lineDash[1]) || 0, // GAP
                lineDashOffset || 0, packBoolean(isBillboard, isSizeAttenuation, is3DPolyline(object)));
            });
            this.geometry.updateVertexBuffer(LineVertexAttributeBufferIndex.DASH, LineVertexAttributeLocation.DASH, startIndex, new Uint8Array(new Float32Array(packedDash_1).buffer));
        }
    };
    return InstancedPathDrawcall;
}(Instanced));
exports.JOINT_TYPE = void 0;
(function (JOINT_TYPE) {
    JOINT_TYPE[JOINT_TYPE["NONE"] = 0] = "NONE";
    JOINT_TYPE[JOINT_TYPE["FILL"] = 1] = "FILL";
    JOINT_TYPE[JOINT_TYPE["JOINT_BEVEL"] = 4] = "JOINT_BEVEL";
    JOINT_TYPE[JOINT_TYPE["JOINT_MITER"] = 8] = "JOINT_MITER";
    JOINT_TYPE[JOINT_TYPE["JOINT_ROUND"] = 12] = "JOINT_ROUND";
    JOINT_TYPE[JOINT_TYPE["JOINT_CAP_BUTT"] = 16] = "JOINT_CAP_BUTT";
    JOINT_TYPE[JOINT_TYPE["JOINT_CAP_SQUARE"] = 18] = "JOINT_CAP_SQUARE";
    JOINT_TYPE[JOINT_TYPE["JOINT_CAP_ROUND"] = 20] = "JOINT_CAP_ROUND";
    JOINT_TYPE[JOINT_TYPE["FILL_EXPAND"] = 24] = "FILL_EXPAND";
    JOINT_TYPE[JOINT_TYPE["CAP_BUTT"] = 32] = "CAP_BUTT";
    JOINT_TYPE[JOINT_TYPE["CAP_SQUARE"] = 64] = "CAP_SQUARE";
    JOINT_TYPE[JOINT_TYPE["CAP_ROUND"] = 96] = "CAP_ROUND";
    JOINT_TYPE[JOINT_TYPE["CAP_BUTT2"] = 128] = "CAP_BUTT2";
})(exports.JOINT_TYPE || (exports.JOINT_TYPE = {}));
var stridePoints = 3;
var strideFloats = 4;
function updateBuffer(object, needEarcut, segmentNum, subPathIndex) {
    var _a;
    if (needEarcut === void 0) { needEarcut = false; }
    if (subPathIndex === void 0) { subPathIndex = 0; }
    var _b = object.parsedStyle, lineCap = _b.lineCap, lineJoin = _b.lineJoin;
    var zIndex = object.sortable.renderOrder * RENDER_ORDER_SCALE;
    var _c = object.parsedStyle, defX = _c.defX, defY = _c.defY;
    var _d = object.parsedStyle, markerStart = _d.markerStart, markerEnd = _d.markerEnd, markerStartOffset = _d.markerStartOffset, markerEndOffset = _d.markerEndOffset;
    var points = [];
    var triangles = [];
    if (object.nodeName === gLite.Shape.POLYLINE || object.nodeName === gLite.Shape.POLYGON) {
        var polylineControlPoints = object.parsedStyle.points
            .points;
        var length_1 = polylineControlPoints.length;
        var startOffsetX_1 = 0;
        var startOffsetY_1 = 0;
        var endOffsetX_1 = 0;
        var endOffsetY_1 = 0;
        var rad = 0;
        var x = void 0;
        var y = void 0;
        if (markerStart && gLite.isDisplayObject(markerStart) && markerStartOffset) {
            x = polylineControlPoints[1][0] - polylineControlPoints[0][0];
            y = polylineControlPoints[1][1] - polylineControlPoints[0][1];
            rad = Math.atan2(y, x);
            startOffsetX_1 = Math.cos(rad) * (markerStartOffset || 0);
            startOffsetY_1 = Math.sin(rad) * (markerStartOffset || 0);
        }
        if (markerEnd && gLite.isDisplayObject(markerEnd) && markerEndOffset) {
            x =
                polylineControlPoints[length_1 - 2][0] -
                    polylineControlPoints[length_1 - 1][0];
            y =
                polylineControlPoints[length_1 - 2][1] -
                    polylineControlPoints[length_1 - 1][1];
            rad = Math.atan2(y, x);
            endOffsetX_1 = Math.cos(rad) * (markerEndOffset || 0);
            endOffsetY_1 = Math.sin(rad) * (markerEndOffset || 0);
        }
        var isPolyline_1 = object.nodeName === gLite.Shape.POLYLINE;
        points[0] = polylineControlPoints.reduce(function (prev, cur, i) {
            var offsetX = 0;
            var offsetY = 0;
            if (i === 0) {
                offsetX = startOffsetX_1;
                offsetY = startOffsetY_1;
            }
            else if (i === length_1 - 1) {
                offsetX = endOffsetX_1;
                offsetY = endOffsetY_1;
            }
            prev.push(cur[0] - defX + offsetX, cur[1] - defY + offsetY, isPolyline_1 ? cur[2] || 0 : zIndex);
            return prev;
        }, []);
        // close polygon, dealing with extra joint
        if (object.nodeName === gLite.Shape.POLYGON) {
            if (needEarcut) {
                // use earcut for triangulation
                triangles = earcut(points[0], [], 3);
                return {
                    pointsBuffer: points[0],
                    travelBuffer: [],
                    triangles: triangles,
                    instancedCount: Math.round(points[0].length / stridePoints),
                };
            }
            else {
                points[0].push(points[0][0], points[0][1], points[0][2] || zIndex);
                (_a = points[0]).push.apply(_a, tslib.__spreadArray([], tslib.__read(addTailSegment(points[0][0], points[0][1], points[0][2] || zIndex, points[0][3], points[0][4], points[0][5] || zIndex)), false));
            }
        }
    }
    else if (object.nodeName === gLite.Shape.PATH ||
        object.nodeName === gLite.Shape.CIRCLE ||
        object.nodeName === gLite.Shape.ELLIPSE ||
        object.nodeName === gLite.Shape.RECT) {
        var path = void 0;
        if (object.nodeName !== gLite.Shape.PATH) {
            path = gLite.parsePath(gLite.convertToPath(object, glMatrix.mat4.identity(glMatrix.mat4.create())));
            defX = path.rect.x;
            defY = path.rect.y;
            // support negative width/height of Rect
            if (object.nodeName === gLite.Shape.RECT) {
                var _e = object.parsedStyle, width = _e.width, height = _e.height;
                if (width < 0) {
                    defX += path.rect.width;
                }
                if (height < 0) {
                    defY += path.rect.height;
                }
            }
        }
        else {
            path = object.parsedStyle.path;
        }
        var absolutePath_1 = path.absolutePath, segments_1 = path.segments;
        var startOffsetX_2 = 0;
        var startOffsetY_2 = 0;
        var endOffsetX_2 = 0;
        var endOffsetY_2 = 0;
        var rad = 0;
        var x = void 0;
        var y = void 0;
        if (markerStart &&
            markerStart.parentNode &&
            gLite.isDisplayObject(markerStart) &&
            markerStartOffset) {
            var _f = tslib.__read(markerStart.parentNode.getStartTangent(), 2), p1 = _f[0], p2 = _f[1];
            x = p1[0] - p2[0];
            y = p1[1] - p2[1];
            rad = Math.atan2(y, x);
            startOffsetX_2 = Math.cos(rad) * (markerStartOffset || 0);
            startOffsetY_2 = Math.sin(rad) * (markerStartOffset || 0);
        }
        if (markerEnd &&
            markerEnd.parentNode &&
            gLite.isDisplayObject(markerEnd) &&
            markerEndOffset) {
            var _g = tslib.__read(markerEnd.parentNode.getEndTangent(), 2), p1 = _g[0], p2 = _g[1];
            x = p1[0] - p2[0];
            y = p1[1] - p2[1];
            rad = Math.atan2(y, x);
            endOffsetX_2 = Math.cos(rad) * (markerEndOffset || 0);
            endOffsetY_2 = Math.sin(rad) * (markerEndOffset || 0);
        }
        var startPointIndex_1 = -1;
        var mCommandsNum_1 = -1;
        absolutePath_1.forEach(function (_a, i) {
            var _b;
            var _c = tslib.__read(_a), command = _c[0], params = _c.slice(1);
            var nextSegment = absolutePath_1[i + 1];
            var useStartOffset = i === 0 && (startOffsetX_2 !== 0 || startOffsetY_2 !== 0);
            var useEndOffset = (i === absolutePath_1.length - 1 ||
                (nextSegment &&
                    (nextSegment[0] === 'M' || nextSegment[0] === 'Z'))) &&
                endOffsetX_2 !== 0 &&
                endOffsetY_2 !== 0;
            if (command === 'M') {
                mCommandsNum_1++;
                points[mCommandsNum_1] = [];
                startPointIndex_1 = points[mCommandsNum_1].length;
                if (useStartOffset) {
                    points[mCommandsNum_1].push(params[0] - defX + startOffsetX_2, params[1] - defY + startOffsetY_2, zIndex, params[0] - defX, params[1] - defY, zIndex);
                }
                else {
                    points[mCommandsNum_1].push(params[0] - defX, params[1] - defY, zIndex);
                }
            }
            else if (command === 'L') {
                if (useEndOffset) {
                    points[mCommandsNum_1].push(params[0] - defX + endOffsetX_2, params[1] - defY + endOffsetY_2, zIndex);
                }
                else {
                    points[mCommandsNum_1].push(params[0] - defX, params[1] - defY, zIndex);
                }
            }
            else if (command === 'Q') {
                quadCurveTo(params[0] - defX, params[1] - defY, params[2] - defX, params[3] - defY, points[mCommandsNum_1], segmentNum);
                if (useEndOffset) {
                    points[mCommandsNum_1].push(params[2] - defX + endOffsetX_2, params[3] - defY + endOffsetY_2, zIndex);
                }
            }
            else if (command === 'A') {
                // convert Arc to Cubic
                var _d = tslib.__read(segments_1[i].prePoint, 2), px1 = _d[0], py1 = _d[1];
                var args = util.arcToCubic(px1, py1, params[0], params[1], params[2], params[3], params[4], params[5], params[6], undefined);
                // fixArc
                for (var i_1 = 0; i_1 < args.length; i_1 += 6) {
                    bezierCurveTo(args[i_1] - defX, args[i_1 + 1] - defY, args[i_1 + 2] - defX, args[i_1 + 3] - defY, args[i_1 + 4] - defX, args[i_1 + 5] - defY, points[mCommandsNum_1], segmentNum);
                }
                if (useEndOffset) {
                    points[mCommandsNum_1].push(params[5] - defX + endOffsetX_2, params[6] - defY + endOffsetY_2, zIndex);
                }
            }
            else if (command === 'C') {
                bezierCurveTo(params[0] - defX, params[1] - defY, params[2] - defX, params[3] - defY, params[4] - defX, params[5] - defY, points[mCommandsNum_1], segmentNum);
                if (useEndOffset) {
                    points[mCommandsNum_1].push(params[4] - defX + endOffsetX_2, params[5] - defY + endOffsetY_2, zIndex);
                }
            }
            else if (command === 'Z' &&
                (object.nodeName === gLite.Shape.PATH || object.nodeName === gLite.Shape.RECT)) {
                var epsilon = 0.0001;
                // skip if already closed
                if (Math.abs(points[mCommandsNum_1][points[mCommandsNum_1].length - 2] -
                    points[mCommandsNum_1][startPointIndex_1]) > epsilon ||
                    Math.abs(points[mCommandsNum_1][points[mCommandsNum_1].length - 1] -
                        points[mCommandsNum_1][startPointIndex_1 + 1]) > epsilon) {
                    points[mCommandsNum_1].push(points[mCommandsNum_1][startPointIndex_1], points[mCommandsNum_1][startPointIndex_1 + 1], zIndex);
                }
                (_b = points[mCommandsNum_1]).push.apply(_b, tslib.__spreadArray([], tslib.__read(addTailSegment(points[mCommandsNum_1][startPointIndex_1], points[mCommandsNum_1][startPointIndex_1 + 1], points[mCommandsNum_1][startPointIndex_1 + 2], points[mCommandsNum_1][startPointIndex_1 + 3], points[mCommandsNum_1][startPointIndex_1 + 4], points[mCommandsNum_1][startPointIndex_1 + 5])), false));
            }
        });
        if (needEarcut) {
            var pointsBuffer = points[subPathIndex];
            // use earcut for triangulation
            triangles = earcut(pointsBuffer, [], 3);
            return {
                pointsBuffer: pointsBuffer,
                travelBuffer: [],
                triangles: triangles,
                instancedCount: Math.round(pointsBuffer.length / stridePoints),
            };
        }
    }
    var jointType = getJointType(lineJoin);
    var capType = getCapType(lineCap);
    var endJoint = capType;
    if (capType === exports.JOINT_TYPE.CAP_ROUND) {
        endJoint = exports.JOINT_TYPE.JOINT_CAP_ROUND;
    }
    if (capType === exports.JOINT_TYPE.CAP_BUTT) {
        endJoint = exports.JOINT_TYPE.JOINT_CAP_BUTT;
    }
    if (capType === exports.JOINT_TYPE.CAP_SQUARE) {
        endJoint = exports.JOINT_TYPE.JOINT_CAP_SQUARE;
    }
    var subPath = points[subPathIndex];
    {
        var points_1 = subPath;
        var j = (Math.round(0 / stridePoints) + 2) * strideFloats;
        // const needDash = !isNil(lineDash);
        var dist = 0;
        var pointsBuffer = [];
        var travelBuffer = [];
        for (var i = 0; i < points_1.length; i += stridePoints) {
            // calc travel
            // if (needDash) {
            if (i > 1) {
                dist += Math.sqrt(Math.pow(points_1[i] - points_1[i - stridePoints], 2) +
                    Math.pow(points_1[i + 1] - points_1[i + 1 - stridePoints], 2) +
                    Math.pow(points_1[i + 2] - points_1[i + 2 - stridePoints], 2));
            }
            travelBuffer.push(dist);
            // } else {
            //   travelBuffer.push(0);
            // }
            pointsBuffer[j++] = points_1[i];
            pointsBuffer[j++] = points_1[i + 1];
            pointsBuffer[j++] = points_1[i + 2] || 0;
            pointsBuffer[j] = jointType;
            if (i == 0 && capType !== exports.JOINT_TYPE.CAP_ROUND) {
                pointsBuffer[j] += capType;
            }
            if (i + stridePoints * 2 >= points_1.length) {
                pointsBuffer[j] += endJoint - jointType;
            }
            else if (i + stridePoints >= points_1.length) {
                pointsBuffer[j] = 0;
            }
            j++;
        }
        pointsBuffer[j++] = points_1[points_1.length - 6];
        pointsBuffer[j++] = points_1[points_1.length - 5];
        pointsBuffer[j++] = points_1[points_1.length - 4] || zIndex;
        pointsBuffer[j++] = 0;
        pointsBuffer[0] = points_1[0];
        pointsBuffer[1] = points_1[1];
        pointsBuffer[2] = points_1[2] || zIndex;
        pointsBuffer[3] = 0;
        pointsBuffer[4] = points_1[3];
        pointsBuffer[5] = points_1[4];
        pointsBuffer[6] = points_1[5] || zIndex;
        pointsBuffer[7] = capType === exports.JOINT_TYPE.CAP_ROUND ? capType : 0;
        var instancedCount = Math.round(points_1.length / stridePoints);
        return {
            pointsBuffer: pointsBuffer,
            travelBuffer: travelBuffer,
            triangles: triangles,
            instancedCount: instancedCount,
        };
    }
}
function getJointType(lineJoin) {
    var joint;
    switch (lineJoin) {
        case 'bevel':
            joint = exports.JOINT_TYPE.JOINT_BEVEL;
            break;
        case 'round':
            joint = exports.JOINT_TYPE.JOINT_ROUND;
            break;
        default:
            joint = exports.JOINT_TYPE.JOINT_MITER;
            break;
    }
    return joint;
}
function getCapType(lineCap) {
    var cap;
    switch (lineCap) {
        case 'square':
            cap = exports.JOINT_TYPE.CAP_SQUARE;
            break;
        case 'round':
            cap = exports.JOINT_TYPE.CAP_ROUND;
            break;
        default:
            cap = exports.JOINT_TYPE.CAP_BUTT;
            break;
    }
    return cap;
}
function addTailSegment(x1, y1, z1, x2, y2, z2) {
    if (x2 === void 0) { x2 = x1; }
    if (y2 === void 0) { y2 = y1; }
    if (z2 === void 0) { z2 = z1; }
    var vec = [x2 - x1, y2 - y1, z2 - z1];
    var length = 0.01;
    return [x1 + vec[0] * length, y1 + vec[1] * length, z1 + vec[2] * length];
}

var SEGMENT_NUM = 12;
var FillVertexAttributeBufferIndex;
(function (FillVertexAttributeBufferIndex) {
    FillVertexAttributeBufferIndex[FillVertexAttributeBufferIndex["PACKED_STYLE"] = 5] = "PACKED_STYLE";
})(FillVertexAttributeBufferIndex || (FillVertexAttributeBufferIndex = {}));
var FillVertexAttributeLocation;
(function (FillVertexAttributeLocation) {
    FillVertexAttributeLocation[FillVertexAttributeLocation["PACKED_STYLE3"] = 12] = "PACKED_STYLE3";
})(FillVertexAttributeLocation || (FillVertexAttributeLocation = {}));
var InstancedFillDrawcall = /** @class */ (function (_super) {
    tslib.__extends(InstancedFillDrawcall, _super);
    function InstancedFillDrawcall(renderHelper, texturePool, lightPool, object, drawcallCtors, index, context) {
        var _this = _super.call(this, renderHelper, texturePool, lightPool, object, drawcallCtors, index, context) || this;
        _this.renderHelper = renderHelper;
        _this.texturePool = texturePool;
        _this.lightPool = lightPool;
        _this.mergeAnchorIntoModelMatrix = true;
        _this.trianglesHash = [[], []];
        _this.trianglesHash = _this.calcSegmentNum(object);
        return _this;
    }
    InstancedFillDrawcall.prototype.calcSegmentNum = function (object) {
        var _a = updateBuffer(object, true, SEGMENT_NUM, this.calcSubpathIndex(object)), triangles = _a.triangles, pointsBuffer = _a.pointsBuffer;
        return [triangles, pointsBuffer];
    };
    InstancedFillDrawcall.prototype.calcSubpathIndex = function (object) {
        if (object.nodeName === gLite.Shape.PATH) {
            return this.index;
        }
        return 0;
    };
    InstancedFillDrawcall.prototype.compareTrianglesHash = function (hash) {
        var _a = tslib.__read(this.trianglesHash, 2), triangles = _a[0], points = _a[1];
        var _b = tslib.__read(hash, 2), t = _b[0], p = _b[1];
        if (triangles.length !== t.length || points.length !== p.length) {
            return false;
        }
        if (triangles.some(function (n, i) { return n !== t[i]; }) ||
            points.some(function (n, i) { return n !== p[i]; })) {
            return false;
        }
        return true;
    };
    InstancedFillDrawcall.prototype.shouldMerge = function (object, index) {
        var shouldMerge = _super.prototype.shouldMerge.call(this, object, index);
        if (!shouldMerge) {
            return false;
        }
        if (this.index !== index) {
            return false;
        }
        var trianglesHash = this.calcSegmentNum(object);
        return this.compareTrianglesHash(trianglesHash);
    };
    InstancedFillDrawcall.prototype.createGeometry = function (objects) {
        var _this = this;
        var indices = [];
        var pointsBuffer = [];
        var uvsBuffer = [];
        var offset = 0;
        objects.forEach(function (object, i) {
            // use triangles for Polygon
            var _a = updateBuffer(object, true, SEGMENT_NUM, _this.calcSubpathIndex(object)), triangles = _a.triangles, pBuffer = _a.pointsBuffer;
            if (triangles.length) {
                var halfExtents_1 = object.getGeometryBounds().halfExtents;
                // pointsBuffer use 3D
                var uvBuffer_1 = [];
                pBuffer.forEach(function (x, i) {
                    if (i % 3 !== 2) {
                        uvBuffer_1.push(x / halfExtents_1[i % 3] / 2);
                    }
                });
                offset += pointsBuffer.length / 3;
                pointsBuffer.push.apply(pointsBuffer, tslib.__spreadArray([], tslib.__read(pBuffer), false));
                uvsBuffer.push.apply(uvsBuffer, tslib.__spreadArray([], tslib.__read(uvBuffer_1), false));
                indices.push.apply(indices, tslib.__spreadArray([], tslib.__read(triangles.map(function (n) { return n + offset; })), false));
            }
        });
        if (pointsBuffer.length) {
            // use default common attributes
            _super.prototype.createGeometry.call(this, objects);
            var packedStyle_1 = [];
            objects.forEach(function (object) {
                var _a = object.parsedStyle, isBillboard = _a.isBillboard, billboardRotation = _a.billboardRotation, isSizeAttenuation = _a.isSizeAttenuation;
                packedStyle_1.push(isBillboard ? 1 : 0, billboardRotation !== null && billboardRotation !== void 0 ? billboardRotation : 0, isSizeAttenuation ? 1 : 0, 0);
            });
            this.geometry.setVertexBuffer({
                bufferIndex: exports.VertexAttributeBufferIndex.POSITION,
                byteStride: 4 * 3,
                stepMode: gDeviceApi.VertexStepMode.VERTEX,
                attributes: [
                    {
                        format: gDeviceApi.Format.F32_RGB,
                        bufferByteOffset: 4 * 0,
                        location: exports.VertexAttributeLocation.POSITION,
                    },
                ],
                data: new Float32Array(pointsBuffer),
            });
            this.geometry.setVertexBuffer({
                bufferIndex: FillVertexAttributeBufferIndex.PACKED_STYLE,
                byteStride: 4 * 4,
                stepMode: gDeviceApi.VertexStepMode.INSTANCE,
                attributes: [
                    {
                        format: gDeviceApi.Format.F32_RGBA,
                        bufferByteOffset: 4 * 0,
                        location: FillVertexAttributeLocation.PACKED_STYLE3,
                        divisor: 1,
                    },
                ],
                data: new Float32Array(packedStyle_1),
            });
            this.geometry.setVertexBuffer({
                bufferIndex: exports.VertexAttributeBufferIndex.UV,
                byteStride: 4 * 2,
                stepMode: gDeviceApi.VertexStepMode.VERTEX,
                attributes: [
                    {
                        format: gDeviceApi.Format.F32_RG,
                        bufferByteOffset: 4 * 0,
                        location: exports.VertexAttributeLocation.UV,
                    },
                ],
                data: new Float32Array(uvsBuffer),
            });
            this.geometry.vertexCount = indices.length / objects.length;
            this.geometry.setIndexBuffer(new Uint32Array(indices));
        }
    };
    InstancedFillDrawcall.prototype.createMaterial = function (objects) {
        this.material.vertexShader = meshVert;
        this.material.fragmentShader = meshFrag;
        this.material.defines = tslib.__assign(tslib.__assign(tslib.__assign({}, this.material.defines), enumToObject(FillVertexAttributeLocation)), { INSTANCED: true });
    };
    InstancedFillDrawcall.prototype.updateAttribute = function (objects, startIndex, name, value) {
        _super.prototype.updateAttribute.call(this, objects, startIndex, name, value);
        this.updateBatchedAttribute(objects, startIndex, name, value);
        if (name === 'isBillboard' ||
            name === 'billboardRotation' ||
            name === 'isSizeAttenuation') {
            var packed_1 = [];
            objects.forEach(function (object) {
                var _a = object.parsedStyle, isBillboard = _a.isBillboard, billboardRotation = _a.billboardRotation, isSizeAttenuation = _a.isSizeAttenuation;
                packed_1.push(isBillboard ? 1 : 0, billboardRotation !== null && billboardRotation !== void 0 ? billboardRotation : 0, isSizeAttenuation ? 1 : 0, 0);
            });
            this.geometry.updateVertexBuffer(FillVertexAttributeBufferIndex.PACKED_STYLE, FillVertexAttributeLocation.PACKED_STYLE3, startIndex, new Uint8Array(new Float32Array(packed_1).buffer));
        }
    };
    return InstancedFillDrawcall;
}(Instanced));

var segmentInstanceGeometry = [
    0, -0.5, 0, 0, 0, 1, -0.5, 1, 1, 0, 1, 0.5, 1, 1, 1, 0, 0.5, 0, 0, 1,
];
var InstancedLineVertexAttributeBufferIndex;
(function (InstancedLineVertexAttributeBufferIndex) {
    InstancedLineVertexAttributeBufferIndex[InstancedLineVertexAttributeBufferIndex["POINT"] = 5] = "POINT";
    InstancedLineVertexAttributeBufferIndex[InstancedLineVertexAttributeBufferIndex["CAP"] = 6] = "CAP";
    InstancedLineVertexAttributeBufferIndex[InstancedLineVertexAttributeBufferIndex["DASH"] = 7] = "DASH";
})(InstancedLineVertexAttributeBufferIndex || (InstancedLineVertexAttributeBufferIndex = {}));
var InstancedLineVertexAttributeLocation;
(function (InstancedLineVertexAttributeLocation) {
    InstancedLineVertexAttributeLocation[InstancedLineVertexAttributeLocation["POSITION"] = 8] = "POSITION";
    InstancedLineVertexAttributeLocation[InstancedLineVertexAttributeLocation["UV"] = 10] = "UV";
    InstancedLineVertexAttributeLocation[InstancedLineVertexAttributeLocation["POINTA"] = 9] = "POINTA";
    InstancedLineVertexAttributeLocation[InstancedLineVertexAttributeLocation["POINTB"] = 11] = "POINTB";
    InstancedLineVertexAttributeLocation[InstancedLineVertexAttributeLocation["CAP"] = 12] = "CAP";
    InstancedLineVertexAttributeLocation[InstancedLineVertexAttributeLocation["DASH"] = 13] = "DASH";
})(InstancedLineVertexAttributeLocation || (InstancedLineVertexAttributeLocation = {}));
var LineCap_MAP = {
    butt: 1,
    round: 2,
    square: 3,
};
var InstancedLineDrawcall = /** @class */ (function (_super) {
    tslib.__extends(InstancedLineDrawcall, _super);
    function InstancedLineDrawcall(renderHelper, texturePool, lightPool, object, drawcallCtors, index, context) {
        var _this = _super.call(this, renderHelper, texturePool, lightPool, object, drawcallCtors, index, context) || this;
        _this.renderHelper = renderHelper;
        _this.texturePool = texturePool;
        _this.lightPool = lightPool;
        _this.gradientAttributeName = 'stroke';
        return _this;
    }
    InstancedLineDrawcall.isLine = function (object, subpathIndex) {
        if (object.nodeName === gLite.Shape.PATH) {
            var absolutePath = object.parsedStyle.path.absolutePath;
            var mSegmentCount = 0;
            var mCommandIndex = 0;
            for (var i = 0; i < absolutePath.length; i++) {
                var segment = absolutePath[i];
                if (segment[0] === 'M') {
                    if (mSegmentCount === subpathIndex) {
                        mCommandIndex = i;
                        break;
                    }
                    mSegmentCount++;
                }
            }
            // only contains M & L commands
            if (absolutePath[mCommandIndex][0] === 'M' &&
                absolutePath[mCommandIndex + 1][0] === 'L' &&
                (absolutePath[mCommandIndex + 2] === undefined ||
                    absolutePath[mCommandIndex + 2][0] === 'M')) {
                return true;
            }
        }
        else if (object.nodeName === gLite.Shape.POLYLINE) {
            var points = object.parsedStyle.points.points;
            var tangent = (points[1][0] - points[1][1]) / (points[0][0] - points[0][1]);
            for (var i = 1; i < points.length - 1; i++) {
                if ((points[i + 1][0] - points[i + 1][1]) /
                    (points[i][0] - points[i][1]) !==
                    tangent) {
                    return false;
                }
            }
            return true;
        }
        return false;
    };
    InstancedLineDrawcall.prototype.shouldMerge = function (object, index) {
        var shouldMerge = _super.prototype.shouldMerge.call(this, object, index);
        if (!shouldMerge) {
            return false;
        }
        return true;
    };
    InstancedLineDrawcall.prototype.createMaterial = function (objects) {
        this.material.vertexShader = vert$3;
        this.material.fragmentShader = frag$3;
        this.material.defines = tslib.__assign(tslib.__assign({}, this.material.defines), enumToObject(InstancedLineVertexAttributeLocation));
    };
    InstancedLineDrawcall.prototype.calcSubpathIndex = function (object) {
        if (object.nodeName === gLite.Shape.PATH) {
            var fillDrawcallCount = this.drawcallCtors.filter(function (ctor) { return ctor === InstancedFillDrawcall; }).length;
            return this.index - fillDrawcallCount;
        }
        return 0;
    };
    InstancedLineDrawcall.prototype.createGeometry = function (objects) {
        var _this = this;
        // use default common attributes
        _super.prototype.createGeometry.call(this, objects);
        var interleaved = [];
        var packedCap = [];
        var packedDash = [];
        var indices = [];
        var offset = 0;
        objects.forEach(function (object) {
            var parsedLineStyleProps;
            var totalLength;
            if (object.nodeName === gLite.Shape.LINE) {
                parsedLineStyleProps = object.parsedStyle;
                totalLength = object.getTotalLength();
            }
            else if (object.nodeName === gLite.Shape.POLYLINE) {
                var _a = object.parsedStyle, points = _a.points.points, defX_1 = _a.defX, defY_1 = _a.defY, lineCap_1 = _a.lineCap, lineDash = _a.lineDash, lineDashOffset = _a.lineDashOffset, markerStart = _a.markerStart, markerEnd = _a.markerEnd, markerStartOffset = _a.markerStartOffset, markerEndOffset = _a.markerEndOffset, isBillboard_1 = _a.isBillboard, 
                // @ts-ignore
                isSizeAttenuation_1 = _a.isSizeAttenuation;
                parsedLineStyleProps = {
                    x1: points[0][0],
                    y1: points[0][1],
                    x2: points[points.length - 1][0],
                    y2: points[points.length - 1][1],
                    z1: 0,
                    z2: 0,
                    defX: defX_1,
                    defY: defY_1,
                    lineCap: lineCap_1,
                    lineDash: lineDash,
                    lineDashOffset: lineDashOffset,
                    isBillboard: isBillboard_1,
                    isSizeAttenuation: isSizeAttenuation_1,
                    markerStart: markerStart,
                    markerEnd: markerEnd,
                    markerStartOffset: markerStartOffset,
                    markerEndOffset: markerEndOffset,
                };
                totalLength = object.getTotalLength();
            }
            else if (object.nodeName === gLite.Shape.PATH) {
                var _b = object.parsedStyle, absolutePath = _b.path.absolutePath, defX_2 = _b.defX, defY_2 = _b.defY, lineCap_2 = _b.lineCap, lineDash = _b.lineDash, lineDashOffset = _b.lineDashOffset, markerStart = _b.markerStart, markerEnd = _b.markerEnd, markerStartOffset = _b.markerStartOffset, markerEndOffset = _b.markerEndOffset, isBillboard_2 = _b.isBillboard, isSizeAttenuation_2 = _b.isSizeAttenuation;
                var mSegmentCount = 0;
                var mCommandIndex = 0;
                var index = _this.calcSubpathIndex(object);
                for (var i = 0; i < absolutePath.length; i++) {
                    var segment = absolutePath[i];
                    if (segment[0] === 'M') {
                        if (mSegmentCount === index) {
                            mCommandIndex = i;
                            break;
                        }
                        mSegmentCount++;
                    }
                }
                parsedLineStyleProps = {
                    x1: absolutePath[mCommandIndex][1],
                    y1: absolutePath[mCommandIndex][2],
                    x2: absolutePath[mCommandIndex + 1][1],
                    y2: absolutePath[mCommandIndex + 1][2],
                    z1: 0,
                    z2: 0,
                    defX: defX_2,
                    defY: defY_2,
                    lineCap: lineCap_2,
                    lineDash: lineDash,
                    lineDashOffset: lineDashOffset,
                    isBillboard: isBillboard_2,
                    isSizeAttenuation: isSizeAttenuation_2,
                    markerStart: markerStart,
                    markerEnd: markerEnd,
                    markerStartOffset: markerStartOffset,
                    markerEndOffset: markerEndOffset,
                };
                totalLength = object.getTotalLength();
            }
            var x1 = parsedLineStyleProps.x1, y1 = parsedLineStyleProps.y1, x2 = parsedLineStyleProps.x2, y2 = parsedLineStyleProps.y2, z1 = parsedLineStyleProps.z1, z2 = parsedLineStyleProps.z2, defX = parsedLineStyleProps.defX, defY = parsedLineStyleProps.defY, lineCap = parsedLineStyleProps.lineCap, isBillboard = parsedLineStyleProps.isBillboard, isSizeAttenuation = parsedLineStyleProps.isSizeAttenuation;
            var _c = _this.calcOffset(parsedLineStyleProps), startOffsetX = _c.startOffsetX, startOffsetY = _c.startOffsetY, endOffsetX = _c.endOffsetX, endOffsetY = _c.endOffsetY;
            var _d = _this.calcDash(parsedLineStyleProps, totalLength), dashOffset = _d.dashOffset, dashSegmentPercent = _d.dashSegmentPercent, dashRatioInEachSegment = _d.dashRatioInEachSegment;
            packedCap.push(
            // caps
            LineCap_MAP[lineCap]);
            packedDash.push(dashOffset, dashSegmentPercent, dashRatioInEachSegment, 
            // isSizeAttenuation
            isBillboard || isSizeAttenuation ? 1 : 0);
            interleaved.push(x1 - defX + startOffsetX, y1 - defY + startOffsetY, z1, x2 - defX + endOffsetX, y2 - defY + endOffsetY, z2);
            indices.push(0 + offset, 2 + offset, 1 + offset, 0 + offset, 3 + offset, 2 + offset);
            offset += 4;
        });
        this.geometry.setIndexBuffer(new Uint32Array(indices));
        this.geometry.vertexCount = 6;
        this.geometry.setVertexBuffer({
            bufferIndex: exports.VertexAttributeBufferIndex.POSITION,
            byteStride: 4 * 5,
            stepMode: gDeviceApi.VertexStepMode.INSTANCE,
            attributes: [
                {
                    format: gDeviceApi.Format.F32_RGB,
                    bufferByteOffset: 4 * 0,
                    location: InstancedLineVertexAttributeLocation.POSITION,
                    divisor: 0,
                },
                {
                    format: gDeviceApi.Format.F32_RG,
                    bufferByteOffset: 4 * 3,
                    location: InstancedLineVertexAttributeLocation.UV,
                    divisor: 0,
                },
            ],
            data: new Float32Array(segmentInstanceGeometry),
        });
        this.geometry.setVertexBuffer({
            bufferIndex: InstancedLineVertexAttributeBufferIndex.POINT,
            byteStride: 4 * (3 + 3),
            stepMode: gDeviceApi.VertexStepMode.INSTANCE,
            attributes: [
                {
                    format: gDeviceApi.Format.F32_RGB,
                    bufferByteOffset: 4 * 0,
                    location: InstancedLineVertexAttributeLocation.POINTA,
                    divisor: 1,
                },
                {
                    format: gDeviceApi.Format.F32_RGB,
                    bufferByteOffset: 4 * 3,
                    location: InstancedLineVertexAttributeLocation.POINTB,
                    divisor: 1,
                },
            ],
            data: new Float32Array(interleaved),
        });
        this.geometry.setVertexBuffer({
            bufferIndex: InstancedLineVertexAttributeBufferIndex.CAP,
            byteStride: 4 * 1,
            stepMode: gDeviceApi.VertexStepMode.INSTANCE,
            attributes: [
                {
                    format: gDeviceApi.Format.F32_R,
                    bufferByteOffset: 4 * 0,
                    location: InstancedLineVertexAttributeLocation.CAP,
                    divisor: 1,
                },
            ],
            data: new Float32Array(packedCap),
        });
        this.geometry.setVertexBuffer({
            bufferIndex: InstancedLineVertexAttributeBufferIndex.DASH,
            byteStride: 4 * 4,
            stepMode: gDeviceApi.VertexStepMode.INSTANCE,
            attributes: [
                {
                    format: gDeviceApi.Format.F32_RGBA,
                    bufferByteOffset: 4 * 0,
                    location: InstancedLineVertexAttributeLocation.DASH,
                    divisor: 1,
                },
            ],
            data: new Float32Array(packedDash),
        });
    };
    InstancedLineDrawcall.prototype.updateAttribute = function (objects, startIndex, name, value) {
        var _this = this;
        _super.prototype.updateAttribute.call(this, objects, startIndex, name, value);
        this.updateBatchedAttribute(objects, startIndex, name, value);
        if (name === 'x1' ||
            name === 'y1' ||
            name === 'x2' ||
            name === 'y2' ||
            name === 'z1' ||
            name === 'z2' ||
            name === 'markerStartOffset' ||
            name === 'markerEndOffset' ||
            name === 'markerStart' ||
            name === 'markerEnd' ||
            name === 'points' ||
            name === 'path') {
            var packed_1 = [];
            objects.forEach(function (object) {
                var parsedLineStyleProps;
                if (object.nodeName === gLite.Shape.LINE) {
                    parsedLineStyleProps = object.parsedStyle;
                }
                else if (object.nodeName === gLite.Shape.POLYLINE) {
                    var _a = object.parsedStyle, points = _a.points.points, defX_3 = _a.defX, defY_3 = _a.defY, lineCap = _a.lineCap, markerStart = _a.markerStart, markerEnd = _a.markerEnd, markerStartOffset = _a.markerStartOffset, markerEndOffset = _a.markerEndOffset, isBillboard = _a.isBillboard, 
                    // @ts-ignore
                    isSizeAttenuation = _a.isSizeAttenuation;
                    parsedLineStyleProps = {
                        x1: points[0][0],
                        y1: points[0][1],
                        x2: points[points.length - 1][0],
                        y2: points[points.length - 1][1],
                        z1: 0,
                        z2: 0,
                        defX: defX_3,
                        defY: defY_3,
                        lineCap: lineCap,
                        isSizeAttenuation: isSizeAttenuation,
                        isBillboard: isBillboard,
                        markerStart: markerStart,
                        markerEnd: markerEnd,
                        markerStartOffset: markerStartOffset,
                        markerEndOffset: markerEndOffset,
                    };
                }
                else if (object.nodeName === gLite.Shape.PATH) {
                    var _b = object.parsedStyle, absolutePath = _b.path.absolutePath, defX_4 = _b.defX, defY_4 = _b.defY, lineCap = _b.lineCap, markerStart = _b.markerStart, markerEnd = _b.markerEnd, markerStartOffset = _b.markerStartOffset, markerEndOffset = _b.markerEndOffset, isBillboard = _b.isBillboard, isSizeAttenuation = _b.isSizeAttenuation;
                    parsedLineStyleProps = {
                        x1: absolutePath[0][1],
                        y1: absolutePath[0][2],
                        x2: absolutePath[1][1],
                        y2: absolutePath[1][2],
                        z1: 0,
                        z2: 0,
                        defX: defX_4,
                        defY: defY_4,
                        lineCap: lineCap,
                        isBillboard: isBillboard,
                        isSizeAttenuation: isSizeAttenuation,
                        markerStart: markerStart,
                        markerEnd: markerEnd,
                        markerStartOffset: markerStartOffset,
                        markerEndOffset: markerEndOffset,
                    };
                }
                var x1 = parsedLineStyleProps.x1, y1 = parsedLineStyleProps.y1, x2 = parsedLineStyleProps.x2, y2 = parsedLineStyleProps.y2, z1 = parsedLineStyleProps.z1, z2 = parsedLineStyleProps.z2, defX = parsedLineStyleProps.defX, defY = parsedLineStyleProps.defY;
                var _c = _this.calcOffset(parsedLineStyleProps), startOffsetX = _c.startOffsetX, startOffsetY = _c.startOffsetY, endOffsetX = _c.endOffsetX, endOffsetY = _c.endOffsetY;
                packed_1.push(x1 - defX + startOffsetX, y1 - defY + startOffsetY, z1, x2 - defX + endOffsetX, y2 - defY + endOffsetY, z2);
            });
            this.geometry.updateVertexBuffer(InstancedLineVertexAttributeBufferIndex.POINT, InstancedLineVertexAttributeLocation.POINTA, startIndex, new Uint8Array(new Float32Array(packed_1).buffer));
        }
        else if (name === 'lineDashOffset' ||
            name === 'lineDash' ||
            name === 'isSizeAttenuation' ||
            name === 'isBillboard') {
            var packed_2 = [];
            objects.forEach(function (object) {
                var totalLength = object.getTotalLength();
                var _a = _this.calcDash(object.parsedStyle, totalLength), dashOffset = _a.dashOffset, dashSegmentPercent = _a.dashSegmentPercent, dashRatioInEachSegment = _a.dashRatioInEachSegment;
                packed_2.push(dashOffset, dashSegmentPercent, dashRatioInEachSegment, object.parsedStyle.isBillboard || object.parsedStyle.isSizeAttenuation
                    ? 1
                    : 0);
            });
            this.geometry.updateVertexBuffer(InstancedLineVertexAttributeBufferIndex.DASH, InstancedLineVertexAttributeLocation.DASH, startIndex, new Uint8Array(new Float32Array(packed_2).buffer));
        }
        else if (name === 'lineCap') {
            var packed_3 = [];
            objects.forEach(function (object) {
                var lineCap = object.parsedStyle.lineCap;
                packed_3.push(LineCap_MAP[lineCap]);
            });
            this.geometry.updateVertexBuffer(InstancedLineVertexAttributeBufferIndex.CAP, InstancedLineVertexAttributeLocation.CAP, startIndex, new Uint8Array(new Float32Array(packed_3).buffer));
        }
    };
    InstancedLineDrawcall.prototype.calcOffset = function (parsedStyle) {
        var x1 = parsedStyle.x1, y1 = parsedStyle.y1, x2 = parsedStyle.x2, y2 = parsedStyle.y2, markerStart = parsedStyle.markerStart, markerEnd = parsedStyle.markerEnd, markerStartOffset = parsedStyle.markerStartOffset, markerEndOffset = parsedStyle.markerEndOffset;
        var startOffsetX = 0;
        var startOffsetY = 0;
        var endOffsetX = 0;
        var endOffsetY = 0;
        var rad = 0;
        var x;
        var y;
        if (markerStart && gLite.isDisplayObject(markerStart) && markerStartOffset) {
            x = x2 - x1;
            y = y2 - y1;
            rad = Math.atan2(y, x);
            startOffsetX = Math.cos(rad) * (markerStartOffset || 0);
            startOffsetY = Math.sin(rad) * (markerStartOffset || 0);
        }
        if (markerEnd && gLite.isDisplayObject(markerEnd) && markerEndOffset) {
            x = x1 - x2;
            y = y1 - y2;
            rad = Math.atan2(y, x);
            endOffsetX = Math.cos(rad) * (markerEndOffset || 0);
            endOffsetY = Math.sin(rad) * (markerEndOffset || 0);
        }
        return {
            startOffsetX: startOffsetX,
            startOffsetY: startOffsetY,
            endOffsetX: endOffsetX,
            endOffsetY: endOffsetY,
        };
    };
    InstancedLineDrawcall.prototype.calcDash = function (parsedLineStyle, totalLength) {
        var lineDash = parsedLineStyle.lineDash, lineDashOffset = parsedLineStyle.lineDashOffset;
        var dashOffset = 0;
        var dashSegmentPercent = 1;
        var dashRatioInEachSegment = 0;
        if (lineDash && lineDash.length) {
            dashOffset = (lineDashOffset || 0) / totalLength;
            var segmentsLength = lineDash.reduce(function (cur, prev) { return cur + prev; }, 0);
            if (segmentsLength === 0) {
                dashSegmentPercent = 1;
                dashRatioInEachSegment = 0;
            }
            else {
                dashSegmentPercent = segmentsLength / totalLength;
                dashRatioInEachSegment = lineDash[1] / segmentsLength;
            }
        }
        return {
            dashOffset: dashOffset,
            dashSegmentPercent: dashSegmentPercent,
            dashRatioInEachSegment: dashRatioInEachSegment,
        };
    };
    return InstancedLineDrawcall;
}(Instanced));

var frag$1 = "#define GLSLIFY 1\nlayout(std140) uniform ub_SceneParams {\n  mat4 u_ProjectionMatrix;\n  mat4 u_ViewMatrix;\n  vec3 u_CameraPosition;\n  float u_DevicePixelRatio;\n  vec2 u_Viewport;\n  float u_IsOrtho;\n  float u_IsPicking;\n};\n\nin vec4 v_PickingResult;\nin vec4 v_Color;\nin vec4 v_StrokeColor;\nin vec4 v_StylePacked1;\nin vec4 v_StylePacked2;\n#ifdef USE_UV\n  in vec2 v_Uv;\n#endif\n#ifdef USE_MAP\n  uniform sampler2D u_Map;\n#endif\n\nout vec4 outputColor;\n\nfloat epsilon = 0.000001;\n\nvoid main() {\n  vec4 u_Color = v_Color;\nvec4 u_StrokeColor = v_StrokeColor;\nfloat u_Opacity = v_StylePacked1.x;\nfloat u_FillOpacity = v_StylePacked1.y;\nfloat u_StrokeOpacity = v_StylePacked1.z;\nfloat u_StrokeWidth = v_StylePacked1.w;\nfloat u_Visible = v_StylePacked2.x;\nvec3 u_PickingColor = v_PickingResult.xyz;\n\nif (u_Visible < 0.5) {\n    discard;\n}\n  #ifdef USE_MAP\n  #ifdef USE_PATTERN\n    vec4 texelColor = texture(SAMPLER_2D(u_Map), v_Uv);\n    u_Color = texelColor;\n  #else\n    vec4 texelColor = texture(SAMPLER_2D(u_Map), v_Uv);\n    u_Color = texelColor;\n  #endif\n#endif\n\n  if (u_IsPicking > 0.5) {\n    if (u_PickingColor.x == 0.0 && u_PickingColor.y == 0.0 && u_PickingColor.z == 0.0) {\n      discard;\n    }\n\n    // TODO: pointer-events: non-transparent-pixel\n    // if (u_Color.x == 0.0 && u_Color.y == 0.0 && u_Color.z == 0.0) {\n    //   discard;\n    // }\n    outputColor = vec4(u_PickingColor, 1.0);\n  } else {\n    outputColor = u_Color;\n    outputColor.a = outputColor.a * u_Opacity;\n\n    if (outputColor.a < epsilon) {\n      discard;\n    }\n  }\n}"; // eslint-disable-line

var vert$1 = "#define GLSLIFY 1\nlayout(std140) uniform ub_SceneParams {\n  mat4 u_ProjectionMatrix;\n  mat4 u_ViewMatrix;\n  vec3 u_CameraPosition;\n  float u_DevicePixelRatio;\n  vec2 u_Viewport;\n  float u_IsOrtho;\n  float u_IsPicking;\n};\nlayout(location = MODEL_MATRIX0) in vec4 a_ModelMatrix0;\nlayout(location = MODEL_MATRIX1) in vec4 a_ModelMatrix1;\nlayout(location = MODEL_MATRIX2) in vec4 a_ModelMatrix2;\nlayout(location = MODEL_MATRIX3) in vec4 a_ModelMatrix3;\nlayout(location = PACKED_COLOR) in vec4 a_PackedColor;\nlayout(location = PACKED_STYLE1) in vec4 a_StylePacked1;\nlayout(location = PACKED_STYLE2) in vec4 a_StylePacked2;\nlayout(location = PICKING_COLOR) in vec4 a_PickingColor;\n\nout vec4 v_PickingResult;\nout vec4 v_Color;\nout vec4 v_StrokeColor;\nout vec4 v_StylePacked1;\nout vec4 v_StylePacked2;\n\n#define COLOR_SCALE 1. / 255.\nvoid setPickingColor(vec3 pickingColor) {\n  v_PickingResult.rgb = pickingColor * COLOR_SCALE;\n}\n\nvec2 unpack_float(const float packedValue) {\n  int packedIntValue = int(packedValue);\n  int v0 = packedIntValue / 256;\n  return vec2(v0, packedIntValue - v0 * 256);\n}\nvec4 decode_color(const vec2 encodedColor) {\n  return vec4(\n    unpack_float(encodedColor[0]) / 255.0,\n    unpack_float(encodedColor[1]) / 255.0\n  );\n}\nvec4 project(vec4 pos, mat4 pm, mat4 vm, mat4 mm) {\n  return pm * vm * mm * pos;\n}\n\nbool isPerspectiveMatrix(mat4 m) {\n  return m[2][3] == -1.0;\n}\n\nvec4 billboard(vec2 offset, float rotation, bool isSizeAttenuation, mat4 pm, mat4 vm, mat4 mm) {\n  vec4 mvPosition = vm * mm * vec4(0.0, 0.0, 0.0, 1.0);\n  vec2 scale;\n  scale.x = length(vec3(mm[0][0], mm[0][1], mm[0][2]));\n  scale.y = length(vec3(mm[1][0], mm[1][1], mm[1][2]));\n\n  if (isSizeAttenuation) {\n    bool isPerspective = isPerspectiveMatrix(pm);\n    if (isPerspective) {\n      scale *= -mvPosition.z / 250.0;\n    }\n  }\n\n  vec2 alignedPosition = offset * scale;\n  vec2 rotatedPosition;\n  rotatedPosition.x = cos(rotation) * alignedPosition.x - sin(rotation) * alignedPosition.y;\n  rotatedPosition.y = sin(rotation) * alignedPosition.x + cos(rotation) * alignedPosition.y;\n\n  mvPosition.xy += rotatedPosition;\n  return pm * mvPosition;\n}\n\nlayout(location = POSITION) in vec2 a_Size;\nlayout(location = PACKED_STYLE3) in vec4 a_StylePacked3;\n\n#ifdef USE_UV\n  layout(location = UV) in vec2 a_Uv;\n  out vec2 v_Uv;\n#endif\n\nvoid main() {\n  vec4 a_Color = decode_color(a_PackedColor.xy);\nvec4 a_StrokeColor = decode_color(a_PackedColor.zw);\n\nmat4 u_ModelMatrix = mat4(a_ModelMatrix0, a_ModelMatrix1, a_ModelMatrix2, a_ModelMatrix3);\nvec4 u_StrokeColor = a_StrokeColor;\nfloat u_Opacity = a_StylePacked1.x;\nfloat u_FillOpacity = a_StylePacked1.y;\nfloat u_StrokeOpacity = a_StylePacked1.z;\nfloat u_StrokeWidth = a_StylePacked1.w;\nfloat u_ZIndex = a_PickingColor.w;\nvec2 u_Anchor = a_StylePacked2.yz;\nfloat u_IncreasedLineWidthForHitTesting = a_StylePacked2.w;\n\nsetPickingColor(a_PickingColor.xyz);\n\nv_Color = a_Color;\nv_StrokeColor = a_StrokeColor;\nv_StylePacked1 = a_StylePacked1;\nv_StylePacked2 = a_StylePacked2;\n\n// #ifdef CLIPSPACE_NEAR_ZERO\n//     gl_Position.z = (gl_Position.z + gl_Position.w) * 0.5;\n// #endif\n\n  vec2 offset = (a_Uv - u_Anchor.xy) * a_Size;\n\n  bool isBillboard = a_StylePacked3.x > 0.5;\n  if (isBillboard) {\n    float rotation = a_StylePacked3.y;\n    bool isSizeAttenuation = a_StylePacked3.z > 0.5;\n    gl_Position = billboard(offset, rotation, isSizeAttenuation, u_ProjectionMatrix, u_ViewMatrix, u_ModelMatrix);\n  } else {\n    gl_Position = project(vec4(offset, u_ZIndex, 1.0), u_ProjectionMatrix, u_ViewMatrix, u_ModelMatrix);\n  }\n\n  #ifdef USE_UV\n  v_Uv = a_Uv;\n#endif\n\n}"; // eslint-disable-line

var ImageVertexAttributeBufferIndex;
(function (ImageVertexAttributeBufferIndex) {
    ImageVertexAttributeBufferIndex[ImageVertexAttributeBufferIndex["PACKED_STYLE"] = 5] = "PACKED_STYLE";
})(ImageVertexAttributeBufferIndex || (ImageVertexAttributeBufferIndex = {}));
var ImageVertexAttributeLocation;
(function (ImageVertexAttributeLocation) {
    ImageVertexAttributeLocation[ImageVertexAttributeLocation["PACKED_STYLE3"] = 12] = "PACKED_STYLE3";
})(ImageVertexAttributeLocation || (ImageVertexAttributeLocation = {}));
var ImageDrawcall = /** @class */ (function (_super) {
    tslib.__extends(ImageDrawcall, _super);
    function ImageDrawcall() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ImageDrawcall.prototype.shouldMerge = function (object, index) {
        var shouldMerge = _super.prototype.shouldMerge.call(this, object, index);
        if (!shouldMerge) {
            return false;
        }
        if (this.instance.parsedStyle.img !== object.parsedStyle.img) {
            return false;
        }
        return true;
    };
    ImageDrawcall.prototype.createMaterial = function (objects) {
        var instance = objects[0];
        var img = instance.parsedStyle.img;
        this.material.defines = tslib.__assign(tslib.__assign({}, this.material.defines), enumToObject(ImageVertexAttributeLocation));
        this.material.vertexShader = vert$1;
        this.material.fragmentShader = frag$1;
        var map = this.texturePool.getOrCreateTexture(this.context.device, img);
        this.material.setUniforms({
            u_Map: map,
        });
    };
    ImageDrawcall.prototype.createGeometry = function (objects) {
        // use default common attributes
        _super.prototype.createGeometry.call(this, objects);
        var instanced = [];
        var packedStyle = [];
        objects.forEach(function (object, i) {
            var image = object;
            var _a = image.parsedStyle, width = _a.width, height = _a.height, isBillboard = _a.isBillboard, billboardRotation = _a.billboardRotation, isSizeAttenuation = _a.isSizeAttenuation;
            instanced.push(width, height);
            packedStyle.push(isBillboard ? 1 : 0, billboardRotation !== null && billboardRotation !== void 0 ? billboardRotation : 0, isSizeAttenuation ? 1 : 0, 0);
        });
        this.geometry.setIndexBuffer(new Uint32Array([0, 2, 1, 0, 3, 2]));
        this.geometry.vertexCount = 6;
        this.geometry.setVertexBuffer({
            bufferIndex: exports.VertexAttributeBufferIndex.POSITION,
            byteStride: 4 * 2,
            stepMode: gDeviceApi.VertexStepMode.INSTANCE,
            attributes: [
                {
                    format: gDeviceApi.Format.F32_RG,
                    bufferByteOffset: 4 * 0,
                    location: exports.VertexAttributeLocation.POSITION,
                },
            ],
            data: new Float32Array(instanced),
        });
        this.geometry.setVertexBuffer({
            bufferIndex: ImageVertexAttributeBufferIndex.PACKED_STYLE,
            byteStride: 4 * 4,
            stepMode: gDeviceApi.VertexStepMode.INSTANCE,
            attributes: [
                {
                    format: gDeviceApi.Format.F32_RGBA,
                    bufferByteOffset: 4 * 0,
                    location: ImageVertexAttributeLocation.PACKED_STYLE3,
                    divisor: 1,
                },
            ],
            data: new Float32Array(packedStyle),
        });
        this.geometry.setVertexBuffer({
            bufferIndex: exports.VertexAttributeBufferIndex.UV,
            byteStride: 4 * 2,
            stepMode: gDeviceApi.VertexStepMode.VERTEX,
            attributes: [
                {
                    format: gDeviceApi.Format.F32_RG,
                    bufferByteOffset: 4 * 0,
                    location: exports.VertexAttributeLocation.UV,
                },
            ],
            data: new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]),
        });
    };
    ImageDrawcall.prototype.updateAttribute = function (objects, startIndex, name, value) {
        _super.prototype.updateAttribute.call(this, objects, startIndex, name, value);
        this.updateBatchedAttribute(objects, startIndex, name, value);
        if (name === 'width' || name === 'height' || name === 'z') {
            var packed_1 = [];
            objects.forEach(function (object) {
                var image = object;
                var _a = image.parsedStyle, width = _a.width, height = _a.height;
                packed_1.push(width, height);
            });
            this.geometry.updateVertexBuffer(exports.VertexAttributeBufferIndex.POSITION, exports.VertexAttributeLocation.POSITION, startIndex, new Uint8Array(new Float32Array(packed_1).buffer));
        }
        else if (name === 'isBillboard' ||
            name === 'billboardRotation' ||
            name === 'isSizeAttenuation') {
            var packed_2 = [];
            objects.forEach(function (object) {
                var image = object;
                var _a = image.parsedStyle, isBillboard = _a.isBillboard, billboardRotation = _a.billboardRotation, isSizeAttenuation = _a.isSizeAttenuation;
                packed_2.push(isBillboard ? 1 : 0, billboardRotation !== null && billboardRotation !== void 0 ? billboardRotation : 0, isSizeAttenuation ? 1 : 0, 0);
            });
            this.geometry.updateVertexBuffer(ImageVertexAttributeBufferIndex.PACKED_STYLE, ImageVertexAttributeLocation.PACKED_STYLE3, startIndex, new Uint8Array(new Float32Array(packed_2).buffer));
        }
        else if (name === 'img') {
            var map = this.texturePool.getOrCreateTexture(this.context.device, value);
            this.material.setUniforms({
                u_Map: map,
            });
        }
    };
    return ImageDrawcall;
}(Instanced));

var frag = "#define GLSLIFY 1\nlayout(std140) uniform ub_SceneParams {\n  mat4 u_ProjectionMatrix;\n  mat4 u_ViewMatrix;\n  vec3 u_CameraPosition;\n  float u_DevicePixelRatio;\n  vec2 u_Viewport;\n  float u_IsOrtho;\n  float u_IsPicking;\n};\nin vec4 v_PickingResult;\nin vec4 v_Color;\nin vec4 v_StrokeColor;\nin vec4 v_StylePacked1;\nin vec4 v_StylePacked2;\nlayout(std140) uniform ub_ObjectParams {\n  vec2 u_SDFMapSize;\n  float u_FontSize;\n  float u_GammaScale;\n  float u_StrokeBlur;\n  float u_HasStroke;\n};\n#ifdef USE_UV\n  in vec2 v_Uv;\n#endif\n\nuniform sampler2D u_SDFMap;\n\n#define SDF_PX 8.0\n\nout vec4 outputColor;\nfloat epsilon = 0.000001;\n\nvoid main() {\n  vec4 u_Color = v_Color;\nvec4 u_StrokeColor = v_StrokeColor;\nfloat u_Opacity = v_StylePacked1.x;\nfloat u_FillOpacity = v_StylePacked1.y;\nfloat u_StrokeOpacity = v_StylePacked1.z;\nfloat u_StrokeWidth = v_StylePacked1.w;\nfloat u_Visible = v_StylePacked2.x;\nvec3 u_PickingColor = v_PickingResult.xyz;\n\nif (u_Visible < 0.5) {\n    discard;\n}\n\n  float dist = texture(SAMPLER_2D(u_SDFMap), v_Uv).a;\n\n  float fontScale = u_FontSize / 24.0;\n  lowp vec4 color = u_Color;\n  lowp float buff = (256.0 - 64.0) / 256.0;\n  float opacity = u_FillOpacity;\n  if (u_HasStroke > 0.5 && u_StrokeWidth > 0.0) {\n    color = u_StrokeColor;\n    buff = (6.0 - u_StrokeWidth / fontScale / 2.0) / SDF_PX;\n    opacity = u_StrokeOpacity;\n  }\n\n  highp float gamma_scaled = fwidth(dist);\n  highp float alpha = smoothstep(buff - gamma_scaled, buff + gamma_scaled, dist);\n\n  opacity *= alpha * u_Opacity;\n\n  if (u_IsPicking > 0.5) {\n    if (u_PickingColor.x == 0.0 && u_PickingColor.y == 0.0 && u_PickingColor.z == 0.0) {\n      discard;\n    }\n    outputColor = vec4(u_PickingColor, 1.0);\n  } else {\n\n    if (opacity < epsilon) {\n      discard;\n    }\n\n    outputColor = color;\n    outputColor.a *= opacity;\n  }\n}"; // eslint-disable-line

var vert = "#define GLSLIFY 1\nlayout(std140) uniform ub_SceneParams {\n  mat4 u_ProjectionMatrix;\n  mat4 u_ViewMatrix;\n  vec3 u_CameraPosition;\n  float u_DevicePixelRatio;\n  vec2 u_Viewport;\n  float u_IsOrtho;\n  float u_IsPicking;\n};\nlayout(location = MODEL_MATRIX0) in vec4 a_ModelMatrix0;\nlayout(location = MODEL_MATRIX1) in vec4 a_ModelMatrix1;\nlayout(location = MODEL_MATRIX2) in vec4 a_ModelMatrix2;\nlayout(location = MODEL_MATRIX3) in vec4 a_ModelMatrix3;\nlayout(location = PACKED_COLOR) in vec4 a_PackedColor;\nlayout(location = PACKED_STYLE1) in vec4 a_StylePacked1;\nlayout(location = PACKED_STYLE2) in vec4 a_StylePacked2;\nlayout(location = PICKING_COLOR) in vec4 a_PickingColor;\n\nout vec4 v_PickingResult;\nout vec4 v_Color;\nout vec4 v_StrokeColor;\nout vec4 v_StylePacked1;\nout vec4 v_StylePacked2;\n\n#define COLOR_SCALE 1. / 255.\nvoid setPickingColor(vec3 pickingColor) {\n  v_PickingResult.rgb = pickingColor * COLOR_SCALE;\n}\n\nvec2 unpack_float(const float packedValue) {\n  int packedIntValue = int(packedValue);\n  int v0 = packedIntValue / 256;\n  return vec2(v0, packedIntValue - v0 * 256);\n}\nvec4 decode_color(const vec2 encodedColor) {\n  return vec4(\n    unpack_float(encodedColor[0]) / 255.0,\n    unpack_float(encodedColor[1]) / 255.0\n  );\n}\n\nlayout(std140) uniform ub_ObjectParams {\n  vec2 u_SDFMapSize;\n  float u_FontSize;\n  float u_GammaScale;\n  float u_StrokeBlur;\n  float u_HasStroke;\n};\nvec4 project(vec4 pos, mat4 pm, mat4 vm, mat4 mm) {\n  return pm * vm * mm * pos;\n}\n\nbool isPerspectiveMatrix(mat4 m) {\n  return m[2][3] == -1.0;\n}\n\nvec4 billboard(vec2 offset, float rotation, bool isSizeAttenuation, mat4 pm, mat4 vm, mat4 mm) {\n  vec4 mvPosition = vm * mm * vec4(0.0, 0.0, 0.0, 1.0);\n  vec2 scale;\n  scale.x = length(vec3(mm[0][0], mm[0][1], mm[0][2]));\n  scale.y = length(vec3(mm[1][0], mm[1][1], mm[1][2]));\n\n  if (isSizeAttenuation) {\n    bool isPerspective = isPerspectiveMatrix(pm);\n    if (isPerspective) {\n      scale *= -mvPosition.z / 250.0;\n    }\n  }\n\n  vec2 alignedPosition = offset * scale;\n  vec2 rotatedPosition;\n  rotatedPosition.x = cos(rotation) * alignedPosition.x - sin(rotation) * alignedPosition.y;\n  rotatedPosition.y = sin(rotation) * alignedPosition.x + cos(rotation) * alignedPosition.y;\n\n  mvPosition.xy += rotatedPosition;\n  return pm * mvPosition;\n}\n\nlayout(location = TEX) in vec2 a_Tex;\nlayout(location = OFFSET) in vec2 a_Offset;\n\nout vec2 v_Uv;\n\nvoid main() {\n  vec4 a_Color = decode_color(a_PackedColor.xy);\nvec4 a_StrokeColor = decode_color(a_PackedColor.zw);\n\nmat4 u_ModelMatrix = mat4(a_ModelMatrix0, a_ModelMatrix1, a_ModelMatrix2, a_ModelMatrix3);\nvec4 u_StrokeColor = a_StrokeColor;\nfloat u_Opacity = a_StylePacked1.x;\nfloat u_FillOpacity = a_StylePacked1.y;\nfloat u_StrokeOpacity = a_StylePacked1.z;\nfloat u_StrokeWidth = a_StylePacked1.w;\nfloat u_ZIndex = a_PickingColor.w;\nvec2 u_Anchor = a_StylePacked2.yz;\nfloat u_IncreasedLineWidthForHitTesting = a_StylePacked2.w;\n\nsetPickingColor(a_PickingColor.xyz);\n\nv_Color = a_Color;\nv_StrokeColor = a_StrokeColor;\nv_StylePacked1 = a_StylePacked1;\nv_StylePacked2 = a_StylePacked2;\n\n// #ifdef CLIPSPACE_NEAR_ZERO\n//     gl_Position.z = (gl_Position.z + gl_Position.w) * 0.5;\n// #endif\n\n  v_Uv = a_Tex / u_SDFMapSize;\n  float fontScale = u_FontSize / 24.;\n\n  vec2 bufferOffset = vec2(0.7, 2.0);\n  vec2 offset = a_Offset * fontScale + bufferOffset;\n\n  bool isBillboard = a_StylePacked2.y > 0.5;\n  if (isBillboard) {\n    float rotation =  a_StylePacked2.w;\n    bool isSizeAttenuation = a_StylePacked2.z > 0.5;\n    gl_Position = billboard(offset, rotation, isSizeAttenuation, u_ProjectionMatrix, u_ViewMatrix, u_ModelMatrix);\n  } else {\n    gl_Position = project(vec4((a_Offset) * fontScale + bufferOffset, u_ZIndex, 1.0), u_ProjectionMatrix, u_ViewMatrix, u_ModelMatrix);\n  }\n}"; // eslint-disable-line

// borrow from mapbox/src/symbol
function createImage(image, _a, channels, data) {
    var width = _a.width, height = _a.height;
    if (!data) {
        data = new Uint8Array(width * height * channels);
    }
    else if (data.length !== width * height * channels) {
        throw new RangeError('mismatched image size');
    }
    image.width = width;
    image.height = height;
    image.data = data;
    return image;
}
function resizeImage(image, _a, channels) {
    var width = _a.width, height = _a.height;
    if (width === image.width && height === image.height) {
        return;
    }
    var newImage = createImage({}, { width: width, height: height }, channels);
    copyImage(image, newImage, { x: 0, y: 0 }, { x: 0, y: 0 }, {
        width: Math.min(image.width, width),
        height: Math.min(image.height, height),
    }, channels);
    image.width = width;
    image.height = height;
    image.data = newImage.data;
}
function copyImage(srcImg, dstImg, srcPt, dstPt, size, channels) {
    if (size.width === 0 || size.height === 0) {
        return dstImg;
    }
    if (size.width > srcImg.width ||
        size.height > srcImg.height ||
        srcPt.x > srcImg.width - size.width ||
        srcPt.y > srcImg.height - size.height) {
        throw new RangeError('out of range source coordinates for image copy');
    }
    if (size.width > dstImg.width ||
        size.height > dstImg.height ||
        dstPt.x > dstImg.width - size.width ||
        dstPt.y > dstImg.height - size.height) {
        throw new RangeError('out of range destination coordinates for image copy');
    }
    var srcData = srcImg.data;
    var dstData = dstImg.data;
    for (var y = 0; y < size.height; y++) {
        var srcOffset = ((srcPt.y + y) * srcImg.width + srcPt.x) * channels;
        var dstOffset = ((dstPt.y + y) * dstImg.width + dstPt.x) * channels;
        for (var i = 0; i < size.width * channels; i++) {
            dstData[dstOffset + i] = srcData[srcOffset + i];
        }
    }
    return dstImg;
}
var AlphaImage = /** @class */ (function () {
    function AlphaImage(size, data) {
        createImage(this, size, 1, data);
    }
    AlphaImage.prototype.resize = function (size) {
        resizeImage(this, size, 1);
    };
    AlphaImage.prototype.clone = function () {
        return new AlphaImage({ width: this.width, height: this.height }, new Uint8Array(this.data));
    };
    AlphaImage.copy = function (srcImg, dstImg, srcPt, dstPt, size) {
        copyImage(srcImg, dstImg, srcPt, dstPt, size, 1);
    };
    return AlphaImage;
}());

// borrow from https://github.com/mapbox/potpack/blob/master/index.mjs
// @see https://github.com/antvis/g/issues/836
function potpack(boxes) {
    var e_1, _a, e_2, _b;
    // calculate total box area and maximum box width
    var area = 0;
    var maxWidth = 0;
    try {
        for (var boxes_1 = tslib.__values(boxes), boxes_1_1 = boxes_1.next(); !boxes_1_1.done; boxes_1_1 = boxes_1.next()) {
            var box = boxes_1_1.value;
            area += box.w * box.h;
            maxWidth = Math.max(maxWidth, box.w);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (boxes_1_1 && !boxes_1_1.done && (_a = boxes_1.return)) _a.call(boxes_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    // sort the boxes for insertion by height, descending
    boxes.sort(function (a, b) { return b.h - a.h; });
    // aim for a squarish resulting container,
    // slightly adjusted for sub-100% space utilization
    var startWidth = Math.max(Math.ceil(Math.sqrt(area / 0.95)), maxWidth);
    // start with a single empty space, unbounded at the bottom
    var spaces = [{ x: 0, y: 0, w: startWidth, h: Infinity }];
    var width = 0;
    var height = 0;
    try {
        for (var boxes_2 = tslib.__values(boxes), boxes_2_1 = boxes_2.next(); !boxes_2_1.done; boxes_2_1 = boxes_2.next()) {
            var box = boxes_2_1.value;
            // look through spaces backwards so that we check smaller spaces first
            for (var i = spaces.length - 1; i >= 0; i--) {
                var space = spaces[i];
                // look for empty spaces that can accommodate the current box
                if (box.w > space.w || box.h > space.h)
                    continue;
                // found the space; add the box to its top-left corner
                // |-------|-------|
                // |  box  |       |
                // |_______|       |
                // |         space |
                // |_______________|
                box.x = space.x;
                box.y = space.y;
                height = Math.max(height, box.y + box.h);
                width = Math.max(width, box.x + box.w);
                if (box.w === space.w && box.h === space.h) {
                    // space matches the box exactly; remove it
                    var last = spaces.pop();
                    if (i < spaces.length)
                        spaces[i] = last;
                }
                else if (box.h === space.h) {
                    // space matches the box height; update it accordingly
                    // |-------|---------------|
                    // |  box  | updated space |
                    // |_______|_______________|
                    space.x += box.w;
                    space.w -= box.w;
                }
                else if (box.w === space.w) {
                    // space matches the box width; update it accordingly
                    // |---------------|
                    // |      box      |
                    // |_______________|
                    // | updated space |
                    // |_______________|
                    space.y += box.h;
                    space.h -= box.h;
                }
                else {
                    // otherwise the box splits the space into two spaces
                    // |-------|-----------|
                    // |  box  | new space |
                    // |_______|___________|
                    // | updated space     |
                    // |___________________|
                    spaces.push({
                        x: space.x + box.w,
                        y: space.y,
                        w: space.w - box.w,
                        h: box.h,
                    });
                    space.y += box.h;
                    space.h -= box.h;
                }
                break;
            }
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (boxes_2_1 && !boxes_2_1.done && (_b = boxes_2.return)) _b.call(boxes_2);
        }
        finally { if (e_2) throw e_2.error; }
    }
    return {
        w: width, // container width
        h: height, // container height
        fill: area / (width * height) || 0, // space utilization
    };
}
var padding = 1;
/**
 * Merge SDFs into a large squared atlas with `potpack`,
 * because on WebGL1 context, all textures are resized to a power of two to produce the best quality.
 *
 * @see https://doc.babylonjs.com/advanced_topics/webGL2#power-of-two-textures
 */
var GlyphAtlas = /** @class */ (function () {
    function GlyphAtlas(stacks) {
        var positions = {};
        var bins = [];
        for (var stack in stacks) {
            var glyphs = stacks[stack];
            // @ts-ignore
            var stackPositions = (positions[stack] = {});
            for (var id in glyphs) {
                var src = glyphs[+id];
                if (!src || src.bitmap.width === 0 || src.bitmap.height === 0)
                    continue;
                var bin = {
                    x: 0,
                    y: 0,
                    w: src.bitmap.width + 2 * padding,
                    h: src.bitmap.height + 2 * padding,
                };
                bins.push(bin);
                // @ts-ignore
                stackPositions[id] = { rect: bin, metrics: src.metrics };
            }
        }
        var _a = potpack(bins), w = _a.w, h = _a.h;
        var image = new AlphaImage({ width: w || 1, height: h || 1 });
        for (var stack in stacks) {
            var glyphs = stacks[stack];
            for (var id in glyphs) {
                var src = glyphs[+id];
                if (!src || src.bitmap.width === 0 || src.bitmap.height === 0)
                    continue;
                // @ts-ignore
                var bin = positions[stack][id].rect;
                AlphaImage.copy(src.bitmap, image, { x: 0, y: 0 }, { x: bin.x + padding, y: bin.y + padding }, src.bitmap);
            }
        }
        this.image = image;
        this.positions = positions;
    }
    return GlyphAtlas;
}());

var BASE_FONT_WIDTH = 24;
var BASE_FONT_BUFFER = 3;
var fontSize = BASE_FONT_WIDTH; // Font size in pixels
var buffer = BASE_FONT_BUFFER; // Whitespace buffer around a glyph in pixels
var radius = 8; // How many pixels around the glyph shape to use for encoding distance
var cutoff = 0.25; // How much of the radius (relative) is used for the inside part the glyph
function getDefaultCharacterSet() {
    var charSet = [];
    for (var i = 32; i < 128; i++) {
        charSet.push(String.fromCharCode(i));
    }
    return charSet;
}
/**
 * TODO: use one atlas for all fontstacks, each fontstack has one texture now
 */
var GlyphManager = /** @class */ (function () {
    function GlyphManager(runtime) {
        this.runtime = runtime;
        this.sdfGeneratorCache = {};
        this.textMetricsCache = {};
        this.glyphMap = {};
    }
    GlyphManager.prototype.getMap = function () {
        return this.glyphMap;
    };
    GlyphManager.prototype.getAtlas = function () {
        return this.glyphAtlas;
    };
    GlyphManager.prototype.getAtlasTexture = function () {
        return this.glyphAtlasTexture;
    };
    GlyphManager.prototype.layout = function (lines, fontStack, lineHeight, textAlign, letterSpacing, offsetX, offsetY) {
        var _this = this;
        var positionedGlyphs = [];
        var x = offsetX;
        var y = offsetY;
        var justify = textAlign === 'right' || textAlign === 'end'
            ? 1
            : textAlign === 'left' || textAlign === 'start'
                ? 0
                : 0.5;
        lines.forEach(function (line) {
            var lineStartIndex = positionedGlyphs.length;
            Array.from(line).forEach(function (char) {
                // fontStack
                var positions = _this.glyphMap[fontStack];
                var charCode = char.charCodeAt(0);
                var glyph = positions && positions[charCode];
                if (glyph) {
                    positionedGlyphs.push({
                        glyph: charCode,
                        x: x,
                        y: y,
                        scale: 1,
                        fontStack: fontStack,
                    });
                    x += glyph.metrics.advance + letterSpacing;
                }
            });
            var lineWidth = x - letterSpacing;
            for (var i = lineStartIndex; i < positionedGlyphs.length; i++) {
                positionedGlyphs[i].x = positionedGlyphs[i].x - justify * lineWidth;
            }
            x = 0;
            y += lineHeight;
        });
        return positionedGlyphs;
    };
    GlyphManager.prototype.generateAtlas = function (canvas, fontStack, fontFamily, fontWeight, fontStyle, text, device) {
        var _this = this;
        if (fontStack === void 0) { fontStack = ''; }
        if (fontStyle === void 0) { fontStyle = ''; }
        var newChars = [];
        if (!this.glyphMap[fontStack]) {
            newChars = getDefaultCharacterSet();
        }
        var existedChars = Object.keys(this.glyphMap[fontStack] || {});
        Array.from(new Set(text.split(''))).forEach(function (char) {
            if (existedChars.indexOf(char.charCodeAt(0).toString()) === -1) {
                newChars.push(char);
            }
        });
        if (newChars.length) {
            var glyphMap = newChars
                .map(function (char) {
                return _this.generateSDF(canvas, fontStack, fontFamily, fontWeight, fontStyle, char);
            })
                .reduce(function (prev, cur) {
                // @ts-ignore
                prev[cur.id] = cur;
                return prev;
            }, {});
            this.glyphMap[fontStack] = tslib.__assign(tslib.__assign({}, this.glyphMap[fontStack]), glyphMap);
            this.glyphAtlas = new GlyphAtlas(this.glyphMap);
            var _a = this.glyphAtlas.image, atlasWidth = _a.width, atlasHeight = _a.height, data = _a.data;
            if (this.glyphAtlasTexture) {
                this.glyphAtlasTexture.destroy();
            }
            this.glyphAtlasTexture = device.createTexture(tslib.__assign(tslib.__assign({}, gDeviceApi.makeTextureDescriptor2D(gDeviceApi.Format.ALPHA, atlasWidth, atlasHeight, 1)), { pixelStore: {
                    unpackFlipY: false,
                    unpackAlignment: 1,
                } }));
            this.glyphAtlasTexture.setImageData([data]);
        }
    };
    GlyphManager.prototype.generateSDF = function (canvas, fontStack, fontFamily, fontWeight, fontStyle, char) {
        if (fontStack === void 0) { fontStack = ''; }
        var charCode = char.charCodeAt(0);
        var sdfGenerator = this.sdfGeneratorCache[fontStack];
        if (!sdfGenerator) {
            // 创建 SDF
            sdfGenerator = this.sdfGeneratorCache[fontStack] =
                // TODO: use OffscreenCanvas in TextService
                new TinySDF({
                    canvas: canvas,
                    fontSize: fontSize,
                    fontFamily: fontFamily,
                    fontWeight: fontWeight,
                    fontStyle: fontStyle,
                    buffer: buffer,
                    radius: radius,
                    cutoff: cutoff,
                }, this.runtime);
        }
        if (!this.textMetricsCache[fontStack]) {
            this.textMetricsCache[fontStack] = {};
        }
        if (!this.textMetricsCache[fontStack][char]) {
            // 使用 mapbox/tiny-sdf 中的 context
            // @see https://stackoverflow.com/questions/46126565/how-to-get-font-glyphs-metrics-details-in-javascript
            this.textMetricsCache[fontStack][char] =
                // @ts-ignore
                sdfGenerator.ctx.measureText(char).width;
        }
        // use sdf 2.x @see https://github.com/mapbox/tiny-sdf
        var _a = sdfGenerator.draw(char), data = _a.data, width = _a.width, height = _a.height, glyphWidth = _a.glyphWidth, glyphHeight = _a.glyphHeight, glyphLeft = _a.glyphLeft, glyphTop = _a.glyphTop, glyphAdvance = _a.glyphAdvance;
        return {
            id: charCode,
            // 在 canvas 中绘制字符，使用 Uint8Array 存储 30*30 sdf 数据
            bitmap: new AlphaImage({
                width: width,
                height: height,
            }, data),
            metrics: {
                width: glyphWidth,
                height: glyphHeight,
                left: glyphLeft,
                top: glyphTop - BASE_FONT_WIDTH + BASE_FONT_BUFFER,
                advance: glyphAdvance,
            },
        };
    };
    return GlyphManager;
}());

/**
 * Create the quads used for rendering a text label.
 */
function getGlyphQuads(positionedGlyphs, positions) {
    var quads = [];
    for (var k = 0; k < positionedGlyphs.length; k++) {
        var positionedGlyph = positionedGlyphs[k];
        var glyphPositions = positions[positionedGlyph.fontStack];
        var glyph = glyphPositions && glyphPositions[positionedGlyph.glyph];
        if (!glyph)
            continue;
        var rect = glyph.rect;
        if (!rect)
            continue;
        // The rects have an addditional buffer that is not included in their size.
        var glyphPadding = 1.0;
        // const glyphPadding = 0.0;
        var rectBuffer = BASE_FONT_BUFFER + glyphPadding;
        var halfAdvance = (glyph.metrics.advance * positionedGlyph.scale) / 2;
        var glyphOffset = [0, 0];
        var builtInOffset = [positionedGlyph.x + halfAdvance, positionedGlyph.y];
        var x1 = (glyph.metrics.left - rectBuffer) * positionedGlyph.scale - halfAdvance + builtInOffset[0];
        var y1 = (-glyph.metrics.top - rectBuffer) * positionedGlyph.scale + builtInOffset[1];
        var x2 = x1 + rect.w * positionedGlyph.scale;
        var y2 = y1 + rect.h * positionedGlyph.scale;
        var tl = { x: x1, y: y1 };
        var tr = { x: x2, y: y1 };
        var bl = { x: x1, y: y2 };
        var br = { x: x2, y: y2 };
        quads.push({ tl: tl, tr: tr, bl: bl, br: br, tex: rect, glyphOffset: glyphOffset });
    }
    return quads;
}

var TextVertexAttributeBufferIndex;
(function (TextVertexAttributeBufferIndex) {
    TextVertexAttributeBufferIndex[TextVertexAttributeBufferIndex["INSTANCED"] = 5] = "INSTANCED";
    TextVertexAttributeBufferIndex[TextVertexAttributeBufferIndex["TEX"] = 6] = "TEX";
})(TextVertexAttributeBufferIndex || (TextVertexAttributeBufferIndex = {}));
var TextVertexAttributeLocation;
(function (TextVertexAttributeLocation) {
    TextVertexAttributeLocation[TextVertexAttributeLocation["TEX"] = 12] = "TEX";
    TextVertexAttributeLocation[TextVertexAttributeLocation["OFFSET"] = 13] = "OFFSET";
})(TextVertexAttributeLocation || (TextVertexAttributeLocation = {}));
exports.TextUniform = void 0;
(function (TextUniform) {
    TextUniform["SDF_MAP"] = "u_SDFMap";
    TextUniform["SDF_MAP_SIZE"] = "u_SDFMapSize";
    TextUniform["FONT_SIZE"] = "u_FontSize";
    TextUniform["GAMMA_SCALE"] = "u_GammaScale";
    TextUniform["STROKE_BLUR"] = "u_StrokeBlur";
    TextUniform["HAS_STROKE"] = "u_HasStroke";
})(exports.TextUniform || (exports.TextUniform = {}));
var TextDrawcall = /** @class */ (function (_super) {
    tslib.__extends(TextDrawcall, _super);
    function TextDrawcall(renderHelper, texturePool, lightPool, object, drawcallCtors, index, context) {
        var _this = _super.call(this, renderHelper, texturePool, lightPool, object, drawcallCtors, index, context) || this;
        _this.renderHelper = renderHelper;
        _this.texturePool = texturePool;
        _this.lightPool = lightPool;
        _this.packedBufferObjectMap = new WeakMap();
        _this.tmpMat4 = glMatrix.mat4.create();
        _this.fontHash = _this.calcFontHash(object);
        _this.glyphManager = new GlyphManager(_this.context);
        return _this;
    }
    TextDrawcall.prototype.calcFontHash = function (object) {
        var instancedAttributes = [
            'fontSize',
            'fontFamily',
            'fontWeight',
            'textBaseline',
            'letterSpacing',
        ];
        return (object.parsedStyle.metrics.font +
            instancedAttributes.reduce(function (prev, cur) {
                return prev + object.parsedStyle[cur];
            }, ''));
    };
    TextDrawcall.prototype.shouldMerge = function (object, index) {
        var shouldMerge = _super.prototype.shouldMerge.call(this, object, index);
        if (!shouldMerge) {
            return false;
        }
        if (this.index !== index) {
            return false;
        }
        return this.fontHash === this.calcFontHash(object);
    };
    TextDrawcall.prototype.createGeometry = function (objects) {
        var _this = this;
        var object = this.instance;
        var _a = object.parsedStyle, textBaseline = _a.textBaseline, fontSize = _a.fontSize, letterSpacing = _a.letterSpacing;
        // scale current font size to base(24)
        var fontScale = BASE_FONT_WIDTH / fontSize;
        var indices = [];
        var uvOffsets = [];
        var packed = [];
        var indicesOff = 0;
        objects.forEach(function (object) {
            var _a = object.parsedStyle, metrics = _a.metrics, dx = _a.dx, dy = _a.dy;
            var font = metrics.font, lines = metrics.lines, height = metrics.height, lineHeight = metrics.lineHeight;
            // account for dx & dy
            var offsetX = dx || 0;
            var offsetY = dy || 0;
            var linePositionY = 0;
            // handle vertical text baseline
            if (textBaseline === 'middle') {
                linePositionY = -height / 2;
            }
            else if (textBaseline === 'bottom') {
                linePositionY = -height;
            }
            else if (textBaseline === 'top' || textBaseline === 'hanging') {
                linePositionY = 0;
            }
            else if (textBaseline === 'alphabetic') {
                linePositionY = -height + lineHeight * 0.25;
                if (!_this.context.enableCSSParsing) {
                    linePositionY = -height;
                }
                // linePositionY = -height + fontProperties.ascent;
            }
            else if (textBaseline === 'ideographic') {
                linePositionY = -height;
            }
            var glyphAtlas = _this.glyphManager.getAtlas();
            var _b = _this.buildTextBuffers({
                object: object,
                lines: lines,
                fontStack: font,
                lineHeight: fontScale * lineHeight,
                offsetX: fontScale * offsetX,
                offsetY: fontScale * (linePositionY + offsetY),
                letterSpacing: fontScale * letterSpacing,
                glyphAtlas: glyphAtlas,
                indicesOffset: indicesOff,
            }), indicesOffset = _b.indicesOffset, indexBuffer = _b.indexBuffer, charUVOffsetBuffer = _b.charUVOffsetBuffer, charPackedBuffer = _b.charPackedBuffer;
            indicesOff = indicesOffset;
            var start = packed.length;
            packed.push.apply(packed, tslib.__spreadArray([], tslib.__read(charPackedBuffer), false));
            var end = packed.length;
            _this.packedBufferObjectMap.set(object, [start, end]);
            uvOffsets.push.apply(uvOffsets, tslib.__spreadArray([], tslib.__read(charUVOffsetBuffer), false));
            indices.push.apply(indices, tslib.__spreadArray([], tslib.__read(indexBuffer), false));
        });
        this.geometry.vertexCount = indices.length;
        this.geometry.setIndexBuffer(new Uint32Array(indices));
        this.geometry.setVertexBuffer({
            bufferIndex: TextVertexAttributeBufferIndex.INSTANCED,
            byteStride: 4 * (4 * 4 + 4 + 4 + 4 + 4), // 32
            stepMode: gDeviceApi.VertexStepMode.VERTEX,
            attributes: [
                {
                    format: gDeviceApi.Format.F32_RGBA,
                    bufferByteOffset: 4 * 0,
                    location: exports.VertexAttributeLocation.MODEL_MATRIX0,
                },
                {
                    format: gDeviceApi.Format.F32_RGBA,
                    bufferByteOffset: 4 * 4,
                    location: exports.VertexAttributeLocation.MODEL_MATRIX1,
                },
                {
                    format: gDeviceApi.Format.F32_RGBA,
                    bufferByteOffset: 4 * 8,
                    location: exports.VertexAttributeLocation.MODEL_MATRIX2,
                },
                {
                    format: gDeviceApi.Format.F32_RGBA,
                    bufferByteOffset: 4 * 12,
                    location: exports.VertexAttributeLocation.MODEL_MATRIX3,
                },
                {
                    format: gDeviceApi.Format.F32_RGBA,
                    bufferByteOffset: 4 * 16,
                    location: exports.VertexAttributeLocation.PACKED_COLOR,
                },
                {
                    format: gDeviceApi.Format.F32_RGBA,
                    bufferByteOffset: 4 * 20,
                    location: exports.VertexAttributeLocation.PACKED_STYLE1,
                },
                {
                    format: gDeviceApi.Format.F32_RGBA,
                    bufferByteOffset: 4 * 24,
                    location: exports.VertexAttributeLocation.PACKED_STYLE2,
                },
                {
                    format: gDeviceApi.Format.F32_RGBA,
                    bufferByteOffset: 4 * 28,
                    location: exports.VertexAttributeLocation.PICKING_COLOR,
                },
            ],
            data: new Float32Array(packed),
        });
        this.geometry.setVertexBuffer({
            bufferIndex: TextVertexAttributeBufferIndex.TEX,
            byteStride: 4 * (2 + 2),
            stepMode: gDeviceApi.VertexStepMode.VERTEX,
            attributes: [
                {
                    format: gDeviceApi.Format.F32_RG,
                    bufferByteOffset: 4 * 0,
                    location: TextVertexAttributeLocation.TEX,
                },
                {
                    format: gDeviceApi.Format.F32_RG,
                    bufferByteOffset: 4 * 2,
                    location: TextVertexAttributeLocation.OFFSET,
                },
            ],
            data: new Float32Array(uvOffsets),
        });
    };
    TextDrawcall.prototype.createMaterial = function (objects) {
        var _a;
        this.material.vertexShader = vert;
        this.material.fragmentShader = frag;
        this.material.cullMode = gDeviceApi.CullMode.BACK;
        this.material.defines = tslib.__assign(tslib.__assign({}, this.material.defines), enumToObject(TextVertexAttributeLocation));
        var object = this.instance;
        var _b = object.parsedStyle, fontSize = _b.fontSize, _c = _b.fontFamily, fontFamily = _c === void 0 ? '' : _c, _d = _b.fontWeight, fontWeight = _d === void 0 ? '' : _d, fontStyle = _b.fontStyle, metrics = _b.metrics;
        var font = metrics.font;
        var allText = objects.map(function (object) { return object.parsedStyle.text; }).join('');
        this.glyphManager.generateAtlas(this.texturePool.context.config.offscreenCanvas, font, fontFamily, fontWeight.toString(), fontStyle, allText, this.context.device);
        var glyphAtlasTexture = this.glyphManager.getAtlasTexture();
        var glyphAtlas = this.glyphManager.getAtlas();
        this.context.device.setResourceName(glyphAtlasTexture, 'TextSDF Texture');
        var _e = glyphAtlas.image, atlasWidth = _e.width, atlasHeight = _e.height;
        this.material.setUniforms((_a = {},
            _a[exports.TextUniform.SDF_MAP] = glyphAtlasTexture,
            _a[exports.TextUniform.SDF_MAP_SIZE] = [atlasWidth, atlasHeight],
            _a[exports.TextUniform.FONT_SIZE] = fontSize,
            _a[exports.TextUniform.GAMMA_SCALE] = 1,
            _a[exports.TextUniform.STROKE_BLUR] = 0.2,
            _a[exports.TextUniform.HAS_STROKE] = this.index,
            _a));
    };
    TextDrawcall.prototype.changeRenderOrder = function (object, renderOrder) {
        var vertice = this.geometry.vertices[TextVertexAttributeBufferIndex.INSTANCED];
        var arrayStride = this.geometry.inputLayoutDescriptor.vertexBufferDescriptors[TextVertexAttributeBufferIndex.INSTANCED].arrayStride;
        var bytes = arrayStride / 4;
        var _a = tslib.__read(this.packedBufferObjectMap.get(object), 2), start = _a[0], end = _a[1];
        var sliced = vertice.slice(start, end);
        for (var i = 0; i < end - start; i += bytes) {
            sliced[i + bytes - 1] = renderOrder * RENDER_ORDER_SCALE;
        }
        this.geometry.updateVertexBuffer(TextVertexAttributeBufferIndex.INSTANCED, exports.VertexAttributeLocation.MODEL_MATRIX0, start / bytes, new Uint8Array(sliced.buffer));
    };
    TextDrawcall.prototype.updateAttribute = function (objects, startIndex, name, value) {
        var _this = this;
        if (name === 'text' ||
            name === 'fontFamily' ||
            name === 'fontSize' ||
            name === 'fontWeight' ||
            name === 'fontStyle' ||
            name === 'fontVariant' ||
            name === 'textBaseline' ||
            name === 'letterSpacing' ||
            name === 'wordWrapWidth' ||
            name === 'lineHeight' ||
            name === 'wordWrap' ||
            name === 'textAlign' ||
            name === 'dx' ||
            name === 'dy') {
            this.material.programDirty = true;
            this.material.geometryDirty = true;
            // need re-upload SDF texture
            this.material.textureDirty = true;
        }
        else if (name === 'modelMatrix' ||
            name === 'fill' ||
            name === 'fillOpacity' ||
            name === 'stroke' ||
            name === 'strokeOpacity' ||
            name === 'opacity' ||
            name === 'lineWidth' ||
            name === 'visibility' ||
            name === 'pointerEvents' ||
            name === 'isBillboard' ||
            name === 'billboardRotation' ||
            name === 'isSizeAttenuation') {
            var vertice_1 = this.geometry.vertices[TextVertexAttributeBufferIndex.INSTANCED];
            var arrayStride = this.geometry.inputLayoutDescriptor.vertexBufferDescriptors[TextVertexAttributeBufferIndex.INSTANCED].arrayStride;
            var bytes_1 = arrayStride / 4;
            objects.forEach(function (object) {
                var _a;
                var _b = object.parsedStyle, fill = _b.fill, stroke = _b.stroke, opacity = _b.opacity, fillOpacity = _b.fillOpacity, strokeOpacity = _b.strokeOpacity, lineWidth = _b.lineWidth, visibility = _b.visibility, isBillboard = _b.isBillboard, billboardRotation = _b.billboardRotation, isSizeAttenuation = _b.isSizeAttenuation;
                var fillColor = [0, 0, 0, 0];
                if (gLite.isCSSRGB(fill)) {
                    fillColor = [
                        Number(fill.r),
                        Number(fill.g),
                        Number(fill.b),
                        Number(fill.alpha) * 255,
                    ];
                }
                var strokeColor = [0, 0, 0, 0];
                if (gLite.isCSSRGB(stroke)) {
                    strokeColor = [
                        Number(stroke.r),
                        Number(stroke.g),
                        Number(stroke.b),
                        Number(stroke.alpha) * 255,
                    ];
                }
                var encodedPickingColor = (object.isInteractive() &&
                    (
                    // @ts-ignore
                    (_a = object.renderable3D) === null || _a === void 0 ? void 0 : _a.encodedPickingColor)) || [0, 0, 0];
                var modelMatrix = glMatrix.mat4.copy(_this.tmpMat4, object.getWorldTransform());
                var _c = tslib.__read(_this.packedBufferObjectMap.get(object), 2), start = _c[0], end = _c[1];
                var sliced = vertice_1.slice(start, end);
                for (var i = 0; i < end - start; i += bytes_1) {
                    // if (name === 'modelMatrix') {
                    sliced[i + 0] = modelMatrix[0];
                    sliced[i + 1] = modelMatrix[1];
                    sliced[i + 2] = modelMatrix[2];
                    sliced[i + 3] = modelMatrix[3];
                    sliced[i + 4] = modelMatrix[4];
                    sliced[i + 5] = modelMatrix[5];
                    sliced[i + 6] = modelMatrix[6];
                    sliced[i + 7] = modelMatrix[7];
                    sliced[i + 8] = modelMatrix[8];
                    sliced[i + 9] = modelMatrix[9];
                    sliced[i + 10] = modelMatrix[10];
                    sliced[i + 11] = modelMatrix[11];
                    sliced[i + 12] = modelMatrix[12];
                    sliced[i + 13] = modelMatrix[13];
                    sliced[i + 14] = modelMatrix[14];
                    sliced[i + 15] = modelMatrix[15];
                    // } else if (name === 'fill') {
                    sliced[i + 16] = packUint8ToFloat(fillColor[0], fillColor[1]);
                    sliced[i + 17] = packUint8ToFloat(fillColor[2], fillColor[3]);
                    // } else if (name === 'stroke') {
                    sliced[i + 18] = packUint8ToFloat(strokeColor[0], strokeColor[1]);
                    sliced[i + 19] = packUint8ToFloat(strokeColor[2], strokeColor[3]);
                    // }
                    sliced[i + 20] = opacity;
                    sliced[i + 21] = fillOpacity;
                    sliced[i + 22] = strokeOpacity;
                    sliced[i + 23] = lineWidth;
                    sliced[i + 24] = visibility === 'visible' ? 1 : 0;
                    sliced[i + 25] = isBillboard ? 1 : 0;
                    sliced[i + 26] = isSizeAttenuation ? 1 : 0;
                    sliced[i + 27] = billboardRotation !== null && billboardRotation !== void 0 ? billboardRotation : 0;
                    sliced[i + 28] = encodedPickingColor[0];
                    sliced[i + 29] = encodedPickingColor[1];
                    sliced[i + 30] = encodedPickingColor[2];
                    // sliced[i + 31] = object.sortable.renderOrder * RENDER_ORDER_SCALE;
                }
                _this.geometry.updateVertexBuffer(TextVertexAttributeBufferIndex.INSTANCED, exports.VertexAttributeLocation.MODEL_MATRIX0, start / bytes_1, new Uint8Array(sliced.buffer));
            });
        }
    };
    TextDrawcall.prototype.buildTextBuffers = function (_a) {
        var _b;
        var object = _a.object, lines = _a.lines, fontStack = _a.fontStack, lineHeight = _a.lineHeight, letterSpacing = _a.letterSpacing, offsetX = _a.offsetX, offsetY = _a.offsetY, glyphAtlas = _a.glyphAtlas, indicesOffset = _a.indicesOffset;
        var _c = object.parsedStyle, textAlign = _c.textAlign, fill = _c.fill, stroke = _c.stroke, opacity = _c.opacity, fillOpacity = _c.fillOpacity, strokeOpacity = _c.strokeOpacity, lineWidth = _c.lineWidth, visibility = _c.visibility, isBillboard = _c.isBillboard, billboardRotation = _c.billboardRotation, isSizeAttenuation = _c.isSizeAttenuation;
        var fillColor = [0, 0, 0, 0];
        if (gLite.isCSSRGB(fill)) {
            fillColor = [
                Number(fill.r),
                Number(fill.g),
                Number(fill.b),
                Number(fill.alpha) * 255,
            ];
        }
        var strokeColor = [0, 0, 0, 0];
        if (gLite.isCSSRGB(stroke)) {
            strokeColor = [
                Number(stroke.r),
                Number(stroke.g),
                Number(stroke.b),
                Number(stroke.alpha) * 255,
            ];
        }
        var encodedPickingColor = (object.isInteractive() &&
            (
            // @ts-ignore
            (_b = object.renderable3D) === null || _b === void 0 ? void 0 : _b.encodedPickingColor)) || [0, 0, 0];
        var modelMatrix = glMatrix.mat4.copy(this.tmpMat4, object.getWorldTransform());
        var charPackedBuffer = [];
        var charUVOffsetBuffer = [];
        var indexBuffer = [];
        var i = indicesOffset;
        var positionedGlyphs = this.glyphManager.layout(lines, fontStack, lineHeight, textAlign, letterSpacing, offsetX, offsetY);
        // 计算每个独立字符相对于锚点的位置信息
        var glyphQuads = getGlyphQuads(positionedGlyphs, glyphAtlas.positions);
        glyphQuads.forEach(function (quad) {
            // rollup will use `concat`
            var temp = [];
            temp.push.apply(temp, tslib.__spreadArray([], tslib.__read(modelMatrix), false));
            var packed = tslib.__spreadArray(tslib.__spreadArray(tslib.__spreadArray(tslib.__spreadArray([], tslib.__read(temp), false), [
                packUint8ToFloat(fillColor[0], fillColor[1]),
                packUint8ToFloat(fillColor[2], fillColor[3]),
                packUint8ToFloat(strokeColor[0], strokeColor[1]),
                packUint8ToFloat(strokeColor[2], strokeColor[3]),
                opacity,
                fillOpacity,
                strokeOpacity,
                lineWidth,
                visibility === 'visible' ? 1 : 0,
                isBillboard ? 1 : 0,
                isSizeAttenuation ? 1 : 0,
                billboardRotation !== null && billboardRotation !== void 0 ? billboardRotation : 0
            ], false), tslib.__read(encodedPickingColor), false), [
                object.sortable.renderOrder * RENDER_ORDER_SCALE,
            ], false);
            // Can't use instanced here since the total number of each Text can be different.
            charPackedBuffer.push.apply(charPackedBuffer, tslib.__spreadArray(tslib.__spreadArray(tslib.__spreadArray(tslib.__spreadArray([], tslib.__read(packed), false), tslib.__read(packed), false), tslib.__read(packed), false), tslib.__read(packed), false));
            // interleaved uv & offsets
            charUVOffsetBuffer.push(quad.tex.x, quad.tex.y, quad.tl.x, quad.tl.y);
            charUVOffsetBuffer.push(quad.tex.x + quad.tex.w, quad.tex.y, quad.tr.x, quad.tr.y);
            charUVOffsetBuffer.push(quad.tex.x + quad.tex.w, quad.tex.y + quad.tex.h, quad.br.x, quad.br.y);
            charUVOffsetBuffer.push(quad.tex.x, quad.tex.y + quad.tex.h, quad.bl.x, quad.bl.y);
            indexBuffer.push(0 + i, 2 + i, 1 + i);
            indexBuffer.push(2 + i, 0 + i, 3 + i);
            i += 4;
        });
        return {
            indexBuffer: indexBuffer,
            charUVOffsetBuffer: charUVOffsetBuffer,
            charPackedBuffer: charPackedBuffer,
            indicesOffset: i,
        };
    };
    return TextDrawcall;
}(Instanced));

var MeshDrawcall = /** @class */ (function (_super) {
    tslib.__extends(MeshDrawcall, _super);
    function MeshDrawcall() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MeshDrawcall.prototype.shouldMerge = function (object, index) {
        var shouldMerge = _super.prototype.shouldMerge.call(this, object, index);
        if (!shouldMerge) {
            return false;
        }
        if (this.instance.nodeName === gLite.Shape.MESH) {
            if (this.instance.parsedStyle.material !== object.parsedStyle.material ||
                this.instance.parsedStyle.geometry !== object.parsedStyle.geometry) {
                return false;
            }
        }
        return true;
    };
    MeshDrawcall.prototype.updateAttribute = function (objects, startIndex, name, value) {
        _super.prototype.updateAttribute.call(this, objects, startIndex, name, value);
        this.updateBatchedAttribute(objects, startIndex, name, value);
    };
    MeshDrawcall.prototype.createMaterial = function (objects) {
        var material = this.instance.parsedStyle.material;
        this.material = material;
        this.observeMaterialChanged();
    };
    MeshDrawcall.prototype.createGeometry = function (objects) {
        var geometry = this.instance.parsedStyle.geometry;
        this.geometry = geometry;
        // use default common attributes
        _super.prototype.createGeometry.call(this, objects);
        this.geometry.build(objects);
        // TODO: clear dirty listener
        this.observeGeometryChanged();
    };
    return MeshDrawcall;
}(Instanced));

/**
 * Use 2 meshes:
 * * SDF to draw fill & simple stroke if needed.
 * * InstancedPathDrawcall to draw stroke separately.
 */
var CircleRenderer = /** @class */ (function (_super) {
    tslib.__extends(CircleRenderer, _super);
    function CircleRenderer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CircleRenderer.prototype.getDrawcallCtors = function (object) {
        var drawcalls = [];
        var fill = object.parsedStyle.fill;
        if (!fill.isNone) {
            drawcalls.push(SDFDrawcall);
        }
        if (this.needDrawStrokeSeparately(object)) {
            drawcalls.push(InstancedPathDrawcall);
        }
        return drawcalls;
    };
    /**
     * need an additional mesh to draw stroke:
     * 1. strokeOpacity < 1
     * 2. lineDash used
     * 3. stroke is not 'none'
     */
    CircleRenderer.prototype.needDrawStrokeSeparately = function (object) {
        var _a = object.parsedStyle, fill = _a.fill, stroke = _a.stroke, lineDash = _a.lineDash, lineWidth = _a.lineWidth, strokeOpacity = _a.strokeOpacity;
        var hasFill = fill && !fill.isNone;
        var hasStroke = stroke && !stroke.isNone;
        var hasDash = lineDash &&
            lineDash.length &&
            lineDash.every(function (item) { return item !== 0; });
        return (!hasFill || (hasStroke && lineWidth > 0 && (strokeOpacity < 1 || hasDash)));
    };
    return CircleRenderer;
}(Batch));

/**
 * Use the following perf enhancements:
 * * Downgrading the "simple" Path / Polyline to {@link InstancedLineDrawcall}, e.g. 'M 0 0 L 100 0'
 * * Merge the Path into {@link InstancedPathDrawcall} which contains only one curve command, e.g 'M 0 0 Q 10 10 100 100'
 * @see https://github.com/antvis/G/issues/1113
 */
var PathRenderer = /** @class */ (function (_super) {
    tslib.__extends(PathRenderer, _super);
    function PathRenderer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    // meshes = [
    //   InstancedFillDrawcall ?,
    //   (InstancedLineDrawcall | InstancedPathDrawcall) *, // sub paths
    // ];
    PathRenderer.prototype.getDrawcallCtors = function (object) {
        var _a = object.parsedStyle, fill = _a.fill, stroke = _a.stroke, opacity = _a.opacity, strokeOpacity = _a.strokeOpacity, lineWidth = _a.lineWidth;
        var hasStroke = stroke && !stroke.isNone;
        var subpathNum = InstancedPathDrawcall.calcSubpathNum(object);
        var drawcalls = [];
        // Polyline don't need fill
        if (!(object.nodeName === gLite.Shape.POLYLINE || fill.isNone)) {
            for (var i = 0; i < subpathNum; i++) {
                drawcalls.push(InstancedFillDrawcall);
            }
        }
        for (var i = 0; i < subpathNum; i++) {
            if (!(strokeOpacity === 0 || opacity === 0 || lineWidth === 0 || !hasStroke)) {
                var isLine = InstancedLineDrawcall.isLine(object, i);
                if (isLine) {
                    drawcalls.push(InstancedLineDrawcall);
                }
                else {
                    drawcalls.push(InstancedPathDrawcall);
                }
            }
        }
        return drawcalls;
    };
    return PathRenderer;
}(Batch));

/** @class */ ((function (_super) {
    tslib.__extends(GroupRenderer, _super);
    function GroupRenderer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    GroupRenderer.prototype.getDrawcallCtors = function () {
        return [];
    };
    return GroupRenderer;
})(Batch));

var ImageRenderer = /** @class */ (function (_super) {
    tslib.__extends(ImageRenderer, _super);
    function ImageRenderer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ImageRenderer.prototype.getDrawcallCtors = function () {
        return [ImageDrawcall];
    };
    return ImageRenderer;
}(Batch));

var TextRenderer = /** @class */ (function (_super) {
    tslib.__extends(TextRenderer, _super);
    function TextRenderer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * one for fill, one for stroke
     */
    TextRenderer.prototype.getDrawcallCtors = function (object) {
        var drawcalls = [];
        var _a = object.parsedStyle, stroke = _a.stroke, lineWidth = _a.lineWidth;
        var hasStroke = !!(stroke && !stroke.isNone && lineWidth);
        if (hasStroke) {
            drawcalls.push(TextDrawcall);
        }
        drawcalls.push(TextDrawcall);
        return drawcalls;
    };
    TextRenderer.prototype.beforeUploadUBO = function (renderInst, mesh) {
        var _a;
        var drawcallNum = mesh.instance.renderable3D
            .drawcalls.length;
        mesh.material.setUniforms((_a = {},
            _a[exports.TextUniform.HAS_STROKE] = drawcallNum === 1 ? 0 : 1 - mesh.index,
            _a));
    };
    return TextRenderer;
}(Batch));

/**
 * use instanced for each segment
 * @see https://blog.scottlogic.com/2019/11/18/drawing-lines-with-webgl.html
 *
 * support dash array
 * TODO: joint & cap
 */
var LineRenderer = /** @class */ (function (_super) {
    tslib.__extends(LineRenderer, _super);
    function LineRenderer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    LineRenderer.prototype.getDrawcallCtors = function () {
        return [InstancedLineDrawcall];
    };
    return LineRenderer;
}(Batch));

var MeshRenderer = /** @class */ (function (_super) {
    tslib.__extends(MeshRenderer, _super);
    function MeshRenderer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MeshRenderer.prototype.getDrawcallCtors = function () {
        return [MeshDrawcall];
    };
    return MeshRenderer;
}(Batch));

/**
 * Use 2 meshes:
 * * For simple Rect with fill & simple stroke, we use SDFDrawcall to draw which has a better performance.
 * * FillMesh & LineMesh to draw rounded rect with different radius.
 */
var RectRenderer = /** @class */ (function (_super) {
    tslib.__extends(RectRenderer, _super);
    function RectRenderer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    RectRenderer.prototype.getDrawcallCtors = function (object) {
        var drawcalls = [];
        var _a = object.parsedStyle, fill = _a.fill, radius = _a.radius;
        var hasDifferentRadius = radius && radius.length && radius.some(function (r) { return r !== radius[0]; });
        if (!(fill.isNone || hasDifferentRadius)) {
            drawcalls.push(SDFDrawcall);
        }
        if (hasDifferentRadius) {
            drawcalls.push(InstancedFillDrawcall);
        }
        if (hasDifferentRadius
            ? hasDifferentRadius
            : this.needDrawStrokeSeparately(object)) {
            drawcalls.push(InstancedPathDrawcall);
        }
        return drawcalls;
    };
    /**
     * need an additional mesh to draw stroke:
     * 1. strokeOpacity < 1
     * 2. lineDash used
     * 3. stroke is not 'none'
     */
    RectRenderer.prototype.needDrawStrokeSeparately = function (object) {
        var _a = object.parsedStyle, fill = _a.fill, stroke = _a.stroke, lineDash = _a.lineDash, lineWidth = _a.lineWidth, strokeOpacity = _a.strokeOpacity;
        var hasFill = fill && !fill.isNone;
        var hasStroke = stroke && !stroke.isNone;
        var hasDash = lineDash && lineDash.length && lineDash.every(function (item) { return item !== 0; });
        return (!hasFill || (hasStroke && lineWidth > 0 && (strokeOpacity < 1 || hasDash)));
    };
    return RectRenderer;
}(Batch));

var stencilRefCounter = 1;
var BatchManager = /** @class */ (function () {
    function BatchManager(renderHelper, rendererFactory, texturePool, lightPool) {
        this.renderHelper = renderHelper;
        this.rendererFactory = rendererFactory;
        this.texturePool = texturePool;
        this.lightPool = lightPool;
        /**
         * draw calls
         */
        this.drawcalls = [];
        /**
         * update patches which can be merged before rendering
         */
        this.pendingUpdatePatches = {};
        this.stencilRefCache = {};
    }
    BatchManager.prototype.destroy = function () {
        this.drawcalls.forEach(function (drawcall) {
            drawcall.destroy();
        });
        this.drawcalls = [];
        this.pendingUpdatePatches = {};
    };
    BatchManager.prototype.render = function (list, isPicking) {
        var _this = this;
        if (isPicking === void 0) { isPicking = false; }
        if (!isPicking) {
            this.updatePendingPatches();
        }
        this.drawcalls.forEach(function (mesh) {
            // init rendering service, create geometry & material
            mesh.init();
            var objects = mesh.objects;
            if (mesh.clipPathTarget) {
                objects = [mesh.clipPath];
            }
            // new render instance
            var renderInst = _this.renderHelper.renderInstManager.newRenderInst();
            renderInst.setAllowSkippingIfPipelineNotReady(false);
            mesh.applyRenderInst(renderInst, objects);
            _this.renderHelper.renderInstManager.submitRenderInst(renderInst, list);
            // console.log('submit: ', mesh);
            if (!isPicking) {
                // finish rendering...
                mesh.objects.forEach(function (object) {
                    object.renderable.dirty = false;
                });
            }
        });
    };
    /**
     * get called in RenderGraphPlugin
     */
    BatchManager.prototype.attach = function (context) {
        this.context = context;
    };
    BatchManager.prototype.add = function (object) {
        var _this = this;
        var renderable3D = object.renderable3D;
        if (renderable3D && !renderable3D.drawcalls.length) {
            var renderer_1 = this.rendererFactory[object.nodeName];
            if (renderer_1) {
                // A complex Path can be splitted into multple sub paths.
                renderer_1
                    .getDrawcallCtors(object)
                    .forEach(function (drawcallCtor, i, drawcallCtors) {
                    var existedDrawcall = _this.drawcalls.find(function (mesh) {
                        return drawcallCtor === mesh.constructor &&
                            mesh.index === i &&
                            mesh.objects.length < mesh.maxInstances &&
                            mesh.shouldMerge(object, i);
                    });
                    if (!existedDrawcall ||
                        existedDrawcall.key !== object.parsedStyle.batchKey) {
                        existedDrawcall = new drawcallCtor(_this.renderHelper, _this.texturePool, _this.lightPool, object, drawcallCtors, i, _this.context);
                        existedDrawcall.renderer = renderer_1;
                        _this.drawcalls.push(existedDrawcall);
                        if (object.parsedStyle.batchKey) {
                            existedDrawcall.key = object.parsedStyle.batchKey;
                        }
                    }
                    if (existedDrawcall) {
                        existedDrawcall.objects.push(object);
                        renderable3D.drawcalls[i] = existedDrawcall;
                        existedDrawcall.geometryDirty = true;
                    }
                });
            }
        }
    };
    BatchManager.prototype.remove = function (object) {
        var _this = this;
        // @ts-ignore
        var renderable3D = object.renderable3D;
        if (renderable3D) {
            renderable3D.drawcalls.forEach(function (mesh) {
                if (mesh) {
                    // remove from mesh
                    var index = mesh.objects.indexOf(object);
                    if (index > -1) {
                        mesh.objects.splice(index, 1);
                        mesh.geometryDirty = true;
                    }
                    if (mesh.objects.length === 0) {
                        var deletedDrawcalls = _this.drawcalls.splice(_this.drawcalls.indexOf(mesh), 1);
                        deletedDrawcalls.forEach(function (deletedDrawcall) {
                            deletedDrawcall.destroy();
                        });
                    }
                }
            });
            renderable3D.drawcalls = [];
        }
    };
    BatchManager.prototype.updateAttribute = function (object, attributeName, newValue, immediately) {
        var _this = this;
        if (immediately === void 0) { immediately = false; }
        var renderable3D = object.renderable3D;
        var renderer = this.rendererFactory[object.nodeName];
        if (renderer) {
            var drawcallCtors = renderer.getDrawcallCtors(object);
            drawcallCtors.forEach(function (drawcallCtor, i, drawcallCtors) {
                var existedDrawcall = renderable3D.drawcalls.find(function (mesh) {
                    return mesh && mesh.index === i && mesh.constructor === drawcallCtor;
                });
                if (!existedDrawcall) {
                    // Clear invalid drawcall.
                    existedDrawcall = renderable3D.drawcalls[i];
                    if (existedDrawcall) {
                        // remove from mesh
                        existedDrawcall.objects.splice(existedDrawcall.objects.indexOf(object), 1);
                        existedDrawcall.geometryDirty = true;
                        if (existedDrawcall.objects.length === 0) {
                            _this.drawcalls.splice(_this.drawcalls.indexOf(existedDrawcall), 1);
                        }
                        renderable3D.drawcalls[renderable3D.drawcalls.indexOf(existedDrawcall)] = undefined;
                    }
                    // We should create a new drawcall from scratch.
                    existedDrawcall = _this.drawcalls.find(function (mesh) {
                        return drawcallCtor === mesh.constructor &&
                            mesh.index === i &&
                            mesh.objects.length < mesh.maxInstances &&
                            mesh.shouldMerge(object, i);
                    });
                    if (!existedDrawcall) {
                        // @ts-ignore
                        existedDrawcall = new drawcallCtor(_this.renderHelper, _this.texturePool, _this.lightPool, object, drawcallCtors, i, _this.context);
                        existedDrawcall.renderer = renderer;
                        existedDrawcall.init();
                        _this.drawcalls.push(existedDrawcall);
                    }
                    else {
                        existedDrawcall.geometryDirty = true;
                    }
                    existedDrawcall.objects.push(object);
                    renderable3D.drawcalls[i] = existedDrawcall;
                }
                if (existedDrawcall.inited && !existedDrawcall.geometryDirty) {
                    var shouldMerge = existedDrawcall.shouldMerge(object, i);
                    if (shouldMerge) {
                        var objectIdx = existedDrawcall.objects.indexOf(object);
                        if (immediately) {
                            object.parsedStyle[attributeName] = newValue;
                            existedDrawcall.updateAttribute([object], objectIdx, attributeName, newValue);
                        }
                        else {
                            var patchKey = existedDrawcall.id + attributeName;
                            if (!_this.pendingUpdatePatches[patchKey]) {
                                _this.pendingUpdatePatches[patchKey] = {
                                    instance: existedDrawcall,
                                    objectIndices: [],
                                    name: attributeName,
                                    value: newValue,
                                };
                            }
                            if (_this.pendingUpdatePatches[patchKey].objectIndices.indexOf(objectIdx) === -1) {
                                _this.pendingUpdatePatches[patchKey].objectIndices.push(objectIdx);
                            }
                        }
                    }
                    else {
                        _this.remove(object);
                        _this.add(object);
                    }
                }
                else {
                    _this.remove(object);
                    _this.add(object);
                }
            });
            // Clear redundant drawcalls.
            if (renderable3D.drawcalls.length > drawcallCtors.length) {
                var drawcallNum = renderable3D.drawcalls.length;
                for (var i = drawcallNum - 1; i >= drawcallCtors.length; i--) {
                    var existedDrawcall = renderable3D.drawcalls[i];
                    // remove from mesh
                    existedDrawcall.objects.splice(existedDrawcall.objects.indexOf(object), 1);
                    existedDrawcall.geometryDirty = true;
                    if (existedDrawcall.objects.length === 0) {
                        this.drawcalls.splice(this.drawcalls.indexOf(existedDrawcall), 1);
                    }
                    renderable3D.drawcalls.pop();
                }
            }
        }
    };
    BatchManager.prototype.changeRenderOrder = function (object, renderOrder) {
        // @ts-ignore
        var renderable3D = object.renderable3D;
        if (renderable3D && renderable3D.drawcalls.length) {
            renderable3D.drawcalls.forEach(function (mesh) {
                if (mesh && mesh.inited && !mesh.geometryDirty) {
                    if (mesh.inited) {
                        mesh.changeRenderOrder(object, renderOrder);
                    }
                }
            });
        }
    };
    BatchManager.prototype.getStencilRef = function (object) {
        if (!this.stencilRefCache[object.entity]) {
            this.stencilRefCache[object.entity] = stencilRefCounter++;
        }
        return this.stencilRefCache[object.entity];
    };
    BatchManager.prototype.updatePendingPatches = function () {
        var _this = this;
        // merge update patches to reduce `setSubData` calls
        Object.keys(this.pendingUpdatePatches).forEach(function (patchKey) {
            var _a = _this.pendingUpdatePatches[patchKey], instance = _a.instance, objectIndices = _a.objectIndices, name = _a.name, value = _a.value;
            objectIndices.sort(function (a, b) { return a - b; });
            var updatePatches = [];
            objectIndices.forEach(function (i) {
                var lastUpdateBatch = updatePatches[updatePatches.length - 1];
                if (!lastUpdateBatch ||
                    i !== lastUpdateBatch[lastUpdateBatch.length - 1] + 1) {
                    updatePatches.push([i]);
                }
                else {
                    lastUpdateBatch.push(i);
                }
            });
            updatePatches.forEach(function (indices) {
                instance.updateAttribute(instance.objects.slice(indices[0], indices[0] + indices.length), indices[0], name, value);
            });
        });
        this.pendingUpdatePatches = {};
    };
    return BatchManager;
}());

var TexturePool = /** @class */ (function () {
    function TexturePool(context, runtime) {
        this.context = context;
        this.runtime = runtime;
        this.textureCache = {};
    }
    TexturePool.prototype.getOrCreateTexture = function (device, src, descriptor, successCallback) {
        var _this = this;
        // use Image URL or src as cache key
        // @ts-ignore
        var id = typeof src === 'string' ? src : src.src || '';
        var texture;
        if (!id || !this.textureCache[id]) {
            texture = device.createTexture(tslib.__assign({ format: gDeviceApi.Format.U8_RGBA_NORM, width: 1, height: 1, depthOrArrayLayers: 1, mipLevelCount: 1, dimension: gDeviceApi.TextureDimension.TEXTURE_2D, usage: gDeviceApi.TextureUsage.SAMPLED, pixelStore: {
                    unpackFlipY: false,
                } }, descriptor));
            if (id) {
                this.textureCache[id] = texture;
            }
            if (!util.isString(src)) {
                texture.setImageData([src]);
                texture.emit(gDeviceApi.TextureEvent.LOADED);
                this.context.renderingService.dirtify();
            }
            else {
                // @see https://github.com/antvis/g/issues/938
                var createImage = this.context.config.createImage;
                var image_1;
                if (createImage) {
                    image_1 = createImage(src);
                }
                else if (gLite.isBrowser) {
                    image_1 = new window.Image();
                }
                if (image_1) {
                    image_1.onload = function () {
                        var onSuccess = function (bitmap) {
                            _this.textureCache[id].setImageData([bitmap]);
                            _this.textureCache[id].emit(gDeviceApi.TextureEvent.LOADED);
                            _this.context.renderingService.dirtify();
                            if (successCallback) {
                                successCallback(_this.textureCache[id]);
                            }
                        };
                        if (_this.runtime.globalThis.createImageBitmap) {
                            _this.runtime.globalThis
                                .createImageBitmap(image_1)
                                .then(function (bitmap) { return onSuccess(bitmap); })
                                .catch(function () {
                                // Unhandled Rejection (InvalidStateError):
                                // Failed to execute 'createImageBitmap' on 'Window':
                                // The image element contains an SVG image without intrinsic dimensions,
                                // and no resize options or crop region are specified.
                                onSuccess(image_1);
                            });
                        }
                        else {
                            onSuccess(image_1);
                        }
                    };
                    image_1.onerror = function () { };
                    image_1.crossOrigin = 'Anonymous';
                    image_1.src = src;
                }
            }
        }
        else {
            texture = this.textureCache[id];
            texture.emit(gDeviceApi.TextureEvent.LOADED);
        }
        return texture;
    };
    TexturePool.prototype.getOrCreateCanvas = function () {
        return this.runtime.offscreenCanvasCreator.getOrCreateCanvas(this.context.config.offscreenCanvas);
    };
    TexturePool.prototype.getOrCreateGradient = function (params) {
        var instance = params.instance, gradients = params.gradients;
        var halfExtents = instance.getGeometryBounds().halfExtents;
        var width = halfExtents[0] * 2 || 1;
        var height = halfExtents[1] * 2 || 1;
        var offscreenCanvas = this.context.config.offscreenCanvas;
        var canvas = this.runtime.offscreenCanvasCreator.getOrCreateCanvas(offscreenCanvas);
        var context = this.runtime.offscreenCanvasCreator.getOrCreateContext(offscreenCanvas);
        canvas.width = width;
        canvas.height = height;
        // @ts-ignore
        var imagePool = this.context.imagePool;
        gradients.forEach(function (g) {
            var gradient = imagePool.getOrCreateGradient(tslib.__assign(tslib.__assign({ type: g.type }, g.value), { width: width, height: height }), context);
            // used as canvas' ID
            // @ts-ignore
            // canvas.src = key;
            context.fillStyle = gradient;
            context.fillRect(0, 0, width, height);
        });
    };
    TexturePool.prototype.getOrCreatePattern = function (pattern, instance, callback) {
        var image = pattern.image, repetition = pattern.repetition, transform = pattern.transform;
        var halfExtents = instance.getGeometryBounds().halfExtents;
        var width = halfExtents[0] * 2 || 1;
        var height = halfExtents[1] * 2 || 1;
        var offscreenCanvas = this.context.config.offscreenCanvas;
        var canvas = this.runtime.offscreenCanvasCreator.getOrCreateCanvas(offscreenCanvas);
        var context = this.runtime.offscreenCanvasCreator.getOrCreateContext(offscreenCanvas);
        canvas.width = width;
        canvas.height = height;
        var src;
        // Image URL
        if (util.isString(image)) {
            // @ts-ignore
            src = this.context.imagePool.getImageSync(image, callback);
        }
        else {
            src = image;
        }
        var canvasPattern = src && context.createPattern(src, repetition);
        // @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasPattern/setTransform
        if (transform) {
            var mat = gLite.parsedTransformToMat4(gLite.parseTransform(transform), new gLite.DisplayObject({}));
            canvasPattern.setTransform({
                a: mat[0],
                b: mat[1],
                c: mat[4],
                d: mat[5],
                e: mat[12],
                f: mat[13],
            });
        }
        context.fillStyle = canvasPattern;
        context.fillRect(0, 0, width, height);
    };
    TexturePool.prototype.destroy = function () {
        for (var key in this.textureCache) {
            this.textureCache[key].destroy();
        }
        this.textureCache = {};
    };
    return TexturePool;
}());

var Plugin = /** @class */ (function (_super) {
    tslib.__extends(Plugin, _super);
    function Plugin(options) {
        if (options === void 0) { options = {}; }
        var _this = _super.call(this) || this;
        _this.options = options;
        _this.name = 'device-renderer';
        _this.parameters = {
            /**
             * ToneMapping is a renderer-level parameter, it will affect all materials.
             * @see https://threejs.org/docs/#api/en/renderers/WebGLRenderer.toneMapping
             */
            toneMapping: exports.ToneMapping.NONE,
            toneMappingExposure: 1,
        };
        return _this;
    }
    Plugin.prototype.init = function (runtime) {
        var _a;
        runtime.geometryUpdaterFactory[gLite.Shape.MESH] = new MeshUpdater();
        var renderHelper = new RenderHelper(this.parameters);
        var lightPool = new LightPool();
        var texturePool = new TexturePool(this.context, runtime);
        var pickingIdGenerator = new PickingIdGenerator();
        var circleRenderer = new CircleRenderer();
        var pathRenderer = new PathRenderer();
        var rendererFactory = (_a = {},
            _a[gLite.Shape.CIRCLE] = circleRenderer,
            _a[gLite.Shape.ELLIPSE] = circleRenderer,
            _a[gLite.Shape.POLYLINE] = pathRenderer,
            _a[gLite.Shape.PATH] = pathRenderer,
            _a[gLite.Shape.POLYGON] = pathRenderer,
            _a[gLite.Shape.RECT] = new RectRenderer(),
            _a[gLite.Shape.IMAGE] = new ImageRenderer(),
            _a[gLite.Shape.LINE] = new LineRenderer(),
            _a[gLite.Shape.TEXT] = new TextRenderer(),
            _a[gLite.Shape.MESH] = new MeshRenderer(),
            _a[gLite.Shape.GROUP] = undefined,
            _a[gLite.Shape.HTML] = undefined,
            _a);
        var batchManager = new BatchManager(renderHelper, rendererFactory, texturePool, lightPool);
        var renderGraphPlugin = new RenderGraphPlugin(renderHelper, lightPool, texturePool, batchManager, this.options);
        this.addRenderingPlugin(renderGraphPlugin);
        this.addRenderingPlugin(new PickingPlugin(renderHelper, renderGraphPlugin, pickingIdGenerator, batchManager));
    };
    Plugin.prototype.destroy = function (runtime) {
        delete runtime.geometryUpdaterFactory[gLite.Shape.MESH];
    };
    Plugin.prototype.getRenderGraphPlugin = function () {
        return this.plugins[0];
    };
    Plugin.prototype.getDevice = function () {
        return this.getRenderGraphPlugin().getDevice();
    };
    Plugin.prototype.loadTexture = function (src, descriptor, successCallback) {
        return this.getRenderGraphPlugin().loadTexture(src, descriptor, successCallback);
    };
    Plugin.prototype.toDataURL = function (options) {
        return this.getRenderGraphPlugin().toDataURL(options);
    };
    Plugin.prototype.setParameters = function (parameters) {
        this.parameters = tslib.__assign(tslib.__assign({}, this.parameters), parameters);
    };
    return Plugin;
}(gLite.AbstractRendererPlugin));

exports.Batch = Batch;
exports.BufferGeometry = BufferGeometry;
exports.DeviceProgram = DeviceProgram;
exports.DynamicUniformBuffer = DynamicUniformBuffer;
exports.FILL_TEXTURE_MAPPING = FILL_TEXTURE_MAPPING;
exports.Fog = Fog;
exports.HashMap = HashMap;
exports.ImageDrawcall = ImageDrawcall;
exports.Instanced = Instanced;
exports.InstancedFillDrawcall = InstancedFillDrawcall;
exports.InstancedLineDrawcall = InstancedLineDrawcall;
exports.InstancedPathDrawcall = InstancedPathDrawcall;
exports.Light = Light;
exports.Material = Material;
exports.Mesh = Mesh;
exports.MeshDrawcall = MeshDrawcall;
exports.Plugin = Plugin;
exports.RenderCache = RenderCache;
exports.RenderGraphPlugin = RenderGraphPlugin;
exports.RenderHelper = RenderHelper;
exports.RenderInst = RenderInst;
exports.RenderInstList = RenderInstList;
exports.RenderInstManager = RenderInstManager;
exports.Renderable3D = Renderable3D;
exports.SDFDrawcall = SDFDrawcall;
exports.ShaderMaterial = ShaderMaterial;
exports.SingleSampledTexture = SingleSampledTexture;
exports.TemporalTexture = TemporalTexture;
exports.TextDrawcall = TextDrawcall;
exports.TextureMapping = TextureMapping;
exports.TexturePool = TexturePool;
exports.TinySDF = TinySDF;
exports.bezierCurveTo = bezierCurveTo;
exports.compareDefines = compareDefines;
exports.definedProps = definedProps;
exports.enumToObject = enumToObject;
exports.fillColor = fillColor;
exports.fillMatrix4x4 = fillMatrix4x4;
exports.fillVec3v = fillVec3v;
exports.fillVec4 = fillVec4;
exports.fillVec4v = fillVec4v;
exports.getSortKeyDepth = getSortKeyDepth;
exports.getSortKeyLayer = getSortKeyLayer;
exports.hashCodeNumberFinish = hashCodeNumberFinish;
exports.hashCodeNumberUpdate = hashCodeNumberUpdate;
exports.makeAttachmentClearDescriptor = makeAttachmentClearDescriptor;
exports.makeBackbufferDescSimple = makeBackbufferDescSimple;
exports.makeDataBuffer = makeDataBuffer;
exports.makeDepthKey = makeDepthKey;
exports.makeSortKey = makeSortKey;
exports.makeSortKeyOpaque = makeSortKeyOpaque;
exports.makeSortKeyTranslucent = makeSortKeyTranslucent;
exports.nullHashFunc = nullHashFunc;
exports.opaqueBlackFullClearRenderPassDescriptor = opaqueBlackFullClearRenderPassDescriptor;
exports.opaqueWhiteFullClearRenderPassDescriptor = opaqueWhiteFullClearRenderPassDescriptor;
exports.projectionMatrixConvertClipSpaceNearZ = projectionMatrixConvertClipSpaceNearZ;
exports.pushFXAAPass = pushFXAAPass;
exports.quadCurveTo = quadCurveTo;
exports.renderInstCompareNone = renderInstCompareNone;
exports.renderInstCompareSortKey = renderInstCompareSortKey;
exports.segmentInstanceGeometry = segmentInstanceGeometry;
exports.setBackbufferDescSimple = setBackbufferDescSimple;
exports.setSortKeyBias = setSortKeyBias;
exports.setSortKeyDepth = setSortKeyDepth;
exports.setSortKeyDepthKey = setSortKeyDepthKey;
exports.setSortKeyLayer = setSortKeyLayer;
exports.setSortKeyOpaqueDepth = setSortKeyOpaqueDepth;
exports.setSortKeyProgramKey = setSortKeyProgramKey;
exports.setSortKeyTranslucentDepth = setSortKeyTranslucentDepth;
exports.standardFullClearRenderPassDescriptor = standardFullClearRenderPassDescriptor;
exports.updateBuffer = updateBuffer;
//# sourceMappingURL=index.js.map

}, function(modId) {var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1731211820580);
})()
//miniprogram-npm-outsideDeps=["tslib","@antv/g-lite","@antv/util","@antv/g-device-api","gl-matrix","eventemitter3","earcut","@antv/g-math"]
//# sourceMappingURL=index.js.map