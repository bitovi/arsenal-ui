import $ from 'jquery';
import highcharts from 'highcharts';
import Component from 'can/component/';
import chartDefaults from 'utils/chartDefaults';
import formats from 'utils/formats';
import template from './template.stache!';
import _less from './dashboard-payments-overview.less!';
import PeriodWidgetHelper from 'utils/periodWidgetHelpers';

var DashboardPaymentsOverview = Component.extend({
  tag: 'rn-dashboard-payments-overview',
  template: template,
  scope: {
    appstate: null,
    summary: null,
    percent: null,
    dispcount:10,
    entityNotPaideList:[],
    cntryNotPaideList:[]
  },
  helpers: {
    renderBigChart: function() {
      var self = this;
      var value1 = this.attr('summary').percentagePaid;
      var value = formats.formatToFixedDecimalAspercent(value1,_.isNumber, 0, '0',true);
      this.attr('percent',value);
      if(this.attr('summary') != 'undefined'){
        if(this.attr('summary').topNotPaidEntities != null &&
          this.attr('summary').topNotPaidEntities.length > 0){
          //this is the temporary code.. once the service is sending this parameter
          //then we will remove the below code
          //start
          var tempArray=this.attr('summary').topNotPaidEntities;
          if(tempArray.length > 0){
            $.each(tempArray,function(index,itemVal){
              var totPaidPrcnt=0;
              if(itemVal.totBalPrcnt != null){
                if(itemVal.totBalPrcnt > 0){
                  totPaidPrcnt = 100-itemVal.totBalPrcnt;
                }
              }
              itemVal.attr("totPaidPrcnt",totPaidPrcnt);
            });
          }
          this.attr('entityNotPaideList',tempArray.slice(0,this.attr("dispcount")));
          //end
          //this.attr('entityNotPaideList',this.attr('summary').topNotPaidEntities.slice(0,this.attr("dispcount")));
        }
        if(this.attr('summary').topNotPaidCountries != null &&
          this.attr('summary').topNotPaidCountries.length > 0){
          //this is the temporary code.. once the service is sending this parameter
          //then we will remove the below code
          //start
          var tempArray2=this.attr('summary').topNotPaidCountries;
          if(tempArray2.length > 0){
            $.each(tempArray2,function(index,itemVal){
              var totPaidPrcnt=0;
              if(itemVal.totBalPrcnt != null){
                if(itemVal.totBalPrcnt > 0){
                  totPaidPrcnt = 100-itemVal.totBalPrcnt;
                }
              }
              itemVal.attr("totPaidPrcnt",totPaidPrcnt);
            });
          }
          this.attr('cntryNotPaideList',tempArray2.slice(0,this.attr("dispcount")));
          //end
          //this.attr('cntryNotPaideList',this.attr('summary').topNotPaidCountries.slice(0,this.attr("dispcount")));
        }
      }
      return function(div) {
        var chartConfig = can.extend({}, chartDefaults.singleBarChart, {
          series: [{
            data: [value1]
          }]
        });

        // setImmediate used so that highcharts renders after styling
        window.setTimeout(function() {
          $(div).highcharts(chartConfig);
          // remove 'Highcharts.com'
          $('svg > text:not([class=highcharts-title])', div).remove();
        }, 0);
      };
    },
    getDisplayFromPeriod:function(options){
      return PeriodWidgetHelper.getDisplayPeriod(this.appstate.periodFrom,this.appstate.periodType);
    },
    getDisplayToPeriod:function(options){
      return PeriodWidgetHelper.getDisplayPeriod(this.appstate.periodTo,this.appstate.periodType);
    }
  }
});

export default DashboardPaymentsOverview;
