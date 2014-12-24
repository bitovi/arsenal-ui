import _ from 'lodash';
import $ from 'jquery';
import highcharts from 'highcharts';
import stache from 'can/view/stache/';

import chartDefaults from 'utils/chartDefaults';
import formats from 'utils/formats';

import popoverTemplate from './popover.stache!';
import _less1 from './dashboard-payments-detail.less!'
import _less2 from './popover.less!'

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

$('#sandbox').append(popoverTemplate({
  localCurrency: 'EUR',
  globalCurrency: 'USD',
  item: {
    entyName: "PAECOL",
    ctry: "AUT",
    invAmt: 8400,
    liAmt: 6300,
    orAmt: 2100,
    reconAmt: 1050,
    totBalAmt: 8400,
    liPrcnt: 6,
    orPrcnt: 2,
    reconPrcnt: 1,
    totBalPrcnt: 8,
    reconGblCcy: 10500,
    liGblCcy: 63000,
    orGblCcy: 21000,
    totBalGblCcy: 84000
  }
}, {
  columnChart: columnChartHelper,
  formatPercent: val => formats.percent(val)
}));
