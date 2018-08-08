'use strict';
var express = require('express');
var router = express.Router();
var request = require('request');
var testInfo = require('../service/testInfo');
var fs = require('fs');
var path = require('path');
var AppID='wx7b00870d78234758';
var AppSecret='eabbbd243acc6fa709b85d4608cbd6a5';
var mkdirSync = function (paths) {
    if (fs.existsSync(paths)) {
        return true;
    } else {
        if (mkdirSync(path.dirname(paths))) {
            fs.mkdirSync(paths);
            return true;
        }
    }
};
var emptyDir = function(fileUrl){

    var files = fs.readdirSync(fileUrl);//读取该文件夹

    files.forEach(function(file){

        var stats = fs.statSync(fileUrl+'/'+file);

        if(stats.isDirectory()){

            emptyDir(fileUrl+'/'+file);

        }else{

            fs.unlinkSync(fileUrl+'/'+file);

            console.log("删除文件"+fileUrl+'/'+file+"成功");

        }

    });

}
router.post('/getCodeUrl', function (req, res) {
    var _host=req.headers.host;
    if(_host==='wxinfoapi.tibosi.com'){
        _host='https://'+_host
    }else if(_host==='127.0.0.1:2009'){
        _host='http://'+_host
    }else{
        res.send({status:201,msg:'无效地址'})
    }
    var examId=req.body.examId*1||0;
    if(!examId){ res.send({status:201,msg:'参数examId缺失，无法生成二维码'})}
    var qr_codeUrl='./public/code_img';
    //mkdirSync(qr_codeUrl)//生成文件目录
    emptyDir(qr_codeUrl)//删除文件目录下所有的文件
    var getTokenUrl='https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid='+AppID+'&secret='+AppSecret;
    request(getTokenUrl, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          var access_token = JSON.parse(body).access_token;
            var _url='https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token='+access_token
            var params={
                "scene":examId,
                "page":"pages/share/share",
                "width":200,
                "auto_color":true
            }
            var imgName=new Date().getTime()+'.jpg'
            request.post(_url, {form:JSON.stringify(params)},function(error, response, body) {
                if (!error && response.statusCode == 200) {
                    res.send({status:200,msg:'操作成功',data:{url:_host+'/code_img/'+imgName}});
                }else{
                    res.send({status:201,msg:'操作失败'});
                }
            }).pipe(fs.createWriteStream(qr_codeUrl+'/'+imgName));

        }
    })

});
router.post('/getOpenId', function (req, res) {
    var loginCode=req.body.loginCode
    console.log('loginCode:'+loginCode)
    console.log('AppId:'+AppID)
    var openIdUrl='https://api.weixin.qq.com/sns/jscode2session?appid='+AppID+'&secret='+AppSecret+'&js_code='+loginCode+'&grant_type=authorization_code'
    request(openIdUrl, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log('loginCode2:'+body)
            var _logCode=
          res.send({code:200,data:{openId:JSON.parse(body).openid}})
        }
    })

})
router.post('/setTestInfo', function (req, res) {
    var handler = new testInfo();
    handler.setTestInfo(req.body.openId,req.body.userData,req.body.examId,req.body.examName,req.body.beginTime,req.body.endTime).then(function (result) {
        res.setHeader('Content-Type', 'application/json;charset=utf-8');
        res.send(result);
    });
})
router.post('/getTestInfo', function (req, res) {
    var handler = new testInfo();
    handler.getTestInfo(req.body.openId).then(function (result) {
        res.setHeader('Content-Type', 'application/json;charset=utf-8');
        res.send(result);
    });
})

module.exports = router;