import _ from 'lodash';
import Component from 'can/component/';
import List from 'can/list/';

import PaymentBundleDetailGroup from 'models/payment-bundle/payment-bundle-detail-group';
import PaymentBundleDetail from 'models/payment-bundle/payment-bundle-detail';
import WorkflowStep from 'models/workflow-step/';

import BundleDetailGrid from 'components/bundle-detail-grid/';
import Switcher from 'components/switcher/';
import WorkflowDisplay from 'components/workflow-display/';

import licensorColumns from './column-sets/licensor-columns';
import countryColumns from './column-sets/country-columns';

import template from './template.stache!';
import _less from './bundle-detail.less!';

var columnSets = [
  {
    value: 'licensor',
    text: 'Licensor',
    columns: licensorColumns
  },
  {
    value: 'country',
    text: 'Country',
    columns: countryColumns
  }
];

var BundleDetailTabs = Component.extend({
  tag: 'rn-bundle-detail',
  template: template,
  scope: {
    appstate: null, // passed in
    pageState: null, // passed in
    columnSets: columnSets,
    selectedTab: null, // set in init below
    aggregatePeriod: false,
    paymentType: 1,
    approvalComment: '',

    gridColumns: columnSets[0].columns,
    selectedRows: [],

    workflowSteps: new WorkflowStep.List([]),

    gettingDetails: false,
    getNewDetails: function(bundle) {
      var scope = this;

      var view = this.attr('selectedTab').value;
      if(view === 'country' && this.attr('aggregatePeriod')) {
        view = 'aggregate';
      }

      this.attr('gettingDetails', true);
      return bundle.getDetails(
        this.appstate,
        view,
        this.paymentType
      ).then(function(bundle) {
        scope.attr('gettingDetails', false);
        return bundle;
      });
    }
  },
  helpers: {
    showAggregateControl: function(options) {
      return this.attr('selectedTab').value === 'country' ? options.fn(this) : '';
    },
    validationStatus: function(options) {
      return this.pageState.selectedBundle && this.pageState.selectedBundle.attr('validationRulesTotal') > 0 ? options.fn(this.pageState.selectedBundle) : '';
    },
    canRemoveInvoice: function(options) {
      if(this.selectedRows.attr('length') > 0 && _.every(this.attr('selectedRows'), row => row instanceof PaymentBundleDetailGroup)) {
        return options.fn(this);
      } else {
        '';
      }
    },
    canShowChart: function(options) {
      if(this.selectedRows.attr('length') > 0 && _.every(this.attr('selectedRows'), row => row instanceof PaymentBundleDetail)) {
        return options.fn(this);
      } else {
        '';
      }
    }
  },
  events: {
    init: function() {
      this.scope.attr('selectedTab', this.scope.columnSets[0]);
    },
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
    '{scope} selectedTab': function(scope, ev, newVal) {
      this.scope.attr('gridColumns', newVal.columns);
      scope.pageState.selectedBundle && scope.getNewDetails(scope.pageState.selectedBundle);
    },
    '{scope} pageState.selectedBundle': function(scope) {
      scope.workflowSteps.splice(0, scope.workflowSteps.length);
      scope.getNewDetails(scope.pageState.selectedBundle).then(function(bundle) {
        return WorkflowStep.findAll({
          workflowInstanceId: bundle.workflowInstanceId
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
