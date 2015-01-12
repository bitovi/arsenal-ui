import Period from 'models/common/periodFrom/';
import ScrollingGrid from 'components/grid/examples/scrolling-grid/';
import formats from 'utils/formats';
import _less from './bundle-grid.less!';
import PeriodWidgetHelper from 'utils/periodWidgetHelpers';
import gridtemplate from './gridtemplate.stache!';

var BundleGrid = ScrollingGrid.extend({
  tag: 'rn-bundle-grid',
  template: gridtemplate,
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
    'inserted': function(){
      var self= this;
      var tbody = self.element.find('tbody');
      var parentObj = self.element.closest('page-payment-bundles');
      var parentScopeVar = self.element.closest('page-payment-bundles').scope();
      var tableScrollTopVal = parentScopeVar.attr('tableScrollTop');
      $(tbody[0]).scrollTop(tableScrollTopVal);
        $(tbody).on('scroll', function(ev) {
          if(tbody[0].scrollTop + tbody[0].clientHeight >= tbody[0].scrollHeight) {
            //console.log(JSON.stringify(self.element.closest('page-invoices').scope().appstate.attr()));

            
            var offsetVal = parentScopeVar.attr('pbOffset');
            //console.log(offsetVal);

            /* Reset the offset value and call the webservice to fetch next set of records */
            parentScopeVar.attr('pbOffset', (parseInt(offsetVal)+1));
            parentScopeVar.attr('tableScrollTop', (tbody[0].scrollHeight-200));
            parentScopeVar.appstate.attr('globalSearchButtonClicked', false);

            /* The below code calls {scope.appstate} change event that gets the new data for grid*/
            /* All the neccessary parameters will be set in that event */
           if(parentScopeVar.appstate.attr('globalSearch')){
              parentScopeVar.appstate.attr('globalSearch', false);
            }else{
              parentScopeVar.appstate.attr('globalSearch', true);
            }

          }
        });
    },
    'tbody tr click': function(el, ev) {
      var bundle = el.data('row').row;
      this.scope.pageState.attr('selectedBundle', bundle);
    }
  }
});
