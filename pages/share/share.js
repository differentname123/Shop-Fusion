Page({
  data: {
    images: [], // 存储二维码解析结果的数组
    loading: false, // 是否正在加载
    navBarHeight: 64, // 默认导航栏高度
  },

  onLoad() {
    const titleNav = this.selectComponent('#titleNav');
    if (titleNav) {
      this.setData({
        navBarHeight: titleNav.data.navBarHeight + 66,
      });
    }
  },

  // 扫描二维码并解析
  scanQRCode() {
    const that = this;

    console.log('开始扫描二维码...');
    that.setData({ loading: true });

    wx.scanCode({
      onlyFromCamera: false,
      scanType: ['qrCode', 'barCode'],
      success(res) {
        console.log('二维码扫描成功：', res);
        const resultText = res.result;
        const imagePath = res.path || '';
        console.log('解析出的文本内容：', resultText);

        // 尝试从 resultText 中提取 group_order_id
        const groupOrderId = that.extractParameter(resultText, 'group_order_id');
        if (groupOrderId) {
          console.log(`检测到 group_order_id: ${groupOrderId}`);
          // 满足条件，传入完整 URL
          that.fetchDataFromCloudFunction(resultText, imagePath);
        } else if (resultText.startsWith('https://file-link.pinduoduo.com/')) {
          console.log('检测到 file-link URL：', resultText);
          that.fetchDataFromCloudFunction(resultText, imagePath);
        } else {
          console.log('二维码内容不符合解析条件，直接展示结果。');
          that.setData({
            images: that.data.images.concat({
              path: imagePath,
              result: resultText,
              shortResult: that.truncateText(resultText, 20),
            }),
          });
          wx.showToast({ title: '解析成功', icon: 'success' });
          that.setData({ loading: false }); // 确保加载动画关闭
        }
      },
      fail(err) {
        console.error('二维码扫描失败：', err);
        wx.showToast({ title: '解析失败，请重试', icon: 'none' });
        that.setData({ loading: false }); // 确保加载动画关闭
      },
    });
  },

  // 调用云函数 fetchData
  fetchDataFromCloudFunction(url, imagePath) {
    const that = this;

    console.log('开始调用云函数，传入的 URL 为：', url);

    wx.cloud.callFunction({
      name: 'fetchData',
      data:  {
        origin_url: url,
      }, // 直接传入解析的 URL
      success(res) {
        console.log('云函数调用成功，响应内容：', res);

        if (res.result.status === 'success') {
          const currentGoods = res.result.data;
          if (currentGoods) {
            const goodsName = currentGoods.goodsName || '商品名称未知';
            const hdThumbUrl = currentGoods.hdThumbUrl || '';
            console.log(`商品名称：${goodsName}，高清图片地址：${hdThumbUrl}`);

            if (hdThumbUrl) {
              console.log('尝试下载商品图片...');
              wx.downloadFile({
                url: hdThumbUrl,
                success: (downloadRes) => {
                  if (downloadRes.statusCode === 200) {
                    console.log('图片下载成功，临时路径：', downloadRes.tempFilePath);
                    const downloadedImagePath = downloadRes.tempFilePath;
                    that.setData({
                      images: that.data.images.concat({
                        path: downloadedImagePath,
                        result: goodsName,
                        shortResult: that.truncateText(goodsName, 20),
                      }),
                    });
                  }
                },
                fail: (err) => {
                  console.error('图片下载失败：', err);
                  that.setData({
                    images: that.data.images.concat({
                      path: imagePath,
                      result: goodsName,
                      shortResult: that.truncateText(goodsName, 20),
                    }),
                  });
                },
              });
            } else {
              console.log('未提供高清图片地址，仅更新商品名称。');
              that.setData({
                images: that.data.images.concat({
                  path: imagePath,
                  result: goodsName,
                  shortResult: that.truncateText(goodsName, 20),
                }),
              });
            }
          } else {
            console.error('云函数返回结果为空。');
            that.setData({
              images: that.data.images.concat({
                path: imagePath,
                result: 'currentGoods 未找到',
                shortResult: 'currentGoods 未找到',
              }),
            });
          }
        } else {
          console.error('云函数返回错误：', res.result.message);
          that.setData({
            images: that.data.images.concat({
              path: imagePath,
              result: '解析失败',
              shortResult: '解析失败',
            }),
          });
        }
      },
      fail(err) {
        console.error('云函数调用失败：', err);
        that.setData({
          images: that.data.images.concat({
            path: imagePath,
            result: '解析失败',
            shortResult: '解析失败',
          }),
        });
      },
      complete() {
        console.log('云函数处理完成，关闭加载动画。');
        that.setData({ loading: false }); // 确保加载动画关闭
      },
    });
  },

  // 从链接中提取指定参数值
  extractParameter(url, parameterName) {
    const regExp = new RegExp(`[?&]${parameterName}=([^&#]*)`, 'i');
    const match = url.match(regExp);
    const result = match ? decodeURIComponent(match[1]) : null;
    console.log(`从 URL 中提取参数 [${parameterName}] 的值：${result}`);
    return result;
  },

  // 截取文字，展示一部分
  truncateText(text, maxLength) {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  },
});
