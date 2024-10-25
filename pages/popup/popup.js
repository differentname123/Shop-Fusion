// popup.js

Page({
  data: {
    showPopup: true,
    countdown: 10,
    popupAnimation: null,
  },

  onLoad() {
    this.startCountdown();
    this.animatePopup();
  },

  startCountdown() {
    let count = this.data.countdown;
    this.countdownInterval = setInterval(() => {
      count--;
      if (count <= 0) {
        clearInterval(this.countdownInterval);
        this.goToLottery();
      } else {
        this.setData({ countdown: count });
      }
    }, 1000);
  },

  animatePopup() {
    const animation = wx.createAnimation({
      duration: 500,
      timingFunction: 'ease-in-out',
    });
    animation.scale(1.1).step().scale(1).step();
    this.setData({ popupAnimation: animation.export() });
  },

  closePopup() {
    clearInterval(this.countdownInterval);
    this.setData({ showPopup: false });
  },

  goToLottery() {
    clearInterval(this.countdownInterval);
    wx.navigateTo({
      url: '/pages/lottery/lottery',
    });
  },
});
