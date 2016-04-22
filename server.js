var express = require('express');
var _ = require('lodash');
var async = require('async');
var Promise = require('bluebird');
var process = require('child_process');
var exportTools = require('./exportTools');
var importTools = require('./importTools');
var config = require('./config.json');
var fs = require('fs');
var mysqlPool =require('./mysqlPool');
var number = 100;

// 生成csv文件
function start(){
  var tableArr = require('./exportTableName');
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

function exportCsv(){
  return new Promise(function(resolve,reject){
    var tableArr = require('./exportTableName');

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
      resolve(200);
    },function(err){
      reject(500);
    });
  })
}

function exportCsvToServer(){
  console.time("exec-date-sum");
   async.series({
     "task1":function(done){
       console.time("exec-date-task1");
       exportCsv().then(function(result){
         console.timeEnd("exec-date-task1");
         done(null,result)
       },function(err){
         done(err)
       });
     },
     "task2":function(done){
       console.time("exec-date-task2");
       exportTools.compressCsv().then(function(result){
        console.timeEnd("exec-date-task2");
         done(null,result)
       },function(err){
         done(err)
       })
     },
     "task3":function(done){
       console.time("exec-date-task3");
       exportTools.scpCsvToServer().then(function(result){
         console.timeEnd("exec-date-task3");
         done(null,result)
       },function(err){
         done(err)
       })
     }
   },function(err,result){
     console.log(result);
     console.timeEnd("exec-date-sum");
   })
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
function generateImportJsonA(){
  exportTools.generateJson("select UPPER(table_name) as tableName,GROUP_CONCAT(DISTINCT column_name ORDER BY ORDINAL_POSITION ASC) as columns from information_schema.columns  where TABLE_SCHEMA='ctrm_develop' and TABLE_name in  (select table_name from information_schema.tables  where TABLE_SCHEMA = 'ctrm_develop' and table_rows>100000 ) group by table_name ;").then(function(result){
    fs.writeFile('importTableName.json',JSON.stringify(result,null,4),function(err){
      if (err) throw err;
      console.log("generateJson-Scuess");
      generateImportJsonFiles();
    })
  })
}

function allColumns(callback){
     exportTools.generateJson("select UPPER(table_name) as tableName,GROUP_CONCAT(DISTINCT column_name ORDER BY ORDINAL_POSITION ASC) as columns from information_schema.columns  where TABLE_SCHEMA='ctrm_develop' and TABLE_name in  (select table_name from information_schema.tables  where TABLE_SCHEMA = 'ctrm_develop' and table_rows>100000 ) group by table_name ;").then(function(result){
       callback(null,result);
    },function(err){
      callback(err);
  })
}
function columnsisnull(callback){
    exportTools.generateJson("select UPPER(table_name) as tableName,GROUP_CONCAT(DISTINCT column_name ORDER BY ORDINAL_POSITION ASC) as nullcolumns from information_schema.columns  where TABLE_SCHEMA='ctrm_develop' and is_nullable='NO' and TABLE_name in  (select table_name from information_schema.tables  where TABLE_SCHEMA = 'ctrm_develop' and table_rows>100000 ) group by table_name ;").then(function(result){
       callback(null,result);
    },function(err){
      callback(err);
    })

}
//生成导入需要的json 内容包含 表名，列名,不能为空的列
function generateImportJson(){
  async.parallel({
    "all":function(callback){
      allColumns(callback);
    },
    "isnull":function(callback){
      columnsisnull(callback);
    }
  },function(err,result){
   mysqlPool.pool.end();
  var isnull = _.keyBy(result["isnull"],'tableName');
  var arrData = _.reduce(result["all"],function(mome,item,index){

    var tmp = _.assignInWith(item,isnull[item.tableName]);
    mome.push(tmp);
    return mome;
  },[])
    fs.writeFile('importTableName.json',JSON.stringify(arrData,null,4),function(err){
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
    var columns="" ;
    if(importTableArr[i].nullcolumns){
      columns = getColumnsData(importTableArr[i].columns,importTableArr[i].nullcolumns,"null-jiege");
    }else{
      columns = importTableArr[i].columns;
    }
    importTools.generateSrcipt(importTableArr[i].tableName,columns,importTableArr[i].files)
  }
}
function getColumnsData(columns,nullcolumns,tag){
  var newstr="";
  var nullArr = nullcolumns.split(',');
  for (var i = 0; i < nullArr.length; i++) {
     var flg = `${nullArr[i]} "decode(:${nullArr[i]},null, '${tag}', :${nullArr[i]})"`;
     columns = _.replace(columns,nullArr[i],flg);
  }
  return columns;
}


// var str = "PK_INV_STATUES,PK_INVBASDOC,PK_WAREHOUSE,UNSALE,USER_BACK,USER_SAVE,BROKEN_BEFORE,BORKEN_AFTER,EX_CHECK,BORROW,EXCHANGE,DEMONSTRATE,SUM,CORP_ID,TS,DR,TEMP_VAR1,TEMP_VAR2,TEMP_VAR3,TEMP_VAR4,TEMP_VAR5,TEMP_VAR6,TEMP_VAR7,TEMP_INT1,TEMP_INT2,TEMP_INT3,AVAILABLE_SUM";
// var flg = " \"decode(:vc_attributeName,null, 'none', :vc_attributeName)\"";
// var index = str.indexOf('PK_INVBASDOC')+"PK_INVBASDOC".length;
// console.log(insert_flg(str,flg,index));
function executeCtl(){
   console.time("exec-date");
   console.log("files");
   fs.readdir('ctl/',function(err,files){
     var tasks = _.reduce(files,function(mome,file){
       mome.push(importTools.executeSrcipt(`ctl/${file}`));
       return mome;
     },[]);
     Promise.all(tasks).then(function(result){
       console.log(result);
       console.timeEnd("exec-date");
     })
   })
}
function extractCsv(){
  return new Promise(function(resolve,reject){
    process.exec('tar xvf csv/csv.tar',
      function(error, stdout, stderr){
        if(error !== null) {
          console.log('exec error: ' + error);
          reject(500);
        }
        resolve(200);
    });
  })

}
function importCsvOracle(){
  console.time("exec-date");
  async.series({
    "task1":function(callback){
      console.time("task1-exec-date");
      extractCsv().then(function(result){
        console.timeEnd("task1-exec-date");
        callback(null,result);
      },function(err){
        callback(err);
      })
    },
    "task2":function(callback){
      console.time("task2-exec-date");
      generateImportJson().then(function(result){
        callback(null,result);
        console.timeEnd("task2-exec-date");
      },function(err){
        callback(err);
      })
    },
    "task3":function(callback){
      console.time("task3-exec-date");
      generateCtl().then(function(result){
        console.timeEnd("task3-exec-date");
        callback(null,result);
      },function(err){
        callback(err);
      })
    },
    "task4":function(callback){
      console.time("task4-exec-date");
      executeCtl().then(function(result){
        console.timeEnd("task4-exec-date");
        callback(null,result);
      },function(err){
        callback(err);
      })
    },
  },function(err,result){
    console.log(result);
    console.timeEnd("exec-date");
  })
}
importCsvOracle();
//exportCsvToServer();
//start();
//generateExportJson();
//generateImportJson();
//testc();
//generateCtl();
//executeCtl();
//exports.a = executeCtl;
