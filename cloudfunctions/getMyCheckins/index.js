const cloud = require("wx-server-sdk");

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();

/**
 * 拉取当前用户的全部打卡记录。
 * @returns {Promise<Object>} 打卡记录列表。
 */
exports.main = async () => {
  const { OPENID } = cloud.getWXContext();

  try {
    const response = await db
      .collection("user_checkins")
      .where({ openid: OPENID })
      .orderBy("checkedAt", "desc")
      .get();

    return {
      checkins: response.data || [],
    };
  } catch (error) {
    return {
      checkins: [],
      errorMessage: error.message || "user_checkins 集合不存在",
    };
  }
};
