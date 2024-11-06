// cloudfunctions/fetchData/index.js
const cloud = require('wx-server-sdk');
const axios = require('axios');

cloud.init();

exports.main = async (event, context) => {
  const db = cloud.database();
  const { key_code } = event;

  // 调用 httpbin 服务获取云函数的 IP 地址
  const response = await axios.get('https://httpbin.org/ip');

  // 打印返回的 IP 地址
  console.log('Cloud Function IP Address:', response.data.origin);

  // 构建初始请求 URL
  const baseUrl = `https://file-link.pinduoduo.com/${key_code}`;

  // 默认的请求头信息
  const defaultHeaders = {
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)",
    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "accept-encoding": "gzip, deflate, br, zstd", "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
    "cookie": "rec_list_brand_amazing_price_group=rec_list_brand_amazing_price_group_x3JXk7; api_uid=CkjpJmcCQXoqewBVtILWAg==; webp=1; jrpl=CALqopS1ixhpEb4GNdCDGcMTHkzskqOm; njrpl=CALqopS1ixhpEb4GNdCDGcMTHkzskqOm; dilx=Zg3Np6qOYb9i5y9tCHeyR; _nano_fp=Xpmxl0PoXp9JnqXJX9_Z6hpHEuw5OsST9Ira3Ed9; PDDAccessToken=N64NQMWS4JFV33SP5F4TB43KEOPR5KKQHSB7CJSP4L46E5YFBZ6Q120570b; pdd_user_id=4365968471; pdd_user_uin=X4SHUDVGMG7HGQBVER6XRAMGHI_GEXDA; pdd_vds=gaCscICNdoeoCouOswcELIlNxQNblnxEcyxEdtmsBICINoDLstdsdOuosIBw"
};

  console.error(`开始执行 fetchData，key_code: ${key_code}`);

  // 递归函数，寻找嵌套对象中的指定键
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

  // 数据验证函数，检查对象的指定字段是否存在且有效
  const validateFields = (obj, fields) => {
    for (let field of fields) {
      if (obj[field] === undefined || obj[field] === null || obj[field] === '') {
        console.error(`字段 ${field} 缺失或无效：${obj[field]}`);
        return false;
      }
    }
    return true;
  };

  // 定义执行请求的函数，传入 headers
  const performRequest = async (headers) => {
    try {
      console.error('headers');
      console.error(headers);
      // 第一步：发起初始请求，获取重定向的 URL
      let response = await axios.get(baseUrl, {
        headers: headers,
        maxRedirects: 0, // 禁止自动跟随重定向
        validateStatus: (status) => status >= 200 && status < 400, // 处理 3xx 状态码
      });

      console.error(`初始请求：状态码 ${response.status}`);

      // 获取重定向的目标 URL
      if ([301, 302, 307, 308].includes(response.status)) {
        const redirectedUrl = response.headers['location'];
        console.error(`重定向到：${redirectedUrl}`);
        if (!redirectedUrl) {
          console.error('在响应头中未找到重定向的 URL。');
          return { success: false, message: '在响应头中未找到重定向的 URL。' };
        }

        // 第二步：访问重定向后的 URL
        response = await axios.get(redirectedUrl, {
          headers: headers,
          maxRedirects: 0,
          validateStatus: (status) => status >= 200 && status < 400,
        });

        console.error(`重定向请求：状态码 ${response.status}`);

        // 第三步：解析网页，找到最终的 URL
        if (response.status === 200) {
          const data = response.data;

          // 更新正则表达式，匹配最终的 URL
          const finalMatch = data.match(/location\.replace\(['"]([^'"]+)['"]\)/);
          if (finalMatch) {
            let finalUrl = finalMatch[1];
            if (!finalUrl.startsWith('http')) {
              finalUrl = `https://mobile.yangkeduo.com/${finalUrl}`;
            }
            console.error(`找到最终的 URL：${finalUrl}`);

            // 第四步：访问最终的页面
            response = await axios.get(finalUrl, {
              headers: headers,
            });

            console.error(`最终 URL 请求：状态码 ${response.status}`);

            // 第五步：提取 window.rawData 数据
            const rawDataMatch = response.data.match(/window\.rawData\s*=\s*(\{.*?\});/s);
            if (rawDataMatch) {
              const rawDataStr = rawDataMatch[1];
              try {
                const rawData = JSON.parse(rawDataStr);
                console.error('成功解析 rawData。');

                // 寻找 goodsInfo 和 groupInfo
                const goodsInfo = findKeyInObject(rawData, 'goodsInfo');
                const groupInfo = findKeyInObject(rawData, 'groupInfo');

                if (goodsInfo && groupInfo) {
                  console.error('找到 goodsInfo 和 groupInfo。');

                  // 验证 goodsInfo 的字段
                  const goodsInfoFields = ['goodsId', 'hdThumbUrl', 'goodsName', 'originActivityPrice', 'priceReduce'];
                  if (!validateFields(goodsInfo, goodsInfoFields)) {
                    console.error('goodsInfo 数据：', goodsInfo);
                    return { success: false, message: 'goodsInfo 数据缺失或无效。' };
                  }

                  // 验证 groupInfo 的字段
                  const groupInfoFields = ['customerNum', 'groupOrderId', 'expireTime', 'groupStatus', 'groupUserList'];
                  if (!validateFields(groupInfo, groupInfoFields)) {
                    console.error('groupInfo 数据：', groupInfo);
                    return { success: false, message: 'groupInfo 数据缺失或无效。' };
                  }

                  // 获取服务器时间作为更新时间
                  const updateTime = db.serverDate();

                  // 确保 goodsId 和 groupOrderId 为字符串类型
                  const goodsId = String(goodsInfo.goodsId);
                  const groupOrderId = String(groupInfo.groupOrderId);

                  // 计算 groupUserNum
                  const groupUserNum = Array.isArray(groupInfo.groupUserList) ? groupInfo.groupUserList.length : 0;
                  const groupRemainCount = groupInfo.customerNum - groupUserNum;
                  // 合并 goodsInfo 和 groupInfo 的数据
                  const combinedData = {
                    // goodsInfo 的字段
                    goodsId: goodsId,
                    hdThumbUrl: goodsInfo.hdThumbUrl,
                    goodsName: goodsInfo.goodsName,
                    originActivityPrice: goodsInfo.originActivityPrice,
                    priceReduce: goodsInfo.priceReduce,
                    // groupInfo 的字段
                    customerNum: groupInfo.customerNum,
                    groupOrderId: groupOrderId,
                    expireTime: groupInfo.expireTime,
                    groupStatus: groupInfo.groupStatus,
                    groupUserNum: groupUserNum,
                    groupRemainCount: groupRemainCount,
                    // 额外字段
                    keyCode: key_code, // 添加 keyCode 字段
                    updateTime: updateTime,
                  };

                  // 执行数据库操作
                  try {
                    // 更新或插入 goodsInfoTable，条件是 goodsId 和 groupOrderId 都相同
                    const res = await db.collection('goodsInfoTable').where({
                      goodsId: goodsId,
                      groupOrderId: groupOrderId,
                    }).update({
                      data: combinedData,
                    });
                    console.error(`更新 goodsInfo 记录，更新数量：${res.stats.updated}`);

                    if (res.stats.updated === 0) {
                      // 如果未更新任何记录，则插入新数据
                      const addRes = await db.collection('goodsInfoTable').add({
                        data: combinedData,
                      });
                      console.error(`插入新的 goodsInfo 记录，记录 ID：${addRes._id}`);
                    }
                  } catch (dbError) {
                    console.error('数据库操作时发生错误：', dbError);
                    return { success: false, message: '数据库操作时发生错误。' };
                  }

                  // 返回成功结果，只包含合并后的数据
                  return { success: true, data: combinedData };
                } else {
                  console.error('在 rawData 中未找到 goodsInfo 或 groupInfo。');
                  return { success: false, message: '在 rawData 中未找到 goodsInfo 或 groupInfo。' };
                }
              } catch (err) {
                console.error('JSON 解析失败：', err);
                return { success: false, message: 'JSON 解析失败。' };
              }
            } else {
              console.error('在最终响应中未找到 rawData。');
              return { success: false, message: '在最终响应中未找到 rawData。' };
            }
          } else {
            console.error('在重定向响应中未找到最终的 URL。');
            return { success: false, message: '在重定向响应中未找到最终的 URL。' };
          }
        } else {
          console.error(`访问重定向 URL 时的意外状态码：${response.status}`);
          return { success: false, message: `访问重定向 URL 时的意外状态码：${response.status}` };
        }
      } else {
        console.error(`初始请求的意外状态码：${response.status}`);
        return { success: false, message: `初始请求的意外状态码：${response.status}` };
      }
    } catch (error) {
      console.error('请求失败：', error);
      return { success: false, message: `请求失败：${error.message}` };
    }
  };

  // 使用 defaultHeaders 进行尝试
  let result = await performRequest(defaultHeaders);

  // 如果失败，从 headerTable 中查询 headers 并逐个尝试
  if (!result.success) {
    console.error('使用 defaultHeaders 失败。尝试从 headerTable 中获取 headers。');

    // 查询 headerTable 中的所有 headers
    const headerData = await db.collection('headerTable').get();
    const headersList = headerData.data;

    for (let i = 0; i < headersList.length; i++) {
      const headerString = headersList[i].header;
      if (headerString) {
        try {
          // 将字符串转换为 JSON 对象
          const customHeaders = JSON.parse(headerString);
          // 合并 defaultHeaders 和 customHeaders
          let headersWithCustom = { ...defaultHeaders, ...customHeaders };
          console.error(`尝试使用 headerTable 中索引 ${i} 的 headers。`);

          // 使用新的 headers 进行请求
          result = await performRequest(headersWithCustom);

          if (result.success) {
            console.error('使用 headerTable 中的 headers 请求成功。');
            break; // 成功则退出循环
          } else {
            console.error(`使用索引 ${i} 的 headers 请求失败。`);
          }
        } catch (parseError) {
          console.error(`解析索引 ${i} 的 header 字段失败：`, parseError);
          // 跳过此条，继续尝试下一个
        }
      }
    }
  }

  // 返回最终结果
  if (result.success) {
    return { status: 'success', data: result.data };
  } else {
    return { status: 'error', message: result.message };
  }
};
