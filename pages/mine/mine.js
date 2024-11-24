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
        item: '分享小程序',
        isBouncing: false
      },
      {
        iconPath: '/images/icon_video.png',
        title: '观看视频',
        subtitle: '可获得1积分',
        item: '观看视频',
        isBouncing: false
      },
      {
        iconPath: '/images/icon_group.png',
        title: '多人拼团群',
        subtitle: '',
        item: '多人拼团群',
        isBouncing: false
      },
      {
        iconPath: '/images/choujiang.png',
        title: '幸运大抽奖',
        subtitle: '',
        item: '幸运大抽奖',
        isBouncing: true // 设置跳动效果和小红点
      },
      {
        iconPath: '/images/icon_customer_service.png',
        title: '联系客服',
        subtitle: '',
        item: '联系客服',
        isBouncing: false
      },
      {
        iconPath: '/images/icon_about_us.png',
        title: '关于我们',
        subtitle: '',
        item: '关于我们',
        isBouncing: false
      }
    ],
    isLoading: true
  },

  async onLoad() {
    // this.getGoodsInfo();
    await this.initNavigationBar();
    await this.getOpenIdAndUserInfo();
  },

  getGoodsInfo() {
    const db = wx.cloud.database()
    
    db.collection('goodsInfoTable')
      .get()
      .then(res => {
        console.log('Goods Info:', res.data)
      })
      .catch(err => {
        console.error('Error:', err)
      })
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
    switch (item) {
      case '分享小程序':
        wx.showShareMenu({
          withShareTicket: true
        });
        break;
      case '观看视频':
        wx.cloud.callFunction({
          name: 'getGroupGoods'
        }).then(res => {
          console.log(res);  // 这里 res 是函数的返回结果
          wx.showModal({
            title: '调用成功',
            content: JSON.stringify(res.result),  // 将返回结果转换为字符串显示
            showCancel: false, // 不显示取消按钮
            confirmText: '确定'
          });
        }).catch(error => {
          console.error("调用云函数失败：", error);
        });
        break;
      case '多人拼团群':
        wx.navigateToMiniProgram({
          appId: 'wx32540bd863b27570',
          path: 'package_a/welfare_coupon/welfare_coupon?goods_id=560298678865&pid=41675195_295492064&display_mod=101&goods_sign=E9H2IB4ppMVgMvVVwvfeHMbPGfAjED5K_JQmgAEnLVx&customParameters=%7B%22source%22%3A+%22custom_value%22%7D&cpsSign=CC_241124_41675195_295492064_8aa1c4a3acdd37d78faa0cb687051d35&_x_ddjb_act=%7B%22st%22%3A%221%22%7D&duoduo_type=2&_oc_cps_sign=CC_241124_41675195_295492064_8aa1c4a3acdd37d78faa0cb687051d35&_oc_pid=41675195_295492064&_oc_mkt_domain=222&_oc_mkt_tr_sc=ddjb_goods_coupon&_oc_mkt_tr_token=cjwlgjquuniaslyfdz55hostuk4oqtz6ye7jw25wrmvivllwootaggctwqodzc47qtcnnpbtrcypc',  // 替换为具体商品的路径和参数
          extraData: {},
          envVersion: 'release',
          success(res) {
            console.log("跳转成功");
          }
        });        
        break;
      case '幸运大抽奖':
        this.removeRedDotAndBounce('幸运大抽奖'); // 移除小红点和跳动效果
        wx.navigateTo({
          url: '/pages/lottery/lottery',
        });
        break;
      case '联系客服':
        wx.openCustomerServiceChat({
          extInfo: { url: 'https://your.customer.service.url' },
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
  },

  // 移除小红点和跳动效果
  removeRedDotAndBounce(title) {
    const updatedMenuItems = this.data.menuItems.map(item => {
      if (item.title === title) {
        item.isBouncing = false; // 关闭跳动效果和小红点
      }
      return item;
    });
    this.setData({
      menuItems: updatedMenuItems
    });
  }
});
