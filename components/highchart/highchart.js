import Component from 'can/component/';

import template from './template.stache!';
import styles from './highchart.less!';

import highcharts from 'highcharts';

import exporting from 'exporting';

import UserReq from 'utils/request/';

import HighChart from 'models/highchart/';

import dragableHighChart from 'index';

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
    	
    		  $("#highChartDetails").removeClass("hide");
    		  var genObj = {};
    		     genObj["requestFrom"]="byCountry";
    		     genObj["licensorId"]="CELAS";
    		     genObj["countryId"]="AUT";
    		     genObj["fiscalPeriod"]="201401";
    		     genObj["periodType"]="P";
    		     genObj["contentType"]="Music";
    		Promise.all([
   	         HighChart.findOne(UserReq.formRequestDetails(genObj))
   	     	 ]).then(function(values) {
   	    	  var servicedata = values[0].historicalTrends;
   	    	  console.log(JSON.stringify(servicedata));
   	    	   highChartdata = prepareCanMap(values[0].historicalTrends);

    		$('#highChartDetails').highcharts({
    			chart: {
			        renderTo: 'highChartDetails',
			        type: 'line',
			        marginRight: 130,
			        marginBottom: 25,
			        events: {
			            load: function() {
			                this.renderer.image('resources/images/delete.png', 50, 10, 28, 28)
			                .css({
			                    cursor: 'pointer',
			                    position: 'relative',
			                    "margin-left": "-10px",
			                    opacity: 0.75
			                }).attr({
			                    id: 'close',
			                    zIndex: -100
			                }).add();
			            }
			        }
			    },

		        title: {
		            text: servicedata[0].countryName+"-"+servicedata[0].licensorName,
		            x: -20 //center
		        },
		        subtitle: {
		           // text: 'Source: WorldClimate.com',
		            x: -20
		        },
		        xAxis: {
		            title: {
			                    text: 'Period',
			                    align: 'middle'
			                },
		            categories: highChartdata["FISCAL_PERIOD"],
		              labels: {
							//rotation: -45
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
		
			$("#highChartDetails").resizable({
				containment: 'document'
			});
    	}
    },
    "#myImage click ":function(){
    	$("#highChartDetails").addClass("hide");
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
