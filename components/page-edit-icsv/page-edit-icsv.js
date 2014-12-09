
import Component from 'can/component/';


import datePicker from 'components/date-picker/';
import comments from 'components/multiple-comments/';
import createpb from 'components/create-pb/';

import css_bootstrapValidator from 'bootstrapValidator.css!';

import bootstrapValidator from 'bootstrapValidator';

import template from './template.stache!';
import styles from 'components/page-create-invoice/page-create-invoice.less!';

import UserReq from 'utils/request/';

import fileUpload from 'components/file-uploader/'

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
import Region from 'models/common/region/';
import stache from 'can/view/stache/';

//import Invoice from 'models/invoice/';

var mandatoryFieldAdhoc = ["invoicenumber",  "invoicedate",  "receiveddate", "amount[]", "licensor", "currency"];
var mandatoryField = ["invoicenumber",  "invoicedate",  "receiveddate", "amount[]", "inputMonth[]", "inputCountry[]", "licensor", "currency"];

fileUpload.extend({
  tag: 'editicsv-upload',
  scope: {
           fileList : new can.List()
         }
 });

var page = Component.extend({
  tag: 'page-edit-icsv',
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
  	regions:[],
  	AmountStore:{},
 	totalAmountVal:0,
  	calduedate:0,
  	tax:0,
  	taxStore:{},
  	isAdhocStrore:{"ccidGL":"CCID Document", "contentAdhoc":"Content Type"},
  	editcommentArr:[],
  	/*Form value*/
  	invoicetypeSelect:"",
  	licensorStore:{},
  	regionStore:{},
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
  	newpaymentbundlenamereq:undefined,
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
  	uploadedfileinfo:[],
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


		},
		changeTextOnInvType:function(){
			if(this.attr("invoicetypeSelect") == "2"){  /*Adhoc*/
				this.isAdhocStrore.attr("ccidGL", "GL Account");
	  	 		this.isAdhocStrore.attr("contentAdhoc", "Adhoc Type");
	  	 		this.isAdhocStrore.attr("invtype", "Adhoc");
	  	 		this.isAdhocStrore.attr("adhoc", true);
	  	 		this.attr("showPBR", true);

	  	 	 }
	  	 	 else if(this.attr("invoicetypeSelect") == "3"){
			  	 this.isAdhocStrore.attr("ccidGL", "CCID Document");
			  	 this.isAdhocStrore.attr("contentAdhoc", "Content Type");
			  	 this.isAdhocStrore.attr("invtype", "");
			  	 this.isAdhocStrore.attr("adhoc", false);
				 this.attr("showPBR", false);
			 }
			 else{
			  	 this.isAdhocStrore.attr("ccidGL", "CCID Document");
			  	 this.isAdhocStrore.attr("contentAdhoc", "Content Type");
			  	 this.isAdhocStrore.attr("invtype", "");
			  	 this.isAdhocStrore.attr("adhoc", false);
			  	 this.attr("showPBR", true);
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
			                              if(value == "" || value == "Select"){
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
						region: {
			            	 group:'.region',
			                 validators: {
			                   	callback: {
			                            message: 'Region is mandatory',
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
						

				},
			".form-control keyup": function(event){

					var self = this;

					if(event[0].id == "newPaymentBundle"){
						if(String(event[0].value).length > 100){
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

					if(self.scope.editpage){
						if(event[0].id == "usercomments"){

							if(String(event[0].value).length > 1024){

								showError(event[0].id, "Maximum 1024 characters allowed");
							}
							else{
								removeError(event[0].id);
							}
						}
				   }



				},
				 "{scope} regionStore": function(){
					  	var self = this;
						var genObj = {regionId:self.scope.attr("regionStore")};
						
						Promise.all([Licensor.findAll(UserReq.formRequestDetails(genObj))
						     ]).then(function(values) {
						     	console.log(values[0]);
							    self.scope.attr("licensor").replace(values[0]["entities"][0]);
							    var invoiceData = self.scope.attr().invoiceContainer[0];
							     self.scope.attr("licensorStore", invoiceData.entityId);
							   
						   });

						

						     
					},
					"{scope} licensorStore": function(event){
						var self = this;
						var genObj = {licensorId:self.scope.attr("licensorStore")};
						Promise.all([Currency.findAll(UserReq.formRequestDetails(genObj))
						     ]).then(function(values) {
							    self.scope.attr("currency").replace(values[0]);
							    var invoiceData = self.scope.attr().invoiceContainer[0];
							    self.scope.attr("currencyStore", invoiceData.invoiceCcy);

							    var invoicevalid = $("#invoiceform").data('bootstrapValidator').isValid();
							   
							  
				               if(!invoicevalid){
									$("#invoiceform").data('bootstrapValidator').validate();
									$("#invoiceform").data('bootstrapValidator').disableSubmitButtons(true);
									
				               	}
						   });
						},

					"{invoiceContainer} change": function() {
				 		var self = this;  

		 		var invoiceData = self.scope.attr().invoiceContainer[0];
		 		self.scope.attr("invoicenumberStore", invoiceData.invoiceNumber);
		 		self.scope.attr("invoicetypeSelect", invoiceData.invoiceTypeId);
		 		
		 		self.scope.attr("regionStore", invoiceData.regionId);
		 		
		 		self.scope.attr("fxrateStore", invoiceData.fxRate);
		 		self.scope.attr("licnotesStore", invoiceData.notes);
		 		self.scope.attr("createDateStore", invoiceData.invoiceDate);
		 		self.scope.attr("receiveddate", dateFormatter(invoiceData.receivedDate,"yyyy-mm-dd"));
		 		self.scope.attr("invoicedate", dateFormatter(invoiceData.invoiceDate,"yyyy-mm-dd"));
		 		self.scope.attr("invoiceduedate", dateFormatter(invoiceData.invoiceDueDate,"yyyy-mm-dd"));
		 		self.scope.attr("calduedate", dateFormatter(invoiceData.invoiceCalcDueDate,"yyyy-mm-dd"));
		 		console.log(invoiceData.invoiceCalcDueDate);

		 		self.scope.attr("tax", invoiceData.tax);
		 		
		 		self.scope.attr("usercommentsStore", invoiceData.comments[0].comments);


		 		

		 		self.scope.changeTextOnInvType();

         		var $template = $('#breakrowTemplate');

         		for(var i=0;i<invoiceData.invoiceLines.length;i++){
					
         				console.log(invoiceData.invoiceLines);

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
                              
                               if(self.scope.attr("invoicetypeSelect") == "2"){
                               		 $("#breakrow"+rowindex+" #inputContent").attr("id","inputContent"+rowindex).val(invoiceData.invoiceLines[i].adhocTypeId);
                               		self.scope.contentTypeStore.attr("inputContent"+rowindex, invoiceData.invoiceLines[i].adhocTypeId);


						 		}
						 		else
						 		{
						 			 $("#breakrow"+rowindex+" #inputContent").attr("id","inputContent"+rowindex).val(invoiceData.invoiceLines[i].contentGrpId);
						 			self.scope.contentTypeStore.attr("inputContent"+rowindex, invoiceData.invoiceLines[i].contentGrpId);
						 		}

                               $("#breakrow"+rowindex+" #inputMonth").attr("id","inputMonth"+rowindex).val(invoiceData.invoiceLines[i].fiscalPeriod);
                               self.scope.monthStore.attr("inputMonth"+rowindex, invoiceData.invoiceLines[i].fiscalPeriod);
                              // $("#breakrow"+rowindex+" #inputYear").attr("id","inputYear"+rowindex);
                               $("#breakrow"+rowindex+" #inputCountry").attr("id","inputCountry"+rowindex).val(invoiceData.invoiceLines[i].country);
                                  self.scope.countryStore.attr("inputCountry"+rowindex, invoiceData.invoiceLines[i].country);

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

			self.scope.changeTextOnInvType();

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
  	 		

         },
         
  	     "#icsv-edit-invoice #paymentBundleNames change": function(){
	          var self = this;
	          var pbval = $("#icsv-edit-invoice #paymentBundleNames").val();
	          console.log("val djsi is "+ pbval);
	          if(pbval=="createB"){
	              
	              var regId = self.scope.appstate.attr('region');


	              var newBundleNameRequest = {"paymentBundle":{}};
	              var bundleRequest = {};

	              bundleRequest["region"] = regId['value'];
	              bundleRequest["periodFrom"] = "201303";
	              bundleRequest["periodTo"] = "201304";
	             
	              bundleRequest["bundleType"] ="REGULAR_INV";

	              newBundleNameRequest["paymentBundle"] = bundleRequest;
	              console.log("New Bundle name request is "+JSON.stringify(newBundleNameRequest));
	              self.scope.attr('newpaymentbundlenamereq', JSON.stringify(newBundleNameRequest));
	          } else {
	            self.scope.attr('newpaymentbundlenamereq', "undefined");
	          }
	      },
         ".addRow click":function(){

         	var self = this;
         	var rowindex = self.scope.attr("rowindex");
         	self.scope.attr("rowindex", rowindex + 1);
			self.scope.createBreakline(self.scope.attr("rowindex"));
		},
		
		"#addInvSubmit click":function(){

					 $("#invoiceform").data('bootstrapValidator').resetForm();
					
							   $("#invoiceform").data('bootstrapValidator').validate();
							  
				               if($("#invoiceform").data('bootstrapValidator').getInvalidFields().length > 0){
									
									$("#invoiceform").data('bootstrapValidator').disableSubmitButtons(true);
									
						}
				        else
						{
							  var self = this;
						
							  var editInvoiceCSVData = {};
							   editInvoiceCSVData.serviceTypeId = "";
							   editInvoiceCSVData.invoiceNumber = self.scope.invoicenumberStore;
							   editInvoiceCSVData.invoiceTypeId = self.scope.invoicetypeSelect;
							   editInvoiceCSVData.regionId = self.scope.regionStore;
							   editInvoiceCSVData.entityId = self.scope.licensorStore;
							   editInvoiceCSVData.entityName = $("#invoicelicensor option:selected").text();
							   editInvoiceCSVData.invoiceCcy = self.scope.currencyStore;
							   editInvoiceCSVData.fxRate = self.scope.fxrateStore;
							   editInvoiceCSVData.notes = self.scope.licnotesStore;
							   editInvoiceCSVData.invoiceAmount = self.scope.totalAmountVal;
							   editInvoiceCSVData.tax = self.scope.tax;
							   editInvoiceCSVData.grossTotal = self.scope.grossTotalStore;
							   editInvoiceCSVData.receivedDate = $("#receiveddate input[type=text]").val();
							   editInvoiceCSVData.invoiceDate = $("#invoicedate input[type=text]").val();
							   editInvoiceCSVData.invoiceCalculatedDueDate = self.scope.calduedate;
							   editInvoiceCSVData.invoiceDueDate = $("#invoiceduedate input[type=text]").val();
							   console.log(self.scope.invoiceduedate);
							   editInvoiceCSVData.comments = [];
							 
									var tempComments = {};
							   		  tempComments.comments = self.scope.usercommentsStore;
							   		  tempComments.createdBy = "";
							   		  tempComments.createdDate = getCurrentDate();
							   		  editInvoiceCSVData.comments.push(tempComments);
								
									
							    /*comment end*/

							     /*document start*/

							    
							    editInvoiceCSVData.invoiceDocuments = [];
								for(var j=0;j<self.scope.attr().invoiceContainer[0].invoiceDocuments.length;j++){   /*old documents*/
									var tempDocuments = {};
									tempDocuments.fileName=self.scope.attr().invoiceContainer[0].invoiceDocuments[j].fileName;
									tempDocuments.location = self.scope.attr().invoiceContainer[0].invoiceDocuments[j].location;
									
									editInvoiceCSVData.invoiceDocuments.push(tempDocuments);
								}

									

									for(var i =0; i < self.scope.uploadedfileinfo.length; i++){
          								var tempDocuments = {};
					   						tempDocuments.fileName = self.scope.uploadedfileinfo[i].attr("filename"); 
					   						tempDocuments.location = self.scope.uploadedfileinfo[i].attr("filepath");
					   						editInvoiceCSVData.invoiceDocuments.push(tempDocuments);
					   				}
									
									//if(tempDocuments.filename)
									

							   /*document end*/

							   editInvoiceCSVData.invoiceLines = [];

							   var rowNumber = 0;
						   	   $("[id^=breakrow]").each(function(i){
									if(this.id !="breakrowTemplate"){
										var index = $(this).attr("rowid");
									 	console.log(index);
							   			var inputContent = "inputContent"+index;

										var tempArry = {};

										tempArry["country"] = self.scope.countryStore.attr("inputCountry"+index);
										console.log(self.scope.countryStore.attr("inputCountry"+index));
								   		tempArry["fiscalPeriod"] = self.scope.monthStore.attr("inputMonth"+index);
								   		tempArry["periodType"] = "P";
								   		tempArry["contentGrpId"] = self.scope.contentTypeStore.attr("inputContent"+index);
								   		tempArry["contentGrpName"] = $("#inputContent"+index+" option:selected").text();
								   		tempArry["lineAmount"] = self.scope.AmountStore.attr("amountText"+index);
								   		tempArry["adhocTypeId"] = "";
								   		if(self.scope.attr("invoicetypeSelect") == "2"){

								  	 		tempArry["glAccount"] = self.scope.ccidGLStore.attr(inputContent);
								  	 		tempArry["ccidName"] = "";
								  	 	}
								  	 	else{
								  	 		tempArry["glAccount"] = "";
								  	 		tempArry["ccidName"] = self.scope.ccidGLStore.attr(inputContent);
								  	 	}

								  	 	

								  	 	tempArry["errors"] = [];

								  	 	 var tempErrLine = {};
										  tempErrLine["status"] = "rwerqr";
										  tempErrLine["errorMap"] = [];
										  var tempErrMapLine = {};
										  tempErrLine["errorMap"].push(tempErrMapLine);

										  tempArry["errors"].push(tempErrLine);


									   		editInvoiceCSVData.invoiceLines.push(tempArry);


											}
										rowNumber++;
									});


								  editInvoiceCSVData.errors = [];
								  
								  var tempErr = {};
								  tempErr["status"] = "rwerqr";
								  tempErr["errorMap"] = [];
								  var tempErrMap = {};
								 
								  tempErr["errorMap"].push(tempErrMap);


								  editInvoiceCSVData.errors.push(tempErr);


								 
								  

								  var selIndex = self.scope.invoiceselectIndex
								  icsvmap.invoiceData.invoices[selIndex].attr(editInvoiceCSVData);
								 

								  var tempInvMap = icsvmap.invoiceData.invoices[selIndex].attr();

								  for(var key in tempInvMap.errors[0].errorMap[0]){  /*Invoice error*/
			     							console.log(tempInvMap.errors[0].errorMap[0][key]);
			     							icsvmap.invoiceData.invoices[selIndex].errors[0].errorMap[0].attr(key, " ");
										}

						          for(var j =0; j < tempInvMap.invoiceLines.length; j++){
						                for(var key in tempInvMap.invoiceLines[j].errors[0].errorMap[0]){  /*Invoiceline error*/
						                      console.log(tempInvMap.invoiceLines[j].errors[0].errorMap[0][key]);
						                      icsvmap.invoiceData.invoices[selIndex].invoiceLines[j].errors[0].errorMap[0].attr(key, " ");
						                 }
						          }


					 				icsvmap.attr("showediticsv", false);
							}
					 return false;
				},
				"#icsvEditCancel click":function(){
				   $('.popover').popover('destroy');
					 setTimeout(function(){
                          icsvmap.attr("showediticsv", false);
                      },500);
					 
					 
				}


   },
  	init: function(){
  		$('.popover').popover('destroy');
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
			      	GLaccounts.findAll(UserReq.formRequestDetails(genObj)),
			      	Region.findAll(UserReq.formRequestDetails(genObj))

			      	
				]).then(function(values) {
		     		 self.scope.attr("invoiceTypes").replace(values[0][0]["invoiceTypes"]);
		     		
		     		 self.scope.attr("contentType").replace(values[3].contentTypes);
		     		 console.log(self.scope.attr("contentType"));
		     		 self.scope.attr("country").replace(values[4]);

		     		 self.scope.attr("adhocType").replace(values[5]);
		     		 self.scope.attr("glaccounts").replace(values[6]);
		     		 self.scope.attr("regions").replace(values[7]);

		     		
		     	     /*Getting data from icsv map*/

		     	     for(var i = 0; i < icsvmap.attr().invoiceData.invoices.length; i++){
							if(icsvmap.attr().invoiceData.invoices[i].invoiceNumber == icsvmap.attr().invoiceid){
								console.log(icsvmap.attr().invoiceData.invoices[i]);
								self.scope.attr("editpage", true);
								self.scope.attr("invoiceContainer").replace(icsvmap.attr().invoiceData.invoices[i]);
								self.scope.attr("invoiceselectIndex", i);
							}
						} 



		     	});


	},
  	helpers: {
          createPBRequest: function(){
	          var bundleNamesRequest = {"bundleSearch":{}};
	          console.log("fsdfsdfsdf "+JSON.stringify(this.attr('appstate')));
	          var serTypeId = this.appstate.attr('storeType');
	          var regId = this.appstate.attr('region');
			  if(typeof(serTypeId)!="undefined")
	            bundleNamesRequest.bundleSearch["serviceTypeId"] = serTypeId['id'];

	          if(typeof(regId)=="undefined")
	            bundleNamesRequest.bundleSearch["region"] = "";
	          else
	            bundleNamesRequest.bundleSearch["region"] = regId['value'];
	            
	            bundleNamesRequest.bundleSearch["type"] = "invoice";
	          
				return JSON.stringify(bundleNamesRequest);
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
			  	 	}
			  	 	else{
			  	 		this.isAdhocStrore.attr("ccidGL", "CCID Document");
			  	 		return this.isAdhocStrore;
			  	 		
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
			  	 	
			  	 	var vph = 282;
			  	 	return 'Style="height:'+vph+'px;overflow-y:auto"';
				},
				calculateUSD:function(){
					
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
	if(datestring != "")
		{	
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
}

function getCurrentDate(){
	var date = new Date();
	return (date.getMonth() + 1) + '/' + date.getDate() + '/' +  date.getFullYear();
}

export default page;
