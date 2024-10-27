// pages/lottery/lottery.js
const { prizes: initialPrizes } = require('config.js');

Page({
  data: {
    points: 50, // 用户积分
    energy: 0, // 幸运值能量，取值范围为0-100
    energyPercentage: 0, // 能量百分比，用于能量条显示
    prizes: JSON.parse(JSON.stringify(initialPrizes)), // 奖品信息
    spinCount: 0, // 转盘次数
    propCount: 0, // 消除奖品道具数量
  },
  onLoad() {
    // 获取用户积分，假设从后台接口获取
    this.getUserPoints();
  },
  getUserPoints() {
    // 模拟从后台获取用户积分，初始值为50
    // 实际场景应该调用wx.request或者异步接口获取积分
    this.setData({
      points: 50,
    });
  },
  consumePoints(e) {
    const { points } = e.detail;
    this.setData({
      points: this.data.points - points,
    });
  },
  addPoints(e) {
    const { points } = e.detail;
    this.setData({
      points: this.data.points + points,
    });
  },
  updateEnergy() {
    // 幸运值能量增加规则：
    // 每次抽奖都会增加能量，当前能量值越小，增加的能量越多，越接近满值，增加的能量越少
    // 能量值永远不会达到满值，只会无限接近满值
    // 可以使用一个指数衰减函数模拟

    let currentEnergy = this.data.energy;
    const increase = (100 - currentEnergy) / 10; // 能量值越小，增加越多

    currentEnergy += increase;

    if (currentEnergy > 100) {
      currentEnergy = 100;
    }

    this.setData({
      energy: currentEnergy,
      energyPercentage: currentEnergy.toFixed(2),
    });
  },
  updateSpinCount() {
    // 更新转盘次数
    let spinCount = this.data.spinCount + 1;
    let propCount = this.data.propCount;
    if (spinCount % 5 === 0) {
      // 每5次增加一个消除奖品道具
      propCount += 1;
      wx.showToast({
        title: '获得一个消除奖品道具',
        icon: 'none',
      });
    }
    this.setData({
      spinCount,
      propCount,
    });
  },
  updateProp(e) {
    const { propChange } = e.detail;
    this.setData({
      propCount: this.data.propCount + propChange,
    });
  },
  updatePrizes(e) {
    const { prizes } = e.detail;
    this.setData({
      prizes,
    });
  },
  onShowRules() {
    // 显示规则列表
    const rules = `1. 每次抽奖消耗10积分
2. 抽奖结果由后台返回
3. 每次抽奖会增加幸运值
4. 幸运值越高，中奖概率可能越大（示例规则）
5. 每抽取5次，获得一个消除奖品的道具`;
    wx.showModal({
      title: '抽奖规则',
      content: rules,
      showCancel: false,
    });
  },
  showEnergyInfo() {
    // 显示幸运值说明
    wx.showModal({
      title: '幸运值说明',
      content: '幸运值表示您当前的幸运程度，幸运值越高，获得大奖的概率越高。',
      showCancel: false,
    });
  },
});