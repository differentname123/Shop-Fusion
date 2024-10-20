// cloudfunctions/parseQRCode/index.js
const cloud = require('wx-server-sdk');
const jsQR = require('jsqr');
const PNG = require('png-js');
const jpeg = require('jpeg-js');

cloud.init();

exports.main = async (event, context) => {
  const { fileID } = event;
  console.log('Starting cloud function with fileID:', fileID);
  try {
    // 下载图片文件
    const res = await cloud.downloadFile({
      fileID: fileID,
    });
    console.log('File downloaded successfully.');
    const imageBuffer = res.fileContent;
    console.log('Image buffer length:', imageBuffer.length);

    // 检测图像格式（仅支持 PNG 和 JPEG）
    let imageData;
    let width;
    let height;

    // 判断是否为 PNG 格式
    if (imageBuffer.slice(0, 8).toString('hex') === '89504e470d0a1a0a') {
      console.log('Image format: PNG');
      // 使用 PNGJS 解码 PNG 图像
      const png = new PNG(imageBuffer);
      width = png.width;
      height = png.height;
      console.log('Image dimensions:', width, 'x', height);

      imageData = await new Promise((resolve, reject) => {
        png.decode((pixels) => {
          resolve(pixels);
        });
      });
    }
    // 判断是否为 JPEG 格式
    else if (imageBuffer.slice(0, 2).toString('hex') === 'ffd8') {
      console.log('Image format: JPEG');
      const decodedImage = jpeg.decode(imageBuffer, { useTArray: true });
      width = decodedImage.width;
      height = decodedImage.height;
      console.log('Image dimensions:', width, 'x', height);
      imageData = decodedImage.data;
    } else {
      throw new Error('Unsupported image format. Please upload PNG or JPEG images.');
    }

    console.log('Image data extracted.');

    // 使用 jsQR 解析二维码
    console.log('Starting QR code parsing.');
    const code = jsQR(new Uint8ClampedArray(imageData), width, height);
    if (code) {
      console.log('QR code parsed successfully. Data:', code.data);
      return {
        code: 0,
        data: code.data,
      };
    } else {
      console.log('QR code parsing failed.');
      return {
        code: -1,
        msg: '无法解析图片',
      };
    }
  } catch (err) {
    console.error('An error occurred:', err);
    return {
      errCode: err.errCode || -1,
      errMsg: err.message || '失败',
      errorStack: err.stack,
    };
  }
};
