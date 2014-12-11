import $ from 'jquery';
import Grid from 'components/grid/';

import template from './template.stache!';
import _less from './recon-grid.less!';

var reconGrid = Grid.extend({
  tag: 'rn-recon-grid',
  template: template,
  scope: {
    checkedRows: [],
    footerrows: []
  },
  helpers: {
    getColumnLength: function(options){
      //console.log("column length is "+ JSON.stringify(this.attr("columns").length));
      return this.attr("columns").length;
    }
  },
  events:{

    '.checkbox :checkbox change': function(el, ev) {
      var row = el.closest('tr').data('row').row;

      if(el[0].checked) {
        this.scope.checkedRows.push(row);
      } else {
        var index = _.find(this.scope.checkedRows, checkedRow => { checkedRow.index === row.index; });
        (index > -1) && this.scope.checkedRows.splice(index, 1);
      }
    }

  }
});


export default reconGrid;
