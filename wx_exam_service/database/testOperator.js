'use strict';
var mysql = require('./MysqlHelper');
module.exports = {
    selectTestInfo:function(openId,examId){
        var buffer = [];
        var paramsArr = [openId,examId];
        buffer.push('SELECT * FROM `test_info` ');
        buffer.push('WHERE WxId = ? ');
        if(examId){
            buffer.push(' AND ExamId=?');
            paramsArr.push(examId)
        }
        return  mysql.Query(buffer.join(''),paramsArr);
    },
    insertTestInfo: function (openId,nickName,examId,examName,visitTimes,beginTime,endTime) {
        var buffer = [];
        var paramsArr = [openId,nickName,examId,examName,visitTimes,beginTime,endTime];
        buffer.push('INSERT INTO `test_info` (WxId,NickName,ExamId,ExamName,VisitTimes,BeginTime,EndTime) VALUES (?,?,?,?,?,?,?) ');
        return mysql.InsertAutoIncrement(buffer.join(''),paramsArr);
    },
    updateTestInfo:function (openId,examId,updateInfo) {
        var buffer = [];
        var paramsArr = [openId,examId,openId];
        var updateArr = [];
        buffer.push('UPDATE `test_info`  SET ');
        for(var i in updateInfo){
            if(updateInfo[i]) updateArr.push(i+"='"+updateInfo[i]+"'");
        }
        buffer.push(updateArr.join(','));
        buffer.push(' WHERE  WxId = ? AND ExamId=?; ');
        buffer.push('UPDATE `test_info`  SET NickName="'+updateInfo.NickName+'" ');
        buffer.push(' WHERE  WxId = ? ');
        return mysql.Query(buffer.join(''),paramsArr);
    }
}