// addUser 云函数
const cloud = require('wx-server-sdk');

cloud.init();

const db = cloud.database();

exports.main = async (event, context) => {
  const { openid, nickName, avatarUrl, points } = event;
  console.log("收到的参数：", { openid, nickName, avatarUrl, points });
  const currentTime = db.serverDate();

  try {
    // 查询数据库中是否存在该用户
    const userRecord = await db.collection('userInfo').where({
      openid: openid
    }).get();

    if (userRecord.data.length === 0) {
      // 如果没有找到该用户，插入新记录
      await db.collection('userInfo').add({
        data: {
          openid: openid,
          nickName: nickName,
          avatarUrl: avatarUrl,
          points: points || 0, // 初次注册积分默认为0
          createTime: currentTime,
          updateTime: currentTime
        }
      });
      return { success: true, message: '用户信息插入成功' };
    } else {
      // 如果找到，更新用户信息
      await db.collection('userInfo').where({
        openid: openid
      }).update({
        data: {
          nickName: nickName,
          avatarUrl: avatarUrl,
          points: points,
          updateTime: currentTime
        }
      });
      return { success: true, message: '用户信息更新成功' };
    }
  } catch (err) {
    console.error('数据库操作失败：', err);
    return { success: false, message: '数据库操作失败', error: err };
  }
};