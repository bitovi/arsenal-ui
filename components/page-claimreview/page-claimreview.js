import Component from 'can/component/';
import stache from 'can/view/stache/';

import template from './template.stache!';
import styles from './page-claimreview.less!';



import highchartpage from 'components/highchart/';

var page = Component.extend({
  tag: 'page-claimreview',
  template: template,
  scope: {
	//details:{"country":"AUT","society":"CELAS"}  
  },
  init: function(){
	 //console.log('inside Claim Review');
	 
    },
    events: {
    	"inserted": function(){
    		//console.log('Aftwr insert');
    		//$("#highChartDetails").append(stache('<high-chart></high-chart>'));
        
    	},
    	"#highChart click":function(){
    		console.log("Click on high chart");
        var details = new can.List({"country":"AUT","society":"CELAS"});
        $("#highChartDetails").append(stache('<high-chart details={details}></high-chart>')({details}));
       // $("#highChartDetails").removeClass("hide")
    		
    	}
    }
});

export default page;
