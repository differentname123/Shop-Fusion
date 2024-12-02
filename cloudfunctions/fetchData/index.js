const cloud = require('wx-server-sdk');
const axios = require('axios');

cloud.init();

/**
 * 从数据库获取所有 headers
 */
const getHeadersFromDatabase = async (db) => {
  try {
    const headerResult = await db.collection('headerTable').get();
    return headerResult.data.map((item) => JSON.parse(item.header));
  } catch (error) {
    console.error('获取 headers 失败:', error);
    throw new Error('无法获取请求头。');
  }
};

/**
 * 提取 URL 中的参数值
 */
const extractParameter = (url, paramName) => {
  const regex = new RegExp(`[?&]${paramName}=([^&]*)`);
  const match = url.match(regex);
  return match ? decodeURIComponent(match[1]) : null;
};

/**
 * 执行 HTTP 请求
 */
const makeHttpRequest = async (url, headers) => {
  try {
    const response = await axios.get(url, {
      headers: headers,
      maxRedirects: 0,
      validateStatus: (status) => status >= 200 && status < 400,
    });
    return response;
  } catch (error) {
    console.error('HTTP 请求失败：', error);
    throw new Error(`请求失败：${error.message}`);
  }
};

/**
 * 获取 rawData 数据
 */
const fetchRawData = async (url, headers) => {
  try {
    const response = await makeHttpRequest(url, headers);
    const rawDataMatch = response.data.match(/window\.rawData\s*=\s*(\{.*?\});/s);
    if (rawDataMatch) {
      return JSON.parse(rawDataMatch[1]);
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
 */
const processRawData = async (rawData, origin_url, openid, db) => {
  const goodsInfo = findKeyInObject(rawData, 'goodsInfo');
  const groupInfo = findKeyInObject(rawData, 'groupInfo');

  if (goodsInfo && groupInfo) {
    const goodsId = String(goodsInfo.goodsId);
    const groupOrderId = String(groupInfo.groupOrderId);
    const groupUserNum = Array.isArray(groupInfo.groupUserList) ? groupInfo.groupUserList.length : 0;
    const groupRemainCount = groupInfo.customerNum - groupUserNum;

    // 动态生成 wxPath
    const wxPath = `pages/web/web?src=pincard_ask.html%3F__rp_name%3Dbrand_amazing_price_group%26group_order_id%3D${groupOrderId}%26goods_id%3D${goodsId}`;

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
      originUrl: origin_url,
      promotionUrl: origin_url,
      sourceType: 'user',
      goodsType: 'pdd',
      display: 0, // 默认 display 为 0
      updateTime: db.serverDate(),
      wxPath,
      openid,
    };
  } else {
    throw new Error('在 rawData 中未找到 goodsInfo 或 groupInfo。');
  }
};

/**
 * 更新或插入数据库中的 groupGoodsInfo
 */
const updateDatabase = async (db, combinedData) => {
  if (!combinedData.goodsId) {
    console.error('goodsId 不能为空，数据未插入数据库。');
    return { status: 'error', message: 'goodsId 不能为空，数据未插入数据库。', data: combinedData };
  }

  try {
    console.log(`开始查询是否存在 goodsId=${combinedData.goodsId}, groupStatus=0, display=1 的记录`);

    // 查询是否存在符合条件的数据 (goodsId 相同，并且 groupStatus 为 0，display 为 1)
    const existingRecords = await db.collection('groupGoodsInfo').where({
      goodsId: combinedData.goodsId,
      groupStatus: 0,
      display: 1,
    }).get();

    console.log(`查询结果：找到 ${existingRecords.data.length} 条记录`);

    if (existingRecords.data.length > 0) {
      const existingRecord = existingRecords.data.find(
        (record) => record.groupOrderId === combinedData.groupOrderId
      );

      if (existingRecord) {
        console.log(`找到相同的 groupOrderId=${combinedData.groupOrderId}，更新记录`);
        // 如果 groupOrderId 相同，更新记录（保持原 display 不变）
        await db.collection('groupGoodsInfo').doc(existingRecord._id).update({
          data: {
            ...combinedData,
            display: existingRecord.display, // 保持原有 display
          },
        });
        return {
          status: 'success',
          message: '存在相同的拼团信息，不必再次分享。',
          data: combinedData,
        };
      } else {
        console.log(`找到相同的 goodsId=${combinedData.goodsId}，但 groupOrderId 不同，插入新记录`);
        // 如果 groupOrderId 不同，插入新记录
        const addRes = await db.collection('groupGoodsInfo').add({ data: combinedData });
        console.log(`插入新记录成功，记录 ID：${addRes._id}`);
        return {
          status: 'success',
          message: '存在相同的商品信息，消耗积分进行分享。',
          data: combinedData,
        };
      }
    }

    console.log(`未找到任何符合条件的记录，尝试更新或插入新记录`);

    // 如果不存在任何记录，先尝试更新
    const res = await db.collection('groupGoodsInfo').where({
      goodsId: combinedData.goodsId,
      groupOrderId: combinedData.groupOrderId,
    }).update({
      data: combinedData,
    });

    console.log(`更新操作完成，更新记录数：${res.stats.updated}`);

    if (res.stats.updated === 0) {
      console.log(`更新失败，插入新记录`);
      const addRes = await db.collection('groupGoodsInfo').add({
        data: combinedData,
      });
      console.log(`插入新记录成功，记录 ID：${addRes._id}`);
      return {
        status: 'success',
        message: '数据已成功插入数据库。',
        data: combinedData,
      };
    }

    console.log(`更新成功，无需插入新记录`);
    return {
      status: 'success',
      message: '数据已成功更新。',
      data: combinedData,
    };
  } catch (error) {
    console.error('数据库操作时发生错误：', error);
    throw new Error('数据库操作时发生错误。');
  }
};

/**
 * 递归查找嵌套对象中的指定键
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
  const { origin_url, openid } = event;

  // 获取 headers 列表
  let headersList;
  try {
    headersList = await getHeadersFromDatabase(db);
    if (headersList.length === 0) {
      return { status: 'error', message: '没有可用的请求头。' };
    }
  } catch (error) {
    return { status: 'error', message: error.message };
  }

  // 尝试从 URL 中提取 groupOrderId
  let groupOrderId = extractParameter(origin_url, 'group_order_id');

  if (!groupOrderId) {
    try {
      for (let headers of headersList) {
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
    for (let headers of headersList) {
      const rawData = await fetchRawData(finalUrl, headers);
      const combinedData = await processRawData(rawData, origin_url,openid, db);
      const result = await updateDatabase(db, combinedData);
      return result;
    }
  } catch (error) {
    return { status: 'error', message: error.message };
  }

  return { status: 'error', message: '所有请求均失败。' };
};