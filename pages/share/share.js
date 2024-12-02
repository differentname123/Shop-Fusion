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
        name: 'userDb',
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
        name: 'userDb',
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
      let error_info = '未识别二维码，可尝试裁剪图片后重试'
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
      }
    } catch (error) {
      console.error('调用云函数 fetchData 失败:', error);
    }
  },

  // 处理 fetchData 云函数的结果
  async processFetchResult(result) {
    let data =result.data; 
    const goodsName = data.goodsName || '商品名称未知';
    const hdThumbUrl = data.hdThumbUrl || '';

    if (hdThumbUrl) {
      try {
        const downloadRes = await this.downloadFileAsync(hdThumbUrl);
        this.addImageResult(downloadRes.tempFilePath, goodsName, true, result);
      } catch (error) {
        console.error('图片下载失败:', error);
        this.addImageResult('', goodsName);
      }
    } else {
      this.addImageResult('', goodsName);
    }

    // 更新用户分享次数
    const userInfo = this.data.userInfo;
    userInfo.shareCount += 1;
    userInfo.lastShareDate = this.getTodayDate();
    await this.upsertUserInfo(userInfo);
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
    const userInfo = this.data.userInfo;
    userInfo.points += pointsChange;
    await this.upsertUserInfo(userInfo);
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

  // 分享结果
  shareResults() {
    const { isPinned, isAccelerated } = this.data;
    let points = 0;
    // 实现分享功能，这里简单演示
    wx.showToast({
      title: '分享成功',
      icon: 'success',
    });
    console.log(this.data.images[0]);
    console.log('分享参数:', {
      isPinned,
      isAccelerated
    });
    // 共享完成后，设置 hasUnsharedData 为 false
    this.setData({
      hasUnsharedData: false,
    });
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
      content: '置顶功能可以将当前分享置顶，便于快速查看，加快成团概率。',
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