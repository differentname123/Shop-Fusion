// pages/battle/battle.js
const app = getApp();

Page({
  data: {
    navBarHeight: 44,
    statusBarHeight: 20,
    userScore: 0,
    opponentScore: 0,
    userEnergyStyle: '',
    opponentEnergyStyle: '',
    showResultPopup: false,
    battleResult: '',
    resultMessage: '',
    battleDuration: 60, // 对战持续时间（秒）
    battleInterval: null,
    opponentInterval: null,
  },

  onLoad() {
    const systemInfo = wx.getSystemInfoSync();
    this.setData({
      statusBarHeight: systemInfo.statusBarHeight,
      navBarHeight: 44
    });
    this.startBattle();
  },

  // 开始对战
  startBattle() {
    // 初始化数据
    this.setData({
      userScore: 0,
      opponentScore: 0,
      userEnergyStyle: 'width: 0%;',
      opponentEnergyStyle: 'width: 0%;',
      showResultPopup: false
    });

    // 对战时间倒计时
    this.battleTimeout = setTimeout(() => {
      this.endBattle();
    }, this.data.battleDuration * 1000);

    // 虚拟对战方每5秒增加10积分
    this.opponentInterval = setInterval(() => {
      this.updateOpponentScore(10);
    }, 5000);
  },

  // 用户消耗积分
  consumePoints() {
    // 假设用户每次点击消耗10积分
    this.updateUserScore(10);
  },

  // 更新用户积分和能量条
  updateUserScore(points) {
    let newScore = this.data.userScore + points;
    let totalScore = newScore + this.data.opponentScore;
    let userPercentage = totalScore > 0 ? (newScore / totalScore) * 100 : 0;

    this.setData({
      userScore: newScore,
      userEnergyStyle: `width: ${userPercentage}%;`
    });
  },

  // 更新虚拟对手积分和能量条
  updateOpponentScore(points) {
    let newScore = this.data.opponentScore + points;
    let totalScore = this.data.userScore + newScore;
    let opponentPercentage = totalScore > 0 ? (newScore / totalScore) * 100 : 0;

    this.setData({
      opponentScore: newScore,
      opponentEnergyStyle: `width: ${opponentPercentage}%;`
    });
  },

  // 结束对战
  endBattle() {
    clearInterval(this.opponentInterval);
    clearTimeout(this.battleTimeout);

    let result = '';
    let message = '';

    if (this.data.userScore > this.data.opponentScore) {
      result = '恭喜你获得胜利！';
      message = '你战胜了对手，获得了100积分奖励！';
      // 给用户增加100积分
      // TODO: 增加用户积分的逻辑
    } else if (this.data.userScore < this.data.opponentScore) {
      result = '很遗憾，你输了。';
      message = '再接再厉，争取下次战胜对手！';
    } else {
      result = '平局！';
      message = '双方打成平手，继续努力！';
    }

    this.setData({
      showResultPopup: true,
      battleResult: result,
      resultMessage: message
    });

    // 将对战结果保存到抽奖记录
    this.saveBattleRecord();
  },

  // 关闭对战结果弹窗
  closeResultPopup() {
    this.setData({
      showResultPopup: false
    });
    // 返回上一页或继续新的对战
    wx.navigateBack();
  },

  // 保存对战记录
  saveBattleRecord() {
    // 保存到本地或上传到服务器
    let records = wx.getStorageSync('drawRecords') || [];
    records.push({
      time: this.getCurrentTime(),
      method: '积分消耗对战',
      result: this.data.battleResult,
      userScore: this.data.userScore,
      opponentScore: this.data.opponentScore
    });
    wx.setStorageSync('drawRecords', records);
  },

  // 获取当前时间
  getCurrentTime() {
    let date = new Date();
    let Y = date.getFullYear();
    let M = (date.getMonth() + 1).toString().padStart(2, '0');
    let D = date.getDate().toString().padStart(2, '0');
    let h = date.getHours().toString().padStart(2, '0');
    let m = date.getMinutes().toString().padStart(2, '0');
    let s = date.getSeconds().toString().padStart(2, '0');
    return `${Y}-${M}-${D} ${h}:${m}:${s}`;
  },

  onUnload() {
    clearInterval(this.opponentInterval);
    clearTimeout(this.battleTimeout);
  }
});
