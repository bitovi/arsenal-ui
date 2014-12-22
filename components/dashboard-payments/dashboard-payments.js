import _ from 'lodash';
import $ from 'jquery';
import Component from 'can/component/';

import Switcher from 'components/switcher/';

import PaymentSummary from 'models/payment-summary/';

import template from './template.stache!';
import styles from './dashboard-payments.less!';

var refreshTimeoutID;

var DashboardPayments = Component.extend({
  tag: 'rn-dashboard-payments',
  template: template,
  scope: {
    appstate: null, // passed in
    summary: null,
    fetching: false,

    tabs: [{
      text: 'By Country',
      value: 'country'
    }, {
      text: 'By Licensor',
      value: 'licensor'
    }],
    selectedTab: null, // set on insert

    debouncedRefreshReport: function() {
      var self = this;
      if(refreshTimeoutID) {
        window.clearTimeout(refreshTimeoutID);
      }
      refreshTimeoutID = window.setTimeout(function() {
        self.refreshReport.apply(self);
      }, 500);
    },
    refreshReport: function() {
      var self = this;
      this.attr('fetching', true);
      return PaymentSummary.findOne({appstate: self.appstate}).then(function(summary) {
        self.attr('summary', summary);
        self.attr('fetching', false);
      });
    }
  },
  helpers: {
    showPage: function(options) {
      if(this.appstate.attr('filled')) {
        return options.fn(this);
      } else {
        return options.inverse(this);
      }
    },
    countryGraphs: function(countryList, options) {
      
    }
  },
  events: {
    'inserted': function() {
      this.scope.attr('selectedTab', this.scope.tabs[0]);
      if(this.scope.appstate.filled) {
        this.scope.debouncedRefreshReport(this.scope);
      }
    },
    '{scope.appstate} change': function() {
      var self = this;

      if(this.scope.appstate.filled) {
        this.scope.debouncedRefreshReport(this.scope);
      } else {
        this.scope.attr('entities', []);
        this.scope.attr('holesByCountry', {});
      }
    }
  }
});

export default DashboardPayments;
