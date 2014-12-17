import _ from 'lodash';
import Component from 'can/component/';
import List from 'can/list/';

import PaymentBundleDetailGroup from 'models/payment-bundle/payment-bundle-detail-group';
import PaymentBundleDetail from 'models/payment-bundle/payment-bundle-detail';
import WorkflowStep from 'models/workflow-step/';

import BundleDetailGrid from 'components/bundle-detail-grid/';
import Switcher from 'components/switcher/';
import WorkflowDisplay from 'components/workflow-display/';

import columnSets from './column-sets';
import constants from 'utils/constants';

import template from './template.stache!';
import _less from './bundle-detail.less!';

var VALIDATION_CHECK_INTERVAL = 3000;

var bundleTypeColumnSets = {
  'REGULAR_INV': [
    {
      value: 'licensor',
      text: 'Licensor',
      columns: columnSets.regularLicensor
    },
    {
      value: 'country',
      text: 'Country',
      columns: columnSets.regularCountry
    }
  ],
  'ON_ACCOUNT': columnSets.onAccount,
  'ADHOC_INV': columnSets.adHoc,
};

var BundleDetailTabs = Component.extend({
  tag: 'rn-bundle-detail',
  template: template,
  scope: {
    appstate: null, // passed in
    pageState: null, // passed in
    tabs: [],
    selectedTab: null,
    aggregatePeriod: false,
    paymentType: 1,
    approvalComment: '',

    havePaymentTypeAndComment: function(scope) {
      return  (this.appstate.userInfo.role === constants.ROLES.BM ? scope.paymentType : true) &&
              scope.approvalComment.trim().length;
    },

    gridColumns: [],
    selectedRows: [],

    workflowSteps: new WorkflowStep.List([]),

    gettingDetails: false,
    getNewDetails: function(bundle) {
      var scope = this;

      var view;
      if(bundle.bundleType === 'REGULAR_INV') {
          view = this.attr('selectedTab').value;
          if(view === 'country' && this.attr('aggregatePeriod')) {
            view = 'aggregate';
          }
      } else {
        view = 'licensor';
      }

      this.attr('gettingDetails', true);
      return bundle.getDetails(
        this.appstate,
        view,
        this.paymentType
      ).then(function(bundle) {
        scope.attr('gettingDetails', false);

        scope.getNewValidations(bundle);
        return bundle;
      });
    },
    getNewValidations: function(bundle) {
      var scope = this;

      var view;
      if(bundle.bundleType === 'REGULAR_INV') {
        view = this.attr('selectedTab').value;
        if(view === 'country' && this.attr('aggregatePeriod')) {
          view = 'aggregate';
        }
      } else {
        view = 'licensor';
      }

      if(scope.pageState.selectedBundle === bundle) {
        /*return bundle.getValidations(view).then(function(bundle) {
          if(bundle.validationStatus !== 5) {
            setTimeout(function() {
              scope.getNewValidations(bundle);
            }, VALIDATION_CHECK_INTERVAL);
          }

          return bundle;
        });*/
      }
    }
  },
  helpers: {
    showAggregateControl: function(options) {
      return this.attr('selectedTab') && this.selectedTab.value === 'country' ? options.fn(this) : '';
    },
    validationStatus: function(options) {
      return this.pageState.selectedBundle && this.pageState.selectedBundle.attr('validationRulesTotal') > 0 ? options.fn(this.pageState.selectedBundle) : '';
    },
    canRemoveInvoice: function(options) {
      if(this.pageState.attr('selectedBundle.bundleType') === 'REGULAR_INV' &&
         this.selectedRows.attr('length') > 0
         && _.every(this.attr('selectedRows'), row => row instanceof PaymentBundleDetailGroup
      )) {
        return options.fn(this);
      } else {
        '';
      }
    },
    canShowChart: function(options) {
      if(this.pageState.attr('selectedBundle.bundleType') === 'REGULAR_INV' &&
         this.selectedRows.attr('length') > 0 &&
         _.every(this.attr('selectedRows'), row => row instanceof PaymentBundleDetail)
      ) {
        return options.fn(this);
      } else {
        '';
      }
    },
    showVerboseToggle: function(options) {
      this.gridColumns.attr('length');
      if(_.some(this.attr('gridColumns'), column => column.verboseOnly)) {
        return options.fn(this);
      } else {
        return '';
      }
    },
    isBM: function(options) {
      return (this.appstate.userInfo.role === constants.ROLES.BM) ? options.fn(this) : options.inverse(this);
    },
    canProceed: function() {
      this.attr('paymentType'); this.attr('approvalComment');
      return this.havePaymentTypeAndComment(this) ? 'action' : '';
    }
  },
  events: {
    '.remove-invoice click': function(el, ev) {
      this.scope.selectedRows.forEach(row => row.destroy());
    },
    '.show-chart click': function(el, ev) {
      // show the chart
    },
    '.excel click': function(el, ev) {
      // export data to Excel
    },
    '.clipboard click': function(el, ev) {
      // copy data to the clipboard
    },
    '.verbose-toggle click': function(el, ev) {
      this.scope.pageState.attr('verboseGrid', !this.scope.pageState.verboseGrid);
    },
    '.approval-comment .buttons .action click': function(el, ev) {
      var action = el.data('action'),
          selectedBundle = this.scope.pageState.selectedBundle,
          pageState = this.scope.pageState;

      if(!this.scope.havePaymentTypeAndComment(this.scope)) {
        return;
      }

      selectedBundle.moveInWorkflow({
        action: action,
        approvalComment: this.scope.approvalComment
      }).then(function() {
        // un-select the selected bundle (we're done here)
        pageState.attr('selectedBundle', null);
        // remove it from the list of bundles too, since the user can't act on it anymore
        var index = pageState.bundles.indexOf(selectedBundle);
        pageState.bundles.splice(index, 1);
      });
    },
    '{scope} selectedTab': function(scope, ev, newTab, oldTab) {
      if(newTab && oldTab) { // only when *changing* tabs
        this.scope.attr('gridColumns', newTab.columns);
        scope.pageState.selectedBundle && scope.getNewDetails(scope.pageState.selectedBundle);
      }
    },
    '{scope} pageState.selectedBundle': function(scope) {
      var selectedBundle = scope.pageState.selectedBundle;
      if(!selectedBundle) {
        return;
      }

      can.batch.start();
      // clear out selectedRows
      scope.selectedRows.splice(0, scope.selectedRows.length);

      // change the columns to be correct
      var tabs = [],
          columns;
      if(['REGULAR_INV'].indexOf(selectedBundle.bundleType) >= 0) {
        // tabs ahoy!
        tabs = bundleTypeColumnSets[selectedBundle.bundleType];
        columns = bundleTypeColumnSets[selectedBundle.bundleType][0].columns;
      } else {
        // no tabs
        columns = bundleTypeColumnSets[selectedBundle.bundleType];
      }
      scope.tabs.splice(0, scope.tabs.length, ...tabs);
      scope.attr('selectedTab', scope.tabs.length ? scope.tabs[0] : null);
      scope.gridColumns.splice(0, scope.gridColumns.length, ...columns);

      // clear out the workflow steps
      scope.workflowSteps.splice(0, scope.workflowSteps.length);
      can.batch.stop();

      scope.getNewDetails(selectedBundle).then(function(bundle) {
        return WorkflowStep.findAll({
          workflowInstanceId: bundle.approvalId
        });
      }).then(function(steps) {
        scope.workflowSteps.replace(steps);
      });
    },
    '{scope} aggregatePeriod': function(scope) {
      scope.getNewDetails(scope.pageState.selectedBundle);
    },
    '{scope} paymentType': function(scope) {
      scope.getNewDetails(scope.pageState.selectedBundle);
    }
  }
});

export default BundleDetailTabs;
