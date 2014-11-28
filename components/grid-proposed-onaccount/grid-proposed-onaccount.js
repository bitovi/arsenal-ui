import _ from 'lodash';
import _less from './grid-proposed-onaccount.less!';
import proposedOnAccount from 'models/onAccount/proposedOnAccount/';
import template from './template.stache!';
import Grid from 'components/grid/';
import stache from 'can/view/stache/';
import utils from 'components/page-on-account/utils';


import GridWithCheckboxes from './grid-with-checkboxes';


var proposedonAccountGrid = Grid.extend({
  tag: 'rn-proposed-onaccount-grid',
  template: template,
  scope: {
    columns: [
      {
        id: 'checkbox',
        title: '',
        contents: function(row) {
          return can.stache('<input type="checkbox"/>')();
        }
      },
            
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
        title: 'ContentType'
      }
     ],
     request:{},
     checkedRows: []
    
  },
  init :function()
  {
     var self = this;
     var quarters = utils.getQuarter(self.scope.request.searchRequest.periodFrom,self.scope.request.searchRequest.periodTo);
    for(var i=0;i<quarters.length;i++){
      var column={
        id:quarters[i],
        title:quarters[i]
      };
      self.scope.columns.push(column);
     }

   
   proposedOnAccount.findAll().then(function(rows) {
       var footerRows = getFooterRows(quarters,rows);
        self.scope.rows.replace(rows);
        self.scope.footerrows.replace(footerRows);
      });

  },

  helpers: {
    listCheckedRowIndexes: function() {
      //return this.checkedRows.attr('length') ? _.map(this.checkedRows, row => row.index).join(', ') : 'None checked.';
    }
  },
  events: {
    '.checkbox :checkbox change': function(el, ev) {
      var row = el.closest('tr').data('row').row;

      if(el[0].checked) {
        this.scope.checkedRows.push(row);
        console.log("Checkbox 222222 called:::::::::",this.scope.checkedRows);
        deleterowfunction(this.scope.checkedRows);
      } else {
        var index = _.find(this.scope.checkedRows, checkedRow => { checkedRow.index === row.index; });
        (index > -1) && this.scope.checkedRows.splice(index, 1);
      }
    },

        
  },
  "inserted" : function()
  {
    console.log("It is inside called >>>>>>>>>>>>>>");
  }
});



var getFooterRows=function(quarters,rows){
   //console.log("!44444444444inside init function");
  var periodMap = new Array();
  var totalMap = new Array();
  var currencies=[];
  console.log(quarters);
  console.log(rows);
  console.log(currencies[rows[1]["Currency"]]);
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
console.log(currencies);
console.log(totalMap);

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

var deleterowfunction=function(ind)
    {
      console.log("index is :::",ind);
    }
export default GridWithCheckboxes;
