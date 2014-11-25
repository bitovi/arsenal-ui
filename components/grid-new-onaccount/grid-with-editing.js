import _ from 'lodash';
import stache from 'can/view/stache/';
import _less from './grid-new-onaccount.less!';
import Grid from 'components/grid/';

var GridWithEditing = Grid.extend({
  tag: 'rn-new-onaccount-grid',
  scope: {
    editingRow: null,
    editingColumn: null
  },
  helpers: {
    cellContents: function(row, column) {
      if(this.attr('editingRow') === row && this.attr('editingColumn') === column) {
        console.log(column);
        return stache('<input class="editing" value="{{value}}"/>')({value: column.getEditingValue(row)});
      } else {
        return Grid.prototype.helpers.cellContents.call(this, row, column);
      }
    }
  },
  events: {
    'td dblclick': function(el, ev) {
      var column = el.data('column').column;
      if(column.editable) {
        can.batch.start();
        this.scope.attr('editingRow', el.closest('tr').data('row').row);
        this.scope.attr('editingColumn', column);
        can.batch.stop();
      } else {
        console.log('You cannot edit this.');
      }
    },
    'td input.editing blur': function(el, ev) {
      // do validation here first
      if(el.val().indexOf(' ') < 0) {
        el.addClass('error');
        console.log('error detected!');
        return;
      }

      var column = el.closest('td').data('column').column;
      var row = el.closest('tr').data('row').row;
      console.log('setting new value', el.val(), column, row);
      column.setValue(row, el.val());
      this.scope.attr({
        'editingRow': null,
        'editingColumn': null
      });
    }
  }
});

export default GridWithEditing;
