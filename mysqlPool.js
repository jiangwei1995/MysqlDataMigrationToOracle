var mysql = require('mysql');
var Promise = require('bluebird');
var conn = mysql.createConnection({
    host: '192.168.0.200',
    user: 'root',
    password: 'eteng',
    database:'information_schema',
    port: 3306
});
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
exports.query = this.query;
