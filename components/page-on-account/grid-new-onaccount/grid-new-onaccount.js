import $ from 'jquery';
import stache from 'can/view/stache/';
import _ from 'lodash';
import UserReq from 'utils/request/';
import utils from 'components/page-on-account/utils';

import _less from './grid-new-onaccount.less!';
import Grid from 'components/grid/';
import template from './template.stache!';

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
    quarters:[]
  },
   helpers: {
    cellContents: function(row, column) {
      if(column.editable && row.__isChild) {
        return stache('<input value="{{value}}" tabindex="0" class="editing form-control" style="width:130px;padding: 4px !important;"/>')({value: column.getEditingValue(row,column.title)});
      } else {
        if(column.title == 'Total' && row.__isChild && column.getEditingValue(row,column.id) != null)
        {
          return column.getEditingValue(row,column.id);
        }
        return Grid.prototype.helpers.cellContents.call(this, row, column);
      }
    }
  },
  init: function(){


    },
    events:{
      'inserted': function () {  

    var self = this;

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
      'td input.editing blur':function(el, ev){
        ev.preventDefault();
        var value = el.closest('td').find('.editing').val();
          if(isNaN(value)){
            el.addClass('invalid');
            return;
          }
          if (value != "" && value != undefined && value.length != 0){
            var decimal_validate_RE=/^\d{0,10}(\.\d{0,8})?$/;
            if(!decimal_validate_RE.test(value)){
              el.addClass('invalid');
              el.closest('td').find('.editing').attr('title',"Please provide onAccount amount in [##########.########] format");
              return;
            }
          }
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
        var mainRows={};
        mainRows.rows=this.scope.rows;
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
