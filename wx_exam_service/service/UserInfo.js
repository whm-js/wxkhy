'use strict';
var crypto = require('crypto');
var dbo = require('../database/UserDataOperator');


module.exports = function () {

    // 用户登录.
    this.UserLogin = function (userName, password, callback) {
        var username =  userName || '', pwd = password || '';
        if (!username) {
            callback({ code: -1002, message: '缺少账号.', datas: {} });
            return;
        }
        if (!pwd) {
            callback({ code: -1002, message: '缺少密码.', datas: {} });
            return;
        }
        dbo.selectUserInfoByName(username, function (result) {
            if (result.code === 0) {
                if (result.datas.length === 0) {
                    callback({ code: -1003, message: '账号或密码错误！', datas: {} });
                } else {
                    var user = result.datas[0];
                        // if (user.PassWord === crypto.createHash('sha1').update(new Buffer(pwd, 'base64').toString(), 'utf8').digest('hex')) {
                        //         callback({ code: 0, message: '操作完成.', datas: user });
                        // }
                    if (user.PassWord === pwd) {
                        callback({ code: 0, message: '操作完成.', datas: user });
                    }
                        else callback({ code: -1004, message: '账号或密码错误！', datas: {} });
                }
            } else {
                callback({ code: -1000, message: '数据操作异常.', datas: {} });
            }
        });
    };
}