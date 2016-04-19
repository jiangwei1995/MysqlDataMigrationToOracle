var express = require('express');
var _ = require('lodash');
var async = require('async');
var Promise = require('bluebird');
var process = require('child_process');
var mysqlPool = require('./mysqlPool');

this.exportCsv = function(tableName,start,number,csvPath){
  return new Promise(function(resolve,reject){
    process.exec('mysql -h 192.168.0.200 -u root --password=eteng ctrm_develop -A -ss -e "SELECT * from '+tableName+' limit '+start+','+ number +';" | sed \'s/"/""/g;s/\\t/","/g;s/^/"/;s/$/"/;s/\\n//g\' > '+csvPath,
      function(error, stdout, stderr){
        if(error !== null) {
          console.log('exec error: ' + error);
          reject(csvPath);
        }
        fillerEmpty(csvPath).then(function(){
            resolve(csvPath);
        })
    });
  });
}

this.generateJson = function(sql){
  return new Promise(function(resolve,reject){
    mysqlPool.query(sql).then(function(result){
      resolve(result);
    },function(err){
      reject(err);
    });
  })
}

exports.fullDataExportCsv = function(tableName,csvPath){
  return new Promise(function(resolve,reject){
    process.exec('mysql -h 192.168.0.200 -u root --password=eteng ctrm_develop -A -ss -e "SELECT * from '+tableName+';" | sed \'s/"/""/g;s/\\t/","/g;s/^/"/;s/$/"/;s/\\n//g\' > '+csvPath,
      function(error, stdout, stderr){
        if (error !== null) {
          console.log('exec error: ' + error);
          reject(csvPath+"500");
        }
        resolve(csvPath+"200");
    });
  });
}

 function fillerEmpty(csvPath){
  return new Promise(function(resolve,reject){
    process.exec('sed \'s/"NULL"//g\' '+ csvPath +' > '+ csvPath +'.bak',
      function(error, stdout, stderr){
        if (error !== null) {
          reject(csvPath+"500");
        }
        console.log(csvPath,"过滤空后文件名为",csvPath+".bak");
        resolve(csvPath+"200");
      });
  })
}
exports.exportCsv = this.exportCsv;
exports.fullDataExportCsv= this.fullDataExportCsv;
exports.generateJson= this.generateJson;
