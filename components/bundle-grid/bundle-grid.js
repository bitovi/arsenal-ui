import Period from 'models/common/periodFrom/';
import ScrollingGrid from 'components/grid/examples/scrolling-grid/';
import formats from 'utils/formats';
import _less from './bundle-grid.less!';
import PeriodWidgetHelper from 'utils/periodWidgetHelpers';

var BundleGrid = ScrollingGrid.extend({
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
        id: 'paymentCcy',
        title: 'Currency'
      },
      {
        id: 'paymentAmt',
        title: 'Amount',
        format: formats.currencyFormat
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
        contents: function(row) {
          if(row.periodFrom === row.periodTo) {
            return PeriodWidgetHelper.getDisplayPeriod(row.periodFrom.toString(), row.periodType);
          } else {
            return PeriodWidgetHelper.getDisplayPeriod(row.periodFrom.toString(), row.periodType) + ' - ' + PeriodWidgetHelper.getDisplayPeriod(row.periodTo.toString(), row.periodType)
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
        id: 'status',
        title: 'Status'
      },
      {
        id: 'pendingDays',
        title: 'Pending Days',
        format: formats.int
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
