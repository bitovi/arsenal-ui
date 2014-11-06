import Component from 'can/component/';

import template from './template.stache!';
import styles from './highchart.less!';

import highcharts from 'highcharts';

import exporting from 'exporting';

import HighChart from 'models/highchart/';

var highchartpage = Component.extend({
  tag: 'high-chart',
  template: template,
  scope: {
	  details:[],
	  invoiceAmount:[]
  },
  init: function(){
	 console.log('Inside high chart'); 

    },
    events: {
    	"inserted": function(){
    		 var highChartdata;
    		  	 var self = this;
    		console.log("data is"+JSON.stringify(this.scope.attr()));
    		  $("#highChartDetails").removeClass("hide");
    		Promise.all([
   	         HighChart.findAll()
   	     	 ]).then(function(values) {
   	    	  console.log("High chart values :"+JSON.stringify(values[0][0].attr()));
   	    	  var servicedata = values[0][0].attr().highCharts;
   	    	   highChartdata = prepareCanMap(values[0][0].attr().highCharts);
   	    	var months = new Array("Volvo", "BMW");
   	    	months.push(201405);
   	     	 var data = new can.List([1,3]);

   	     	 //$('#highChartDetails').fadeIn("fast");
    		$('#highChartDetails').highcharts({
    			chart: {
					renderTo: 'highChartDetails',
					defaultSeriesType: 'line',
					animation: false,
					className: 'chartBorder',
					marginBottom: 120,
		           	marginLeft: 80
				},
		        title: {
		            text: servicedata[0].countryName+"-"+servicedata[0].licensorName,
		            x: -20 //center
		        },
		        subtitle: {
		            text: 'Source: WorldClimate.com',
		            x: -20
		        },
		        xAxis: {
		            title: {
			                    text: 'Period',
			                    align: 'middle'
			                },
		            categories: highChartdata["FISCAL_PERIOD"],
		              labels: {
							rotation: -45
						}
		        },
		        yAxis: {
		            title: {
		                text: 'Amount in '
		            },
		            plotLines: [{
		                value: 0,
		                width: 1,
		                color: '#FFFFFF'
		            }]
		        },
		        tooltip: {
		        	formatter: function () {
						return '<b>' + this.series.name + '</b><br/>' + this.x + ': ' + this.y;
					},
		            valueSuffix: ''
		        },
		        legend: {
		            layout: 'vertical',
		            align: 'right',
		            verticalAlign: 'middle',
		            borderWidth: 0
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
			 });
    	},
    	"{{details}} change": function(){
    		console.log('got data');
    		//$("#highChartDetails").append(stache('<high-chart></high-chart>'));
//    		 var self = this;
//    	      Promise.all([
//    	         HighChart.findAll()
//    	      ]).then(function(values) {
//    	    	  console.log("High chart values :"+JSON.stringify(values[0][0].attr()));
//    	      });
    	}
    }
});


function prepareCanMap(object){
	console.log("inside prepare map ----"+object.length);
	var highChartdata = new Array();
	var periodList=[];
	var invoiceAmountList = [];
	var overRepAmountList = [];
	var lineItemAmountList = [];
	for(var i=0; i<object.length;i++){
		var obj = object[i];
		console.log("Inside for loop :"+obj.fiscalPeriod);
		 periodList[i]=obj.fiscalPeriod;
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

export default highchartpage;
