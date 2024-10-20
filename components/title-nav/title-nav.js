Component({
  properties: {
    title: {
      type: String,
      value: ''
    }
  },
  data: {
    statusBarHeight: 20,
    navHeight: 44,
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
        navHeight,
        navBarHeight
      });
    }    
  },
  methods: {}
});