// index.js
Page({
  data: {
    userInfo: {
      nickName: '',
      avatarUrl: '',
      openid: '',
      points: 0
    },
    statusBarHeight: 0,
    navigationBarHeight: 0,
    totalNavHeight: 0,
    filterBarHeight: 44, // 筛选栏高度，视情况调整
    scrollViewTop: 0,
    productList: [], // 商品的完整列表
    filteredProductList: [], // 筛选后的商品列表
    page: 1,
    loadingMore: false,
    hasMore: true,
    searchKeyword: '', // 搜索关键词
    isRefreshing: false, // 下拉刷新状态
    filterSelected: {
      onePerson: false, // "只差一人" 标签状态，默认未选中
      mySubscription: false // "我的订阅" 标签状态
    },
    globalInterval: null // 全局倒计时定时器
  },

  onLoad() {
    // 获取系统信息
    const systemInfo = wx.getSystemInfoSync();
    const menuButtonInfo = wx.getMenuButtonBoundingClientRect();

    // 计算导航栏高度
    const statusBarHeight = systemInfo.statusBarHeight;
    const navBarHeight = (menuButtonInfo.top - statusBarHeight) * 2 + menuButtonInfo.height;

    // 计算 scroll-view 的起始位置
    const filterBarHeight = this.data.filterBarHeight;
    const scrollViewTop = statusBarHeight + navBarHeight + filterBarHeight;

    this.setData({
      statusBarHeight,
      navBarHeight,
      scrollViewTop
    });

    this.loadProducts();
    this.startGlobalCountdown(); // 启动全局倒计时
  },

  onUnload() {
    // 清除全局定时器
    clearInterval(this.data.globalInterval);
  },

  // 处理搜索事件
  onSearch(event) {
    const keyword = event.detail.trim();
    this.setData({
      searchKeyword: keyword,
      page: 1,
      productList: [],
      filteredProductList: [],
      hasMore: true
    });
    this.loadProducts();
  },

  // 取消搜索
  onCancel() {
    this.setData({
      searchKeyword: '',
      page: 1,
      productList: [],
      filteredProductList: [],
      hasMore: true
    });
    this.loadProducts();
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.setData({
      isRefreshing: true,
      page: 1,
      productList: [],
      filteredProductList: [],
      hasMore: true
    });
    this.loadProducts(() => {
      wx.stopPullDownRefresh(); // 停止下拉刷新动画
      this.setData({ isRefreshing: false });
    });
  },

  // 加载商品数据
  loadProducts(callback) {
    if (this.data.loadingMore || !this.data.hasMore) {
      if (callback) callback();
      return;
    }

    this.setData({ loadingMore: true });

    // 构建查询条件
    const filters = {};

    if (this.data.filterSelected.onePerson) {
      filters.groupRemainCount = 1;
    }

    // 将搜索关键词传递给云函数
    const searchKeyword = this.data.searchKeyword;

    // 调用云函数获取商品数据
    wx.cloud.callFunction({
      name: 'getProducts',
      data: {
        page: this.data.page,
        filters: filters,
        searchKeyword: searchKeyword
      }
    }).then(res => {
      if (!res.result.success) {
        wx.showToast({
          title: '数据加载失败',
          icon: 'none'
        });
        this.setData({ loadingMore: false });
        if (callback) callback();
        return;
      }

      const newProducts = res.result.data;
      // console.log(newProducts);

      // 如果返回的数据少于预期，设置 hasMore 为 false
      const pageSize = 6; // 与云函数中每页数量一致
      if (newProducts.length < pageSize) {
        this.setData({ hasMore: false });
      }

      // 处理商品数据，转换字段
      const processedProducts = newProducts.map(item => {
        // 计算还差多少人拼团成功
        const groupRemainCount = item.customerNum - item.groupUserNum;

        return {
          id: item._id,
          imageUrl: item.hdThumbUrl,
          title: item.goodsName,
          price: (Number(item.originActivityPrice) / 100).toFixed(2),
          discountPrice: (Number(item.priceReduce) / 100).toFixed(2),
          keyCode: item.keyCode,
          expireTime: Number(item.expireTime), // 确保是数字类型
          groupStatus: item.groupStatus,
          groupUserNum: item.groupUserNum,
          customerNum: item.customerNum,
          groupOrderId: item.groupOrderId,
          goodsId: item.goodsId,
          groupRemainCount: groupRemainCount,
          wxPath: item.wxPath,
          promotionUrl: item.promotionUrl,
          // 倒计时初始值
          countdown: '',
          // 标签筛选条件
          onePerson: groupRemainCount === 1,
          mySubscription: false // 根据业务逻辑设置
        };
      });

      // 更新商品列表和分页信息
      this.setData({
        productList: this.data.productList.concat(processedProducts),
        page: this.data.page + 1,
        loadingMore: false
      });

      // 更新筛选后的商品列表
      this.filterProducts();

      if (callback) callback();

    }).catch(err => {
      console.error('获取商品数据失败', err);
      wx.showToast({
        title: '数据加载失败',
        icon: 'none'
      });
      this.setData({ loadingMore: false });
      if (callback) callback();
    });
  },

  // 启动全局倒计时定时器
  startGlobalCountdown() {
    this.setData({
      globalInterval: setInterval(() => {
        this.updateCountdowns();
      }, 1000) // 每秒更新一次
    });
  },

  // 更新所有商品的倒计时
  updateCountdowns() {
    const updatedProductList = this.data.productList.map(product => {
      const countdown = this.calculateCountdown(product.expireTime);
      return { ...product, countdown };
    });

    // 更新数据
    this.setData({
      productList: updatedProductList
    });

    // 更新筛选后的商品列表
    this.filterProducts();
  },

  // 计算倒计时
  calculateCountdown(expireTime) {
    const now = Date.now(); // 当前时间的时间戳（毫秒）
    const expireTimeMs = Number(expireTime) * 1000; // 过期时间的时间戳（毫秒）
    const timeLeft = expireTimeMs - now;

    if (timeLeft <= 0) {
      return '已结束';
    }

    const hours = Math.floor(timeLeft / (3600 * 1000));
    const minutes = Math.floor((timeLeft % (3600 * 1000)) / (60 * 1000));
    const seconds = Math.floor((timeLeft % (60 * 1000)) / 1000);

    const hoursStr = hours < 10 ? `0${hours}` : hours;
    const minutesStr = minutes < 10 ? `0${minutes}` : minutes;
    const secondsStr = seconds < 10 ? `0${seconds}` : seconds;

    return `${hoursStr}:${minutesStr}:${secondsStr}`;
  },

  // 标签点击事件
  onFilterClick(event) {
    const filterType = event.currentTarget.dataset.type;
    const currentStatus = this.data.filterSelected[filterType];
    console.log('当前点击的标签:', filterType);

    // 切换标签选中状态
    this.setData({
      [`filterSelected.${filterType}`]: !currentStatus,
      // 重置分页信息
      page: 1,
      productList: [],
      filteredProductList: [],
      hasMore: true
    });

    // 重新加载商品数据
    this.loadProducts();
  },

  // 筛选商品列表
  filterProducts() {
    const { mySubscription, onePerson } = this.data.filterSelected;

    let filteredProducts = this.data.productList;

    // 根据选中的标签进行筛选
    if (mySubscription) {
      filteredProducts = filteredProducts.filter(product => product.mySubscription);
    }

    if (onePerson) {
      filteredProducts = filteredProducts.filter(product => product.groupRemainCount === 1);
    }

    // 更新筛选后的商品列表
    this.setData({
      filteredProductList: filteredProducts
    });
  },

  // scroll-view 滚动到底部
  onScrollToLower() {
    this.loadMoreProducts();
  },

  // 加载更多商品
  loadMoreProducts() {
    if (this.data.hasMore && !this.data.loadingMore) {
      this.loadProducts();
    } else if (!this.data.hasMore && this.data.filteredProductList.length > 0) {
      wx.showToast({
        title: '没有更多商品了',
        icon: 'none'
      });
    }
  },

  // 参与拼团事件
  onJoinGroup(event) {
    const item = event.currentTarget.dataset.item; // 获取传入的完整 item 对象
    console.log('item:', item);
    // 拼接 URL
    const url = item.promotionUrl;
    
    console.log('Generated URL:', url);
  
    const path = item.wxPath;
    console.log('wx path:', path);
    
    // 先复制 URL 到剪贴板，无论跳转成功与否
    wx.setClipboardData({
      data: url,
      success() {
      }
    });
  
    // 跳转至指定页面
    wx.navigateToMiniProgram({
      appId: 'wx32540bd863b27570',
      path: path,
      extraData: {},
      envVersion: 'release',
      success(res) {
        console.log("跳转成功");
      },
      fail(err) {
        // 跳转失败，提示用户可以通过浏览器打开
        console.error("跳转失败", err);
  
        // 提示用户跳转失败并可以通过浏览器打开
        wx.showModal({
          title: '提示',
          content: '无法跳转到小程序，已复制链接。你可以粘贴到浏览器中打开。',
          showCancel: false, // 不显示取消按钮
          confirmText: '知道了',
          success(res) {
            if (res.confirm) {
              console.log('用户知道了');
            }
          }
        });
      }
    });
  },

  onShareClick(event) {
    const productId = event.currentTarget.dataset.id;
    console.log(`分享按钮点击，商品ID：${productId}`);
    
    // 弹窗提示
    wx.showToast({
      title: '点击了分享按钮',
      icon: 'none',
      duration: 2000
    });
    
    // 在此添加分享逻辑
  },
  
  onSubscribeClick(event) {
    const productId = event.currentTarget.dataset.id;
    const productIndex = this.data.productList.findIndex(p => p.id === productId);  // 找到商品的索引
  
    if (productIndex === -1) {
      console.error('未找到商品');
      return;
    }
  
    const isSubscribed = this.data.productList[productIndex].mySubscription;
    const newSubscriptionStatus = !isSubscribed;
  
    // 更新商品订阅状态
    this.setData({
      [`productList[${productIndex}].mySubscription`]: newSubscriptionStatus  // 正确使用索引
    });
  
    const statusText = newSubscriptionStatus ? '已订阅' : '订阅';
    const color = newSubscriptionStatus ? 'yellow' : 'gray';
  
    console.log(`订阅按钮点击，商品ID：${productId}，状态：${statusText}`);
  
    // 弹窗提示
    wx.showToast({
      title: statusText,
      icon: 'none',
      duration: 2000
    });
  },

  // 商品卡片点击事件（可根据需要实现）
  onProductClick(event) {
    const item = event.currentTarget.dataset.item;
    // 实现商品点击逻辑，例如跳转到详情页
  }
});
