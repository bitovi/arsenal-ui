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
          if(row.attr('__isChecked')== null || (row.attr('__isChecked')!= null && row.attr('__isChecked')==false)){
            return can.stache('<input type="checkbox"/>')();
          }else{
            return stache('{{#checkbox}}<input type="checkbox" value="{{checkbox}}" {{#if isChecked}}checked{{/if}}/>{{/checkbox}}')({checkbox: row.__isChecked, isChecked: row.__isChecked});
          }
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
     checkedRows: [],
     type:"",
     quarters:[]
    
  },
  init :function()
  {
     var self = this;
     var rows = self.scope.request.rows;
     var deletableRows = self.scope.request.deletableRows;
     var editableRows = self.scope.request.editableRows;
     var type =self.scope.type;
     //console.log(self.scope.request.rows);
     var quarters = utils.getQuarter(self.scope.request.searchRequest.periodFrom,self.scope.request.searchRequest.periodTo);
    for(var i=0;i<quarters.length;i++){
      var column={
        id:quarters[i],
        title:quarters[i],
        editable:true,
          getEditingValue: function(row,title) {
            return row.attr(title);
          },
          setValue: function(row, newValue,title) {
            row.attr(title,newValue);
          }
      };
      self.scope.columns.push(column);
     }

      var totalcolumn={
          id:'total',
          title:'Total',
           editable:false,
          getEditingValue: function(row,title) {
            return row.attr(title);
          },
          setValue: function(row, newValue,title) {
            row.attr(title,newValue);
          }
        };
        self.scope.columns.push(totalcolumn);
        self.scope.quarters.replace(quarters);
     
   if(type == 'DELETE'&& deletableRows != undefined && deletableRows.length >0){
      // for(var i=0;i<deletableRows.length;i++){
      //       if(deletableRows[i].__isChecked != undefined && deletableRows[i].__isChecked){
      //         deletableRows.splice(i,1);
      //       }
      //     }
      self.scope.rows.replace(deletableRows);
   }else if(type == 'EDIT' && editableRows != undefined && editableRows.length>0){
        for(var i=0;i<editableRows.length;i++){
          if(editableRows[i].__isChecked != undefined && editableRows[i].__isChecked){
              editableRows[i].attr('__isEditable',true);
            }
          }
          console.log('Editable Rows')
          console.log(editableRows);
          self.scope.rows.replace(editableRows);
   }else{
      proposedOnAccount.findAll().then(function(rows) {
       var footerRows = getFooterRows(quarters,rows);
        self.scope.rows.replace(rows);
        self.scope.footerrows.replace(footerRows);
      }); 
   }
   


  },

  helpers: {
    listCheckedRowIndexes: function() {
      //return this.checkedRows.attr('length') ? _.map(this.checkedRows, row => row.index).join(', ') : 'None checked.';
    },
    cellContents:function(row, column){
      //console.log(type);
      //console.log(row.__isEditable);
      if(column.editable && row.__isChecked && row.__isEditable) {
        return stache('<input class="editing" value="{{value}}"/>')({value: column.getEditingValue(row,column.title)});
      } else {
        return Grid.prototype.helpers.cellContents.call(this, row, column);
      }
    }
  },
  events: {
    '.checkbox :checkbox change': function(el, ev) {
      //console.log(ev.)
      var row = el.closest('tr').data('row').row;

      if(el[0].checked) {
        console.log('checked:'+row.checkbox);
        //console.log(row);
        //row.attr('Licensor', 'Naveen');
        
        row.attr('__isChecked', true); 
        this.scope.checkedRows.push(row);
      } else {
        row.attr('__isChecked', false); 
          var indexToBeDeleted;
          this.scope.checkedRows.each(function(value, key) {
            if(row == value){
              indexToBeDeleted=key;
            }
             
          });

          this.scope.checkedRows.splice(indexToBeDeleted,1);
      }

      console.log(row);

      var proposedOnAccountData={};
      proposedOnAccountData.rows=this.scope.rows;
      proposedOnAccountData.checkedRows=this.scope.checkedRows;

      $(this.element).trigger('onSelected', proposedOnAccountData);
      //console.log(this.scope.checkedRows);
    },
     'td input.editing blur':function(el, ev){
      //alert('hi');
      var value = el.closest('td').find('.editing').val();

        if(isNaN(value)){
          el.addClass('error');
          return;
        }

      var element = el.closest('td').find('.editing');
      var column = el.closest('td').data('column').column;

     // console.log(el.val());
      //console.log("val is "+value);

      var row = el.closest('tr').data('row').row;
      row.attr(column.title,value);

      //console.log(row.attr());

      //console.log(this.scope.quarters.length);

      //column.setValue(row, value,column.title);

      var quarters=this.scope.quarters;
      var total = 0;
      for(var i=0; i<quarters.length;i++){
            total = Number(total)+Number(row.attr(quarters[i]));
            //console.log(quarters[i]);
            //console.log(row.attr(quarters[i]));
          }
      

       row.attr('total',total);
      //console.log('rows');
      //console.log(this.scope.rows);

      //putting the rows to the page from grid component
      var mainRows={};
      mainRows.rows=this.scope.rows;
    
      $(this.element).trigger('save', mainRows);
      //Row got updated to the page to the grid component
     
    }
        
  },
  "inserted" : function()
  {
    //console.log("It is inside called >>>>>>>>>>>>>>");
  }
});



var getFooterRows=function(quarters,rows){
  var periodMap = new Array();
  var totalMap = new Array();
  var currencies=[];
 // console.log(quarters);
  //console.log(rows);
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
 // console.log("Total Parent Row created !");
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

var deleterowfunction=function(ind)
    {
      //console.log("index is :::",ind);
    }
export default GridWithCheckboxes;
