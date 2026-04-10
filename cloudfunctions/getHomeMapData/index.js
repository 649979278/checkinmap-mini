const cloud = require("wx-server-sdk");

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();

/**
 * 安全读取集合数据，集合不存在时返回空数组。
 * @param {string} collectionName 集合名称。
 * @param {Object} condition 查询条件。
 * @returns {Promise<Array>} 查询结果。
 */
async function safeCollectionGet(collectionName, condition = {}) {
  try {
    const response = await db.collection(collectionName).where(condition).get();
    return response.data || [];
  } catch (error) {
    return [];
  }
}

/**
 * 统计北京城六区景点打卡进度。
 * @param {Array} scenicSpots 景点列表。
 * @param {Array} checkins 当前用户打卡列表。
 * @returns {Array} 进度列表。
 */
function buildProgress(scenicSpots, checkins) {
  const districts = [
    { key: "dongcheng", name: "东城区" },
    { key: "xicheng", name: "西城区" },
    { key: "chaoyang", name: "朝阳区" },
    { key: "haidian", name: "海淀区" },
    { key: "fengtai", name: "丰台区" },
    { key: "shijingshan", name: "石景山区" },
  ];
  const checkedIds = new Set(
    checkins
      .filter((item) => item.placeType === "scenic")
      .map((item) => item.placeId)
  );
  const progressMap = districts.reduce((accumulator, item) => {
    accumulator[item.name] = {
      key: item.key,
      name: item.name,
      checkedCount: 0,
      totalCount: 0,
    };
    return accumulator;
  }, {});

  scenicSpots.forEach((spot) => {
    if (!progressMap[spot.district]) {
      return;
    }
    progressMap[spot.district].totalCount += 1;
    if (checkedIds.has(spot._id)) {
      progressMap[spot.district].checkedCount += 1;
    }
  });

  return districts.map((item) => progressMap[item.name]);
}

/**
 * 返回首页地图所需数据。
 * @returns {Promise<Object>} 首页数据。
 */
exports.main = async () => {
  const { OPENID } = cloud.getWXContext();
  const scenicSpots = await safeCollectionGet("scenic_spots", { isActive: true });
  const checkins = await safeCollectionGet("user_checkins", { openid: OPENID });
  const checkinMap = checkins.reduce((accumulator, item) => {
    accumulator[`${item.placeType}:${item.placeId}`] = item;
    return accumulator;
  }, {});

  return {
    scenicSpots: scenicSpots.map((spot) => {
      const matchedCheckin = checkinMap[`scenic:${spot._id}`];
      return {
        ...spot,
        placeId: spot._id,
        placeName: spot.name,
        placeType: "scenic",
        checked: Boolean(matchedCheckin),
        note: matchedCheckin ? matchedCheckin.note : "",
        source: "scenic_spots",
      };
    }),
    checkedRestaurants: checkins
      .filter((item) => item.placeType === "restaurant")
      .map((item) => ({
        ...item,
        checked: true,
        category: "restaurant",
      })),
    progress: buildProgress(scenicSpots, checkins),
  };
};
