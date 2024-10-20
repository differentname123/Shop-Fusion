// getUser 云函数
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()

exports.main = async (event, context) => {
  const { openid } = event;

  try {
    // 查询数据库中是否有该openid
    const userRecord = await db.collection('userInfo').where({
      openid: openid
    }).get()

    if (userRecord.data.length === 0) {
      // 如果没有找到该openid
      return {
        message: '未找到用户信息',
        data: null
      }
    } else {
      // 如果找到，返回用户信息
      return {
        message: '用户信息查询成功',
        data: userRecord.data[0]
      }
    }
  } catch (err) {
    return {
      message: '查询失败',
      error: err
    }
  }
}