import $ from 'jquery';
import stache from 'can/view/stache/';
import _ from 'lodash';
import UserReq from 'utils/request/';
import utils from 'components/page-on-account/utils';

import _less from './grid-new-onaccount.less!';
import Grid from 'components/grid/';
import template from './template.stache!';
import gridUtils from 'utils/gridUtil';

var newOnAccountGrid = Grid.extend({
  tag: 'rn-new-onaccount-grid',
  template: template,
  scope: {
    columns: [
    {
        id: 'toggle',
        title: '<span class="open-toggle-all"></span>',
        editable:false,
        contents: function(row) { return stache('{{#unless isChild}}<span class="open-toggle"></span>{{/unless}}')({isChild: row.__isChild}); }
      },
      {
        id: 'licensor',
        title: 'Licensor',
        editable:false
      },
      {
        id: 'currency',
        title: 'Currency',
        editable:false
      }
    ],
    type:"",
    editingRow: null,
    editingColumn: null,
    quarters:[],
    strippedGrid:true
  },
   helpers: {
    cellContents: function(row, column) {
      row = typeof row === 'function' ? row() : row;
      if(column.editable && row.__isChild) {
        var returnValue = column.getEditingValue(row,column.title);
        if(returnValue == undefined || !$.isNumeric(returnValue)){
          return stache('<div style="float: right;text-align: right;width:100%" valign="middle"><input value="{{value}}" tabindex="0" class="editing form-control invalid" style="width:98%;padding: 4px !important;text-align: right; title="Please provide onAccount amount in [##########.########] format""/></div>')({value: returnValue});
        }else{
          return stache('<div style="float: right;text-alignwidth:100%: right;" valign="middle"><input value="{{value}}" tabindex="0" class="editing form-control" style="width:98%;padding: 4px !important;text-align: right;"/></div>')({value: returnValue});
        }
      } else {
        if(column.title == 'Total' && row.__isChild && column.getEditingValue(row,column.id) != null)
        {
          return column.getEditingValue(row,column.id);
        }
        return Grid.prototype.helpers.cellContents.call(this, row, column);
      }
    },
    columnClass: function(column) {
      if(column.id == 'toggle'){
        return "col-toggle-width";
      }else if(column.id == 'licensor'){
        return "col-lic-width";
      }else if(column.id == 'currency'){
        return "col-currency-width";
      }else if(column.id == 'total'){
        return "col-total-width";
      }else {
        return "col-others-width";
      }
    }
  },
  init: function(){


    },
    events:{
      'inserted': function () {  

        var self = this;
      var tbody = self.element.find('tbody');
      //setting tbody height which determines the page height- start
      var getTblBodyHght=gridUtils.getTableBodyHeight('onAccountBalanceGrid',50);
      gridUtils.setElementHeight(tbody,getTblBodyHght,getTblBodyHght);
      //setting tbody height - end
        if(self.scope.request != null || self.scope.request != undefined){

             var quarters = self.scope.request.quarters;

             for(var i=0;i<quarters.length;i++){
                var column={
                  id:quarters[i],
                  title:quarters[i],
                   editable:true,
                  getEditingValue: function(row,title) {
                    return row[title];
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
                    return row[title];
                  },
                  setValue: function(row, newValue,title) {
                    row.attr(title,newValue);
                  }
                };
                self.scope.columns.push(totalcolumn);
                self.scope.quarters.replace(quarters);
              self.scope.rows.replace(self.scope.request.rows);

          }

        },
      "{rows} change": function(){
        $(this.element).trigger('rowsForCopyOnAccount', this.scope.rows);

      },

      // 'td input.editing keydown':function(el, ev){
      //    ev.preventDefault();

      //   if(ev.keyCode==9){
      //     console.log("Keydown Working", el.parent('div').parent('td').next('td').find('input.editing').val());
      //     //el.blur();
      //     el.closest('td').next('td').find('input.editing').focus();
      //     //return false;
      //   }
      // },
      'td input.editing blur':function(el, ev){
        ev.preventDefault();
        var value = el.closest('td').find('.editing').val();
         var parentScopeVar = el.closest('page-on-account').scope();
        var valueToTest = value.replace(/\,/g,'');

          if(!$.isNumeric(valueToTest)){
          //if(isNaN(value)){
            el.addClass('invalid');
            el.closest('td').find('.editing').attr('title',"Please provide onAccount amount in [##########.########] format");
            parentScopeVar.attr('validOnAccNumbers',false);
            parentScopeVar.attr('enableOnAccPropose', Date.now());
            return;
          }else {
            el.removeClass('invalid');
            if(el.closest('table').find('td .invalid').length > 0){
              return;
            }
          }
          //}
          // if (value != "" && value != undefined && value.length != 0){
          //   var decimal_validate_RE=/^\d{0,10}(\.\d{0,8})?$/;
          //   if(!decimal_validate_RE.test(value)){
          //     el.addClass('invalid');
          //     el.closest('td').find('.editing').attr('title',"Please provide onAccount amount in [##########.########] format");
          //     return;
          //   }
          // }
        var element = el.closest('td').find('.editing');
        var column = el.closest('td').data('column').column;
        var row = el.closest('tr').data('row').row;
        row.attr(column.title,value);
        var quarters=this.scope.quarters;
        var total = 0;
        for(var i=0; i<quarters.length;i++){
            total = Number(total)+Number(row.attr(quarters[i]));
          }
         row.attr('total',utils.currencyFormat(total));
        //putting the rows to the page from grid component
        var validNumbers=true;
        if(el.closest('table').find('td .invalid').length > 0){
          validNumbers=false;
        }
        var mainRows={};
        mainRows.rows=this.scope.rows;
        mainRows.validNumbers=validNumbers;
        $(this.element).trigger('onSelected', mainRows);
        //Row got updated to the page to the grid component
      }
      // 'td input keydown':function(el, ev){
      //   ev.preventDefault();
      //   $('#newonAccountGrid td').attr('tabindex','-1');
      //   if(event.keyCode == 9){
      //      el.parent().next().find('input').focus();
      //   }
      // }
    }
});

export default newOnAccountGrid;
