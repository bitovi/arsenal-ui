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

var columnChartHelper = function(item, div) {

//    var reconPercent = formats.formatIfValue(item.reconPrcn,_.isNumber, formats.decimalAsPercent, '0%');
//    var liPrcnt = formats.formatIfValue(item.liPrcnt,_.isNumber, formats.decimalAsPercent, '0%');
//    var orPrcnt = formats.formatIfValue(item.orPrcnt,_.isNumber, formats.decimalAsPercent, '0%');


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
    formatNumbers: function(num){
        var formatted = formats.currencyFormatDecimal(num, 1);
        return formatted;
    },
    popover: function(item) {

      var popoverContent = $('<div>').append(popoverTemplate({
        localCurrency: item.gblCcy,
        globalCurrency: item.rgnCcy,
        item: item
      }, {
        formatPercent: val => formats.percent(val())
      }))[0].innerHTML;

      return function(li) {
        $(li).popover({
          content: popoverContent,
          html: true,
          trigger: 'click',
          placement: 'right'
        });
      };
    },
  },
  events: {
    'inserted':function(){

     },
    '.chart-list>li, .country-list>li click': function(el, ev) {
          var popoverID = el.attr('aria-describedby');
          var chart = $('#' + popoverID).find('.column-chart');
          chart.empty();
          columnChartHelper(el.data('item').item, chart[0]);
      },
      'li.total div.category>a click':function(el, ev){
          var self = this;
          self.scope.appstate.attr('page','claimreview');
      }

    }
});

export default DashboardPaymentsDetail;
