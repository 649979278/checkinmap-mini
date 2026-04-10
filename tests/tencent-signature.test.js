const test = require("node:test");
const assert = require("node:assert/strict");

const {
  buildSignedPlaceSearchUrl,
} = require("../cloudfunctions/searchPlaces/signature");

test("buildSignedPlaceSearchUrl 生成包含 sig 的检索地址", () => {
  const url = buildSignedPlaceSearchUrl({
    endpointPath: "/ws/place/v1/search",
    params: {
      boundary: "region(北京市,1)",
      keyword: "烤鸭",
      page_size: "8",
      key: "demo-key",
    },
    secretKey: "demo-sk",
  });

  assert.match(url, /^https:\/\/apis\.map\.qq\.com\/ws\/place\/v1\/search\?/);
  assert.match(url, /sig=/);
  assert.match(url, /keyword=%E7%83%A4%E9%B8%AD/);
});

test("buildSignedPlaceSearchUrl 在相同参数下生成稳定签名", () => {
  const first = buildSignedPlaceSearchUrl({
    endpointPath: "/ws/place/v1/search",
    params: {
      boundary: "region(北京市,1)",
      keyword: "火锅",
      page_size: "8",
      key: "demo-key",
    },
    secretKey: "demo-sk",
  });
  const second = buildSignedPlaceSearchUrl({
    endpointPath: "/ws/place/v1/search",
    params: {
      boundary: "region(北京市,1)",
      keyword: "火锅",
      page_size: "8",
      key: "demo-key",
    },
    secretKey: "demo-sk",
  });

  assert.equal(first, second);
});
