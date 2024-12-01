const cloud = require('wx-server-sdk');
const axios = require('axios');

cloud.init();

/**
 * 从数据库获取所有 headers
 * @param {object} db 数据库实例
 * @returns {Array} headers 列表
 */
const getHeadersFromDatabase = async (db) => {
  try {
    const headerResult = await db.collection('headerTable').get();
    return headerResult.data.map(item => JSON.parse(item.header));
  } catch (error) {
    console.error('获取 headers 失败:', error);
    throw new Error('无法获取请求头。');
  }
};

/**
 * 提取 URL 中的参数值
 * @param {string} url 目标 URL
 * @param {string} paramName 要提取的参数名
 * @returns {string|null} 参数值
 */
const extractParameter = (url, paramName) => {
  const regex = new RegExp(`[?&]${paramName}=([^&]*)`);
  const match = url.match(regex);
  return match ? decodeURIComponent(match[1]) : null;
};

/**
 * 执行 HTTP 请求
 * @param {string} url 请求的 URL
 * @param {object} headers 请求头
 * @returns {object} 响应对象
 */
const makeHttpRequest = async (url, headers) => {
  try {
    const response = await axios.get(url, {
      headers: headers,
      maxRedirects: 0, // 禁止自动跟随重定向
      validateStatus: (status) => status >= 200 && status < 400, // 处理 3xx 状态码
    });
    return response;
  } catch (error) {
    console.error('HTTP 请求失败：', error);
    throw new Error(`请求失败：${error.message}`);
  }
};

/**
 * 获取 rawData 数据
 * @param {string} url 请求的 URL
 * @param {object} headers 请求头
 * @returns {object} rawData 数据
 */
const fetchRawData = async (url, headers) => {
  try {
    const response = await makeHttpRequest(url, headers);

    const rawDataMatch = response.data.match(/window\.rawData\s*=\s*(\{.*?\});/s);
    if (rawDataMatch) {
      const rawDataStr = rawDataMatch[1];
      return JSON.parse(rawDataStr);
    } else {
      throw new Error('在响应中未找到 rawData。');
    }
  } catch (error) {
    console.error('获取 rawData 时失败：', error.message);
    throw new Error(error.message);
  }
};

/**
 * 处理 rawData 并返回合并后的数据
 * @param {object} rawData 解析后的 rawData 对象
 * @param {string} origin_url origin_url 参数
 * @param {object} db 数据库实例
 * @returns {object} 合并后的数据
 */
const processRawData = async (rawData, origin_url, db) => {
  const goodsInfo = findKeyInObject(rawData, 'goodsInfo');
  const groupInfo = findKeyInObject(rawData, 'groupInfo');

  if (goodsInfo && groupInfo) {
    console.error('找到 goodsInfo 和 groupInfo。');

    // 验证字段并处理数据
    const updateTime = db.serverDate();
    const goodsId = String(goodsInfo.goodsId);
    const groupOrderId = String(groupInfo.groupOrderId);
    const groupUserNum = Array.isArray(groupInfo.groupUserList) ? groupInfo.groupUserList.length : 0;
    const groupRemainCount = groupInfo.customerNum - groupUserNum;

    return {
      goodsId,
      hdThumbUrl: goodsInfo.hdThumbUrl,
      goodsName: goodsInfo.goodsName,
      originActivityPrice: goodsInfo.originActivityPrice,
      priceReduce: goodsInfo.priceReduce,
      customerNum: groupInfo.customerNum,
      groupOrderId,
      expireTime: groupInfo.expireTime,
      groupStatus: groupInfo.groupStatus,
      groupUserNum,
      groupRemainCount,
      keyCode: origin_url,
      sourceType: 'user',
      updateTime,
    };
  } else {
    throw new Error('在 rawData 中未找到 goodsInfo 或 groupInfo。');
  }
};

/**
 * 更新或插入数据库中的 goodsInfoTable
 * @param {object} db 数据库实例
 * @param {object} combinedData 合并后的数据对象
 * @returns {void}
 */
const updateDatabase = async (db, combinedData) => {
  try {
    const res = await db.collection('goodsInfoTable').where({
      goodsId: combinedData.goodsId,
      groupOrderId: combinedData.groupOrderId,
    }).update({
      data: combinedData,
    });
    console.error(`更新 goodsInfo 记录，更新数量：${res.stats.updated}`);

    if (res.stats.updated === 0) {
      const addRes = await db.collection('goodsInfoTable').add({
        data: combinedData,
      });
      console.error(`插入新的 goodsInfo 记录，记录 ID：${addRes._id}`);
    }
  } catch (dbError) {
    console.error('数据库操作时发生错误：', dbError);
    throw new Error('数据库操作时发生错误。');
  }
};

/**
 * 递归查找嵌套对象中的指定键
 * @param {object} obj 目标对象
 * @param {string} keyToFind 要查找的键
 * @returns {*} 找到的值或 null
 */
const findKeyInObject = (obj, keyToFind) => {
  if (typeof obj !== 'object' || obj === null) return null;
  if (keyToFind in obj) return obj[keyToFind];

  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      const result = findKeyInObject(obj[key], keyToFind);
      if (result) return result;
    }
  }
  return null;
};

/**
 * 执行主逻辑
 */
exports.main = async (event, context) => {
  const db = cloud.database();
  const { origin_url } = event;

  console.error(`开始执行 fetchData，origin_url: ${origin_url}`);

  // 获取 headers 列表
  let headersList;
  try {
    headersList = await getHeadersFromDatabase(db);
    if (headersList.length === 0) {
      console.error('headerTable 中没有可用的 headers。');
      return { status: 'error', message: '没有可用的请求头。' };
    }
  } catch (error) {
    return { status: 'error', message: error.message };
  }

  // 尝试从 URL 中提取 group_order_id
  let groupOrderId = extractParameter(origin_url, 'group_order_id');

  if (!groupOrderId) {
    try {
      for (let i = 0; i < headersList.length; i++) {
        const headers = headersList[i];
        const initialResponse = await makeHttpRequest(origin_url, headers);
        const redirectUrl = initialResponse.headers['location'];

        groupOrderId = extractParameter(redirectUrl, 'group_order_id');
        if (groupOrderId) break;
      }

      if (!groupOrderId) {
        return { status: 'error', message: '无法获取 group_order_id。' };
      }
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  const finalUrl = `https://mobile.yangkeduo.com/pincard_ask.html?__rp_name=brand_amazing_price_group&_pdd_tc=ffffff&_pdd_sbs=1&group_order_id=${groupOrderId}`;

  try {
    for (let i = 0; i < headersList.length; i++) {
      const headers = headersList[i];
      const rawData = await fetchRawData(finalUrl, headers);
      const combinedData = await processRawData(rawData, origin_url, db);
      await updateDatabase(db, combinedData);
      return { status: 'success', data: combinedData };
    }
  } catch (error) {
    return { status: 'error', message: error.message };
  }

  return { status: 'error', message: '所有请求均失败。' };
};
