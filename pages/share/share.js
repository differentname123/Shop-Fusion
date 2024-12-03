Page({
  data: {
    images: [], // 存储二维码解析结果的数组
    loading: false, // 是否正在加载
    navBarHeight: 164, // 导航栏高度
    userInfo: null, // 用户信息
    hasUnsharedData: false, // 是否有未分享的数据
    isPinned: false, // 置顶状态
    isAccelerated: false // 加速拼状态
  },

  async onLoad() {
    this.initNavBarHeight();
    await this.initializeUserInfo();
  },

  // 初始化导航栏高度
  initNavBarHeight() {
    const systemInfo = wx.getSystemInfoSync();
    this.setData({
      navBarHeight: systemInfo.statusBarHeight + 164 // 状态栏高度 + 默认导航栏高度
    });
    // const titleNav = this.selectComponent('#titleNav');
    // if (titleNav) {
    //   this.setData({
    //     navBarHeight: titleNav.data.navBarHeight + 66,
    //   });
    // }
  },

  // 初始化用户信息
  async initializeUserInfo() {
    try {
      const openid = await this.getCachedOpenId();
      const userInfo = await this.fetchUserInfo(openid);
      this.setData({ userInfo });
    } catch (error) {
      console.error('初始化用户信息失败:', error);
      this.setData({ userInfo: this.initDefaultUserInfo() });
    }
  },

  // 获取或缓存 OpenID
  async getCachedOpenId() {
    let openid = wx.getStorageSync('openid');
    if (!openid) {
      const res = await wx.cloud.callFunction({ name: 'getOpenId' });
      openid = res.result.openid;
      wx.setStorageSync('openid', openid);
    }
    return openid;
  },

  // 获取用户信息
  async fetchUserInfo(openid) {
    try {
      const res = await wx.cloud.callFunction({
        name: 'userInfoDB',
        data: { openid, order: 'query' },
      });

      if (res.result && res.result.status === 'success') {
        return res.result.data;
      }

      // 返回默认用户信息并插入数据库
      const defaultUserInfo = this.initDefaultUserInfo(openid);
      await this.upsertUserInfo(defaultUserInfo);
      return defaultUserInfo;
    } catch (error) {
      console.error('获取用户信息失败:', error);
      const defaultUserInfo = this.initDefaultUserInfo(openid);
      await this.upsertUserInfo(defaultUserInfo);
      return defaultUserInfo;
    }
  },

  // 初始化默认用户信息
  initDefaultUserInfo(openid = '') {
    return {
      openid,
      nickName: '',
      points: 50,
      shareCount: 0,
      lastShareDate: '',
    };
  },

  // 更新或插入用户信息
  async upsertUserInfo(userInfo) {
    try {
      const res = await wx.cloud.callFunction({
        name: 'userInfoDB',
        data: {
          openid: userInfo.openid,
          order: 'upsert',
          updateData: userInfo,
        },
      });

      if (res.result && res.result.status === 'success') {
        console.log('用户信息更新或新增成功:', res.result.message);
      } else {
        console.error('用户信息更新或新增失败:', res.result.message);
      }
    } catch (error) {
      console.error('用户信息更新或新增失败:', error);
    }
  },

  // 扫描二维码
  async scanQRCode() {
    if (this.data.hasUnsharedData) {
      const res = await this.showModalAsync({
        title: '提示',
        content: '您有未分享的数据，确定要继续扫描吗？未分享的数据将丢失。',
      });
      if (res.confirm) {
        // 用户点击确定，继续扫描
        this.setData({
          hasUnsharedData: false, // 重置未分享数据标志
          images: [], // 清空现有的结果
        });
        await this.startQRCodeScan();
      } else {
        // 用户点击取消，不做任何操作
      }
    } else {
      await this.startQRCodeScan();
    }
  },

  // 开始二维码扫描
  async startQRCodeScan() {
    this.toggleLoading(true);

    try {
      const res = await wx.scanCode({
        onlyFromCamera: false,
        scanType: ['qrCode', 'barCode'],
      });

      if (res.result) {
        await this.checkAndFetchData(res.result);
      } else {
        this.addImageResult('', '无效二维码');
        wx.showToast({ title: '二维码解析失败', icon: 'none' });
      }
    } catch (error) {
      let error_info = '未识别二维码，可能是二维码太小了，可尝试裁剪图片后重试'
      this.addImageResult('', error_info);
      console.error('二维码扫描失败:', error);
    } finally {
      this.toggleLoading(false);
    }
  },

  // 检查链接并解析数据
  async checkAndFetchData(url) {
    this.toggleLoading(true);

    try {
      const userInfo = await this.ensureUserInfo();
      const today = this.getTodayDate();

      // 重置分享次数
      if (userInfo.lastShareDate !== today) {
        userInfo.lastShareDate = today;
        userInfo.shareCount = 0;
        await this.upsertUserInfo(userInfo);
      }

      // 链接校验
      const groupOrderId = this.extractParameter(url, 'group_order_id');
      if (!groupOrderId && !url.startsWith('https://file-link.pinduoduo.com/')) {
        this.addImageResult('', '无效二维码，请确定拼团图片有效性');
        return;
      }

      // 判断免费调用次数
      if (userInfo.shareCount < 3) {
        await this.fetchDataFromCloudFunction(url);
      } else {
        await this.handlePaidCall(url, userInfo);
      }
    } catch (error) {
      console.error('处理链接失败:', error);
      wx.showToast({ title: '操作失败，请重试', icon: 'none' });
    } finally {
      this.toggleLoading(false);
    }
  },

  // 添加图片解析结果
  addImageResult(imagePath, result, sharedData, data) {
    this.setData({
      images: [
        {
          path: imagePath,
          result,
          data,
          shortResult: this.truncateText(result, 30),
        },
      ], // 覆盖数组，仅保留最新结果
      hasUnsharedData: sharedData, // 设置未分享数据标志
    });
  },

  analyseResult(result) {
    console.log('开始分析结果:', result); // 输出完整的 result 数据
  
    let message = result.message; // 获取分享的消息内容
    let points = result.points || 0; // 获取基础积分
    console.log(`提取的消息内容: ${message}, 基础积分: ${points}`); // 打印提取的信息
  
    if (points > 0) {
      console.log('积分大于 0，弹窗提示用户是否参与已有的团'); // 积分条件满足时的日志
      wx.showModal({
        title: '提示',
        content: ` ${message}，是否直接参与已有的团？`,
        success: (res) => {
          if (res.confirm) {
            console.log('用户点击了“确认”，即将执行参与团逻辑'); // 用户确认的日志
            this.joinGroupDirectly(result);
          } else if (res.cancel) {
            console.log('用户取消了参与团'); // 用户取消的日志
          }
        },
        fail: (err) => {
          console.error('弹窗调用失败:', err); // 弹窗调用失败的日志
        },
      });
    } else {
      console.warn('积分不足，无需提示参与团'); // 积分不足的警告日志
    }
  },
  
  // 直接参与团的逻辑
  joinGroupDirectly(result) {
    // 假设 result 中包含参与团所需的完整数据
    const item = result; // 获取拼团信息对象
    console.log('参与团的 item:', item);
  
    // 拼接 URL
    const url = item.promotionUrl;
    console.log('Generated URL:', url);
  
    const path = item.wxPath;
    console.log('wx path:', path);
  
    // 先复制 URL 到剪贴板，无论跳转成功与否
    wx.setClipboardData({
      data: url,
      success() {
        console.log('链接已复制到剪贴板');
      },
    });
  
    // 跳转至指定页面
    wx.navigateToMiniProgram({
      appId: 'wx32540bd863b27570',
      path: path,
      extraData: {},
      envVersion: 'release',
      success(res) {
        console.log('跳转成功');
        // 共享完成后，设置 hasUnsharedData 为 false
        this.setData({
          hasUnsharedData: false,
        });
      },
      fail(err) {
        // 跳转失败，提示用户可以通过浏览器打开
        console.error('跳转失败', err);
  
        // 提示用户跳转失败并可以通过浏览器打开
        wx.showModal({
          title: '提示',
          content: '无法跳转到小程序，已复制链接。你可以粘贴到浏览器中打开。',
          showCancel: false, // 不显示取消按钮
          confirmText: '知道了',
          success(res) {
            if (res.confirm) {
              console.log('用户知道了');
            }
          },
        });
      },
    });
  },

  // 确保用户信息已加载
  async ensureUserInfo() {
    if (!this.data.userInfo) {
      await this.initializeUserInfo();
    }
    return this.data.userInfo;
  },

  // 调用云函数获取数据
  async fetchDataFromCloudFunction(url) {
    try {
      const res = await wx.cloud.callFunction({
        name: 'fetchData',
        data: { origin_url: url, openid: this.data.userInfo.openid },
      });
      if (res.result.status === 'success') {
        await this.processFetchResult(res.result);
      } else {
        this.addImageResult('', '解析失败可重试或联系客服');
      }
    } catch (error) {
      console.error('调用云函数 fetchData 失败:', error);
    }
  },

  // 处理 fetchData 云函数的结果
  async processFetchResult(result) {
    console.log('开始处理 fetch 结果:', result); // 输出完整的 result 数据
    let data = result.data;
    console.log('提取的数据:', data); // 输出提取的 data
  
    const goodsName = data.goodsName || '商品名称未知';
    const hdThumbUrl = data.hdThumbUrl || '';
    console.log(`提取商品名称: ${goodsName}, 商品缩略图 URL: ${hdThumbUrl}`);
  
    if (hdThumbUrl) {
      try {
        console.log('开始下载商品图片:', hdThumbUrl); // 下载前日志
        const downloadRes = await this.downloadFileAsync(hdThumbUrl);
        console.log('图片下载成功:', downloadRes); // 下载成功后日志
  
        this.addImageResult(downloadRes.tempFilePath, goodsName, true, result);
        console.log('已添加图片结果，调用 analyseResult 进行分析'); // 调用分析方法前日志
        this.analyseResult(result);
      } catch (error) {
        console.error('图片下载失败:', error); // 下载失败日志
        this.addImageResult('', goodsName);
        console.log('图片下载失败后，已添加空图片结果'); // 添加空结果日志
      }
    } else {
      console.warn('商品缩略图 URL 为空，无法下载图片'); // URL 为空的警告日志
      this.addImageResult('', goodsName);
      console.log('已添加空图片结果'); // 添加空结果日志
    }
  
    // 更新用户分享次数
    try {
      console.log('开始更新用户分享次数'); // 更新用户分享次数前日志
      const userInfo = this.data.userInfo;
      console.log('当前用户信息:', userInfo); // 输出当前用户信息
  
      userInfo.shareCount += 1;
      userInfo.lastShareDate = this.getTodayDate();
      console.log('更新后的用户信息:', userInfo); // 输出更新后的用户信息
  
      await this.upsertUserInfo(userInfo);
      console.log('用户分享次数更新成功'); // 更新成功日志
    } catch (error) {
      console.error('更新用户分享次数失败:', error); // 更新失败日志
    }
  },

  // 下载文件封装为 Promise
  downloadFileAsync(url) {
    return new Promise((resolve, reject) => {
      wx.downloadFile({
        url,
        success: resolve,
        fail: reject,
      });
    });
  },

  // 更新用户积分
  async updateUserPoints(pointsChange) {
    if (pointsChange != 0){
      const userInfo = this.data.userInfo;
      userInfo.points += pointsChange;
      await this.upsertUserInfo(userInfo);
    } else {
      console.log('无积分修改');
    }

  },

  // 获取当天日期
  getTodayDate() {
    const now = new Date();
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now
      .getDate()
      .toString()
      .padStart(2, '0')}`;
  },

  // 提取链接参数
  extractParameter(url, parameterName) {
    const regExp = new RegExp(`[?&]${parameterName}=([^&#]*)`, 'i');
    const match = url.match(regExp);
    return match ? decodeURIComponent(match[1]) : null;
  },

  // 截断文本
  truncateText(text, maxLength) {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  },

  // 切换加载状态
  toggleLoading(loading) {
    this.setData({ loading });
  },

  // 封装 wx.showModal 为 Promise
  showModalAsync(options) {
    return new Promise((resolve) => {
      wx.showModal({
        ...options,
        success: resolve,
        fail: (err) => resolve({ confirm: false, cancel: true, error: err }),
      });
    });
  },

// 更新组商品信息的云函数封装
async updateGroupGoodsInfo({ goodsId, groupOrderId, isPinned, isAccelerated }) {
  try {
    const result = await wx.cloud.callFunction({
      name: 'groupGoodsInfoDB', // 云函数名称
      data: {
        goodsId,
        groupOrderId,
        isPinned,
        isAccelerated,
      },
    });

    // 检查云函数返回结果
    if (result.result.success) {
      console.log('云函数调用成功:', result.result);
      return { success: true, data: result.result.data };
    } else {
      console.error('云函数更新失败:', result.result.errorMessage);
      return { success: false, errorMessage: result.result.errorMessage };
    }
  } catch (error) {
    console.error('云函数调用出错:', error);
    return { success: false, errorMessage: '云函数调用失败' };
  }
},

  // 分享结果
  async shareResults() {
    const { isPinned, isAccelerated } = this.data;
  
    // 实现分享功能
    wx.showToast({
      title: '分享成功',
      icon: 'success',
    });
  
    let message = this.data.images[0].data.message; // 获取分享的消息内容
    let points = this.data.images[0].data.points || 0; // 获取基础积分
    let goodsId = this.data.images[0].data.data.goodsId;
    let groupOrderId = this.data.images[0].data.data.groupOrderId;
    let content = ""; // 用于显示弹窗内容
    let total_points = points; // 总所需积分
    console.log(this.data.images[0]);
    console.log(goodsId);
    console.log(groupOrderId);
  
    // 填充第一个内容：基础积分
    if (points > 0) {
      content += `${message} (${points}积分)\n`; // 添加换行
    }
  
    // 填充第二个内容：置顶团功能
    if (isPinned) {
      content += `开启置顶团功能 (${20}积分)\n`; // 添加换行
      total_points += 20;
    }
  
    // 填充第三个内容：加速拼功能
    if (isAccelerated) {
      content += `开启加速拼功能 (${50}积分)\n`; // 添加换行
      total_points += 50;
    }
  
    // 如果总积分大于 0，则追加最后一句提示
    if (total_points > 0) {
      content += `是否确定花费 ${total_points} 积分进行分享？`;
    }
  
    try {
      let proceed = true; // 是否继续后续逻辑的标志
      // 如果总积分大于 0，则显示弹窗
      if (total_points > 0) {
        const modalRes = await this.showModalAsync({
          title: '提示',
          content: content, // 弹窗内容
        });
        proceed = modalRes.confirm; // 用户点击确认才继续
      }
  
      if (proceed) {
        const userInfo = this.data.userInfo; // 假定用户信息在 this.data 中
  
        // 判断用户积分是否足够
        if (userInfo.points >= total_points) {
  
        
          // 调用云函数，更新数据
          const updateResult = await this.updateGroupGoodsInfo({
            goodsId: goodsId, // 替换为实际的 goodsId
            groupOrderId: groupOrderId, // 替换为实际的 groupOrderId
            isPinned: isPinned, // 替换为是否置顶的标志
            isAccelerated: isAccelerated, // 替换为是否加速的标志
          });
        
          if (updateResult.success) {
            // 扣除积分并更新用户信息
            await this.updateUserPoints(-total_points);
            // 共享完成后，设置 hasUnsharedData 为 false
            this.setData({
              hasUnsharedData: false,
            });
            wx.showToast({
              title: '更新成功',
              icon: 'success',
            });
          } else {
            wx.showToast({
              title: updateResult.errorMessage || '更新失败',
              icon: 'none',
            });
          }
        

        } else {
          // 处理积分不足情况
          const insufficientPointsContent = `当前积分不足！\n您当前有 ${userInfo.points} 积分。\n是否前往赚取更多积分？`;
  
          const pointsModalRes = await this.showModalAsync({
            title: '积分不足',
            content: insufficientPointsContent,
            confirmText: '去赚积分',
            cancelText: '取消',
          });
  
          if (pointsModalRes.confirm) {
            // 跳转到积分任务界面
            wx.navigateTo({
              url: '/pages/points-task/index', // 假定积分任务页面路径
            });
          }
        }
      }
    } catch (error) {
      console.error('处理付费调用失败:', error);
      wx.showToast({ title: '操作失败，请重试', icon: 'none' });
    }
  },

  // 处理付费调用逻辑
  async handlePaidCall(url, userInfo) {
    try {
      // 弹窗提示用户是否使用积分
      const modalRes = await this.showModalAsync({
        title: '提示',
        content: '您今日的免费调用次数已用完，是否使用10积分继续？',
      });

      if (modalRes.confirm) {
        // 判断用户积分是否足够
        if (userInfo.points >= 10) {
          // 扣除积分并更新用户信息
          await this.updateUserPoints(-10);
          await this.fetchDataFromCloudFunction(url);
        } else {
          // 积分不足提示
          wx.showToast({ title: '积分不足，请充值', icon: 'none' });
        }
      }
    } catch (error) {
      console.error('处理付费调用失败:', error);
      wx.showToast({ title: '操作失败，请重试', icon: 'none' });
    }
  },

  showPinHelp() {
    wx.showModal({
      title: '置顶功能说明',
      content: '置顶功能可以将当前分享置顶，增加曝光量，加快成团概率。',
      showCancel: false, // 仅显示确定按钮
      confirmText: '知道了'
    });
  },
  
  showAccelerateHelp() {
    wx.showModal({
      title: '加速拼功能说明',
      content: '加速拼功能可以提高拼团速度，快速达成拼团目标，成团率为98.3%。',
      showCancel: false,
      confirmText: '知道了'
    });
  },

  // 切换置顶状态
  togglePin(e) {
    this.setData({
      isPinned: e.detail.value
    });
  },

  // 切换加速拼状态
  toggleAccelerate(e) {
    this.setData({
      isAccelerated: e.detail.value
    });
  },

  // 页面隐藏时触发
  onHide() {
    if (this.data.hasUnsharedData) {
      wx.showModal({
        title: '提示',
        content: '您有未分享的数据，确定要离开吗？',
        success: (res) => {
          if (res.confirm) {
            // 用户点击确定，允许页面隐藏
            // this.setData({ hasUnsharedData: false });
          } else {
            // 用户点击取消，重新导航回当前页面
            wx.navigateTo({
              url: '/pages/share/share',
            });
          }
        },
      });
    }
  },
});