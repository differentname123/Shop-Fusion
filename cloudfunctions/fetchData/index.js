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

    // 查询相关记录
    const relatedRecords = await db.collection('goodsInfo').where({
      goodsId: goodsId,
    }).get();

    console.log(`查询结果：找到 ${relatedRecords.data.length} 条记录`);
    let promotionWxPath = "";
    let promotionUrl = "";

    // 如果查询结果存在数据，尝试获取 wxPath 和 promotionUrl
    if (relatedRecords.data && relatedRecords.data.length > 0) {
      const firstRecord = relatedRecords.data[0]; // 假设使用第一个记录的数据
      promotionWxPath = firstRecord.promotionWxPath || ""; // 如果 wxPath 存在，赋值；否则为空字符串
      promotionUrl = firstRecord.promotionUrl || ""; // 如果 promotionUrl 存在，赋值；否则为空字符串
    }

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
      promotionUrl: promotionUrl,
      promotionWxPath:promotionWxPath,
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
  // 校验必填字段
  if (!combinedData.goodsId) {
    console.error('goodsId 不能为空，数据未插入数据库。');
    return {
      status: 'error',
      message: 'goodsId 不能为空，数据未插入数据库。',
      data: combinedData,
    };
  }

  if (!combinedData.groupOrderId) {
    console.error('groupOrderId 不能为空，数据未插入数据库。');
    return {
      status: 'error',
      message: 'groupOrderId 不能为空，数据未插入数据库。',
      data: combinedData,
    };
  }

  try {
    console.log(`开始查询与 goodsId=${combinedData.goodsId} 相关的所有记录`);

    // 查询相关记录
    const relatedRecords = await db.collection('groupGoodsInfo').where({
      goodsId: combinedData.goodsId,
    }).get();

    console.log(`查询结果：找到 ${relatedRecords.data.length} 条记录`);

    // 初始化变量，用于后续统一处理
    let targetRecord = null; // 需要更新的记录
    let message = ''; // 操作提示信息
    let points = 0; // 消耗积分

    // 条件 1：完全匹配的记录
    const exactMatchRecord = relatedRecords.data.find(
      (record) =>
        record.groupOrderId === combinedData.groupOrderId &&
        record.groupStatus === 1 &&
        record.display === 1
    );
    if (exactMatchRecord) {
      console.log(`存在完全匹配的记录 groupOrderId=${combinedData.groupOrderId}`);
      targetRecord = exactMatchRecord;
      message = '存在相同的拼团信息，不必再次分享。';
    }

    // 条件 2：相同 goodsId，未完成拼团记录
    if (!targetRecord) {
      const similarGoodsRecord = relatedRecords.data.find(
        (record) => record.groupStatus === 1 && record.display === 1
      );
      if (similarGoodsRecord) {
        console.log(`存在相同的商品，但 groupOrderId 不同`);
        targetRecord = similarGoodsRecord;
        message =
          '存在相同的商品的拼团数据，建议参与已有的团，你也可以消耗积分进行强行分享。';
        points = 10;
      }
    }

    // 条件 3：仅匹配 goodsId 的记录
    if (!targetRecord) {
      const goodsOnlyRecord = relatedRecords.data.find(
        (record) => record.goodsId === combinedData.goodsId
      );
      if (goodsOnlyRecord) {
        console.log(`存在相同的商品记录`);
        targetRecord = goodsOnlyRecord;
        message = '建议使用平台链接重新开团，将大大增加成功概率。';
      }
    }
    targetRecord = relatedRecords.data.find(
      (record) =>
        record.groupOrderId === combinedData.groupOrderId
    );
    // 最终统一处理更新或插入操作
    if (targetRecord) {

      // 更新记录
      await db.collection('groupGoodsInfo').doc(targetRecord._id).update({
        data: {
          ...combinedData,
          display: targetRecord.display, // 保持原 display
          groupStatus: targetRecord.groupStatus, // 保持原 groupStatus
        },
      });

      return {
        status: 'success',
        message,
        data: combinedData,
        points,
      };
    } else {
      console.log('没有任何相关记录，插入新记录');
      const addRes = await db.collection('groupGoodsInfo').add({
        data: combinedData,
      });
      console.log(`新的开团信息已插入，记录 ID：${addRes._id}`);
      message = '新的开团信息，已插入。';

      return {
        status: 'success',
        message,
        data: combinedData,
        points,
      };
    }
  } catch (error) {
    console.error('数据库操作时发生错误：', error);
    return {
      status: 'error',
      message: '数据库操作时发生错误。',
      data: combinedData,
    };
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