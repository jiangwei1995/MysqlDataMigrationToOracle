var express = require('express');
var _ = require('lodash');
var async = require('async');
var Promise = require('bluebird');
var process = require('child_process');
var importTools = require('./importTools');

console.time("exec-date");
async.parallel({
  1:importTools.executeSrcipt("ctl/im_saleout1.ctl"),
  2:importTools.executeSrcipt("ctl/im_saleout2.ctl")
},function(result){
  console.log(result);
  console.timeEnd("exec-date");
})
