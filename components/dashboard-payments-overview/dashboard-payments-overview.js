import $ from 'jquery';
import highcharts from 'highcharts';
import Component from 'can/component/';
import chartDefaults from 'utils/chartDefaults';
import formats from 'utils/formats';
import template from './template.stache!';
import _less from './dashboard-payments-overview.less!';

var DashboardPaymentsOverview = Component.extend({
  tag: 'rn-dashboard-payments-overview',
  template: template,
  scope: {
    appstate: null,
    summary: null,
    percent: null
  },
  helpers: {
    renderBigChart: function() {
      var self = this;
      var value1 = this.attr('summary').percentagePaid;
      var value = formats.formatToFixedDecimalAspercent(value1,_.isNumber, 0, '0',false);
      this.attr('percent',value);

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
