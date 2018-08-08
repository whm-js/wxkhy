var dbo = require('../database/testOperator');

var callbackTo=function (result) {
    if(typeof(result)==='string'||typeof(result)==='number'){
        return { code:200, message: '操作完成'};
    }else if (typeof(result)==='object'){
        if(!result.code){
            return { code:200, message: '操作完成'};
        }else{
            return result;
        }
    }
}
var throwErr=function (err) {
    console.log(err);
    return { code:301, message:err};
}
var getStatus=function(beginTime,endTime){
    var stat = 1;
    var _curTime = new Date().getTime();
    var _beginTime = new Date(beginTime).getTime();
    var _endTime = new Date(endTime).getTime();
    if(_curTime>_beginTime&&_curTime<_endTime){
        stat=2;
    }
    if(_curTime>_endTime) stat=3;
    return stat
}
var dateAnalysis=function (times) {
    var _times = new Date(times);

    var year = _times.getFullYear();
    var month = _times.getMonth()+1;
    var date = _times.getDate();
    var hours = _times.getHours();
    var minutes = _times.getMinutes();

    times = year+'-'+month+'-'+date+'  '+(hours>9?hours:'0'+hours)+':'+(minutes>9?minutes:'0'+minutes)
    if(!year){
        times=false;
    }
    return times;
}
module.exports = function () {
    this.getTestInfo=function(openId){
        var openId=openId||'',startTest=[],waitTest=[],endTest=[],testArr=[];
        return Promise.resolve().then(function(){
            if(!openId||openId==='')  return Promise.reject('参数openId缺失');
            return dbo.selectTestInfo(openId);
        }).then(function(result){
            if(result.length>0){
                for(var i=0;i<result.length;i++){
                    result[i].Status=getStatus(result[i].BeginTime,result[i].EndTime)
                    if(result[i].Status===1)waitTest.push( result[i]);
                    if(result[i].Status===2)startTest.push( result[i]);
                    if(result[i].Status===3)endTest.push( result[i]);
                }
            }
            testArr=startTest.concat(waitTest).concat(endTest);;
            return {code:200,message: '操作完成',data:testArr}
        }).then(function(result){
            return callbackTo(result);
        }).catch(function (err) {
            return throwErr(err);
        });
    }

    this.setTestInfo=function(openId,userData,examId,examName,beginTime,endTime){
        var openId=openId||'',userData=userData||'',examId=(examId*1)||0,examName=examName||'',beginTime=beginTime||'',endTime=endTime||'',nickName='';
        return Promise.resolve().then(function(){
            beginTime=dateAnalysis(beginTime);
            endTime=dateAnalysis(endTime);
            if(!openId||openId==='')  return Promise.reject('参数openId缺失');
            if(!examId)  return Promise.reject('参数examId缺失');
            if(examName==='')  return Promise.reject('参数examName无效');
            if(!beginTime)  return Promise.reject('参数beginTime无效');
            if(!endTime)  return Promise.reject('参数endTime无效');
            if(userData!==''){
                var dataJson=JSON.parse(userData)
                nickName=dataJson.nickName
            }
            return dbo.selectTestInfo(openId,examId);
        }).then(function(result){
            if(result.length===1){
                var visitTimes =result[0].VisitTimes+1;
                var updateInfo={WxId:openId,NickName:nickName,ExamId:examId,ExamName:examName,VisitTimes:visitTimes,BeginTime:beginTime,EndTime:endTime};
                return dbo.updateTestInfo(openId,examId,updateInfo);
            }else if(result.length===0){
                return dbo.insertTestInfo(openId,nickName,examId,examName,1,beginTime,endTime);
            }
        }).then(function(result){
            return callbackTo(result);
        }).catch(function (err) {
            return throwErr(err);
        });
    }
}