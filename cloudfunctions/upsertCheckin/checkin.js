/**
 * 根据现有记录和输入载荷构造新增或更新数据。
 * @param {Object | null} existingRecord 已存在的打卡记录。
 * @param {Object} input 前端传入的打卡载荷。
 * @param {string} checkedAt 打卡时间。
 * @returns {{ mode: string, docId?: string, data: Object }} 变更描述。
 */
function buildCheckinMutation(existingRecord, input, checkedAt) {
  const data = {
    openid: input.openid,
    placeId: input.placeId,
    placeType: input.placeType,
    placeName: input.placeName,
    district: input.district || "",
    location: input.location || null,
    note: input.note || "",
    checkedAt,
    source: input.source || "unknown",
  };

  if (existingRecord && existingRecord._id) {
    return {
      mode: "update",
      docId: existingRecord._id,
      data,
    };
  }

  return {
    mode: "create",
    data,
  };
}

module.exports = {
  buildCheckinMutation,
};
