import _ from 'lodash';
import _less from './grid-proposed-onaccount.less!';
import proposedOnAccount from 'models/onAccount/proposedOnAccount/';
import template from './template.stache!';
import Grid from 'components/grid/';
import stache from 'can/view/stache/';
import utils from 'components/page-on-account/utils';
import UserReq from 'utils/request/';

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
      row.attr(column.title,value);

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
      }
        
  }
});
export default proposedonAccountGrid;
