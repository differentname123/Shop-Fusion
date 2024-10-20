Component({
  properties: {
    searchKeyword: {
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
  methods: {
    onSearch(e) {
      this.triggerEvent('search', e.detail);
    },
    onCancel() {
      this.triggerEvent('cancel');
    },
    onInput(e) {
      this.triggerEvent('input', e.detail);
    }
  }
});
