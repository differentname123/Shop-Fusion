// pages/tutorial/tutorial.js

async function fetchData(key_code) {
  console.log(`开始执行 fetchData，key_code: ${key_code}`);
  const baseUrl = `https://file-link.pinduoduo.com/${key_code}`;
  const defaultHeaders = {
    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "accept-encoding": "gzip, deflate, br, zstd",
    "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
    "cookie": "rec_list_brand_amazing_price_group=rec_list_brand_amazing_price_group_x3JXk7; api_uid=CkjpJmcCQXoqewBVtILWAg==; webp=1; jrpl=CALqopS1ixhpEb4GNdCDGcMTHkzskqOm; njrpl=CALqopS1ixhpEb4GNdCDGcMTHkzskqOm; dilx=Zg3Np6qOYb9i5y9tCHeyR; _nano_fp=Xpmxl0PoXp9JnqXJX9_Z6hpHEuw5OsST9Ira3Ed9; PDDAccessToken=N64NQMWS4JFV33SP5F4TB43KEOPR5KKQHSB7CJSP4L46E5YFBZ6Q120570b; pdd_user_id=4365968471; pdd_user_uin=X4SHUDVGMG7HGQBVER6XRAMGHI_GEXDA; pdd_vds=gaCscICNdoeoCouOswcELIlNxQNblnxEcyxEdtmsBICINoDLstdsdOuosIBw"
  };

  const performRequest = (url, headers) => {
    console.log(`开始请求 URL: ${url}`);
    return new Promise((resolve, reject) => {
      wx.request({
        url: url,
        header: headers,
        method: 'GET',
        success: (response) => {
          console.log(`请求成功, 状态码: ${response.statusCode}`);
          console.log(`返回内容:`, response.data); // 打印返回的内容
          resolve(response.data);
        },
        fail: (error) => {
          console.error(`请求失败：${error.errMsg}`);
          reject(`请求失败：${error.errMsg}`);
        }
      });
    });
  };

  try {
    console.log(`发起初始请求到: ${baseUrl}`);
    const initialData = await performRequest(baseUrl, defaultHeaders);

    // 在第一次请求返回的数据中查找目标链接
    const targetMatch = initialData.match(/location\.replace\(['"]([^'"]+)['"]\)/);
    if (targetMatch) {
      const targetUrl = `https://mobile.yangkeduo.com/${targetMatch[1]}`;
      console.log(`找到目标链接并拼接域名: ${targetUrl}`);

      // 继续访问拼接后的目标链接
      const finalData = await performRequest(targetUrl, defaultHeaders);

      // 在最终数据中查找 window.rawData
      const rawDataMatch = finalData.match(/window\.rawData\s*=\s*(\{.*?\});/s);
      if (rawDataMatch) {
        console.log('成功提取到 window.rawData 数据');
        const rawData = JSON.parse(rawDataMatch[1]);
        return { status: 'success', data: rawData };
      } else {
        console.warn('未找到 window.rawData 数据');
        return { status: 'error', message: '未找到 window.rawData 数据' };
      }
    } else {
      console.warn('未找到目标链接');
      return { status: 'error', message: '未找到目标链接' };
    }
  } catch (error) {
    console.error('请求过程中发生错误:', error);
    return { status: 'error', message: error };
  }
}

// 页面逻辑
Page({
  data: {
    productData: null,
    errorMessage: null,
  },

  async onLoad() {
    const keyCode = 'nyX4hMT9Yr';
    console.log(`页面加载，准备获取 key_code: ${keyCode} 的信息`);
    const result = await fetchData(keyCode);

    if (result && result.status === 'success') {
      console.log('数据获取成功:', result.data);
      this.setData({ productData: result.data });
    } else if (result && result.status === 'error') {
      console.error('数据获取失败:', result.message);
      this.setData({ errorMessage: result.message });
    } else {
      console.error('未知错误：fetchData 没有返回预期的结果结构。');
    }
  }
  
});
