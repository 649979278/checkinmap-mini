const { DISTRICT_LIST, getDistrictByName } = require("../constants/districts");

/**
 * 根据景点列表和打卡记录生成区级进度。
 * @param {Array} scenicSpots 景点列表。
 * @param {Array} checkins 当前用户打卡记录。
 * @returns {Array} 六区进度列表。
 */
function buildDistrictProgress(scenicSpots = [], checkins = []) {
  const checkedSpotIds = new Set(
    checkins
      .filter((item) => item.placeType === "scenic")
      .map((item) => item.placeId)
  );

  const progressMap = DISTRICT_LIST.reduce((accumulator, district) => {
    accumulator[district.name] = {
      key: district.key,
      name: district.name,
      checkedCount: 0,
      totalCount: 0,
    };
    return accumulator;
  }, {});

  scenicSpots.forEach((spot) => {
    const district = getDistrictByName(spot.district);
    if (!district) {
      return;
    }
    progressMap[district.name].totalCount += 1;
    if (checkedSpotIds.has(spot._id || spot.placeId)) {
      progressMap[district.name].checkedCount += 1;
    }
  });

  return DISTRICT_LIST.map((district) => progressMap[district.name]);
}

module.exports = {
  DISTRICT_LIST,
  buildDistrictProgress,
};
