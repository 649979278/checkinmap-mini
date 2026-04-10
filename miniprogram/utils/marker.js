const MARKER_ICON_PATHS = {
  park: "/images/markers/park.png",
  landmark: "/images/markers/landmark.png",
  area: "/images/markers/landmark.png",
  checked: "/images/markers/checked.png",
};

/**
 * 将地点定位字段标准化为小程序 map 组件所需的经纬度。
 * @param {Object} location 地点定位对象。
 * @returns {{ latitude: number, longitude: number }} 标准化经纬度。
 */
function normalizeLocation(location = {}) {
  return {
    latitude: Number(location.latitude || location.lat || 0),
    longitude: Number(location.longitude || location.lng || 0),
  };
}

/**
 * 为地点生成对应的 marker 图标路径。
 * @param {Object} place 地点对象。
 * @returns {string} marker 图标路径。
 */
function resolveMarkerIcon(place) {
  if (place.checked) {
    return MARKER_ICON_PATHS.checked;
  }
  return MARKER_ICON_PATHS[place.category] || MARKER_ICON_PATHS.landmark;
}

/**
 * 将景点与已打卡饭店转换为地图 marker 数据。
 * @param {Array} scenicSpots 景点列表。
 * @param {Array} checkedRestaurants 已打卡饭店列表。
 * @returns {{ markers: Array, markerMap: Object }} marker 数组与映射表。
 */
function createMapMarkers(scenicSpots = [], checkedRestaurants = []) {
  const markerMap = {};
  let markerId = 1;

  const places = []
    .concat(
      scenicSpots.map((spot) => ({
        ...spot,
        placeId: spot._id || spot.placeId,
        placeName: spot.name || spot.placeName,
        placeType: spot.placeType || "scenic",
      }))
    )
    .concat(
      checkedRestaurants.map((restaurant) => ({
        ...restaurant,
        placeId: restaurant.placeId || restaurant._id,
        placeName: restaurant.placeName || restaurant.name,
        placeType: "restaurant",
        checked: true,
      }))
    );

  const markers = places
    .map((place) => {
      const location = normalizeLocation(place.location);
      if (!location.latitude || !location.longitude) {
        return null;
      }
      const currentMarkerId = markerId++;
      const marker = {
        id: currentMarkerId,
        latitude: location.latitude,
        longitude: location.longitude,
        width: 28,
        height: 28,
        iconPath: resolveMarkerIcon(place),
        callout: {
          content: place.placeName,
          color: "#1f2937",
          fontSize: 11,
          borderRadius: 8,
          bgColor: "#ffffff",
          padding: 6,
          display: "BYCLICK",
        },
      };
      markerMap[currentMarkerId] = {
        ...place,
        location,
      };
      return marker;
    })
    .filter(Boolean);

  return {
    markers,
    markerMap,
  };
}

module.exports = {
  MARKER_ICON_PATHS,
  createMapMarkers,
  normalizeLocation,
  resolveMarkerIcon,
};
