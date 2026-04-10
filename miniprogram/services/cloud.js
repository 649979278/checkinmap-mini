/**
 * 统一封装云函数调用，避免页面散落业务常量。
 * @param {string} name 云函数名称。
 * @param {Object} data 云函数参数。
 * @returns {Promise<Object>} 云函数结果。
 */
function callCloudFunction(name, data = {}) {
  return wx.cloud.callFunction({ name, data }).then((response) => response.result);
}

/**
 * 获取首页地图数据。
 * @returns {Promise<Object>} 首页地图数据。
 */
function getHomeMapData() {
  return callCloudFunction("getHomeMapData");
}

/**
 * 搜索景点与饭店。
 * @param {string} keyword 搜索关键词。
 * @returns {Promise<Object>} 搜索结果。
 */
function searchPlaces(keyword) {
  return callCloudFunction("searchPlaces", { keyword });
}

/**
 * 新增或更新地点打卡。
 * @param {Object} payload 打卡载荷。
 * @returns {Promise<Object>} 保存结果。
 */
function upsertCheckin(payload) {
  return callCloudFunction("upsertCheckin", payload);
}

/**
 * 获取当前用户的全部打卡记录。
 * @returns {Promise<Object>} 打卡记录结果。
 */
function getMyCheckins() {
  return callCloudFunction("getMyCheckins");
}

module.exports = {
  callCloudFunction,
  getHomeMapData,
  searchPlaces,
  upsertCheckin,
  getMyCheckins,
};
