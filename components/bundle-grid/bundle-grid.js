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
    // {rdar://problem/19401266 - Status in PBR is not descriptive
    //   id: 'status',
    //   title: 'Status'
    // },
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
      if(this.pageState.attr('selectedBundle') && this.pageState.selectedBundle != null && this.pageState.selectedBundle.bundleId === row.bundleId) {
        return 'selected';
      } else {
        return '';
      }
    }
  },
  events: {
    'inserted': function(el, ev) {

      // we have to do this manually because scroll does not bubble
      // normally, you should not attach event handlers this way!
      var component = this;
      var tbody = this.element.find('tbody');
      var doneCallback = function() {

        console.log(" Records Availble to sort:  "+component.scope.pageState.recordsAvailable);
        //recordsAvailable is to know, if there is next set records available, if yes, invoke
        if(component.scope.pageState.recordsAvailable){
          component.scope.pageState.attr("isPaginateReq",true);
        }
        component.scope.attr('atBottom', false);
      };
      $(tbody).on('scroll', function(ev) {
        if(tbody[0].scrollTop + tbody[0].clientHeight >= tbody[0].scrollHeight - 100 ) {
          // we are at the bottom
          component.scope.attr('atBottom', true);
          component.scope.atBottomHandler.call(component, doneCallback);
        }
      });
    },
    'tbody tr click': function(el, ev) {
      var bundle = el.data('row').row;
      this.scope.pageState.attr('selectedBundle', bundle);
    }
  }
});
