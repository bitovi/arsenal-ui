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
import PeriodWidgetHelper from 'utils/periodWidgetHelpers';

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
    getDisplayHeader: function(options) {
      var scope = this;
      if(scope.attr('nameProperty') === 'ctry' ){
        return scope.attr('detailItems')[0]['entyName'];
      }else if(scope.attr('nameProperty') === 'entyName' ){
        return scope.attr('detailItems')[0]['ctry'];
      }
    },
    getDisplayFromPeriod:function(options){
      return PeriodWidgetHelper.getDisplayPeriod(this.appstate.periodFrom,this.appstate.periodType);
    },
    getDisplayToPeriod:function(options){
      return PeriodWidgetHelper.getDisplayPeriod(this.appstate.periodTo,this.appstate.periodType);
    },
    formatNumbers: function(num){
        var formatted = formats.currencyFormatDecimal(num, 1);
        return formatted;
    },
    popover: function(item) {
      var popoverContent = $('<div>').append(popoverTemplate({
        localCurrency: item.rgnCcy,
        globalCurrency: item.gblCcy,
        item: item
      }, {
        formatPercent: val => formats.percent(val())
      }))[0].innerHTML;

      return function(li) {
        $(li).popover({
          content: popoverContent,
          html: true,
          delay: {
            hide: 100
          },
          trigger: 'click',
          placement: 'right'
        });
      };
    },
  },
  events: {
    'inserted':function(){

     },
     '{scope} change': function(scope, ev, attr) {
       //Remove the popup if anything is opened.
       //As the target is same for the side chart and popup source
       //we can not remove the popup by capturing click event on body
       $('.chart-list .popover').each(function(){
         $(this).remove();
      });
     },
    '.chart-list>li, .country-list>li click': function(el, ev) {
          var popoverID = el.attr('aria-describedby');
          var chart = $('#' + popoverID).find('.column-chart');
          chart.empty();
          columnChartHelper(el.data('item').item, chart[0]);
      },
      /*'li.total div.category>a click':function(el, ev){
          var self = this;
          self.scope.appstate.attr('page','claimreview');
      }*/
      'table#UnpaidPopup a.claim-link click':function(el,ev){
        var self = this;
        //The below method will set the user selected country and society name in the global scope
        //Variable used in the global scope are
        //localObj (it is array and contains the user selected values)
        //ispagelocal (have true/false)
        if($('.chart-list li[aria-describedby*="popover"]').data('item').item != 'undefined' &&
          $('.chart-list li[aria-describedby*="popover"]').data('item').item != null){
            var selectedListItem=$('.chart-list li[aria-describedby*="popover"]').data('item').item;
            var selectedCntry=selectedListItem.ctry;
            var selectedEntity=selectedListItem.entyName;
            var entityId=$('#licensorsFilter option').filter(function() {
              return $(this).text() == selectedEntity;
            }).val();
            self.scope.appstate.ispagelocal=true;
            var localObj={"contryName":selectedCntry,"entityId":entityId,"fromPage":"dashboard-Payment","toPage":"claimreview"};
            self.scope.appstate.pageLocalParm=[];
            self.scope.appstate.pageLocalParm.push(localObj);
          }
        self.scope.appstate.attr('page','claimreview');
      }
    }
});

$('body').on('click', function (e) {
  $('.chart-list li[aria-describedby*="popover"]').each(function () {
    if (!$(this).is(e.target) && $(this).has(e.target).length === 0 &&
      $('.popover').has(e.target).length === 0) {
      $(this).popover('hide');
    }
  });
});


export default DashboardPaymentsDetail;
