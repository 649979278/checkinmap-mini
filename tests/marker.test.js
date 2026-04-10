const test = require("node:test");
const assert = require("node:assert/strict");

const {
  MARKER_ICON_PATHS,
  createMapMarkers,
} = require("../miniprogram/utils/marker");

test("createMapMarkers 根据地点类型和打卡状态选择 marker 图标", () => {
  const scenicSpots = [
    {
      _id: "s1",
      name: "天坛公园",
      category: "park",
      location: { latitude: 39.88, longitude: 116.41 },
      checked: false,
      placeType: "scenic",
    },
    {
      _id: "s2",
      name: "故宫博物院",
      category: "landmark",
      location: { latitude: 39.92, longitude: 116.40 },
      checked: true,
      placeType: "scenic",
    },
  ];
  const checkedRestaurants = [
    {
      placeId: "r1",
      placeName: "局气",
      category: "restaurant",
      location: { latitude: 39.99, longitude: 116.33 },
      checked: true,
      placeType: "restaurant",
    },
  ];

  const { markers, markerMap } = createMapMarkers(scenicSpots, checkedRestaurants);

  assert.equal(markers.length, 3);
  assert.equal(markers[0].iconPath, MARKER_ICON_PATHS.park);
  assert.equal(markers[1].iconPath, MARKER_ICON_PATHS.checked);
  assert.equal(markers[2].iconPath, MARKER_ICON_PATHS.checked);
  assert.equal(markerMap[markers[2].id].placeType, "restaurant");
});
