// 引入依赖
const cloud = require('wx-server-sdk');
const axios = require('axios');
const path = require('path');
const { fork } = require('child_process');

// 显式设置环境
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV  // 使用当前云函数所在的默认环境
});

/**
 * 从数据库获取 headers 和 team_id
 * @param {object} db 数据库实例
 * @returns {Array} headers 列表
 */
const getHeadersFromDatabase = async (db) => {
  try {
    const headerResult = await db.collection('headerTable').get();
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
 * 使用 pdd.js 文件生成 anti-content
 * @returns {Promise<string>} anti_content
 */
const generateAntiContent = () => {
  return new Promise((resolve, reject) => {
    const child = fork(path.resolve(__dirname, 'pdd_child.js'));

    child.on('message', (message) => {
      if (message.error) {
        reject(new Error(message.error));
      } else {
        resolve(message.result);
      }
    });

    child.on('error', (err) => {
      reject(err);
    });

    child.on('exit', (code) => {
      if (code !== 0) {
        reject(new Error(`Child process exited with code ${code}`));
      }
    });
  });
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
    const response = await axios({
      method: 'POST',
      url: url,
      headers: headers,
      data: params,
      validateStatus: (status) => true,
    });

    return {
      statusCode: response.status,
      body: response.data,
    };
  } catch (error) {
    if (error.response) {
      return {
        statusCode: error.response.status,
        error: error.response.data,
      };
    } else if (error.request) {
      return {
        statusCode: 500,
        error: 'No response received from server',
      };
    } else {
      return {
        statusCode: 500,
        error: 'Unexpected error occurred',
        details: error.message,
      };
    }
  }
};

/**
 * 处理请求得到的 rawData 并返回合并后的数据列表
 * @param {object} rawData 解析后的 rawData 对象
 * @returns {Array} 处理后适配的数据列表
 */
const processRawData = (rawData) => {
  try {
    const groupOrderLists = rawData.result.group_order_list || [];
    return groupOrderLists.map(item => {
      const priceReduce = item.origin_price - item.activity_price;
      const customerNum = (Array.isArray(item.group_member_avatar_list) ? item.group_member_avatar_list.length : 0) + (item.need_invite_customer_num || 0);

      return {
        goodsId: String(item.goods_id),
        hdThumbUrl: item.hd_url,
        goodsName: item.goods_name,
        originActivityPrice: item.activity_price,
        priceReduce: priceReduce,
        customerNum: customerNum,
        groupOrderId: String(item.group_order_id),
        expireTime: item.expire_time,
        groupStatus: item.group_status,
        groupUserNum: customerNum - (item.need_invite_customer_num || 0),
        groupRemainCount: item.need_invite_customer_num || 0,
        sourceType: 'autogroup',
      };
    });
  } catch (error) {
    console.error('处理 rawData 时发生错误:', error);
    throw new Error('处理 rawData 时发生错误');
  }
};

/**
 * 插入或更新数据库中的 goodsInfoTable
 * @param {object} db 数据库实例
 * @param {object} individualData 每条数据对象
 * @returns {object} 插入或更新的结果
 */
const insertOrUpdateDatabase = async (db, individualData) => {
  try {
    if (!individualData.goodsId || !individualData.groupOrderId) {
      return { status: 'failed', error: '缺少 goodsId 或 groupOrderId 字段' };
    }
    individualData.updateTime = db.serverDate();

    const res = await db.collection('goodsInfoTable').where({
      goodsId: individualData.goodsId,
      groupOrderId: individualData.groupOrderId
    }).update({
      data: individualData,
    });

    if (!res || !res.stats || typeof res.stats.updated === 'undefined') {
      return { status: 'failed', error: '数据库更新返回无效响应' };
    }

    if (res.stats.updated === 0) {
      const addRes = await db.collection('goodsInfoTable').add({
        data: individualData,
      });
      if (addRes && addRes._id) {
        return { status: 'inserted', insertedId: addRes._id };
      } else {
        return { status: 'failed', error: '插入新记录失败' };
      }
    } else {
      return { status: 'updated' };
    }

  } catch (dbError) {
    return { status: 'failed', error: dbError.message };
  }
};

/**
 * 主函数：执行请求并存储数据，并控制日志输出
 */
exports.main = async (event, context) => {
  const db = cloud.database();

  // 获取云函数的 IP 地址
  try {
    const ipResponse = await axios.get('https://httpbin.org/ip');
    console.log('Cloud Function IP Address:', ipResponse.data.origin);
  } catch (error) {
    return { status: 'error', message: '无法获取 IP 地址。' };
  }

  const baseUrl = "https://mobile.pinduoduo.com/proxy/api/api/brand-group/team/group_order_list?pdduid=4365968471";

  let headersList;
  try {
    headersList = await getHeadersFromDatabase(db);
    if (headersList.length === 0) {
      return { status: 'error', message: '没有可用的请求头。' };
    }
  } catch (error) {
    return { status: 'error', message: error.message };
  }

  const tryHeadersSequentially = async () => {
    let totalProcessed = 0;
    let totalInserted = 0;
    let totalUpdated = 0;
    let totalFailed = 0;
    let currentPageIndex = 0; // 用于返回最终的 pageIndex

    for (let i = 0; i < headersList.length; i++) {
      const { headers, team_id } = headersList[i];
      let at = await generateAntiContent();
      try {
        let pageIndex = 1;  // 从第 1 页开始
        let has_more = true;

        while (has_more && pageIndex <= 5) { // 加入 pageIndex <= 5 的条件
          currentPageIndex = pageIndex;  // 记录当前的 pageIndex
          const updatedParams = {
            "page_index": pageIndex,
            "page_size": 20,
            "team_id": team_id,
            "anti_content": at,
          };

          const response = await makeHttpRequest(baseUrl, headers, updatedParams);
          if (response.statusCode === 200) {
            const rawData = response.body;
            has_more = rawData.result.has_more;
            const processedData = processRawData(rawData);

            let pageInserted = 0;
            let pageUpdated = 0;
            let pageFailed = 0;

            // 一条一条插入/更新数据
            for (const individualData of processedData) {
              const result = await insertOrUpdateDatabase(db, individualData);
              totalProcessed++;
              if (result.status === 'inserted') {
                totalInserted++;
                pageInserted++;
              } else if (result.status === 'updated') {
                totalUpdated++;
                pageUpdated++;
              } else if (result.status === 'failed') {
                totalFailed++;
                pageFailed++;
              }
            }

            // 打印每页的数据处理情况
            console.log(`page ${pageIndex} 总共 ${processedData.length} 条数据，${pageInserted} 条插入，${pageUpdated} 条更新，${pageFailed} 条失败。`);

            pageIndex++;
          } else {
            throw new Error(`请求失败，状态码：${response.statusCode}`);
          }
        }

        return {
          status: 'success',
          message: `总共 ${totalProcessed} 条数据，${totalInserted} 条插入，${totalUpdated} 条更新，${totalFailed} 条失败。`,
          pageIndex: currentPageIndex  // 返回当前的 pageIndex
        };
      } catch (error) {
        console.error(`使用索引 ${i} 的 headers 请求失败：${error.message}`);
      }
    }

    return { status: 'error', message: '所有 headers 尝试均失败。', pageIndex: currentPageIndex };
  };

  const finalResult = await tryHeadersSequentially();
  return finalResult;
};