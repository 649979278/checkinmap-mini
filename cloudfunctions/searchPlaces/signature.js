const crypto = require("crypto");

/**
 * 按参数名升序返回参数键列表。
 * @param {Object} params 查询参数。
 * @returns {string[]} 升序参数键列表。
 */
function getSortedKeys(params) {
  return Object.keys(params).sort();
}

/**
 * 使用原始参数值生成签名源字符串中的查询字符串。
 * @param {Object} params 查询参数。
 * @returns {string} 原始查询字符串。
 */
function buildRawQueryString(params) {
  return getSortedKeys(params)
    .map((key) => `${key}=${params[key]}`)
    .join("&");
}

/**
 * 使用 URL 编码后的参数生成最终请求用查询字符串。
 * @param {Object} params 查询参数。
 * @returns {string} 编码后的查询字符串。
 */
function buildEncodedQueryString(params) {
  return getSortedKeys(params)
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join("&");
}

/**
 * 构建腾讯位置服务带 sig 的地点检索地址。
 * @param {Object} options 构建选项。
 * @param {string} options.endpointPath 请求路径。
 * @param {Object} options.params 查询参数。
 * @param {string} options.secretKey 腾讯位置服务 SK。
 * @returns {string} 最终请求地址。
 */
function buildSignedPlaceSearchUrl({ endpointPath, params, secretKey }) {
  const rawQueryString = buildRawQueryString(params);
  const encodedQueryString = buildEncodedQueryString(params);
  const source = `${endpointPath}?${rawQueryString}${secretKey}`;
  const sig = crypto.createHash("md5").update(source).digest("hex");
  return `https://apis.map.qq.com${endpointPath}?${encodedQueryString}&sig=${sig}`;
}

module.exports = {
  buildRawQueryString,
  buildEncodedQueryString,
  buildSignedPlaceSearchUrl,
};
