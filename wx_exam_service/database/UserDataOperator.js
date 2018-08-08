'use strict';
var mysql = require('./MysqlHelper');

module.exports = {
    selectUserInfoByName: function (username, callback) {
        var buffer = [];
        buffer.push('SELECT * FROM `user` ');
        buffer.push('WHERE `UserName` = ? ;');
        mysql.Query(buffer.join(''), [username], callback);
    }
}