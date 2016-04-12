var express = require('express');
var _ = require('lodash');
var async = require('async');
var Promise = require('bluebird');
var process = require('child_process');
var max_table_name = require('./min_table_name');
var exportTools = require('./exportTools');
var importTools = require('./importTools');
//var app = express();
//app.listen(1337);
var number = 10;
// app.get('/', function (req, res) {
//   console.time("marker-elements");
//   var tasks =  _.reduce(returnArrData("IM_SALEOUT",1892913),function(mome,item){
//     mome.push(returnPromiseArr(item.tableName, item.start, number, item.csvName));
//     return mome;
//   },[]);
//   Promise.all(tasks).then(function(result){
//     console.timeEnd("marker-elements");
//     res.send(result);
//   });
// })
console.time("exec-date");
importTools.importCsv("im_sale").then(function(result){
  console.log(result);
console.timeEnd("exec-date");
});
function start(){
  console.time("exec-date");
  var tasks =  _.reduce(returnArrData("IM_SALESUMDATA",40),function(mome,item){
    mome.push(exportTools.exportCsv(item.tableName, item.start, number, item.csvName));
    return mome;
  },[]);
  Promise.all(tasks).then(function(result){

    console.log(result);
    console.timeEnd("exec-date");
    //res.send(result);
  });
}

function start1(){
  console.time("exec-date");
  var tasks =  _.reduce(returnArrData("IM_SALEOUT",1892913),function(mome,item){
    mome.push(exportTools.exportCsv(item.tableName, item.start, number, item.csvName));
    return mome;
  },[]);
  Promise.all(tasks).then(function(result){

    console.log(result);
    console.timeEnd("exec-date");
    //res.send(result);
  });
}

function returnArrData(tableName,tableSum){
  return _.reduce(new Array(Math.ceil(tableSum/number)),function(mome, item, index){
    var start = number*index;
    var end = number*(index+1);
    mome.push({"tableName":tableName, "start":start, "end":end, "csvName":"csv/"+tableName + "-" + start + "-" + end + ".csv"});
    return mome;
  },[])
}
// function returnPromiseArr(tablename,start,number,csvname){
//   console.log('mysql -h 192.168.0.200 -u root --password=eteng ctrm_develop -A -ss -e "SELECT * from '+tablename+' limit '+start+','+  number +';" | sed \'s/\\t/","/g;s/^/"/;s/$/"/;s/\\n//g\' >> csv/'+csvname);
//   return new Promise(function (resolve, reject) {
//     process.exec('mysql -h 192.168.0.200 -u root --password=eteng ctrm_develop -A -ss -e "SELECT * from '+tablename+' limit '+start+','+ number +';" | sed \'s/\\t/","/g;s/^/"/;s/$/"/;s/\\n//g\' >> csv/'+csvname,
//       function(error, stdout, stderr){
//         if (error !== null) {
//           console.log('exec error: ' + error);
//           reject(tablename+"500");
//         }
//         console.log(csvname);
//         //filterEmpty(csvname);
//         resolve(tablename+"200");
//     });
//   });
// }
// function filterEmpty(csvname){
//     process.exec('sed \'s/"NULL"//g\' csv/'+ csvname +' > csv/'+ csvname +'.bak',
//       function(error, stdout, stderr){
//         if (error !== null) {
//
//         }
//         console.log(csvname,"过滤空后文件名为",csvname, ".bak");
//       })
// }
// function exportCsv(tableName,tableSum){
//   return new Promise(function (resolve, reject) {
//     process.exec('mysql -h 192.168.0.200 -u root --password=eteng ctrm_develop -A -ss -e "SELECT * from '+tableName+';" | sed \'s/\\t/","/g;s/^/"/;s/$/"/;s/\\n//g\' > csv/'+tableName+'.csv',
//       function(error, stdout, stderr){
//         if (error !== null) {
//           console.log('exec error: ' + error);
//           reject(tableName+"500");
//         }
//         console.log(tableName);
//         resolve(tableName+"200");
//     });
//   });
//
// }
//start();
