const test = require("node:test");
const assert = require("node:assert/strict");

const {
  DISTRICT_LIST,
  buildDistrictProgress,
} = require("../miniprogram/utils/progress");

test("buildDistrictProgress 统计每个区已打卡景点数量", () => {
  const scenicSpots = [
    { _id: "s1", district: "东城区" },
    { _id: "s2", district: "东城区" },
    { _id: "s3", district: "海淀区" },
  ];
  const checkins = [
    { placeId: "s1", placeType: "scenic" },
    { placeId: "s3", placeType: "scenic" },
    { placeId: "r1", placeType: "restaurant" },
  ];

  const result = buildDistrictProgress(scenicSpots, checkins);

  assert.equal(result.length, DISTRICT_LIST.length);
  assert.deepEqual(result.find((item) => item.key === "dongcheng"), {
    key: "dongcheng",
    name: "东城区",
    checkedCount: 1,
    totalCount: 2,
  });
  assert.deepEqual(result.find((item) => item.key === "haidian"), {
    key: "haidian",
    name: "海淀区",
    checkedCount: 1,
    totalCount: 1,
  });
});
