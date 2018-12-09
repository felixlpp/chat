/**********************************
 * @descroption 通用配置项
***********************************/
const common = {
  hexEncode: "hex",
  utf8Encode: "utf8",
  tokenAlg: "aes192",       // token加密算法
  redisExp: 60 * 60 * 24,   // redis过期时间
  redisCipherKey: "qazwsx", // token加密秘钥
  pwdCipherKey: "qazwsx",   // 密码加密秘钥
  delayTime: 3000,          // setTimeout延迟时间
}

/**
 * 状态码
 * @type {Object}
 */
const statusCode = {
  paramsError: 4000, // 参数错误
  notExist: 4001,    // 资源不存在
  existed: 4002,     // 资源已存在
  authFail: 4003,    // 认证失败
  serverError: 5000, // 服务器错误
}
module.exports = {
  common,
  statusCode
}
