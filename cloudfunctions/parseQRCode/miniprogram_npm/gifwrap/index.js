module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1728739681311, function(require, module, exports) {


const BitmapImage = require('./bitmapimage');
const { Gif, GifError } = require('./gif');
const { GifCodec } = require('./gifcodec');
const { GifFrame } = require('./gifframe');
const GifUtil = require('./gifutil');

module.exports = {
    BitmapImage,
    Gif,
    GifCodec,
    GifFrame,
    GifUtil,
    GifError
};

}, function(modId) {var map = {"./bitmapimage":1728739681312,"./gif":1728739681313,"./gifcodec":1728739681314,"./gifframe":1728739681316,"./gifutil":1728739681315}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1728739681312, function(require, module, exports) {


/** @class BitmapImage */

class BitmapImage {

    /**
     * BitmapImage is a class that hold an RGBA (red, green, blue, alpha) representation of an image. It's shape is borrowed from the Jimp package to make it easy to transfer GIF image frames into Jimp and Jimp images into GIF image frames. Each instance has a `bitmap` property having the following properties:
     * 
     * Property | Description
     * --- | ---
     * bitmap.width | width of image in pixels
     * bitmap.height | height of image in pixels
     * bitmap.data | a Buffer whose every four bytes represents a pixel, each sequential byte of a pixel corresponding to the red, green, blue, and alpha values of the pixel
     *
     * Its constructor supports the following signatures:
     *
     * * new BitmapImage(bitmap: { width: number, height: number, data: Buffer })
     * * new BitmapImage(bitmapImage: BitmapImage)
     * * new BitmapImage(width: number, height: number, buffer: Buffer)
     * * new BitmapImage(width: number, height: number, backgroundRGBA?: number)
     * 
     * When a `BitmapImage` is provided, the constructed `BitmapImage` is a deep clone of the provided one, so that each image's pixel data can subsequently be modified without affecting each other.
     *
     * `backgroundRGBA` is an optional parameter representing a pixel as a single number. In hex, the number is as follows: 0xRRGGBBAA, where RR is the red byte, GG the green byte, BB, the blue byte, and AA the alpha value. An AA of 0x00 is considered transparent, and all non-zero AA values are treated as opaque.
     */

    constructor(...args) {
        // don't confirm the number of args, because a subclass may have
        // additional args and pass them all to the superclass
        if (args.length === 0) {
            throw new Error("constructor requires parameters");
        }
        const firstArg = args[0];
        if (firstArg !== null && typeof firstArg === 'object') {
            if (firstArg instanceof BitmapImage) {
                // copy a provided BitmapImage
                const sourceBitmap = firstArg.bitmap;
                this.bitmap = {
                    width: sourceBitmap.width,
                    height: sourceBitmap.height,
                    data: new Buffer(sourceBitmap.width * sourceBitmap.height * 4)
                };
                sourceBitmap.data.copy(this.bitmap.data);
            }
            else if (firstArg.width && firstArg.height && firstArg.data) {
                // share a provided bitmap
                this.bitmap = firstArg;
            }
            else {
                throw new Error("unrecognized constructor parameters");
            }
        }
        else if (typeof firstArg === 'number' && typeof args[1] === 'number')
        {
            const width = firstArg;
            const height = args[1];
            const thirdArg = args[2];
            this.bitmap = { width, height };

            if (Buffer.isBuffer(thirdArg)) {
                this.bitmap.data = thirdArg;
            }
            else {
                this.bitmap.data = new Buffer(width * height * 4);
                if (typeof thirdArg === 'number') {
                    this.fillRGBA(thirdArg);
                }
            }
        }
        else {
            throw new Error("unrecognized constructor parameters");
        }
    }

    /**
     * Copy a square portion of this image into another image. 
     * 
     * @param {BitmapImage} toImage Image into which to copy the square
     * @param {number} toX x-coord in toImage of upper-left corner of receiving square
     * @param {number} toY y-coord in toImage of upper-left corner of receiving square
     * @param {number} fromX x-coord in this image of upper-left corner of source square
     * @param {number} fromY y-coord in this image of upper-left corner of source square
     * @return {BitmapImage} The present image to allow for chaining.
     */

    blit(toImage, toX, toY, fromX, fromY, fromWidth, fromHeight) {
        if (fromX + fromWidth > this.bitmap.width) {
            throw new Error("copy exceeds width of source bitmap");
        }
        if (toX + fromWidth > toImage.bitmap.width) {
            throw new Error("copy exceeds width of target bitmap");
        }
        if (fromY + fromHeight > this.bitmap.height) {
            throw new Error("copy exceeds height of source bitmap");
        }
        if (toY + fromHeight > toImage.bitmap.height) {
            throw new Erro("copy exceeds height of target bitmap");
        }
        
        const sourceBuf = this.bitmap.data;
        const targetBuf = toImage.bitmap.data;
        const sourceByteWidth = this.bitmap.width * 4;
        const targetByteWidth = toImage.bitmap.width * 4;
        const copyByteWidth = fromWidth * 4;
        let si = fromY * sourceByteWidth + fromX * 4;
        let ti = toY * targetByteWidth + toX * 4;

        while (--fromHeight >= 0) {
            sourceBuf.copy(targetBuf, ti, si, si + copyByteWidth);
            si += sourceByteWidth;
            ti += targetByteWidth;
        }
        return this;
    }

    /**
     * Fills the image with a single color.
     * 
     * @param {number} rgba Color with which to fill image, expressed as a singlenumber in the form 0xRRGGBBAA, where AA is 0x00 for transparent and any other value for opaque.
     * @return {BitmapImage} The present image to allow for chaining.
     */

    fillRGBA(rgba) {
        const buf = this.bitmap.data;
        const bufByteWidth = this.bitmap.height * 4;
        
        let bi = 0;
        while (bi < bufByteWidth) {
            buf.writeUInt32BE(rgba, bi);
            bi += 4;
        }
        while (bi < buf.length) {
            buf.copy(buf, bi, 0, bufByteWidth);
            bi += bufByteWidth;
        }
        return this;
    }

    /**
     * Gets the RGBA number of the pixel at the given coordinate in the form 0xRRGGBBAA, where AA is the alpha value, with alpha 0x00 encoding to transparency in GIFs.
     * 
     * @param {number} x x-coord of pixel
     * @param {number} y y-coord of pixel
     * @return {number} RGBA of pixel in 0xRRGGBBAA form
     */

    getRGBA(x, y) {
        const bi = (y * this.bitmap.width + x) * 4;
        return this.bitmap.data.readUInt32BE(bi);
    }

    /**
     * Gets a set of all RGBA colors found within the image.
     * 
     * @return {Set} Set of all RGBA colors that the image contains.
     */

    getRGBASet() {
        const rgbaSet = new Set();
        const buf = this.bitmap.data;
        for (let bi = 0; bi < buf.length; bi += 4) {
            rgbaSet.add(buf.readUInt32BE(bi, true));
        }
        return rgbaSet;
    }

    /**
     * Converts the image to greyscale using inferred Adobe metrics.
     * 
     * @return {BitmapImage} The present image to allow for chaining.
     */

    greyscale() {
        const buf = this.bitmap.data;
        this.scan(0, 0, this.bitmap.width, this.bitmap.height, (x, y, idx) => {
            const grey = Math.round(
                0.299 * buf[idx] +
                0.587 * buf[idx + 1] +
                0.114 * buf[idx + 2]
            );
            buf[idx] = grey;
            buf[idx + 1] = grey;
            buf[idx + 2] = grey;
        });
        return this;
    }

    /**
     * Reframes the image as if placing a frame around the original image and replacing the original image with the newly framed image. When the new frame is strictly within the boundaries of the original image, this method crops the image. When any of the new boundaries exceed those of the original image, the `fillRGBA` must be provided to indicate the color with which to fill the extra space added to the image.
     * 
     * @param {number} xOffset The x-coord offset of the upper-left pixel of the desired image relative to the present image.
     * @param {number} yOffset The y-coord offset of the upper-left pixel of the desired image relative to the present image.
     * @param {number} width The width of the new image after reframing
     * @param {number} height The height of the new image after reframing
     * @param {number} fillRGBA The color with which to fill space added to the image as a result of the reframing, in 0xRRGGBBAA format, where AA is 0x00 to indicate transparent and a non-zero value to indicate opaque. This parameter is only required when the reframing exceeds the original boundaries (i.e. does not simply perform a crop).
     * @return {BitmapImage} The present image to allow for chaining.
     */

    reframe(xOffset, yOffset, width, height, fillRGBA) {
        const cropX = (xOffset < 0 ? 0 : xOffset);
        const cropY = (yOffset < 0 ? 0 : yOffset);
        const cropWidth = (width + cropX > this.bitmap.width ?
                this.bitmap.width - cropX : width);
        const cropHeight = (height + cropY > this.bitmap.height ?
                this.bitmap.height - cropY : height);
        const newX = (xOffset < 0 ? -xOffset : 0);
        const newY = (yOffset < 0 ? -yOffset : 0);

        let image;
        if (fillRGBA === undefined) {
            if (cropX !== xOffset || cropY != yOffset ||
                    cropWidth !== width || cropHeight !== height)
            {
                throw new GifError(`fillRGBA required for this reframing`);
            }
            image = new BitmapImage(width, height);
        }
        else {
            image = new BitmapImage(width, height, fillRGBA);
        }
        this.blit(image, newX, newY, cropX, cropY, cropWidth, cropHeight);
        this.bitmap = image.bitmap;
        return this;
    }

    /**
     * Scales the image size up by an integer factor. Each pixel of the original image becomes a square of the same color in the new image having a size of `factor` x `factor` pixels.
     * 
     * @param {number} factor The factor by which to scale up the image. Must be an integer >= 1.
     * @return {BitmapImage} The present image to allow for chaining.
     */

    scale(factor) {
        if (factor === 1) {
            return;
        }
        if (!Number.isInteger(factor) || factor < 1) {
            throw new Error("the scale must be an integer >= 1");
        }
        const sourceWidth = this.bitmap.width;
        const sourceHeight = this.bitmap.height;
        const destByteWidth = sourceWidth * factor * 4;
        const sourceBuf = this.bitmap.data;
        const destBuf = new Buffer(sourceHeight * destByteWidth * factor);
        let sourceIndex = 0;
        let priorDestRowIndex;
        let destIndex = 0;
        for (let y = 0; y < sourceHeight; ++y) {
            priorDestRowIndex = destIndex;
            for (let x = 0; x < sourceWidth; ++x) {
                const color = sourceBuf.readUInt32BE(sourceIndex, true);
                for (let cx = 0; cx < factor; ++cx) {
                    destBuf.writeUInt32BE(color, destIndex);
                    destIndex += 4;
                }
                sourceIndex += 4;
            }
            for (let cy = 1; cy < factor; ++cy) {
                destBuf.copy(destBuf, destIndex, priorDestRowIndex, destIndex);
                destIndex += destByteWidth;
                priorDestRowIndex += destByteWidth;
            }
        }
        this.bitmap = {
            width: sourceWidth * factor,
            height: sourceHeight * factor,
            data: destBuf
        };
        return this;
    }

    /**
     * Scans all coordinates of the image, handing each in turn to the provided handler function.
     *
     * @param {function} scanHandler A function(x: number, y: number, bi: number) to be called for each pixel of the image with that pixel's x-coord, y-coord, and index into the `data` buffer. The function accesses the pixel at this coordinate by accessing the `this.data` at index `bi`.
     * @see scanAllIndexes
     */

    scanAllCoords(scanHandler) {
        const width = this.bitmap.width;
        const bufferLength = this.bitmap.data.length;
        let x = 0;
        let y = 0;

        for (let bi = 0; bi < bufferLength; bi += 4) {
            scanHandler(x, y, bi);
            if (++x === width) {
                x = 0;
                ++y;
            }
        }
    }

    /**
     * Scans all pixels of the image, handing the index of each in turn to the provided handler function. Runs a bit faster than `scanAllCoords()`, should the handler not need pixel coordinates.
     *
     * @param {function} scanHandler A function(bi: number) to be called for each pixel of the image with that pixel's index into the `data` buffer. The pixels is found at index 'bi' within `this.data`.
     * @see scanAllCoords
     */

    scanAllIndexes(scanHandler) {
        const bufferLength = this.bitmap.data.length;
        for (let bi = 0; bi < bufferLength; bi += 4) {
            scanHandler(bi);
        }
    }
}

module.exports = BitmapImage;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1728739681313, function(require, module, exports) {


/** @class Gif */

class Gif {

    // width - width of GIF in pixels
    // height - height of GIF in pixels
    // loops - 0 = unending; (n > 0) = iterate n times
    // usesTransparency - whether any frames have transparent pixels
    // colorScope - scope of color tables in GIF
    // frames - array of frames
    // buffer - GIF-formatted data

    /**
     * Gif is a class representing an encoded GIF. It is intended to be a read-only representation of a byte-encoded GIF. Only encoders and decoders should be creating instances of this class.
     * 
     * Property | Description
     * --- | ---
     * width | width of the GIF at its widest
     * height | height of the GIF at its highest
     * loops | the number of times the GIF should loop before stopping; 0 => loop indefinately
     * usesTransparency | boolean indicating whether at least one frame contains at least one transparent pixel
     * colorScope | the scope of the color tables as encoded within the GIF; either Gif.GlobalColorsOnly (== 1) or Gif.LocalColorsOnly (== 2).
     * frames | a array of GifFrame instances, one for each frame of the GIF
     * buffer | a Buffer holding the encoding's byte data
     * 
     * Its constructor should only ever be called by the GIF encoder or decoder.
     *
     * @param {Buffer} buffer A Buffer containing the encoded bytes
     * @param {GifFrame[]} frames Array of frames found in the encoding
     * @param {object} spec Properties of the encoding as listed above
     */

    constructor(buffer, frames, spec) {
        this.width = spec.width;
        this.height = spec.height;
        this.loops = spec.loops;
        this.usesTransparency = spec.usesTransparency;
        this.colorScope = spec.colorScope;
        this.frames = frames;
        this.buffer = buffer;
    }
}

Gif.GlobalColorsPreferred = 0;
Gif.GlobalColorsOnly = 1;
Gif.LocalColorsOnly = 2;

/** @class GifError */

class GifError extends Error {

    /**
     * GifError is a class representing a GIF-related error
     * 
     * @param {string|Error} messageOrError
     */

    constructor(messageOrError) {
        super(messageOrError);
        if (messageOrError instanceof Error) {
            this.stack = 'Gif' + messageOrError.stack;
        }
    }
}

exports.Gif = Gif;
exports.GifError = GifError;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1728739681314, function(require, module, exports) {


const Omggif = require('omggif');
const { Gif, GifError } = require('./gif');

// allow circular dependency with GifUtil
function GifUtil() {
    const data = require('./gifutil');

    GifUtil = function () {
      return data;
    };

  return data;
}

const { GifFrame } = require('./gifframe');

const PER_GIF_OVERHEAD = 200; // these are guesses at upper limits
const PER_FRAME_OVERHEAD = 100;

// Note: I experimented with accepting a global color table when encoding and returning the global color table when decoding. Doing this properly greatly increased the complexity of the code and the amount of clock cycles required. The main issue is that each frame can specify any color of the global color table to be transparent within the frame, while this GIF library strives to hide GIF formatting details from its clients. E.g. it's possible to have 256 colors in the global color table and different transparencies in each frame, requiring clients to either provide per-frame transparency indexes, or for arcane reasons that won't be apparent to client developers, encode some GIFs with local color tables that previously decoded with global tables.

/** @class GifCodec */

class GifCodec
{
    // _transparentRGBA - RGB given to transparent pixels (alpha=0) on decode; defaults to null indicating 0x000000, which is fastest

    /**
     * GifCodec is a class that both encodes and decodes GIFs. It implements both the `encode()` method expected of an encoder and the `decode()` method expected of a decoder, and it wraps the `omggif` GIF encoder/decoder package. GifCodec serves as this library's default encoder and decoder, but it's possible to wrap other GIF encoders and decoders for use by `gifwrap` as well. GifCodec will not encode GIFs with interlacing.
     * 
     * Instances of this class are stateless and can be shared across multiple encodings and decodings.
     * 
     * Its constructor takes one option argument:
     * 
     * @param {object} options Optionally takes an objection whose only possible property is `transparentRGB`. Images are internally represented in RGBA format, where A is the alpha value of a pixel. When `transparentRGB` is provided, this RGB value (excluding alpha) is assigned to transparent pixels, which are also given alpha value 0x00. (All opaque pixels are given alpha value 0xFF). The RGB color of transparent pixels shouldn't matter for most applications. Defaults to 0x000000.
     */

    constructor(options = {}) {
        this._transparentRGB = null; // 0x000000
        if (typeof options.transparentRGB === 'number' &&
                options.transparentRGB !== 0)
        {
            this._transparentRGBA = options.transparentRGB * 256;
        }
        this._testInitialBufferSize = 0; // assume no buffer scaling test
    }

    /**
     * Decodes a GIF from a Buffer to yield an instance of Gif. Transparent pixels of the GIF are given alpha values of 0x00, and opaque pixels are given alpha values of 0xFF. The RGB values of transparent pixels default to 0x000000 but can be overridden by the constructor's `transparentRGB` option.
     * 
     * @param {Buffer} buffer Bytes of an encoded GIF to decode.
     * @return {Promise} A Promise that resolves to an instance of the Gif class, representing the encoded GIF.
     * @throws {GifError} Error upon encountered an encoding-related problem with a GIF, so that the caller can distinguish between software errors and problems with GIFs.
     */

    decodeGif(buffer) {
        try {
            let reader;
            try {
                reader = new Omggif.GifReader(buffer);
            }
            catch (err) {
                throw new GifError(err);
            }
            const frameCount = reader.numFrames();
            const frames = [];
            const spec = {
                width: reader.width,
                height: reader.height,
                loops: reader.loopCount()
            };

            spec.usesTransparency = false;
            for (let i = 0; i < frameCount; ++i) {
                const frameInfo =
                        this._decodeFrame(reader, i, spec.usesTransparency);
                frames.push(frameInfo.frame);
                if (frameInfo.usesTransparency) {
                    spec.usesTransparency = true;
                }
            }
            return Promise.resolve(new Gif(buffer, frames, spec));
        }
        catch (err) {
            return Promise.reject(err);
        }
    }

    /**
     * Encodes a GIF from provided frames. Each pixel having an alpha value of 0x00 renders as transparent within the encoding, while all pixels of non-zero alpha value render as opaque.
     * 
     * @param {GifFrame[]} frames Array of frames to encode
     * @param {object} spec An optional object that may provide values for `loops` and `colorScope`, as defined for the Gif class. However, `colorSpace` may also take the value Gif.GlobalColorsPreferred (== 0) to indicate that the encoder should attempt to create only a global color table. `loop` defaults to 0, looping indefinitely, and `colorScope` defaults to Gif.GlobalColorsPreferred.
     * @return {Promise} A Promise that resolves to an instance of the Gif class, representing the encoded GIF.
     * @throws {GifError} Error upon encountered an encoding-related problem with a GIF, so that the caller can distinguish between software errors and problems with GIFs.
     */

    encodeGif(frames, spec = {}) {
        try {
            if (frames === null || frames.length === 0) {
                throw new GifError("there are no frames");
            }
            const dims = GifUtil().getMaxDimensions(frames);

            spec = Object.assign({}, spec); // don't munge caller's spec
            spec.width = dims.maxWidth;
            spec.height = dims.maxHeight;
            spec.loops = spec.loops || 0;
            spec.colorScope = spec.colorScope || Gif.GlobalColorsPreferred;

            return Promise.resolve(this._encodeGif(frames, spec));
        }
        catch (err) {
            return Promise.reject(err);
        }
    }

    _decodeFrame(reader, frameIndex, alreadyUsedTransparency) {
        let info, buffer;
        try {
            info = reader.frameInfo(frameIndex);
            buffer = new Buffer(reader.width * reader.height * 4);
            reader.decodeAndBlitFrameRGBA(frameIndex, buffer);
            if (info.width !== reader.width || info.height !== reader.height) {
                if (info.y) {
                    // skip unused rows
                    buffer = buffer.slice(info.y * reader.width * 4);
                }
                if (reader.width > info.width) {
                    // skip scanstride
                    for (let ii = 0; ii < info.height; ++ii) {
                        buffer.copy(buffer, ii * info.width * 4,
                            (info.x + ii * reader.width) * 4,
                            (info.x + ii * reader.width) * 4 + info.width * 4);
                    }
                }
                // trim buffer to size
                buffer = buffer.slice(0, info.width * info.height * 4);
            }
        }
        catch (err) {
            throw new GifError(err);
        }

        let usesTransparency = false;
        if (this._transparentRGBA === null) {
            if (!alreadyUsedTransparency) {
                for (let i = 3; i < buffer.length; i += 4) {
                    if (buffer[i] === 0) {
                        usesTransparency = true;
                        i = buffer.length;
                    }
                }
            }
        }
        else {
            for (let i = 3; i < buffer.length; i += 4) {
                if (buffer[i] === 0) {
                    buffer.writeUInt32BE(this._transparentRGBA, i - 3);
                    usesTransparency = true; // GIF might encode unused index
                }
            }
        }

        const frame = new GifFrame(info.width, info.height, buffer, {
            xOffset: info.x,
            yOffset: info.y,
            disposalMethod: info.disposal,
            interlaced: info.interlaced,
            delayCentisecs: info.delay
        });
        return { frame, usesTransparency };
    }

    _encodeGif(frames, spec) {
        let colorInfo;
        if (spec.colorScope === Gif.LocalColorsOnly) {
            colorInfo = GifUtil().getColorInfo(frames, 0);
        }
        else {
            colorInfo = GifUtil().getColorInfo(frames, 256);
            if (!colorInfo.colors) { // if global palette impossible
                if (spec.colorScope === Gif.GlobalColorsOnly) {
                    throw new GifError(
                            "Too many color indexes for global color table");
                }
                spec.colorScope = Gif.LocalColorsOnly
            }
        }
        spec.usesTransparency = colorInfo.usesTransparency;

        const localPalettes = colorInfo.palettes;
        if (spec.colorScope === Gif.LocalColorsOnly) {
            const localSizeEst = 2000; //this._getSizeEstimateLocal(localPalettes, frames);
            return _encodeLocal(frames, spec, localSizeEst, localPalettes);
        }

        const globalSizeEst = 2000; //this._getSizeEstimateGlobal(colorInfo, frames);
        return _encodeGlobal(frames, spec, globalSizeEst, colorInfo);
    }

    _getSizeEstimateGlobal(globalPalette, frames) {
        if (this._testInitialBufferSize > 0) {
            return this._testInitialBufferSize;
        }
        let sizeEst = PER_GIF_OVERHEAD + 3*256 /* max palette size*/;
        const pixelBitWidth = _getPixelBitWidth(globalPalette);
        frames.forEach(frame => {
            sizeEst += _getFrameSizeEst(frame, pixelBitWidth);
        });
        return sizeEst; // should be the upper limit
    }

    _getSizeEstimateLocal(palettes, frames) {
        if (this._testInitialBufferSize > 0) {
            return this._testInitialBufferSize;
        }
        let sizeEst = PER_GIF_OVERHEAD;
        for (let i = 0; i < frames.length; ++i ) {
            const palette = palettes[i];
            const pixelBitWidth = _getPixelBitWidth(palette);
            sizeEst += _getFrameSizeEst(frames[i], pixelBitWidth);
        }
        return sizeEst; // should be the upper limit
    }
}
exports.GifCodec = GifCodec;

function _colorLookupLinear(colors, color) {
    const index = colors.indexOf(color);
    return (index === -1 ? null : index);
}

function _colorLookupBinary(colors, color) {
    // adapted from https://stackoverflow.com/a/10264318/650894
    var lo = 0, hi = colors.length - 1, mid;
    while (lo <= hi) {
        mid = Math.floor((lo + hi)/2);
        if (colors[mid] > color)
            hi = mid - 1;
        else if (colors[mid] < color)
            lo = mid + 1;
        else
            return mid;
    }
    return null;
}

function _encodeGlobal(frames, spec, bufferSizeEst, globalPalette) {
    // would be inefficient for frames to lookup colors in extended palette 
    const extendedGlobalPalette = {
        colors: globalPalette.colors.slice(),
        usesTransparency: globalPalette.usesTransparency
    };
    _extendPaletteToPowerOf2(extendedGlobalPalette);
    const options = {
        palette: extendedGlobalPalette.colors,
        loop: spec.loops
    };
    let buffer = new Buffer(bufferSizeEst);
    let gifWriter;
    try {
        gifWriter = new Omggif.GifWriter(buffer, spec.width, spec.height,
                            options);
    }
    catch (err) {
        throw new GifError(err);
    }
    for (let i = 0; i < frames.length; ++i) {
        buffer = _writeFrame(gifWriter, i, frames[i], globalPalette, false);
    }
    return new Gif(buffer.slice(0, gifWriter.end()), frames, spec);
}

function _encodeLocal(frames, spec, bufferSizeEst, localPalettes) {
    const options = {
        loop: spec.loops
    };
    let buffer = new Buffer(bufferSizeEst);
    let gifWriter;
    try {
        gifWriter = new Omggif.GifWriter(buffer, spec.width, spec.height,
                            options);
    }                            
    catch (err) {
        throw new GifError(err);
    }
    for (let i = 0; i < frames.length; ++i) {
        buffer = _writeFrame(gifWriter, i, frames[i], localPalettes[i], true);
    }
    return new Gif(buffer.slice(0, gifWriter.end()), frames, spec);
}

function _extendPaletteToPowerOf2(palette) {
    const colors = palette.colors;
    if (palette.usesTransparency) {
        colors.push(0);
    }
    const colorCount = colors.length;
    let powerOf2 = 2;
    while (colorCount > powerOf2) {
        powerOf2 <<= 1;
    }
    colors.length = powerOf2;
    colors.fill(0, colorCount);
}

function _getFrameSizeEst(frame, pixelBitWidth) {
    let byteLength = frame.bitmap.width * frame.bitmap.height;
    byteLength = Math.ceil(byteLength * pixelBitWidth / 8);
    byteLength += Math.ceil(byteLength / 255); // add block size bytes
    // assume maximum palete size because it might get extended for power of 2
    return (PER_FRAME_OVERHEAD + byteLength + 3 * 256 /* largest palette */);
}

function _getIndexedImage(frameIndex, frame, palette) {
    const colors = palette.colors;
    const colorToIndexFunc = (colors.length <= 8 ? // guess at the break-even
            _colorLookupLinear : _colorLookupBinary);
    const colorBuffer = frame.bitmap.data;
    const indexBuffer = new Buffer(colorBuffer.length/4);
    let transparentIndex = colors.length;
    let i = 0, j = 0;

    while (i < colorBuffer.length) {
        if (colorBuffer[i + 3] !== 0) {
            const color = (colorBuffer.readUInt32BE(i, true) >> 8) & 0xFFFFFF;
            // caller guarantees that the color will be in the palette
            indexBuffer[j] = colorToIndexFunc(colors, color);
        }
        else {
            indexBuffer[j] = transparentIndex;
        }
        i += 4; // skip alpha
        ++j;
    }

    if (palette.usesTransparency) {
        if (transparentIndex === 256) {
            throw new GifError(`Frame ${frameIndex} already has 256 colors` +
                    `and so can't use transparency`);
        }
    }
    else {
        transparentIndex = null;
    }

    return { buffer: indexBuffer, transparentIndex };
}

function _getPixelBitWidth(palette) {
    let indexCount = palette.indexCount;
    let pixelBitWidth = 0;
    --indexCount; // start at maximum index
    while (indexCount) {
        ++pixelBitWidth;
        indexCount >>= 1;
    }
    return (pixelBitWidth > 0 ? pixelBitWidth : 1);
}

function _writeFrame(gifWriter, frameIndex, frame, palette, isLocalPalette) {
    if (frame.interlaced) {
        throw new GifError("writing interlaced GIFs is not supported");
    }
    const frameInfo = _getIndexedImage(frameIndex, frame, palette);
    const options = {
        delay: frame.delayCentisecs,
        disposal: frame.disposalMethod,
        transparent: frameInfo.transparentIndex
    };
    if (isLocalPalette) {
        _extendPaletteToPowerOf2(palette); // ok 'cause palette never used again
        options.palette = palette.colors;
    }
    try {
        let buffer = gifWriter.getOutputBuffer();
        let startOfFrame = gifWriter.getOutputBufferPosition();
        let endOfFrame;
        let tryAgain = true;

        while (tryAgain) {
            endOfFrame = gifWriter.addFrame(frame.xOffset, frame.yOffset,
                    frame.bitmap.width, frame.bitmap.height, frameInfo.buffer, options);
            tryAgain = false;
            if (endOfFrame >= buffer.length - 1) {
                const biggerBuffer = new Buffer(buffer.length * 1.5);
                buffer.copy(biggerBuffer);
                gifWriter.setOutputBuffer(biggerBuffer);
                gifWriter.setOutputBufferPosition(startOfFrame);
                buffer = biggerBuffer;
                tryAgain = true;
            }
        }
        return buffer;
    }
    catch (err) {
        throw new GifError(err);
    }
}

}, function(modId) { var map = {"./gif":1728739681313,"./gifutil":1728739681315,"./gifframe":1728739681316}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1728739681315, function(require, module, exports) {


/** @namespace GifUtil */

const fs = require('fs');
const ImageQ = require('image-q');

const BitmapImage = require('./bitmapimage');
const { GifFrame } = require('./gifframe');
const { GifError } = require('./gif');
const { GifCodec } = require('./gifcodec');

const INVALID_SUFFIXES = ['.jpg', '.jpeg', '.png', '.bmp'];

const defaultCodec = new GifCodec();

/**
 * cloneFrames() clones provided frames. It's a utility method for cloning an entire array of frames at once.
 * 
 * @function cloneFrames
 * @memberof GifUtil
 * @param {GifFrame[]} frames An array of GifFrame instances to clone
 * @return {GifFrame[]} An array of GifFrame clones of the provided frames.
 */

exports.cloneFrames = function (frames) {
    let clones = [];
    frames.forEach(frame => {

        clones.push(new GifFrame(frame));
    });
    return clones;
}

/**
 * getColorInfo() gets information about the colors used in the provided frames. The method is able to return an array of all colors found across all frames.
 * 
 * `maxGlobalIndex` controls whether the computation short-circuits to avoid doing work that the caller doesn't need. The method only returns `colors` and `indexCount` for the colors across all frames when the number of indexes required to store the colors and transparency in a GIF (which is the value of `indexCount`) is less than or equal to `maxGlobalIndex`. Such short-circuiting is useful when the caller just needs to determine whether any frame includes transparency.
 * 
 * @function getColorInfo
 * @memberof GifUtil
 * @param {GifFrame[]} frames Frames to examine for color and transparency.
 * @param {number} maxGlobalIndex Maximum number of color indexes (including one for transparency) allowed among the returned compilation of colors. `colors` and `indexCount` are not returned if the number of color indexes required to accommodate  all frames exceeds this number. Returns `colors` and `indexCount` by default.
 * @returns {object} Object containing at least `palettes` and `usesTransparency`. `palettes` is an array of all the palettes returned by GifFrame#getPalette(). `usesTransparency` indicates whether at least one frame uses transparency. If `maxGlobalIndex` is not exceeded, the object also contains `colors`, an array of all colors (RGB) found across all palettes, sorted by increasing value, and `indexCount` indicating the number of indexes required to store the colors and the transparency in a GIF.
 * @throws {GifError} When any frame requires more than 256 color indexes.
 */

exports.getColorInfo = function (frames, maxGlobalIndex) {
    let usesTransparency = false;
    const palettes = [];
    for (let i = 0; i < frames.length; ++i) {
        let palette = frames[i].getPalette();
        if (palette.usesTransparency) {
            usesTransparency = true;
        }
        if (palette.indexCount > 256) {
            throw new GifError(`Frame ${i} uses more than 256 color indexes`);
        }
        palettes.push(palette);
    }
    if (maxGlobalIndex === 0) {
        return { usesTransparency, palettes };
    }

    const globalColorSet = new Set();
    palettes.forEach(palette => {

        palette.colors.forEach(color => {

            globalColorSet.add(color);
        });
    });
    let indexCount = globalColorSet.size;
    if (usesTransparency) {
        // odd that GIF requires a color table entry at transparent index
        ++indexCount;
    }
    if (maxGlobalIndex && indexCount > maxGlobalIndex) {
        return { usesTransparency, palettes };
    }
    
    const colors = new Array(globalColorSet.size);
    const iter = globalColorSet.values();
    for (let i = 0; i < colors.length; ++i) {
        colors[i] = iter.next().value;
    }
    colors.sort((a, b) => (a - b));
    return { colors, indexCount, usesTransparency, palettes };
};

/**
 * copyAsJimp() returns a Jimp that contains a copy of the provided bitmap image (which may be either a BitmapImage or a GifFrame). Modifying the Jimp does not affect the provided bitmap image. This method serves as a macro for simplifying working with Jimp.
 *
 * @function copyAsJimp
 * @memberof GifUtil
 * @param {object} Reference to the Jimp package, keeping this library from being dependent on Jimp.
 * @param {bitmapImageToCopy} Instance of BitmapImage (may be a GifUtil) with which to source the Jimp.
 * @return {object} An new instance of Jimp containing a copy of the image in bitmapImageToCopy.
 */
 
exports.copyAsJimp = function (jimp, bitmapImageToCopy) {
    return exports.shareAsJimp(jimp, new BitmapImage(bitmapImageToCopy));
};

/**
 * getMaxDimensions() returns the pixel width and height required to accommodate all of the provided frames, according to the offsets and dimensions of each frame.
 * 
 * @function getMaxDimensions
 * @memberof GifUtil
 * @param {GifFrame[]} frames Frames to measure for their aggregate maximum dimensions.
 * @return {object} An object of the form {maxWidth, maxHeight} indicating the maximum width and height required to accommodate all frames.
 */

exports.getMaxDimensions = function (frames) {
    let maxWidth = 0, maxHeight = 0;
    frames.forEach(frame => {
        const width = frame.xOffset + frame.bitmap.width;
        if (width > maxWidth) {
            maxWidth = width;
        }
        const height = frame.yOffset + frame.bitmap.height;
        if (height > maxHeight) {
            maxHeight = height;
        }
    });
    return { maxWidth, maxHeight };
};

/**
 * Quantizes colors so that there are at most a given number of color indexes (including transparency) across all provided images. Uses an algorithm by Anthony Dekker.
 * 
 * The method treats different RGBA combinations as different colors, so if the frame has multiple alpha values or multiple RGB values for an alpha value, the caller may first want to normalize them by converting all transparent pixels to the same RGBA values.
 * 
 * The method may increase the number of colors if there are fewer than the provided maximum.
 * 
 * @function quantizeDekker
 * @memberof GifUtil
 * @param {BitmapImage|BitmapImage[]} imageOrImages Image or array of images (such as GifFrame instances) to be color-quantized. Quantizing across multiple images ensures color consistency from frame to frame.
 * @param {number} maxColorIndexes The maximum number of color indexes that will exist in the palette after completing quantization. Defaults to 256.
 * @param {object} dither (optional) An object configuring the dithering to apply. The properties are as followings, imported from the [`image-q` package](https://github.com/ibezkrovnyi/image-quantization) without explanation: { `ditherAlgorithm`: One of 'FloydSteinberg', 'FalseFloydSteinberg', 'Stucki', 'Atkinson', 'Jarvis', 'Burkes', 'Sierra', 'TwoSierra', 'SierraLite'; `minimumColorDistanceToDither`: (optional) A number defaulting to 0; `serpentine`: (optional) A boolean defaulting to true; `calculateErrorLikeGIMP`: (optional) A boolean defaulting to false. }
 */

exports.quantizeDekker = function (imageOrImages, maxColorIndexes, dither) {
    maxColorIndexes = maxColorIndexes || 256;
    _quantize(imageOrImages, 'NeuQuantFloat', maxColorIndexes, 0, dither);
}

/**
 * Quantizes colors so that there are at most a given number of color indexes (including transparency) across all provided images. Uses an algorithm by Leon Sorokin. This quantization method differs from the other two by likely never increasing the number of colors, should there be fewer than the provided maximum.
 * 
 * The method treats different RGBA combinations as different colors, so if the frame has multiple alpha values or multiple RGB values for an alpha value, the caller may first want to normalize them by converting all transparent pixels to the same RGBA values.
 * 
 * @function quantizeSorokin
 * @memberof GifUtil
 * @param {BitmapImage|BitmapImage[]} imageOrImages Image or array of images (such as GifFrame instances) to be color-quantized. Quantizing across multiple images ensures color consistency from frame to frame.
 * @param {number} maxColorIndexes The maximum number of color indexes that will exist in the palette after completing quantization. Defaults to 256.
 * @param {string} histogram (optional) Histogram method: 'top-pop' for global top-population, 'min-pop' for minimum-population threshhold within subregions. Defaults to 'min-pop'.
 * @param {object} dither (optional) An object configuring the dithering to apply, as explained for `quantizeDekker()`.
 */

exports.quantizeSorokin = function (imageOrImages, maxColorIndexes, histogram, dither) {
    maxColorIndexes = maxColorIndexes || 256;
    histogram = histogram || 'min-pop';
    let histogramID;
    switch (histogram) {
        case 'min-pop':
        histogramID = 2;
        break;

        case 'top-pop':
        histogramID = 1;
        break

        default:
        throw new Error(`Invalid quantizeSorokin histogram '${histogram}'`);
    }
    _quantize(imageOrImages, 'RGBQuant', maxColorIndexes, histogramID, dither);
}

/**
 * Quantizes colors so that there are at most a given number of color indexes (including transparency) across all provided images. Uses an algorithm by Xiaolin Wu.
 * 
 * The method treats different RGBA combinations as different colors, so if the frame has multiple alpha values or multiple RGB values for an alpha value, the caller may first want to normalize them by converting all transparent pixels to the same RGBA values.
 * 
 * The method may increase the number of colors if there are fewer than the provided maximum.
 * 
 * @function quantizeWu
 * @memberof GifUtil
 * @param {BitmapImage|BitmapImage[]} imageOrImages Image or array of images (such as GifFrame instances) to be color-quantized. Quantizing across multiple images ensures color consistency from frame to frame.
 * @param {number} maxColorIndexes The maximum number of color indexes that will exist in the palette after completing quantization. Defaults to 256.
 * @param {number} significantBits (optional) This is the number of significant high bits in each RGB color channel. Takes integer values from 1 through 8. Higher values correspond to higher quality. Defaults to 5.
 * @param {object} dither (optional) An object configuring the dithering to apply, as explained for `quantizeDekker()`.
 */

exports.quantizeWu = function (imageOrImages, maxColorIndexes, significantBits, dither) {
    maxColorIndexes = maxColorIndexes || 256;
    significantBits = significantBits || 5;
    if (significantBits < 1 || significantBits > 8) {
        throw new Error("Invalid quantization quality");
    }
    _quantize(imageOrImages, 'WuQuant', maxColorIndexes, significantBits, dither);
}

/**
 * read() decodes an encoded GIF, whether provided as a filename or as a byte buffer.
 * 
 * @function read
 * @memberof GifUtil
 * @param {string|Buffer} source Source to decode. When a string, it's the GIF filename to load and parse. When a Buffer, it's an encoded GIF to parse.
 * @param {object} decoder An optional GIF decoder object implementing the `decode` method of class GifCodec. When provided, the method decodes the GIF using this decoder. When not provided, the method uses GifCodec.
 * @return {Promise} A Promise that resolves to an instance of the Gif class, representing the decoded GIF.
 */

exports.read = function (source, decoder) {
    decoder = decoder || defaultCodec;
    if (Buffer.isBuffer(source)) {
        return decoder.decodeGif(source);
    }
    return _readBinary(source)
    .then(buffer => {

        return decoder.decodeGif(buffer);
    });
};

/**
 * shareAsJimp() returns a Jimp that shares a bitmap with the provided bitmap image (which may be either a BitmapImage or a GifFrame). Modifying the image in either the Jimp or the BitmapImage affects the other objects. This method serves as a macro for simplifying working with Jimp.
 *
 * @function shareAsJimp
 * @memberof GifUtil
 * @param {object} Reference to the Jimp package, keeping this library from being dependent on Jimp.
 * @param {bitmapImageToShare} Instance of BitmapImage (may be a GifUtil) with which to source the Jimp.
 * @return {object} An new instance of Jimp that shares the image in bitmapImageToShare.
 */
 
exports.shareAsJimp = function (jimp, bitmapImageToShare) {
    const jimpImage = new jimp(bitmapImageToShare.bitmap.width,
            bitmapImageToShare.bitmap.height, 0);
    jimpImage.bitmap.data = bitmapImageToShare.bitmap.data;
    return jimpImage;
};

/**
 * write() encodes a GIF and saves it as a file.
 * 
 * @function write
 * @memberof GifUtil
 * @param {string} path Filename to write GIF out as. Will overwrite an existing file.
 * @param {GifFrame[]} frames Array of frames to be written into GIF.
 * @param {object} spec An optional object that may provide values for `loops` and `colorScope`, as defined for the Gif class. However, `colorSpace` may also take the value Gif.GlobalColorsPreferred (== 0) to indicate that the encoder should attempt to create only a global color table. `loop` defaults to 0, looping indefinitely, and `colorScope` defaults to Gif.GlobalColorsPreferred.
 * @param {object} encoder An optional GIF encoder object implementing the `encode` method of class GifCodec. When provided, the method encodes the GIF using this encoder. When not provided, the method uses GifCodec.
 * @return {Promise} A Promise that resolves to an instance of the Gif class, representing the encoded GIF.
 */

exports.write = function (path, frames, spec, encoder) {
    encoder = encoder || defaultCodec;
    const matches = path.match(/\.[a-zA-Z]+$/); // prevent accidents
    if (matches !== null &&
            INVALID_SUFFIXES.includes(matches[0].toLowerCase()))
    {
        throw new Error(`GIF '${path}' has an unexpected suffix`);
    }

    return encoder.encodeGif(frames, spec)
    .then(gif => {

        return _writeBinary(path, gif.buffer)
        .then(() => {

            return gif;
        });
    });
};

function _quantize(imageOrImages, method, maxColorIndexes, modifier, dither) {
    const images = Array.isArray(imageOrImages) ? imageOrImages : [imageOrImages];
    const ditherAlgs = [
        'FloydSteinberg',
        'FalseFloydSteinberg',
        'Stucki',
        'Atkinson',
        'Jarvis',
        'Burkes',
        'Sierra',
        'TwoSierra',
        'SierraLite'
    ];

    if (dither) {
        if (ditherAlgs.indexOf(dither.ditherAlgorithm) < 0) {
            throw new Error(`Invalid ditherAlgorithm '${dither.ditherAlgorithm}'`);
        }
        if (dither.serpentine === undefined) {
            dither.serpentine = true;
        }
        if (dither.minimumColorDistanceToDither === undefined) {
            dither.minimumColorDistanceToDither = 0;
        }
        if (dither.calculateErrorLikeGIMP === undefined) {
            dither.calculateErrorLikeGIMP = false;
        }
    }

    const distCalculator = new ImageQ.distance.Euclidean();
    const quantizer = new ImageQ.palette[method](distCalculator, maxColorIndexes, modifier);
    let imageMaker;
    if (dither) {
        imageMaker = new ImageQ.image.ErrorDiffusionArray(
            distCalculator,
            ImageQ.image.ErrorDiffusionArrayKernel[dither.ditherAlgorithm],
            dither.serpentine,
            dither.minimumColorDistanceToDither,
            dither.calculateErrorLikeGIMP
        );
    }
    else {
        imageMaker = new ImageQ.image.NearestColor(distCalculator);
    }

    const inputContainers = [];
    images.forEach(image => {

        const imageBuf = image.bitmap.data;
        const inputBuf = new ArrayBuffer(imageBuf.length);
        const inputArray = new Uint32Array(inputBuf);
        for (let bi = 0, ai = 0; bi < imageBuf.length; bi += 4, ++ai) {
            inputArray[ai] = imageBuf.readUInt32LE(bi, true);
        }
        const inputContainer = ImageQ.utils.PointContainer.fromUint32Array(
                inputArray, image.bitmap.width, image.bitmap.height);
        quantizer.sample(inputContainer);
        inputContainers.push(inputContainer);
    });
    
    const limitedPalette = quantizer.quantizeSync();

    for (let i = 0; i < images.length; ++i) {
        const imageBuf = images[i].bitmap.data;
        const outputContainer = imageMaker.quantizeSync(inputContainers[i], limitedPalette);
        const outputArray = outputContainer.toUint32Array();
        for (let bi = 0, ai = 0; bi < imageBuf.length; bi += 4, ++ai) {
            imageBuf.writeUInt32LE(outputArray[ai], bi);
        }
    }
}

function _readBinary(path) {
    // TBD: add support for URLs
    return new Promise((resolve, reject) => {

        fs.readFile(path, (err, buffer) => {

            if (err) {
                return reject(err);
            }
            return resolve(buffer);
        });
    });
}

function _writeBinary(path, buffer) {
    // TBD: add support for URLs
    return new Promise((resolve, reject) => {

        fs.writeFile(path, buffer, err => {
            
            if (err) {
                return reject(err);
            }
            return resolve();
        });
    });
}

}, function(modId) { var map = {"./bitmapimage":1728739681312,"./gifframe":1728739681316,"./gif":1728739681313,"./gifcodec":1728739681314}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1728739681316, function(require, module, exports) {


const BitmapImage = require('./bitmapimage');
const { GifError } = require('./gif');

/** @class GifFrame */

class GifFrame extends BitmapImage {

    // xOffset - x offset of bitmap on GIF (defaults to 0)
    // yOffset - y offset of bitmap on GIF (defaults to 0)
    // disposalMethod - pixel disposal method when handling partial images
    // delayCentisecs - duration of frame in hundredths of a second
    // interlaced - whether the image is interlaced (defaults to false)

    /**
     * GifFrame is a class representing an image frame of a GIF. GIFs contain one or more instances of GifFrame.
     * 
     * Property | Description
     * --- | ---
     * xOffset | x-coord of position within GIF at which to render the image (defaults to 0)
     * yOffset | y-coord of position within GIF at which to render the image (defaults to 0)
     * disposalMethod | GIF disposal method; only relevant when the frames aren't all the same size (defaults to 2, disposing to background color)
     * delayCentisecs | duration of the frame in hundreths of a second
     * interlaced | boolean indicating whether the frame renders interlaced
     * 
     * Its constructor supports the following signatures:
     * 
     * * new GifFrame(bitmap: {width: number, height: number, data: Buffer}, options?)
     * * new GifFrame(bitmapImage: BitmapImage, options?)
     * * new GifFrame(width: number, height: number, buffer: Buffer, options?)
     * * new GifFrame(width: number, height: number, backgroundRGBA?: number, options?)
     * * new GifFrame(frame: GifFrame)
     * 
     * See the base class BitmapImage for a discussion of all parameters but `options` and `frame`. `options` is an optional argument providing initial values for the above-listed GifFrame properties. Each property within option is itself optional.
     * 
     * Provide a `frame` to the constructor to create a clone of the provided frame. The new frame includes a copy of the provided frame's pixel data so that each can subsequently be modified without affecting each other.
     */

    constructor(...args) {
        super(...args);
        if (args[0] instanceof GifFrame) {
            // copy a provided GifFrame
            const source = args[0];
            this.xOffset = source.xOffset;
            this.yOffset = source.yOffset;
            this.disposalMethod = source.disposalMethod;
            this.delayCentisecs = source.delayCentisecs;
            this.interlaced = source.interlaced;
        }
        else {
            const lastArg = args[args.length - 1];
            let options = {};
            if (typeof lastArg === 'object' && !(lastArg instanceof BitmapImage)) {
                options = lastArg;
            }
            this.xOffset = options.xOffset || 0;
            this.yOffset = options.yOffset || 0;
            this.disposalMethod = (options.disposalMethod !== undefined ?
                    options.disposalMethod : GifFrame.DisposeToBackgroundColor);
            this.delayCentisecs = options.delayCentisecs || 8;
            this.interlaced = options.interlaced || false;
        }
    }

    /**
     * Get a summary of the colors found within the frame. The return value is an object of the following form:
     * 
     * Property | Description
     * --- | ---
     * colors | An array of all the opaque colors found within the frame. Each color is given as an RGB number of the form 0xRRGGBB. The array is sorted by increasing number. Will be an empty array when the image is completely transparent.
     * usesTransparency | boolean indicating whether there are any transparent pixels within the frame. A pixel is considered transparent if its alpha value is 0x00.
     * indexCount | The number of color indexes required to represent this palette of colors. It is equal to the number of opaque colors plus one if the image includes transparency.
     * 
     * @return {object} An object representing a color palette as described above.
     */

    getPalette() {
        // returns with colors sorted low to high
        const colorSet = new Set();
        const buf = this.bitmap.data;
        let i = 0;
        let usesTransparency = false;
        while (i < buf.length) {
            if (buf[i + 3] === 0) {
                usesTransparency = true;
            }
            else {
                // can eliminate the bitshift by starting one byte prior
                const color = (buf.readUInt32BE(i, true) >> 8) & 0xFFFFFF;
                colorSet.add(color);
            }
            i += 4; // skip alpha
        }
        const colors = new Array(colorSet.size);
        const iter = colorSet.values();
        for (i = 0; i < colors.length; ++i) {
            colors[i] = iter.next().value;
        }
        colors.sort((a, b) => (a - b));
        let indexCount = colors.length;
        if (usesTransparency) {
            ++indexCount;
        }
        return { colors, usesTransparency, indexCount };
    }
}

GifFrame.DisposeToAnything = 0;
GifFrame.DisposeNothing = 1;
GifFrame.DisposeToBackgroundColor = 2;
GifFrame.DisposeToPrevious = 3;

exports.GifFrame = GifFrame;

}, function(modId) { var map = {"./bitmapimage":1728739681312,"./gif":1728739681313}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1728739681311);
})()
//miniprogram-npm-outsideDeps=["omggif","fs","image-q"]
//# sourceMappingURL=index.js.map