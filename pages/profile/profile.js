// profile.js
Page({
  data: {
    userInfo: {
      nickName: '',
      avatarUrl: '',
      openid: '',
      points: 0
    },
    statusBarHeight: 0,
    navBarHeight: 44,
    isLoading: false,
    originalUserInfo: {}
  },

  onLoad() {
    const systemInfo = wx.getSystemInfoSync();
    this.setData({
      statusBarHeight: systemInfo.statusBarHeight
    });

    const userInfo = wx.getStorageSync('userInfo') || {};
    this.setData({
      userInfo: userInfo,
      originalUserInfo: JSON.parse(JSON.stringify(userInfo))
    });

    // 头像动画
    const animation = wx.createAnimation({
      duration: 1000,
      timingFunction: 'ease-in-out'
    });
    animation.scale(1.2).step().scale(1).step();
    this.setData({
      avatarAnimation: animation.export()
    });
  },

  // 昵称修改事件
  onNicknameChange(e) {
    const nickName = e.detail.value;
    this.setData({
      'userInfo.nickName': nickName
    });
  },

  // 选择头像并上传
  chooseAvatar() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: async (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath;

        this.setData({ isLoading: true });

        const cloudPath = 'userAvatars/' + this.data.userInfo.openid + Date.now() + tempFilePath.match(/\.[^.]+?$/)[0];
        try {
          const uploadResult = await wx.cloud.uploadFile({
            cloudPath: cloudPath,
            filePath: tempFilePath,
          });
          this.setData({
            'userInfo.avatarUrl': uploadResult.fileID,
            isLoading: false
          });
        } catch (err) {
          console.error('头像上传失败：', err);
          wx.showToast({
            title: '头像上传失败',
            icon: 'none'
          });
          this.setData({ isLoading: false });
        }
      }
    });
  },

  // 保存修改
  async saveProfile() {
    const userInfo = this.data.userInfo;
    const originalUserInfo = this.data.originalUserInfo;

    if (JSON.stringify(userInfo) === JSON.stringify(originalUserInfo)) {
      wx.navigateBack();
      return;
    }

    this.setData({ isLoading: true });

    wx.setStorageSync('userInfo', userInfo);

    try {
      await wx.cloud.callFunction({
        name: 'addUser',
        data: userInfo
      });
      wx.showToast({
        title: '保存成功',
        icon: 'success',
        duration: 2000,
        success: function () {
          wx.navigateBack();
        }
      });
      this.setData({ isLoading: false });
    } catch (err) {
      console.error('[云函数] [addUser] 调用失败', err);
      wx.showToast({
        title: '保存失败',
        icon: 'none'
      });
      this.setData({ isLoading: false });
    }
  }
});
