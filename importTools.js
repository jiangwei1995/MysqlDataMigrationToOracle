var _ = require('lodash');
var async = require('async');
var Promise = require('bluebird');
var process = require('child_process');
var max_table_name = require('./min_table_name');
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

this.generateSrcipt = function(tableName){
  return new Promise(function(resolve,reject){
    var fileName = "ctl/"+tableName+".ctl";
    var str ='load data \r';
          str += 'infile '+'\'/home/oracle/IM_SALEOUT-0-1000000.csv.bak\''+' \r';
          str += 'infile '+'\'/home/oracle/IM_SALEOUT-1000000-2000000.csv.bak\''+' \r';
          str += 'append into table "' + 'IM_SALEOUT' + '" \r';
          str += 'fields terminated by \',\' \r';
          str += 'OPTIONALLY ENCLOSED BY \'"\'\r';
          str += 'TRAILING NULLCOLS \r';
          str +='(BILLID,'+
          'BILLCODE,'+
          'BILLDATE,'+
          'BUSINESS_TYPE,'+
          'BILLSTATE,'+
          'DEP_ACT_ID,'+
          'PK_STORDOC,'+
          'MAKER,'+
          'SIGNATORY,'+
          'MAKE_DATE,'+
          'SIGNATORY_DATE,'+
          'REMARK,'+
          'TS,'+
          'CORP_ID,'+
          'TEMP_VAR2,'+
          'TEMP_VAR1,'+
          'TEMP_VAR3,'+
          'TEMP_VAR4,'+
          'TEMP_VAR5,'+
          'TEMP_VAR6,'+
          'TEMP_VAR7,'+
          'TEMP_INT3,'+
          'TEMP_INT2,'+
          'TEMP_INT1,'+
          'IS_BINDSALE,'+
          'SALE_TYPE,'+
          'PRO_ID,'+
          'BSISTORCODE,'+
          'CASH_MONEY,'+
          'CARD_MONEY,'+
          'SUM_MONEY,'+
          'AUDIT_DATE,'+
          'AUDITOR,'+
          'VIP_CODE)';

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
