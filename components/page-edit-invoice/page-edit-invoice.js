import Component from 'can/component/';

import view from 'can/view/';
import stache from 'can/view/stache/';
import datePicker from 'components/date-picker/';
import comments from 'components/multiple-comments/';
import createpb from 'components/create-pb/';

import css_bootstrapValidator from 'bootstrapValidator.css!';

import bootstrapValidator from 'bootstrapValidator';

import template from './template.stache!';
import styles from './page-edit-invoice.less!';

import UserReq from 'utils/request/';

import fileUpload from 'components/file-uploader/';
import periodCalendar from 'components/period-calendar/';

import invoicemap from 'models/sharedMap/invoice';
import InvoiceType from 'models/common/invoice-type/';
import ContentType from 'models/common/content-type/';
import Licensor from 'models/common/licensor/';
import Currency from 'models/common/currency/';
import Country from 'models/common/country/';
import Invoice from 'models/invoice/';
import Fxrate from 'models/common/fxrate/';

import CalDueDate from 'models/common/calinvoiceduedate/';
import AdhocTypes from 'models/common/adhoc-types/';
import GLaccounts from 'models/glaccounts/';
import Region from 'models/common/region/';
import stache from 'can/view/stache/';
import moment from 'moment';
import periodWidgetHelper from 'utils/periodWidgetHelpers';

//import Invoice from 'models/invoice/';

var mandatoryFieldAdhoc = ["invoicenumber",  "invoicedate", "invoiceduedate", "receiveddate", "amount[]", "licensor", "currency"];
var mandatoryField = ["invoicenumber",  "invoicedate", "invoiceduedate", "receiveddate", "amount[]", "inputMonth[]", "inputCountry[]", "licensor", "currency"];

fileUpload.extend({
  tag: 'rn-file-uploader',
  scope: {
           fileList : new can.List()
         }
 });

var page = Component.extend({
  tag: 'page-edit-invoice',
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
  	contentTypeFilter:[],
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
  	licensorStore:"",
  	currencyStore:"",
  	regionStore:"",
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
	newpaymentbundlenamereq:undefined,
	//bundleNamesRequest:{"bundleSearch":{}},
  	errorMsg:{},
  	errorStatus:{},
  	invoiceContainer:[],
  	showPBR:true,
  	DelInvoiceline:[],
  	currentdate:"",
    invoiceId:"",
  	editpage:false,
  	formSuccessCount:1,
  	uploadedFileInfo:[],
  	periodType:"",
  	ajaxRequestStatus:{},
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
            $clone  = $template.clone().removeClass('hide').removeAttr('id').attr("id","breakrow"+rowindex).attr("rowid", rowindex).insertBefore($template);
            $("#breakrow"+rowindex+" .amountText").attr("id","amountText"+rowindex).val(" ");
            $("#breakrow"+rowindex+" #inputContent").attr("id","inputContent"+rowindex);
            $("#breakrow"+rowindex+" #inputMonth").attr("id","inputMonth"+rowindex).parent().append(stache('<period-calendar></period-calendar>'));
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
		},
		createPBRequest: function(){
	          	var bundleNamesRequest = {"bundleSearch":{}};
	          	var serTypeId = $("#invoiceType option:selected").attr("name");
	          	var regId = this.regionStore;
	          
			  	if(typeof(serTypeId)!="undefined")
	            	bundleNamesRequest.bundleSearch["type"] = serTypeId;
				
				if(typeof(regId)=="undefined")
	            	bundleNamesRequest.bundleSearch["regionId"] = "";
	          	else
	            	bundleNamesRequest.bundleSearch["regionId"] = regId;
	            
	           // bundleNamesRequest.bundleSearch["type"] = "invoice";
	          console.log(bundleNamesRequest);
	          this.attr("bundleNamesRequest", JSON.stringify(bundleNamesRequest));

				return JSON.stringify(bundleNamesRequest);
       		}
 },
  events: {
    	"inserted": function(){
          	var self = this;
			this.scope.isRequired(); /*For breakdown required field*/
			$('#invoiceform').on('init.form.bv', function(e, data) {
			    data.bv.disableSubmitButtons(true);
					}).bootstrapValidator({
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
			                	notEmpty: {
			                        message: 'Invoice due date is mandatory'
			                    },
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
		        						 
		        						 if(mandatoryField[i] == "receiveddate"){
		        						 	$('#invoiceform').bootstrapValidator('revalidateField', 'receiveddate'); /*revalidating this field. It initialized with currentdate*/
		        						 }
		        						 break;
		        					}
		        					
		        				}
	        				}
	        				if(self.scope.editpage){
		        				if(!data.bv.isValid()){
		        					data.bv.disableSubmitButtons(true);
								}

								
							 // if(mandatoryField == "invoicedate"){
    				// 		 	$('#invoiceform').bootstrapValidator('revalidateField', 'invoicedate');
    				// 		 }
    				// 		 if(mandatoryField == "invoiceduedate"){
    				// 		 	$('#invoiceform').bootstrapValidator('revalidateField', 'invoiceduedate'); /*revalidating this field. It initialized with currentdate*/
    				// 		 }
    				// 		 var fieldsToBeValidated =['invoicedate','invoiceduedate'];
    				// 		 // if(data.bv.isValidField('invoicedate')){
    				// 		 // 	alert('valid');
    				// 		 // }
    				// 		 for(var i =0; i<=fieldsToBeValidated.length ; i++){
								// 	if(!data.bv.isValidField(fieldsToBeValidated[i])){
								// 		data.bv.disableSubmitButtons(true);
								// 	}else{
								// 		data.bv.disableSubmitButtons(false);
								// 	}
								// }
								
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

				/*	$('#invoicedate').on('dp.change dp.show', function (e) {
		            	$('#invoiceform').bootstrapValidator('revalidateField', 'invoicedate');
		            	alert("yes");

		        	});*/


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
				".form-control change":function(event){
					var self = this;
					if(($("#invoicedate input[type=text]").val() != "") &&  (self.scope.licensorStore != "") && ($("#inputCountry0").val() != "")){
					var genObj = {entityId:self.scope.licensorStore, invoiceDate:Date.parse($("#invoicedate input[type=text]").val()), countryId:$("#inputCountry0").val()};
					CalDueDate.findOne(UserReq.formRequestDetails(genObj),function(data){
                  		//console.log(data.calInvoiceDueDate);
                  		if(data.status == 'SUCCESS'){
                  			if(data.calInvoiceDueDate != null && data.calInvoiceDueDate != undefined){
                  				self.scope.attr("calduedate", getDateToDisplay(data.calInvoiceDueDate));
                  			}
                  		}else if(data.status == 'FAILURE'){
                  			$("#invmessageDiv").html("<label class='errorMessage'>"+data["responseText"]+"</label>")
							$("#invmessageDiv").show();
				            setTimeout(function(){
				                $("#invmessageDiv").hide();
				             },5000)
                  			}
		                },function(xhr){
		                /*Error condition*/
		           		 });  
					}
				},
				"#invoicedate dp.change":function(event){ /*need to repeat service call, as no way to capture date change event together with form control event*/
					var self = this;
					if(($("#invoicedate input[type=text]").val() != "") &&  (self.scope.licensorStore != "") && ($("#inputCountry0").val() != "")){
					var genObj = {entityId:self.scope.licensorStore, invoiceDate:Date.parse($("#invoicedate input[type=text]").val()), countryId:$("#inputCountry0").val()};
					CalDueDate.findOne(UserReq.formRequestDetails(genObj),function(data){
						//console.log("Date 1---"+moment($("#invoicedate input[type=text]").val()).unix());
						//console.log("Date 2----"+Date.parse($("#invoicedate input[type=text]").val()));
                  		if(data.status == 'SUCCESS'){
                  			if(data.calInvoiceDueDate != null && data.calInvoiceDueDate != undefined){
                  				self.scope.attr("calduedate", getDateToDisplay(data.calInvoiceDueDate));
                  			}
                  		}else if(data.status == 'FAILURE'){
                  			$("#invmessageDiv").html("<label class='errorMessage'>"+data["responseText"]+"</label>")
							$("#invmessageDiv").show();
				            setTimeout(function(){
				                $("#invmessageDiv").hide();
				             },5000)
                  			}
		                },function(xhr){
		                /*Error condition*/
		           		 });  
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
         	this.scope.monthStore.attr(event[0].id, event[0].value);
         	
		},
		".inputMonth click": function(event){
         	updatePeriodCalender(event[0].id);
		},
		".inputMonth blur": function(event){
         	$('#invoiceform').bootstrapValidator('revalidateField', 'inputMonth[]');
        },
	    ".inputCountry change": function(event){
         	this.scope.countryStore.attr(event[0].id, event[0].value)
         	console.log(this.scope.countryStore.attr());
		},
		".ccidGL change": function(event){
         	this.scope.ccidGLStore.attr(event[0].id, event[0].value)
         	console.log(this.scope.ccidGLStore);
		},
		"#invoicelicensor change": function(event){
			var genObj = {licensorId:event[0].value};
			var self = this;
			Promise.all([Currency.findAll(UserReq.formRequestDetails(genObj))
			     ]).then(function(values) {
				    self.scope.attr("currency").replace(values[0]);
			   });
		},
		"{scope} regionStore": function(){
		  	var self = this;
			var genObj = {regionId:self.scope.attr("regionStore")};
			Promise.all([Licensor.findAll(UserReq.formRequestDetails(genObj))
			     ]).then(function(values) {
		     			console.log(values[0]);
			    		self.scope.attr("licensor").replace(values[0]["entities"][0]);
			    		if(self.scope.editpage){
				    		var invoiceData = self.scope.attr().invoiceContainer[0];
				    		self.scope.attr("licensorStore", invoiceData.entityId);
				    		self.scope.ajaxRequestStatus.attr("licensorLoaded", true);
			    		}
			    });

			  
		         
			self.scope.createPBRequest();     
			   
		},
		"{scope} licensorStore": function(event){
			var self = this;
			var genObj = {licensorId:self.scope.attr("licensorStore")};
			Promise.all([Currency.findAll(UserReq.formRequestDetails(genObj))
			     ]).then(function(values) {
				    self.scope.attr("currency").replace(values[0]);
				    if(self.scope.editpage){
					    var invoiceData = self.scope.attr().invoiceContainer[0];
					    self.scope.attr("currencyStore", invoiceData.invoiceCcy);
					    self.scope.ajaxRequestStatus.attr("currencyStore", true);
					}
			});
		},
		"{ajaxRequestStatus} change":function(event){
				var self = this;
				if((self.scope.ajaxRequestStatus.currencyStore == true) && (self.scope.ajaxRequestStatus.licensorLoaded == true) && (self.scope.ajaxRequestStatus.countryLoaded == true)){
						var invoicevalid = $("#invoiceform").data('bootstrapValidator').isValid();
						if(!invoicevalid){
							$("#invoiceform").data('bootstrapValidator').validate();
							$("#invoiceform").data('bootstrapValidator').disableSubmitButtons(true);
						}
				}
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
  	 			//Fxrate.findAll(UserReq.formRequestDetails(genObj)),
  	 		/*	Fxrate.findAll(UserReq.formRequestDetails(genObj),function(data){
                  //console.log("passing params is "+JSON.stringify(data[0].attr()));
  	 			 self.scope.attr("fxrate").replace(data);
            },function(xhr){
                console.error("Error while loading: FXRATE"+xhr);
            }); */

         },
         "{invoiceContainer} change": function() {
						var self = this;	
						
				 		  /*This block is used to update data in view */
						
						var invoiceData = self.scope.attr().invoiceContainer[0];
				 		self.scope.attr("invoicenumberStore", invoiceData.invoiceNumber);
				 		self.scope.attr("invoicetypeSelect", invoiceData.invoiceTypeId);
				 		self.scope.attr("regionStore", invoiceData.regionId);
						self.scope.attr("fxrateStore", invoiceData.fxRate);
				 		self.scope.attr("licnotesStore", invoiceData.notes);
				 		self.scope.attr("invoicedate", moment(invoiceData.invoiceDate).format("MM/DD/YYYY"));
				 		self.scope.attr("receiveddate", moment(invoiceData.receivedDate).format("MM/DD/YYYY"));
				 		self.scope.attr("invoiceduedate", moment(invoiceData.invoiceDueDate).format("MM/DD/YYYY"));
				 		self.scope.attr("calduedate",moment(invoiceData.invoiceCalcDueDate).format("MM/DD/YYYY"));
						self.scope.attr("tax", invoiceData.tax);
						self.scope.attr("invoiceId",invoiceData.invId);
				 	
						var tempcommentObj = invoiceData.comments;
		                $('#multipleCommentsInv').html(stache('<multiple-comments divid="usercommentsdivinv" options="{tempcommentObj}" divheight="100" isreadOnly="n"></multiple-comments>')({tempcommentObj}));
		                self.scope.changeTextOnInvType();

		                var genObj = {regionId:self.scope.attr("regionStore")};

		                Country.findAll(UserReq.formRequestDetails(genObj),function(data){
		                  		self.scope.attr("country").replace(data);
		                  		self.scope.ajaxRequestStatus.attr("countryLoaded", true);
								},function(xhr){
				                /*Error condition*/
				        }).then(function(){

				        	var $template = $('#breakrowTemplate');

			         		for(var i=0;i<invoiceData.invoiceLines.length;i++){
								self.scope.attr("rowindex",i)
								var rowindex = self.scope.attr("rowindex");

			                	var $clone = $template.clone().removeClass('hide').removeAttr('id').attr("id","breakrow"+rowindex).attr("rowid", rowindex).insertBefore($template);

			                	$("#breakrow"+rowindex).attr("data-invLineId",invoiceData.invoiceLines[i].invLineId);

			                	$("#breakrow"+rowindex).attr("data-lineStatus",invoiceData.invoiceLines[i].lineStatus);
			                	
			                                
								$("#breakrow"+rowindex+" .amountText").attr("id","amountText"+rowindex).val(invoiceData.invoiceLines[i].lineAmount);
		                       	self.scope.AmountStore.attr("amountText"+rowindex, invoiceData.invoiceLines[i].lineAmount);
		                       	$("#breakrow"+rowindex+" #inputContent").attr("id","inputContent"+rowindex).val(invoiceData.invoiceLines[i].contentGrpId);
		                       	if(self.scope.attr("invoicetypeSelect") == "2"){
		                       		self.scope.contentTypeStore.attr("inputContent"+rowindex, invoiceData.invoiceLines[i].adhocTypeId);
								}
						 		else
						 		{
									self.scope.contentTypeStore.attr("inputContent"+rowindex, invoiceData.invoiceLines[i].contentGrpId);
						 		}
						 		var displayPeriod = periodWidgetHelper.getDisplayPeriod(invoiceData.invoiceLines[i].fiscalPeriod+'',invoiceData.invoiceLines[i].periodType);

		                 		$("#breakrow"+rowindex+" #inputMonth").attr("id","inputMonth"+rowindex).val(displayPeriod).parent().append(stache('<period-calendar></period-calendar>'));
		                       	//$("#breakrow"+rowindex+" #inputMonth").attr("id","inputMonth"+rowindex).parent().append(stache('<period-calendar></period-calendar>'));
		                        //console.log($("#breakrow"+rowindex+" #inputMonth").attr("id","inputMonth"+rowindex).parent());
		                       	self.scope.monthStore.attr("inputMonth"+rowindex, displayPeriod);
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

									
									self.scope.DelInvoiceline.push(tempDelObj);
									$(this).closest("tr").remove();
						           	self.scope.AmountStore.removeAttr("amountText"+rowindex);
						           	self.scope.contentTypeStore.removeAttr("inputContent"+rowindex);
								});

							});
						/*Breakdown end*/
		},

       	".addRow click":function(){

         	var self = this;
         	var rowindex = self.scope.attr("rowindex");
         	self.scope.attr("rowindex", rowindex + 1);
			self.scope.createBreakline(self.scope.attr("rowindex"));
		},

		"#invoiceform #paymentBundleNames change": function(){
	          var self = this;
	          var pbval = $("#invoiceform #paymentBundleNames").val();
	          if(pbval=="createB"){
	              
	              var regId = self.scope.regionStore;
				  var newBundleNameRequest = {"paymentBundle":{}};
	              var bundleRequest = {};

	              bundleRequest["regionId"] = regId;

	              bundleRequest["bundleType"] = $("#invoiceType option:selected").attr("name");

	              newBundleNameRequest["paymentBundle"] = bundleRequest;
	              self.scope.attr('newpaymentbundlenamereq', JSON.stringify(newBundleNameRequest));
	          } else {
	            self.scope.attr('newpaymentbundlenamereq', "undefined");
	          }
	      },
		
		"#addInvSubmit click":function(){
					var self = this;
					var invoiceValidatorObj = $("#invoiceform").data('bootstrapValidator');
					
					/*Edit invoice onject creation start*/
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
				    tempEditInvoiceData["docsId"] = ""; 
				    tempEditInvoiceData["commentsId"] = ""; 
				    tempEditInvoiceData["invoiceAmount"] = self.scope.totalAmountVal;
				    tempEditInvoiceData["tax"] = self.scope.tax;
				    tempEditInvoiceData["grossTotal"] = self.scope.grossTotalStore;
				   // tempEditInvoiceData["userAdjAmt"] = "0"; 
				   
				   // tempEditInvoiceData["bundleId"] = $("#paymentBundleNames").val(); 
				    if(typeof $("#paymentBundleNames").val() == "undefined"){
				   	    tempEditInvoiceData["bundleId"] = "";
				   	    tempEditInvoiceData["bundleName"] = $("#newPaymentBundle").val();
					}else{
					 	
					 	if($("#paymentBundleNames").val() != ""){
						 	tempEditInvoiceData["bundleId"] = $("#paymentBundleNames").val();
						   	tempEditInvoiceData["bundleName"] = $("#paymentBundleNames option:selected").text();
						}
					}

				    tempEditInvoiceData["receivedDate"] = dateFormatter($("#receiveddate input[type=text]").val(),"mm/dd/yyyy");
				    tempEditInvoiceData["invoiceDate"] = dateFormatter($("#invoicedate input[type=text]").val(),"mm/dd/yyyy");
				    tempEditInvoiceData["invoiceCalcDueDate"] = dateFormatter(self.scope.calduedate, "mm/dd/yyyy");
				    tempEditInvoiceData["invoiceDueDate"] = dateFormatter($("#invoiceduedate input[type=text]").val(),"mm/dd/yyyy"); 



				   /*comment start*/
				   tempEditInvoiceData["comments"] = [];
				   for(var j=0;j<self.scope.attr().invoiceContainer[0].comments.length;j++){  /*old comments*/
			   		  	var tempComments = {};
			   		  	tempComments.comments = self.scope.attr().invoiceContainer[0].comments[j].comments;
			   		  	tempComments.id = self.scope.attr().invoiceContainer[0].comments[j].id;
			   		  	tempComments.createdBy = self.scope.attr().invoiceContainer[0].comments[j].createdBy;
			   		  	var tempComDate = self.scope.attr().invoiceContainer[0].comments[j].createdDate
			   		  	if(tempComDate != null && tempComDate != undefined){
			   		  		tempComments.createdDate = dateFormatter(getDateToDisplay(tempComDate),"mm/dd/yyyy");
			   		  	}
			   		  	tempEditInvoiceData["comments"].push(tempComments);
					}
					var tempComments = {};  /*new comments*/
					if($("#usercomments").val() != null && $("#usercomments").val() != undefined){
						tempComments.comments = $("#usercomments").val();//self.scope.usercommentsStore;
					   	tempComments.id = "";
					   	tempComments.createdBy = UserReq.formRequestDetails().prsId;
					   	tempComments.createdDate = dateFormatter(self.scope.currentdate, "mm/dd/yyyy");
					   	tempEditInvoiceData["comments"].push(tempComments);
					}
					
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

						// var tempDocuments = {};  /*new documents*/
						// tempDocuments.fileName="";  /*Data populate from upload plugin*/
						// tempDocuments.location = "";
						// tempDocuments.inboundFileId= "";
						// tempDocuments.status = "";
						// tempDocuments.id = "";
						// tempEditInvoiceData["invoiceDocuments"].push(tempDocuments);

				   /*document end*/
				    
				  	tempEditInvoiceData["invoiceLines"] = [];
				   	$("[id^=breakrow]").each(function(i){
						if(this.id !="breakrowTemplate"){
							var index = $(this).attr("rowid");
							var inputContent = "inputContent"+index;

							var tempArry = {};
							tempArry["invLineId"] = '';
							if($(this).attr('data-invLineId') != undefined){
								tempArry["invLineId"] = $(this).attr('data-invLineId');	
							}
							tempArry["lineStatus"]='';
							if($(this).attr('data-lineStatus') != undefined){
								tempArry["lineStatus"] = $(this).attr('data-lineStatus');	
							}
							tempArry["invoiceId"] = self.scope.invoiceId;
						//	tempArry["country"] = self.scope.countryStore.attr("inputCountry"+index);
					   		tempArry["fiscalPeriod"] = periodWidgetHelper.getFiscalPeriod($("#inputMonth"+index).val()); //"201304"; /*Data populate from period selector plugin*/
					   		tempArry["periodType"] = periodWidgetHelper.getPeriodType($("#inputMonth"+index).val());
					   		tempArry["country"] = $("#inputCountry"+index).val();
					   		tempArry["contentGrpId"] = self.scope.contentTypeStore.attr("inputContent"+index);
					   		tempArry["contentGrpName"] = $("#inputContent"+index+" option:selected").text();
							tempArry["lineAmount"] = self.scope.AmountStore.attr("amountText"+index);
					   		tempArry["lineType"] = "";
					   		if(self.scope.attr("invoicetypeSelect") == "2"){
					   			var ccidGL = "ccidGL"+index;
								tempArry["glAccRefId"] = self.scope.ccidGLStore.attr(ccidGL);
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
								          	if(values[0].invoices[0].errors != "undefined" && values[0].invoices[0].errors != null)
								           		{
								           			var errorMap = values[0].invoices[0].errors.errorMap;
								           			var errorStr = "";
										          	for(var key in errorMap){
										          		errorStr += errorMap[key]+", ";
										          		console.log(key);	
										          	}
										          	errorStr = errorStr.replace(/,\s*$/, "");  
										          	
										          	var msg = "Error: "+ errorStr;
								           		} else {
									          		var msg = values[0].responseText;
									          	}

												$("#invmessageDiv").html("<label class='errorMessage'>"+msg+"</label>");
										        $("#invmessageDiv").show();
										        $("#addInvSubmit").attr("disabled", false);
											}
									});
								
				/*Edit invoice end*/
							},
							"#buttonCancel click":function(){
								this.scope.appstate.attr('page','invoices');
							},
							'period-calendar onSelected': function (ele, event, val) {  
			       					this.scope.attr('periodchoosen', val);
			       					$(ele).parent().find('input[type=text]').val(this.scope.periodchoosen).trigger('change');
			       					$(ele).closest('.calendarcls').find('.box-modal').hide();
			       					$(ele).blur();
			   				},
						   '.updateperoid focus':function(el){ 
						      $(el).closest('.calendarcls').find('.box-modal').show();
						      if(el.attr("id") != "inputMonth0"){
						      	showErrorMsg(el.attr("id"))
								}
							},
						   '#inputContent0 change':function(el){  /*validation for servicetypeid*/
						   		$("[id^=breakrow]").each(function(index){  /*removing added row in break down when invoice type changes to adhoc.*/
									if((this.id !="breakrow0") && (this.id !="breakrowTemplate")){
											$("#"+this.id+' .inputContent').val("");
											
									}	
						  		});

						  		this.scope.contentTypeFilter.replace(this.scope.contentType);
							},
						   '#inputMonth0 change':function(el){ /*validation for period*/
						  		var self = this;
						  		self.scope.attr("periodType", $(el).val().charAt(0));
						  		
						  	}
						  	
						},
					  	init: function(){
					   	 	var self = this;
					   	 	var i = 1;
					      this.scope.appstate.attr("renderGlobalSearch",false);

					   	 	var genObj = {};
					   	 	Promise.all([
									      	InvoiceType.findAll(UserReq.formRequestDetails(genObj)),
									     	ContentType.findAll(UserReq.formRequestDetails(genObj)),
									      	//Country.findAll(UserReq.formRequestDetails(genObj)),
											AdhocTypes.findAll(UserReq.formRequestDetails(genObj)),
									      	GLaccounts.findAll(UserReq.formRequestDetails(genObj)),
									      	Region.findAll(UserReq.formRequestDetails(genObj))
										]).then(function(values) {
							     		 	self.scope.attr("invoiceTypes").replace(values[0]["invoiceTypes"]);
							     			self.scope.attr("contentType").replace(values[1].contentTypes);
							     		 	//self.scope.attr("country").replace(values[2]);
											self.scope.attr("adhocType").replace(values[2]);
							     		 	self.scope.attr("glaccounts").replace(values[3]);
							     		 	self.scope.attr("regions").replace(values[4]);

							     		 	console.log(self.scope.attr("contentType"));
							     		 	

							    			if(invoicemap.attr("invoiceid")){
												var getByIDReq = {"searchRequest":{}};
								     			getByIDReq.searchRequest.ids = [invoicemap.attr("invoiceid")];

								     			console.log(JSON.stringify(UserReq.formRequestDetails(getByIDReq)));

												self.scope.attr("editpage", true);
												
												Invoice.findOne(UserReq.formRequestDetails(getByIDReq),function(data){
								                  		 self.scope.attr("invoiceContainer").replace(data["invoices"]);

								                  		 if(data.status === "FAILURE"){
								                  		 	var msg = data.responseText;
								          					$("#invmessageDiv").html("<label class='errorMessage'>"+msg+"</label>");
								          					$("#invmessageDiv").show();
								          					$("#addInvSubmit").attr("disabled", false);
								                  		 }

								                  		},function(errmsg){
										                /*Error condition*/
										                	$("#invmessageDiv").html("<label class='errorMessage'>"+errmsg+"</label>");
								          					$("#invmessageDiv").show();
								          					$("#addInvSubmit").attr("disabled", false);
										        		});     			

												}
											});
						},
					  	helpers: {
					         		currentDate: function(){
								  	 	var date = new Date();
								  	 	this.attr("currentdate", (date.getMonth() + 1) + '/' + date.getDate() + '/' +  date.getFullYear());
										return this.attr("currentdate");

								  	},
								  	calculatedDueDate: function(){
							  			/*var date = new Date();
								  	 	date.setMonth(date.getMonth() + 1);
								  	 	var calduedate = ((date.getMonth() + 1) + '/' + date.getDate() + '/' +  date.getFullYear());*/
								  	 	var calduedate = this.attr("calduedate");
								  	 	//this.attr("calduedate", calduedate);
										return calduedate;

								  	},
								  	calculateTaxPercent: function(){
								  	 	this.attr("taxStore", this.attr("tax"));
								  	 	var percent = (this.attr("tax")/this.attr("totalAmountVal"))*100;
								  	 	if(!isFinite(percent))
								  	 	return ""
								  	 	else
								  	 	return percent.toFixed(2)+"%"; //Round to Two decimal only
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



					var updatePeriodCalender = function(elementID){

						var _root = $("input[id^='inputMonth']").not("input[id='inputMonth0']").not(':hidden').parent();


					    if (_root.length == 1) {
							disablePeriodQuarterCalendar(_root);
						}else if (_root.length > 1){
							console.log("_root updatePeriodCalender");console.log(_root);
							for (var i = _root.length - 1; i >= 0; i--) {
								disablePeriodQuarterCalendar(_root[i]);								
							}
						}
					}

					var disablePeriodQuarterCalendar = function(_root){

						console.log("_root disablePeriodQuarterCalendar");console.log(_root);
						var _root = $(_root);
						_root.find('.period li a').removeClass('disabled period-active');

						if ($('#inputMonth0').parent().find('.period li:first-child').find('a').hasClass('period-active')) {
					        _root.find('.q1 li').not(":first").find('a').addClass('disabled');
					        _root.find('.q2 li').not(":first").find('a').addClass('disabled');
					        _root.find('.q3 li').not(":first").find('a').addClass('disabled');
					        _root.find('.q4 li').not(":first").find('a').addClass('disabled');
					      } else {
					        _root.find('.period li:first-child').find('a').addClass('disabled');
					      }
					}

					var getDateToDisplay=function(longDate){
						var calculateDueDate = new Date(longDate);
						return calculateDueDate.getMonth()+1 + "/" + calculateDueDate.getDate() + "/" + calculateDueDate.getFullYear();
					}

export default page;
