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
import PbrDeleteConfirmModal from 'components/pbr-delete-confirm-modal/';

import template from './template.stache!';
import styles from './page-payment-bundles.less!';

import exportToExcel from 'components/export-toexcel/';

var pageState = new Map({
  bundles: new PaymentBundle.List([]),
  selectedBundle: null,
  verboseGrid: true
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
            can.batch.start();
            pageState.bundles.splice(0, pageState.bundles.length);
            pageState.attr('selectedBundle', null);
            can.batch.stop(); 
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
    '.delete-bundle click': function(el, ev) {
      if(!this.scope.pageState.selectedBundle) {
        return;
      }

      PbrDeleteConfirmModal.displayModal(this.scope.pageState.selectedBundle, {
        action: 'delete',
        approvalComment: '',
        paymentOption: 1
      });
      this.scope.attr('selectedBundle', null);
    },
    '.add-invoice click': function(el, ev) {
      can.route.attr('page', 'invoices');
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
    }
  }
});

export default page;
