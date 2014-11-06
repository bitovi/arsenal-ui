import Component from 'can/component/';

import template from './template.stache!';
import styles from './highchart.less!';

import highcharts from 'highcharts';

//import bootstrap-exporting from 'bootstrap-highchart-exporting';

import HighChart from 'models/highchart/';

var highchartpage = Component.extend({
  tag: 'high-chart',
  template: template,
  scope: {
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
    }
});


export default highchartpage;
