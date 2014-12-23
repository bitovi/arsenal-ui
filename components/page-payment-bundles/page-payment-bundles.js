import _ from 'lodash';
import Component from 'can/component/';
import Map from 'can/map/';
import can from 'can/';

// Models
import PaymentBundle from 'models/payment-bundle/';

// Components
import PaymentBundleGrid from 'components/bundle-grid/';
import PaymentBundleDetail from 'components/bundle-detail/';
import PbrDeleteConfirmModal from 'components/pbr-delete-confirm-modal/';

import template from './template.stache!';
import styles from './page-payment-bundles.less!';

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
    refreshBundles: _.debounce(function() {
      if(this.scope.appstate.filled) {
        PaymentBundle.findAll({appstate: this.scope.appstate}).then(function(bundles) {
          can.batch.start();
          pageState.bundles.splice(0, pageState.bundles.length)
          pageState.bundles.replace(bundles);
          can.batch.stop();
        });
      } else {
        can.batch.start();
        pageState.bundles.splice(0, pageState.bundles.length);
        pageState.attr('selectedBundle', null);
        can.batch.stop();
      }
    }, 200)
  },
  helpers: {
    showPage: function(options) {
      if(this.appstate.attr('filled')) {
        return options.fn(this);
      } else {
        return '';
      }
    }
  },
  events: {
    'inserted': function(ev, el) {
      this.scope.appstate.attr('renderGlobalSearch', true);
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
      // call excel download service (make this a method in the model)
    },
    '.clipboard click': function(el, ev) {
      // copy bundle list information to clipboard
    }
  }
});

export default page;
