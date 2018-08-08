'use strict';
const mysql = require('mysql');

const connection_config = {
    host: '101.37.24.216',
    port: '3306',
    user: 'ksbao',
    password: 'ksbaotest',
    database: 'yt_wxexam_db',
    connectionLimit: 10,
    dateStrings: true,
    multipleStatements: true
};

var pool = mysql.createPool(connection_config);


module.exports = {
    Query:function(sql, params) {
        return new Promise(function(resolve, reject) {
            pool.getConnection(function(err, connection){
                console.log(mysql.format(sql,params))
                connection.query(sql, params,function(error, rows){
                    connection.release();
                    if (error) reject({ code: -1000, message: '数据操作异常.', datas: error });
                    else resolve(JSON.parse(JSON.stringify(rows)));
                });
            });
        });
    },
    ExecuteNonQuery:function (sql, params){
        return new Promise(function(resolve, reject) {
            pool.getConnection(function(err, connection){
                connection.query(sql, params, function(error, rows){
                    connection.release();
                    if (error) reject({ code: -1000, message: '数据操作异常.', datas: error });
                    else resolve(rows.affectedRows);
                });
            });
        });
    },
    ExecuteTransaction:function(sql, params) {
        return new Promise(function(resolve, reject){
            pool.getConnection(function(err, connection) {
                connection.beginTransaction(function(){
                    connection.query(sql, params,function(error, rows){
                        connection.release();
                        if (error) connection.rollback(function(){ reject({ code: -1000, message: '数据操作异常,事务回滚.', datas: error }); });
                        connection.commit(function(err) {
                            if (err) connection.rollback(function() { reject({ code: -1000, message: '数据操作异常,事务回滚.', datas: err }); });
                            resolve(rows.affectedRows);
                        });
                    });
                });
            });
        });
    },
    ExecuteIgnoreError:function (sql, params)  {
        return new Promise(function(resolve, reject)  {
            pool.getConnection(function(err, connection)  {
                connection.query(sql, params,function(error, rows)  {
                    connection.release();
                    if (error) resolve(0);
                    else resolve(rows.affectedRows);
                });
            });
        });
    },
    InsertAutoIncrement: function (sql, params) {
        return new Promise(function(resolve, reject) {
            pool.getConnection(function(err, connection){
                connection.query(sql, params, function(error, rows) {
                    connection.release();
                    if (error) reject({ code: -1000, message: '数据操作异常.', datas: error });
                    else resolve(rows.insertId);
                });
            });
        });
    }
}