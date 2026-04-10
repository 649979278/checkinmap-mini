const cloud = require("wx-server-sdk");
const { buildCheckinMutation } = require("./checkin");

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();

/**
 * 确保 user_checkins 集合存在。
 * @returns {Promise<void>} 执行结果。
 */
async function ensureCheckinCollection() {
  try {
    await db.createCollection("user_checkins");
  } catch (error) {
    // 集合已存在时忽略异常。
  }
}

/**
 * 新增或更新当前用户的打卡记录。
 * @param {Object} event 打卡参数。
 * @returns {Promise<Object>} 保存结果。
 */
exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  if (!event.placeId || !event.placeType || !event.placeName) {
    throw new Error("缺少必要的打卡参数");
  }

  await ensureCheckinCollection();

  const existing = await db
    .collection("user_checkins")
    .where({
      openid: OPENID,
      placeId: event.placeId,
      placeType: event.placeType,
    })
    .limit(1)
    .get();

  const checkedAt = new Date().toISOString();
  const mutation = buildCheckinMutation(
    existing.data && existing.data.length ? existing.data[0] : null,
    {
      openid: OPENID,
      placeId: event.placeId,
      placeType: event.placeType,
      placeName: event.placeName,
      district: event.district,
      location: event.location,
      note: event.note,
      source: event.source,
    },
    checkedAt
  );

  if (mutation.mode === "update") {
    await db.collection("user_checkins").doc(mutation.docId).update({
      data: mutation.data,
    });
    return {
      mode: "update",
      checkedAt,
    };
  }

  await db.collection("user_checkins").add({
    data: mutation.data,
  });

  return {
    mode: "create",
    checkedAt,
  };
};
