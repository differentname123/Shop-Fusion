// cloudfunctions/fetchData/index.js
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
 * 验证对象中指定字段是否存在且有效
 * @param {object} obj 目标对象
 * @param {Array} fields 要验证的字段数组
 * @returns {boolean} 验证结果
 */
const validateFields = (obj, fields) => {
  for (let field of fields) {
    if (obj[field] === undefined || obj[field] === null || obj[field] === '') {
      console.error(`字段 ${field} 缺失或无效：${obj[field]}`);
      return false;
    }
  }
  return true;
};

/**
 * 执行 HTTP 请求并处理重定向
 * @param {string} url 请求的基础 URL
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
 * 处理重定向并获取最终的 rawData
 * @param {object} initialResponse 初始请求的响应
 * @param {object} headers 请求头
 * @returns {object} rawData 对象
 */
const handleRedirects = async (initialResponse, headers) => {
  if ([301, 302, 307, 308].includes(initialResponse.status)) {
    const redirectedUrl = initialResponse.headers['location'];
    console.error(`重定向到：${redirectedUrl}`);
    if (!redirectedUrl) {
      throw new Error('在响应头中未找到重定向的 URL。');
    }

    const redirectedResponse = await makeHttpRequest(redirectedUrl, headers);
    console.error(`重定向请求：状态码 ${redirectedResponse.status}`);

    if (redirectedResponse.status === 200) {
      const finalMatch = redirectedResponse.data.match(/location\.replace\(['"]([^'"]+)['"]\)/);
      if (finalMatch) {
        let finalUrl = finalMatch[1];
        if (!finalUrl.startsWith('http')) {
          finalUrl = `https://mobile.yangkeduo.com/${finalUrl}`;
        }
        console.error(`找到最终的 URL：${finalUrl}`);

        const finalResponse = await makeHttpRequest(finalUrl, headers);
        console.error(`最终 URL 请求：状态码 ${finalResponse.status}`);

        const rawDataMatch = finalResponse.data.match(/window\.rawData\s*=\s*(\{.*?\});/s);
        if (rawDataMatch) {
          const rawDataStr = rawDataMatch[1];
          try {
            const rawData = JSON.parse(rawDataStr);
            console.error('成功解析 rawData。');
            return rawData;
          } catch (err) {
            console.error('JSON 解析失败：', err);
            throw new Error('JSON 解析失败。');
          }
        } else {
          throw new Error('在最终响应中未找到 rawData。');
        }
      } else {
        throw new Error('在重定向响应中未找到最终的 URL。');
      }
    } else {
      throw new Error(`访问重定向 URL 时的意外状态码：${redirectedResponse.status}`);
    }
  } else {
    throw new Error('初始请求未引发重定向。');
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
 * 处理 rawData 并返回合并后的数据
 * @param {object} rawData 解析后的 rawData 对象
 * @param {string} key_code key_code 参数
 * @param {object} db 数据库实例
 * @returns {object} 合并后的数据
 */
const processRawData = async (rawData, key_code, db) => {
  const goodsInfo = findKeyInObject(rawData, 'goodsInfo');
  const groupInfo = findKeyInObject(rawData, 'groupInfo');

  if (goodsInfo && groupInfo) {
    console.error('找到 goodsInfo 和 groupInfo。');

    // 验证 goodsInfo 的字段
    const goodsInfoFields = ['goodsId', 'hdThumbUrl', 'goodsName', 'originActivityPrice', 'priceReduce'];
    if (!validateFields(goodsInfo, goodsInfoFields)) {
      console.error('goodsInfo 数据：', goodsInfo);
      throw new Error('goodsInfo 数据缺失或无效。');
    }

    // 验证 groupInfo 的字段
    const groupInfoFields = ['customerNum', 'groupOrderId', 'expireTime', 'groupStatus', 'groupUserList'];
    if (!validateFields(groupInfo, groupInfoFields)) {
      console.error('groupInfo 数据：', groupInfo);
      throw new Error('groupInfo 数据缺失或无效。');
    }

    // 获取服务器时间作为更新时间
    const updateTime = db.serverDate();

    // 确保 goodsId 和 groupOrderId 为字符串类型
    const goodsId = String(goodsInfo.goodsId);
    const groupOrderId = String(groupInfo.groupOrderId);

    // 计算 groupUserNum 和 groupRemainCount
    const groupUserNum = Array.isArray(groupInfo.groupUserList) ? groupInfo.groupUserList.length : 0;
    const groupRemainCount = groupInfo.customerNum - groupUserNum;

    // 合并 goodsInfo 和 groupInfo 的数据
    const combinedData = {
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
      keyCode: key_code,
      sourceType:'user',
      updateTime,
    };

    return combinedData;
  } else {
    throw new Error('在 rawData 中未找到 goodsInfo 或 groupInfo。');
  }
};

/**
 * 执行主逻辑
 */
exports.main = async (event, context) => {
  const db = cloud.database();
  const { key_code } = event;

  console.error(`开始执行 fetchData，key_code: ${key_code}`);

  // 获取云函数的 IP 地址
  try {
    const ipResponse = await axios.get('https://httpbin.org/ip');
    console.log('Cloud Function IP Address:', ipResponse.data.origin);
  } catch (error) {
    console.error('获取 IP 地址失败：', error);
    return { status: 'error', message: '无法获取 IP 地址。' };
  }

  // 构建初始请求 URL
  const baseUrl = `https://file-link.pinduoduo.com/${key_code}`;

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

  /**
   * 尝试使用所有 headers 进行请求，直到成功
   * @returns {object} 最终结果
   */
  const tryHeadersSequentially = async () => {
    for (let i = 0; i < headersList.length; i++) {
      const headers = headersList[i];
      console.error(`尝试使用 headerTable 中索引 ${i} 的 headers。`);

      try {
        const initialResponse = await makeHttpRequest(baseUrl, headers);
        console.error(`初始请求：状态码 ${initialResponse.status}`);

        const rawData = await handleRedirects(initialResponse, headers);
        const combinedData = await processRawData(rawData, key_code, db);

        await updateDatabase(db, combinedData);

        console.error('请求成功。');
        return { success: true, data: combinedData };
      } catch (error) {
        console.error(`使用索引 ${i} 的 headers 请求失败：${error.message}`);
        // 继续尝试下一个 headers
      }
    }

    return { success: false, message: '所有 headers 尝试均失败。' };
  };

  // 执行尝试
  const finalResult = await tryHeadersSequentially();

  // 返回最终结果
  if (finalResult.success) {
    return { status: 'success', data: finalResult.data };
  } else {
    return { status: 'error', message: finalResult.message };
  }
};