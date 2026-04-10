/**
 * 返回北京城六区的固定配置，供首页统计与筛选使用。
 */
const DISTRICT_LIST = [
  { key: "dongcheng", name: "东城区" },
  { key: "xicheng", name: "西城区" },
  { key: "chaoyang", name: "朝阳区" },
  { key: "haidian", name: "海淀区" },
  { key: "fengtai", name: "丰台区" },
  { key: "shijingshan", name: "石景山区" },
];

/**
 * 根据行政区名称获取区级配置。
 * @param {string} districtName 行政区名称。
 * @returns {{ key: string, name: string } | undefined} 区级配置。
 */
function getDistrictByName(districtName) {
  return DISTRICT_LIST.find((item) => item.name === districtName);
}

module.exports = {
  DISTRICT_LIST,
  getDistrictByName,
};
