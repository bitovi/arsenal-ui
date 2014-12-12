import Component from 'can/component/';
import Map from 'can/map/';
import can from 'can/';

// Models
import PaymentBundle from 'models/payment-bundle/';

// Components
import PaymentBundleGrid from 'components/bundle-grid/';
import PaymentBundleDetail from 'components/bundle-detail/';

import template from './template.stache!';
import styles from './page-payment-bundles.less!';

var pageState = new Map({
  bundles: new PaymentBundle.List([]),
  selectedBundle: null,
  verboseGrid: !false
});

var page = Component.extend({
  tag: 'page-payment-bundles',
  template: template,
  scope: {
    appstate: null, // will be passed in
    pageState: pageState,
    appstateFilled: function(scope) {
      var filled =  scope.appstate &&
                    scope.appstate.attr('storeType') &&
                    scope.appstate.attr('region') &&
                    scope.appstate.attr('country') &&
                    scope.appstate.attr('licensor') &&
                    scope.appstate.attr('contentType');

      return !!filled;
    },
    refreshBundles: function() {
      if(this.scope.appstateFilled(this.scope)) {
        PaymentBundle.findAll({appstate: this.scope.appstate}).then(function(bundles) {
          can.batch.start();
          pageState.bundles.splice(0, pageState.bundles.length)
          pageState.bundles.replace(bundles);
          can.batch.stop();
        });
      }
    }
  },
  helpers: {
    showPage: function(options) {
      can.__reading(this.appstate, 'change');
      if(this.appstateFilled(this)) {
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
      this.scope.pageState.selectedBundle.destroy({
        appstate: this.scope.appstate
      });
    },
    '.add-invoice click': function(el, ev) {
      // go to Add Invoice page
    },
    '.excel click': function(el, ev) {
      // call excel download service (make this a method in the model)
    },
    '.clipboard click': function(el, ev) {
      // copy bundle list information to clipboard
    },
  }
});

export default page;
