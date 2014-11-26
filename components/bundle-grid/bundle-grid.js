import Grid from '../grid/';
import _less from './bundle-grid.less!';

var BundleGrid = Grid.extend({
  tag: 'rn-bundle-grid',
  scope: {
    pageState: null, // passed in
    columns: [
      {
        id: 'isHighPriority',
        title: '!', // needs to change
        contents: function(row) {
          return row.isHighPriority ? '!' : ''
        }
      },
      {
        id: 'bundleName',
        title: 'Bundle Name'
      },
      {
        id: 'paymentCurrency',
        title: 'Currency'
      },
      {
        id: 'totalPaymentAmount',
        title: 'Amount',
        contents: row => row.totalPaymentAmount.toFixed(2)
      },
      {
        id: 'bundleType',
        title: 'Bundle Type',
        contents: function(row) {
          return {
            'REGULAR_INV': 'Regular',
            'ON_ACCOUNT': 'On Account',
            'ADHOC_INV': 'Ad Hoc'
          }[row.bundleType];
        }
      },
      {
        id: 'periodRange',
        title: 'Period Range',
        // TODO: will need to convert to period names
        contents: function(row) {
          if(row.periodFrom === row.periodTo) {
            return row.periodFrom;
          } else {
            return row.periodFrom + ' - ' + row.periodTo;
          }
        }
      },
      {
        id: 'region',
        title: 'Region'
      },
      {
        id: 'pendingWith',
        title: 'Pending With'
      },
      {
        id: 'state',
        title: 'Status'
      },
      {
        id: 'pendingDays',
        title: 'Pending'
      }
    ]
  },
  helpers: {
    // override rowClass handler to add a class if the row is selected
    rowClass: function(row) {
      if(this.pageState.attr('selectedBundle') && this.pageState.selectedBundle.bundleId === row.bundleId) {
        return 'selected';
      } else {
        return '';
      }
    }
  },
  events: {
    'tbody tr click': function(el, ev) {
      var bundle = el.data('row').row;

      this.scope.pageState.attr('selectedBundle', bundle);
    }
  }
});
