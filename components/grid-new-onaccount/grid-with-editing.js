import _ from 'lodash';
import stache from 'can/view/stache/';
import _less from './grid-new-onaccount.less!';
import Grid from 'components/grid/';

var GridWithEditing = Grid.extend({
  tag: 'rn-new-onaccount-grid',
  scope: {
    editingRow: null,
    editingColumn: null,
    quarters:[]
  },
  helpers: {
    cellContents: function(row, column) {    
      if(column.editable && row.__isChild) {
        return stache('<input class="editing" value="{{value}}"/>')({value: column.getEditingValue(row,column.title)});
      } else {
        return Grid.prototype.helpers.cellContents.call(this, row, column);
      }
    }
  },
  events: {
    'td input.editing blur':function(el, ev){
      //var value = $('td input').val();
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
      mainRows.quarters=quarters
      $(this.element).trigger('onSelected', mainRows);
      //Row got updated to the page to the grid component
     
    }
  }
});


export default GridWithEditing;
