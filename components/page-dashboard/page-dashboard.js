import Component from 'can/component/';

import GlobalParameterBar from 'components/global-parameter-bar/';
import Switcher from 'components/switcher/';
import DashboardInvoices from 'components/dashboard-invoices/';
import DashboardApprovals from 'components/dashboard-approvals/';
import DashboardApprovals from 'components/dashboard-payments/';

import template from './template.stache!';
import styles from './page-dashboard.less!';

var page = Component.extend({
  tag: 'page-dashboard',
  template: template,
  scope: {
    appstate: null, // passed in
    tabs: [{
      text: 'Approvals'
    }, {
      text: 'Invoices Received'
    }, {
      text: 'Payments'
    }],
    selectedTab: null
  },
  helpers: {
    ifSelectedTab: function(tabText, options) {
      return this.attr('selectedTab').text === tabText ? options.fn(this) : '';
    }
  },
  events: {
    init: function() {
      this.scope.appstate.attr('renderGlobalSearch', true);
      this.scope.attr('selectedTab', this.scope.tabs[2]);
    }
  }
});

export default page;
