const cloud = require("wx-server-sdk");
const scenicSpots = require("./spots");

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();

/**
 * 确保 scenic_spots 集合存在。
 * @returns {Promise<void>} 执行结果。
 */
async function ensureCollection() {
  try {
    await db.createCollection("scenic_spots");
  } catch (error) {
    // 集合已存在时忽略异常。
  }
}

/**
 * 幂等初始化北京城六区景点数据。
 * @returns {Promise<Object>} 初始化结果。
 */
exports.main = async () => {
  await ensureCollection();

  let createdCount = 0;
  let updatedCount = 0;

  for (const item of scenicSpots) {
    const existing = await db
      .collection("scenic_spots")
      .where({
        name: item.name,
        district: item.district,
      })
      .limit(1)
      .get();

    if (existing.data && existing.data.length) {
      await db.collection("scenic_spots").doc(existing.data[0]._id).update({
        data: item,
      });
      updatedCount += 1;
      continue;
    }

    await db.collection("scenic_spots").add({
      data: item,
    });
    createdCount += 1;
  }

  return {
    total: scenicSpots.length,
    createdCount,
    updatedCount,
  };
};
