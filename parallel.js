var express = require('express');
var _ = require('lodash');
var async = require('async');
var Promise = require('bluebird');
var process = require('child_process');
var importTools = require('./importTools');

console.time("exec-date");
async.parallel([
 function(callback){
    importTools.executeSrcipt("ctl/im_saleout1.ctl").then(result){
      callback(err,result);
    }
  },function(callback){
     importTools.executeSrcipt("ctl/im_saleout.ctl").then(result){
       callback(err,result);
     }
   }]
},function(result){
  console.log(result);
  console.timeEnd("exec-date");
})
