// pages/lottery/lottery.js
const { prizes: initialPrizes } = require('config.js');

Page({
  data: {
    points: 50,
    energy: 0,
    energyPercentage: 0,
    energyDisplay: '0.00', // 用于显示格式化的幸运值
    energyIncrease: 0, // 显示本次增加的能量
    showEnergyIncrease: false, // 控制+X的显示
    prizes: JSON.parse(JSON.stringify(initialPrizes)),
    spinCount: 0,
    propCount: 0,
    navBarHeight: 0, // 新增：导航栏高度
  },
  onLoad() {
    this.getUserPoints();
    // 获取导航栏高度
    const systemInfo = wx.getSystemInfoSync();
    const statusBarHeight = systemInfo.statusBarHeight;
    const navHeight = 44;
    const navBarHeight = statusBarHeight + navHeight;
    this.setData({
      navBarHeight,
    });
  },
  getUserPoints() {
    this.setData({
      points: 50,
    });
  },
  consumePoints({ detail: { points } }) {
    this.updatePoints(-points);
  },
  addPoints({ detail: { points } }) {
    this.updatePoints(points);
  },
  updatePoints(change) {
    this.setData({
      points: this.data.points + change,
    });
  },
  updateEnergy() {
    const currentEnergy = this.data.energy;
    const increase = (100 - currentEnergy) / 10;
    const newEnergy = Math.min(100, currentEnergy + increase);

    this.setData({
      energyIncrease: increase.toFixed(2),
      showEnergyIncrease: false,
    });

    this.triggerEnergyIncreaseAnimation(newEnergy);
  },
  triggerEnergyIncreaseAnimation(targetEnergy) {
    this.setData({ showEnergyIncrease: true });
    setTimeout(() => {
      this.setData({ showEnergyIncrease: false });
    }, 3000);

    this.animateEnergyIncrease(targetEnergy);
  },
  animateEnergyIncrease(targetEnergy) {
    const step = (targetEnergy - this.data.energy) / 30;
    const increaseInterval = setInterval(() => {
      let newEnergy = this.data.energy + step;
      if (newEnergy >= targetEnergy) {
        newEnergy = targetEnergy;
        clearInterval(increaseInterval);
      }
      this.setData({
        energy: newEnergy,
        energyPercentage: newEnergy.toFixed(2),
        energyDisplay: newEnergy.toFixed(2),
      });
    }, 40);
  },
  updateSpinCount() {
    const newSpinCount = this.data.spinCount + 1;
    const newPropCount = newSpinCount % 5 === 0 ? this.data.propCount + 1 : this.data.propCount;

    if (newPropCount > this.data.propCount) {
      wx.showToast({
        title: '获得一个消除奖品道具',
        icon: 'none',
      });
    }

    this.setData({
      spinCount: newSpinCount,
      propCount: newPropCount,
    });
  },
  updateProp({ detail: { propChange } }) {
    this.setData({
      propCount: this.data.propCount + propChange,
    });
  },
  updatePrizes({ detail: { prizes } }) {
    this.setData({ prizes });
  },
  onShowRules() {
    const rules = `
1. 每次抽奖消耗10积分
2. 抽奖结果由后台返回
3. 每次抽奖会增加幸运值
4. 幸运值越高，中奖概率可能越大
5. 每抽取5次，获得一个消除奖品道具`;
    wx.showModal({
      title: '抽奖规则',
      content: rules,
      showCancel: false,
    });
  },
  showEnergyInfo() {
    wx.showModal({
      title: '幸运值说明',
      content: '幸运值表示您当前的幸运程度，幸运值越高，获得大奖的概率越高。',
      showCancel: false,
    });
  },
});