import _ from 'lodash';

//import FakeModel from './fake-model';

import onAccountBalance from 'models/onAccount/onAccountBalance/';

import _less from './grid-onaccount-balance.less!';
import template from './template.stache!';
import Grid from 'components/grid/';
import stache from 'can/view/stache/';
import utils from 'components/page-on-account/utils';
import requestHelper from 'utils/request/';

var OnAccountBalance = Grid.extend({
  tag: 'rn-onaccount-balance-grid',
  template: template,
  scope: {
    columns: [
      {
        id: 'Licensor',
        title: 'Licensor',
        contents: function(row) { 
            if(row.attr('tfooter')){
            return  stache('{{#unless isChild}}<span class="open-toggle"></span>{{/unless}} {{Licensor}}')({Licensor: row.Licensor, isChild: row.__isChild});;
          }
          return row.attr('Licensor');
         }
      },
      {
        id: 'Currency',
        title: 'Currency'
      },
      {
        id: 'ContentType',
        title: 'Content Type'
      }
    ],
    request:{},
    emptyrows:"@",
    appstate:undefined
  },
  init: function(){

    

    },
  events: {
    'inserted': function(ev) {
       var self = this;
       //console.log("inserted "+JSON.stringify(self.scope.request.searchRequest.attr()));
       if(self.scope.request != null && self.scope.request != undefined && self.scope.request.quarters != null && self.scope.request.quarters != undefined){
         var quarters = self.scope.request.quarters;

         for(var i=0;i<quarters.length;i++){
          var column={
            id:quarters[i],
            title:quarters[i]
          };
          self.scope.columns.push(column);
         }

          var balanceColumn={
            id:'onAccountBalance',
            title:'onAccount Balance'
          };
          self.scope.columns.push(balanceColumn);

          var cashAdjustColumn={
            id:'cashAdjust',
            title:'Licensor Cash Adjustment'
          };
          self.scope.columns.push(cashAdjustColumn);

          //console.log('EntityId');
          //console.log(self.scope.request.searchRequest.entityId.attr());

          // var genObj = {};
          // genObj.searchRequest={};
          // genObj.searchRequest["type"]="BALANCE";
          // genObj.searchRequest["serviceTypeId"]="1";
          // genObj.searchRequest["entityId"]=self.scope.request.searchRequest.entityId.attr();
          // genObj.searchRequest["contentGrpId"]=self.scope.request.searchRequest.contentGrpId.attr();
          // genObj.searchRequest["regionId"]=self.scope.request.searchRequest.regionId;
          // genObj.searchRequest["periodType"]="Q";
          // genObj.searchRequest["periodFrom"]=self.scope.request.searchRequest.periodFrom;
          // genObj.searchRequest["periodTo"]=self.scope.request.searchRequest.periodTo;
     
         // onAccountBalance.findOne(UserReq.formRequestDetails(genObj)).then(function(rows) {
         //  //onAccountBalance.findAll().then(function(rows) {
            
         //    self.scope.rows.replace(getUiRowsFromResponse(quarters,rows));
      
         //   // var footerRows = getFooterRows(quarters,rows);
         //   //  self.scope.rows.replace(rows);
         //   //  self.scope.footerrows.replace(footerRows);
         //  });
            onAccountBalance.findOne(createBalanceOnAccountRequest(this.scope.request.appstate),function(data){
                      if(data["status"]=="SUCCESS"){
                        self.scope.rows.replace(getUiRowsFromResponse(quarters,data));  
                      }else{
                        $("#messageDiv").html("<label class='errorMessage'>"+data["responseText"]+"</label>");
                        $("#messageDiv").show();
                        setTimeout(function(){
                            $("#messageDiv").hide();
                        },2000)
                        self.scope.attr('emptyrows',true);
                      }
                }, function(xhr) {
                      console.error("Error while loading: onAccount balance Details"+xhr);
                } ); 
      
       }
    }
  }
});

var getUiRowsFromResponse=function(quarters,data){
  //console.log(JSON.stringify(data.onAccount.attr()));
  var onAccountDetails = data.onAccount.onAccountDetails
  var periodData = data.onAccount.fiscalPeriodAmtMap;
  var rows=[];
  for (var i=0;i<onAccountDetails.length;i++){
    var row = {};
    row['id']= onAccountDetails[i].id;
    row['entityId']=onAccountDetails[i].entityId;
    row['Licensor']=onAccountDetails[i].entityName;
    row['Currency']=onAccountDetails[i].currencyCode;
    row['ContentType']=onAccountDetails[i].contentGroupName;
    row['contentGroupId']=onAccountDetails[i].contentGroupId;
    row['serviceTypeId']=onAccountDetails[i].serviceTypeId;


    for(var k=0;k<quarters.length;k++){
      var period = utils.getPeriodForQuarter(quarters[k]);
      var amtObject = periodData[period];

      row[quarters[k]]=0;
      if(amtObject != undefined){
        var value = amtObject[onAccountDetails[i].id];
        if(value == undefined){
          value =0;
        }
        row[quarters[k]]=utils.currencyFormat(value);
      }
    }
    row['onAccountBalance']= utils.currencyFormat(onAccountDetails[i].onAccountAmt);
    row['cashAdjust']= utils.currencyFormat(onAccountDetails[i].entityCAAmt);
    rows.push(row);
  }
  //console.log(rows);
  return rows;
}

var createBalanceOnAccountRequest=function(appstate){
  var balancedOnAccountRequest={};
  balancedOnAccountRequest.searchRequest=requestHelper.formGlobalRequest(appstate).searchRequest;
  balancedOnAccountRequest.searchRequest.type="BALANCE";
  return requestHelper.formRequestDetails(balancedOnAccountRequest);
};

var getFooterRows=function(quarters,rows){
  var periodMap = new Array();
  var totalMap = new Array();
  var currencies=[];
  console.log(quarters);
  console.log(rows);
  //console.log(currencies[rows[1]["Currency"]]);
  for(var i=0;i<rows.length;i++){
    if(currencies[rows[i]["Currency"]] != undefined && currencies[rows[i]["Currency"]] != null){
      periodMap = currencies[rows[i]["Currency"]];
    }

    for(var k=0; k<quarters.length;k++){
      if(periodMap[quarters[k]] == undefined){
        periodMap[quarters[k]] = Number(rows[i][quarters[k]]);
      }else{
        periodMap[quarters[k]]= Number(rows[i][quarters[k]]) + Number(periodMap[quarters[k]]);
      }
      if(totalMap[quarters[k]] == undefined){
        totalMap[quarters[k]] = Number(rows[i][quarters[k]]);
      }else{
        totalMap[quarters[k]]= Number(rows[i][quarters[k]]) + Number(totalMap[quarters[k]]);
      }

    }
    
    if(periodMap["ON_ACC_BALANCE"] == undefined){
      periodMap["ON_ACC_BALANCE"]=0;
    }

    if(periodMap["CASH_ADJUSTMENTS"] == undefined){
      periodMap["CASH_ADJUSTMENTS"]=0;
    }

    if(totalMap["ON_ACC_BALANCE"] == undefined){
      totalMap["ON_ACC_BALANCE"]=0;
    }

    if(totalMap["CASH_ADJUSTMENTS"] == undefined){
      totalMap["CASH_ADJUSTMENTS"]=0;
    }

    periodMap["ON_ACC_BALANCE"]=Number(periodMap["ON_ACC_BALANCE"])+Number(rows[i]["onAccountBalance"]);
    periodMap["CASH_ADJUSTMENTS"]=Number(periodMap["CASH_ADJUSTMENTS"])+Number(rows[i]["cashAdjust"]);

    totalMap["ON_ACC_BALANCE"]=Number(totalMap["ON_ACC_BALANCE"])+Number(rows[i]["onAccountBalance"]);
    totalMap["CASH_ADJUSTMENTS"]=Number(totalMap["CASH_ADJUSTMENTS"])+Number(rows[i]["cashAdjust"]);

    currencies[rows[i]["Currency"]] = periodMap;
    //console.log(currencies[rows[1]["Currency"]]);
  }
//console.log(currencies);
//console.log(totalMap);

  return frameFooter(currencies,totalMap,quarters);

}

var frameFooter=function(currencyPeriodArray,totalMap,quarters){

  var footerRows=[];
  var row ={};
  var currencies= Object.keys(currencyPeriodArray);
  //console.log('Currencies are :'+currencies);
  //console.log(quarters);

  row["Licensor"]= "Total";
  row["Currency"]= "EUR";
  row["ContentType"]= "";
  for(var i=0;i<quarters.length;i++){
    row[quarters[i]]=totalMap[quarters[i]];
  }
  row["onAccountBalance"]=totalMap["ON_ACC_BALANCE"];
  row["cashAdjust"]=totalMap["CASH_ADJUSTMENTS"];
  row["__isChild"]=false;
  row["tfooter"]=true;
  footerRows.push(row);
  //console.log("Total Parent Row created !");
  for(var k=0; k<currencies.length;k++){

    var childRow ={};
    childRow["Licensor"]= "";
    childRow["Currency"]=currencies[k];
    childRow["ContentType"]= "";
      for(var i=0;i<quarters.length;i++){
        childRow[quarters[i]]=currencyPeriodArray[currencies[k]][quarters[i]];
      }
    childRow["onAccountBalance"]=currencyPeriodArray[currencies[k]]["ON_ACC_BALANCE"];
    childRow["cashAdjust"]=currencyPeriodArray[currencies[k]]["CASH_ADJUSTMENTS"];
    childRow["__isChild"]=true;
    childRow["tfooter"]=true;
    footerRows.push(childRow);
  }

//console.log('Footer rows are :'+JSON.stringify(footerRows));
return footerRows;
}

var prepareFooterRows=function(regionalCurrencyTotal,localCurrencyTotal,quarters){
  var footerRows=[];
  var row ={};
  var currencies= Object.keys(regionalCurrencyTotal);

//Framing Regional Currency Total Row
  row["Licensor"]= "Total";
  row["Currency"]= currencies[0];
  row["ContentType"]= "";
  var periodMap = regionalCurrencyTotal[currencies[0]];
  for(var i=0;i<quarters.length;i++){
    row[quarters[i]]=periodMap[quarters[i]];
  }
  row["onAccountBalance"]=totalMap["ON_ACC_BALANCE"];
  row["cashAdjust"]=totalMap["CASH_ADJUSTMENTS"];
  row["__isChild"]=false;
  row["tfooter"]=true;
  footerRows.push(row);

//Framing local currency total Row

  var localCurrencies = Object.keys(localCurrencyTotal);
  for(var k=0; k<localCurrencies.length;k++){
    periodMap = regionalCurrencyTotal[currencies[k]];
    var childRow ={};
    childRow["Licensor"]= "";
    childRow["Currency"]=localCurrencies[k];
    childRow["ContentType"]= "";
      for(var i=0;i<quarters.length;i++){
        childRow[quarters[i]]=periodMap[quarters[i]];
      }
    childRow["onAccountBalance"]=periodMap["ON_ACC_BALANCE"];
    childRow["cashAdjust"]=periodMap["CASH_ADJUSTMENTS"];
    childRow["__isChild"]=true;
    childRow["tfooter"]=true;
    footerRows.push(childRow);
  }

//console.log('Footer rows are :'+JSON.stringify(footerRows));
return footerRows;
}

export default OnAccountBalance;
