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

    exportTools.generateJson(`select "bd_target" as tableName, count(*) as sumLine from ctrm_develop.bd_target union all
    select "jk_ra", count(*) from ctrm_develop.jk_ra union all
    select "jc_t2002172_a", count(*) from ctrm_develop.jc_t2002172_a union all
    select "bd_controlconfig", count(*) from ctrm_develop.bd_controlconfig union all
    select "jk_province", count(*) from ctrm_develop.jk_province union all
    select "spare_test", count(*) from ctrm_develop.spare_test union all
    select "imei_repaire", count(*) from ctrm_develop.imei_repaire union all
    select "jc_t2002170_b", count(*) from ctrm_develop.jc_t2002170_b union all
    select "bd_worknotice", count(*) from ctrm_develop.bd_worknotice union all
    select "jc_t2002176", count(*) from ctrm_develop.jc_t2002176 union all
    select "jk_md_b", count(*) from ctrm_develop.jk_md_b union all
    select "jk_ti_soft", count(*) from ctrm_develop.jk_ti_soft union all
    select "jc_cs", count(*) from ctrm_develop.jc_cs union all
    select "act_ru_job", count(*) from ctrm_develop.act_ru_job union all
    select "pub_affair", count(*) from ctrm_develop.pub_affair union all
    select "chb_selection_plan", count(*) from ctrm_develop.chb_selection_plan union all
    select "jk_product", count(*) from ctrm_develop.jk_product union all
    select "bd_messagephone", count(*) from ctrm_develop.bd_messagephone union all
    select "imei_historyseristatus", count(*) from ctrm_develop.imei_historyseristatus union all
    select "pub_storpower", count(*) from ctrm_develop.pub_storpower union all
    select "jc_t2002170", count(*) from ctrm_develop.jc_t2002170 union all
    select "bd_visithistory_point", count(*) from ctrm_develop.bd_visithistory_point union all
    select "jc_t2002183_a", count(*) from ctrm_develop.jc_t2002183_a union all
    select "jc_t2002175_bb", count(*) from ctrm_develop.jc_t2002175_bb union all
    select "ch_lease", count(*) from ctrm_develop.ch_lease union all
    select "jk_md", count(*) from ctrm_develop.jk_md union all
    select "act_id_group", count(*) from ctrm_develop.act_id_group union all
    select "jk_ti_feature", count(*) from ctrm_develop.jk_ti_feature union all
    select "jc_company", count(*) from ctrm_develop.jc_company union all
    select "allot_out_b", count(*) from ctrm_develop.allot_out_b union all
    select "ch_reimburse_payment", count(*) from ctrm_develop.ch_reimburse_payment union all
    select "bd_messageconfig", count(*) from ctrm_develop.bd_messageconfig union all
    select "pub_shortmsg", count(*) from ctrm_develop.pub_shortmsg union all
    select "im_allocationorder_b", count(*) from ctrm_develop.im_allocationorder_b union all
    select "bd_retailmeasu", count(*) from ctrm_develop.bd_retailmeasu union all
    select "jc_t2002167", count(*) from ctrm_develop.jc_t2002167 union all
    select "bd_visithistory_material", count(*) from ctrm_develop.bd_visithistory_material union all
    select "jc_t2002181", count(*) from ctrm_develop.jc_t2002181 union all
    select "jk_pre", count(*) from ctrm_develop.jk_pre union all
    select "jk_fw", count(*) from ctrm_develop.jk_fw union all
    select "bd_calbody", count(*) from ctrm_develop.bd_calbody union all
    select "jk_ti_customer", count(*) from ctrm_develop.jk_ti_customer union all
    select "jc_backpurchase_b", count(*) from ctrm_develop.jc_backpurchase_b union all
    select "jc_t2002175_b", count(*) from ctrm_develop.jc_t2002175_b union all
    select "jk_fc", count(*) from ctrm_develop.jk_fc union all
    select "jc_backpurchase", count(*) from ctrm_develop.jc_backpurchase union all
    select "ch_reimburse_material", count(*) from ctrm_develop.ch_reimburse_material union all
    select "bd_retailmarketprice", count(*) from ctrm_develop.bd_retailmarketprice union all
    select "txtest", count(*) from ctrm_develop.txtest union all
    select "jc_split_b", count(*) from ctrm_develop.jc_split_b union all
    select "jk_pr", count(*) from ctrm_develop.jk_pr union all
    select "im_allocationorder", count(*) from ctrm_develop.im_allocationorder union all
    select "jk_ti", count(*) from ctrm_develop.jk_ti union all
    select "pub_voucherlist_cols", count(*) from ctrm_develop.pub_voucherlist_cols union all
    select "im_apply_b", count(*) from ctrm_develop.im_apply_b union all
    select "jc_t2002175", count(*) from ctrm_develop.jc_t2002175 union all
    select "jk_ea", count(*) from ctrm_develop.jk_ea union all
    select "im_pos_depa", count(*) from ctrm_develop.im_pos_depa union all
    select "act_ru_event_subscr", count(*) from ctrm_develop.act_ru_event_subscr union all
    select "ch_reimburse_charge", count(*) from ctrm_develop.ch_reimburse_charge union all
    select "pj_saleout", count(*) from ctrm_develop.pj_saleout union all
    select "jk_ppc", count(*) from ctrm_develop.jk_ppc union all
    select "im_allocation_b", count(*) from ctrm_develop.im_allocation_b union all
    select "transfer_currentstock", count(*) from ctrm_develop.transfer_currentstock union all
    select "jc_split", count(*) from ctrm_develop.jc_split union all
    select "jk_rr", count(*) from ctrm_develop.jk_rr union all
    select "pub_voucherlist", count(*) from ctrm_develop.pub_voucherlist union all
    select "im_apply", count(*) from ctrm_develop.im_apply union all
    select "jc_t2002174", count(*) from ctrm_develop.jc_t2002174 union all
    select "bdc_distributor_b", count(*) from ctrm_develop.bdc_distributor_b union all
    select "ch_reimburse", count(*) from ctrm_develop.ch_reimburse union all
    select "jk_demo", count(*) from ctrm_develop.jk_demo union all
    select "jc_t2002179", count(*) from ctrm_develop.jc_t2002179 union all
    select "bd_marketprice", count(*) from ctrm_develop.bd_marketprice union all
    select "jk_pp", count(*) from ctrm_develop.jk_pp union all
    select "im_allocation", count(*) from ctrm_develop.im_allocation union all
    select "bd_reprice", count(*) from ctrm_develop.bd_reprice union all
    select "jc_shopattribute", count(*) from ctrm_develop.jc_shopattribute union all
    select "bd_billprint", count(*) from ctrm_develop.bd_billprint union all
    select "jk_rp_fee", count(*) from ctrm_develop.jk_rp_fee union all
    select "im_allot_b", count(*) from ctrm_develop.im_allot_b union all
    select "jc_t2002173", count(*) from ctrm_develop.jc_t2002173 union all
    select "act_re_model", count(*) from ctrm_develop.act_re_model union all
    select "bd_stoandproxy", count(*) from ctrm_develop.bd_stoandproxy union all
    select "jk_cr", count(*) from ctrm_develop.jk_cr union all
    select "jk_pi", count(*) from ctrm_develop.jk_pi union all
    select "goldkeyuser", count(*) from ctrm_develop.goldkeyuser union all
    select "jc_purperiod", count(*) from ctrm_develop.jc_purperiod union all
    select "jk_ri", count(*) from ctrm_develop.jk_ri union all
    select "im_allot", count(*) from ctrm_develop.im_allot union all
    select "jc_t2002172_e", count(*) from ctrm_develop.jc_t2002172_e union all
    select "bd_statelogic", count(*) from ctrm_develop.bd_statelogic union all
    select "jk_vi", count(*) from ctrm_develop.jk_vi union all
    select "jk_ck", count(*) from ctrm_develop.jk_ck union all
    select "eb_invoice", count(*) from ctrm_develop.eb_invoice union all
    select "jk_pa", count(*) from ctrm_develop.jk_pa union all
    select "jc_ps", count(*) from ctrm_develop.jc_ps union all
    select "newtable", count(*) from ctrm_develop.newtable union all
    select "jc_t2002172_d", count(*) from ctrm_develop.jc_t2002172_d union all
    select "allot_out", count(*) from ctrm_develop.allot_out union all
    select "bd_tmpstordoc", count(*) from ctrm_develop.bd_tmpstordoc union all
    select "jk_rd_b", count(*) from ctrm_develop.jk_rd_b union all
    select "bd_intelimp", count(*) from ctrm_develop.bd_intelimp union all
    select "jk_vendor", count(*) from ctrm_develop.jk_vendor union all
    select "jk_ca", count(*) from ctrm_develop.jk_ca union all
    select "act_id_user", count(*) from ctrm_develop.act_id_user union all
    select "jk_od_item", count(*) from ctrm_develop.jk_od_item union all
    select "jk_tp_phase", count(*) from ctrm_develop.jk_tp_phase union all
    select "jc_pf", count(*) from ctrm_develop.jc_pf union all
    select "jc_t2002178_b", count(*) from ctrm_develop.jc_t2002178_b union all
    select "allot_app", count(*) from ctrm_develop.allot_app union all
    select "bd_batch_stor", count(*) from ctrm_develop.bd_batch_stor union all
    select "act_hi_attachment", count(*) from ctrm_develop.act_hi_attachment union all
    select "jk_rd", count(*) from ctrm_develop.jk_rd union all
    select "jc_t2002172_c", count(*) from ctrm_develop.jc_t2002172_c union all
    select "bd_inteandchan", count(*) from ctrm_develop.bd_inteandchan union all
    select "jk_ac", count(*) from ctrm_develop.jk_ac union all
    select "dzq_data_repair", count(*) from ctrm_develop.dzq_data_repair union all
    select "bd_mold", count(*) from ctrm_develop.bd_mold union all
    select "act_id_membership", count(*) from ctrm_develop.act_id_membership union all
    select "bd_worknotice_b_b", count(*) from ctrm_develop.bd_worknotice_b_b union all
    select "jk_tp_fee", count(*) from ctrm_develop.jk_tp_fee union all
    select "jc_opupdate", count(*) from ctrm_develop.jc_opupdate union all
    select "jc_t2002178", count(*) from ctrm_develop.jc_t2002178 union all
    select "jk_od_arrivalitem", count(*) from ctrm_develop.jk_od_arrivalitem union all
    select "bd_cuanhuo", count(*) from ctrm_develop.bd_cuanhuo union all
    select "bd_target_b", count(*) from ctrm_develop.bd_target_b union all
    select "jk_rc", count(*) from ctrm_develop.jk_rc union all
    select "jc_t2002172_b", count(*) from ctrm_develop.jc_t2002172_b union all
    select "jc_uploadresult", count(*) from ctrm_develop.jc_uploadresult union all
    select "dzq_data", count(*) from ctrm_develop.dzq_data union all
    select "act_id_info", count(*) from ctrm_develop.act_id_info union all
    select "bd_worknotice_b", count(*) from ctrm_develop.bd_worknotice_b union all
    select "jk_tp", count(*) from ctrm_develop.jk_tp union all
    select "bd_promotion", count(*) from ctrm_develop.bd_promotion union all
    select "jc_lp", count(*) from ctrm_develop.jc_lp union all
    select "jc_t2002177", count(*) from ctrm_develop.jc_t2002177 union all
    select "jk_od", count(*) from ctrm_develop.jk_od union all
    select "bd_campusimp", count(*) from ctrm_develop.bd_campusimp union all
    select "act_evt_log", count(*) from ctrm_develop.act_evt_log union all
    select "channel_suggest", count(*) from ctrm_develop.channel_suggest union all
    select "ch_maxcode", count(*) from ctrm_develop.ch_maxcode union all
    select "ch_supplier", count(*) from ctrm_develop.ch_supplier union all
    select "act_ge_property", count(*) from ctrm_develop.act_ge_property union all
    select "bd_messagephone_b", count(*) from ctrm_develop.bd_messagephone_b union all
    select "ch_lease_b", count(*) from ctrm_develop.ch_lease_b union all
    select "bd_invprice_devalue", count(*) from ctrm_develop.bd_invprice_devalue union all
    select "ch_contract", count(*) from ctrm_develop.ch_contract union all
    select "retail_check_imei", count(*) from ctrm_develop.retail_check_imei union all
    select "bd_version", count(*) from ctrm_develop.bd_version union all
    select "pj_saleout_b", count(*) from ctrm_develop.pj_saleout_b union all
    select "bd_chantype", count(*) from ctrm_develop.bd_chantype union all
    select "bd_dischanproxy", count(*) from ctrm_develop.bd_dischanproxy union all
    select "pj_purchase", count(*) from ctrm_develop.pj_purchase union all
    select "bd_reason", count(*) from ctrm_develop.bd_reason union all
    select "bd_inv_channel_purchase_price", count(*) from ctrm_develop.bd_inv_channel_purchase_price union all
    select "bd_keypoint", count(*) from ctrm_develop.bd_keypoint union all
    select "bd_area", count(*) from ctrm_develop.bd_area union all
    select "ch_leasetarget", count(*) from ctrm_develop.ch_leasetarget union all
    select "jc_tl", count(*) from ctrm_develop.jc_tl union all
    select "bd_saleflag", count(*) from ctrm_develop.bd_saleflag union all
    select "bd_price_part", count(*) from ctrm_develop.bd_price_part union all
    select "bd_channeltype", count(*) from ctrm_develop.bd_channeltype union all
    select "ch_budget", count(*) from ctrm_develop.ch_budget union all
    select "ch_producttype", count(*) from ctrm_develop.ch_producttype union all
    select "bd_level_color", count(*) from ctrm_develop.bd_level_color union all
    select "bd_userdef", count(*) from ctrm_develop.bd_userdef union all
    select "bd_numberstate", count(*) from ctrm_develop.bd_numberstate union all
    select "bd_mold_b", count(*) from ctrm_develop.bd_mold_b union all
    select "bd_statedoc", count(*) from ctrm_develop.bd_statedoc union all
    select "bd_invcl", count(*) from ctrm_develop.bd_invcl union all
    select "bd_member", count(*) from ctrm_develop.bd_member union all
    select "bd_userdef_quote", count(*) from ctrm_develop.bd_userdef_quote union all
    select "bd_inv_channel_saleprice", count(*) from ctrm_develop.bd_inv_channel_saleprice union all
    select "pj_currentstock", count(*) from ctrm_develop.pj_currentstock union all
    select "pub_nocheck_tac", count(*) from ctrm_develop.pub_nocheck_tac union all
    select "routine_maintain", count(*) from ctrm_develop.routine_maintain union all
    select "bd_partstype", count(*) from ctrm_develop.bd_partstype union all
    select "ch_budget_b", count(*) from ctrm_develop.ch_budget_b union all
    select "pj_purchase_b", count(*) from ctrm_develop.pj_purchase_b union all
    select "exe_selec", count(*) from ctrm_develop.exe_selec union all
    select "bd_saletype", count(*) from ctrm_develop.bd_saletype union all
    select "ch_materialtype", count(*) from ctrm_develop.ch_materialtype union all
    select "bd_saleprice", count(*) from ctrm_develop.bd_saleprice union all
    select "eb_shop", count(*) from ctrm_develop.eb_shop union all
    select "aaa", count(*) from ctrm_develop.aaa union all
    select "pub_scrollmsg", count(*) from ctrm_develop.pub_scrollmsg union all
    select "act_re_procdef", count(*) from ctrm_develop.act_re_procdef union all
    select "rpt_rsmonthly_corp", count(*) from ctrm_develop.rpt_rsmonthly_corp union all
    select "act_re_deployment", count(*) from ctrm_develop.act_re_deployment union all
    select "ch_deployment", count(*) from ctrm_develop.ch_deployment union all
    select "im_check", count(*) from ctrm_develop.im_check union all
    select "bd_role", count(*) from ctrm_develop.bd_role union all
    select "sm_seristatus", count(*) from ctrm_develop.sm_seristatus union all
    select "bd_channelindex", count(*) from ctrm_develop.bd_channelindex union all
    select "act_ru_task", count(*) from ctrm_develop.act_ru_task union all
    select "bd_faulttypeb", count(*) from ctrm_develop.bd_faulttypeb union all
    select "ch_agency", count(*) from ctrm_develop.ch_agency union all
    select "bdc_leaseprice", count(*) from ctrm_develop.bdc_leaseprice union all
    select "ch_grant", count(*) from ctrm_develop.ch_grant union all
    select "ch_endreport", count(*) from ctrm_develop.ch_endreport union all
    select "bd_partsbrand", count(*) from ctrm_develop.bd_partsbrand union all
    select "ch_begincheck", count(*) from ctrm_develop.ch_begincheck union all
    select "bd_channel_point", count(*) from ctrm_develop.bd_channel_point union all
    select "channel_items", count(*) from ctrm_develop.channel_items union all
    select "bd_storprice", count(*) from ctrm_develop.bd_storprice union all
    select "act_ru_execution", count(*) from ctrm_develop.act_ru_execution union all
    select "act_hi_procinst", count(*) from ctrm_develop.act_hi_procinst union all
    select "bd_userdef_doc", count(*) from ctrm_develop.bd_userdef_doc union all
    select "bd_purprice_city", count(*) from ctrm_develop.bd_purprice_city union all
    select "ch_target", count(*) from ctrm_develop.ch_target union all
    select "ch_stock", count(*) from ctrm_develop.ch_stock union all
    select "demo_user", count(*) from ctrm_develop.demo_user union all
    select "eb_shop_address", count(*) from ctrm_develop.eb_shop_address union all
    select "ch_businesstype", count(*) from ctrm_develop.ch_businesstype union all
    select "jys_cityappdate", count(*) from ctrm_develop.jys_cityappdate union all
    select "tem_pub_billtemplatebb", count(*) from ctrm_develop.tem_pub_billtemplatebb union all
    select "stock_transferb", count(*) from ctrm_develop.stock_transferb union all
    select "stock_transfer", count(*) from ctrm_develop.stock_transfer union all
    select "jys_test_stordoc", count(*) from ctrm_develop.jys_test_stordoc union all
    select "bd_invwinthebidding", count(*) from ctrm_develop.bd_invwinthebidding union all
    select "ch_decorationplan", count(*) from ctrm_develop.ch_decorationplan union all
    select "bd_measdoc", count(*) from ctrm_develop.bd_measdoc union all
    select "pub_corp_chanel", count(*) from ctrm_develop.pub_corp_chanel union all
    select "channel_numbercity", count(*) from ctrm_develop.channel_numbercity union all
    select "bd_terminalprice", count(*) from ctrm_develop.bd_terminalprice union all
    select "channel_bandcity", count(*) from ctrm_develop.channel_bandcity union all
    select "ch_apply", count(*) from ctrm_develop.ch_apply union all
    select "eb_shopcart", count(*) from ctrm_develop.eb_shopcart union all
    select "bd_partsinfo", count(*) from ctrm_develop.bd_partsinfo union all
    select "ch_winningpro", count(*) from ctrm_develop.ch_winningpro union all
    select "ch_endcheck_list", count(*) from ctrm_develop.ch_endcheck_list union all
    select "bd_filiale", count(*) from ctrm_develop.bd_filiale union all
    select "bd_invsort", count(*) from ctrm_develop.bd_invsort union all
    select "chb_project", count(*) from ctrm_develop.chb_project union all
    select "ch_material", count(*) from ctrm_develop.ch_material union all
    select "ch_alloout", count(*) from ctrm_develop.ch_alloout union all
    select "ch_decorationplan_b", count(*) from ctrm_develop.ch_decorationplan_b union all
    select "act_hi_taskinst", count(*) from ctrm_develop.act_hi_taskinst union all
    select "im_borrow_b", count(*) from ctrm_develop.im_borrow_b union all
    select "im_borrow", count(*) from ctrm_develop.im_borrow union all
    select "bd_emis_role", count(*) from ctrm_develop.bd_emis_role union all
    select "bd_type", count(*) from ctrm_develop.bd_type union all
    select "act_ge_bytearray", count(*) from ctrm_develop.act_ge_bytearray union all
    select "bd_camimpstordoc", count(*) from ctrm_develop.bd_camimpstordoc union all
    select "bd_customer_type", count(*) from ctrm_develop.bd_customer_type union all
    select "im_allodemand", count(*) from ctrm_develop.im_allodemand union all
    select "im_provincepurplan", count(*) from ctrm_develop.im_provincepurplan union all
    select "ch_writeoff", count(*) from ctrm_develop.ch_writeoff union all
    select "bd_district", count(*) from ctrm_develop.bd_district union all
    select "act_hi_comment", count(*) from ctrm_develop.act_hi_comment union all
    select "bd_caminvbasdoc", count(*) from ctrm_develop.bd_caminvbasdoc union all
    select "ch_apply_b", count(*) from ctrm_develop.ch_apply_b union all
    select "ch_decorationplan_list", count(*) from ctrm_develop.ch_decorationplan_list union all
    select "im_allodemand_b", count(*) from ctrm_develop.im_allodemand_b union all
    select "ch_repairlist", count(*) from ctrm_develop.ch_repairlist union all
    select "act_ru_identitylink", count(*) from ctrm_develop.act_ru_identitylink union all
    select "act_hi_identitylink", count(*) from ctrm_develop.act_hi_identitylink union all
    select "visittask_county_point", count(*) from ctrm_develop.visittask_county_point union all
    select "ch_grant_b", count(*) from ctrm_develop.ch_grant_b union all
    select "channel_fourgcity", count(*) from ctrm_develop.channel_fourgcity union all
    select "ch_member", count(*) from ctrm_develop.ch_member union all
    select "bd_channel_visithistory", count(*) from ctrm_develop.bd_channel_visithistory union all
    select "bd_alloapproval", count(*) from ctrm_develop.bd_alloapproval union all
    select "pub_sysinittemp", count(*) from ctrm_develop.pub_sysinittemp union all
    select "pub_sysinit", count(*) from ctrm_develop.pub_sysinit union all
    select "ch_deployment_subprocess_b", count(*) from ctrm_develop.ch_deployment_subprocess_b union all
    select "bd_jzstore", count(*) from ctrm_develop.bd_jzstore union all
    select "chb_plan", count(*) from ctrm_develop.chb_plan union all
    select "bdc_channeltype", count(*) from ctrm_develop.bdc_channeltype union all
    select "act_hi_actinst", count(*) from ctrm_develop.act_hi_actinst union all
    select "ch_writeoff_b", count(*) from ctrm_develop.ch_writeoff_b union all
    select "chb_plan_b", count(*) from ctrm_develop.chb_plan_b union all
    select "visittask_county", count(*) from ctrm_develop.visittask_county union all
    select "ch_alloout_b", count(*) from ctrm_develop.ch_alloout_b union all
    select "imei_serpower", count(*) from ctrm_develop.imei_serpower union all
    select "visittask_county_material", count(*) from ctrm_develop.visittask_county_material union all
    select "visittask_province_point", count(*) from ctrm_develop.visittask_province_point union all
    select "pub_regexp", count(*) from ctrm_develop.pub_regexp union all
    select "visittask_city_point", count(*) from ctrm_develop.visittask_city_point union all
    select "visittask_city", count(*) from ctrm_develop.visittask_city union all
    select "visittask_city_material", count(*) from ctrm_develop.visittask_city_material union all
    select "visittask_province_material", count(*) from ctrm_develop.visittask_province_material union all
    select "visittask_county_b", count(*) from ctrm_develop.visittask_county_b union all
    select "temp_emis_user", count(*) from ctrm_develop.temp_emis_user union all
    select "bd_partsprice", count(*) from ctrm_develop.bd_partsprice union all
    select "ch_deployment_b", count(*) from ctrm_develop.ch_deployment_b union all
    select "bd_g3cubasdochan", count(*) from ctrm_develop.bd_g3cubasdochan union all
    select "act_hi_varinst", count(*) from ctrm_develop.act_hi_varinst union all
    select "act_ru_variable", count(*) from ctrm_develop.act_ru_variable union all
    select "act_hi_detail", count(*) from ctrm_develop.act_hi_detail union all
    select "im_exchange", count(*) from ctrm_develop.im_exchange union all
    select "im_exchange_b", count(*) from ctrm_develop.im_exchange_b union all
    select "chb_plan_target", count(*) from ctrm_develop.chb_plan_target union all
    select "ch_endphoto", count(*) from ctrm_develop.ch_endphoto union all
    select "bd_channel_material", count(*) from ctrm_develop.bd_channel_material union all
    select "bd_faulttype", count(*) from ctrm_develop.bd_faulttype union all
    select "bd_channel_point_b", count(*) from ctrm_develop.bd_channel_point_b union all
    select "temp_phone_code", count(*) from ctrm_develop.temp_phone_code union all
    select "visittask_province", count(*) from ctrm_develop.visittask_province union all
    select "bd_spinvbasdoc", count(*) from ctrm_develop.bd_spinvbasdoc union all
    select "eb_terminal", count(*) from ctrm_develop.eb_terminal union all
    select "bd_supply", count(*) from ctrm_develop.bd_supply union all
    select "im_check_b", count(*) from ctrm_develop.im_check_b union all
    select "ch_seriesstatus", count(*) from ctrm_develop.ch_seriesstatus union all
    select "bd_billtype", count(*) from ctrm_develop.bd_billtype union all
    select "ch_billseries", count(*) from ctrm_develop.ch_billseries union all
    select "bd_mobiletype", count(*) from ctrm_develop.bd_mobiletype union all
    select "chb_selection", count(*) from ctrm_develop.chb_selection union all
    select "eb_order", count(*) from ctrm_develop.eb_order union all
    select "eb_orderitem", count(*) from ctrm_develop.eb_orderitem union all
    select "eb_terminal_detail", count(*) from ctrm_develop.eb_terminal_detail union all
    select "imei_serpow_b", count(*) from ctrm_develop.imei_serpow_b union all
    select "jys_citysaledata", count(*) from ctrm_develop.jys_citysaledata union all
    select "eb_stock", count(*) from ctrm_develop.eb_stock union all
    select "jys_panorama_appchannel12", count(*) from ctrm_develop.jys_panorama_appchannel12 union all
    select "eb_image", count(*) from ctrm_develop.eb_image union all
    select "bd_stordoc_chain", count(*) from ctrm_develop.bd_stordoc_chain union all
    select "channel_map_point", count(*) from ctrm_develop.channel_map_point union all
    select "bdc_business", count(*) from ctrm_develop.bdc_business union all
    select "ch_wfhistory", count(*) from ctrm_develop.ch_wfhistory union all
    select "pj_stockhistory", count(*) from ctrm_develop.pj_stockhistory union all
    select "pub_billtemplate", count(*) from ctrm_develop.pub_billtemplate union all
    select "jys_countryappdate", count(*) from ctrm_develop.jys_countryappdate union all
    select "jys_panorama_appchannel", count(*) from ctrm_develop.jys_panorama_appchannel union all
    select "bdc_leasedoc", count(*) from ctrm_develop.bdc_leasedoc union all
    select "channel_numbercounty", count(*) from ctrm_develop.channel_numbercounty union all
    select "channel_bandcounty", count(*) from ctrm_develop.channel_bandcounty union all
    select "bd_channel_visit", count(*) from ctrm_develop.bd_channel_visit union all
    select "jys_appcountynum", count(*) from ctrm_develop.jys_appcountynum union all
    select "tem_busi", count(*) from ctrm_develop.tem_busi union all
    select "jc_t2002180", count(*) from ctrm_develop.jc_t2002180 union all
    select "rpt_rtmonthly_supply", count(*) from ctrm_develop.rpt_rtmonthly_supply union all
    select "pub_ref_relation", count(*) from ctrm_develop.pub_ref_relation union all
    select "bd_comseries", count(*) from ctrm_develop.bd_comseries union all
    select "im_citypurplan", count(*) from ctrm_develop.im_citypurplan union all
    select "bd_branddoc", count(*) from ctrm_develop.bd_branddoc union all
    select "pub_group", count(*) from ctrm_develop.pub_group union all
    select "ser_dispose", count(*) from ctrm_develop.ser_dispose union all
    select "imei_serseristatus", count(*) from ctrm_develop.imei_serseristatus union all
    select "channel_fourgcounty", count(*) from ctrm_develop.channel_fourgcounty union all
    select "imei_billseries_spare", count(*) from ctrm_develop.imei_billseries_spare union all
    select "imei_seristatus_spare", count(*) from ctrm_develop.imei_seristatus_spare union all
    select "bd_invwinthebidding_b", count(*) from ctrm_develop.bd_invwinthebidding_b union all
    select "bd_serstor", count(*) from ctrm_develop.bd_serstor union all
    select "rpt_rsmonthly_supply", count(*) from ctrm_develop.rpt_rsmonthly_supply union all
    select "wer", count(*) from ctrm_develop.wer union all
    select "bd_purchaseprice", count(*) from ctrm_develop.bd_purchaseprice union all
    select "bd_billcode_rule", count(*) from ctrm_develop.bd_billcode_rule union all
    select "eb_orderhistory", count(*) from ctrm_develop.eb_orderhistory union all
    select "pub_billtemplatebb", count(*) from ctrm_develop.pub_billtemplatebb union all
    select "visittask_city_b", count(*) from ctrm_develop.visittask_city_b union all
    select "pub_query_templet", count(*) from ctrm_develop.pub_query_templet union all
    select "bd_billcode_max", count(*) from ctrm_develop.bd_billcode_max union all
    select "ch_wfinterface", count(*) from ctrm_develop.ch_wfinterface union all
    select "eb_message", count(*) from ctrm_develop.eb_message union all
    select "pub_emis_corp", count(*) from ctrm_develop.pub_emis_corp union all
    select "bd_inteltac", count(*) from ctrm_develop.bd_inteltac union all
    select "bd_cubasdoc", count(*) from ctrm_develop.bd_cubasdoc union all
    select "jys_channelapp", count(*) from ctrm_develop.jys_channelapp union all
    select "im_citypurplan_b", count(*) from ctrm_develop.im_citypurplan_b union all
    select "im_provincepurplan_b", count(*) from ctrm_develop.im_provincepurplan_b union all
    select "bd_channel_image", count(*) from ctrm_develop.bd_channel_image union all
    select "pub_fast", count(*) from ctrm_develop.pub_fast union all
    select "sms_info", count(*) from ctrm_develop.sms_info union all
    select "visittask_province_b", count(*) from ctrm_develop.visittask_province_b union all
    select "imei_serbillseries", count(*) from ctrm_develop.imei_serbillseries union all
    select "bd_stordoc_relation", count(*) from ctrm_develop.bd_stordoc_relation union all
    select "imei_tempseristatus", count(*) from ctrm_develop.imei_tempseristatus union all
    select "jys_countysaledata", count(*) from ctrm_develop.jys_countysaledata union all
    select "channel_apploginlog", count(*) from ctrm_develop.channel_apploginlog union all
    select "imei_seristatus", count(*) from ctrm_develop.imei_seristatus union all
    select "temp_stor_busi", count(*) from ctrm_develop.temp_stor_busi union all
    select "rpt_rtmonthly_inv", count(*) from ctrm_develop.rpt_rtmonthly_inv union all
    select "pub_billtemplateb", count(*) from ctrm_develop.pub_billtemplateb union all
    select "ser_sepair_in", count(*) from ctrm_develop.ser_sepair_in union all
    select "temp_user_channel", count(*) from ctrm_develop.temp_user_channel union all
    select "im_purorder", count(*) from ctrm_develop.im_purorder union all
    select "ser_depot_in", count(*) from ctrm_develop.ser_depot_in union all
    select "ser_depot_out", count(*) from ctrm_develop.ser_depot_out union all
    select "test", count(*) from ctrm_develop.test union all
    select "channel_branch", count(*) from ctrm_develop.channel_branch union all
    select "test123", count(*) from ctrm_develop.test123 union all
    select "pub_query_condition", count(*) from ctrm_develop.pub_query_condition union all
    select "rpt_rpmonthly_supply", count(*) from ctrm_develop.rpt_rpmonthly_supply union all
    select "imei_billseries", count(*) from ctrm_develop.imei_billseries union all
    select "pub_corp", count(*) from ctrm_develop.pub_corp union all
    select "temp_update_corp", count(*) from ctrm_develop.temp_update_corp union all
    select "temp_pub_corp", count(*) from ctrm_develop.temp_pub_corp union all
    select "pub_funcregister", count(*) from ctrm_develop.pub_funcregister union all
    select "bdc_distributor", count(*) from ctrm_develop.bdc_distributor union all
    select "bd_rescode", count(*) from ctrm_develop.bd_rescode union all
    select "bd_promoter", count(*) from ctrm_develop.bd_promoter union all
    select "rpt_etmonthly_corp", count(*) from ctrm_develop.rpt_etmonthly_corp union all
    select "bd_price", count(*) from ctrm_develop.bd_price union all
    select "bd_invbasdoc", count(*) from ctrm_develop.bd_invbasdoc union all
    select "rpt_dbmonthly", count(*) from ctrm_develop.rpt_dbmonthly union all
    select "ser_sepair_out", count(*) from ctrm_develop.ser_sepair_out union all
    select "pub_tacdata", count(*) from ctrm_develop.pub_tacdata union all
    select "bd_inv_supply", count(*) from ctrm_develop.bd_inv_supply union all
    select "im_purorder_b", count(*) from ctrm_develop.im_purorder_b union all
    select "rpt_rtmonthly_corp", count(*) from ctrm_develop.rpt_rtmonthly_corp union all
    select "im_plsaleout", count(*) from ctrm_develop.im_plsaleout union all
    select "im_spepurchase", count(*) from ctrm_develop.im_spepurchase union all
    select "bd_color", count(*) from ctrm_develop.bd_color union all
    select "rpt_rpmonthly_inv", count(*) from ctrm_develop.rpt_rpmonthly_inv union all
    select "20160217", count(*) from ctrm_develop.20160217 union all
    select "pub_user_copy", count(*) from ctrm_develop.pub_user_copy union all
    select "pub_user", count(*) from ctrm_develop.pub_user union all
    select "im_plsaleout_b", count(*) from ctrm_develop.im_plsaleout_b union all
    select "im_spepurchase_b", count(*) from ctrm_develop.im_spepurchase_b union all
    select "pub_online_users", count(*) from ctrm_develop.pub_online_users union all
    select "temp_stordoc_zsbj", count(*) from ctrm_develop.temp_stordoc_zsbj union all
    select "bd_depactivities", count(*) from ctrm_develop.bd_depactivities union all
    select "ser_depot_out_b", count(*) from ctrm_develop.ser_depot_out_b union all
    select "ser_sepair_in_b", count(*) from ctrm_develop.ser_sepair_in_b union all
    select "ser_depot_in_b", count(*) from ctrm_develop.ser_depot_in_b union all
    select "bdc_area", count(*) from ctrm_develop.bdc_area union all
    select "tmp_0223", count(*) from ctrm_develop.tmp_0223 union all
    select "pub_channel_user", count(*) from ctrm_develop.pub_channel_user union all
    select "pub_emis_user", count(*) from ctrm_develop.pub_emis_user union all
    select "channel_bandmanager", count(*) from ctrm_develop.channel_bandmanager union all
    select "channel_saledata", count(*) from ctrm_develop.channel_saledata union all
    select "channel_numbermanager", count(*) from ctrm_develop.channel_numbermanager union all
    select "channel_fourgmanager", count(*) from ctrm_develop.channel_fourgmanager union all
    select "bd_proxy", count(*) from ctrm_develop.bd_proxy union all
    select "ser_sepair_out_b", count(*) from ctrm_develop.ser_sepair_out_b union all
    select "bd_compare", count(*) from ctrm_develop.bd_compare union all
    select "area_temp", count(*) from ctrm_develop.area_temp union all
    select "jc_t2002180_copy", count(*) from ctrm_develop.jc_t2002180_copy union all
    select "pub_operatelog", count(*) from ctrm_develop.pub_operatelog union all
    select "ser_maintain", count(*) from ctrm_develop.ser_maintain union all
    select "rpt_rpmonthly_corp", count(*) from ctrm_develop.rpt_rpmonthly_corp union all
    select "temp_channel_stodoc", count(*) from ctrm_develop.temp_channel_stodoc union all
    select "channel_bill", count(*) from ctrm_develop.channel_bill union all
    select "im_allonotify", count(*) from ctrm_develop.im_allonotify union all
    select "pub_userandcorp", count(*) from ctrm_develop.pub_userandcorp union all
    select "im_allonotify_b", count(*) from ctrm_develop.im_allonotify_b union all
    select "channel_anaiysis", count(*) from ctrm_develop.channel_anaiysis union all
    select "ser_maintainrc", count(*) from ctrm_develop.ser_maintainrc union all
    select "pub_userandgroup", count(*) from ctrm_develop.pub_userandgroup union all
    select "pub_funpower", count(*) from ctrm_develop.pub_funpower union all
    select "bd_depactivities_b", count(*) from ctrm_develop.bd_depactivities_b union all
    select "channel_ranking", count(*) from ctrm_develop.channel_ranking union all
    select "bd_stordoc", count(*) from ctrm_develop.bd_stordoc union all
    select "channel_fourgchannel", count(*) from ctrm_develop.channel_fourgchannel union all
    select "channel_numberchannel", count(*) from ctrm_develop.channel_numberchannel union all
    select "channel_bandchannel", count(*) from ctrm_develop.channel_bandchannel union all
    select "im_alloout", count(*) from ctrm_develop.im_alloout union all
    select "im_purchase", count(*) from ctrm_develop.im_purchase union all
    select "im_alloout_b", count(*) from ctrm_develop.im_alloout_b union all
    select "st_currentstock", count(*) from ctrm_develop.st_currentstock union all
    select "st_subcurrentstock", count(*) from ctrm_develop.st_subcurrentstock union all
    select "im_purchase_b", count(*) from ctrm_develop.im_purchase_b union all
    select "channel_anaiysis_two", count(*) from ctrm_develop.channel_anaiysis_two union all
    select "im_saleout_b", count(*) from ctrm_develop.im_saleout_b union all
    select "im_saleout", count(*) from ctrm_develop.im_saleout union all
    select "im_salesumdata", count(*) from ctrm_develop.im_salesumdata `).then(function(result){
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
      exportTools.generateJson(`select UPPER(table_name) as tableName,GROUP_CONCAT(DISTINCT column_name ORDER BY ORDINAL_POSITION ASC) as columns from information_schema.columns  where TABLE_SCHEMA='${config.mysql.dbName}' and TABLE_name in  (select table_name from information_schema.tables  where TABLE_SCHEMA = '${config.mysql.dbName}' and table_rows>0 ) group by table_name ;`).then(function(result){
         callback(null,result);
      },function(err){
        callback(err);
      })
    });

}
function columnsisnull(callback){
    exportTools.generateJson(`select UPPER(table_name) as tableName,GROUP_CONCAT(DISTINCT column_name ORDER BY ORDINAL_POSITION ASC) as nullcolumns from information_schema.columns  where TABLE_SCHEMA='${config.mysql.dbName}' and is_nullable='NO' and TABLE_name in  (select table_name from information_schema.tables  where TABLE_SCHEMA = '${config.mysql.dbName}' and table_rows>0 ) group by table_name ;`).then(function(result){
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
    if(item.indexOf(str+"-")>-1&&item.lastIndexOf('.bak')>-1){
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
        mome.push(importTools.generateSrcipt(item.tableName,columns,item.files));
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
