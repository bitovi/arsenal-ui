import _ from 'lodash';
import _less from './grid-proposed-onaccount.less!';
import _less from './grid-with-checkboxes.less!';
import template from './template.stache!';
import Grid from 'components/grid/';

var GridWithCheckboxes = Grid.extend({
  tag: 'rn-proposed-onaccount',
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
        id: 'index',
        title: '#'
      },
      {
        id: 'text',
        title: 'Text'
      }
    ],
    checkedRows: []
  },
  helpers: {
    listCheckedRowIndexes: function() {
      return this.checkedRows.attr('length') ? _.map(this.checkedRows, row => row.index).join(', ') : 'None checked.';
    }
  },
  events: {
    '.checkbox :checkbox change': function(el, ev) {
      var row = el.closest('tr').data('row').row;
      if(el[0].checked) {
        this.scope.checkedRows.push(row);
      } else {
        var index = _.find(this.scope.checkedRows, checkedRow => { checkedRow.index === row.index; });
        consoel.log("<<<<index of row>>>>",index);
        (index > -1) && this.scope.checkedRows.splice(index, 1);
      }
      console.log(this.scope.checkedRows);
    }
  }
});

export default GridWithCheckboxes;
