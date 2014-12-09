import Component from 'can/component/';

import template from './template.stache!';
import styles from './icsv-summary.less!';

import ICSVInvoices from 'models/invoice/icsv/';
import utils from 'components/icsv-summary/utils'


var page = Component.extend({
  tag: 'icsv-summary',
  template: template,
  scope: {
    "fileCount":"",
    "invoiceCount":"",
    "noOfPdf":"",
    "licensorsCount":"",
    "rowCount":"",
    "errorCount":"",
    "totalAmount":"",
    invoiceTotal:[]
  },
  init: function(){
	  var self = this;
      Promise.all([
         ICSVInvoices.findAll()
      ]).then(function(values) {
    	  //console.log(JSON.stringify(values[0][0]["statusCode"]));
    	  //console.log(JSON.stringify(values[0][0]["summary"][0]["invoiceTotalMap"]));
    	  //console.log(JSON.stringify(values[0][0]["summary"].attr()));
    	  //console.log(JSON.stringify(values[0][0].summary.invoiceTotalMap));
    	 // var sample = values[0][0]["summary"][0];
    	  var summaryDetails = values[0][0]["summary"].attr();
    	  
    	  console.log("Value---"+JSON.stringify(summaryDetails));
    	  
    	  self.scope.attr("fileCount",summaryDetails.fileCount);
    	  self.scope.attr("invoiceCount",summaryDetails.invoiceCount);
    	  self.scope.attr("noOfPdf",summaryDetails.pdfCount);
    	  self.scope.attr("licensorsCount",summaryDetails.licensorCount);
    	  self.scope.attr("rowCount",summaryDetails.rowCount);
    	  self.scope.attr("errorCount",summaryDetails.errorCount);
    	  
    	 // console.log("hsfjdfjsdfhjk "+JSON.stringify(summaryDetails[0].invoiceTotalMap[0]));
    
    	  //self.scope.attr("invoiceTotal").replace(summaryDetails[0].invoiceTotalMap);
    	  //self.scope.invoiceTotal.replace(convertMapToObject(Object.keys(summaryDetails[0].invoiceTotalMap[0]),summaryDetails[0].invoiceTotalMap[0]));
    	  
    	  //console.log("Utils---------log"+utils.convertMapToCanListObject(Object.keys(summaryDetails[0].invoiceTotalMap[0]),summaryDetails[0].invoiceTotalMap[0]));
    	  var canList=utils.convertMapToCanListObject(Object.keys(summaryDetails.invoiceTotalMap),summaryDetails.invoiceTotalMap);
    	  self.scope.invoiceTotal.replace(canList);
    	  
    	  
    	  self.scope.attr("totalAmount",utils.calculateInvoiceTotal(canList));
    	  //console.log("invoice Map:"+values[0][0].summary[0].invoiceTotalMap);
    	 // console.log("Returned value:"+convertMapToObject(Object.keys(summaryDetails[0].invoiceTotalMap[0]),summaryDetails[0].invoiceTotalMap[0]));
    	  //alert(Object.keys(summaryDetails[0].invoiceTotalMap[0]));
    	  //self.scope.currencies.replace(summaryDetails[0]);
  
      });
    },
    events: {
    	"{invoiceTotal} change": function(){
    		//console.log("value changed "+JSON.stringify(this.scope.attr().invoiceTotal));
    		//console.log("---"+{{invoiceTotal}});
   		var cm = this.scope.attr().invoiceTotal;
    		console.log("changed---"+Object.keys(cm[0]));
    		//alert('hi')
    	}
    },
    helpers:{
    	getTotalAmount:function(invoicetotal){
    		//alert('hi');
    		//console.log("value in helper "+alert(JSON.stringify(invoicetotal)));
    		//console.log("Hi------------------"+JSON.stringify(invoiceTotal));
    		//console.log(invoiceTotal.attr(key));
    		//console.log(invoiceTotal);
    		//return 
    	}
    }
});

export default page;
