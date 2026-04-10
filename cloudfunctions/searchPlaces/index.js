const https = require("https");
const cloud = require("wx-server-sdk");
const {
  tencentMapKey,
  tencentMapSecretKey,
  placeSearchPath,
} = require("./config");
const { buildSignedPlaceSearchUrl } = require("./signature");

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();

/**
 * 转义正则中的特殊字符，避免搜索词导致查询异常。
 * @param {string} keyword 搜索关键词。
 * @returns {string} 可安全用于正则检索的字符串。
 */
function escapeRegExp(keyword) {
  return keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * 搜索内置景点数据。
 * @param {string} keyword 搜索关键词。
 * @returns {Promise<Array>} 景点结果。
 */
async function searchScenicSpots(keyword) {
  try {
    const regexp = db.RegExp({
      regexp: escapeRegExp(keyword),
      options: "i",
    });
    const response = await db
      .collection("scenic_spots")
      .where({
        isActive: true,
        name: regexp,
      })
      .limit(8)
      .get();
    return response.data || [];
  } catch (error) {
    return [];
  }
}

/**
 * 调用腾讯位置服务进行饭店检索。
 * @param {string} keyword 搜索关键词。
 * @returns {Promise<Object>} 腾讯位置服务返回值。
 */
function searchRestaurants(keyword) {
  const url = buildSignedPlaceSearchUrl({
    endpointPath: placeSearchPath,
    params: {
      boundary: "region(北京市,1)",
      keyword,
      page_size: "8",
      key: tencentMapKey,
    },
    secretKey: tencentMapSecretKey,
  });

  return new Promise((resolve, reject) => {
    https
      .get(url, (response) => {
        let raw = "";
        response.setEncoding("utf8");
        response.on("data", (chunk) => {
          raw += chunk;
        });
        response.on("end", () => {
          try {
            resolve(JSON.parse(raw));
          } catch (error) {
            reject(error);
          }
        });
      })
      .on("error", reject);
  });
}

/**
 * 获取当前用户已打卡记录。
 * @param {string} openid 当前用户 openid。
 * @returns {Promise<Array>} 打卡记录。
 */
async function loadUserCheckins(openid) {
  try {
    const response = await db.collection("user_checkins").where({ openid }).get();
    return response.data || [];
  } catch (error) {
    return [];
  }
}

/**
 * 返回景点和饭店搜索结果。
 * @param {Object} event 云函数参数。
 * @returns {Promise<Object>} 搜索结果。
 */
exports.main = async (event) => {
  const keyword = (event.keyword || "").trim();
  const { OPENID } = cloud.getWXContext();

  if (!keyword) {
    return {
      scenicResults: [],
      restaurantResults: [],
    };
  }

  const [scenicResults, restaurantResponse, userCheckins] = await Promise.all([
    searchScenicSpots(keyword),
    searchRestaurants(keyword).catch((error) => ({
      status: -1,
      message: error.message || "饭店搜索失败",
      data: [],
    })),
    loadUserCheckins(OPENID),
  ]);

  const checkinMap = userCheckins.reduce((accumulator, item) => {
    accumulator[`${item.placeType}:${item.placeId}`] = item;
    return accumulator;
  }, {});

  return {
    scenicResults: scenicResults.map((item) => {
      const matchedCheckin = checkinMap[`scenic:${item._id}`];
      return {
        ...item,
        placeId: item._id,
        placeName: item.name,
        placeType: "scenic",
        checked: Boolean(matchedCheckin),
        note: matchedCheckin ? matchedCheckin.note : "",
        source: "scenic_spots",
      };
    }),
    restaurantResults: (restaurantResponse.data || []).map((item) => {
      const matchedCheckin = checkinMap[`restaurant:${item.id}`];
      return {
        placeId: item.id,
        placeName: item.title,
        placeType: "restaurant",
        category: "restaurant",
        address: item.address,
        district: item.ad_info ? item.ad_info.district : "",
        location: {
          latitude: item.location ? item.location.lat : 0,
          longitude: item.location ? item.location.lng : 0,
        },
        checked: Boolean(matchedCheckin),
        note: matchedCheckin ? matchedCheckin.note : "",
        source: "tencent_map",
      };
    }),
    restaurantError:
      restaurantResponse.status === 0 ? "" : restaurantResponse.message || "饭店搜索失败",
  };
};
