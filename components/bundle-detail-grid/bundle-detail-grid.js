import $ from 'jquery';
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
      var rows = [];
      if(bundle.bundleFooter) {
        rows.push(bundle.bundleFooter);
        bundle.bundleFooter.bdlFooterDetails.forEach(function(detail) {
          detail.attr('__isChild', true);
          rows.push(detail);
        });
      }

      return rows;
    },

    selectedRows: []
  },
  helpers: {
    filteredColumns: function(options) {
      can.__reading(this.rows, 'change'); // TODO: figure out if there's a better way to do this.
                                          // Note for others - don't use can.__reading yourself!

      var filteredColumns = this.attr('columns');
      if(! this.pageState.attr('verboseGrid')) {
        // use only the ones without verboseOnly = true
        filteredColumns = _.filter(filteredColumns, column => !column.verboseOnly);
      }

      if(!_.some(this.attr('rows'), row => row.attr('validationMessages') && row.attr('validationMessages').attr('length'))) {
        filteredColumns = _.filter(filteredColumns, column => !column.validationsOnly);
      }

      return _.map(filteredColumns, column => options.fn({column}));
    },
    filteredRows: function(options) {
      return Grid.prototype.helpers.filteredRows.apply(this, arguments);
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
    },
    // override rowClass handler to add a class if the row is selected
    rowClass: function(row) {
      if(this.selectedRows.indexOf(row) > -1) {
        return 'selected';
      } else {
        return '';
      }
    }
  },
  events: {
    '{scope.pageState} selectedBundle': function(scope, ev, newBundle) {
      this.scope.rows.splice(0, this.scope.rows.length, ...(newBundle ? this.scope.makeRowsFromBundle(newBundle) : []));
      this.scope.aggregateRows.splice(0, this.scope.aggregateRows.length, ...(newBundle ? this.scope.makeAggregateRowsFromBundle(newBundle) : []));
    },
    '{scope.pageState.selectedBundle.bundleDetailsGroup} length': function() {
      this.scope.rows.splice(0, this.scope.rows.length, ...this.scope.makeRowsFromBundle(this.scope.pageState.selectedBundle));
      this.scope.aggregateRows.splice(0, this.scope.aggregateRows.length, ...this.scope.makeAggregateRowsFromBundle(this.scope.pageState.selectedBundle));
    },
    'tbody tr click': function(el, ev) {
      if(ev.target.classList.contains('open-toggle')) {
        return;
      }

      var row = el.data('row').row;

      // toggle selecting a row
      var ix = this.scope.selectedRows.indexOf(row);
      if(ix > -1) {
        this.scope.selectedRows.splice(ix, 1);
      } else {
        this.scope.selectedRows.push(row);
      }
    },
    'td.validations img mouseover': function(el, ev) {
      var row = el.data('row');
      el.popover({
        content: row.validationMessages.join(' '),
        trigger: 'manual'
      });
      el.popover('show');
    },
    'td.validations img mouseout': function(el, ev) {
      el.popover('hide');
    },
  }
});
