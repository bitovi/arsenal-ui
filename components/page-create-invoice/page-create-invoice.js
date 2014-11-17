import Component from 'can/component/';


import datePicker from 'components/date-picker/';
import createpb from 'components/create-pb/';

import css_bootstrapValidator from 'bootstrapValidator.css!';

import bootstrapValidator from 'bootstrapValidator';

import template from './template.stache!';
import styles from './page-create-invoice.less!';

import UserReq from 'utils/request/';

import invoicemap from 'models/sharedMap/invoice';
import InvoiceType from 'models/common/invoice-type/';
import ContentType from 'models/common/content-type/';
import Licensor from 'models/common/licensor/';
import Currency from 'models/common/currency/';
import Country from 'models/common/country/';
import Invoice from 'models/invoice/';
import Fxrate from 'models/common/fxrate/';
import icsvmap from 'models/sharedMap/icsv';
import AdhocTypes from 'models/common/adhoc-types/';
import GLaccounts from 'models/glaccounts/';
import stache from 'can/view/stache/';

//import Invoice from 'models/invoice/';

var mandatoryFieldAdhoc = ["invoicenumber",  "invoicedate",  "receiveddate", "amount[]", "licensor", "currency"];
var mandatoryField = ["invoicenumber",  "invoicedate",  "receiveddate", "amount[]", "inputMonth[]", "inputCountry[]", "licensor", "currency"];

var page = Component.extend({
  tag: 'page-create-invoice',
  template: template,
  scope: {
    appstate:undefined,
  	rowindex:1,
  	invoiceTypes:[],
  	invoiceTypesMap:[],
  	licensor:[],
  	currency:[],
  	country:[],
  	contentType:[],
  	adhocType:[],
  	fxrate:[],
  	glaccounts:[],
  	AmountStore:{},
 	totalAmountVal:0,
  	calduedate:0,
  	tax:0,
  	taxStore:{},
  	isAdhocStrore:{"ccidGL":"CCID Document", "contentAdhoc":"Content Type"},
  	/*Form value*/
  	invoicetypeSelect:"",
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
  	paymentBundleName:"",
  	paymentBundleId:"",
	/*Form value*/

  	errorMsg:{},
  	errorStatus:{},
  	invoiceContainer:[],
  	showPBR:true,
  	DelInvoiceline:[],
  	currentdate:"",
    //invoiceid:"",
  	editpage:false,
  	formSuccessCount:1,
    isRequired: function(){
  	 		if(this.attr("invoicetypeSelect") != "2"){  /*Adhoc*/
  	 				$(".breakdownCountry").addClass("requiredBar");
  	 				$(".breakdownPeriod").addClass("requiredBar");

  	 		}else{
  	 			$(".breakdownCountry").removeClass("requiredBar");
  	 			$(".breakdownPeriod").removeClass("requiredBar");
  	 		} 
		},
	createBreakline: function(rowindex){

				var self = this;
				var $template = $('#breakrowTemplate'),
                $clone    = $template
                                .clone()
                                .removeClass('hide')
                                .removeAttr('id')
                                .attr("id","breakrow"+rowindex).attr("rowid", rowindex)
								.insertBefore($template);
                               $("#breakrow"+rowindex+" .amountText").attr("id","amountText"+rowindex).val(" ");
                               $("#breakrow"+rowindex+" #inputContent").attr("id","inputContent"+rowindex);
                               $("#breakrow"+rowindex+" #inputMonth").attr("id","inputMonth"+rowindex);
                              // $("#breakrow"+rowindex+" #inputYear").attr("id","inputYear"+rowindex);
                               $("#breakrow"+rowindex+" #inputCountry").attr("id","inputCountry"+rowindex);
                               $("#breakrow"+rowindex+" #ccidGL").attr("id","ccidGL"+rowindex).val("");
                               if(rowindex != 0)
                               $("#breakrow"+rowindex+" .removeRow").css("display", "block");

                                var $option   = $clone.find('[name="amount[]"], [name="inputMonth[]"], [name="inputCountry[]"]');
                                
                                $option.each(function(index){
                                	$('#invoiceform').bootstrapValidator('addField', $(this));
                                });
                                
                                $("#addInvSubmit").attr("disabled", true);

                               	$(".removeRow").click(function(event){

	                               	$option.each(function(index){
	                                	$('#invoiceform').bootstrapValidator('removeField', $(this));
	                                });

                               		$(this).closest("tr").remove();
						            self.AmountStore.removeAttr("amountText"+rowindex);
						            $("#addInvSubmit").attr("disabled", true);
						        });

                               //console.log($clone.find('[name="amount[]"]'));


		}
 },
  events: {
    	"inserted": function(){
          	var self = this;


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
			                        message: 'Invoice number is mandatory'
			                    },
			                    stringLength: {
			                        max:50,
			                        message: 'Maximum 50 characters allowed',
			                        utf8Bytes: true
			                    },
			                    regexp: {
			                        regexp: /^[a-zA-Z0-9_\- ]*$/i,
			                        message: 'Please provide valid characters'
			                    }
			                }
		            },
		            invoicedate :{
		                group:'.invdate',
		                validators: {
		                    notEmpty: {
		                        message: 'Invoicedate is mandatory'
		                    },
		                    date: {
			                        format: 'MM/DD/YYYY',
			                        message: 'Please provide valid date in MM/DD/YYYY format'
                    		}
			              }
		            },
		            receiveddate :{
		                group:'.recdate',
		                validators: {
		                    notEmpty: {
		                        message: 'Received date is mandatory'
		                    },
		                    date: {
			                        format: 'MM/DD/YYYY',
			                        message: 'Please provide valid date in MM/DD/YYYY format'
                    		}
			              }
		            },
		            invoiceduedate :{
		                group:'.invduedate',
		                validators: {
		                    date: {
			                        format: 'MM/DD/YYYY',
			                        message: 'Please provide valid date in MM/DD/YYYY format'
                    		},
                			callback: {
		                            message: 'Invoice Due date must be less than calculated due date',
		                            callback: function (value, validator, $field) {
		                         /*     if(value != ""){  
		                              	var invduedate = new Date(value);
		                              	var calduedate = new Date(self.scope.attr("calduedate"));
		                              	var timeDiff = Math.abs(invduedate.getTime() - calduedate.getTime());
										var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
										if(Math.abs(invduedate.getTime()) > Math.abs(calduedate.getTime())){
											return false;
										}
									  }*/
		                              return true;
		                            }
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
		            'amount[]': {
		                validators: {
		                    notEmpty: {
		                        message: 'Amount is mandatory'
		                    },
		                    numeric: {
		                        separator:',',
		                        message: 'Please provide numeric value for amount'
                			},
                			callback: {
		                            message: 'Please provide positive value for amount',
		                            callback: function (value, validator, $field) {
			                              if((value != "")  && (parseFloat(value) < 0)){
			                              	return {
				                                    valid: false,
				                                    message: 'Please provide positive invoice amount'
				                                }
			                              }
										return true;
		                            }
                    			}
		                	}
		            	},
		            	usercomments: {
		            	 group:'.usercomments',
			                 validators: {
			                   	stringLength: {
				                        max:1024,
				                        message: 'Maximum 1024 characters allowed',
				                        utf8Bytes: true
				                    }

			                }
						},
						licnotes: {
		            	 group:'.licnotes',
			                 validators: {
			                   	stringLength: {
				                        max:1024,
				                        message: 'Maximum 1024 characters allowed',
				                        utf8Bytes: true
				                    }

			                }
						},
						licensor: {
			            	 group:'.licensor',
			                 validators: {
			                   	callback: {
			                            message: 'Licensor is mandatory',
			                            callback: function (value, validator, $field) {
			                              if(value == ""){
			                              	   return false;
			                              }
			                              return true;
			                            }
	                    		}

			                }
						},
						currency: {
			            	 group:'.currency',
			                 validators: {
			                   	callback: {
			                            message: 'Currency is mandatory',
			                            callback: function (value, validator, $field) {
			                              if(value == ""){
			                              	   return false;
			                              }
			                              return true;
			                            }
	                    		}

			                }
						},
						'inputMonth[]': {
			                validators: {
			                    callback: {
			                            message: 'Period is mandatory',
			                            callback: function (value, validator, $field) {
			                              if((value == "") && (self.scope.attr("invoicetypeSelect") != "2")){
			                              	   return false;
			                              }
			                              return true;
			                            }
	                    		}
			                }
		            	},
		            	'inputCountry[]': {
			                validators: {
			                    callback: {
			                            message: 'Country is mandatory',
			                            callback: function (value, validator, $field) {
			                               if((value == "") && (self.scope.attr("invoicetypeSelect") != "2")){
			                              	   return false;
			                              }
			                              return true;
			                            }
	                    		}
			                }
		            	}

					}
			    }).on('error.field.bv', function(e, data) {
				    	if((data.field != "amount[]") && (data.field != "inputMonth[]") && (data.field != "inputCountry[]")){
				    		$("#"+data.field+"-err").css("display", "block");
				    	}
				    	

				    	$('*[data-bv-icon-for="'+data.field +'"]').popover('show');

				}).on('success.field.bv', function(e, data) {
        				$('*[data-bv-icon-for="'+data.field +'"]').popover('destroy');
        				if((data.field != "amount[]") && (data.field != "inputMonth[]") && (data.field != "inputCountry[]")){
				    		$("#"+data.field+"-err").css("display", "none");
				    	}

        				if(!self.scope.editpage){
	        				var requireField = (self.scope.attr("invoicetypeSelect") == "2")?mandatoryFieldAdhoc:mandatoryField;

	        				for(var i= 0; i < requireField.length; i++){
	        					if(!data.bv.isValidField(mandatoryField[i])){
	        						 data.bv.disableSubmitButtons(true);
	        						 break;
	        					}
	        				}
        				}
        				if(self.scope.editpage){
	        				if(!data.bv.isValid()){
	        					data.bv.disableSubmitButtons(true);
							}
        			   }

        			}).on('success.form.bv', function(e) {

        				e.preventDefault();
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

						if(!self.scope.editpage){
							self.scope.attr("invoiceduedate", getCurrentDate());
						}
						/*	if(!self.scope.attr("invoiceid") && self.scope.attr("allModelReady"))
								self.scope.createBreakline(0);*/

				},
			".form-control keyup": function(event){

					var self = this;

					if(event[0].id == "newPaymentBundle"){
						if(String(event[0].value).length > 10){
							showError(event[0].id, "Maximum 100 characters allowed");
						}
						else{
							removeError(event[0].id);

						}
					}

					if(event[0].id == "taxAmount"){
						if((parseFloat(event[0].value) < 0) || isNaN(event[0].value)){

							showError(event[0].id, "Please provide positive value for tax");
						}
						else{
							removeError(event[0].id);
						}
					}


				},
				 "{invoiceContainer} change": function() {
				 		var self = this;  /*This block is used to update data in view with two way binding*/

		 	console.log(self.scope.attr().invoiceContainer[0]);

		 		var invoiceData = self.scope.attr().invoiceContainer[0];
		 		self.scope.attr("invoicenumberStore", invoiceData.invoiceNumber);
		 		self.scope.attr("invoicetypeSelect", invoiceData.invoiceTypeId);
		 		self.scope.attr("licensorStore", invoiceData.entityId);
		 		self.scope.attr("currencyStore", invoiceData.invoiceCcy);
		 		self.scope.attr("fxrateStore", invoiceData.fxRate);
		 		self.scope.attr("licnotesStore", invoiceData.notes);
		 		self.scope.attr("createDateStore", invoiceData.invoiceDate);
		 		self.scope.attr("receiveddate", dateFormatter(invoiceData.receivedDate,"yyyy-mm-dd"));
		 		self.scope.attr("invoicedate", dateFormatter(invoiceData.invoiceDate,"yyyy-mm-dd"));
		 		self.scope.attr("invoiceduedate", dateFormatter(invoiceData.invoiceDueDate,"yyyy-mm-dd"));
		 		self.scope.attr("calduedate", dateFormatter(invoiceData.invoiceCalcDueDate,"yyyy-mm-dd"));


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
                                .attr("id","breakrow"+rowindex).attr("rowid", rowindex)
								.insertBefore($template);
                               $("#breakrow"+rowindex+" .amountText").attr("id","amountText"+rowindex).val(invoiceData.invoiceLines[i].lineAmount);
                               self.scope.AmountStore.attr("amountText"+rowindex, invoiceData.invoiceLines[i].lineAmount);
                               $("#breakrow"+rowindex+" #inputContent").attr("id","inputContent"+rowindex).val(invoiceData.invoiceLines[i].contentType);
                               if(self.scope.attr("invoicetypeSelect") == "2"){
                               		self.scope.contentTypeStore.attr("inputContent"+rowindex, invoiceData.invoiceLines[i].adhocTypeId);


						 		}
						 		else
						 		{

						 			self.scope.contentTypeStore.attr("inputContent"+rowindex, invoiceData.invoiceLines[i].contentType);
						 		}

                               $("#breakrow"+rowindex+" #inputMonth").attr("id","inputMonth"+rowindex).val(invoiceData.invoiceLines[i].fiscalPeriod);
                               self.scope.monthStore.attr("inputMonth"+rowindex, invoiceData.invoiceLines[i].fiscalPeriod);
                              // $("#breakrow"+rowindex+" #inputYear").attr("id","inputYear"+rowindex);
                               $("#breakrow"+rowindex+" #inputCountry").attr("id","inputCountry"+rowindex).val(invoiceData.invoiceLines[i].countryId);
                                  self.scope.countryStore.attr("inputCountry"+rowindex, invoiceData.invoiceLines[i].countryId);

                               $("#breakrow"+rowindex+" #ccidGL").attr("id","ccidGL"+rowindex).val(invoiceData.invoiceLines[i].glAccount);

                               if(self.scope.attr("invoicetypeSelect") == "2"){

						 			self.scope.ccidGLStore.attr("ccidGL"+rowindex, invoiceData.invoiceLines[i].glAccount);
						 		}
						 		else
						 		{

						 			self.scope.ccidGLStore.attr("ccidGL"+rowindex, invoiceData.invoiceLines[i].ccidName);
						 		}




                               if(rowindex != 0)
                               $("#breakrow"+rowindex+" .removeRow").css("display", "block");

                                var $option   = $clone.find('[name="amount[]"], [name="inputMonth[]"], [name="inputCountry[]"]');
                                
                                $option.each(function(index){
                                	$('#invoiceform').bootstrapValidator('addField', $(this));
                                });

                           	}


                      $(".removeRow").click(function(event){
                      	          
						           	$option.each(function(index){
	                                			$('#invoiceform').bootstrapValidator('removeField', $(this));
	                               		 });

						           	var rowindex = $(this).closest("tr").attr("rowid");

										var inputContent = "inputContent"+rowindex;
										var tempDelObj = {};
										tempDelObj["country"] = self.scope.countryStore.attr("inputCountry"+rowindex);
								   		tempDelObj["fiscalPeriod"] =  self.scope.monthStore.attr("inputMonth"+rowindex);
								   		tempDelObj["periodType"] = "P";
								   		tempDelObj["contentGrpId"] = self.scope.contentTypeStore.attr("inputContent"+rowindex);
								   		tempDelObj["contentGrpName"] = $("#inputContent"+rowindex+" option:selected").text();
								   		tempDelObj["lineAmount"] = self.scope.AmountStore.attr("amountText"+rowindex);
								   		tempDelObj["lineStatus"] = "";
								   		tempDelObj["status"] = "DELETE";
								   		tempDelObj["lineType"] = "";
								   		if(self.scope.attr("invoicetypeSelect") == "2"){

								  	 		tempDelObj["glAccRefId"] = self.scope.ccidGLStore.attr(inputContent);
								  	 		tempDelObj["ccidFileName"] = "";
								  	 	}
								  	 	else{
								  	 		tempDelObj["glAccRefId"] = "";
								  	 		tempDelObj["ccidFileName"] = self.scope.ccidGLStore.attr(inputContent);
								  	 	}

									//console.log(tempDelObj);
									self.scope.DelInvoiceline.push(tempDelObj);
									$(this).closest("tr").remove();
						           	self.scope.AmountStore.removeAttr("amountText"+rowindex);
						           	self.scope.contentTypeStore.removeAttr("inputContent"+rowindex);

						     });

               /*Breakdown end*/
               var invoicevalid = $("#invoiceform").data('bootstrapValidator').isValid();

               if(!invoicevalid){
					$("#invoiceform").data('bootstrapValidator').validate();
					$("#invoiceform").data('bootstrapValidator').disableSubmitButtons(true);
               	}



		 },
 		".classAmtTotal blur": function(event){
 			var amountStr = event[0].value;
 			this.scope.AmountStore.attr(event[0].id, parseFloat(amountStr.replace(/,/g, '')));

		},
		".inputContent change": function(event){
         	this.scope.contentTypeStore.attr(event[0].id, event[0].value)
         	console.log(this.scope.contentTypeStore.attr());

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

		"#invoicelicensor change": function(event){
			var genObj = {licensorId:event[0].value};
			var self = this;
			Promise.all([Currency.findAll(UserReq.formRequestDetails(genObj))
			     ]).then(function(values) {
				    self.scope.attr("currency").replace(values[0]);
			   });
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
	  	 		this.scope.isAdhocStrore.attr("adhoc", true);
	  	 		this.scope.attr("showPBR", true);

	  	 	 }
	  	 	 else if(this.scope.attr("invoicetypeSelect") == "3"){
			  	 this.scope.isAdhocStrore.attr("ccidGL", "CCID Document");
			  	 this.scope.isAdhocStrore.attr("contentAdhoc", "Content Type");
			  	 this.scope.isAdhocStrore.attr("invtype", "");
			  	 this.scope.isAdhocStrore.attr("adhoc", false);
				 this.scope.attr("showPBR", false);
			 }
			 else{
			  	 this.scope.isAdhocStrore.attr("ccidGL", "CCID Document");
			  	 this.scope.isAdhocStrore.attr("contentAdhoc", "Content Type");
			  	 this.scope.isAdhocStrore.attr("invtype", "");
			  	 this.scope.isAdhocStrore.attr("adhoc", false);
			  	 this.scope.attr("showPBR", true);
			 }

		},
         "{AmountStore} change": function() {
         		var totalAmount = 0;
  	 			this.scope.attr("AmountStore").each(function(val, key){
  	 				if(val == ""){
  	 					val =0;
  	 				}
  	 				totalAmount += parseFloat(val);
  	 			});

  	 			if(!isNaN(totalAmount)){
  	 				this.scope.attr("totalAmountVal", totalAmount);
  	 			}
  	 			else{
  	 				this.scope.attr("totalAmountVal", "");
  	 			}
  	 			var genObj = {fromCurrency:'USD',
  	 					toCurrency:this.scope.currencyStore,fiscalPeriod:'201401',periodType:'P'};
  	 			//Fxrate.findAll(UserReq.formRequestDetails(genObj)),
  	 		/*	Fxrate.findAll(UserReq.formRequestDetails(genObj),function(data){
                  //console.log("passing params is "+JSON.stringify(data[0].attr()));
  	 			 self.scope.attr("fxrate").replace(data);
            },function(xhr){
                console.error("Error while loading: FXRATE"+xhr);
            }); */

         },
         "{paymentBundleId} change": function() {
         	//console.log(this.scope.attr());
		},
         "{paymentBundleName} change": function() {
         	//console.log(this.scope.attr());
  	     },
         ".addRow click":function(){

         	var self = this;
         	var rowindex = self.scope.attr("rowindex");
         	self.scope.attr("rowindex", rowindex + 1);

			//alert(self.scope.attr("rowindex"));
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


                   self.scope.createBreakline(self.scope.attr("rowindex"));


					},
				"#addInvSubmit click":function(){
					//$("#invoiceform").data('bootstrapValidator').validate();

				/*	if(this.scope.attr("formSuccessCount") > 1)
					{
					 this.scope.attr("formSuccessCount", 1);
					}*/
					var self = this;

					//$("#invoiceType option:selected").attr("invid");

					var invoiceValidatorObj = $("#invoiceform").data('bootstrapValidator');



					if(!self.scope.editpage)
					{

						/*Add invoice object creation start*/


                       var createInvoiceData = {};
					   createInvoiceData.invoices = [];
					  
					   var tempInvoiceData = {};
					   
					   tempInvoiceData["invoiceNumber"] = self.scope.invoicenumberStore;
					   tempInvoiceData["invoiceTypeId"] = self.scope.invoicetypeSelect
					   tempInvoiceData["serviceTypeId"] = 1; 
					   tempInvoiceData["invoiceType"] = $("#invoiceType option:selected").attr("name");
					   tempInvoiceData["entityId"] = self.scope.licensorStore;
					   tempInvoiceData["regionId"] = 2;
					   tempInvoiceData["entityName"] = $("#invoicelicensor option:selected").text();
					   tempInvoiceData["invoiceCcy"] = self.scope.currencyStore;
					   tempInvoiceData["fxRate"] = self.scope.fxrateStore;
					   tempInvoiceData["notes"] = self.scope.licnotesStore;
					   tempInvoiceData["invoiceAmount"] = self.scope.totalAmountVal;
					   tempInvoiceData["grossTotal"] = self.scope.grossTotalStore;
					   tempInvoiceData["finalInvoiceAmount"] = self.scope.grossTotalStore;
					   tempInvoiceData["periodType"] = "P";
					   tempInvoiceData["netTotal"] = self.scope.totalAmountVal;
					   tempInvoiceData["tax"] = self.scope.tax;
					  
					   tempInvoiceData["bundleId"] = $("#paymentBundleNames").val();
					   tempInvoiceData["bundleName"] = $("#paymentBundleNames").text();

					   if(typeof $("#paymentBundleNames").val() == "undefined"){
					   	 tempInvoiceData["bundleId"] = "";
					   	 tempInvoiceData["bundleName"] = $("#newPaymentBundle").val();
					   }else{
					   	 tempInvoiceData["bundleId"] = $("#paymentBundleNames").val();
					   	 tempInvoiceData["bundleName"] = $("#paymentBundleNames option:selected").text();
					   }


					   tempInvoiceData["receivedDate"] = dateFormatter($("#receiveddate input[type=text]").val(),"mm/dd/yyyy");//"06/19/2014"//self.scope.receiveddate;
					   tempInvoiceData["invoiceDate"] = dateFormatter($("#invoicedate input[type=text]").val(),"mm/dd/yyyy");//"06/19/2014"//self.scope.invoicedate;
					   tempInvoiceData["invoiceCalcDueDate"] = dateFormatter(self.scope.calduedate, "mm/dd/yyyy");
					   tempInvoiceData["invoiceDueDate"] = dateFormatter($("#invoiceduedate input[type=text]").val(),"mm/dd/yyyy"); //"06/19/2014"//self.scope.invoiceduedate;
					   tempInvoiceData["createdBy"] = "1000";  
					   
					   tempInvoiceData["comments"] = [];
					   var tempComment = {};
					   tempComment.comments = self.scope.usercommentsStore;
					   tempInvoiceData["comments"].push(tempComment);

					   
					   tempInvoiceData["invoiceDocuments"] = [];
					   var tempDocument = {};
					   tempDocument.fileName = "file.csv"; 
					   tempDocument.location = "/sample";

					   tempInvoiceData["invoiceDocuments"].push(tempDocument);

					  

					   tempInvoiceData["invoiceLines"] = [];

					   var rowNumber = 0;
					   	$("[id^=breakrow]").each(function(i){
							if(this.id !="breakrowTemplate"){
								var index = $(this).attr("rowid");
							 	console.log(index);
					   			var inputContent = "inputContent"+index;

								var tempArry = {};

								tempArry["country"] = self.scope.countryStore.attr("inputCountry"+index);
						   		tempArry["fiscalPeriod"] = self.scope.monthStore.attr("inputMonth"+index);/* this will come from period selector plugin*/
						   		tempArry["periodType"] = "P"; /* this will come from period selector plugin*/
						   		
						   		
						   		tempArry["lineAmount"] = self.scope.AmountStore.attr("amountText"+index);
						   		
						   		if(self.scope.attr("invoicetypeSelect") == "2"){

						  	 		tempArry["glAccRefId"] = self.scope.ccidGLStore.attr(inputContent);
						  	 		tempArry["adhocTypeId"] = self.scope.contentTypeStore.attr("inputContent"+index);
						  	 	//	tempArry["ccidFileName"] = "";
						  	 	}
						  	 	else{
						  	 		//tempArry["glAccRefId"] = "";
						  	 		tempArry["contentGrpId"] = self.scope.contentTypeStore.attr("inputContent"+index);
						  	 		tempArry["contentGrpName"] = $("#inputContent"+index+" option:selected").text();
						  	 	//	tempArry["ccidFileName"] = self.scope.ccidGLStore.attr(inputContent);
						  	 	}


							   		tempInvoiceData["invoiceLines"].push(tempArry);


									}
								rowNumber++;
								});
									self.scope.errorMsg.attr("errorCode", "0000");
							

									createInvoiceData.invoices.push(tempInvoiceData);


							   	 	console.log(JSON.stringify(createInvoiceData));

							   	 	Promise.all([
										      	Invoice.create(UserReq.formRequestDetails(createInvoiceData))
										     ]).then(function(values) {
									     		  

												  if(values[0]["status"]=="SUCCESS"){
			                                  		 	 var msg = "Invoice number "+self.scope.invoicenumberStore+" was saved successfully."
											             $("#invmessageDiv").html("<label class='successMessage'>"+msg+"</label>")
											             $("#invmessageDiv").show();
											             setTimeout(function(){
											                $("#invmessageDiv").hide();
											             },5000)




											             $("#invoiceform")[0].reset();
														 $("#invoiceform").data('bootstrapValidator').resetForm();
														 $("#addInvSubmit").attr("disabled", true);

														 self.scope.attr("totalAmountVal", 0);
														 self.scope.attr("tax", 0);

														self.scope.attr("AmountStore").each(function(val, key){
										  	 				self.scope.AmountStore.removeAttr(key);
										  	 			});

											          }
											          else
											          {
											          	// $("#invoiceform").data('bootstrapValidator').resetForm();
											          	var msg = "Invoice number "+self.scope.invoicenumberStore+" was not saved successfully."
											          	$("#invmessageDiv").html("<label class='errorMessage'>"+msg+"</label>");
											          	$("#invmessageDiv").show();
											          	setTimeout(function(){
											                $("#invmessageDiv").hide();
											             },5000)
											          	$("#addInvSubmit").attr("disabled", false);
											            }
											       

														 
												});




								}else{

								/* Add invoice end*/

								/*Edit invoice onject creation start*/

								console.log(invoiceValidatorObj.validate());  /*validating form on submit click*/
								
								var editInvoiceData = {};
								   editInvoiceData.invoices = [];

								   var tempEditInvoiceData = {};

								    
								   tempEditInvoiceData["invId"] = invoicemap.attr("invoiceid");
								   tempEditInvoiceData["invoiceNumber"] = self.scope.invoicenumberStore;
								   tempEditInvoiceData["invoiceTypeId"] = self.scope.invoicetypeSelect;
								   tempEditInvoiceData["invoiceType"] = $("#invoiceType option:selected").attr("name");
								   tempEditInvoiceData["entityId"] = self.scope.licensorStore;
								   tempEditInvoiceData["entityName"] = $("#invoicelicensor option:selected").text();
								   tempEditInvoiceData["invoiceCcy"] = self.scope.currencyStore;
								   tempEditInvoiceData["fxRate"] = self.scope.fxrateStore;
								   tempEditInvoiceData["notes"] = self.scope.licnotesStore;
								   tempEditInvoiceData["docsId"] = ""; //Not needed here, we have invoicedocument at 2nd level*/
								   tempEditInvoiceData["commentsId"] = ""; ///Not needed here, we have invoicedocument at 2nd level*/
								   tempEditInvoiceData["invoiceAmount"] = self.scope.totalAmountVal;
								   tempEditInvoiceData["tax"] = self.scope.tax;
								   tempEditInvoiceData["grossTotal"] = self.scope.grossTotalStore;
								   tempEditInvoiceData["userAdjAmt"] = "0"; /*not sure if its needed*/
								   
								   tempEditInvoiceData["bundleId"] = $("#paymentBundleNames").val(); //self.scope.paymentBundleId;
								   if(typeof $("#paymentBundleNames").val() == "undefined"){
								   	 tempEditInvoiceData["bundleId"] = "";
								   	 tempEditInvoiceData["bundleName"] = $("#newPaymentBundle").val();
								   }else{
								   	tempEditInvoiceData["bundleId"] = $("#paymentBundleNames").val();
								   	tempEditInvoiceData["bundleName"] = $("#paymentBundleNames option:selected").text();
								   }

								   tempEditInvoiceData["receivedDate"] = dateFormatter(self.scope.receiveddate, "mm/dd/yyyy"); //$("#receiveddate").val();//"06/19/2014",//self.scope.receiveddate;
								   tempEditInvoiceData["invoiceDate"] = dateFormatter(self.scope.invoicedate, "mm/dd/yyyy");
								   tempEditInvoiceData["invoiceCalcDueDate"] = dateFormatter(self.scope.calduedate, "mm/dd/yyyy");
								   tempEditInvoiceData["invoiceDueDate"] = dateFormatter(self.scope.invoiceduedate,"mm/dd/yyyy");

								  // console.log(self.scope.attr().invoiceContainer[0].comments.length+"test");
								  // alert("yes");


								  /*comment start*/
								   tempEditInvoiceData["comments"] = [];
								   for(var j=0;j<self.scope.attr().invoiceContainer[0].comments.length;j++){  /*old comments*/
								   		  var tempComments = {};
								   		  tempComments.comments = self.scope.attr().invoiceContainer[0].comments[j].comments;
								   		  tempComments.id = self.scope.attr().invoiceContainer[0].comments[j].id;
								   		  tempComments.createdBy = self.scope.attr().invoiceContainer[0].comments[j].createdBy;
								   		  tempComments.createdDate = dateFormatter(self.scope.attr().invoiceContainer[0].comments[j].createdDate, "mm/dd/yyyy");
								   		  tempEditInvoiceData["comments"].push(tempComments);
									}
										var tempComments = {};  /*new comments*/
										tempComments.comments = self.scope.usercommentsStore;
									   	tempComments.id = "";
									   	tempComments.createdBy = "";
									   	tempComments.createdDate = dateFormatter(self.scope.currentdate, "mm/dd/yyyy");
									   	tempEditInvoiceData["comments"].push(tempComments);
								    /*comment end*/

								   /*document start*/
								   tempEditInvoiceData["invoiceDocuments"] = [];
									
																	
								   if(self.scope.attr().invoiceContainer[0].invoiceDocuments != null){
										for(var j=0;j<self.scope.attr().invoiceContainer[0].invoiceDocuments.length;j++){   /*old documents*/
											var tempDocuments = {};  /*Data populate from upload plugin*/
											tempDocuments.fileName="file.csv";
											tempDocuments.location = "/sample";
											tempDocuments.inboundFileId = "";
											tempDocuments.status = "";
											tempDocuments.id = "";
											tempEditInvoiceData["invoiceDocuments"].push(tempDocuments);
										}
									 }	

										var tempDocuments = {};  /*new documents*/
										tempDocuments.fileName="";  /*Data populate from upload plugin*/
										tempDocuments.location = "";
										tempDocuments.inboundFileId= "";
										tempDocuments.status = "";
										tempDocuments.id = "";
										tempEditInvoiceData["invoiceDocuments"].push(tempDocuments);

								   /*document end*/
								    
								  tempEditInvoiceData["invoiceLines"] = [];
								   $("[id^=breakrow]").each(function(i){
											if(this.id !="breakrowTemplate"){
												var index = $(this).attr("rowid");
												var inputContent = "inputContent"+index;

													var tempArry = {};
													tempArry["invLineId"] = "";
													tempArry["invoiceId"] = "";
													tempArry["country"] = self.scope.countryStore.attr("inputCountry"+index);
											   		tempArry["fiscalPeriod"] = self.scope.monthStore.attr("inputMonth"+index); //"201304"; /*Data populate from period selector plugin*/
											   		tempArry["periodType"] = "P";
											   		tempArry["contentGrpId"] = self.scope.contentTypeStore.attr("inputContent"+index);
											   		tempArry["contentGrpName"] = $("#inputContent"+index+" option:selected").text();

											   		
											   		tempArry["lineAmount"] = self.scope.AmountStore.attr("amountText"+index);
											   		tempArry["lineStatus"] = "";
											   		tempArry["status"] = "";
											   		tempArry["lineType"] = "";
											   		if(self.scope.attr("invoicetypeSelect") == "2"){

											  	 		tempArry["glAccRefId"] = self.scope.ccidGLStore.attr(inputContent);
											  	 		tempArry["ccidFileName"] = "";
											  	 		
											  	 	}
											  	 	else{
											  	 		tempArry["glAccRefId"] = "";
											  	 		tempArry["ccidFileName"] = self.scope.ccidGLStore.attr(inputContent);
											  	 		
											  	 	}


												   		tempEditInvoiceData["invoiceLines"].push(tempArry);

													}
												});

										
									 $.merge(tempEditInvoiceData["invoiceLines"], self.scope.attr().DelInvoiceline); /*merging invoice line with deleted row*/

									  	
									  editInvoiceData.invoices.push(tempEditInvoiceData);



								 		console.log(JSON.stringify(editInvoiceData));

										 Promise.all([Invoice.update(UserReq.formRequestDetails(editInvoiceData))
										     ]).then(function(values) {

										     	if(values[0]["status"]=="SUCCESS"){
					                                  		 	 var msg = "Invoice number "+self.scope.invoicenumberStore+" was saved successfully."
													             $("#invmessageDiv").html("<label class='successMessage'>"+msg+"</label>")
													             $("#invmessageDiv").show();
													             setTimeout(function(){
													                $("#invmessageDiv").hide();
													             },5000)
															}
												          	else
												          	{
													          	// $("#invoiceform").data('bootstrapValidator').resetForm();
													          	var msg = "Invoice number "+self.scope.invoicenumberStore+" was not saved successfully."
													          	$("#invmessageDiv").html("<label class='errorMessage'>"+msg+"</label>");
													          	$("#invmessageDiv").show();
													          	setTimeout(function(){
													                $("#invmessageDiv").hide();
													             },5000)
												          	
												            }






											/*    self.scope.errorMsg.attr("responseText", values[0]["responseText"]);
											    $("#invoiceform").data('bootstrapValidator').resetForm();*/
										   });

														
	
								}
								/*Edit invoice end*/


				},
				"#buttonCancel click":function(){
					this.scope.appstate.attr('page','invoices');
				}


   },
  	init: function(){
   	 	var self = this;
   	 	var i = 1;
      this.scope.appstate.attr("renderGlobalSearch",false);

   	 	var genObj = {};
   	 	Promise.all([
			      	InvoiceType.findAll(UserReq.formRequestDetails(genObj)),
			     	Licensor.findAll(UserReq.formRequestDetails(genObj)),
			     	Currency.findAll(UserReq.formRequestDetails(genObj)),
			        ContentType.findAll(UserReq.formRequestDetails(genObj)),
			      	Country.findAll(UserReq.formRequestDetails(genObj)),

			      	AdhocTypes.findAll(UserReq.formRequestDetails(genObj)),
			      	GLaccounts.findAll(UserReq.formRequestDetails(genObj))

			      	//  Currency.findAll()*/
				]).then(function(values) {
		     		 self.scope.attr("invoiceTypes").replace(values[0][0]["invoiceTypes"]);
		     		 self.scope.attr("licensor").replace(values[1]);
		     		// self.scope.attr("currency").replace(values[2]);
		     		 self.scope.attr("contentType").replace(values[3]);
		     		 self.scope.attr("country").replace(values[4]);

		     		 self.scope.attr("adhocType").replace(values[5]);
		     		 self.scope.attr("glaccounts").replace(values[6]);

		     		
		     	//	 var invoiceTypetempMap = 



		     //	 self.scope.attr("invoiceTypesMap")




		     	//	 self.scope.attr("invoiceid", invoicemap.attr("invoiceid"));

		     		 if(invoicemap.attr("invoiceid")){

						//this.attr("editpage", true);

						//console.log(invoiceid+"dadajsd");

		     			var getByIDReq = {"searchRequest":{}};
		     			getByIDReq.searchRequest.ids = [invoicemap.attr("invoiceid")];

		     			console.log(JSON.stringify(getByIDReq));

						self.scope.attr("editpage", true);
						Promise.all([
				      				Invoice.findOne(UserReq.formRequestDetails(getByIDReq))
				    			]).then(function(values) {
				    				//console.log(values);
						     		 self.scope.attr("invoiceContainer").replace(values[0]["invoices"]);
						    	});
						}




		     	});


	},
  	helpers: {
          createPBRequest:function(){
                  var requestObject = {
                  mode:"Create",
                  "searchRequest":{
                      bundleSearch:{
                        region : "Europe",
                        type:"invoice"
                      }
                    },
                  "newNameRequest":{

                    "paymentBundle" : {

                      "region": "Europe",
                      "bundleDetailsGroup" : [{ 
                        "bndlLineId" : 1402, 
                        "refLineType" : "REGULAR_INV",
                        "periodType":"P"
                         }, { 
                        "bndlLineId" : 1602, 
                        "refLineType" : "REGULAR_INV",
                        "periodType":"P"
                      }],   
                      "bundleType": "REGULAR_INV"
                    }
                  }
              };
            // console.log(requestObject);
            return JSON.stringify(requestObject);
          },
			  	currentDate: function(){
			  	 	var date = new Date();
			  	 	this.attr("currentdate", (date.getMonth() + 1) + '/' + date.getDate() + '/' +  date.getFullYear());
					return this.attr("currentdate");
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
			  	 	if(!isFinite(percent))
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
			  	 	

			  	// 	console.log(this.attr("totalAmountVal"));
			  	 	var grossTotal = (parseFloat(this.attr("tax")) + parseFloat(this.attr("totalAmountVal")));
			  	 	this.attr("grossTotalStore", grossTotal);
			  	 	if(isNaN(grossTotal)){
			  	 		grossTotal = 0;
			  	 	}

			  	 	return CurrencyFormat(grossTotal);
			  	},
			  	setHeight: function(){
			  	 	var vph = $(window).height()-180;
			  	 	return 'Style="height:'+vph+'px"';
				},
				setMinHeightBreak: function(){
			  	 	//var vph = $(window).height()-650;
			  	 	var vph = 282;
			  	 	return 'Style="height:'+vph+'px;overflow-y:auto"';
				},
				calculateUSD:function(){
					//var fxrate = this.fxrate.attr();
					var fxrate = 0.75; 
					var calUSD = this.attr("totalAmountVal")*fxrate;

					if(isNaN(calUSD)){
						calUSD = 0;
					}
					
					return CurrencyFormat(calUSD);
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
				},
				netTotal:function(){
					var netTotal = this.attr("totalAmountVal");
					if(isNaN(netTotal)){
						netTotal = 0;
					}
					return CurrencyFormat(netTotal);
				}

  	 	}
});

function CurrencyFormat(number)
{
  if($.isNumeric(number)){
  	
  	var n = number.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,");
    return n;
  }else{
  	return 0;
  }
  
}

function showError(id, message){
	$('#'+id).popover({"content":message, "placement":"top"});
	$('#'+id).popover('show');
	$("#"+id+"-err").css("display", "block");
	$('#'+id).parent().addClass("has-error");
	$("#addInvSubmit").attr("disabled", true);
}

function removeError(id){
	$('#'+id).popover('destroy');
	$("#"+id+"-err").css("display", "none");
	$('#'+id).parent().removeClass("has-error");
	$("#addInvSubmit").attr("disabled", false);
}

function dateFormatter(datestring, currentformat){
	if(currentformat == "mm/dd/yyyy")
	{	
		var date = new Date(datestring);
		return  date.getFullYear()+'-'+(date.getMonth() + 1)+'-'+date.getDate();
	}
	else if(currentformat == "yyyy-mm-dd")
	{
		var date = new Date(datestring);
		return  (date.getMonth() + 1)+'/'+date.getDate()+'/'+date.getFullYear();
	}
}

function getCurrentDate(){
	var date = new Date();
	return (date.getMonth() + 1) + '/' + date.getDate() + '/' +  date.getFullYear();
}

export default page;
