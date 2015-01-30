import $ from 'jquery';
import highcharts from 'highcharts';
import can from 'can/';
import Component from 'can/component/';

import template from './template.stache!';
import _less from './payment-chart.less!';

import formats from 'utils/formats';
import chartDefaults from 'utils/chartDefaults';

var PaymentChart = Component.extend({
  tag: 'rn-payment-chart',
  template: template,
  scope: {
    text: '',
    value: 0,
    percent:0,
    chartConfig: chartDefaults.singleBarChart
  },
  helpers: {
    renderChart: function() {
      var scope = this;
      var tempVal = formats.formatToFixedDecimalAspercent(this.value,_.isNumber, 0, '0',true);
      this.attr('percent',tempVal);
      return function(div) {
        var chartConfig = can.extend(scope.chartConfig.attr(), {
          series: [{
            name: scope.title,
            data: [scope.value]
          }]/*,
          chart: { //overriding the common color with
            type: 'bar',
            backgroundColor: '#BDBDBD',
            margin: [0, 0, 0, 0],
            spacing: [0, 0, 0, 0]
          },
          colors: ['#81ED6A']*/
        });

        // setImmediate used so that highcharts renders after styling
        window.setTimeout(function() {
          $(div).highcharts(chartConfig);
          // remove 'Highcharts.com'
          $('svg > text:not([class=highcharts-title])', div).remove();
        }, 0);
      };
    },
    formatValue: function(value) {
      return formats.percent(value());
    }
  }
});

export default PaymentChart;
