import Component from 'can/component/';

import template from './template.stache!';
import styles from './highchart.less!';

import highcharts from 'highcharts';

import exporting from 'exporting';

import UserReq from 'utils/request/';
import periodWidgetHelper from 'utils/periodWidgetHelpers';

import HighChart from 'models/highchart/';

import dragableHighChart from 'index';

var highchartpage = Component.extend({
  tag: 'high-chart',
  template: template,
  scope: {
    details:{},
    invoiceAmount:[]
  },
  init: function(){
    //console.log('Inside high chart');
  },
  events: {
    "inserted": function(){

      var highChartdata;
      var self = this;

      var chartdata = self.scope.details;
      // console.log(JSON.stringify(self.scope.details));

      var genObj = {};
      genObj["requestFrom"]=chartdata.requestFrom;
      genObj["licensorId"]=chartdata.licensorId;
      genObj["countryId"]=chartdata.countryId;
      genObj["fiscalPeriod"]=chartdata.fiscalPeriod;
      if(_.isString(chartdata.fiscalPeriod) && ( chartdata.fiscalPeriod.indexOf("P") > -1  || chartdata.fiscalPeriod.indexOf("Q") > -1)){
        genObj["fiscalPeriod"]=periodWidgetHelper.getFiscalPeriod(chartdata.fiscalPeriod);
      }
      genObj["periodType"]=chartdata.periodType;
      genObj["contentType"]=chartdata.contentType;
      console.log(" Data passed to service to fetch charts "+JSON.stringify(genObj));
      Promise.all([
        HighChart.findOne(UserReq.formRequestDetails(genObj))
        ]).then(function(values) {
          var servicedata = values[0].historicalTrends;
          if(values[0].historicalTrends.length){
            highChartdata = prepareCanMap(values[0].historicalTrends);
            $("#chartContainer").addClass("highcharts_Overlay");
            $("#highChartDetails").removeClass("highcharts_Hide");
            $('#highChartDetails').highcharts({
              chart: {
                renderTo: 'highChartDetails',
                type: 'line',
                //marginRight: 130,
                marginBottom: 100,
                events: {
                  load: function() {
                    this.renderer.image('resources/images/rn_RemoveFile@2x.png', 10, 10, 20, 20)
                    .css({
                      cursor: 'pointer',
                      position: 'relative',
                      "margin-left": "0px",
                      opacity: 0.75
                    }).attr({
                      id: 'close',
                      zIndex: -10
                    }).add();
                  }
                }
              },

              title: {
                //text: servicedata[0].countryName+"-"+servicedata[0].licensorName,
                text: chartdata.countryId+"-"+chartdata.licensorId,
                x: -20 //center
              },
              subtitle: {
                // text: 'Source: WorldClimate.com',
                x: -20
              },
              credits: {
                enabled: false
              },
              xAxis: {
                title: {
                  text: 'Period',
                  align: 'middle'
                },
                categories: highChartdata["FISCAL_PERIOD"],
                labels: {
                  rotation: -35
                }
              },
              yAxis: {
                title: {
                  text: 'Amount'
                },
                plotLines: [{
                  value: 0,
                  width: 1,
                  color: '#FFFFFF'
                }]
              },
              tooltip: {
                formatter: function () {
                  return '<b>' + this.series.name + '</b><br/>' + this.x + ': ' + currencyFormat(this.y) +' USD';
                }
              },
              legend: {
                layout: 'horizontal',
                align: 'center',
                verticalAlign: 'bottom',
                borderWidth: 0
              },
              exporting: {
                enabled: false
              },
              series: [{
                name: 'Invoice Amount',
                data: highChartdata["INVOICE_AMOUNT"]
              }, {
                name: 'Overrep Amount',
                data: highChartdata["OVERREP_AMOUNT"]
              }, {
                name: 'Line item dispute',
                data: highChartdata["LINE_ITEM_AMOUNT"]
              }]
            });

          }else{
            console.log('high chart did not return any data');
            $("#highChartDetails").addClass("highcharts_Hide");
            $("#messageDiv").html("<label class='errorMessage'>Data not available</label>");
            //$("#chartContainer").removeClass('highcharts_Overlay');
            $("#messageDiv").show();
            setTimeout(function(){
              $("#messageDiv").hide();
            },2000);
          }
          // $("#highChartDetails").resizable({
          // 	containment: 'document'
          // });
        });
      },
      '{document} keyup' : function(el,ev){
        if (ev.keyCode == 27){
          $("#highChartDetails").addClass("highcharts_Hide");
          $("#chartContainer").removeClass('highcharts_Overlay');
        }
      }
    },
    "#myImage click ":function(){
      $("#highChartDetails").addClass("highcharts_Hide");
    }
  });


  function prepareCanMap(object){
    console.log(object);
    console.log("inside prepare map ----"+object.length);
    var highChartdata = new Array();
    var periodList=[];
    var invoiceAmountList = [];
    var overRepAmountList = [];
    var lineItemAmountList = [];
    for(var i=0; i<object.length;i++){
      var obj = object[i];
      console.log("Inside for loop :"+obj.fiscalPeriod);
      periodList[i] = periodWidgetHelper.getDisplayPeriod(obj.fiscalPeriod, "P");//obj.fiscalPeriod;
      invoiceAmountList[i] = obj.invoiceAmount;
      overRepAmountList[i] = obj.overRepAmount;
      lineItemAmountList[i] = obj.lineItemsAmount;
    }
    console.log("chart data:"+periodList);
    highChartdata["FISCAL_PERIOD"] = periodList;
    highChartdata["INVOICE_AMOUNT"] = invoiceAmountList;
    highChartdata["OVERREP_AMOUNT"] = overRepAmountList;
    highChartdata["LINE_ITEM_AMOUNT"] = lineItemAmountList;
    //console.log("chart data:"+highChartdata["LINE_ITEM_AMOUNT"]);
    return highChartdata;
  }

  function currencyFormat(number)
{
  if(number != undefined && $.isNumeric(number)){
    if(typeof(number) == 'string'){
      number = Number(number);
    }
    var n = number.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,");
    return n;
  }else{
    return 0;
  }
}

export default highchartpage;
