var _ = require('lodash');
var async = require('async');
var Promise = require('bluebird');
var process = require('child_process');
var fs = require('fs');
var iconv = require('iconv-lite');
var em = this;
exports.importCsv = function(tableName){

  return new Promise(function(resolve,reject){
    em.generateSrcipt(tableName).then(function(result){
      console.log(result);
      em.executeSrcipt(result).then(function(result){
        console.log(result);
        resolve(result);
      })
    })
  });
}

this.generateSrcipt = function(tableName,columns,files){
  return new Promise(function(resolve,reject){
    var fileName = `ctl/${tableName}.ctl`;
    var str ='load data \r';
          for (var i = 0; i < files.length; i++) {
             str += `infile 'csv/${files[i]}' \r`;
          }
          str += `append into table "${tableName}" \r`;
          str += 'fields terminated by \',\' \r';
          str += 'OPTIONALLY ENCLOSED BY \'"\'\r';
          str += 'TRAILING NULLCOLS \r';
          str +=`(${columns})`;

    var arr = iconv.encode(str, 'utf-8');
    fs.writeFile(fileName, arr, function(err){
          if(err){
            console.log("fail " + err);
            reject(fileName+"500");
          }
          console.log("写入文件ok");
          resolve(fileName);
      });
  })

}

this.executeSrcipt = function(ctlPath){
  return new Promise(function(resolve,reject){
    console.log('sqlldr etdj/etdj@etda control='+ctlPath+' direct=true');
    process.exec('sqlldr etdj/etdj@etda control='+ctlPath+' direct=true',
      function(error, stdout, stderr){
        if(error !== null) {
          console.log('exec error: ' + error);
          reject(ctlPath);
        }
         resolve(ctlPath);
    });
  })
}
exports.generateSrcipt = this.generateSrcipt;
exports.executeSrcipt = this.executeSrcipt;
