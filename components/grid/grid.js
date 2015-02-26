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
        contents: function(row) { return row.prop; }, // optional, returns whatever you can return from a helper,
        valueProperty: 'example', // optional, which property on the row to use, defaults to whatever's in 'id'
        format: function(value) { return format(value); } // optional, used if you don't include `contents`, most useful with utils/formats.js
      }, ...
    */],
    rows: [],
    footerrows:[],
    allOpen: false,
    sortedColumn: null,
    sortedDirection: null, // should be 'asc' or 'desc'
    strippedGrid:false
  },
  helpers: {
    tableClass: function() {
      // By default, don't return anything.
      return '';
    },
    filteredColumns: function(options) {
      // By default, use all the columns.
      this.columns.attr('length'); // also re-render when the column length changes
      return _.map(this.attr('columns'), column => options.fn({column}));
    },
    columnClass: function(column) {
      // By default, just return the className property on the column, or the ID, or nothing.
      return column.attr('className') || column.attr('id') || '';
    },
    sortableStyle: function(column){
      if(column.attr('sortable')){
        return 'style="cursor:pointer;"';
      }
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
      //console.log("fsdfsdasd "+ JSON.stringify(this.attr('sortcolumnnames')));
      //console.log("fsdfsdasd "+ JSON.stringify(this.attr('sortdir')));

      /* This 'sortcolumnnames' holds all the sorting column information in array format */
      /* The following condition identify each column and set it in 'sortedColumn' scope in teh
      accepted format {id: columnName} */
      if(this.attr('sortcolumnnames')!=undefined){
        var sortedCols = this.sortcolumnnames.attr();
        var sortedDir = this.attr('sortdir');
        var sortedColsLength = sortedCols.length;
        var temp = {};
        for(var i=0; i<sortedColsLength;i++){
          if(sortedCols[i] === column.attr('id')){
            temp.id = sortedCols[i];
            //this.attr("sortedColumn",temp);
            //this.attr("sortedDirection",sortedDir);
            return this.sortdir === 'desc' ? '▽' : '△';
          }
        }
      } else {
        if(column.attr('sortable') && this.attr('sortedColumn') && this.sortedColumn.id === column.attr('id')) {
          return this.sortedDirection === 'desc' ? '▽' : '△';
        } else {
          return '';
        }
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

      var out = [],parentRowIndex=-1,rowindex=-1,
      childRowsAreVisible = false;
      can.__reading(this.rows, 'change'); // TODO: figure out if there's a better way to do this.
                                          // Note for others - don't use can.__reading yourself!
      return _.map(this.rows, function(row) {
        var isChild = isRowAChild(row);
        var isOddRow=false;
        var isStrippedGrid=false;

        // if the row is a parent and isn't open, its children shouldn't be visible -
        // this flag is only true for the children of an open parent row
        if(!isChild) {
          childRowsAreVisible = isRowOpen(row);
          parentRowIndex++;
          if( parentRowIndex % 2 != 0){isOddRow=true;}
        }

        //if stripped grid parameter enables and if it is not a child record then
        //set true to isStrippedGrid. This check will disable to apply the bg color to child
        //rows
        if(options.context.attr('strippedGrid') && !isChild){
          isStrippedGrid=true;
        }

        //console.log(this);
        //console.log("Testing ssdfsfsdf",row.attr("invId"),isChild,isOddRow);
        return options.fn({
          row: row,
          isOpen: isChild ? false : isRowOpen(row), // child rows are never open
          isChild: isChild,
          isVisible: isChild ? childRowsAreVisible : true, // parent rows are always visible
          isOddRow:isOddRow,
          index:++rowindex,
          isStrippedGd:isStrippedGrid
        });
      });
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
      // By default, if column has a contents function, run the row through that.
      // Else, use the value in the property named by 'valueProperty' (fall back to 'id'), and run it through 'format' if it exists.
      if(_.isFunction(column.contents)) {
        return column.contents.call(this, row);
      } else {
        var value = row.attr(column.attr('valueProperty') || column.attr('id'));
        if(value === undefined || value == null) {
          value = '';
        }
        if(_.isFunction(column.format)) {
          value = column.format.call(null, value);
        }
        return value.toString();
      }
      // By default, if column has a value function, run the row through that.
      // Otherwise, return the value of the property on the row named for the column ID.
      return _.isFunction(column.contents) ? column.contents.call(this, row) : row.attr(column.attr('id')).toString();
    },
    getColumnLength: function(options){
      //console.log("column length is "+ JSON.stringify(this.attr("columns").length));
      return this.attr("columns").length;
    }
  },

  events: {
    '.open-toggle click': function(el, ev) {
      /*var row = el.closest('tr').data('row').row;
      row.attr('__isOpen', !row.attr('__isOpen'));*/
      //the above line will re render the complete tbody again.
      //insted we can go for simple DOM manipulatation to make the child visible
      //get the row index
      if($(el.closest('tr').parent()).is('tfoot')){
        $(el.closest('table').find('tfoot').find('tr')).not('.child').toggleClass('open');
        $(el.closest('table').find('tfoot').find('.child')).toggleClass('visible');
      }else{
        var index=el.closest('tr').data('row').index;
        var allRows=el.closest('table').find('tbody').find('tr'); // get all the rows from table.
        for(var k=index+1;k<allRows.length;k++){
          if(!$(allRows[k]).hasClass('child')){//if you encountered the next parent then break the loop and comeout
            break;
          }
          if($(allRows[k]).hasClass('child')){
            $(allRows[k]).toggleClass('visible');
          }
        }
        $(allRows[index]).toggleClass('open');
      }
    },
    '.open-toggle-all click': function(el, ev) {
      /*ev.stopPropagation();
      var allOpen = _.every(this.scope.rows, row => row.__isChild ? true : row.__isOpen);
      can.batch.start();
      // open parent rows if they are closed; close them if they are open
      this.scope.rows.each(row => row.__isChild || row.attr('__isOpen', !allOpen));
      this.scope.attr('allOpen', !allOpen);*/
      /*$(el.closest('table').find('thead').find('tr')).toggleClass('open');
      $(el.closest('table').find('tbody').find('tr')).not('.child').toggleClass('open');
      $(el.closest('table').find('tbody').find('.child')).toggleClass('visible');*/
      var isOpend=el.closest('table').find('thead').find('tr').hasClass('open');
      if(!isOpend){
        $(el.closest('table').find('thead').find('tr')).addClass('open');
        $(el.closest('table').find('tbody').find('tr')).not('.child').addClass('open');
        $(el.closest('table').find('tbody').find('.child')).addClass('visible');
      }else{
        $(el.closest('table').find('thead').find('tr')).removeClass('open');
        $(el.closest('table').find('tbody').find('tr')).not('.child').removeClass('open');
        $(el.closest('table').find('tbody').find('.child')).removeClass('visible');
      }
    },
    /*'tbody th, tfoot th click': function(el, ev) {
      var column = el.data('column').column;

      if(this.scope.attr('sortedColumn') && this.scope.attr('sortedColumn').id === column.id) {
        this.scope.attr('sortedDirection', this.scope.attr('sortedDirection') === 'asc' ? 'desc' : 'asc');
      } else if(column.sortable) {
        can.batch.start();
        this.scope.attr('sortedColumn', column);
        this.scope.attr('sortedDirection', column.defaultSortDirection || 'asc');
        can.batch.stop();
      }
    },*/
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
