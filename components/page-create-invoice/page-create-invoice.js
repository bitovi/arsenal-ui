import Component from 'can/component/';

import appstate from 'models/appstate/';

import invoicemap from 'models/sharedMap/invoice';

import datePicker from 'components/date-picker/';

import createpb from 'components/create-pb/';

import css_bootstrapValidator from 'bootstrapValidator.css!';

import bootstrapValidator from 'bootstrapValidator';

import template from './template.stache!';
import styles from './page-create-invoice.less!';

import InvoiceType from 'models/invoice-type/';
import ContentType from 'models/content-type/';
import Licensor from 'models/licensor/';
import Currency from 'models/currency/';
import Country from 'models/country/';
import Invoice from 'models/invoice/';
import Fxrate from 'models/fxrate/';
import icsvmap from 'models/sharedMap/icsv';
import topfilter from 'models/sharedMap/topfilter';
import validate from 'can/map/validations/';

//import Invoice from 'models/invoice/';


var page = Component.extend({
  tag: 'page-create-invoice',
  template: template,
  scope: {
  	rowindex:1,
  	invoiceTypes:[],
  	licensor:[],
  	currency:[],
  	country:[],
  	contentType:[],
  	fxrate:[],
  	AmountStore:{},
 	totalAmountVal:0,
  	calduedate:0,
  	tax:0,
  	taxStore:{},
  	isAdhocStrore:{"ccidGL":"CCID Document", "contentAdhoc":"Content Type"},
  	/*Form value*/
  	invoicetypeSelect:{},
  	licensorStore:{},
  	currencyStore:"",
  	fxrateStore:"",
  	invoicenumberStore:"",
  	licnotesStore:"",
  	usercommentsStore:"",
  	receiveddate:"",
  	invoicedate:"",
  	invoiceduedate:"",
  	contentTypeStore:{},
  	countryStore:{},
  	ccidGLStore:{},
  	yearStore:{},
  	monthStore:{},
  	grossTotalStore:{},
	/*Form value*/

  	errorMsg:{},
  	invoiceContainer:[],
    //invoiceid:"",
  	editpage:false,
    isRequired: function(){
  	 	/*	if(this.attr("invoicetypeSelect") != "2"){  /*Adhoc*/
  	 	/*			$(".breakdownCountry").addClass("requiredBar");
  	 				$(".breakdownPeriod").addClass("requiredBar");
  	 		}else{
  	 			$(".breakdownCountry").removeClass("requiredBar");
  	 			$(".breakdownPeriod").removeClass("requiredBar");
  	 		} */
		},
	createBreakline: function(rowindex){
				var self = this;
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
                              // $("#breakrow"+rowindex+" #inputYear").attr("id","inputYear"+rowindex);
                               $("#breakrow"+rowindex+" #inputCountry").attr("id","inputCountry"+rowindex);
                               $("#breakrow"+rowindex+" #ccidGL").attr("id","ccidGL"+rowindex).val("");
                               if(rowindex != 0)
                               $("#breakrow"+rowindex+" .removeRow").css("display", "block"); 

                               $(".removeRow").click(function(event){
						            $(this).closest("tr").remove();
						            self.AmountStore.removeAttr("amountText"+rowindex);
						        });
			
		}	
 },
  events: {
    	"inserted": function(){
          	var self = this;  
          	topfilter.attr("show", false);

			this.scope.isRequired(); /*For breakdown required field*/
    			$('#invoiceform').on('init.form.bv', function(e, data) {
			           	data.bv.disableSubmitButtons(true);
		       		 	
			        }).on('init.field.bv', function(e, data) {
			            
			        
			      	})
	    			.bootstrapValidator({
	    			container: 'popover',
			        feedbackIcons: {
			            valid: 'valid-rnotes',
			            invalid: 'alert-rnotes',
			            validating: 'glyphicon glyphicon-refreshas'
			        },
			        fields: {
			            invoicenumber: {
			            	group:'.invoicenumber',
			                validators: {
			                    notEmpty: {
			                        message: 'The invoice number is required'
			                    },
			                    regexp: {
			                        //regexp: /^([0-9]|[a-z])+([0-9a-z]+)$/i,
			                        regexp: /^[a-zA-Z0-9_\- ]*$/i,
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
		                	group:'.usercomments',
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
		                        message: 'The receiveddate is required'
		                    },
		                    date: {
			                        format: 'MM/DD/YYYY',
			                        message: 'Please provide valid date in MM/DD/YYYY format.'
                    		}
			              }
		            },
		            taxAmount: {
		                group:'.tax-amount',
		                validators: {
		                    numeric: {
		                        separator:',',
		                        message: 'Please provide numeric value for tax'
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
		            'amount[]': {
		                validators: {
		                    notEmpty: {
		                        message: 'The amount is required'
		                    }
		                   
		                }
		            }
			          /*   ,
			            'inputContent[]': {
			                validators: {
			                    notEmpty: {
			                        message: 'The inputContent is required'
			                    }
			                   
			                }
			            },
			            'amount[]': {
			                validators: {
			                    notEmpty: {
			                        message: 'The amount is required'
			                    }
			                   
			                }
			            }
			           ,
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
				    	if(data.field != "amount[]"){
				    		$("#"+data.field+"-err").css("display", "block");
				    	}
				    	$('*[data-bv-icon-for="'+data.field +'"]').popover('show');
				}).on('success.field.bv', function(e, data) {
        				$('*[data-bv-icon-for="'+data.field +'"]').popover('destroy');
        				if(data.field != "amount[]"){
				    		$("#"+data.field+"-err").css("display", "none");
				    	}
	        			
				}).on('success.form.bv', function(e, data) {
			  			
                        
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
					   createInvoiceData.invoice["comments"] = [];
					   createInvoiceData.invoice["comments"].comments = self.scope.usercommentsStore;
					   createInvoiceData.invoice["documents"] = [];
					   createInvoiceData.invoice["documents"].fileName = "";
					   createInvoiceData.invoice["documents"].location = "";

					   createInvoiceData.invoice["invoiceLines"] = [];
					   	var index = 0;
					   	self.scope.attr("contentTypeStore").each(function(value, key){  /*Iterating contentType as it is mandatory for all invoice type*/
					   		
					   	var inputContent = "inputContent"+index;
					   		
						var tempArry = {};


				   		tempArry["countryId"] = self.scope.countryStore.attr("inputCountry"+index);
				   		tempArry["fiscalPeriod"] = "201306";
				   		tempArry["periodType"] = "P";
				   		tempArry["contentType"] = self.scope.contentTypeStore.attr("inputContent"+index);
				   		tempArry["lineAmount"] = self.scope.contentTypeStore.attr("amountText"+index);
				   		tempArry["adhocTypeId"] = "";
				   		if(self.scope.attr("invoicetypeSelect") == "2"){  
				  	 		
				  	 		tempArry["glAccount"] = self.scope.ccidGLStore.attr(inputContent);
				  	 		tempArry["ccidName"] = "";
				  	 	}
				  	 	else{
				  	 		tempArry["glAccount"] = "";
				  	 		tempArry["ccidName"] = self.scope.ccidGLStore.attr(inputContent);
				  	 	}

				   		
					   		createInvoiceData.invoice["invoiceLines"].push(tempArry);
					   		index++;

						});
									self.scope.errorMsg.attr("errorCode", "0000");
							   	 	
							   	 	console.log(self.scope.attr("errorMsg"));	
							   	 	
							   	 	console.log(createInvoiceData);
							   	 	Promise.all([
										      	Invoice.create(createInvoiceData)
										     ]).then(function(values) {
									     		   self.scope.errorMsg.attr("responseText", values[0][0]["responseText"]);

									     		   if(values[0][0]["responseCode"] == "0000"){
									     		   		self.scope.attr("invoicenumberStore", "");
												 		self.scope.attr("invoicetypeSelect", "");
												 		self.scope.attr("licensorStore", "");
												 		self.scope.attr("currencyStore", "");
												 		self.scope.attr("fxrateStore", "");
												 		self.scope.attr("licnotesStore", "");
												 		self.scope.attr("createDateStore", "");
												 		self.scope.attr("receiveddate", " ");
												 		self.scope.attr("invoicedate", " ");
												 		self.scope.attr("invoiceduedate", " ");
												 		self.scope.attr("tax", "");
												 		self.scope.attr("usercommentsStore", " ");
												 		for(var i = 1; i <= index; i++){
												 				$("#breakrow"+i).remove();
												 		}
												 		self.scope.attr("totalAmountVal", " ");
													   $("#breakrow0 .amountText").attr("id","amountText0").val("");
						                               self.scope.AmountStore.attr("amountText0", " ");
						                               $("#breakrow0 #inputContent0").attr("id","inputContent0").val("");
						                               $("#breakrow0 #inputMonth0").attr("id","inputMonth0").val("");
						                              // $("#breakrow0 #inputYear0").attr("id","inputYear0").val("");
						                               $("#breakrow0 #inputCountry0").attr("id","inputCountry0").val("");
						                               $("#breakrow0 #ccidGL0").attr("id","ccidGL0").val("");
												 	   // self.scope.contentTypeStore.attr("amountPeriod0","");
												 		
												 		

									     		   }

									     		 

									     		 //self.scope.attr("errorMsg").replace(values);
									     	});
								
								
                        
			                        return false;

			       		 });

						$('#invoicedate').on('dp.change dp.show', function (e) {
			            			$('#invoiceform').bootstrapValidator('revalidateField', 'invoicedate');
			        	});

				        $('#receiveddate').on('dp.change dp.show', function (e) {
				           			$('#invoiceform').bootstrapValidator('revalidateField', 'receiveddate');
				        });


						$('#invoiceduedate').on('dp.change dp.show', function (e) {
				            		$('#invoiceform').bootstrapValidator('revalidateField', 'invoiceduedate');
				        });

						/*	if(!self.scope.attr("invoiceid") && self.scope.attr("allModelReady"))
								self.scope.createBreakline(0);*/  

				},
				 "{invoiceContainer} change": function() {
				 		var self = this;  /*This block is used to update data in view with two way binding*/
				 		
		 		//console.log(self.scope.attr().invoiceContainer[0].invoiceNumber);
		 		
		 		var invoiceData = self.scope.attr().invoiceContainer[0];
		 		self.scope.attr("invoicenumberStore", invoiceData.invoiceNumber);
		 		self.scope.attr("invoicetypeSelect", invoiceData.invoiceTypeId);
		 		self.scope.attr("licensorStore", invoiceData.entityId);
		 		self.scope.attr("currencyStore", invoiceData.invoiceCcy);
		 		self.scope.attr("fxrateStore", invoiceData.fxRate);
		 		self.scope.attr("licnotesStore", invoiceData.notes);
		 		self.scope.attr("createDateStore", invoiceData.invoiceDate);
		 		self.scope.attr("receiveddate", invoiceData.receivedDate);
		 		self.scope.attr("invoicedate", invoiceData.invoiceDate);
		 		self.scope.attr("invoiceduedate", invoiceData.invoiceDueDate);
		 		self.scope.attr("tax", invoiceData.tax);
		 		//self.scope.attr("calduedate", invoiceData.invoiceCalculatedDueDate);
		 		//self.scope.attr("calduedate", invoiceData.invoiceCalculatedDueDate);

		 		/* Comments */
		 		var comment = "";
		 		for(var i=0;i<invoiceData.comments.length;i++){
		 			 comment += invoiceData.comments[i].comments+"   Commented By:"+invoiceData.comments[i].createdBy+" On "+invoiceData.comments[i].createdDate+"                                     ";
				}	
				self.scope.attr("usercommentsStore", comment);
		 		/*Comment end*/

		 		/*Breakdown start*/
		 		//var self = this;
         	
         		var $template = $('#breakrowTemplate');
         	
         		for(var i=0;i<invoiceData.invoiceLines.length;i++){
					self.scope.attr("rowindex",i)
					var rowindex = self.scope.attr("rowindex");
               
                	var $clone = $template
                                .clone()
                                .removeClass('hide')
                                .removeAttr('id')
                                .attr("id","breakrow"+rowindex)
								.insertBefore($template);
                               $("#breakrow"+rowindex+" .amountText").attr("id","amountText"+rowindex).val(invoiceData.invoiceLines[i].lineAmount);
                               self.scope.AmountStore.attr("amountText"+rowindex, invoiceData.invoiceLines[i].lineAmount);
                               $("#breakrow"+rowindex+" #inputContent").attr("id","inputContent"+rowindex).val(invoiceData.invoiceLines[i].contentType);
                               $("#breakrow"+rowindex+" #inputMonth").attr("id","inputMonth"+rowindex).val(invoiceData.invoiceLines[i].fiscalPeriod);
                              // $("#breakrow"+rowindex+" #inputYear").attr("id","inputYear"+rowindex);
                               $("#breakrow"+rowindex+" #inputCountry").attr("id","inputCountry"+rowindex).val(invoiceData.invoiceLines[i].countryName);
                               $("#breakrow"+rowindex+" #ccidGL").attr("id","ccidGL"+rowindex).val(invoiceData.invoiceLines[i].glAccount);
                               if(rowindex != 0)
                               $("#breakrow"+rowindex+" .removeRow").css("display", "block"); 

                               $(".removeRow").click(function(event){
						           	$(this).closest("tr").remove();
						           	self.scope.AmountStore.removeAttr("amountText"+rowindex);
						            //alert($(this));
						     });
                      
                      }         

               /*Breakdown end*/    



		 		
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
	/*	".inputYear change": function(event){
         	this.scope.yearStore.attr(event[0].id, event[0].value)
		},*/
		".inputCountry change": function(event){
         	this.scope.countryStore.attr(event[0].id, event[0].value)
         	console.log(this.scope.countryStore.attr());
		},
		".ccidGL change": function(event){
         	this.scope.ccidGLStore.attr(event[0].id, event[0].value)
		},



		"#invoiceType change": function(){
			this.scope.isRequired();
			var self = this;
			$("[id^=breakrow]").each(function(index){  /*removing added row in break down when invoice type changes to adhoc.*/
				if((this.id !="breakrow0") && (this.id !="breakrowTemplate")){
					$(this).remove();
					
					}
			  });
			$("#breakrow0 .amountText").attr("id","amountText0").val(" ");
			
			self.scope.attr("AmountStore").each(function(val, key){
  	 				self.scope.AmountStore.removeAttr(key);
  	 			});
			
			this.scope.attr("totalAmountVal", 0);
			
			if(this.scope.attr("invoicetypeSelect") == "2"){  /*Adhoc*/
				this.scope.isAdhocStrore.attr("ccidGL", "GL Account");
	  	 		this.scope.isAdhocStrore.attr("contentAdhoc", "Adhoc Type");
	  	 		this.scope.isAdhocStrore.attr("invtype", "Adhoc");

	  	 	 }
			 else{
			  	 this.scope.isAdhocStrore.attr("ccidGL", "CCID Document");
			  	 this.scope.isAdhocStrore.attr("contentAdhoc", "Content Type");
			  	 this.scope.isAdhocStrore.attr("invtype", "");
			 }

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
         	self.scope.attr("rowindex", rowindex + 1);
          
			/*var $template = $('#breakrowTemplate'),
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
						            $(this).closest("tr").remove();
						            self.scope.AmountStore.removeAttr("amountText"+rowindex);
						        });*/
					
					
                   self.scope.createBreakline(rowindex);            	


					},
				"#addInvSubmit click":function(){

					
				},
				"#buttonCancel click":function(){
					appstate.attr('page','invoices');
				}

    
   },
  	init: function(){
   	 	var self = this;
   	 	var i = 1;
   	 	topfilter.attr("show", false); /*hiding top filter*/
   	 	Promise.all([
			      	InvoiceType.findAll(),
			     	Licensor.findAll(),
			     	Currency.findAll(),
			        ContentType.findAll(),
			      	Country.findAll(),
			      	Fxrate.findAll()
			      	//  Currency.findAll()*/
				]).then(function(values) {
		     		 self.scope.attr("invoiceTypes").replace(values[0][0]["data"]);
		     		 self.scope.attr("licensor").replace(values[1][0]["data"]);
		     		 self.scope.attr("currency").replace(values[2][0]["data"]);
		     		 self.scope.attr("contentType").replace(values[3][0]["data"]);
		     		 self.scope.attr("country").replace(values[4][0]["data"]);
		     		 self.scope.attr("fxrate").replace(values[5][0]["data"][0]["fxrate"]);
		     		console.log(self.scope.fxrate.attr()[0]);
		     		console.log(self.scope.attr("invoiceTypes").replace(values[0][0]["data"]));
		     	
		     		
		     	//	 self.scope.attr("invoiceid", invoicemap.attr("invoiceid"));

		     		 if(invoicemap.attr("invoiceid")){
					
						//this.attr("editpage", true);
						
						//console.log(invoiceid+"dadajsd");

						self.scope.attr("editpage", true);
						Promise.all([
				      				Invoice.findOne()
				    			]).then(function(values) {
						     		 self.scope.attr("invoiceContainer").replace(values[0][1]["invoice"]);
						    	});	
						}	
					



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
			  	 		
			  	 		return "Adhoc";
			  	 		//console.log(this.isAdhocStrore);
			  	 		//this.attr("isAdhoc").contentGL
			  	 		//return "GL Account"
			  	 	}
			  	 	else{
			  	 		this.isAdhocStrore.attr("ccidGL", "CCID Document");
			  	 		return this.isAdhocStrore;
			  	 		//return "CCID Document"
			  	 	}
			  	},
			  	grossTotal: function(){
			  	 	var grossTotal = (parseFloat(this.attr("tax")) + parseFloat(this.attr("totalAmountVal")));
			  	 	this.attr("grossTotalStore", grossTotal);
			  	 	return grossTotal;
			  	},
			  	setHeight: function(){
			  	 	var vph = $(window).height()-180;
			  	 	return 'Style="height:'+vph+'px"';
				},
				setMinHeightBreak: function(){
			  	 	var vph = $(window).height()-500;
			  	 	return 'Style="min-height:'+vph+'px"';
				},
				calculateUSD:function(){
					var fxrate = this.fxrate.attr()[0];
					return this.attr("totalAmountVal")*fxrate;
					//return fxrate;
				},
				disableInvoiceType:function(){
					if(this.attr("editpage"))
					{
					  return "disabled"; 
					}
					else
					{
						return ""; 
					}
				}

  	 	}
});

export default page;
