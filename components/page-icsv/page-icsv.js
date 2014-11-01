import Component from 'can/component/';

import template from './template.stache!';
import styles from './page-icsv.less!';
import topfilter from 'models/sharedMap/topfilter';
import dataTables from 'components/data-tables/';
import icsvmap from 'models/sharedMap/icsv';

var page = Component.extend({
  tag: 'page-icsv',
  template: template,
  scope: { 
  		
    },
   events:{
  		"inserted":function(){
  			topfilter.attr("show",false);
      }
  	 },
  	init:function(){

  		  /*Promise.all([
		     	//AllInvoices.findAll({region: 2})
		     	AllInvoices.findAll()
		    ]).then(function(values) {
		    	//console.log(JSON.stringify(values[0][1]));
		    	if(values[0][0]["responseHeader"]["errorCode"]=="0000")
		     		//self.scope.invoicesMap.replace(values[0][1]);
		    });*/
		}
});

export default page;
