/*******************************
 * @description 通用工具文件
 ******************************/

const crypto = require('crypto');
const redis = require('./redis');
const magicConf = require('../utils/magicValue');
const code = magicConf.statusCode;
const magicValue = magicConf.common;

class Tool {
  /**
   * @name      encrypt
   * @author    felix
   * @function  传入明文，算法，编码，生成密文
   * @param     {[type]} clearText   [需要加密的明文]
   * @param     {[type]} algorithm   [加密算法]
   * @param     {[type]} encodingIn  [明文的编码]
   * @param     {[type]} encodingOut [密文的编码]
   * @return    {[type]}             [密文]
   */
   encrypt(clearText, algorithm, encodingIn, encodingOut) {
     const cipher = crypto.createCipher(algorithm, magicValue.pwdCipherKey);
     let encrypted = cipher.update(clearText, encodingIn, encodingOut);
     encrypted += cipher.final(encodingOut);
     return encrypted;
  }

  /**
   * @name      decrypt
   * @author    felix
   * @function  传入密文，算法，编码，解成明文
   * @param     {[type]} clearText   [需要加密的明文]
   * @param     {[type]} algorithm   [解密算法]
   * @param     {[type]} encodingIn  [密文的编码]
   * @param     {[type]} encodingOut [名文的编码]
   * @return    {[type]}             [明文]
   */
   decrypt(cipherText, algorithm, encodingIn, encodingOut) {
     const decipher = crypto.createDecipher(algorithm, magicValue.pwdCipherKey);
     let decrypted = decipher.update(cipherText, encodingIn, encodingOut);
     decrypted += decipher.final(encodingOut);
     return decrypted;
  }

  /**
 * @name generateToken
 * @author felix
 * @function 传入需要存入token的认证信息，生成加密的token
 * @param  {[type]} authData [认证信息]
 * @return {[type]}          [加密token]
 */
 async generateToken(authData) {
   const clearData = JSON.stringify(authData);
   const token = this.encrypt(clearData, magicValue.tokenAlg, magicValue.utf8Encode,
     magicValue.hexEncode, magicValue.redisCipherKey);
     // 将token存入redis，覆盖上次生成未过期的token
   await redis.hsetAsync(magicValue.redisCipherKey, authData.userId, token);
   // 设置redis过期时间
   await redis.expireAsync(authData.userId, magicValue.redisExp);
   return token;
}

   /**
    * @name checkToken
    * @author felix
    * @function 校验token中间件
    * @param  {[type]}   ctx  [description]
    * @param  {Function} next [description]
    * @return {Promise}       [description]
    */
   async checkToken(token, socket, next) {
     if (!token) {
       // 若socket已连接时，token失效则断开连接
       socket.disconnect(true);
       next(new Error('token invalid'));
       return;
     }
     // 解密出token中的认证信息
     let authData = this.decrypt(token, magicValue.tokenAlg, magicValue.hexEncode,
       magicValue.utf8Encode, magicValue.redisCipherKey);
     authData =  JSON.parse(authData);

     // 根据token中的userId，在redis中获取对应的token
     const tokenInRedis = await redis.hgetAsync(magicValue.redisCipherKey,
       authData.userId);
     // token不存在于redis中，则token失效
     if (!tokenInRedis) {
       // 若socket已连接时，token失效则断开连接
       socket.disconnect(true);
       next(new Error('token invalid'));
       return;
     }
     next();
   }

   /**
    * @name parseToken
    * @author felix
    * @description 解析token中的信息
    * @param  {[type]} token [description]
    * @return {[type]} authData [token中的认证信息]
    */
   parseToken(token){
     // 解密出token中的认证信息
     let authData = this.decrypt(token, magicValue.tokenAlg, magicValue.hexEncode,
       magicValue.utf8Encode, magicValue.redisCipherKey);
     authData =  JSON.parse(authData);
     return authData;
   }
}

module.exports = Tool;
