// pages/webview/webview.js
Page({
  data: {
    url: ''
  },
  onLoad(options) {
    this.setData({
      url: decodeURIComponent(options.url)
    });
  }
});
