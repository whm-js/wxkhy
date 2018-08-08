'use strict';
var express = require('express');
var router = express.Router();
var userInfo = require('../service/UserInfo');
var passport = require('passport');



router.post('/', function (req, res, next) {
    //userInfo.loginIp=req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress ||req.connection.socket.remoteAddress;
    passport.authenticate('local', function (error, user, info) {
        res.setHeader('Content-Type', 'application/json;charset=utf-8');
        if (!user) {
            return res.send({ code: info.code, message: info.message, datas: {} });
        }
        req.logIn(user, function () {
            var url = req.cookies.RETURN_URL ? req.cookies.RETURN_URL : '';
            return res.send({ code: 0, message: 'logIn.', datas: url });
        });
    })(req, res, next);
});

module.exports = router;