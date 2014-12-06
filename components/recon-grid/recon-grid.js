import $ from 'jquery';
import Grid from 'components/grid/';

import template from './template.stache!';
import _less from './recon-grid.less!';

var reconGrid = Grid.extend({
  tag: 'rn-recon-grid',
  template: template,
  scope: {
    checkedRows: [],
    footerrows: [],
    emptyrows:false
  },
  helpers: {

    getColumnLength: function(options){
      //console.log("column length is "+ JSON.stringify(this.attr("columns").length));
      return this.attr("columns").length;
    },
    footerRows: function(options) {
      // By default, rows are a bit more complex.
      // We have to account for child rows being invisible when their parents aren't open.
      //console.log("Footer Rows are "+JSON.stringify(this.footerrows.attr()));
      //console.log("Footer Rows are "+JSON.stringify(this.footerrows));
      var isRowAChild = function(row) {
        // by default, just looking for __isChild = true
        return !!row.attr('__isChild');
      };

      var isRowOpen = function(row) {
        // by default, just looking for __isOpen = true
        return !!row.attr('__isOpen');
      };

      var out = [],
      childRowsAreVisible = false,
      scope = this;

      this.footerrows.attr('length');
      return _.map(this.footerrows, function(row) {
        var isChild = isRowAChild(row);

        // if the row is a parent and isn't open, its children shouldn't be visible -
        // this flag is only true for the children of an open parent row
        if(!isChild) {
          childRowsAreVisible = isRowOpen(row);
        }

        return options.fn({
          row: row,
          isOpen: isChild ? false : isRowOpen(row), // child rows are never open
          isChild: isChild,
          isVisible: isChild ? childRowsAreVisible : true // parent rows are always visible
        });
      });
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
