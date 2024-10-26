// lottery.js
Page({
  data: {
    canvasWidth: 500,
    canvasHeight: 500,
    prizes: [
      {
        name: '10积分',
        icon: '/assets/icon1.png',
        range: 1,
        idleAnimation: true,
      },
      {
        name: '20积分',
        icon: '/assets/icon2.png',
        range: 2,
        idleAnimation: false,
      },
      {
        name: '30积分',
        icon: '/assets/icon3.png',
        range: 3,
        idleAnimation: true,
      },
      {
        name: '40积分',
        icon: '/assets/icon4.png',
        range: 2,
        idleAnimation: false,
      },
      {
        name: '50积分',
        icon: '/assets/icon5.png',
        range: 1,
        idleAnimation: true,
      },
      {
        name: '100积分',
        icon: '/assets/icon6.png',
        range: 1,
        idleAnimation: false,
      },
    ],
    totalRange: 0,
    isSpinning: false,
    spinningAngle: 0,
    selectedPrizeIndex: null,
    prizeAnimationFrameId: null,
    idleAnimationFrameId: null,
    canvas: null,
    ctx: null,
    rotationFrameId: null,
    rotateSound: null, // 旋转音效
    endSound: null,    // 结束音效
    pointerImage: null, // 指针图片
  },

  onLoad() {
    // 计算总权重
    const totalRange = this.data.prizes.reduce((sum, prize) => sum + prize.range, 0);
    this.setData({
      totalRange,
    });

    // 初始化音效
    this.rotateSound = wx.createInnerAudioContext();
    this.rotateSound.src = '/audio/rotate.mp3';
    this.endSound = wx.createInnerAudioContext();
    this.endSound.src = '/audio/end.mp3';

    // 获取 Canvas 上下文
    const query = wx.createSelectorQuery().in(this);
    query.select('#wheelCanvas')
      .node()
      .exec((res) => {
        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');

        this.canvas = canvas;
        this.ctx = ctx;

        // 设置画布的实际像素大小
        const dpr = wx.getSystemInfoSync().pixelRatio;
        canvas.width = this.data.canvasWidth * dpr;
        canvas.height = this.data.canvasHeight * dpr;
        ctx.scale(dpr, dpr);

        // 加载资源
        Promise.all([
          this.loadPrizeImages(),
          this.loadPointerImage(),
        ]).then(() => {
          // 绘制转盘
          this.drawWheel(0);
          // 开始闲置时的奖品跳动动画
          this.startIdleAnimation();
        });
      });
  },

  onUnload() {
    // 取消动画帧
    if (this.rotationFrameId) {
      this.canvas.cancelAnimationFrame(this.rotationFrameId);
    }
    if (this.prizeAnimationFrameId) {
      this.canvas.cancelAnimationFrame(this.prizeAnimationFrameId);
    }
    if (this.idleAnimationFrameId) {
      this.canvas.cancelAnimationFrame(this.idleAnimationFrameId);
    }
    // 销毁音频资源
    if (this.rotateSound) {
      this.rotateSound.stop();
      this.rotateSound.destroy();
    }
    if (this.endSound) {
      this.endSound.stop();
      this.endSound.destroy();
    }
  },

  // 加载奖品图片
  loadPrizeImages() {
    const loadPromises = this.data.prizes.map((prize) => {
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

  // 加载指针图片
  loadPointerImage() {
    return new Promise((resolve, reject) => {
      const image = this.canvas.createImage();
      image.src = '/assets/pointer.png'; // 指针图片路径
      image.onload = () => {
        this.pointerImage = image;
        resolve();
      };
      image.onerror = (err) => {
        console.error('加载指针图片失败：', err);
        reject(err);
      };
    });
  },

  // 绘制转盘
  drawWheel(angle) {
    const ctx = this.ctx;
    const { canvasWidth, canvasHeight, prizes, totalRange } = this.data;
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    const radius = Math.min(centerX, centerY) - 10; // 留出边距

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(((angle - 90) * Math.PI) / 180); // 调整角度，使得0度从“正上方”开始
    ctx.translate(-centerX, -centerY);

    let startAngle = 0;
    prizes.forEach((prize, index) => {
      const anglePerPrize = (prize.range / totalRange) * 2 * Math.PI;

      // 绘制扇形
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + anglePerPrize);
      ctx.closePath();
      ctx.fillStyle = this.getColor(index);
      ctx.fill();

      // 绘制奖品名称（增大字体大小）
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + anglePerPrize / 2);

      ctx.fillStyle = '#000';
      ctx.font = 'bold 18px sans-serif'; // 将字体大小调整为18px，加粗
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(prize.name, radius - 60, 0);

      // 绘制奖品图片
      const imgSize = 40;

      // 奖品图片跳动动画
      let scale = 1;
      if (this.data.isSpinning) {
        // 旋转停止后，让中奖奖品跳动
        if (!this.data.isSpinning && index === this.data.selectedPrizeIndex) {
          scale = 1 + 0.1 * Math.sin((Date.now() % 500) / 500 * Math.PI * 2);
        }
      } else {
        // 闲置时，某些奖品跳动
        if (prize.idleAnimation) {
          scale = 1 + 0.1 * Math.sin((Date.now() % 1000) / 1000 * Math.PI * 2);
        }
      }
      ctx.scale(scale, scale);

      if (prize.image) {
        ctx.drawImage(
          prize.image,
          radius - 100,
          -imgSize / 2,
          imgSize,
          imgSize
        );
      }

      ctx.restore();

      startAngle += anglePerPrize;
    });

    ctx.restore();

    // 绘制指针图片在圆盘中心（指向正上方）
    if (this.pointerImage) {
      const pointerSize = 60; // 指针图片的大小
      ctx.drawImage(
        this.pointerImage,
        centerX - pointerSize / 2,
        centerY - pointerSize / 2,
        pointerSize,
        pointerSize
      );
    } else {
      // 如果未加载指针图片，绘制默认指针
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - 20);
      ctx.lineTo(centerX - 10, centerY + 10);
      ctx.lineTo(centerX + 10, centerY + 10);
      ctx.closePath();
      ctx.fillStyle = '#FF0000';
      ctx.fill();
    }
  },

  // 获取扇形颜色
  getColor(index) {
    const colors = ['#FFB6C1', '#FFD700', '#ADFF2F', '#87CEFA', '#FFA500', '#90EE90'];
    return colors[index % colors.length];
  },

  // 开始闲置时的奖品跳动动画
  startIdleAnimation() {
    const animate = () => {
      if (!this.data.isSpinning) {
        this.drawWheel(this.data.spinningAngle);
      }
      this.idleAnimationFrameId = this.canvas.requestAnimationFrame(animate);
    };
    this.idleAnimationFrameId = this.canvas.requestAnimationFrame(animate);
  },

  // 点击开始旋转
  onClick() {
    if (this.data.isSpinning) return;

    this.setData({
      isSpinning: true,
    });

    // 停止闲置动画
    if (this.idleAnimationFrameId) {
      this.canvas.cancelAnimationFrame(this.idleAnimationFrameId);
      this.idleAnimationFrameId = null;
    }

    // 播放旋转音效
    this.rotateSound.play();

    // 随机计算要停止的角度
    const stopAngle = this.getStopAngle();

    // 开始旋转动画
    this.startRotation(stopAngle);
  },

  // 计算停止的角度
  getStopAngle() {
    const { prizes, totalRange } = this.data;

    // 随机生成一个数，根据权重确定中奖奖品
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

    this.setData({
      selectedPrizeIndex,
    });

    // 计算该奖品的起始角度（从顶部开始，顺时针方向）
    let startAngle = 0;
    for (let i = 0; i < selectedPrizeIndex; i++) {
      startAngle += (prizes[i].range / totalRange) * 360;
    }
    const prizeAngle = (prizes[selectedPrizeIndex].range / totalRange) * 360;

    // 计算中奖奖品的中心角度
    const prizeCenterAngle = startAngle + prizeAngle / 2;

    // 计算需要旋转的总角度，使得中奖奖品的中心与指针（正上方）对齐
    const stopAngle = 360 * 5 + prizeCenterAngle;

    return stopAngle;
  },

  // 开始旋转动画
  startRotation(stopAngle) {
    const duration = 5000; // 动画持续时间5秒
    const startTime = Date.now();
    const initialAngle = this.data.spinningAngle;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / duration;

      if (progress >= 1) {
        // 动画结束
        this.setData({
          spinningAngle: stopAngle % 360,
          isSpinning: false,
        });
        this.drawWheel(this.data.spinningAngle);
        // 停止旋转音效，播放结束音效
        this.rotateSound.stop();
        this.endSound.play();
        // 展示中奖信息
        this.showPrize();
        return;
      }

      // 缓动函数
      const easeOutQuad = (t) => t * (2 - t);
      const easedProgress = easeOutQuad(progress);

      const currentAngle = initialAngle + (stopAngle - initialAngle) * easedProgress;

      this.setData({
        spinningAngle: currentAngle % 360,
      });

      this.drawWheel(this.data.spinningAngle);

      this.rotationFrameId = this.canvas.requestAnimationFrame(animate);
    };

    this.rotationFrameId = this.canvas.requestAnimationFrame(animate);
  },

  // 显示中奖信息
  showPrize() {
    const prize = this.data.prizes[this.data.selectedPrizeIndex];

    // 中奖后开始奖品图片跳动动画
    this.animatePrize();

    // 展示中奖弹窗
    wx.showModal({
      title: '恭喜中奖',
      content: `您获得了：${prize.name}`,
      showCancel: false,
      success: () => {
        // 停止奖品图片跳动动画
        if (this.prizeAnimationFrameId) {
          this.canvas.cancelAnimationFrame(this.prizeAnimationFrameId);
          this.prizeAnimationFrameId = null;
        }
        // 重新绘制转盘，停止跳动
        this.drawWheel(this.data.spinningAngle);
        // 恢复闲置动画
        this.startIdleAnimation();
      },
    });
  },

  // 奖品跳动动画
  animatePrize() {
    const animate = () => {
      if (this.data.isSpinning) return;
      this.drawWheel(this.data.spinningAngle);
      this.prizeAnimationFrameId = this.canvas.requestAnimationFrame(animate);
    };
    this.prizeAnimationFrameId = this.canvas.requestAnimationFrame(animate);
  },
});