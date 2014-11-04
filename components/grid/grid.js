import _ from 'lodash';
import Component from 'can/component/';
import can from 'can/';

import template from './template.stache!';
import _less from './grid.less!';

var Grid = Component.extend({
  tag: 'rn-grid',
  template: template,

  scope: {
    columns: [/*
      {
        id: 'example',
        title: 'Example Column', // could also be a function, returns whatever you can from a helper
        className: 'example', // optional
        sortable: true,
        compare: function(a, b) { return a[this.id] - b[this.id]; }, // `this` is the column def, a and b are rows.
        defaultSortDirection: 'asc', // or 'desc' - which way do we sort first?
        contents: function(row) { return row.prop; } // optional, returns whatever you can return from a helper
      }, ...
    */],
    rows: [],
    sortedColumn: null,
    sortedDirection: null, // should be 'asc' or 'desc'
  },
  helpers: {
    tableClass: function() {
      // By default, don't return anything.
      return '';
    },
    filteredColumns: function(options) {
      // By default, use all the columns.
      return _.map(this.attr('columns'), column => options.fn({column}));
    },
    columnClass: function(column) {
      // By default, just return the className property on the column, or the ID, or nothing.
      return column.attr('className') || column.attr('id') || '';
    },
    sortClass: function(column) {
      if(column.attr('sortable') && this.attr('sortedColumn') && this.attr('sortedColumn').id === column.attr('id')) {
        return 'sorted ' + this.attr('sortedDirection');
      } else {
        return '';
      }
    },
    columnTitle: function(column) {
      column.attr();
      // By default, just use the title property of the column.
      return _.isFunction(column.title) ? column.title.call(this, column) : column.attr('title');
    },
    sortArrow: function(column) {
      this.attr();
      if(column.attr('sortable') && this.attr('sortedColumn') && this.sortedColumn.id === column.attr('id')) {
        return this.sortedDirection === 'desc' ? '▽' : '△';
      } else {
        return '';
      }
    },
    filteredRows: function(options) {
      // By default, rows are a bit more complex.
      // We have to account for child rows being invisible when their parents aren't open.

      var isRowAChild = function(row) {
        // by default, just looking for __isChild = true
        return !!row.attr('__isChild');
      };

      var isRowOpen = function(row) {
        // by default, just looking for __isOpen = true
        return !!row.attr('__isOpen');
      };

      var out = [],
          childRowsAreVisible = false;
      can.__reading(this.rows, 'change'); // TODO: figure out if there's a better way to do this.
                                          // Note for others - don't use can.__reading yourself!

      return _.map(this.rows, function(row) {
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
    },
    rowClass: function(row) {
      // By default, just return nothing.
      return '';
    },
    cellClass: function(row, column) {
      // By default, just return nothing.
      return '';
    },
    cellContents: function(row, column) {
      row.attr();
      // By default, if column has a value function, run the row through that.
      // Otherwise, return the value of the property on the row named for the column ID.
      return _.isFunction(column.contents) ? column.contents.call(this, row) : row.attr(column.attr('id')).toString();
    }
  },

  events: {
    '.open-toggle click': function(el, ev) {
      var row = el.closest('tr').data('row').row;
      row.attr('__isOpen', !row.attr('__isOpen'));
    },
    'th click': function(el, ev) {
      var column = el.data('column').column;

      if(this.scope.attr('sortedColumn') && this.scope.attr('sortedColumn').id === column.id) {
        this.scope.attr('sortedDirection', this.scope.attr('sortedDirection') === 'asc' ? 'desc' : 'asc');
      } else if(column.sortable) {
        can.batch.start();
        this.scope.attr('sortedColumn', column);
        this.scope.attr('sortedDirection', column.defaultSortDirection || 'asc');
        can.batch.stop();
      }
    },
    // these are what you override if you need to reload rows for sorting or something
    '{scope} sortedColumn': function() {
      return resort.apply(this, arguments);
    },
    '{scope} sortedDirection': function() {
      return resort.apply(this, arguments);
    }
  }
});

var sortRows = function(rows, compare, reverse) {
  var compareFunc = reverse ? function(a, b) { return compare(b, a); } : compare;
  // so... the reason we can't just sort a bunch of rows is because we have parent and child rows
  // which screws a lot of things up. Like, a lot of things.
  var rowsets = [];
  for(var i = 0; i < rows.length; ++i) {
    var set = { parent: rows[i], children: [] };
    while(rows[i+1] && rows[i+1].__isChild) {
      i++;
      set.children.push(rows[i]);
    }
    rowsets.push(set);
  }
  rowsets.sort(function(a, b) { return compareFunc(a.parent, b.parent); });

  var sorted = [];
  _.each(rowsets, function(set) { sorted.push(set.parent); sorted.push.apply(sorted, set.children.sort(compareFunc)); });
  return new can.List(sorted);
};

var resort = function(ev) {
  var col = this.scope.sortedColumn;
  var compare = _.isFunction(col.compare) ? col.compare : function(a, b) {
    var aVal = a[col.id], bVal = b[col.id];
    return (aVal < bVal ? -1 : (aVal > bVal ? 1 : 0));
  };
  var sorted = sortRows(this.scope.rows, compare, this.scope.sortedDirection === 'desc');
  this.scope.rows.splice.apply(this.scope.rows, [0, this.scope.rows.length].concat(Array.from(sorted)));
};

export default Grid;
