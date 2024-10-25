// record.js

Page({
  data: {
    records: [],
  },

  onLoad() {
    this.getRecords();
  },

  getRecords() {
    // 从本地存储或服务器获取抽奖记录
    const records = wx.getStorageSync('drawRecords') || [];
    this.setData({ records });
  },
});
