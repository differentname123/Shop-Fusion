// cloudfunctions/getGroupGoods/index.js
const cloud = require('wx-server-sdk');
const axios = require('axios');

cloud.init();

/**
 * 从数据库获取所有 headers 及对应的 team_id
 * @param {object} db 数据库实例
 * @returns {Array} headers 列表
 */
const getHeadersFromDatabase = async (db) => {
  try {
    const headerResult = await db.collection('headerTable').get();
    console.log('成功获取 headers 列表，共计:', headerResult.data.length);
    return headerResult.data.map(item => ({
      headers: JSON.parse(item.header),
      team_id: item.team_id
    }));
  } catch (error) {
    console.error('获取 headers 失败:', error);
    throw new Error('无法获取请求头。');
  }
};

/**
 * 递归查找嵌套对象中的所有指定键
 * @param {object} obj 目标对象
 * @param {string} keyToFind 要查找的键
 * @returns {Array} 找到的所有值数组
 */
const findAllKeysInObject = (obj, keyToFind) => {
  let results = [];

  if (typeof obj !== 'object' || obj === null) return results;

  if (keyToFind in obj) {
    results.push(obj[keyToFind]);
  }

  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      const nestedResults = findAllKeysInObject(obj[key], keyToFind);
      if (nestedResults.length > 0) {
        results = results.concat(nestedResults);
      }
    }
  }

  return results;
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
 * 执行 HTTP 请求
 * @param {string} url 请求的基础 URL
 * @param {object} headers 请求头
 * @param {object} params 请求参数
 * @returns {object} 响应对象
 */
const makeHttpRequest = async (url, headers, params) => {
  try {
    console.log('发起 HTTP 请求，URL:', url, '请求参数:', params);
    const response = await axios.get(url, {
      headers: headers,
      params: params,
      validateStatus: (status) => status >= 200 && status < 500, // 接受4xx状态码以便后续处理
    });
    console.log('HTTP 请求成功，响应状态:', response.status);
    return response;
  } catch (error) {
    console.error('HTTP 请求失败：', error);
    throw new Error(`请求失败：${error.message}`);
  }
};

/**
 * 处理 rawData 并返回合并后的数据列表
 * @param {object} rawData 解析后的 rawData 对象
 * @param {object} db 数据库实例
 * @returns {Array} 合并后的数据列表
 */
const processRawData = async (rawData, db) => {
  // 查找所有 groupOrderList
  const groupOrderLists = findAllKeysInObject(rawData, 'groupOrderList');

  if (groupOrderLists.length > 0) {
    console.log(`找到 ${groupOrderLists.length} 个 groupOrderList。`);

    // 合并所有 groupOrderList 的 items
    let combinedGroupOrderList = [];
    groupOrderLists.forEach(list => {
      if (Array.isArray(list)) {
        combinedGroupOrderList = combinedGroupOrderList.concat(list);
      }
    });

    console.log('合并后的 groupOrderList 长度为:', combinedGroupOrderList.length);

    // 对合并后的 groupOrderList 进行处理
    const adaptedGroupOrderList = combinedGroupOrderList.map(item => {
      // 验证必要字段
      const requiredFields = ['goodsId', 'hdUrl', 'goodsName', 'originPrice', 'activityPrice', 'groupOrderId', 'expireTime', 'groupStatus', 'groupMemberAvatarList'];

      // 如果没有 needInviteCustomerNum，默认设置为 0
      if (!('needInviteCustomerNum' in item)) {
        console.log(`item 中缺少 needInviteCustomerNum 字段，已默认设置为 0`);
        item.needInviteCustomerNum = 0;
      }
      
      // 验证并处理必要字段
      if (!validateFields(item, requiredFields)) {
        console.error('groupOrderList 中某个 item 缺失必要字段。');
        throw new Error('groupOrderList 中某个 item 缺失必要字段。');
      }

      // 计算 priceReduce = originPrice - activityPrice
      const priceReduce = item.originPrice - item.activityPrice;

      // 计算 customerNum = groupMemberAvatarList.length + needInviteCustomerNum
      const customerNum = (Array.isArray(item.groupMemberAvatarList) ? item.groupMemberAvatarList.length : 0) + item.needInviteCustomerNum;

      // 计算 groupUserNum 和 groupRemainCount
      const groupUserNum = Array.isArray(item.groupMemberAvatarList) ? item.groupMemberAvatarList.length : 0;
      const groupRemainCount = item.needInviteCustomerNum;

      return {
        goodsId: String(item.goodsId),
        hdThumbUrl: item.hdUrl, // 适配字段名称：hdUrl → hdThumbUrl
        goodsName: item.goodsName,
        originActivityPrice: item.originPrice,
        priceReduce: priceReduce,
        customerNum: customerNum,
        groupOrderId: item.groupOrderId,
        expireTime: item.expireTime,
        groupStatus: item.groupStatus,
        groupUserNum: groupUserNum,
        groupRemainCount: groupRemainCount,
        sourceType: 'user', // 添加 sourceType 字段
        updateTime: db.serverDate(), // 添加更新时间字段
      };
    });

    console.log('成功处理并适配 groupOrderList 数据。');
    return adaptedGroupOrderList;
  } else {
    console.error('在 rawData 中未找到任何 groupOrderList。');
    throw new Error('在 rawData 中未找到任何 groupOrderList。');
  }
};

/**
 * 更新或插入数据库中的 goodsInfoTable
 * @param {object} db 数据库实例
 * @param {object} individualData 每条数据对象
 * @returns {object} 更新或插入的结果
 */
const updateDatabase = async (db, individualData) => {
  try {
    console.log(`尝试更新数据库记录，goodsId: ${individualData.goodsId}, groupOrderId: ${individualData.groupOrderId}`);
    const res = await db.collection('goodsInfoTable').where({
      goodsId: individualData.goodsId,
      groupOrderId: individualData.groupOrderId
    }).update({
      data: individualData,
    });
    console.log(`更新 goodsInfo 记录，更新数量：${res.stats.updated}`);

    if (res.stats.updated === 0) {
      const addRes = await db.collection('goodsInfoTable').add({
        data: individualData,
      });
      console.log(`插入新的 goodsInfo 记录，记录 ID：${addRes._id}`);
      return { status: 'inserted' };
    } else {
      return { status: 'updated' };
    }
  } catch (dbError) {
    console.error('数据库操作时发生错误：', dbError);
    return { status: 'failed', error: dbError.message };
  }
};

/**
 * 执行主逻辑
 */
exports.main = async (event, context) => {
  const db = cloud.database();
  console.log('开始执行 fetchData 云函数');

  // 获取云函数的 IP 地址
  try {
    const ipResponse = await axios.get('https://httpbin.org/ip');
    console.log('Cloud Function IP Address:', ipResponse.data.origin);
  } catch (error) {
    console.error('获取 IP 地址失败：', error);
    return { status: 'error', message: '无法获取 IP 地址。' };
  }

  // 构建请求 URL
  const baseUrl = "https://mobile.pinduoduo.com/pincard_ask.html";

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
      const { headers, team_id } = headersList[i];
      console.log(`尝试使用 headerTable 中索引 ${i} 的 headers。team_id: ${team_id}`);

      try {
        // 更新请求参数中的 team_id
        const updatedParams = {
          "__rp_name": "brand_amazing_price_group_team",
          "team_id": String(team_id),
        };

        // 发起请求
        const response = await makeHttpRequest(baseUrl, headers, updatedParams);
        console.log(`请求响应状态码：${response.status}`);

        if (response.status === 200) {
          // 解析页面内容，提取 rawData
          const dataMatch = response.data.match(/window\.rawData\s*=\s*(\{.*?\});/s);
          if (dataMatch) {
            const rawDataStr = dataMatch[1];
            let rawData;
            try {
              rawData = JSON.parse(rawDataStr);
              console.log('成功解析 rawData。');
            } catch (err) {
              console.error('JSON 解析失败：', err);
              throw new Error('JSON 解析失败。');
            }

            // 处理 rawData
            let combinedDataList = await processRawData(rawData, db);

            // 逆序排列数据
            combinedDataList = combinedDataList.reverse();

            // 计数器
            let total = combinedDataList.length;
            let inserted = 0;
            let updated = 0;
            let failed = 0;

            // 遍历并插入/更新每条数据
            for (let individualData of combinedDataList) {
              const result = await updateDatabase(db, individualData);
              if (result.status === 'inserted') {
                inserted++;
              } else if (result.status === 'updated') {
                updated++;
              } else {
                failed++;
              }
            }

            console.log('数据处理完成。');
            return {
              success: true,
              message: `总共 ${total} 条数据，${inserted} 条插入，${updated} 条更新，${failed} 条失败。`,
            };
          } else {
            throw new Error('在响应中未找到 rawData。');
          }
        } else {
          throw new Error(`请求失败，状态码：${response.status}`);
        }
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
    return { status: 'success', message: finalResult.message };
  } else {
    return { status: 'error', message: finalResult.message };
  }
};