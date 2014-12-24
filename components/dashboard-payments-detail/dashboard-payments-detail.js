import $ from 'jquery';
import highcharts from 'highcharts';
import Component from 'can/component/';

import PaymentChart from 'components/payment-chart/';

import chartDefaults from 'utils/chartDefaults';

import template from './template.stache!';
import _less from './dashboard-payments-detail.less!';

var DashboardPaymentsDetail = Component.extend({
  tag: 'rn-dashboard-payments-detail',
  template: template,
  scope: {
    detailItems: [],
    nameProperty: ''
  },
  helpers: {
    detailItemsList: function(options) {
      var scope = this;

      return _.map(this.attr('detailItems'), function(item) {
        return options.fn({
          item: item,
          text: item[scope.attr('nameProperty')],
        });
      });
    }
  }
});

export default DashboardPaymentsDetail;
