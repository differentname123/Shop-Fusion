// components/wheel/wheel.js
Component({
  properties: {
    points: {
      type: Number,
      value: 0,
    },
    prizes: {
      type: Array,
      value: [],
      observer(newVal, oldVal) {
        if (newVal !== oldVal) {
          // 奖品信息发生变化
          this.prizes = newVal;
          this.totalRange = this.prizes.reduce((sum, prize) => sum + prize.range, 0);
          if (this.canvas) {
            this.loadPrizeImages().then(() => {
              this.drawWheel(this.spinningAngle);
            });
          } else {
            this.needLoadPrizes = true;
          }
        }
      },
    },
    propCount: {
      type: Number,
      value: 0,
    },
  },
  data: {
    canvasWidth: 500,
    canvasHeight: 500,
    isSpinning: false,
    spinningAngle: 0,
    selectedPrizeIndex: null,
    spinType: 'draw',
    needLoadPrizes: false, // 新增
  },
  lifetimes: {
    attached() {
      // Initialize properties
      this.prizes = this.properties.prizes;
      this.totalRange = this.prizes.reduce((sum, prize) => sum + prize.range, 0);
      this.spinningAngle = 0;
      this.selectedPrizeIndex = null;
      this.prizeAnimationFrameId = null;
      this.idleAnimationFrameId = null;
      this.rotationFrameId = null;
      this.rotateSound = null;
      this.endSound = null;
      this.pointerImage = null;

      // 初始化音频
      this.rotateSound = wx.createInnerAudioContext();
      this.rotateSound.src = '/audio/rotate.mp3';
      this.endSound = wx.createInnerAudioContext();
      this.endSound.src = '/audio/end.mp3';

      // 获取画布上下文
      const query = this.createSelectorQuery();
      query
        .select('#wheelCanvas')
        .node()
        .exec((res) => {
          const canvas = res[0].node;
          const ctx = canvas.getContext('2d');

          this.canvas = canvas;
          this.ctx = ctx;

          const dpr = wx.getSystemInfoSync().pixelRatio;
          canvas.width = this.data.canvasWidth * dpr;
          canvas.height = this.data.canvasHeight * dpr;
          ctx.scale(dpr, dpr);

          // 加载资源并开始动画
          Promise.all([this.loadPrizeImages(), this.loadPointerImage()])
            .then(() => {
              this.drawWheel(0);
              this.startIdleAnimation();

              // 如果在 canvas 初始化之前有奖品更新，加载奖品图片
              if (this.needLoadPrizes) {
                this.loadPrizeImages().then(() => {
                  this.drawWheel(this.spinningAngle);
                });
                this.needLoadPrizes = false;
              }
            });
        });
    },
    detached() {
      // 清理动画帧和音频
      if (this.rotationFrameId) {
        this.canvas.cancelAnimationFrame(this.rotationFrameId);
      }
      if (this.prizeAnimationFrameId) {
        this.canvas.cancelAnimationFrame(this.prizeAnimationFrameId);
      }
      if (this.idleAnimationFrameId) {
        this.canvas.cancelAnimationFrame(this.idleAnimationFrameId);
      }
      if (this.rotateSound) {
        this.rotateSound.stop();
        this.rotateSound.destroy();
      }
      if (this.endSound) {
        this.endSound.stop();
        this.endSound.destroy();
      }
    },
  },
  methods: {
    loadPrizeImages() {
      // 加载奖品图片
      const loadPromises = this.prizes.map((prize) => {
        return new Promise((resolve, reject) => {
          const image = this.canvas.createImage();
          image.src = prize.icon;
          image.onload = () => {
            prize.image = image;
            resolve();
          };
          image.onerror = (err) => {
            console.error('加载图片失败：', err);
            reject(err);
          };
        });
      });
      return Promise.all(loadPromises);
    },
    loadPointerImage() {
      // 加载指针图片
      return new Promise((resolve, reject) => {
        const image = this.canvas.createImage();
        image.src = '/assets/pointer_rotate1.png';
        image.onload = () => {
          this.pointerImage = image;
          resolve();
        };
        image.onerror = (err) => {
          console.error('加载指针图片失败：', err);
          reject(err);
        };  // 修正了这里的位置
      });
    },
    getColor(index) {
      const colorPairs = [
        { start: '#FFD700', end: '#FFA500' },
        { start: '#ADFF2F', end: '#32CD32' },
        { start: '#87CEFA', end: '#1E90FF' },
        { start: '#FFB6C1', end: '#FF69B4' },
        { start: '#FF4500', end: '#FF6347' },
        { start: '#BA55D3', end: '#9370DB' },
      ];
      return colorPairs[index % colorPairs.length];
    },
    drawWheel(angle) {
      const ctx = this.ctx;
      const { canvasWidth, canvasHeight } = this.data;
      const { prizes, totalRange, selectedPrizeIndex } = this;
      const centerX = canvasWidth / 2;
      const centerY = canvasHeight / 2;
      const radius = Math.min(centerX, centerY) - 10;

      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      if (prizes.length === 0) {
        // 没有奖品时显示提示信息
        ctx.fillStyle = '#000';
        ctx.font = 'bold 24px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('暂无奖品', centerX, centerY);
        return;
      }

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(((angle - 90) * Math.PI) / 180);
      ctx.translate(-centerX, -centerY);

      let startAngle = 0;
      prizes.forEach((prize, index) => {
        const anglePerPrize = (prize.range / totalRange) * 2 * Math.PI;

        // 创建渐变色
        const colors = this.getColor(index);
        const gradient = ctx.createLinearGradient(centerX, centerY - radius, centerX, centerY + radius);
        gradient.addColorStop(0, colors.start);
        gradient.addColorStop(1, colors.end);

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + anglePerPrize);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.shadowColor = 'rgba(0,0,0,0.2)';
        ctx.shadowBlur = 5;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.fill();
        ctx.shadowColor = 'transparent'; // 重置阴影

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(startAngle + anglePerPrize / 2);

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 18px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(prize.name, radius - 60, 0);

        const imgSize = 40;
        let scale = 1;

        const currentTime = Date.now();

        if (this.prizeAnimationFrameId && index === selectedPrizeIndex) {
          scale = 1 + 0.05 * Math.sin(((currentTime % 500) / 500) * Math.PI * 2);
        } else if (!this.data.isSpinning && prize.idleAnimation) {
          scale = 1 + 0.1 * Math.sin(((currentTime % 1000) / 1000) * Math.PI * 2);
        }
        ctx.scale(scale, scale);

        if (prize.image) {
          ctx.drawImage(prize.image, radius - 180, -imgSize / 2, imgSize, imgSize);
        }

        ctx.restore();

        startAngle += anglePerPrize;
      });

      ctx.restore();

      // 绘制外圈
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius + 10, 0, 2 * Math.PI);
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.restore();

      // 绘制指针并添加闪烁效果
      ctx.save();

      if (!this.data.isSpinning) {
        // 闲置状态下指针闪烁
        const blinkOpacity = 0.7 + 0.3 * Math.abs(Math.sin(Date.now() / 500));
        ctx.globalAlpha = blinkOpacity;
      }

      if (this.pointerImage) {
        const pointerSize = 60;
        ctx.drawImage(
          this.pointerImage,
          centerX - pointerSize / 2,
          centerY - pointerSize / 2,
          pointerSize,
          pointerSize
        );
      } else {
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - 20);
        ctx.lineTo(centerX - 10, centerY + 10);
        ctx.lineTo(centerX + 10, centerY + 10);
        ctx.closePath();
        ctx.fillStyle = '#FF0000';
        ctx.fill();
      }

      ctx.restore();
    },
    startIdleAnimation() {
      const animate = () => {
        if (!this.data.isSpinning) {
          this.drawWheel(this.spinningAngle);
        }
        this.idleAnimationFrameId = this.canvas.requestAnimationFrame(animate);
      };
      this.idleAnimationFrameId = this.canvas.requestAnimationFrame(animate);
    },
    // 点击“抽奖”按钮
    startSpin() {
      if (this.data.isSpinning) return;

      if (this.prizes.length === 0) {
        wx.showToast({
          title: '没有奖品可抽',
          icon: 'none',
        });
        return;
      }

      // 判断用户积分是否足够
      if (this.properties.points < 10) {
        wx.showToast({
          title: '积分不足，无法抽奖',
          icon: 'none',
        });
        return;
      }

      // 触发事件通知父组件扣除积分
      this.triggerEvent('consumePoints', { points: 10 });

      this.setData({
        isSpinning: true,
        spinType: 'draw',
      });

      if (this.idleAnimationFrameId) {
        this.canvas.cancelAnimationFrame(this.idleAnimationFrameId);
        this.idleAnimationFrameId = null;
      }

      this.rotateSound.play();

      const stopAngle = this.getStopAngle();
      if (stopAngle === undefined) {
        return;
      }
      this.startRotation(stopAngle);
    },
    // 点击“消除奖品”按钮
    eliminatePrize() {
      if (this.data.isSpinning) return;

      if (this.prizes.length === 0) {
        wx.showToast({
          title: '没有奖品可以消除',
          icon: 'none',
        });
        return;
      }

      // 判断是否有消除奖品的道具
      if (this.properties.propCount <= 0) {
        wx.showToast({
          title: '没有消除奖品的道具',
          icon: 'none',
        });
        return;
      }

      this.setData({
        isSpinning: true,
        spinType: 'eliminate',
      });

      if (this.idleAnimationFrameId) {
        this.canvas.cancelAnimationFrame(this.idleAnimationFrameId);
        this.idleAnimationFrameId = null;
      }

      this.rotateSound.play();

      const stopAngle = this.getStopAngle();
      if (stopAngle === undefined) {
        return;
      }
      this.startRotation(stopAngle);
    },
    getStopAngle() {
      const { prizes, totalRange } = this;

      if (prizes.length === 0 || totalRange === 0) {
        wx.showToast({
          title: '奖品已全部消除，无法操作',
          icon: 'none',
        });
        this.setData({
          isSpinning: false,
        });
        return;
      }

      const randomNum = Math.floor(Math.random() * totalRange) + 1;
      let accumulatedRange = 0;
      let selectedPrizeIndex = 0;
      for (let i = 0; i < prizes.length; i++) {
        accumulatedRange += prizes[i].range;
        if (randomNum <= accumulatedRange) {
          selectedPrizeIndex = i;
          break;
        }
      }

      this.selectedPrizeIndex = selectedPrizeIndex;

      let startAngle = 0;
      for (let i = 0; i < selectedPrizeIndex; i++) {
        startAngle += (prizes[i].range / totalRange) * 360;
      }
      const prizeAngle = (prizes[selectedPrizeIndex].range / totalRange) * 360;
      const prizeCenterAngle = 360 - startAngle - prizeAngle / 2;
      const stopAngle = 360 * 5 + prizeCenterAngle;

      return stopAngle;
    },
    startRotation(stopAngle) {
      const duration = 5000; // 动画持续时间500毫秒
      const startTime = Date.now();
      const initialAngle = this.spinningAngle;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = elapsed / duration;

        if (progress >= 1) {
          // 动画结束
          this.spinningAngle = stopAngle % 360;
          this.setData({
            isSpinning: false,
          });
          this.drawWheel(this.spinningAngle);
          this.rotateSound.stop();
          this.endSound.play();

          if (this.data.spinType === 'draw') {
            // 显示中奖结果
            this.showPrize();
          } else if (this.data.spinType === 'eliminate') {
            // 消除奖品
            this.removePrize();
          }

          // 触发转盘结束事件，让父组件更新spinCount等
          this.triggerEvent('spinFinished');

          return;
        }

        // 平滑的减速缓动函数
        const easeOutExpo = (t) => 1 - Math.pow(2, -10 * t);
        const easedProgress = easeOutExpo(progress);

        // 更新旋转角度
        const currentAngle = initialAngle + (stopAngle - initialAngle) * easedProgress;

        this.spinningAngle = currentAngle % 360;

        this.drawWheel(this.spinningAngle);

        // 继续请求动画帧
        this.rotationFrameId = this.canvas.requestAnimationFrame(animate);
      };

      this.rotationFrameId = this.canvas.requestAnimationFrame(animate);
    },
    // 显示中奖奖品
    showPrize() {
      const prize = this.prizes[this.selectedPrizeIndex];

      // 开始中奖奖品的跳动动画
      this.startPrizeBounceAnimation();



      // 增加用户积分
      this.triggerEvent('addPoints', { points: prize.points });

      wx.showModal({
        title: '恭喜中奖',
        content: `您获得了：${prize.name}`,
        showCancel: false,
        success: () => {
          // 停止跳动动画
          if (this.prizeAnimationFrameId) {
            this.canvas.cancelAnimationFrame(this.prizeAnimationFrameId);
            this.prizeAnimationFrameId = null;
          }
          // 重新绘制转盘，停止跳动
          this.drawWheel(this.spinningAngle);
          // 恢复闲置动画
          this.startIdleAnimation();
          // 更新幸运值
          this.triggerEvent('updateEnergy');
        },
      });

    },
    // 消除奖品
    removePrize() {
      const eliminatedPrize = this.prizes.splice(this.selectedPrizeIndex, 1)[0];

      // 重新计算总权重
      this.totalRange = this.prizes.reduce((sum, prize) => sum + prize.range, 0);

      // 通知父组件减少一个道具数量并更新奖品列表
      this.triggerEvent('updateProp', { propChange: -1 });
      this.triggerEvent('updatePrizes', { prizes: this.prizes });

      // 重新加载奖品图片
      this.loadPrizeImages().then(() => {
        // 重新绘制转盘
        this.drawWheel(this.spinningAngle);
      });

      wx.showModal({
        title: '奖品已消除',
        content: `已消除奖品：${eliminatedPrize.name}`,
        showCancel: false,
        success: () => {
          // 恢复闲置动画
          this.startIdleAnimation();
        },
      });
    },
    startPrizeBounceAnimation() {
      const animate = () => {
        this.drawWheel(this.spinningAngle);
        this.prizeAnimationFrameId = this.canvas.requestAnimationFrame(animate);
      };
      this.prizeAnimationFrameId = this.canvas.requestAnimationFrame(animate);
    },
  },
});