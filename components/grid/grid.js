import _ from 'lodash';
import Component from 'can/component/';

import template from './template.stache!';
import _less from './grid.less!';

var Grid = Component.extend({
  tag: 'rn-grid',
  template: template,

  scope: {
    columns: [/*
      {
        id: 'example',
        title: 'Example Column',
        className: 'example', // optional
        contents: function(row) { return row.prop; } // optional, returns whatever you can return from a helper
      }, ...
    */],
    rows: [],
    footerrows: []
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
    columnTitle: function(column) {
      // By default, just use the title property of the column.
      return column.attr('title');
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
          childRowsAreVisible = false,
          scope = this;

      this.rows.attr('length');
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
    footerRows: function(options) {
      // By default, rows are a bit more complex.
      // We have to account for child rows being invisible when their parents aren't open.
      //console.log("Footer Rows are "+JSON.stringify(this.footerrows.attr()));
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
      return _.isFunction(column.contents) ? column.contents(row) : row.attr(column.attr('id')).toString();
    },
    getColumnLength: function(options){
      //console.log("column length is "+ JSON.stringify(this.attr("columns").length));
      return this.attr("columns").length;
    }
  },

  events: {
    '.open-toggle click': function(el, ev) {
      var row = el.closest('tr').data('row').row;
      row.attr('__isOpen', !row.attr('__isOpen'));
      row.attr('__isChecked', row.attr('__isChecked'));
    }
  }
});

export default Grid;
