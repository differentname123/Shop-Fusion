// mine.js
const app = getApp();

Page({
  data: {
    userInfo: {
      nickName: '',
      avatarUrl: '',
      openid: '',
      points: 0
    },
    statusBarHeight: app.globalData.statusBarHeight || 20,
    navBarHeight: app.globalData.navBarHeight || 44,
    menuItems: [
      {
        iconPath: '/images/icon_share.png',
        title: '分享小程序',
        subtitle: '可获得2积分',
        item: '分享小程序'
      },
      {
        iconPath: '/images/icon_video.png',
        title: '观看视频',
        subtitle: '可获得1积分',
        item: '观看视频'
      },
      {
        iconPath: '/images/icon_group.png',
        title: '多人拼团群',
        subtitle: '',
        item: '多人拼团群'
      },
      {
        iconPath: '/images/icon_customer_service.png',
        title: '联系客服',
        subtitle: '',
        item: '联系客服'
      },
      {
        iconPath: '/images/icon_about_us.png',
        title: '关于我们',
        subtitle: '',
        item: '关于我们'
      }
    ],
    isLoading: true
  },

  async onLoad() {
    await this.initNavigationBar();
    await this.getOpenIdAndUserInfo();
  },

  onShow() {
    this.getUserInfo();
  },

  async initNavigationBar() {
    const systemInfo = wx.getSystemInfoSync();
    this.setData({
      statusBarHeight: systemInfo.statusBarHeight
    });
  },

  async getOpenIdAndUserInfo() {
    try {
      let openid = wx.getStorageSync('openid');
      if (!openid) {
        const res = await wx.cloud.callFunction({ name: 'getOpenId' });
        openid = res.result.openid;
        wx.setStorageSync('openid', openid);
      }
      this.setData({
        'userInfo.openid': openid
      });
      await this.getUserInfo();
    } catch (err) {
      console.error('获取OpenID失败', err);
    }
  },

  async getUserInfo() {
    try {
      let userInfo = wx.getStorageSync('userInfo');
      if (userInfo && userInfo.nickName) {
        this.setData({
          userInfo: userInfo,
          isLoading: false
        });
      } else {
        const res = await wx.cloud.callFunction({
          name: 'getUser',
          data: {
            openid: this.data.userInfo.openid
          }
        });

        if (res.result && res.result.data) {
          const userData = res.result.data;
          wx.setStorageSync('userInfo', userData);
          this.setData({
            userInfo: userData,
            isLoading: false
          });
        } else {
          const defaultUserInfo = this.initDefaultUserInfo();
          await this.addUserToDatabase(defaultUserInfo);
          this.setData({
            userInfo: defaultUserInfo,
            isLoading: false
          });
        }
      }
    } catch (err) {
      console.error('获取用户信息失败', err);
      const defaultUserInfo = this.initDefaultUserInfo();
      await this.addUserToDatabase(defaultUserInfo);
      this.setData({
        userInfo: defaultUserInfo,
        isLoading: false
      });
    }
  },

  initDefaultUserInfo() {
    const defaultUserInfo = {
      nickName: '用户_' + this.data.userInfo.openid.substring(0, 6),
      avatarUrl: '/images/default.png',
      openid: this.data.userInfo.openid,
      points: 0
    };
    wx.setStorageSync('userInfo', defaultUserInfo);
    return defaultUserInfo;
  },

  async addUserToDatabase(userInfo) {
    try {
      await wx.cloud.callFunction({
        name: 'addUser',
        data: userInfo
      });
      console.log('用户信息已保存到数据库');
    } catch (err) {
      console.error('保存用户信息失败', err);
    }
  },

  // 点击头像跳转到个人资料页面
  goToProfile() {
    wx.navigateTo({
      url: '/pages/profile/profile',
    });
  },

  // 菜单项点击事件
  onMenuItemTap(e) {
    const item = e.currentTarget.dataset.item;
    switch(item){
      case '分享小程序':
        wx.showShareMenu({
          withShareTicket: true
        });
        break;
      case '观看视频':
        wx.navigateTo({
          url: '/pages/video/video',
        });
        break;
      case '多人拼团群':
        wx.navigateTo({
          url: '/pages/lottery/lottery',
        });
        break;
      case '联系客服':
        wx.openCustomerServiceChat({
          extInfo: {url: 'https://your.customer.service.url'},
          corpId: 'your_corp_id',
          success(res) { }
        });
        break;
      case '关于我们':
        wx.showModal({
          title: '关于我们',
          content: '这是一个高端的小程序，提供优质的服务。',
          showCancel: false,
          confirmText: '知道了',
        });
        break;
      default:
        wx.showToast({
          title: '功能待开发',
          icon: 'none'
        });
        break;
    }
  }
});
