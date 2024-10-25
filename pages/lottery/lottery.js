Page({
  data: {
    blocks: [{ padding: '10px', background: '#fff' }],
    prizes: [
      {
        background: '#f9e3bb',
        fonts: [{ text: '10积分', top: '18%' }],
        icon: '/assets/icon1.png',
        iconAnimate: true
      },
      {
        background: '#f8d384',
        fonts: [{ text: '20积分', top: '18%' }],
        icon: '/assets/icon2.png'
      },
      {
        background: '#f9e3bb',
        fonts: [{ text: '30积分', top: '18%' }],
        icon: '/assets/icon3.png'
      },
      {
        background: '#f8d384',
        fonts: [{ text: '40积分', top: '18%' }],
        icon: '/assets/icon4.png',
        iconAnimate: true
      },
      {
        background: '#f9e3bb',
        fonts: [{ text: '50积分', top: '18%' }],
        icon: '/assets/icon5.png'
      },
      {
        background: '#f8d384',
        fonts: [{ text: '100积分', top: '18%' }],
        icon: '/assets/icon6.png'
      },
    ],
    buttons: [
      {
        radius: '50px',
        background: '#ffdd57',
        fonts: [{ text: '开始', fontColor: '#d64737', top: '-8%' }],
        pointer: true
      }
    ],
    defaultStyle: { fontColor: '#d64737', fontSize: '14px' },
    selectedPrizeIndex: null,
    speed: 0,
    startAngle: 0,
    touchStartY: 0,
    isSpinning: false
  },

  onLoad() {
    // 初始化设置
  },

  onClick() {
    // 模拟后端返回中奖索引
    this.setData({
      selectedPrizeIndex: Math.floor(Math.random() * this.data.prizes.length),
      isSpinning: true
    });
    this.selectComponent('#myLucky').play();
  },

  onStart() {
    console.log('开始抽奖');
  },

  onEnd(event) {
    const { index } = event.detail;
    this.setData({ isSpinning: false });
    wx.showToast({
      title: `恭喜获得：${this.data.prizes[index].fonts[0].text}`,
      icon: 'none'
    });
  },

  onTouchStart(event) {
    if (!this.data.isSpinning) {
      this.setData({ touchStartY: event.touches[0].pageY });
    }
  },

  onTouchMove(event) {
    if (!this.data.isSpinning) {
      const moveY = event.touches[0].pageY;
      const speed = Math.min(Math.abs(moveY - this.data.touchStartY) / 5, 30);
      this.setData({ speed });
    }
  },

  onTouchEnd(event) {
    if (!this.data.isSpinning) {
      this.setData({
        isSpinning: true,
        selectedPrizeIndex: Math.floor(Math.random() * this.data.prizes.length),
        speed: this.data.speed
      });
      this.selectComponent('#myLucky').play();
    }
  }
});
