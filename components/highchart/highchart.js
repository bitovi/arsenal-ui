import Component from 'can/component/';

import template from './template.stache!';
import styles from './highchart.less!';

import highcharts from 'highcharts';

<<<<<<< HEAD
import exporting from 'exporting';

import UserReq from 'utils/request/';

import HighChart from 'models/highchart/';

import dragableHighChart from 'index';

=======
//import bootstrap-exporting from 'bootstrap-highchart-exporting';

import HighChart from 'models/highchart/';

>>>>>>> <rdar://problem/18718561> UI Interface -Historical Graphs PBR/CR
var highchartpage = Component.extend({
  tag: 'high-chart',
  template: template,
  scope: {
<<<<<<< HEAD
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
    		     genObj["periodType"]=chartdata.periodType;
    		     genObj["contentType"]=chartdata.contentType;
    		     console.log(" Data passed to service to fetch charts "+JSON.stringify(genObj));
    		Promise.all([
   	         HighChart.findOne(UserReq.formRequestDetails(genObj))
   	     	 ]).then(function(values) {
   	    	  var servicedata = values[0].historicalTrends;
   	    	   		if(values[0].historicalTrends.length){
   	    	   			highChartdata = prepareCanMap(values[0].historicalTrends);
   	    	   			$("#highChartDetails").removeClass("hide");
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
					            //text: servicedata[0].countryName+"-"+servicedata[0].licensorName,
					        	text: chartdata.countryId+"-"+chartdata.licensorId,
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

					}else{
						console.log('high chart did not return any data');
						$("#highChartDetails").addClass("hide");
					}
						// $("#highChartDetails").resizable({
						// 	containment: 'document'
						// });
			 });
    	}
    },
    "#myImage click ":function(){
    	$("#highChartDetails").addClass("hide");
=======
	  details:[]
  },
  init: function(){
	 console.log('Inside high chart'); 

	 
	 
//	 $('#highChartDetails').innerHtml="";
	 
	 
    },
    events: {
    	"inserted": function(){
    		console.log("data is"+JSON.stringify(this.scope.attr()));
    		$('#highChartDetails').highcharts({
		        title: {
		            text: 'CELAS GBR MUSIC',
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
		            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
		                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
		        },
		        yAxis: {
		            title: {
		                text: 'Temperature (°C)'
		            },
		            plotLines: [{
		                value: 0,
		                width: 1,
		                color: '#FFFFFF'
		            }]
		        },
		        tooltip: {
		            valueSuffix: '°C'
		        },
		        legend: {
		            layout: 'vertical',
		            align: 'right',
		            verticalAlign: 'middle',
		            borderWidth: 0
		        },
		        series: [{
		            name: 'Invoice Amount',
		            data: [10, 6.9, 9.5, 14.5, 18.2, 21.5, 25.2, 26.5, 23.3, 18.3, 13.9, 9.6]
		        }, {
		            name: 'Overrep Amount',
		            data: [-0.2, 0.8, 5.7, 11.3, 17.0, 22.0, 24.8, 24.1, 20.1, 14.1, 8.6, 2.5]
		        }, {
		            name: 'Line item dispute',
		            data: [-0.9, 0.6, 3.5, 8.4, 13.5, 17.0, 18.6, 17.9, 14.3, 9.0, 3.9, 1.0]
		        }, {
		            name: 'London',
		            data: [3.9, 4.2, 5.7, 8.5, 11.9, 15.2, 17.0, 16.6, 14.2, 10.3, 6.6, 4.8]
		        }]
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
>>>>>>> <rdar://problem/18718561> UI Interface -Historical Graphs PBR/CR
    }
});


<<<<<<< HEAD
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

=======
>>>>>>> <rdar://problem/18718561> UI Interface -Historical Graphs PBR/CR
export default highchartpage;
