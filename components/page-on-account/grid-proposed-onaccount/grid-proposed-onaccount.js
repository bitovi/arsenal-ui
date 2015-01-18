import _ from 'lodash';
import _less from './grid-proposed-onaccount.less!';
import proposedOnAccount from 'models/onAccount/proposedOnAccount/';
import template from './template.stache!';
import Grid from 'components/grid/';
import stache from 'can/view/stache/';
import utils from 'components/page-on-account/utils';
import UserReq from 'utils/request/';
import periodWidgetHelper from 'utils/periodWidgetHelpers';

var proposedonAccountGrid = Grid.extend({
  tag: 'rn-proposed-onaccount-grid',
  template: template,
  scope: {
    columns: [
      {
        id: 'checkbox',
        title: '',
        contents: function(row) {
          if(row.attr('tfooter') != undefined && row.attr('tfooter')){
            return '';
          }else if(row.attr('__isChecked')== null || (row.attr('__isChecked')!= null && row.attr('__isChecked')==false)){
            return can.stache('<input type="checkbox"/>')();
          }else{
            return stache('{{#checkbox}}<input type="checkbox" value="{{checkbox}}" {{#if isChecked}}checked{{/if}}/>{{/checkbox}}')({checkbox: row.__isChecked, isChecked: row.__isChecked});
          }
        }
      },
            
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
        title: 'ContentType'
      }
     ],
     request:{},
     checkedRows: [],
     type:"",
     bundleNames:[],
     quarters:[],
     test:[]
    
  },
  init :function()
  {


  },

  helpers: {
    cellContents:function(row, column){
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
        //console.log('checked:'+row.checkbox);
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
      
      var proposedOnAccountData={};
      proposedOnAccountData.rows=this.scope.rows;
      proposedOnAccountData.checkedRows=this.scope.checkedRows;
      proposedOnAccountData.footerrows=this.scope.footerrows;

      $(this.element).trigger('onSelected', proposedOnAccountData);

      alignGrid("proposedOnAccountGrid");
    },
     'td input.editing blur':function(el, ev){
      var value = el.closest('td').find('.editing').val();
        if(isNaN(value) || value==""){
          el.addClass('invalid');
          return;
        }
      var element = el.closest('td').find('.editing');
      var column = el.closest('td').data('column').column;

      var row = el.closest('tr').data('row').row;
      row.attr(periodWidgetHelper.getFiscalPeriod(column.title),utils.currencyFormat(value));

      //putting the rows to the page from grid component
      var proposedOnAccountData={};
      proposedOnAccountData.rows=this.scope.rows;
      proposedOnAccountData.checkedRows=this.scope.checkedRows;
    
      $(this.element).trigger('save', proposedOnAccountData);
      //Row got updated to the page to the grid component    
    },
    "inserted": function(){ 
              var self = this;
              if(self.scope.request != null && self.scope.request != undefined && self.scope.request.quarters != null){
                 var rows = self.scope.request.rows;
                 var deletableRows = self.scope.request.deletableRows;
                 var editableRows = self.scope.request.editableRows;
                 var footerrows = self.scope.request.footerrows;
                 var type =self.scope.type;
                 //console.log(self.scope.request.rows);
                 var quarters = self.scope.request.quarters;
                for(var i=0;i<quarters.length;i++){
                  var column={
                    //id:quarters[i],
                    id:periodWidgetHelper.getFiscalPeriod(quarters[i]),
                    title:quarters[i],
                    editable:true,
                      getEditingValue: function(row,title) {
                        return row.attr(periodWidgetHelper.getFiscalPeriod(title));
                      },
                      setValue: function(row, newValue,title) {
                        row.attr(periodWidgetHelper.getFiscalPeriod(title),newValue);
                      }
                  };
                  self.scope.columns.push(column);
                 }

                  var column={
                    id:"Total",
                    title:'Total'
                  };
                  self.scope.columns.push(column);

                    for(var i=0;i<quarters.length;i++){
                        $('.'+ quarters[i]).addClass('quarter');
                    }

                  self.scope.quarters.replace(quarters);
                 
               if(type == 'DELETE'&& deletableRows != undefined && deletableRows.length >0){
                  self.scope.rows.replace(deletableRows);
                  self.scope.footerrows.replace(footerrows);
               }else if(type == 'EDIT' && editableRows != undefined && editableRows.length>0){
                    for(var i=0;i<editableRows.length;i++){
                      if(editableRows[i].__isChecked != undefined && editableRows[i].__isChecked){
                          editableRows[i].attr('__isEditable',true);
                        }
                      }
                      self.scope.rows.replace(editableRows);
                      self.scope.footerrows.replace(footerrows);
               }else{
                    self.scope.rows.replace(self.scope.request.rows);
                    self.scope.footerrows.replace(self.scope.request.footerRows);
               }
         
           }

          var tbody = self.element.find('tbody');
          var parentScopeVar = self.element.closest('page-on-account').scope();
          var tableScrollTopVal = parentScopeVar.attr('tableScrollTop');
          $(tbody[0]).scrollTop(tableScrollTopVal);
            $(tbody).on('scroll', function(ev) {
              if(tbody[0].scrollTop + tbody[0].clientHeight >= tbody[0].scrollHeight && (self.scope.request!= undefined && self.scope.request.recordsAvailable)) {
                //console.log(JSON.stringify(self.element.closest('page-invoices').scope().appstate.attr()));

                
                var offsetVal = parentScopeVar.attr('proposeOnAccOffset');
                //console.log(offsetVal);

                /* Reset the offset value and call the webservice to fetch next set of records */
                parentScopeVar.attr('proposeOnAccOffset', (parseInt(offsetVal)+1));
                parentScopeVar.attr('tableScrollTop', (tbody[0].scrollHeight-200));
                parentScopeVar.appstate.attr('globalSearchButtonClicked', false);

                /* The below code calls {scope.appstate} change event that gets the new data for grid*/
                /* All the neccessary parameters will be set in that event */
               if(parentScopeVar.appstate.attr('globalSearch')){
                  parentScopeVar.appstate.attr('globalSearch', false);
                }else{
                  parentScopeVar.appstate.attr('globalSearch', true);
                }
              }
            });

          alignGrid('proposedOnAccountGrid');
      }
        
  }
});

function alignGrid(divId){
  var colLength = $('#'+divId+' table>thead>tr>th').length;
  var rowLength = $('#'+divId+' table>tbody>tr').length;
  var divWidth = $('#'+divId).outerWidth();
  var tableWidth = 0;
  var tdWidth, cellWidthArr = [];
  if(rowLength>0){
    $('#'+divId+' table').css("width",divWidth-300);
      for(var i=1;i<=colLength;i++){
        var theadTdWidth = $('#'+divId+' table>thead>tr>th:nth-child('+i+')').outerWidth();
        var tbodyTdWidth = $('#'+divId+' table>tbody>tr>td:nth-child('+i+')').outerWidth();
        var tfootTdWidth = $('#'+divId+' table>tfoot>tr>td:nth-child('+i+')').outerWidth();

        if(theadTdWidth >= tbodyTdWidth && theadTdWidth >= tfootTdWidth)
          tdWidth = theadTdWidth;
        else if(tfootTdWidth >= tbodyTdWidth && tfootTdWidth >= theadTdWidth)
          tdWidth = tfootTdWidth;
        else 
          tdWidth = tbodyTdWidth;

        if(i==1) //For the column holding 'check box'
            tdWidth = 35;   
               
        tableWidth += tdWidth;
        cellWidthArr.push(tdWidth);
      }

      if(tableWidth < divWidth){
        var moreWidth = (divWidth-tableWidth)/colLength;
        for(var j=1;j<=cellWidthArr.length;j++){
          var width = cellWidthArr[j-1]+moreWidth;
          $('#'+divId+' table>thead>tr>th:nth-child('+j+')').css("width",width);
          $('#'+divId+' table>tbody>tr>td:nth-child('+j+')').css("width",width);
          $('#'+divId+' table>tfoot>tr>td:nth-child('+j+')').css("width",width);
        }
        $('#'+divId+' table').css("width",divWidth);
      } else {
        for(var j=1;j<=cellWidthArr.length;j++){
          var width = cellWidthArr[j-1];
          $('#'+divId+' table>thead>tr>th:nth-child('+j+')').css("width",width);
          $('#'+divId+' table>tbody>tr>td:nth-child('+j+')').css("width",width);
          $('#'+divId+' table>tfoot>tr>td:nth-child('+j+')').css("width",width);
        }
        $('#'+divId+' table').css("width",tableWidth);
      }
  }
}
export default proposedonAccountGrid;
