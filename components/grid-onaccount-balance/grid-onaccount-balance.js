import _ from 'lodash';

//import FakeModel from './fake-model';

import onAccountBalance from 'models/onAccount/onAccountBalance/';

import _less from './grid-onaccount-balance.less!';
import template from './template.stache!';
import Grid from 'components/grid/';
import stache from 'can/view/stache/';

var OnAccountBalance = Grid.extend({
  tag: 'rn-onaccount-balance-grid',
  template: template,
  scope: {
    columns: [
      {
        id: 'Licensor',
        title: 'Licensor',
        //contents: function(row) { return stache('{{#unless isChild}}<span class="open-toggle"></span>{{/unless}} {{Licensor}}')({Licensor: row.Licensor, isChild: row.__isChild}); }
        contents: function(row) { 
            if(row.attr('tfooter')){
            return  stache('{{#unless isChild}}<span class="open-toggle"></span>{{/unless}} {{Licensor}}')({Licensor: row.Licensor, isChild: row.__isChild});;
          }
            //return  stache('{{#unless isChild}}<span class="open-toggle"></span>{{/unless}} {{Licensor}}')({Licensor: row.Licensor, isChild: row.__isChild});

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
    request:{}
    //sample:"@"
  },
  init: function(){

    var self = this;
     //console.log(JSON.stringify(self.scope.request.searchRequest.attr()));
     var quarters = getQuarter(self.scope.request.searchRequest.periodFrom,self.scope.request.searchRequest.periodTo);

     for(var i=0;i<quarters.length;i++){
      var column={
        id:quarters[i],
        title:quarters[i]
      };
      self.scope.columns.push(column);
     }

      var balanceColumn={
        id:'onAccountBalance',
        title:'onAccount Bal'
      };
      self.scope.columns.push(balanceColumn);

      var cashAdjustColumn={
        id:'cashAdjust',
        title:'Licensor Cash Adjustment'
      };
      self.scope.columns.push(cashAdjustColumn);


   
     onAccountBalance.findAll().then(function(rows) {
       var footerRows = getFooterRows(quarters,rows);
        self.scope.rows.replace(rows);
        self.scope.footerrows.replace(footerRows);

      });

    },
  events: {
    'inserted': function(ev) {
      //var self = this;

    },
    '{scope} request change':function(){
      
    }
  }
});

var getQuarter=function(periodFrom,periodTO){
  console.log(periodFrom);
  console.log(periodTO);
   var obj=[];
    var qFrom = periodFrom.substring(1, 2);
    var qTo = periodTO.substring(1, 2);
    var yearFrom = periodFrom.substring(periodFrom.length, periodFrom.length-2);
    var yearTo = periodTO.substring(periodTO.length, periodTO.length-2);  
    if(qFrom == qTo && yearFrom == yearTo){
        var sam = "Q"+qFrom+"FY"+yearFrom;
        obj.push(sam);
    } else if(yearFrom < yearTo){
         for(var i=yearFrom;i<=yearTo;i++){
             var quarterTo = qTo;
             if(i != yearTo){
                quarterTo = 4;  
             }
             for(var j = qFrom ; j <= quarterTo; j++){
                obj.push("Q"+j+"FY"+i);
            }
         }
    }else{
        for(var i = qFrom ; i <= qTo; i++){
               obj.push("Q"+i+"FY"+yearFrom);
            }
    }
    return obj;
}

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
  console.log('Currencies are :'+currencies);
  console.log(quarters);

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
  console.log("Total Parent Row created !");
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

console.log('Footer rows are :'+JSON.stringify(footerRows));
return footerRows;
}


export default OnAccountBalance;
