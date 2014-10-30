import Grid from 'components/grid/';

import template from './template.stache!';
import _less from './bundle-detail-grid.less!';

var BundleDetailGrid = Grid.extend({
  tag: 'rn-bundle-detail-grid',
  template: template,
  scope: {
    makeRowsFromBundle: function(bundle) {
      // so the bundle has a bundleDetailsGroup (which is a List of BundleDetailGroup model instances)
      // and each of those instances is a parent row
      // each BundleDetailGroup instance has a bundleDetails (which is a List of BundleDetail model instances)
      // and each of those is a child row
      var rows = [];
      bundle.bundleDetailsGroup && bundle.bundleDetailsGroup.forEach(function(group) {
        rows.push(group);
        group.bundleDetails.forEach(function(detail) {
          detail.attr('__isChild', true);
          rows.push(detail);
        });
      });

      return rows;
    },
    aggregateRows: [],
    makeAggregateRowsFromBundle: function(bundle) {
      return [bundle];
    }
  },
  helpers: {
    // overwrite this to deal with verbose/expanded mode
    filteredColumns: function(options) {
      var filteredColumns = this.attr('columns');
      if(! this.pageState.attr('verboseGrid')) {
        // use only the ones without verboseOnly = true
        filteredColumns = _.filter(filteredColumns, column => !column.verboseOnly);
      }

      return _.map(filteredColumns, column => options.fn({column}));
    },
    footerRows: function(options) {
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
      can.__reading(this.aggregateRows, 'change'); // TODO: figure out if there's a better way to do this.
                                          // Note for others - don't use can.__reading yourself!

      return _.map(this.aggregateRows, function(row) {
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
  events: {
    '{scope.pageState} selectedBundle': function(ev, newBundle) {
      this.scope.rows.splice(0, this.scope.rows.length, ...(newBundle ? this.scope.makeRowsFromBundle(newBundle) : []));
      this.scope.aggregateRows.splice(0, this.scope.aggregateRows.length, ...(newBundle ? this.scope.makeAggregateRowsFromBundle(newBundle) : []));
    },
    '{scope.pageState.selectedBundle.bundleDetailsGroup} length': function() {
      this.scope.rows.splice(0, this.scope.rows.length, ...this.scope.makeRowsFromBundle(this.scope.pageState.selectedBundle));
      this.scope.aggregateRows.splice(0, this.scope.aggregateRows.length, ...this.scope.makeAggregateRowsFromBundle(this.scope.pageState.selectedBundle));
    }
  }
});
