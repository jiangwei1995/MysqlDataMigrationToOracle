var mysql = require('mysql');
var Promise = require('bluebird');
var config = require('./config');
var conn = mysql.createConnection({
    host: config.mysql.host,
    user: config.mysql.userName,
    password: config.mysql.password,
    database:'information_schema',
    port: config.mysql.post
});
this.pool = mysql.createPool(
    {
      host: config.mysql.host,
      user: config.mysql.userName,
      password: config.mysql.password,
      database:'information_schema',
      port: config.mysql.post,
    }
);
var em = this;
this.poolQuery= function(sql){
  return new Promise(function(resolve,reject){
    em.pool.getConnection(function(err, connection) {
           if (err) reject(err);
           connection.query(sql, function(err, rows) {
               if (err) reject(err);
                 resolve(rows);
           });
           //回收pool
           connection.release();
       });
  })
}

this.query = function(sql){
  return new Promise(function(resolve,reject){
    conn.connect();
    conn.query(sql, function(err, rows, fields) {
      if (err) throw err;
          conn.end();
          resolve(rows);
       });

  })
}
exports.poolQuery = this.poolQuery;
exports.query = this.query;
exports.pool = this.pool;
