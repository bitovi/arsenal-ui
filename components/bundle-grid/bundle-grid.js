import Period from 'models/common/periodFrom/';
import ScrollingGrid from 'components/grid/examples/scrolling-grid/';
import formats from 'utils/formats';
import _less from './bundle-grid.less!';
import PeriodWidgetHelper from 'utils/periodWidgetHelpers';
import gridUtils from 'utils/gridUtil';
import stache from 'can/view/stache/';
import commonUtils from 'utils/commonUtils';
import template from './template.stache!';
import PaymentBundle from 'models/payment-bundle/';


var BundleGrid = ScrollingGrid.extend({
  tag: 'rn-bundle-grid',
  template: template,
  scope: {
    pageState: null, // passed in
    strippedGrid:true,
    editingRow: null,
    editingColumn: null,
    columns: [
    {
      id: 'isHighPriority',
      title: '!', // needs to change
      contents: function(row) {
        return row.priority == 'Y' ? '!' : ''
      }
    },
    {
      id: 'bundleName',
      title: 'Bundle Name',
      editable: true,
      setValue: function(row, newValue) {
        row.attr('bundleName', newValue);
        //console.log("newValue :"+newValue+", bundle_id :"+row.bundleId)
      },
      contents: function(row) {
        if(row.editable){
          return stache('{{bundleName}}<img id="bundleEditImage" src="/resources/images/Edit_small.png" {{data \'row\'}}/>')({bundleName: row.bundleName},row);
        }else{
          return row.bundleName;
        }
      }
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
    },
    cellContents: function(row, column) {
      if(this.attr('editingRow') === row && this.attr('editingColumn') === column) {
        return stache('<div class="input-group"><input  type="text"  autofocus value="{{value}}" style="min-width: 200px;" class="form-control resizeBox editing" ><div class="input-group-btn"><button  class="btn btn-default cancelBundleEdit" style="background: url(\'/resources/images/ActionCancel.png\') no-repeat;background-size: 15px 15px;background-position: 50% 50%;" type="button"/><button  class="btn btn-default editName" style="background: url(\'/resources/images/checkMarkDark.png\') no-repeat;background-position: 50% 50%; background-size: 15px 15px;" type="button"/></div></div>')({value: row.bundleName});
      } else {
        return ScrollingGrid.prototype.helpers.cellContents.call(this, row, column);
      }
    }
  },
  events: {
    'inserted': function(el, ev) {

      var tbody = this.element.find('tbody');
      var $window = $(window).on('resize', function(){

        var getTblBodyHght=gridUtils.getTableBodyHeight('payBundleGrid',25);
          gridUtils.setElementHeight(tbody,getTblBodyHght,getTblBodyHght);
        }).trigger('resize');


      // we have to do this manually because scroll does not bubble
      // normally, you should not attach event handlers this way!
      var component = this;

      var doneCallback = function() {

        //console.log(" Records Availble to sort:  "+component.scope.pageState.recordsAvailable);
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
    '.editName click': function(el, ev) {
      // do validation here first
      // console.log($(".editing").val())
      if($(".editing").val().trim().length == 0) {
        //el.addClass('error');
        $(".editing").css( "border", "0.1em solid red" );
        commonUtils.displayUIMessage( "Error", "Bundlename is Mandatory!");
        console.log('error detected!');
        return false;
      }
      var self = this;

      var column = el.closest('td').data('column').column;
      var row = el.closest('tr').data('row').row;

      PaymentBundle.editBundleName(row.bundleId,$(".editing").val()).done(function(data) {

        commonUtils.displayUIMessage( data.status, data.responseText);

        if(data.status === 'SUCCESS'){
          //console.log('setting new value', el.val(), column, row);
          column.setValue(row, $(".editing").val());
          self.scope.attr({
            'editingRow': null,
            'editingColumn': null
          });
        }else{
          $(".editing").css( "border", "0.1em solid red" );
        }
      });


    },
    '.cancelBundleEdit click': function(el, ev) {
      var column = el.closest('td').data('column').column;
      var row = el.closest('tr').data('row').row;
      //console.log('setting new value', el.val(), column, row);

      column.setValue(row, row.bundleName);
      this.scope.attr({
        'editingRow': null,
        'editingColumn': null
      });
    },
    '#bundleEditImage click': function(el, ev) {
      var column = el.closest('td').data('column').column;
      if(column.editable) {
        can.batch.start();
        this.scope.attr('editingRow', el.closest('tr').data('row').row);
        this.scope.attr('editingColumn', column);
        can.batch.stop();
      } else {
        console.log('You cannot edit this.');
      }
    },
    'tbody tr click': function(el, ev) {
      //if(el.data('row') == undefined) return false;
      var bundle = el.data('row').row;
      this.scope.pageState.attr('selectedBundle', bundle);

    }
  }
});
