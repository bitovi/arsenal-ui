import $ from 'jquery';
import highcharts from 'highcharts';
import Component from 'can/component/';

import chartDefaults from 'utils/chartDefaults';

import template from './template.stache!';
import _less from './dashboard-payments-overview.less!';

var DashboardPaymentsOverview = Component.extend({
  tag: 'rn-dashboard-payments-overview',
  template: template,
  scope: {
    appstate: null,
    summary: null
  },
  helpers: {
    renderBigChart: function() {
      var scope = this,
          value = this.attr('summary').percentagePaid;

      return function(div) {
        var chartConfig = can.extend({}, chartDefaults.singleBarChart, {
          series: [{
            data: [value]
          }]
        });

        // setImmediate used so that highcharts renders after styling
        window.setTimeout(function() {
          $(div).highcharts(chartConfig);
          // remove 'Highcharts.com'
          $('svg > text:not([class=highcharts-title])', div).remove();
        }, 0);
      };
    }
  }
});

export default DashboardPaymentsOverview;
