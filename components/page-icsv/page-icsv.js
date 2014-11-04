import Component from 'can/component/';
import View from 'can/view/';
import _ from 'lodash';

import Grid from 'components/grid/';
import stache from 'can/view/stache/';

import template from './template.stache!';
import styles from './page-icsv.less!';
import topfilter from 'models/sharedMap/topfilter';
import dataTables from 'components/data-tables/';
import icsvmap from 'models/sharedMap/icsv';

Grid.extend({
  scope: {
    appstate:undefined,
    columns: [
      {
        id: 'id',
        title: 'id'
      },
      {
        id: 'error',
        title: 'error'
      },
      {
        id: 'licensor',
        title: 'Licensor'
      },
      {
        id: 'invoiceCategory',
        title: 'Invoice Category'
      },
      {
        id: 'contentType',
        title: 'Content Type'
      },
      {
        id: 'country',
        title: 'Country'
      },
      {
        id: 'invoiceNum',
        title: 'Invoice No'
      },
      {
        id: 'dueDate',
        title: 'Due date'
      },
      {
        id: 'invoiceAmt',
        title: 'Amount'
      },
      {
        id: 'currency',
        title: 'Currency'
      },
      {
        id: 'comments',
        title: 'User comments'
      }
    ]
  }
});


var page = Component.extend({
  tag: 'page-icsv',
  template: template,
  scope: { 
      //summaryData:{},
      invoicesData:{}
    },
    init:function(){
    topfilter.attr("show",false);
      var self = this; 
      self.scope.attr("invoicesData", icsvmap.invoicedata);
     
     /* icsvmap.bind('uploadiCSV', function(ev, newVal, oldVal) {
         self.scope.attr("uploadData", newVal);

         Promise.all([
          //AllInvoices.findAll({region: 2})
          Validateinvoice.findAll(newVal)
        ]).then(function(values) {
          //console.log(JSON.stringify(values[0][1]));
          if(values[0][0]["responseHeader"]["errorCode"]=="0000")
            icsvmap.attr('icsvmap','values');
            //self.scope.invoicesMap.replace(values[0][1]);
        });
    }); */
    },
   events:{
  		"inserted":function(){
        var self = this;
        /*icsvmap.bind('icsvdata', function(ev, newVal, oldVal) { //This should be used when icsvdata changed by upload component
             //this.scope.summarydata = newval.summaryDat
             this.scope.invoicesData = newval.invoices;
             console.log(newval.invoices);
         }); */
          
        var gridData = [];


        console.log(self.scope.invoicesData.attr()[0].invoices);

        var tempArr = self.scope.invoicesData.attr()[0].invoices;
        
        for(var i=0; i< tempArr.length; i++){
          var tempObj = {};
          tempObj.id= tempArr[i].invoiceNumber;
          tempObj.error = "dqweq";
          tempObj.licensor= tempArr[i].entityName;
          tempObj.invoiceCategory= "invoiceCategory";  /* invoice category not in sample data*/
          tempObj.contentType= "contentType"; /*need to take count from from invoice line*/
          tempObj.country= "country"; /*need to take count from from invoice line*/
          tempObj.invoiceNum= tempArr[i].invoiceNumber;
          tempObj.dueDate= tempArr[i].invoiceDueDate;
          tempObj.invoiceAmt= tempArr[i].invoiceAmount;
          tempObj.currency= tempArr[i].invoiceCcy;
          tempObj.comments= tempArr[i].comments[0].comments;
         // tempObj.comments= "fwfee";
          gridData.push(tempObj);
        }


       // var gridData = [{id:"1", error:"error", licensor:"lic"},{id:"1", error:"error", licensor:"lic"}];
        var rows = new can.List(gridData);
       $('#icsvinvoiceGrid').html(stache('<rn-grid rows="{rows}"></rn-grid>')({rows})); 
      },
      "{invoicesData} change":function(){

        

      }
    }


});

export default page;
