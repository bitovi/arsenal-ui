import _ from 'lodash';
import Component from 'can/component/';
import Map from 'can/map/';
import can from 'can/';
import stache from 'can/view/stache/';

// Models
import PaymentBundle from 'models/payment-bundle/';

// Components
import PaymentBundleGrid from 'components/bundle-grid/';
import PaymentBundleDetail from 'components/bundle-detail/';

import commonUtils from 'utils/commonUtils';

import template from './template.stache!';
import styles from './page-payment-bundles.less!';

import exportToExcel from 'components/export-toexcel/';
import copy from 'components/copy-clipboard/';

var pageState = new Map({
  bundles: new PaymentBundle.List([]),
  selectedBundle: null,
  verboseGrid: true,
  resetSelection: true
});

var page = Component.extend({
  tag: 'page-payment-bundles',
  template: template,
  scope: {
    appstate: null, // will be passed in
    pageState: pageState,
    isPageSearch: undefined,
    refreshBundles: _.debounce(function() {
      if(this.scope.isPageSearch != this.scope.appstate.globalSearch) {

        this.scope.appstate.attr('excelOutput',false);

        resetGrids(pageState);

        this.scope.isPageSearch  = this.scope.appstate.globalSearch;
         PaymentBundle.findAll({appstate: this.scope.appstate}).then(function(bundles) {
          can.batch.start();
          pageState.bundles.splice(0, pageState.bundles.length)
          pageState.bundles.replace(bundles);
          can.batch.stop();
        }, function(err){
          console.log(err);
        });
      }else {
        if(!this.scope.appstate.excelOutput){

            resetGrids(pageState);

          }
    }
    }, 200)
  },
  helpers: {
    showPage: function(options) {
    //  return options.fn(this);
      // if(this.appstate.attr('globalSearch')) {
      //
      // } else {
      //   return '';
      // }
    }
  },
  events: {
    'inserted': function(ev, el) {
      this.scope.appstate.attr('renderGlobalSearch', true);
      this.scope.appstate.attr('excelOutput',false);
      this.scope.refreshBundles.apply(this);
    },
    '{scope} change': function(scope, ev, attr) {
      if(attr.substr(0, 8) === 'appstate') {
         this.scope.refreshBundles.apply(this);
      }
    },
    //Removed the Delete bundle as its not require for top grid. It only need to be available in the bottom grid
    // '.delete-bundle click': function(el, ev) {
    //   if(!this.scope.pageState.selectedBundle) {
    //     return;
    //   }
    //
    //   PbrDeleteConfirmModal.displayModal(this.scope.pageState.selectedBundle, {
    //     action: 'delete',
    //     approvalComment: '',
    //     paymentOption: 1
    //   });
    //   this.scope.attr('selectedBundle', null);
    // },
    '.add-invoice click': function(el, ev) {
      commonUtils.navigateTo("invoices");
    },
    '.excel click': function(el, ev) {
      var self = this;

      self.scope.appstate.attr('excelOutput', true);

      if(this.scope.appstate.excelOutput ) {

         PaymentBundle.findOne({appstate: this.scope.appstate}).then(function(data) {
            if(data["status"]=="0000"){
                $('#exportExcel').html(stache('<export-toexcel csv={data}></export-toexcel>')({data}));
           }
         },function(err){
            console.log(err);
        });
       }

    },
    '.clipboard click': function(el, ev) {
      // copy bundle list information to clipboard
       $('#clonetable').empty().html($('#page').find('table:visible').clone(true).attr('id','dynamic'));
         $('copy-clipboard').slideDown(function(){
           $('body').css('overflow','hidden');
           $('#copyall').trigger('click');
        });
    }
  }
});



var resetGrids = function(pageState){
  //Reset the grid

  can.batch.start();
  pageState.bundles.splice(0, pageState.bundles.length);
  pageState.attr('selectedBundle', null);
  can.batch.stop();


}

export default page;
