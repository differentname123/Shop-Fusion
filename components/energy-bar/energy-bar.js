// components/energy-bar/energy-bar.js
Component({
  properties: {
    energyPercentage: {
      type: Number,
      value: 0,
      observer(newVal) {
        this.setData({
          energyFillStyle: `width: ${newVal}%;`,
        });
      },
    },
    energyValue: {
      type: Number,
      value: 0,
    },
  },
  data: {
    energyFillStyle: '',
  },
  methods: {
    showEnergyInfo() {
      wx.showModal({
        title: '幸运值说明',
        content: '幸运值表示您当前的幸运程度，幸运值越高，获得大奖的概率越高。',
        showCancel: false,
      });
    },
  },
});
