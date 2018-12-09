/************
 * 用户相关操作函数 *
 ************/

const userSchema = require('../model/user');

class UserController {
    /**
     * @name   regist
     * @author felix
     * @desc   注册用户信息
     * @param  {[type]}  req [description]
     * @param  {[type]}  res [description]
     * @return {Promise}     [description]
     */
    async regist(req, res) {
        const body = req.body;
        const newUser = await userSchema({
            sex: body.sex,
            phone: body.phone,
            nickname: body.nickname
        }).save();
        this.end(res, 200, newUser, 'application/json;charset=utf8');
    }
    /**
     * @name   end
     * @author felix
     * @desc   请求返回
     * @param  {[type]}  res         [description]
     * @param  {[type]}  statusCode  [description]
     * @param  {[type]}  data        [description]
     * @param  {[type]}  contentType [description]
     * @return {Promise}             [description]
     */
    async end(res, statusCode, data, contentType) {
        const dataStr = JSON.stringify(data);
        res.writeHead(statusCode, {
           'Content-Length': Buffer.byteLength(dataStr),
            'Content-Type': contentType
        })
       res.write(dataStr);
       res.end();
    }
}

module.exports = UserController;
