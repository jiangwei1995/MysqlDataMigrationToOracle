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
//一个csv文件的行数
var number = 1000000;
//不能为空的字段替换的字符
var strnull = 'null-jiege';

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

//导出csv文件方法
function exportCsv(){
  return new Promise(function(resolve,reject){
    var tableArr = require('./exportTableName');
      var tasks = _.reduce(tableArr,function(tmp,parent){
      var itemTasks =  _.reduce(returnArrData(parent.tableName,parent.sumLine),function(itemMome,item){
        itemMome.push(exportTools.exportCsv(item.tableName, item.start, number, item.csvName,parent.where));
        return itemMome;
      },[]);
      tmp.push(itemTasks);
      return tmp;
    },[]);
    console.log(_.flatten(tasks).length);
    // Promise.all(_.flatten(tasks)).then(function(result){
    //   console.timeEnd("task2-exec-date");
    //   resolve(200);
    // },function(err){
    //   reject(500);
    // });
    Promise.map(
      _.flatten(tasks), function(result) {
          console.log(result);
          return result;
      }, {concurrency: 20}
    ).then(function(results) {
        console.log(results);
        resolve(200);
        console.timeEnd("task2-exec-date");
    },function(err){
        reject(500);
      });
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
  return new Promise(function(resolve,reject){
    //select UPPER(table_name) as tableName,table_rows as sumLine from tables where TABLE_SCHEMA = '${config.mysql.dbName}' and table_rows > 0  order by sumLine ASC;

    exportTools.generateJson(`select "bd_target" as tableName, count(*) as sumLine from ${config.mysql.dbName}.bd_target union all
    select "jk_ra", count(*) from ${config.mysql.dbName}.jk_ra union all
    select "jc_t2002172_a", count(*) from ${config.mysql.dbName}.jc_t2002172_a union all
    select "bd_controlconfig", count(*) from ${config.mysql.dbName}.bd_controlconfig union all
    select "jk_province", count(*) from ${config.mysql.dbName}.jk_province union all
    select "spare_test", count(*) from ${config.mysql.dbName}.spare_test union all
    select "imei_repaire", count(*) from ${config.mysql.dbName}.imei_repaire union all
    select "jc_t2002170_b", count(*) from ${config.mysql.dbName}.jc_t2002170_b union all
    select "bd_worknotice", count(*) from ${config.mysql.dbName}.bd_worknotice union all
    select "jc_t2002176", count(*) from ${config.mysql.dbName}.jc_t2002176 union all
    select "jk_md_b", count(*) from ${config.mysql.dbName}.jk_md_b union all
    select "jk_ti_soft", count(*) from ${config.mysql.dbName}.jk_ti_soft union all
    select "jc_cs", count(*) from ${config.mysql.dbName}.jc_cs union all
    select "act_ru_job", count(*) from ${config.mysql.dbName}.act_ru_job union all
    select "pub_affair", count(*) from ${config.mysql.dbName}.pub_affair union all
    select "chb_selection_plan", count(*) from ${config.mysql.dbName}.chb_selection_plan union all
    select "jk_product", count(*) from ${config.mysql.dbName}.jk_product union all
    select "bd_messagephone", count(*) from ${config.mysql.dbName}.bd_messagephone union all
    select "imei_historyseristatus", count(*) from ${config.mysql.dbName}.imei_historyseristatus union all
    select "pub_storpower", count(*) from ${config.mysql.dbName}.pub_storpower union all
    select "jc_t2002170", count(*) from ${config.mysql.dbName}.jc_t2002170 union all
    select "bd_visithistory_point", count(*) from ${config.mysql.dbName}.bd_visithistory_point union all
    select "jc_t2002183_a", count(*) from ${config.mysql.dbName}.jc_t2002183_a union all
    select "jc_t2002175_bb", count(*) from ${config.mysql.dbName}.jc_t2002175_bb union all
    select "ch_lease", count(*) from ${config.mysql.dbName}.ch_lease union all
    select "jk_md", count(*) from ${config.mysql.dbName}.jk_md union all
    select "act_id_group", count(*) from ${config.mysql.dbName}.act_id_group union all
    select "jk_ti_feature", count(*) from ${config.mysql.dbName}.jk_ti_feature union all
    select "jc_company", count(*) from ${config.mysql.dbName}.jc_company union all
    select "allot_out_b", count(*) from ${config.mysql.dbName}.allot_out_b union all
    select "ch_reimburse_payment", count(*) from ${config.mysql.dbName}.ch_reimburse_payment union all
    select "bd_messageconfig", count(*) from ${config.mysql.dbName}.bd_messageconfig union all
    select "pub_shortmsg", count(*) from ${config.mysql.dbName}.pub_shortmsg union all
    select "im_allocationorder_b", count(*) from ${config.mysql.dbName}.im_allocationorder_b union all
    select "bd_retailmeasu", count(*) from ${config.mysql.dbName}.bd_retailmeasu union all
    select "jc_t2002167", count(*) from ${config.mysql.dbName}.jc_t2002167 union all
    select "bd_visithistory_material", count(*) from ${config.mysql.dbName}.bd_visithistory_material union all
    select "jc_t2002181", count(*) from ${config.mysql.dbName}.jc_t2002181 union all
    select "jk_pre", count(*) from ${config.mysql.dbName}.jk_pre union all
    select "jk_fw", count(*) from ${config.mysql.dbName}.jk_fw union all
    select "bd_calbody", count(*) from ${config.mysql.dbName}.bd_calbody union all
    select "jk_ti_customer", count(*) from ${config.mysql.dbName}.jk_ti_customer union all
    select "jc_backpurchase_b", count(*) from ${config.mysql.dbName}.jc_backpurchase_b union all
    select "jc_t2002175_b", count(*) from ${config.mysql.dbName}.jc_t2002175_b union all
    select "jk_fc", count(*) from ${config.mysql.dbName}.jk_fc union all
    select "jc_backpurchase", count(*) from ${config.mysql.dbName}.jc_backpurchase union all
    select "ch_reimburse_material", count(*) from ${config.mysql.dbName}.ch_reimburse_material union all
    select "bd_retailmarketprice", count(*) from ${config.mysql.dbName}.bd_retailmarketprice union all
    select "txtest", count(*) from ${config.mysql.dbName}.txtest union all
    select "jc_split_b", count(*) from ${config.mysql.dbName}.jc_split_b union all
    select "jk_pr", count(*) from ${config.mysql.dbName}.jk_pr union all
    select "im_allocationorder", count(*) from ${config.mysql.dbName}.im_allocationorder union all
    select "jk_ti", count(*) from ${config.mysql.dbName}.jk_ti union all
    select "pub_voucherlist_cols", count(*) from ${config.mysql.dbName}.pub_voucherlist_cols union all
    select "im_apply_b", count(*) from ${config.mysql.dbName}.im_apply_b union all
    select "jc_t2002175", count(*) from ${config.mysql.dbName}.jc_t2002175 union all
    select "jk_ea", count(*) from ${config.mysql.dbName}.jk_ea union all
    select "im_pos_depa", count(*) from ${config.mysql.dbName}.im_pos_depa union all
    select "act_ru_event_subscr", count(*) from ${config.mysql.dbName}.act_ru_event_subscr union all
    select "ch_reimburse_charge", count(*) from ${config.mysql.dbName}.ch_reimburse_charge union all
    select "pj_saleout", count(*) from ${config.mysql.dbName}.pj_saleout union all
    select "jk_ppc", count(*) from ${config.mysql.dbName}.jk_ppc union all
    select "im_allocation_b", count(*) from ${config.mysql.dbName}.im_allocation_b union all
    select "transfer_currentstock", count(*) from ${config.mysql.dbName}.transfer_currentstock union all
    select "jc_split", count(*) from ${config.mysql.dbName}.jc_split union all
    select "jk_rr", count(*) from ${config.mysql.dbName}.jk_rr union all
    select "pub_voucherlist", count(*) from ${config.mysql.dbName}.pub_voucherlist union all
    select "im_apply", count(*) from ${config.mysql.dbName}.im_apply union all
    select "jc_t2002174", count(*) from ${config.mysql.dbName}.jc_t2002174 union all
    select "bdc_distributor_b", count(*) from ${config.mysql.dbName}.bdc_distributor_b union all
    select "ch_reimburse", count(*) from ${config.mysql.dbName}.ch_reimburse union all
    select "jk_demo", count(*) from ${config.mysql.dbName}.jk_demo union all
    select "jc_t2002179", count(*) from ${config.mysql.dbName}.jc_t2002179 union all
    select "bd_marketprice", count(*) from ${config.mysql.dbName}.bd_marketprice union all
    select "jk_pp", count(*) from ${config.mysql.dbName}.jk_pp union all
    select "im_allocation", count(*) from ${config.mysql.dbName}.im_allocation union all
    select "bd_reprice", count(*) from ${config.mysql.dbName}.bd_reprice union all
    select "jc_shopattribute", count(*) from ${config.mysql.dbName}.jc_shopattribute union all
    select "bd_billprint", count(*) from ${config.mysql.dbName}.bd_billprint union all
    select "jk_rp_fee", count(*) from ${config.mysql.dbName}.jk_rp_fee union all
    select "im_allot_b", count(*) from ${config.mysql.dbName}.im_allot_b union all
    select "jc_t2002173", count(*) from ${config.mysql.dbName}.jc_t2002173 union all
    select "act_re_model", count(*) from ${config.mysql.dbName}.act_re_model union all
    select "bd_stoandproxy", count(*) from ${config.mysql.dbName}.bd_stoandproxy union all
    select "jk_cr", count(*) from ${config.mysql.dbName}.jk_cr union all
    select "jk_pi", count(*) from ${config.mysql.dbName}.jk_pi union all
    select "goldkeyuser", count(*) from ${config.mysql.dbName}.goldkeyuser union all
    select "jc_purperiod", count(*) from ${config.mysql.dbName}.jc_purperiod union all
    select "jk_ri", count(*) from ${config.mysql.dbName}.jk_ri union all
    select "im_allot", count(*) from ${config.mysql.dbName}.im_allot union all
    select "jc_t2002172_e", count(*) from ${config.mysql.dbName}.jc_t2002172_e union all
    select "bd_statelogic", count(*) from ${config.mysql.dbName}.bd_statelogic union all
    select "jk_vi", count(*) from ${config.mysql.dbName}.jk_vi union all
    select "jk_ck", count(*) from ${config.mysql.dbName}.jk_ck union all
    select "eb_invoice", count(*) from ${config.mysql.dbName}.eb_invoice union all
    select "jk_pa", count(*) from ${config.mysql.dbName}.jk_pa union all
    select "jc_ps", count(*) from ${config.mysql.dbName}.jc_ps union all
    select "newtable", count(*) from ${config.mysql.dbName}.newtable union all
    select "jc_t2002172_d", count(*) from ${config.mysql.dbName}.jc_t2002172_d union all
    select "allot_out", count(*) from ${config.mysql.dbName}.allot_out union all
    select "bd_tmpstordoc", count(*) from ${config.mysql.dbName}.bd_tmpstordoc union all
    select "jk_rd_b", count(*) from ${config.mysql.dbName}.jk_rd_b union all
    select "bd_intelimp", count(*) from ${config.mysql.dbName}.bd_intelimp union all
    select "jk_vendor", count(*) from ${config.mysql.dbName}.jk_vendor union all
    select "jk_ca", count(*) from ${config.mysql.dbName}.jk_ca union all
    select "act_id_user", count(*) from ${config.mysql.dbName}.act_id_user union all
    select "jk_od_item", count(*) from ${config.mysql.dbName}.jk_od_item union all
    select "jk_tp_phase", count(*) from ${config.mysql.dbName}.jk_tp_phase union all
    select "jc_pf", count(*) from ${config.mysql.dbName}.jc_pf union all
    select "jc_t2002178_b", count(*) from ${config.mysql.dbName}.jc_t2002178_b union all
    select "allot_app", count(*) from ${config.mysql.dbName}.allot_app union all
    select "bd_batch_stor", count(*) from ${config.mysql.dbName}.bd_batch_stor union all
    select "act_hi_attachment", count(*) from ${config.mysql.dbName}.act_hi_attachment union all
    select "jk_rd", count(*) from ${config.mysql.dbName}.jk_rd union all
    select "jc_t2002172_c", count(*) from ${config.mysql.dbName}.jc_t2002172_c union all
    select "bd_inteandchan", count(*) from ${config.mysql.dbName}.bd_inteandchan union all
    select "jk_ac", count(*) from ${config.mysql.dbName}.jk_ac union all
    select "dzq_data_repair", count(*) from ${config.mysql.dbName}.dzq_data_repair union all
    select "bd_mold", count(*) from ${config.mysql.dbName}.bd_mold union all
    select "act_id_membership", count(*) from ${config.mysql.dbName}.act_id_membership union all
    select "bd_worknotice_b_b", count(*) from ${config.mysql.dbName}.bd_worknotice_b_b union all
    select "jk_tp_fee", count(*) from ${config.mysql.dbName}.jk_tp_fee union all
    select "jc_opupdate", count(*) from ${config.mysql.dbName}.jc_opupdate union all
    select "jc_t2002178", count(*) from ${config.mysql.dbName}.jc_t2002178 union all
    select "jk_od_arrivalitem", count(*) from ${config.mysql.dbName}.jk_od_arrivalitem union all
    select "bd_cuanhuo", count(*) from ${config.mysql.dbName}.bd_cuanhuo union all
    select "bd_target_b", count(*) from ${config.mysql.dbName}.bd_target_b union all
    select "jk_rc", count(*) from ${config.mysql.dbName}.jk_rc union all
    select "jc_t2002172_b", count(*) from ${config.mysql.dbName}.jc_t2002172_b union all
    select "jc_uploadresult", count(*) from ${config.mysql.dbName}.jc_uploadresult union all
    select "dzq_data", count(*) from ${config.mysql.dbName}.dzq_data union all
    select "act_id_info", count(*) from ${config.mysql.dbName}.act_id_info union all
    select "bd_worknotice_b", count(*) from ${config.mysql.dbName}.bd_worknotice_b union all
    select "jk_tp", count(*) from ${config.mysql.dbName}.jk_tp union all
    select "bd_promotion", count(*) from ${config.mysql.dbName}.bd_promotion union all
    select "jc_lp", count(*) from ${config.mysql.dbName}.jc_lp union all
    select "jc_t2002177", count(*) from ${config.mysql.dbName}.jc_t2002177 union all
    select "jk_od", count(*) from ${config.mysql.dbName}.jk_od union all
    select "bd_campusimp", count(*) from ${config.mysql.dbName}.bd_campusimp union all
    select "act_evt_log", count(*) from ${config.mysql.dbName}.act_evt_log union all
    select "channel_suggest", count(*) from ${config.mysql.dbName}.channel_suggest union all
    select "ch_maxcode", count(*) from ${config.mysql.dbName}.ch_maxcode union all
    select "ch_supplier", count(*) from ${config.mysql.dbName}.ch_supplier union all
    select "act_ge_property", count(*) from ${config.mysql.dbName}.act_ge_property union all
    select "bd_messagephone_b", count(*) from ${config.mysql.dbName}.bd_messagephone_b union all
    select "ch_lease_b", count(*) from ${config.mysql.dbName}.ch_lease_b union all
    select "bd_invprice_devalue", count(*) from ${config.mysql.dbName}.bd_invprice_devalue union all
    select "ch_contract", count(*) from ${config.mysql.dbName}.ch_contract union all
    select "retail_check_imei", count(*) from ${config.mysql.dbName}.retail_check_imei union all
    select "bd_version", count(*) from ${config.mysql.dbName}.bd_version union all
    select "pj_saleout_b", count(*) from ${config.mysql.dbName}.pj_saleout_b union all
    select "bd_chantype", count(*) from ${config.mysql.dbName}.bd_chantype union all
    select "bd_dischanproxy", count(*) from ${config.mysql.dbName}.bd_dischanproxy union all
    select "pj_purchase", count(*) from ${config.mysql.dbName}.pj_purchase union all
    select "bd_reason", count(*) from ${config.mysql.dbName}.bd_reason union all
    select "bd_inv_channel_purchase_price", count(*) from ${config.mysql.dbName}.bd_inv_channel_purchase_price union all
    select "bd_keypoint", count(*) from ${config.mysql.dbName}.bd_keypoint union all
    select "bd_area", count(*) from ${config.mysql.dbName}.bd_area union all
    select "ch_leasetarget", count(*) from ${config.mysql.dbName}.ch_leasetarget union all
    select "jc_tl", count(*) from ${config.mysql.dbName}.jc_tl union all
    select "bd_saleflag", count(*) from ${config.mysql.dbName}.bd_saleflag union all
    select "bd_price_part", count(*) from ${config.mysql.dbName}.bd_price_part union all
    select "bd_channeltype", count(*) from ${config.mysql.dbName}.bd_channeltype union all
    select "ch_budget", count(*) from ${config.mysql.dbName}.ch_budget union all
    select "ch_producttype", count(*) from ${config.mysql.dbName}.ch_producttype union all
    select "bd_level_color", count(*) from ${config.mysql.dbName}.bd_level_color union all
    select "bd_userdef", count(*) from ${config.mysql.dbName}.bd_userdef union all
    select "bd_numberstate", count(*) from ${config.mysql.dbName}.bd_numberstate union all
    select "bd_mold_b", count(*) from ${config.mysql.dbName}.bd_mold_b union all
    select "bd_statedoc", count(*) from ${config.mysql.dbName}.bd_statedoc union all
    select "bd_invcl", count(*) from ${config.mysql.dbName}.bd_invcl union all
    select "bd_member", count(*) from ${config.mysql.dbName}.bd_member union all
    select "bd_userdef_quote", count(*) from ${config.mysql.dbName}.bd_userdef_quote union all
    select "bd_inv_channel_saleprice", count(*) from ${config.mysql.dbName}.bd_inv_channel_saleprice union all
    select "pj_currentstock", count(*) from ${config.mysql.dbName}.pj_currentstock union all
    select "pub_nocheck_tac", count(*) from ${config.mysql.dbName}.pub_nocheck_tac union all
    select "routine_maintain", count(*) from ${config.mysql.dbName}.routine_maintain union all
    select "bd_partstype", count(*) from ${config.mysql.dbName}.bd_partstype union all
    select "ch_budget_b", count(*) from ${config.mysql.dbName}.ch_budget_b union all
    select "pj_purchase_b", count(*) from ${config.mysql.dbName}.pj_purchase_b union all
    select "exe_selec", count(*) from ${config.mysql.dbName}.exe_selec union all
    select "bd_saletype", count(*) from ${config.mysql.dbName}.bd_saletype union all
    select "ch_materialtype", count(*) from ${config.mysql.dbName}.ch_materialtype union all
    select "bd_saleprice", count(*) from ${config.mysql.dbName}.bd_saleprice union all
    select "eb_shop", count(*) from ${config.mysql.dbName}.eb_shop union all
    select "aaa", count(*) from ${config.mysql.dbName}.aaa union all
    select "pub_scrollmsg", count(*) from ${config.mysql.dbName}.pub_scrollmsg union all
    select "act_re_procdef", count(*) from ${config.mysql.dbName}.act_re_procdef union all
    select "rpt_rsmonthly_corp", count(*) from ${config.mysql.dbName}.rpt_rsmonthly_corp union all
    select "act_re_deployment", count(*) from ${config.mysql.dbName}.act_re_deployment union all
    select "ch_deployment", count(*) from ${config.mysql.dbName}.ch_deployment union all
    select "im_check", count(*) from ${config.mysql.dbName}.im_check union all
    select "bd_role", count(*) from ${config.mysql.dbName}.bd_role union all
    select "sm_seristatus", count(*) from ${config.mysql.dbName}.sm_seristatus union all
    select "bd_channelindex", count(*) from ${config.mysql.dbName}.bd_channelindex union all
    select "act_ru_task", count(*) from ${config.mysql.dbName}.act_ru_task union all
    select "bd_faulttypeb", count(*) from ${config.mysql.dbName}.bd_faulttypeb union all
    select "ch_agency", count(*) from ${config.mysql.dbName}.ch_agency union all
    select "bdc_leaseprice", count(*) from ${config.mysql.dbName}.bdc_leaseprice union all
    select "ch_grant", count(*) from ${config.mysql.dbName}.ch_grant union all
    select "ch_endreport", count(*) from ${config.mysql.dbName}.ch_endreport union all
    select "bd_partsbrand", count(*) from ${config.mysql.dbName}.bd_partsbrand union all
    select "ch_begincheck", count(*) from ${config.mysql.dbName}.ch_begincheck union all
    select "bd_channel_point", count(*) from ${config.mysql.dbName}.bd_channel_point union all
    select "channel_items", count(*) from ${config.mysql.dbName}.channel_items union all
    select "bd_storprice", count(*) from ${config.mysql.dbName}.bd_storprice union all
    select "act_ru_execution", count(*) from ${config.mysql.dbName}.act_ru_execution union all
    select "act_hi_procinst", count(*) from ${config.mysql.dbName}.act_hi_procinst union all
    select "bd_userdef_doc", count(*) from ${config.mysql.dbName}.bd_userdef_doc union all
    select "bd_purprice_city", count(*) from ${config.mysql.dbName}.bd_purprice_city union all
    select "ch_target", count(*) from ${config.mysql.dbName}.ch_target union all
    select "ch_stock", count(*) from ${config.mysql.dbName}.ch_stock union all
    select "demo_user", count(*) from ${config.mysql.dbName}.demo_user union all
    select "eb_shop_address", count(*) from ${config.mysql.dbName}.eb_shop_address union all
    select "ch_businesstype", count(*) from ${config.mysql.dbName}.ch_businesstype union all
    select "jys_cityappdate", count(*) from ${config.mysql.dbName}.jys_cityappdate union all
    select "tem_pub_billtemplatebb", count(*) from ${config.mysql.dbName}.tem_pub_billtemplatebb union all
    select "stock_transferb", count(*) from ${config.mysql.dbName}.stock_transferb union all
    select "stock_transfer", count(*) from ${config.mysql.dbName}.stock_transfer union all
    select "jys_test_stordoc", count(*) from ${config.mysql.dbName}.jys_test_stordoc union all
    select "bd_invwinthebidding", count(*) from ${config.mysql.dbName}.bd_invwinthebidding union all
    select "ch_decorationplan", count(*) from ${config.mysql.dbName}.ch_decorationplan union all
    select "bd_measdoc", count(*) from ${config.mysql.dbName}.bd_measdoc union all
    select "pub_corp_chanel", count(*) from ${config.mysql.dbName}.pub_corp_chanel union all
    select "channel_numbercity", count(*) from ${config.mysql.dbName}.channel_numbercity union all
    select "bd_terminalprice", count(*) from ${config.mysql.dbName}.bd_terminalprice union all
    select "channel_bandcity", count(*) from ${config.mysql.dbName}.channel_bandcity union all
    select "ch_apply", count(*) from ${config.mysql.dbName}.ch_apply union all
    select "eb_shopcart", count(*) from ${config.mysql.dbName}.eb_shopcart union all
    select "bd_partsinfo", count(*) from ${config.mysql.dbName}.bd_partsinfo union all
    select "ch_winningpro", count(*) from ${config.mysql.dbName}.ch_winningpro union all
    select "ch_endcheck_list", count(*) from ${config.mysql.dbName}.ch_endcheck_list union all
    select "bd_filiale", count(*) from ${config.mysql.dbName}.bd_filiale union all
    select "bd_invsort", count(*) from ${config.mysql.dbName}.bd_invsort union all
    select "chb_project", count(*) from ${config.mysql.dbName}.chb_project union all
    select "ch_material", count(*) from ${config.mysql.dbName}.ch_material union all
    select "ch_alloout", count(*) from ${config.mysql.dbName}.ch_alloout union all
    select "ch_decorationplan_b", count(*) from ${config.mysql.dbName}.ch_decorationplan_b union all
    select "act_hi_taskinst", count(*) from ${config.mysql.dbName}.act_hi_taskinst union all
    select "im_borrow_b", count(*) from ${config.mysql.dbName}.im_borrow_b union all
    select "im_borrow", count(*) from ${config.mysql.dbName}.im_borrow union all
    select "bd_emis_role", count(*) from ${config.mysql.dbName}.bd_emis_role union all
    select "bd_type", count(*) from ${config.mysql.dbName}.bd_type union all
    select "act_ge_bytearray", count(*) from ${config.mysql.dbName}.act_ge_bytearray union all
    select "bd_camimpstordoc", count(*) from ${config.mysql.dbName}.bd_camimpstordoc union all
    select "bd_customer_type", count(*) from ${config.mysql.dbName}.bd_customer_type union all
    select "im_allodemand", count(*) from ${config.mysql.dbName}.im_allodemand union all
    select "im_provincepurplan", count(*) from ${config.mysql.dbName}.im_provincepurplan union all
    select "ch_writeoff", count(*) from ${config.mysql.dbName}.ch_writeoff union all
    select "bd_district", count(*) from ${config.mysql.dbName}.bd_district union all
    select "act_hi_comment", count(*) from ${config.mysql.dbName}.act_hi_comment union all
    select "bd_caminvbasdoc", count(*) from ${config.mysql.dbName}.bd_caminvbasdoc union all
    select "ch_apply_b", count(*) from ${config.mysql.dbName}.ch_apply_b union all
    select "ch_decorationplan_list", count(*) from ${config.mysql.dbName}.ch_decorationplan_list union all
    select "im_allodemand_b", count(*) from ${config.mysql.dbName}.im_allodemand_b union all
    select "ch_repairlist", count(*) from ${config.mysql.dbName}.ch_repairlist union all
    select "act_ru_identitylink", count(*) from ${config.mysql.dbName}.act_ru_identitylink union all
    select "act_hi_identitylink", count(*) from ${config.mysql.dbName}.act_hi_identitylink union all
    select "visittask_county_point", count(*) from ${config.mysql.dbName}.visittask_county_point union all
    select "ch_grant_b", count(*) from ${config.mysql.dbName}.ch_grant_b union all
    select "channel_fourgcity", count(*) from ${config.mysql.dbName}.channel_fourgcity union all
    select "ch_member", count(*) from ${config.mysql.dbName}.ch_member union all
    select "bd_channel_visithistory", count(*) from ${config.mysql.dbName}.bd_channel_visithistory union all
    select "bd_alloapproval", count(*) from ${config.mysql.dbName}.bd_alloapproval union all
    select "pub_sysinittemp", count(*) from ${config.mysql.dbName}.pub_sysinittemp union all
    select "pub_sysinit", count(*) from ${config.mysql.dbName}.pub_sysinit union all
    select "ch_deployment_subprocess_b", count(*) from ${config.mysql.dbName}.ch_deployment_subprocess_b union all
    select "bd_jzstore", count(*) from ${config.mysql.dbName}.bd_jzstore union all
    select "chb_plan", count(*) from ${config.mysql.dbName}.chb_plan union all
    select "bdc_channeltype", count(*) from ${config.mysql.dbName}.bdc_channeltype union all
    select "act_hi_actinst", count(*) from ${config.mysql.dbName}.act_hi_actinst union all
    select "ch_writeoff_b", count(*) from ${config.mysql.dbName}.ch_writeoff_b union all
    select "chb_plan_b", count(*) from ${config.mysql.dbName}.chb_plan_b union all
    select "visittask_county", count(*) from ${config.mysql.dbName}.visittask_county union all
    select "ch_alloout_b", count(*) from ${config.mysql.dbName}.ch_alloout_b union all
    select "imei_serpower", count(*) from ${config.mysql.dbName}.imei_serpower union all
    select "visittask_county_material", count(*) from ${config.mysql.dbName}.visittask_county_material union all
    select "visittask_province_point", count(*) from ${config.mysql.dbName}.visittask_province_point union all
    select "pub_regexp", count(*) from ${config.mysql.dbName}.pub_regexp union all
    select "visittask_city_point", count(*) from ${config.mysql.dbName}.visittask_city_point union all
    select "visittask_city", count(*) from ${config.mysql.dbName}.visittask_city union all
    select "visittask_city_material", count(*) from ${config.mysql.dbName}.visittask_city_material union all
    select "visittask_province_material", count(*) from ${config.mysql.dbName}.visittask_province_material union all
    select "visittask_county_b", count(*) from ${config.mysql.dbName}.visittask_county_b union all
    select "temp_emis_user", count(*) from ${config.mysql.dbName}.temp_emis_user union all
    select "bd_partsprice", count(*) from ${config.mysql.dbName}.bd_partsprice union all
    select "ch_deployment_b", count(*) from ${config.mysql.dbName}.ch_deployment_b union all
    select "bd_g3cubasdochan", count(*) from ${config.mysql.dbName}.bd_g3cubasdochan union all
    select "act_hi_varinst", count(*) from ${config.mysql.dbName}.act_hi_varinst union all
    select "act_ru_variable", count(*) from ${config.mysql.dbName}.act_ru_variable union all
    select "act_hi_detail", count(*) from ${config.mysql.dbName}.act_hi_detail union all
    select "im_exchange", count(*) from ${config.mysql.dbName}.im_exchange union all
    select "im_exchange_b", count(*) from ${config.mysql.dbName}.im_exchange_b union all
    select "chb_plan_target", count(*) from ${config.mysql.dbName}.chb_plan_target union all
    select "ch_endphoto", count(*) from ${config.mysql.dbName}.ch_endphoto union all
    select "bd_channel_material", count(*) from ${config.mysql.dbName}.bd_channel_material union all
    select "bd_faulttype", count(*) from ${config.mysql.dbName}.bd_faulttype union all
    select "bd_channel_point_b", count(*) from ${config.mysql.dbName}.bd_channel_point_b union all
    select "temp_phone_code", count(*) from ${config.mysql.dbName}.temp_phone_code union all
    select "visittask_province", count(*) from ${config.mysql.dbName}.visittask_province union all
    select "bd_spinvbasdoc", count(*) from ${config.mysql.dbName}.bd_spinvbasdoc union all
    select "eb_terminal", count(*) from ${config.mysql.dbName}.eb_terminal union all
    select "bd_supply", count(*) from ${config.mysql.dbName}.bd_supply union all
    select "im_check_b", count(*) from ${config.mysql.dbName}.im_check_b union all
    select "ch_seriesstatus", count(*) from ${config.mysql.dbName}.ch_seriesstatus union all
    select "bd_billtype", count(*) from ${config.mysql.dbName}.bd_billtype union all
    select "ch_billseries", count(*) from ${config.mysql.dbName}.ch_billseries union all
    select "bd_mobiletype", count(*) from ${config.mysql.dbName}.bd_mobiletype union all
    select "chb_selection", count(*) from ${config.mysql.dbName}.chb_selection union all
    select "eb_order", count(*) from ${config.mysql.dbName}.eb_order union all
    select "eb_orderitem", count(*) from ${config.mysql.dbName}.eb_orderitem union all
    select "eb_terminal_detail", count(*) from ${config.mysql.dbName}.eb_terminal_detail union all
    select "imei_serpow_b", count(*) from ${config.mysql.dbName}.imei_serpow_b union all
    select "jys_citysaledata", count(*) from ${config.mysql.dbName}.jys_citysaledata union all
    select "eb_stock", count(*) from ${config.mysql.dbName}.eb_stock union all
    select "jys_panorama_appchannel12", count(*) from ${config.mysql.dbName}.jys_panorama_appchannel12 union all
    select "eb_image", count(*) from ${config.mysql.dbName}.eb_image union all
    select "bd_stordoc_chain", count(*) from ${config.mysql.dbName}.bd_stordoc_chain union all
    select "channel_map_point", count(*) from ${config.mysql.dbName}.channel_map_point union all
    select "bdc_business", count(*) from ${config.mysql.dbName}.bdc_business union all
    select "ch_wfhistory", count(*) from ${config.mysql.dbName}.ch_wfhistory union all
    select "pj_stockhistory", count(*) from ${config.mysql.dbName}.pj_stockhistory union all
    select "pub_billtemplate", count(*) from ${config.mysql.dbName}.pub_billtemplate union all
    select "jys_countryappdate", count(*) from ${config.mysql.dbName}.jys_countryappdate union all
    select "jys_panorama_appchannel", count(*) from ${config.mysql.dbName}.jys_panorama_appchannel union all
    select "bdc_leasedoc", count(*) from ${config.mysql.dbName}.bdc_leasedoc union all
    select "channel_numbercounty", count(*) from ${config.mysql.dbName}.channel_numbercounty union all
    select "channel_bandcounty", count(*) from ${config.mysql.dbName}.channel_bandcounty union all
    select "bd_channel_visit", count(*) from ${config.mysql.dbName}.bd_channel_visit union all
    select "jys_appcountynum", count(*) from ${config.mysql.dbName}.jys_appcountynum union all
    select "tem_busi", count(*) from ${config.mysql.dbName}.tem_busi union all
    select "jc_t2002180", count(*) from ${config.mysql.dbName}.jc_t2002180 union all
    select "rpt_rtmonthly_supply", count(*) from ${config.mysql.dbName}.rpt_rtmonthly_supply union all
    select "pub_ref_relation", count(*) from ${config.mysql.dbName}.pub_ref_relation union all
    select "bd_comseries", count(*) from ${config.mysql.dbName}.bd_comseries union all
    select "im_citypurplan", count(*) from ${config.mysql.dbName}.im_citypurplan union all
    select "bd_branddoc", count(*) from ${config.mysql.dbName}.bd_branddoc union all
    select "pub_group", count(*) from ${config.mysql.dbName}.pub_group union all
    select "ser_dispose", count(*) from ${config.mysql.dbName}.ser_dispose union all
    select "imei_serseristatus", count(*) from ${config.mysql.dbName}.imei_serseristatus union all
    select "channel_fourgcounty", count(*) from ${config.mysql.dbName}.channel_fourgcounty union all
    select "imei_billseries_spare", count(*) from ${config.mysql.dbName}.imei_billseries_spare union all
    select "imei_seristatus_spare", count(*) from ${config.mysql.dbName}.imei_seristatus_spare union all
    select "bd_invwinthebidding_b", count(*) from ${config.mysql.dbName}.bd_invwinthebidding_b union all
    select "bd_serstor", count(*) from ${config.mysql.dbName}.bd_serstor union all
    select "rpt_rsmonthly_supply", count(*) from ${config.mysql.dbName}.rpt_rsmonthly_supply union all
    select "wer", count(*) from ${config.mysql.dbName}.wer union all
    select "bd_purchaseprice", count(*) from ${config.mysql.dbName}.bd_purchaseprice union all
    select "bd_billcode_rule", count(*) from ${config.mysql.dbName}.bd_billcode_rule union all
    select "eb_orderhistory", count(*) from ${config.mysql.dbName}.eb_orderhistory union all
    select "pub_billtemplatebb", count(*) from ${config.mysql.dbName}.pub_billtemplatebb union all
    select "visittask_city_b", count(*) from ${config.mysql.dbName}.visittask_city_b union all
    select "pub_query_templet", count(*) from ${config.mysql.dbName}.pub_query_templet union all
    select "bd_billcode_max", count(*) from ${config.mysql.dbName}.bd_billcode_max union all
    select "ch_wfinterface", count(*) from ${config.mysql.dbName}.ch_wfinterface union all
    select "eb_message", count(*) from ${config.mysql.dbName}.eb_message union all
    select "pub_emis_corp", count(*) from ${config.mysql.dbName}.pub_emis_corp union all
    select "bd_inteltac", count(*) from ${config.mysql.dbName}.bd_inteltac union all
    select "bd_cubasdoc", count(*) from ${config.mysql.dbName}.bd_cubasdoc union all
    select "jys_channelapp", count(*) from ${config.mysql.dbName}.jys_channelapp union all
    select "im_citypurplan_b", count(*) from ${config.mysql.dbName}.im_citypurplan_b union all
    select "im_provincepurplan_b", count(*) from ${config.mysql.dbName}.im_provincepurplan_b union all
    select "bd_channel_image", count(*) from ${config.mysql.dbName}.bd_channel_image union all
    select "pub_fast", count(*) from ${config.mysql.dbName}.pub_fast union all
    select "sms_info", count(*) from ${config.mysql.dbName}.sms_info union all
    select "visittask_province_b", count(*) from ${config.mysql.dbName}.visittask_province_b union all
    select "imei_serbillseries", count(*) from ${config.mysql.dbName}.imei_serbillseries union all
    select "bd_stordoc_relation", count(*) from ${config.mysql.dbName}.bd_stordoc_relation union all
    select "imei_tempseristatus", count(*) from ${config.mysql.dbName}.imei_tempseristatus union all
    select "jys_countysaledata", count(*) from ${config.mysql.dbName}.jys_countysaledata union all
    select "channel_apploginlog", count(*) from ${config.mysql.dbName}.channel_apploginlog union all
    select "imei_seristatus", count(*) from ${config.mysql.dbName}.imei_seristatus union all
    select "temp_stor_busi", count(*) from ${config.mysql.dbName}.temp_stor_busi union all
    select "rpt_rtmonthly_inv", count(*) from ${config.mysql.dbName}.rpt_rtmonthly_inv union all
    select "pub_billtemplateb", count(*) from ${config.mysql.dbName}.pub_billtemplateb union all
    select "ser_sepair_in", count(*) from ${config.mysql.dbName}.ser_sepair_in union all
    select "temp_user_channel", count(*) from ${config.mysql.dbName}.temp_user_channel union all
    select "im_purorder", count(*) from ${config.mysql.dbName}.im_purorder union all
    select "ser_depot_in", count(*) from ${config.mysql.dbName}.ser_depot_in union all
    select "ser_depot_out", count(*) from ${config.mysql.dbName}.ser_depot_out union all
    select "test", count(*) from ${config.mysql.dbName}.test union all
    select "channel_branch", count(*) from ${config.mysql.dbName}.channel_branch union all
    select "test123", count(*) from ${config.mysql.dbName}.test123 union all
    select "pub_query_condition", count(*) from ${config.mysql.dbName}.pub_query_condition union all
    select "rpt_rpmonthly_supply", count(*) from ${config.mysql.dbName}.rpt_rpmonthly_supply union all
    select "imei_billseries", count(*) from ${config.mysql.dbName}.imei_billseries union all
    select "pub_corp", count(*) from ${config.mysql.dbName}.pub_corp union all
    select "temp_update_corp", count(*) from ${config.mysql.dbName}.temp_update_corp union all
    select "temp_pub_corp", count(*) from ${config.mysql.dbName}.temp_pub_corp union all
    select "pub_funcregister", count(*) from ${config.mysql.dbName}.pub_funcregister union all
    select "bdc_distributor", count(*) from ${config.mysql.dbName}.bdc_distributor union all
    select "bd_rescode", count(*) from ${config.mysql.dbName}.bd_rescode union all
    select "bd_promoter", count(*) from ${config.mysql.dbName}.bd_promoter union all
    select "rpt_etmonthly_corp", count(*) from ${config.mysql.dbName}.rpt_etmonthly_corp union all
    select "bd_price", count(*) from ${config.mysql.dbName}.bd_price union all
    select "bd_invbasdoc", count(*) from ${config.mysql.dbName}.bd_invbasdoc union all
    select "rpt_dbmonthly", count(*) from ${config.mysql.dbName}.rpt_dbmonthly union all
    select "ser_sepair_out", count(*) from ${config.mysql.dbName}.ser_sepair_out union all
    select "pub_tacdata", count(*) from ${config.mysql.dbName}.pub_tacdata union all
    select "bd_inv_supply", count(*) from ${config.mysql.dbName}.bd_inv_supply union all
    select "im_purorder_b", count(*) from ${config.mysql.dbName}.im_purorder_b union all
    select "rpt_rtmonthly_corp", count(*) from ${config.mysql.dbName}.rpt_rtmonthly_corp union all
    select "im_plsaleout", count(*) from ${config.mysql.dbName}.im_plsaleout union all
    select "im_spepurchase", count(*) from ${config.mysql.dbName}.im_spepurchase union all
    select "bd_color", count(*) from ${config.mysql.dbName}.bd_color union all
    select "rpt_rpmonthly_inv", count(*) from ${config.mysql.dbName}.rpt_rpmonthly_inv union all
    select "20160217", count(*) from ${config.mysql.dbName}.20160217 union all
    select "pub_user_copy", count(*) from ${config.mysql.dbName}.pub_user_copy union all
    select "pub_user", count(*) from ${config.mysql.dbName}.pub_user union all
    select "im_plsaleout_b", count(*) from ${config.mysql.dbName}.im_plsaleout_b union all
    select "im_spepurchase_b", count(*) from ${config.mysql.dbName}.im_spepurchase_b union all
    select "pub_online_users", count(*) from ${config.mysql.dbName}.pub_online_users union all
    select "temp_stordoc_zsbj", count(*) from ${config.mysql.dbName}.temp_stordoc_zsbj union all
    select "bd_depactivities", count(*) from ${config.mysql.dbName}.bd_depactivities union all
    select "ser_depot_out_b", count(*) from ${config.mysql.dbName}.ser_depot_out_b union all
    select "ser_sepair_in_b", count(*) from ${config.mysql.dbName}.ser_sepair_in_b union all
    select "ser_depot_in_b", count(*) from ${config.mysql.dbName}.ser_depot_in_b union all
    select "bdc_area", count(*) from ${config.mysql.dbName}.bdc_area union all
    select "tmp_0223", count(*) from ${config.mysql.dbName}.tmp_0223 union all
    select "pub_channel_user", count(*) from ${config.mysql.dbName}.pub_channel_user union all
    select "pub_emis_user", count(*) from ${config.mysql.dbName}.pub_emis_user union all
    select "channel_bandmanager", count(*) from ${config.mysql.dbName}.channel_bandmanager union all
    select "channel_saledata", count(*) from ${config.mysql.dbName}.channel_saledata union all
    select "channel_numbermanager", count(*) from ${config.mysql.dbName}.channel_numbermanager union all
    select "channel_fourgmanager", count(*) from ${config.mysql.dbName}.channel_fourgmanager union all
    select "bd_proxy", count(*) from ${config.mysql.dbName}.bd_proxy union all
    select "ser_sepair_out_b", count(*) from ${config.mysql.dbName}.ser_sepair_out_b union all
    select "bd_compare", count(*) from ${config.mysql.dbName}.bd_compare union all
    select "area_temp", count(*) from ${config.mysql.dbName}.area_temp union all
    select "jc_t2002180_copy", count(*) from ${config.mysql.dbName}.jc_t2002180_copy union all
    select "pub_operatelog", count(*) from ${config.mysql.dbName}.pub_operatelog union all
    select "ser_maintain", count(*) from ${config.mysql.dbName}.ser_maintain union all
    select "rpt_rpmonthly_corp", count(*) from ${config.mysql.dbName}.rpt_rpmonthly_corp union all
    select "temp_channel_stodoc", count(*) from ${config.mysql.dbName}.temp_channel_stodoc union all
    select "channel_bill", count(*) from ${config.mysql.dbName}.channel_bill union all
    select "im_allonotify", count(*) from ${config.mysql.dbName}.im_allonotify union all
    select "pub_userandcorp", count(*) from ${config.mysql.dbName}.pub_userandcorp union all
    select "im_allonotify_b", count(*) from ${config.mysql.dbName}.im_allonotify_b union all
    select "channel_anaiysis", count(*) from ${config.mysql.dbName}.channel_anaiysis union all
    select "ser_maintainrc", count(*) from ${config.mysql.dbName}.ser_maintainrc union all
    select "pub_userandgroup", count(*) from ${config.mysql.dbName}.pub_userandgroup union all
    select "pub_funpower", count(*) from ${config.mysql.dbName}.pub_funpower union all
    select "bd_depactivities_b", count(*) from ${config.mysql.dbName}.bd_depactivities_b union all
    select "channel_ranking", count(*) from ${config.mysql.dbName}.channel_ranking union all
    select "bd_stordoc", count(*) from ${config.mysql.dbName}.bd_stordoc union all
    select "channel_fourgchannel", count(*) from ${config.mysql.dbName}.channel_fourgchannel union all
    select "channel_numberchannel", count(*) from ${config.mysql.dbName}.channel_numberchannel union all
    select "channel_bandchannel", count(*) from ${config.mysql.dbName}.channel_bandchannel union all
    select "im_alloout", count(*) from ${config.mysql.dbName}.im_alloout union all
    select "im_purchase", count(*) from ${config.mysql.dbName}.im_purchase union all
    select "im_alloout_b", count(*) from ${config.mysql.dbName}.im_alloout_b union all
    select "st_currentstock", count(*) from ${config.mysql.dbName}.st_currentstock union all
    select "st_subcurrentstock", count(*) from ${config.mysql.dbName}.st_subcurrentstock union all
    select "im_purchase_b", count(*) from ${config.mysql.dbName}.im_purchase_b union all
    select "channel_anaiysis_two", count(*) from ${config.mysql.dbName}.channel_anaiysis_two union all
    select "im_saleout_b", count(*) from ${config.mysql.dbName}.im_saleout_b union all
    select "im_saleout", count(*) from ${config.mysql.dbName}.im_saleout union all
    select "im_salesumdata", count(*) from ${config.mysql.dbName}.im_salesumdata `).then(function(result){
      fs.writeFile('exportTableName.json',JSON.stringify(result,null,4),function(err){
        if (err) reject(err);
        mysqlPool.pool.end();
        console.timeEnd("task1-exec-date");
        resolve(200);
      })
    })
  })

}
//生成导入需要的json 内容包含 表名，列名
function generateImportJsonA(){
    exportTools.generateJson(`select UPPER(table_name) as tableName,GROUP_CONCAT(DISTINCT column_name ORDER BY ORDINAL_POSITION ASC) as columns from information_schema.columns  where TABLE_SCHEMA='${config.mysql.dbName}' and TABLE_name in  (select table_name from information_schema.tables  where TABLE_SCHEMA = '${config.mysql.dbName}' and table_rows>0 ) group by table_name ;`).then(function(result){
      fs.writeFile('importTableName.json',JSON.stringify(result,null,4),function(err){
        if (err) throw err;
        console.log("generateJson-Scuess");
        generateImportJsonFiles();
      })
  })

}

function allColumns(callback){
    exportTools.generateJson('SET group_concat_max_len = 102400;').then(function(){
      exportTools.generateJson(`select UPPER(table_name) as tableName,GROUP_CONCAT(DISTINCT column_name ORDER BY ORDINAL_POSITION ASC) as columns from information_schema.columns  where TABLE_SCHEMA='${config.mysql.dbName}' and TABLE_name in  (select table_name from information_schema.tables  where TABLE_SCHEMA = '${config.mysql.dbName}' ) group by table_name ;`).then(function(result){
         callback(null,result);
      },function(err){
        callback(err);
      })
    });

}
function columnsisnull(callback){
    exportTools.generateJson(`select UPPER(table_name) as tableName,GROUP_CONCAT(DISTINCT column_name ORDER BY ORDINAL_POSITION ASC) as nullcolumns from information_schema.columns  where TABLE_SCHEMA='${config.mysql.dbName}' and is_nullable='NO' and TABLE_name in  (select table_name from information_schema.tables  where TABLE_SCHEMA = '${config.mysql.dbName}' ) group by table_name ;`).then(function(result){
       callback(null,result);
    },function(err){
      callback(err);
    })

}
//生成导入需要的json 内容包含 表名，列名,不能为空的列
function generateImportJson(){
  return new Promise(function(resolve,reject){
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
        if (err) reject(err);
        console.log("generateJson-Scuess");
        generateImportJsonFiles().then(function(result){
          console.timeEnd("task2-exec-date");
          resolve(result);
        },function(err){
            reject(500);
        });
      })
    })
  })

}

//重新生成导入需要的json 内容添加了文件名数组
function generateImportJsonFiles(){
  return new Promise(function(resolve,reject){
    var importTableArr = require('./importTableName');
    fs.readdir('csv/',function(err,files){
      var newArr =   _.reduce(importTableArr,function(mome,item){
          var arr = indexOfToArr(files,item.tableName);
          item['files'] = arr;
          mome.push(item);
          return mome;
        },[])
      fs.writeFile('importTableName.json',JSON.stringify(newArr,null,4),function(err){
        if (err) reject(500);
        resolve(200)
      })
    })
  })
}
//一个数组每个元素中查找 str，把不包含换素删除，返回结果为数组
function indexOfToArr(arr,str){
  return _.reduce(arr,function(mome,item){
    if(item.indexOf(str.toLocaleLowerCase()+"-")>-1&&item.lastIndexOf('.bak')>-1){
      mome.push(item);
    }
    return mome;
  },[])
}
//生成导入需要的ctl文件
function generateCtl(){
  return new Promise(function(resolve,reject){
    var importTableArr = require('./importTableName');
    var tasks = _.reduce(importTableArr,function(mome,item,i){
        if(item.nullcolumns){
          columns = getColumnsData(item.columns,item.nullcolumns,strnull);
        }else{
          columns = item.columns;
        }
        if (item.files.length>0) {
            mome.push(importTools.generateSrcipt(item.tableName,columns,item.files));
        }
        return mome;
    },[])
    Promise.all(tasks).then(function(result){
      console.timeEnd("task3-exec-date");
      console.log(result);
      resolve(result);
    },function(err){
      reject(err);
    })

  // var importTableArr = require('./importTableName');
  // for (var i = 0; i < importTableArr.length; i++) {
  //   var columns="" ;
  //   if(importTableArr[i].nullcolumns){
  //     columns = getColumnsData(importTableArr[i].columns,importTableArr[i].nullcolumns,strnull);
  //   }else{
  //     columns = importTableArr[i].columns;
  //   }
  //   importTools.generateSrcipt(importTableArr[i].tableName,columns,importTableArr[i].files)
  // }

  });
}
function getColumnsData(columns,nullcolumns,tag){
  columns = ','+columns+',';
  var newstr="";
  var nullArr = nullcolumns.split(',');
  for (var i = 0; i < nullArr.length; i++) {
     var flg = `,${nullArr[i]} "decode(:${nullArr[i]},null, '${tag}', :${nullArr[i]})",`;
     columns = _.replace(columns,','+nullArr[i]+',',flg);
  }
  var result = columns.substring(1,columns.length-1);
  return result;
}


// var str = "PK_INV_STATUES,PK_INVBASDOC,PK_WAREHOUSE,UNSALE,USER_BACK,USER_SAVE,BROKEN_BEFORE,BORKEN_AFTER,EX_CHECK,BORROW,EXCHANGE,DEMONSTRATE,SUM,CORP_ID,TS,DR,TEMP_VAR1,TEMP_VAR2,TEMP_VAR3,TEMP_VAR4,TEMP_VAR5,TEMP_VAR6,TEMP_VAR7,TEMP_INT1,TEMP_INT2,TEMP_INT3,AVAILABLE_SUM";
// var flg = " \"decode(:vc_attributeName,null, 'none', :vc_attributeName)\"";
// var index = str.indexOf('PK_INVBASDOC')+"PK_INVBASDOC".length;
// console.log(insert_flg(str,flg,index));
function executeCtl(){
  return new Promise(function(resolve,reject){
     fs.readdir('ctl/',function(err,files){
      var tasks = _.reduce(files,function(mome,file){
        mome.push(importTools.executeSrcipt(`ctl/${file}`));
        return mome;
      },[]);
      // Promise.all(tasks).then(function(result){
      //   console.timeEnd("task4-exec-date");
      //   console.log(result);
      //   resolve(result);
      // },function(err){
      //   reject(err);
      // })

      Promise.map(tasks, function(result) {
            console.log(result);
            return result;
        }, {concurrency: 20}
      ).then(function(results){
        console.timeEnd("task4-exec-date");
        console.log(results);
        resolve(results);
      },function(err){
        reject(err);
      });
    })
  })
}
function extractCsv(){
  return new Promise(function(resolve,reject){
    process.exec(`tar xvf csv/${config.server.from}`,
      function(error, stdout, stderr){
        if(error !== null) {
          console.log('exec error: ' + error);
          reject(500);
        }
        console.timeEnd("task1-exec-date");
        resolve(200);
    });
  })

}
//task1 生成exportTable.json
//task2 导出所有csv文件
//task3 将所有.csv.bak文件打包成tar
//task4 scp将tar文件传到config里配置的server上
function exportCsvToServer(){
  console.time("exec-date-sum");
   async.series({
     "task1":function(done){
       console.time("task1-exec-date");
       console.log("task1-生成exportTable.json");
       generateExportJson().then(function(result){
         done(null,result);
       },function(err){
         done(err);
       })
     },
     "task2":function(done){
       console.log("task2-导出所有csv文件");
       console.time("task2-exec-date");
       exportCsv().then(function(result){
         done(null,result)
       },function(err){
         done(err)
       });
     },
     "task3":function(done){
       console.log("task3-将所有.csv.bak文件打包成tar");
       console.time("task3-exec-date");
       exportTools.compressCsv().then(function(result){
         done(null,result)
       },function(err){
         done(err)
       })
     },
     "task4":function(done){
       console.log("task4-scp将tar文件传到config里配置的server上");
       console.time("task4-exec-date");
       exportTools.scpCsvToServer().then(function(result){
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
//task1 解压csv文件夹中tar文件
//task2 生成importTable.json文件
//task3 生成所有 表名.ctl文件
//task4 执行所有的.ctl文件
function importCsvOracle(){
  console.time("exec-date");
  async.series({
    "task1":function(callback){
      console.log("task1-解压csv文件夹中tar文件");
      console.time("task1-exec-date");
      extractCsv().then(function(result){
        callback(null,result);
      },function(err){
        callback(err);
      })
    },
    "task2":function(callback){
      console.log("task2-生成importTable.json文件");
      console.time("task2-exec-date");
      generateImportJson().then(function(result){
        callback(null,result);
      },function(err){
        callback(err);
      })
    },
    "task3":function(callback){
      console.log("task3-生成所有 表名.ctl文件");
      console.time("task3-exec-date");
      generateCtl().then(function(result){
        callback(null,result);
      },function(err){
        callback(err);
      })
    },
    "task4":function(callback){
      console.log("task4-执行所有的.ctl文件");
      console.time("task4-exec-date");
      executeCtl().then(function(result){
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
exports.import = importCsvOracle;
exports.export = exportCsvToServer;
exports.e1 = generateExportJson;
exports.e2 = exportCsv;
exports.e3 = exportTools.compressCsv;
exports.e4 = exportTools.scpCsvToServer;
exports.i1 = extractCsv;
exports.i2 = generateImportJson;
exports.i3 = generateCtl;
exports.i4 = executeCtl;
//exportCsvToServer();
//start();
//generateExportJson();
//generateImportJson();
//testc();
//generateCtl();
//executeCtl();
//exports.a = executeCtl;
