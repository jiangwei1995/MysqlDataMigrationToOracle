var express = require('express');
var _ = require('lodash');
var async = require('async');
var Promise = require('bluebird');
var process = require('child_process');
var mysqlPool = require('./mysqlPool');

//一次导出一个表一部分数据
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

//打包csv文件夹中的所有.bak结尾的文件
this.compressCsv = function(){
  return new Promise(function(resolve,reject){
    process.exec(`tar -cvf csv.tar csv/*.bak`,
      function(error, stdout, stderr){
        if(error !== null) {
          console.log('exec error: ' + error);
          reject(500);
        }
        console.log("成功压缩文件列表\n",stdout);
        resolve(200);
    });
  })
}
//将文件上次之服务器 配置在config.json文件
this.scpCsvToServer = function(){
  var config = require('./config');
  return new Promise(function(resolve,reject){
    process.exec(`scp -P ${config.server.port} ${config.server.from} ${config.server.userName}@${config.server.host}:${config.server.to}`,
      function(error, stdout, stderr){
        if(error !== null) {
          console.log('exec error: ' + error);
          reject(500);
        }
        resolve(200);
    });
  })
}

//生成导出需要的json文件
this.generateJson = function(sql){
  return new Promise(function(resolve,reject){
    mysqlPool.poolQuery(sql).then(function(result){
      resolve(result);
    },function(err){
      reject(err);
    });
  })
}
//一次导出一个表所有数据
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
//通过sed 替换所有的“NULL”成空
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
exports.compressCsv = this.compressCsv;
exports.scpCsvToServer = this.scpCsvToServer;
exports.exportCsv = this.exportCsv;
exports.fullDataExportCsv= this.fullDataExportCsv;
exports.generateJson= this.generateJson;
