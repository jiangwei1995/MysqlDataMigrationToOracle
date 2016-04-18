var express = require('express');
var _ = require('lodash');
var async = require('async');
var Promise = require('bluebird');
var process = require('child_process');
var exportTools = require('./exportTools');
var importTools = require('./importTools');
var config = require('./config.json');
var fs = require('fs');
var tableArr = require('./exportTableName');
var number = 100;

// 生成csv文件
function start(){
  console.time("exec-date");
  var tasks = _.reduce(tableArr,function(tmp,parent){
    var itemTasks =  _.reduce(returnArrData(parent.tableName,parent.sumLine),function(itemMome,item){
      itemMome.push(exportTools.exportCsv(item.tableName, item.start, number, item.csvName));
      return itemMome;
    },[]);
    tmp.push(itemTasks);
    return tmp;
  },[]);
  console.log(_.flatten(tasks).length);
  Promise.all(_.flatten(tasks)).then(function(result){
    console.log(result);
    console.timeEnd("exec-date");
  });
}

function start1(){
  console.time("exec-date");
  var tasks =  _.reduce(returnArrData("IM_SALEOUT",10000),function(mome,item){
    mome.push(exportTools.exportCsv(item.tableName, item.start, number, item.csvName));
    return mome;
  },[]);
  Promise.all(tasks).then(function(result){

    console.log(result);
    console.timeEnd("exec-date");
  });
}
//将一个表拆成多个文件 返回数据数组
function returnArrData(tableName,tableSum){
  return _.reduce(new Array(Math.ceil(tableSum/number)),function(mome, item, index){
    var start = number*index;
    var end = number*(index+1);
    mome.push({"tableName":tableName, "start":start, "end":end, "csvName":`csv/${tableName}-${start}-${end}.csv`});
    return mome;
  },[])
}
//生成导出需要的json文件
function generateExportJson(){
  exportTools.generateJson(`select UPPER(table_name) as tableName,table_rows as sumLine from tables where TABLE_SCHEMA = '${config.mysql.dbName}'  and table_rows>100000 order by sumLine DESC;`).then(function(result){
    fs.writeFile('exportTableName.json',JSON.stringify(result,null,4),function(err){
      if (err) throw err;
      console.log("generateJson-Scuess");
    })
  })
}
//生成导入需要的json 内容包含 表名，列名
function generateImportJson(){
  exportTools.generateJson("select UPPER(table_name) as tableName,GROUP_CONCAT(DISTINCT column_name ORDER BY ORDINAL_POSITION ASC) as columns from information_schema.columns  where TABLE_name in  (select table_name from information_schema.tables  where TABLE_SCHEMA = 'ctrm_develop' and table_rows>100000 ) group by table_name ;").then(function(result){
    fs.writeFile('importTableName.json',JSON.stringify(result,null,4),function(err){
      if (err) throw err;
      console.log("generateJson-Scuess");
      generateImportJsonFiles();
    })
  })
}
//重新生成导入需要的json 内容添加了文件名数组
function generateImportJsonFiles(){
  var importTableArr = require('./importTableName');
  fs.readdir('csv/',function(err,files){
    var newArr =   _.reduce(importTableArr,function(mome,item){
        var arr = indexOfToArr(files,item.tableName);
        item['files'] = arr;
        mome.push(item);
        return mome;
      },[])
    fs.writeFile('importTableName.json',JSON.stringify(newArr,null,4),function(err){
      if (err) throw err;
      console.log("generateJson-Scuess");
    })
  })
}
//一个数组每个元素中查找 str，把不包含换素删除，返回结果为数组
function indexOfToArr(arr,str){
  return _.reduce(arr,function(mome,item){
    if(item.indexOf(str+"-")>-1&&item.lastIndexOf('.bak')>-1){
      mome.push(item);
    }
    return mome;
  },[])
}
//生成导入需要的ctl文件
function generateCtl(){
  var importTableArr = require('./importTableName');
  for (var i = 0; i < importTableArr.length; i++) {
    importTools.generateSrcipt(importTableArr[i].tableName,importTableArr[i].columns,importTableArr[i].files)
  }
}

function executeCtl(){
   console.log("files");
   fs.readdir('ctl/',function(err,files){
     var tasks = _.reduce(files,function(mome,file){
       mome.push(importTools.executeSrcipt(`ctl/${file}`));
       return mome;
     },[]);
     Promise.all(tasks).then(function(result){
       console.log(result);
     })
   })
}
//start();
//generateExportJson();
//generateImportJson();
//generateCtl();
//executeCtl();
exports.a = executeCtl;
