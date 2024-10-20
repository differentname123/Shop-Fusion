const cloud = require('wx-server-sdk');

cloud.init();

exports.main = async (event, context) => {
  const db = cloud.database();

  const { page = 1, filters = {}, searchKeyword = '' } = event;
  const pageSize = 6; // 每页显示的数量

  try {
    const _ = db.command;
    let query = db.collection('goodsInfoTable');

    // 动态构建查询条件
    const whereCondition = {};

    // 处理 filters
    if (Object.keys(filters).length > 0) {
      Object.assign(whereCondition, filters);
    }

    // 处理搜索关键词，使用正则表达式进行模糊匹配
    if (searchKeyword) {
      whereCondition.goodsName = db.RegExp({
        regexp: '.*' + searchKeyword + '.*',
        options: 'i'
      });
    }

    // 打印查询条件以及相关变量
    console.log('查询条件：', whereCondition);
    console.log('当前页码：', page);
    console.log('每页显示数量：', pageSize);
    console.log('搜索关键词：', searchKeyword);
    console.log('过滤条件：', filters);
    // 应用查询条件
    query = query.where(whereCondition);

    const res = await query
      .orderBy('updateTime', 'desc')
      .skip((page -1) * pageSize)
      .limit(pageSize)
      .get();

    return {
      success: true,
      data: res.data
    };
  } catch (err) {
    console.error('获取商品数据失败', err);
    return {
      success: false,
      errorMessage: err.message
    };
  }
};
