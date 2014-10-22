import Component from 'can/component/';

import datePicker from 'components/date-picker/';

import css_bootstrapValidator from 'bootstrapValidator.css!';

import bootstrapValidator from 'bootstrapValidator';

import template from './template.stache!';
import styles from './page-add-invoice.less!';

import InvoiceType from 'models/invoice-type/';
import ContentType from 'models/content-type/';
import Licensor from 'models/licensor/';
import Currency from 'models/currency/';
import Country from 'models/country/';

var page = Component.extend({
  tag: 'page-add-invoice',
  template: template,
  scope: {
  	rowindex:1,
  	invoiceTypes:[],
  	licensor:[],
  	currency:[],
  	country:[],
  	contentType:[],
  	AmountStore:{},
 	totalAmountVal:0,
  	calduedate:0,
  	tax:0,
  	taxStore:{},
  	/*Form value*/
  	invoicetypeSelect:{},
  	licensorStore:{},
  	currencyStore:{},
  	fxrateStore:"",
  	invoicenumberStore:"",
  	licnotesStore:"",
  	usercommentsStore:"",
  	receiveddate:"",
  	invoicedate:"",
  	invoiceduedate:"",
  	contentTypeStore:{},
  	countryStore:{},
  	ccidGLStore:"",
  	yearStore:{},
  	monthStore:{},
  	grossTotalStore:{},



	/*Form value*/

  	isRequired: function(){
  	 		if(this.attr("invoicetypeSelect") != "2"){  /*Adhoc*/
  	 				$(".breakdownCountry").addClass("requiredBar");
  	 				$(".breakdownPeriod").addClass("requiredBar");
  	 		}else{
  	 			$(".breakdownCountry").removeClass("requiredBar");
  	 			$(".breakdownPeriod").removeClass("requiredBar");
  	 		}
		}
 },
  events: {
    	"inserted": function(){
           var self = this;  


  				this.scope.isRequired(); /*For breakdown required field*/
    			$('#invoiceform').on('init.form.bv', function(e, data) {
			            
			            data.bv.disableSubmitButtons(true);
		       		 	
			        }).on('init.field.bv', function(e, data) {
			            
			         //   console.log(data.bv.getInvalidFields());
		       		 	
			        })
	    			.bootstrapValidator({
	    			container: 'popover',
			        feedbackIcons: {
			            valid: 'glyphicon glyphicon-okass',
			            invalid: 'alert',
			            validating: 'glyphicon glyphicon-refreshas'
			        },
			        fields: {
			            invoicenumber: {
			                validators: {
			                    notEmpty: {
			                        message: 'The invoice number is required'
			                    },
			                    regexp: {
			                        regexp: /^([0-9]|[a-z])+([0-9a-z]+)$/i,
			                        message: 'Please provide valid characters'
			                    }
			                }
			            },
			            fxrate: {
			                group:'.fxrate',
			                validators: {
			                    numeric: {
			                        separator:',',
			                        message: 'Please provide numeric value for Fx Rate'
                    			},
                    			callback: {
			                            message: 'Please provide positive Fx Rate',
			                            callback: function (value, validator, $field) {
			                              if((value != "")  && (parseFloat(value) < 0)){
			                              	return false;
			                              }
			                              return true;
			                            }
                        		}
                    			
			                }
			            },
			            usercomments :{
			                validators: {
			                    notEmpty: {
			                        message: 'The licensor notes is required'
			                    }
			                }
			            },
			            invoicedate :{
			                group:'.invdate',
			                validators: {
			                    notEmpty: {
			                        message: 'The invoicedate is required'
			                    },
			                    date: {
				                        format: 'MM/DD/YYYY',
				                        message: 'Please provide valid date in MM/DD/YYYY format.'
	                    		}
				              }
			            },
			            invoiceduedate :{
			                group:'.invduedate',
			                validators: {
			                    notEmpty: {
			                        message: 'Please provide invoiceduedate.'
			                    },
			                    date: {
				                        format: 'MM/DD/YYYY',
				                        message: 'Please provide valid date in MM/DD/YYYY format.'
	                    		},
                    			callback: {
			                            message: 'Invoice Due date must be less than calculated due date',
			                            callback: function (value, validator, $field) {
			                              if(value != ""){
			                              	var invduedate = new Date(value);
			                              	var calduedate = new Date(self.scope.attr("calduedate"));
			                              	var timeDiff = Math.abs(invduedate.getTime() - calduedate.getTime());
											var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
											if(Math.abs(invduedate.getTime()) > Math.abs(calduedate.getTime())){
												return false;
											}
										  }
			                              return true;
			                            }
                        		}
				              }
			            },
			            receiveddate :{
			                group:'.recdate',
			                validators: {
			                    notEmpty: {
			                        message: 'The invoicedate is required'
			                    },
			                    date: {
				                        format: 'MM/DD/YYYY',
				                        message: 'Please provide valid date in MM/DD/YYYY format.'
	                    		}
				              }
			            }
			          /*  ,
			            'amount[]': {
		                    validators: {
		                        notEmpty: {
		                            message: 'The option required and cannot be empty'
		                        },
		                        stringLength: {
		                            max: 100,
		                            message: 'The option must be less than 100 characters long'
		                        }
		                    }
                		} */

			         }
			    }).on('error.field.bv', function(e, data) {
				    	$("#"+data.field+"-err").css("display", "block");
				   		$('*[data-bv-icon-for="'+data.field +'"]').popover('show');
				}).on('success.field.bv', function(e, data) {
        				$('*[data-bv-icon-for="'+data.field +'"]').popover('destroy');
	        			$("#"+data.field+"-err").css("display", "none");
				}).on('success.form.bv', function(e, data) {
			  			//var res = $('#invoiceform').serializeArray();
                        //console.log(res);
                         //data.bv.disableSubmitButtons(false);
                        
                      console.log(self);

                       var createInvoiceData = {};
					   createInvoiceData.invoice = [];

					   createInvoiceData.invoice["invoiceNumber"] = self.scope.invoicenumberStore;
					   createInvoiceData.invoice["invoiceTypeId"] = self.scope.invoicetypeSelect;
					   createInvoiceData.invoice["entityId"] = self.scope.contentTypeStore;
					   createInvoiceData.invoice["invoiceCcy"] = self.scope.currencyStore;
					   createInvoiceData.invoice["fxRate"] = self.scope.fxrateStore;
					   createInvoiceData.invoice["notes"] = self.scope.licnotesStore;
					   createInvoiceData.invoice["invoiceAmount"] = self.scope.totalAmountVal;
					   createInvoiceData.invoice["tax"] = self.scope.tax;
					   createInvoiceData.invoice["grossTotal"] = self.scope.grossTotalStore;
					   createInvoiceData.invoice["userAdjAmt"] = "";
					   createInvoiceData.invoice["bundleId"] = "";
					   createInvoiceData.invoice["bundleName"] = "";
					   createInvoiceData.invoice["receivedDate"] = self.scope.receiveddate;
					   createInvoiceData.invoice["invoiceDate"] = self.scope.invoicedate;
					   createInvoiceData.invoice["invoiceCalculatedDueDate"] = self.scope.calduedate;
					   createInvoiceData.invoice["invoiceDueDate"] = self.scope.invoiceduedate;

					 var comments = {};
					 createInvoiceData.invoice["invoiceDueDate"].push(comments);




					  







/*

                       var createInvoiceData = {
												    "invoices": [
												        {
												            "invoiceNumber": self.scope.invoicenumberStore,
												            "invoiceTypeId": invoicetypeSelect,
															"entityId": contentTypeStore,
															"invoiceCcy": currencyStore,
															"fxRate": fxrateStore,
															"notes": licnotesStore,
															"invoiceAmount": totalAmountVal,
															"tax": tax,
															"grossTotal": grossTotalStore,
															"userAdjAmt": "",
															"bundleId": "", 
															"bundleName": “newly created bundle”, //optional
															"receivedDate": receiveddate,
															"invoiceDate": invoicedate,
															"invoiceCalculatedDueDate": calduedate,	
															"invoiceDueDate": invoiceduedate,

												            "comments": [
												                {
												                    "comments": self.scope.usercommentsStore
												                }
												            ],
												            "documents": [
												                {
												                    "location": "/tmp"
												                }
												            ],
												            "invoiceLines": [
												                {
												                    "countryId": "DKK",
												                    "fiscalPeriod": "201306",
												                    "periodType": "P",
												                    "contentType": "music",
												                    "lineAmount": "2000.00"
												                }
												            ]
												        }
												    ]
												}*/

									//var createInvoiceData = new Object();

									console.log(createInvoiceData);			

                        return false;

       		 });

		},
         ".classAmtTotal blur": function(event){
         	this.scope.AmountStore.attr(event[0].id, event[0].value)
         	
		},
		".inputContent change": function(event){
         	this.scope.contentTypeStore.attr(event[0].id, event[0].value)
		},
		".inputMonth change": function(event){
         	this.scope.monthStore.attr(event[0].id, event[0].value)
		},
		".inputYear change": function(event){
         	this.scope.yearStore.attr(event[0].id, event[0].value)
		},
		".inputCountry change": function(event){
         	this.scope.countryStore.attr(event[0].id, event[0].value)
         	console.log(this.scope.countryStore.attr());
		},
		".ccidGL change": function(event){
         	this.scope.ccidGLStore.attr(event[0].id, event[0].value)
		},



		"#invoiceType change": function(){
			this.scope.isRequired();
		},
         "{AmountStore} change": function() {
         		var totalAmount = 0;
  	 			this.scope.attr("AmountStore").each(function(val, key){
  	 				if(val == ""){
  	 					val =0;
  	 				}
  	 				totalAmount += parseInt(val);
  	 			});
  	      		this.scope.attr("totalAmountVal", totalAmount);

         },	
			".addRow click":function(){
         	
         	var self = this;
         	var rowindex = self.scope.attr("rowindex");
         	self.scope.attr("rowindex", rowindex + 1)
          
			var $template = $('#breakrowTemplate'),
                $clone    = $template
                                .clone()
                                .removeClass('hide')
                                .removeAttr('id')
                                .attr("id","breakrow"+rowindex)
								.insertBefore($template);
                               $("#breakrow"+rowindex+" .amountText").attr("id","amountText"+rowindex).val(" ");
                               $("#breakrow"+rowindex+" #inputContent").attr("id","inputContent"+rowindex);
                               $("#breakrow"+rowindex+" #inputMonth").attr("id","inputMonth"+rowindex);
                               $("#breakrow"+rowindex+" #inputYear").attr("id","inputYear"+rowindex);
                               $("#breakrow"+rowindex+" #inputCountry").attr("id","inputCountry"+rowindex);
                               $("#breakrow"+rowindex+" #ccidGL").attr("id","ccidGL"+rowindex).val(" ");
                               $("#breakrow"+rowindex+" .removeRow").css("display", "block"); 

                               $(".removeRow").click(function(event){
						            console.log($(this)+"qeqew"+$(this).length);
						            $(this).closest("tr").remove();
						            console.log(event);
						            self.scope.AmountStore.removeAttr("amountText"+rowindex);
						            //alert($(this));
						     });
					
					},
				"#addInvSubmit click":function(){

					
				}
    
   },
  init: function(){
   	 	var self = this;
   	 	Promise.all([
			      	InvoiceType.findAll(),
			     	Licensor.findAll(),
			     	Currency.findAll(),
			        ContentType.findAll(),
			      	Country.findAll()
			      //  Currency.findAll()*/
				]).then(function(values) {
		     		 self.scope.attr("invoiceTypes").replace(values[0][0]["invoiceTypes"]);
		     		 self.scope.attr("licensor").replace(values[1][0]["licensors"]);
		     		 self.scope.attr("currency").replace(values[2][0]["currencies"]);
		     		 self.scope.attr("contentType").replace(values[3][0]["contentTypes"]);
		     		 self.scope.attr("country").replace(values[4][0]["countries"]);
		    });



	   		

    },
  helpers: {
  	 currentDate: function(){
  	 	var date = new Date();
		return ((date.getMonth() + 1) + '/' + date.getDate() + '/' +  date.getFullYear())
  	 },
  	 calculatedDueDate: function(){
  	 	var date = new Date();
  	 	date.setMonth(date.getMonth() + 1);
  	 	var calduedate = ((date.getMonth() + 1) + '/' + date.getDate() + '/' +  date.getFullYear());
  	 	this.attr("calduedate", calduedate);  
		return calduedate;
		
  	 },
  	 calculateTaxPercent: function(){
  	 	this.attr("taxStore", this.attr("tax"));
  	 	var percent = (this.attr("tax")/this.attr("totalAmountVal"))*100;
  	 	if(isNaN(percent))
  	 	return ""
  	 	else
  	 	return percent.toFixed(2); //Round to Two decimal only
  	 },
  	 isAdhoc: function(){
  	 	if(this.attr("invoicetypeSelect") == "2"){  /*Adhoc*/
  	 		console.log(this);
  	 		return "GL Account"
  	 	}
  	 	else{
  	 		return "CCID Document"
  	 	}
  	 },
  	 grossTotal: function(){
  	 	var grossTotal = (parseFloat(this.attr("tax")) + parseFloat(this.attr("totalAmountVal")));
  	 	this.attr("grossTotalStore", grossTotal);
  	 	return grossTotal;
  	 }
  	 



  }
});

export default page;
