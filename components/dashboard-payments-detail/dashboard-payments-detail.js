import $ from 'jquery';
import highcharts from 'highcharts';
import Component from 'can/component/';

import PaymentChart from 'components/payment-chart/';

import chartDefaults from 'utils/chartDefaults';
import formats from 'utils/formats';

import template from './template.stache!';
import popoverTemplate from './popover.stache!';
import _less from './dashboard-payments-detail.less!';
import _popover_less from './popover.less!';

var columnChartHelper = function(item) {
  return function(div) {
    var chartConfig = can.extend({}, chartDefaults.singleStackedColumnChart, {
      series: [{
        data: [item.reconPrcnt]
      }, {
        data: [item.liPrcnt]
      }, {
        data: [item.orPrcnt]
      }]
    });

    // setImmediate used so that highcharts renders after styling
    window.setTimeout(function() {
      $(div).highcharts(chartConfig);
      // remove 'Highcharts.com'
      $('svg > text:not([class=highcharts-title])', div).remove();
    }, 0);
  };
};

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
    },
    popover: function(item) {
      var popoverContent = $('<div>').append(popoverTemplate({
        localCurrency: 'XXX',
        globalCurrency: 'XXX',
        item: item
      }, {
        columnChart: columnChartHelper,
        formatPercent: val => formats.percent(val())
      }))[0].innerHTML;

      return function(li) {
        $(li).popover({
          content: popoverContent,
          html: true,
          trigger: 'click'
        });
      };
    },
  }
});

export default DashboardPaymentsDetail;
