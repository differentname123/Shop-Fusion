// 引入依赖
const cloud = require('wx-server-sdk');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { fork } = require('child_process');

// 初始化云开发环境
cloud.init();

/**
 * 从数据库获取 headers 和 team_id
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
 * 使用 pdd.js 文件生成 anti-content
 * @returns {string} anti_content
 */
const generateAntiContent = () => {
  return new Promise((resolve, reject) => {
    // 启动一个独立的子进程
    const child = fork(path.resolve(__dirname, 'pdd_child.js'));

    // 监听子进程的消息
    child.on('message', (message) => {
      if (message.error) {
        reject(new Error(message.error));
      } else {
        resolve(message.result);
      }
    });

    // 监听子进程的错误
    child.on('error', (err) => {
      reject(err);
    });

    // 监听子进程的退出
    child.on('exit', (code) => {
      if (code !== 0) {
        reject(new Error(`Child process exited with code ${code}`));
      }
    });
  });
};

/**
 * 执行 HTTP 请求并打印返回结果
 * @param {string} url 请求的基础 URL
 * @param {object} headers 请求头
 * @param {object} params 请求参数
 * @returns {object} 响应对象
 */
const makeHttpRequest = async (url, headers, params) => {
  try {
    // 确保请求参数是有效的对象
    if (!params || typeof params !== 'object') {
      throw new Error('请求参数不正确，params 必须是一个对象。');
    }
    // 调试：打印 params，检查是否包含 Buffer 或 undefined
    console.error('请求参数 params:', params);
    // console.error('请求头 headers:', headers);

    // 如果 params 包含 Buffer 数据，确保正确处理
    if (Buffer.isBuffer(params)) {
      console.error('请求参数包含 Buffer 数据');
    } else if (typeof params === 'object') {
      // 如果 params 是对象，检查内部字段
      Object.keys(params).forEach(key => {
        console.error(`参数 ${key} 的类型:`, typeof params[key]);
        if (Buffer.isBuffer(params[key])) {
          console.error(`参数 ${key} 是 Buffer 类型`);
        }
      });
    }
    // 发送 POST 请求
    const response = await axios({
      method: 'POST',
      url: url,
      headers: headers,  // 传递自定义的 headers
      data: params,      // 传递请求参数（axios 会自动序列化为 JSON）
      validateStatus: (status) => true,  // 不抛出非 2xx 状态码的错误
    });

    // 打印成功日志
    console.log('HTTP 请求成功，状态码:', response.status);
    // 可以选择打印返回的数据
    console.error('返回数据:', response.data);

    // 返回完整的响应对象
    return {
      statusCode: response.status,
      body: response.data,
    };

  } catch (error) {
    // 捕获并打印错误信息
    console.error('HTTP 请求失败：', error.message);

    // 处理 axios 错误响应 (error.response)
    if (error.response) {
      // 服务器返回了非 2xx 响应
      console.error('服务器返回错误，状态码:', error.response.status);
      console.error('错误响应数据:', error.response.data);

      return {
        statusCode: error.response.status,
        error: error.response.data,  // 返回服务器返回的错误信息
      };
    } else if (error.request) {
      // 请求已发出，但没有收到响应
      console.error('没有收到服务器的响应:', error.request);

      return {
        statusCode: 500,
        error: 'No response received from server',
      };
    } else {
      // 其他未知类型的错误
      console.error('未知错误:', error.message);

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
    // 提取数据列表，假设我们需要 'group_order_list' 中的数据
    const groupOrderLists = rawData.result.group_order_list || [];
    console.error(`找到 ${groupOrderLists.length} 个 group_order_list。`);

    // 遍历处理每个 item
    return groupOrderLists.map(item => {
      // 打印当前处理的 item
      // console.error('处理 item:', JSON.stringify(item));

      // 计算价格差
      const priceReduce = item.origin_price - item.activity_price;
      // 计算参与人数
      const customerNum = (Array.isArray(item.group_member_avatar_list) ? item.group_member_avatar_list.length : 0) + (item.need_invite_customer_num || 0);

      return {
        goodsId: String(item.goods_id), // 适配字段名称
        hdThumbUrl: item.hd_url, // 适配字段名称
        goodsName: item.goods_name,
        originActivityPrice: item.activity_price,
        priceReduce: priceReduce,
        customerNum: customerNum,
        groupOrderId: String(item.group_order_id),
        expireTime: item.expire_time,
        groupStatus: item.group_status,
        groupUserNum: customerNum - (item.need_invite_customer_num || 0), // 当前人数
        groupRemainCount: item.need_invite_customer_num || 0, // 还需人数
        sourceType: 'autogroup', // 添加 sourceType 字段
      };
    });
  } catch (error) {
    console.error('处理 rawData 时发生错误:', error);
    throw new Error('处理 rawData 时发生错误');
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
    // 确保 goodsId 和 groupOrderId 存在
    if (!individualData.goodsId || !individualData.groupOrderId) {
      console.error('缺少必要的 goodsId 或 groupOrderId');
      return { status: 'failed', error: 'Missing required fields: goodsId or groupOrderId' };
    }
    individualData.updateTime = db.serverDate(); // 或者使用 new Date() 以排查问题
    // 打印 individualData 的详细内容
    console.log("打印 individualData 的详细内容：", individualData);

    // 使用 db.serverDate() 获取 updateTime，或直接使用 Date 对象临时排查问题


    // 调试：检查查询条件
    console.log(`查询条件: goodsId: ${individualData.goodsId}, groupOrderId: ${individualData.groupOrderId}`);

    // 更新数据库记录
    const res = await db.collection('goodsInfoTable').where({
      goodsId: individualData.goodsId,
      groupOrderId: individualData.groupOrderId
    }).update({
      data: individualData,
    });

    // 检查更新结果
    if (!res || !res.stats || typeof res.stats.updated === 'undefined') {
      console.error('更新操作未返回有效结果');
      return { status: 'failed', error: 'Database update returned an invalid response' };
    }

    console.log(`更新记录数量：${res.stats.updated}`);

    // 如果没有记录被更新，插入新记录
    if (res.stats.updated === 0) {
      const addRes = await db.collection('goodsInfoTable').add({
        data: individualData,
      });
      if (addRes && addRes._id) {
        console.log(`插入新记录成功，记录 ID：${addRes._id}`);
        return { status: 'inserted', insertedId: addRes._id };
      } else {
        console.error('插入新记录失败');
        return { status: 'failed', error: 'Failed to insert new record' };
      }
    } else {
      return { status: 'updated' };
    }

  } catch (dbError) {
    console.error('数据库操作时发生错误：', dbError);
    return { status: 'failed', error: dbError.message };
  }
};

/**
 * 主函数：执行请求并存储数据
 */
exports.main = async (event, context) => {
  const db = cloud.database();

  // 获取云函数的 IP 地址
  try {
    const ipResponse = await axios.get('https://httpbin.org/ip');
    console.log('Cloud Function IP Address:', ipResponse.data.origin);
  } catch (error) {
    console.error('获取 IP 地址失败：', error);
    return { status: 'error', message: '无法获取 IP 地址。' };
  }

  // 构建请求 URL
  const baseUrl = "https://mobile.pinduoduo.com/proxy/api/api/brand-group/team/group_order_list?pdduid=4365968471";

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
      let at = await generateAntiContent();  // 使用 await 等待 generateAntiContent 的返回值
      // let at = "666";
      console.error('at:', at);
      try {
        // 更新请求参数中的 team_id，同时生成新的 anti_content
        const updatedParams = {
          "page_index": 1,
          "page_size": 20,
          "team_id": team_id,
          "anti_content": at, // 动态生成 anti-content
        };
  
        // 发起请求并打印返回值
        const response = await makeHttpRequest(baseUrl, headers, updatedParams);
        // 检查响应的状态码
        if (response.statusCode === 200) {
          const rawData = response.body;  // 替换为 response.body 来获取数据
          let has_more = rawData.result.hase_more;
          // console.error('成功获取并解析到的 rawData:', JSON.stringify(rawData));
  
          // 处理原始数据
          const processedData = processRawData(rawData);
  
          // 遍历并插入/更新每条数据
          for (const individualData of processedData) {
            await updateDatabase(db, individualData);
          }
  
          console.log('数据处理完成。');
          return {
            status: 'success',
            message: `成功处理 ${processedData.length} 条数据`,
          };
        } else {
          throw new Error(`请求失败，状态码：${response.statusCode}`);
        }
      } catch (error) {
        console.error(`使用索引 ${i} 的 headers 请求失败：${error.message}`);
        // 继续尝试下一个 headers
      }
    }
  
    return { status: 'error', message: '所有 headers 尝试均失败。' };
  };

  // 执行尝试
  const finalResult = await tryHeadersSequentially();

  // 返回最终结果
  return finalResult;
};