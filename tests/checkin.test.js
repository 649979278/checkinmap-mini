const test = require("node:test");
const assert = require("node:assert/strict");

const {
  buildCheckinMutation,
} = require("../cloudfunctions/upsertCheckin/checkin");

test("buildCheckinMutation 在已有记录时返回更新载荷", () => {
  const existingRecord = {
    _id: "existing-id",
    openid: "user-1",
    placeId: "s1",
    placeType: "scenic",
    note: "旧备注",
  };
  const input = {
    openid: "user-1",
    placeId: "s1",
    placeType: "scenic",
    placeName: "天坛公园",
    district: "东城区",
    location: { latitude: 39.88, longitude: 116.41 },
    note: "新备注",
    source: "scenic_spots",
  };

  const result = buildCheckinMutation(existingRecord, input, "2026-04-10T10:00:00.000Z");

  assert.equal(result.mode, "update");
  assert.equal(result.docId, "existing-id");
  assert.equal(result.data.note, "新备注");
  assert.equal(result.data.checkedAt, "2026-04-10T10:00:00.000Z");
});
