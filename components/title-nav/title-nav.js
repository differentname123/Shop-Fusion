// components/title-nav/title-nav.js
Component({
  properties: {
    title: {
      type: String,
      value: ''
    }
  },
  data: {
    statusBarHeight: 20,
    navBarHeight: 64
  },
  lifetimes: {
    attached() {
      const systemInfo = wx.getSystemInfoSync();
      const statusBarHeight = systemInfo.statusBarHeight;
      const navHeight = 44;
      const navBarHeight = statusBarHeight + navHeight;
      this.setData({
        statusBarHeight,
        navBarHeight
      });
    }
  },
  methods: {}
});
