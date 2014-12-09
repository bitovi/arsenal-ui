import Component from 'can/component/';

import template from './template.stache!';
import styles from './icsv-summary.less!';

import utils from 'components/icsv-summary/utils'
import icsvmap from 'models/sharedMap/icsv';


var icsvsummary = Component.extend({
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
  events:{
  inserted: function(){
	  var self = this;
      console.log(icsvmap.invoiceData);
      // Promise.all([
      //    ICSVInvoices.findAll()
      // ]).then(function(values) {
    	  //console.log(JSON.stringify(values[0][0]["statusCode"]));
    	  //console.log(JSON.stringify(values[0][0]["summary"][0]["invoiceTotalMap"]));
    	  //console.log(JSON.stringify(values[0][0]["summary"].attr()));
    	  //console.log(JSON.stringify(values[0][0].summary.invoiceTotalMap));
    	 // var sample = values[0][0]["summary"][0];

           icsvmap.delegate("invoiceData","set", function(ev, newVal){
            //console.log('Inside delegate');
    	  var summaryDetails = icsvmap.invoiceData.summary.attr();
          icsvmap.invoiceData.summary.attr();
    	  
    	  //console.log("Value---"+JSON.stringify(summaryDetails));
    	  
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
    	  //var canList=utils.convertMapToCanListObject(Object.keys(summaryDetails.invoiceTotal),summaryDetails.invoiceTotal);
    	  //console.log('Details--'+JSON.stringify(utils.convertMapToCanListObject(summaryDetails.invoiceTotal)));
    	  self.scope.invoiceTotal.replace(utils.convertMapToCanListObject(summaryDetails.invoiceTotal));
    	  
    	  
    	  self.scope.attr("totalAmount",utils.calculateInvoiceTotal(summaryDetails.invoiceTotal));
    	  //console.log("invoice Map:"+values[0][0].summary[0].invoiceTotalMap);
    	 // console.log("Returned value:"+convertMapToObject(Object.keys(summaryDetails[0].invoiceTotalMap[0]),summaryDetails[0].invoiceTotalMap[0]));
    	  //alert(Object.keys(summaryDetails[0].invoiceTotalMap[0]));
    	  //self.scope.currencies.replace(summaryDetails[0]);
  
      // });
    });
    } 
    },
    helpers: {
        formatNumbers: function(number) {
        console.log('Inside helper'+number);
          // if($.isNumeric(number)){
          //   return number.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,");
          // }else{
          //   return 0;
          // }
      }
    }
});


export default icsvsummary;
