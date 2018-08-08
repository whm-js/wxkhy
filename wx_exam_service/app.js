'use strict';
/*var debug = r
equire('debug');*/
var express = require('express');
var partials = require('express-partials');
var session = require('express-session');

var path = require('path');
//var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var cors = require('cors');

//var resUtil = require('./lib/utils/res');


var app = express();
app.use(cors());
// view engine setup
app.set('views', path.join(__dirname, './views'));
app.engine('.html', require('ejs').__express);
app.set('view engine', 'html');
app.use(partials());

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({ secret: 'YINGEDU', resave: false, saveUninitialized: true }));

app.use(passport.initialize());
app.use(passport.session());

var apiValidate = require('api-validate');

passport.use(new LocalStrategy(
    function (username, password, done) {
        var UserInfo = require('./service/UserInfo');
        var handler = new UserInfo();
        handler.UserLogin(username, password,function (result) {
            if (result.code === 0) {
                var datas = result.datas, user = { id: datas.UserID, user_name: datas.UserName, real_name: datas.RealName, role: datas.UserRole, hospital_id: datas.HospitalID, course_id: datas.CourseID, department_id: datas.DepartmentID };
                return done(null, user);
            } else {
                return done(null, false, { code: -1, message: result.message, datas: null });
            }
        });
    }
));

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});

app.use(function (req, res, next) {
    if (req.method === 'GET') {
        if (/\/(downLoad|fonts|images|javascripts|stylesheets|pictures)\/(.*?)/g.test(req.url)) return next();
        switch (req.url) {
            case '/login': return res.render('./section/login', { layout: './engine/template-login-root' });
            case '/logout': res.clearCookie('RETURN_URL', { maxAge: 0, httpOnly: true, path: '/' }); return next();
            case '/':
                res.cookie('RETURN_URL', req.url, { maxAge: 1000 * 60 * 2, httpOnly: true, path: '/' });
                return req.isAuthenticated() ? next() : res.render('./section/login', { layout: './engine/template-login-root' });
            default: return next();
        }
    }
    return next();
});

app.use('/login', require('./routes/login'));
app.use('/test', require('./routes/test'));
/*app.use('/', require('./routes/index'));
app.use('/info', require('./routes/info'));
app.use('/template', require('./routes/template'));
app.use('/rotate-template', require('./routes/rotate-template'));
app.use('/plan', require('./routes/plan'));
app.use('/entry', require('./routes/entry'));
app.use('/rotate', require('./routes/rotate'));
app.use('/coachingDetail', require('./routes/coachingDetail'));
app.use('/exit', require('./routes/exit'));
app.use('/report', require('./routes/report'));
app.use('/annual', require('./routes/annual'));
app.use('/graduation', require('./routes/graduation'));
app.use('/hospital', require('./routes/hospital'));
app.use('/menu', require('./routes/menu'));
app.use('/upload', require('./routes/upload'));*/

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

//// development error handler
//// will print stacktrace
//if (app.get('env') === 'development') {
//    app.use(function (err, req, res, next) {
//        res.status(err.status || 500);
//        res.render('error', {
//            message: err.message,
//            error: err
//        });
//    });
//}

//// production error handler
//// no stacktraces leaked to user
//app.use(function (err, req, res, next) {
//    res.status(err.status || 500);
//    res.render('error', {
//        message: err.message,
//        error: err.data
//    });
//});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    err.code = 404;
    next(err);
});


//统一处理的服务器错误
/*
app.use(function (err, req, res, next) {
    if (typeof err === 'string') {
        return resUtil.sendError(res, err);
    }
    //参数异常
    if (err.code == apiValidate.ERROR_CODE) {
        return resUtil.sendError(res, err.message, resUtil.code.paramsError, err.data);
    } else if (err.code == 404) {
        //404错误
        return resUtil.sendError(res, err.message, 404, err.data);
    }

});
*/


app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error',{error:err});
});
app.set('port', process.env.PORT || 2009);

var server = app.listen(app.get('port'),'0.0.0.0');

