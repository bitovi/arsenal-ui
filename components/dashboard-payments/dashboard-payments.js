import _ from 'lodash';
import can from 'can/';
import Component from 'can/component/';

import Switcher from 'components/switcher/';
import PaymentChart from 'components/payment-chart/';
import DashboardPaymentsOverview from 'components/dashboard-payments-overview/';
import DashboardPaymentsDetail from 'components/dashboard-payments-detail/';

import PaymentSummary from 'models/payment-summary/';
import HolesReport from 'models/holes-report/';

import template from './template.stache!';
import styles from './dashboard-payments.less!';
import gridUtils from 'utils/gridUtil';

var refreshTimeoutID;

var DashboardPayments = Component.extend({
  tag: 'rn-dashboard-payments',
  template: template,
  scope: {
    appstate: null, // passed in
    summary: null,
    fetching: true,

    tabs: [{
      text: 'By Country',
      value: 'countries',
      nameProperty: 'ctry',
      detailNameProperty: 'entyName'
    }, {
      text: 'By Licensor',
      value: 'entities',
      nameProperty: 'entyName',
      detailNameProperty: 'ctry'
    }],
    selectedTab: null, // set on insert
    selectedItem: null,
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
      //we need to reset this flag.
      this.attr('selectedTab', this.tabs[0]);
      this.attr('selectedItem',false);
      return PaymentSummary.findOne({appstate: self.appstate}).then(function(summary) {
        self.attr('summary', summary);
        self.attr('fetching', false);
        $('#parentcontainer').css('height',gridUtils.getTableBodyHeight('parentcontainer',96));
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
    selectedItems: function(options) {
      var scope = this;
      var items = scope.summary[scope.attr('selectedTab').value];
      return _.map(items, function(item) {
        return options.fn({
          item: item,
          name: item[scope.selectedTab.nameProperty],
        });
      });
    },
    isSelected: function(itemInfo) {
      return itemInfo.item === this.attr('selectedItem') ? 'selected' : '';
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
    },
    '{scope} selectedTab': function() {
      this.scope.attr('selectedItem', null);
    },
    '.sidebar .chart-list li click': function(el, ev) {
      var item = el.data('item').item;
      this.scope.attr('selectedItem', item);
    }
  }
});

export default DashboardPayments;
