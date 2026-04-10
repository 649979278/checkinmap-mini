/**
 * 根据地点对象格式化展示文案。
 * @param {Object} place 地点对象。
 * @returns {string} 详情头部文案。
 */
function formatPlaceSubtitle(place = {}) {
  const placeTypeLabel = place.placeType === "restaurant" ? "饭店" : "景点";
  const categoryLabelMap = {
    park: "公园",
    landmark: "名胜",
    area: "区域",
    restaurant: "饭店",
  };
  const categoryLabel =
    categoryLabelMap[place.category] || categoryLabelMap[place.placeType] || "地点";
  return [placeTypeLabel, categoryLabel, place.district].filter(Boolean).join(" · ");
}

module.exports = {
  formatPlaceSubtitle,
};
