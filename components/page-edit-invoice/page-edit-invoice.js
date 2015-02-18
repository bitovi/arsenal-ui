import Component from 'can/component/';

import view from 'can/view/';
//import stache from 'can/view/stache/';
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
import ContentType from 'models/common/invoice-content-type/';
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
import commonUtils from 'utils/commonUtils';

//import Invoice from 'models/invoice/';

var mandatoryFieldAdhoc = ["invoicenumber",  "invoicedate", "invoiceduedate", "receiveddate", "amount[]", "inputMonth[]", "licensor", "currency", "inputContent[]", "ccidGLtxt[]"];
var mandatoryFieldCA = ["invoicenumber",  "invoicedate", "invoiceduedate", "receiveddate", "amount[]", "inputMonth[]", "inputCountry[]", "licensor", "currency", "inputContent[]"];
var mandatoryField = ["invoicenumber",  "invoicedate", "invoiceduedate", "receiveddate", "amount[]", "inputMonth[]", "inputCountry[]", "licensor", "currency", "inputContent[]"];

fileUpload.extend({
  tag: 'rn-file-uploader-edit',
  scope: {
      fileList : new can.List(),
      uploadedfileinfo:[],
      deletedFileInfo:[]
   },
   events:{
   	    "{uploadedfileinfo} change":function () {
            // update areFilesToBeUploaded boolean
            //Handling this using data as scope is not accessible from page-edit -invoice.
            $('rn-file-uploader-edit').data('_d_uploadedFileInfo', this.scope.uploadedfileinfo);
            // check if all files in uploadedfileinfo have a isServer flag
            // then replace fileList with uploadedfileinfo
            // this is the initial fileList setup
            this.scope.fileList.replace(this.scope.uploadedfileinfo);
   		},
       "{deletedFileInfo} change":function () {
           $('rn-file-uploader-edit').data('_d_deletedFileInfo', this.scope.deletedFileInfo);
       }
   }
});

createpb.extend({
	tag: 'create-pb-editinv',
  	scope: {
           		selectedbundle:"@",
           		paymentBundleId: ""
           },

     events:{
	     		"{scope} selectedbundle":function(){
		     		var self = this;

		    		setTimeout(function(){
		     			self.scope.attr("paymentBundleId", self.scope.attr("selectedbundle")); /*Bundle drop down are not getting populated before 2900 ms*/

		     			var isBundleId = $.isNumeric(self.scope.attr("selectedbundle"));

		     			if(isBundleId){
		     				$("create-pb-editinv #paymentBundleNames").attr("disabled", true);
		     			}
		     			else
		     			{
		     				$("create-pb-editinv #paymentBundleNames").attr("disabled", false);
		     			}
					}, 2900);

		     	}
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
  	tax:"",
  	taxStore:{},
  	isAdhocStrore:{"ccidGL":"CCID Filename", "contentAdhoc":"Content Type"},
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
  	uploadedfileinfo:[],
    deletedFileInfo:[],
  	periodType:"",
  	ajaxRequestStatus:{},
  	usdFxrateRatio:"",
  	invselectedbundle:"",
	isRequired: function(){
		if(this.attr("invoicetypeSelect") == "2"){
 						$(".breakdownCountry").removeClass("requiredBar");
 					} else {
	  	 				$(".breakdownCountry").addClass("requiredBar");
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
           	$("#breakrow"+rowindex+" #ccidGLtxt").attr("id","ccidGLtxt"+rowindex).val("");
           	if(rowindex != 0)
           	$("#breakrow"+rowindex+" .removeRow").css("display", "block");

			var servictypeid=$("#inputContent0 option:selected").attr("servicetypeid");
		   	if (typeof servictypeid !== "undefined" && self.attr("invoicetypeSelect") != '2') {
		        $('#inputContent'+rowindex +' option[ servicetypeid!='+ servictypeid + ' ]').remove();
		        $('#inputContent'+rowindex).prepend("<option value>Select</option>").val('')
		    }

			var $option = $clone.find('[name="amount[]"], [name="inputMonth[]"], [name="inputCountry[]"], [name="inputContent[]"], [name="ccidGLtxt[]"]');
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
	           // $("#addInvSubmit").attr("disabled", true);
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
			  	 this.isAdhocStrore.attr("ccidGL", "CCID Filename");
			  	 this.isAdhocStrore.attr("contentAdhoc", "Content Type");
			  	 this.isAdhocStrore.attr("invtype", "");
			  	 this.isAdhocStrore.attr("adhoc", false);
				 this.attr("showPBR", false);
			 }
			 else{
			  	 this.isAdhocStrore.attr("ccidGL", "CCID Filename");
			  	 this.isAdhocStrore.attr("contentAdhoc", "Content Type");
			  	 this.isAdhocStrore.attr("invtype", "");
			  	 this.isAdhocStrore.attr("adhoc", false);
			  	 this.attr("showPBR", true);
			}
		},
		createPBRequest: function(){
	          	var bundleNamesRequest = {"bundleSearch":{}};
	          	var serTypeId = $("#invoiceType option:selected").attr("name");
	          	var regId = this.attr("regionStore");

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
       		},
       		getFxrate:function(){
	     		var self = this;
	     		if($("#inputMonth0").val() && self.currencyStore){
					var genObj = {fromCurrency:self.currencyStore, toCurrency:'USD', fiscalPeriod:periodWidgetHelper.getFiscalPeriod($("#inputMonth0").val()) ,periodType:periodWidgetHelper.getPeriodType($("#inputMonth0").val().charAt(0))};
						Fxrate.findOne(UserReq.formRequestDetails(genObj),function(data){
						self.attr("usdFxrateRatio", data.fxRate);
						console.log(self.attr("usdFxrateRatio"));
		            },function(xhr){
		               console.log(xhr);
		            });
				}
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
			                        message: 'Invoice date is mandatory'
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
			                         		if(value != ""){
			                              	var invduedate = new Date(value);
			                              	if(self.scope.attr("calduedate")){
			                              		var calduedate = new Date(self.scope.attr("calduedate"));
			                              			if(Math.abs(invduedate.getTime()) > Math.abs(calduedate.getTime())){
														return false;
													}
			                              		}
											}
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
			                            callback: function (value, validator, $field) {
			                              if((value != "")  && (parseFloat(value) < 0)){
                                    return {
                                      valid: false,
                                      message: 'Please provide positive Fx Rate'
                                    }
  	                              }else if (value != undefined && value.length != 0){
                                    var decimal_validate_RE=/^\d{0,10}(\.\d{0,8})?$/;
                                    if(!decimal_validate_RE.test(value)){
                                      return {
                                        valid: false,
                                        message: 'Please provide Fx Rate in [##########.########] format'
                                      }
                                    }

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
                                      var inputval=value.trim();
				                              if((inputval != "")  && (parseFloat(inputval) < 0)){
				                              	return {
					                                    valid: false,
					                                    message: 'Please provide positive invoice amount'
					                                }
				                              }else if (inputval != "" && inputval != undefined && inputval.length != 0){
                                        var decimal_validate_RE=/^\d{0,10}(\.\d{0,8})?$/;
                                        if(!decimal_validate_RE.test(inputval)){
                                          return {
                                            valid: false,
                                            message: 'Please provide invoice amount in [##########.########] format'
                                          }
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
				                              if(value == "" || value == "Select" || value == null){
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
				                              if(value == "" || value == "Select" || value == null){
				                              	   return false;
				                              }
				                              return true;
				                            }
		                    		}

				                }
							},
							'ccidGLtxt[]': {
			                      validators: {
			                        callback: {

			                          callback: function (value, validator, $field) {
			                            if(value == "" || value == "Select" || value == null){
			                              return {
			                                valid: false,    // or false
			                                message: 'GL Account is mandatory'
			                              }
			                           	 }else if(!$.isNumeric(value)){
			                              return {
			                                 message: 'Please provide numeric value'
				                           }
			                            } else if(Math.ceil(parseFloat(value)) != value){
			                            	return {
			                                valid: false,    // or false
			                                message: 'Please provide long value'
			                              }
			                            }
			                            return true;
			                          }
			                        }
			                      }
		                    },
		                    'taxAmount': {
		                     group:'.taxAmountCont',
		                      validators: {
		                        callback: {

		                          callback: function (value, validator, $field) {
				                    if($.isNumeric(value)){
											if((parseFloat(value) < 0)){
												return {
					                                valid: false,    // or false
					                                message: 'Please provide positive Tax'
					                              }
											}else {
												var decimal_validate_RE = /^\d{0,10}(\.\d{0,8})?$/;
												if (!decimal_validate_RE.test(value)) {
													return {
													 	valid: false,    // or false
					                                 	message: 'Please provide Tax value in [##########.########] format'
					                            	 }
												}
											}
										}else if(value != ""){
												return {
													 	valid: false,    // or false
					                                 	message: 'Please provide numeric value for Tax'
					                            }
										}
		                            return true;
		                          }
		                        }
		                      }
		                    },
							'inputContent[]': {
				                validators: {
				                    callback: {

				                                 callback: function (value, validator, $field) {
				                              if((value == "") && (self.scope.attr("invoicetypeSelect") != "2")){
				                              	   return {
												            valid: false,    // or false
												            message: 'Content type is mandatory'
												    }
				                              }
				                              else if((value == "") && (self.scope.attr("invoicetypeSelect") == "2")){
				                              	   return {
												            valid: false,    // or false
												            message: 'Adhoc type is mandatory'
												    }
				                              }
				                              else
				                              {
				                              		var duplicateCont = false;
						                              	$(".inputContent").not(':hidden').each(function(index){   /*duplicate Content type validation*/
															if($(this).attr("id") != $field.attr("id"))
															{

																var strEl = $field.attr("id");
																var rowEl = strEl.replace(/[^0-9]/g, '');
																var inputMonthEl = "inputMonth"+rowEl;
																var inputCountryEl = "inputCountry"+rowEl;

																var strNow = $(this).attr("id");
																var rowNow = strNow.replace(/[^0-9]/g, '');
																var inputMonthNow = "inputMonth"+rowNow;
																var inputCountryNow = "inputCountry"+rowNow;

																var validMonth = (($("#"+inputMonthEl).val() != "")?($("#"+inputMonthEl).val() == $("#"+inputMonthNow).val()):false);
																var validCountry = (($("#"+inputCountryEl).val() != "")?($("#"+inputCountryEl).val() == $("#"+inputCountryNow).val()):false);


																if( ($(this).val() == $field.val()) && (validMonth ) && (validCountry) ){
																	$field.val("");
																	duplicateCont = true;

																    return false;
															    }
															}

														});

														if(duplicateCont){
															if(self.scope.attr("invoicetypeSelect") != 2)
													        {
													        	return {
															            valid: false,    // or false
															            message: 'Two invoicelines can not have same period, content type and country.'
															    }
													        }
														    else
														    {
														    	return {
															            valid: false,    // or false
															            message: 'Two invoicelines can not have same period, adhoc type and country.'
															    }
														    }

														}

												}

				                             return true;
				                            }
		                    		}
				                }
			            	},
							'inputMonth[]': {
				                validators: {
				                    callback: {
				                            //message: 'Period is mandatory',
				                            callback: function (value, validator, $field) {
				                            	if(value == ""){
				                              	   	return {
				                              	   		valid: false,
				                              	   		message: 'Period is mandatory'
				                              	   	}
				                              	}else if(value != undefined && value.length > 0){
													  var rxDatePattern = /^[P-Q]{1}\d{1,2}[FY]{2}\d{2}$/;
													  var dtArray = value.match(rxDatePattern); // is format OK?
													  var result = (dtArray == null) ? false : true;
													  return{
													  	valid:result,
													  	message: 'Invalid period'
													  }
				                              	}

												return true;
				                            }
		                    		}
				                }
			            	},
			        		'inputCountry[]': {
				                   validators: {
				                    callback: {
				                            callback: function (value, validator, $field) {
				                               if((value == "") && (self.scope.attr("invoicetypeSelect") != "2")){
				                              	   return{
				                              	   		valid: false,    // or false
												   		               message: 'Country is mandatory'
				                              	   }
				                              }
				                              else{

  				                              		var duplicateCont = false;
  						                              	$(".inputCountry").not(':hidden').each(function(index){   /*duplicate Content type validation*/
                															if($(this).attr("id") != $field.attr("id")){

                																var strEl = $field.attr("id");
                																var rowEl = strEl.replace(/[^0-9]/g, '');
                																var inputMonthEl = "inputMonth"+rowEl;
                																var inputContentEl = "inputContent"+rowEl;

                																var strNow = $(this).attr("id");
                																var rowNow = strNow.replace(/[^0-9]/g, '');
                																var inputMonthNow = "inputMonth"+rowNow;
                																var inputContentNow = "inputContent"+rowNow;

                																var validContent = (($("#"+inputContentEl).val() != "")?($("#"+inputContentEl).val() == $("#"+inputContentNow).val()):false);
                																var validMonth = (($("#"+inputMonthEl).val() != "")?($("#"+inputMonthEl).val() == $("#"+inputMonthNow).val()):false);


                																if( ($(this).val() == $field.val()) && (validContent ) && (validMonth) ){
                																	$field.val("");
                																	duplicateCont = true;

                																    return false;
                															    }
                															}

      														      });

                														if(duplicateCont){
                															if(self.scope.attr("invoicetypeSelect") != 2)
                													        {
                													        	return {
                															            valid: false,    // or false
                															            message: 'Two invoicelines can not have same period, content type and country.'
                															    }
                													        }
                														    else
                														    {
                														    	return {
                															            valid: false,    // or false
                															            message: 'Two invoicelines can not have same period, adhoc type and country.'
                															    }
                														    }

                														}

      				                          }
				                              return true;
				                            }
		                    		}
				                }
			            	}
						}
				    }).on('error.field.bv', function(e, data) {
					    	if((data.field != "amount[]") && (data.field != "inputMonth[]") && (data.field != "inputCountry[]") && (data.field != "inputContent[]") && (data.field != "ccidGLtxt[]")){
					    		$("#"+data.field+"-err").css("display", "block");
					    	}
					    	$('*[data-bv-icon-for="'+data.field +'"]').popover('show');

					}).on('success.field.bv', function(e, data) {
	        				$('*[data-bv-icon-for="'+data.field +'"]').popover('destroy');
	        				if((data.field != "amount[]") && (data.field != "inputMonth[]") && (data.field != "inputCountry[]") && (data.field != "inputContent[]") && (data.field != "ccidGLtxt[]")){
					    		$("#"+data.field+"-err").css("display", "none");
					    	}

		        				var requireField = (self.scope.attr("invoicetypeSelect") == "2")? mandatoryFieldAdhoc: (self.scope.attr("invoicetypeSelect") == "3") ? mandatoryFieldCA  : mandatoryField;

		        				for(var i= 0; i < requireField.length; i++){
		        					if(!data.bv.isValidField(requireField[i])){
		        						 data.bv.disableSubmitButtons(true);
		        						 if(requireField[i] == "receiveddate"){
		        						 	$('#invoiceform').bootstrapValidator('revalidateField', 'receiveddate'); /*revalidating this field. It initialized with currentdate*/
		        						 }
		        						 break;
		        					}

		        				}


						}).on('success.form.bv', function(e) {
							e.preventDefault();
					});


				/*	$('#invoicedate').on('dp.change', function (e) {
		            	$('#invoiceform').bootstrapValidator('revalidateField', 'invoicedate');
		            });

			        $('#receiveddate').on('dp.change', function (e) {
			           	$('#invoiceform').bootstrapValidator('revalidateField', 'receiveddate');
			        });


					$('#invoiceduedate').on('dp.change', function (e) {
			            $('#invoiceform').bootstrapValidator('revalidateField', 'invoiceduedate');
			        }); */

				/*	$('#invoicedate').on('dp.change dp.show', function (e) {
		            	$('#invoiceform').bootstrapValidator('revalidateField', 'invoicedate');
		            	alert("yes");

		        	});*/


					if(!self.scope.editpage){
						self.scope.attr("invoiceduedate", getCurrentDate());
					}



			},
		      destroy: function() {
		        //distroy all items can be placed.
		        $(".popover").hide();
		      },

		      "#receiveddate dp.change":function(event){ 
		      	$('#invoiceform').bootstrapValidator('revalidateField', 'receiveddate');
		      },

		      "#invoiceduedate dp.change":function(event){ 
		      	 $('#invoiceform').bootstrapValidator('revalidateField', 'invoiceduedate');
		      },
			
			".form-control keyup": function(event){
					var self = this;
					if(event[0].id == "newPaymentBundle"){
						if(String(event[0].value).length > 0){
							if(String(event[0].value).length > 100){
								showError(event[0].id, "Maximum 100 characters allowed");
							}
							else{
								removeError(event[0].id);

							}
						}
					}

					if(self.scope.editpage){
						if(event[0].id == "usercomments"){
							if(String(event[0].value).length > 0){
								if(String(event[0].value).length > 1024){
									showError(event[0].id, "Maximum 1024 characters allowed");
								}
								else{
									removeError(event[0].id);
								}
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
                  				$('#invoiceform').bootstrapValidator('revalidateField', 'invoiceduedate');
                  			}
                  		 }
                  		 else{
	                  			self.scope.attr("calduedate", "");
	                  			$('#invoiceform').bootstrapValidator('revalidateField', 'invoiceduedate');
	                  		}
		                },function(xhr){
		                /*Error condition*/
		           		 });
					}
				},
				"#invoicedate dp.change":function(event){ /*need to repeat service call, as no way to capture date change event together with form control event*/
					$('#invoiceform').bootstrapValidator('revalidateField', 'invoicedate');
					var self = this;
					if(($("#invoicedate input[type=text]").val() != "") &&  (self.scope.licensorStore != "") && ($("#inputCountry0").val() != "")){
					var genObj = {entityId:self.scope.licensorStore, invoiceDate:Date.parse($("#invoicedate input[type=text]").val()), countryId:$("#inputCountry0").val()};
					CalDueDate.findOne(UserReq.formRequestDetails(genObj),function(data){
						//console.log("Date 1---"+moment($("#invoicedate input[type=text]").val()).unix());
						//console.log("Date 2----"+Date.parse($("#invoicedate input[type=text]").val()));
                  		if(data.status == 'SUCCESS'){
                  			if(data.calInvoiceDueDate != null && data.calInvoiceDueDate != undefined){
                  				self.scope.attr("calduedate", getDateToDisplay(data.calInvoiceDueDate));
                  				$('#invoiceform').bootstrapValidator('revalidateField', 'invoiceduedate');
                  			}
                  		 }
                  		 else{
	                  			self.scope.attr("calduedate", "");
	                  			$('#invoiceform').bootstrapValidator('revalidateField', 'invoiceduedate');
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
			if(event.find('option:selected')[0]!=undefined)event.next('.ccidGLtxt').val(event.find('option:selected')[0].text);
         	var idGL = event[0].id;
			idGL =  idGL.indexOf("ccidGLtxt") > -1 ? idGL.replace("ccidGLtxt","ccidGL") :  idGL;
			this.scope.ccidGLStore.attr(idGL, event[0].value);
			$('#invoiceform').bootstrapValidator('revalidateField', 'ccidGLtxt[]');

		},
		".ccidGLtxt change": function(el){
			var rowindex = el[0].id.replace( /^\D+/g, '');
			$("#ccidGL"+rowindex).val("");
		},

		"#currency change": function(){  /*this is for edit only*/
			var self = this;
			var genObj = {
			   regionId:self.scope.attr("regionStore"),
			  entityId:self.scope.attr("licensorStore"),
			  currency:self.scope.attr("currencyStore")
			};

			Promise.all([Country.findCountriesForRegLicCurr(UserReq.formRequestDetails(genObj))
			     ]).then(function(values) {
			     	if(values[0].status == 'SUCCESS'){
              			self.scope.attr("country").replace([]);
                   		self.scope.attr("country").replace(values[0].data);

                   		  var countryDD = $('.inputCountry');
				            countryDD.options = function(data) {
				                var self = this;
				                var option = $('<option>').text("Select").val("");
				                   data.push(option);
				                $.each(data, function(key, value) {
				                    option = $('<option>').text(value.value).val(value.id);
				                    if(value.value != undefined && value.id != undefined){
				                    	data.push(option);
				                    }
				                });
				                self.html(data);
				            }
				            countryDD.options(values[0].data);
				            $('#invoiceform').bootstrapValidator('revalidateField', 'inputCountry[]');

              		}else{
              			self.scope.attr("country").replace([]);
              			 	var countryDD = $('.inputCountry');
				         	countryDD.empty();
				         	countryDD.html($('<option>').text("Select"));
				         	 $('#invoiceform').bootstrapValidator('revalidateField', 'inputCountry[]');

							showMessages(values[0].responseText);
	              		}
				});
			},

		"{scope} currencyStore": function(){
			var self = this;
			self.scope.getFxrate();
		},
		"{scope} regionStore": function(){
		  	var self = this;
			var genObj = {regionId:self.scope.attr("regionStore")};
			Promise.all([
				Licensor.findAll(UserReq.formRequestDetails(genObj)),
				Currency.getCurrByRegion(self.scope.attr("regionStore"))
			     ]).then(function(values) {
		     			self.scope.attr("licensor").replace([]);
			    		self.scope.attr("licensor").replace(values[0]["entities"]);
			    		  self.scope.attr("currency").replace([]);
					     self.scope.attr("currency").replace(values[1].data);
			    		if(self.scope.editpage){
				    		var invoiceData = self.scope.attr().invoiceContainer[0];
				    		self.scope.attr("licensorStore", invoiceData.entityId);
				    		self.scope.ajaxRequestStatus.attr("licensorLoaded", true);
				    		self.scope.attr("currencyStore", invoiceData.invoiceCcy);
						    self.scope.ajaxRequestStatus.attr("currencyStore", true);
			    		}
			    });

			self.scope.createPBRequest();

		},

		"#invoiceRegion change":function(){  /*This is need only for edit case*/
			var self = this;
			self.scope.attr("licensorStore", "");
			if(self.scope.attr("licensorStore") == ""){
				$('#invoiceform').bootstrapValidator('revalidateField', 'licensor');
			}
			setTimeout(function(){
					$("#invoicelicensor").val("");
			},800);
		},

		"{scope} licensorStore": function(event){
			var self = this;
			//var genObj = {licensorId:self.scope.attr("regionStore")};
			// Promise.all([Currency.getCurrByRegion(self.scope.attr("regionStore"))
			//      ]).then(function(values) {
			// 	    self.scope.attr("currency").replace([]);
			// 	     self.scope.attr("currency").replace(values[0]);
			// 	    if(self.scope.editpage){
			// 		    var invoiceData = self.scope.attr().invoiceContainer[0];
			// 		    self.scope.attr("currencyStore", invoiceData.invoiceCcy);
			// 		    self.scope.ajaxRequestStatus.attr("currencyStore", true);
			// 		}
			// });
		},

		"#invoicelicensor change":function(){  /*This is need only for edit case*/
			var self = this;
			self.scope.attr("currencyStore", "");
			if(self.scope.attr("currencyStore") == ""){
				$('#invoiceform').bootstrapValidator('revalidateField', 'currency');
				setTimeout(function(){
					$("#currency").val("");
				},800);

			}

		},

		"{ajaxRequestStatus} change":function(event){
				var self = this;
				if((self.scope.ajaxRequestStatus.currencyStore == true) && (self.scope.ajaxRequestStatus.licensorLoaded == true) && (self.scope.ajaxRequestStatus.countryLoaded == true) && (self.scope.ajaxRequestStatus.allDataLoaded == true)){
						var invoicevalid = $("#invoiceform").data('bootstrapValidator').isValid();
						if(!invoicevalid){
							$("#invoiceform").data('bootstrapValidator').validate();

							//$("#invoiceform").data('bootstrapValidator').disableSubmitButtons(true);
						}
				}
		},

		"#invoiceType change": function(){
			this.scope.isRequired();
			var self = this;
            //Resetting the region
            self.scope.attr("regionStore",'');
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
			if(self.scope.attr("invoicetypeSelect") == "3"){
				$("#paymentBundleNames").attr("disabled","disabled");
			} else{
				 $("#paymentBundleNames").removeAttr("disabled");
			}
		},
         "{AmountStore} change": function() {
         		var self = this;
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

  	 			self.scope.getFxrate();

         },
         "{invoiceContainer} change": function() {
						var self = this;

				 		/*This block is used to update data in view */
             if(self.scope.appstate.attr('viewinvoicemode') == true){
							$("rn-file-uploader-edit .browseFiles.uploadFiles").attr("disabled", true);
							$("page-edit-invoice form :input:not('#buttonCancel')").prop("disabled",true);
							setTimeout(function(){$('rn-file-uploader-edit .action-link').prop("disabled", true)}, 200);
							var msg = "Info:Invoice can't be edited as its in transit/paid";
							commonUtils.showErrorMessage(msg);

						}

						var invoiceData = self.scope.attr().invoiceContainer[0];

            //<rdar://problem/19645803> Dont allow user to update the bundle if its part of the PB or in transit.
            invoiceData.paymentState !== 0 ? $(".invoiceRegion").prop('disabled', true) : "";

						self.scope.attr("invoicenumberStore", invoiceData.invoiceNumber);
				 		self.scope.attr("invoicetypeSelect", invoiceData.invoiceTypeId);
				 		self.scope.attr("regionStore", invoiceData.regionId);
						self.scope.attr("fxrateStore", invoiceData.fxRate);
				 		self.scope.attr("licnotesStore", invoiceData.notes);

				 		if((invoiceData.invoiceDate != "") &&  (invoiceData.invoiceDate != null)){
				 			self.scope.attr("invoicedate", moment(invoiceData.invoiceDate).format("MM/DD/YYYY"));
				 			$("#invoicedate input[type=text]").val(moment(invoiceData.invoiceDate).format("MM/DD/YYYY"));
				 		}else{
				 			self.scope.attr("invoicedate", "");
				 			$("#invoicedate input[type=text]").val("");
				 		}

				 		if((invoiceData.receivedDate != "") &&  (invoiceData.receivedDate != null)){
				 			self.scope.attr("receiveddate", moment(invoiceData.receivedDate).format("MM/DD/YYYY"));
				 			$("#receiveddate input[type=text]").val(moment(invoiceData.receivedDate).format("MM/DD/YYYY"));
				 		}else{
				 			self.scope.attr("receiveddate", "");
				 			$("#receiveddate input[type=text]").val("");
				 		}

				 		if((invoiceData.invoiceDueDate != "") &&  (invoiceData.invoiceDueDate != null)){
				 			self.scope.attr("invoiceduedate", moment(invoiceData.invoiceDueDate).format("MM/DD/YYYY"));
				 			$("#invoiceduedate input[type=text]").val(moment(invoiceData.invoiceDueDate).format("MM/DD/YYYY"));
				 		}else{
				 			self.scope.attr("invoiceduedate", "");
				 			$("#invoiceduedate input[type=text]").val("");
				 		}

				 		if((invoiceData.invoiceCalcDueDate != "") &&  (invoiceData.invoiceCalcDueDate != null)){
				 			self.scope.attr("calduedate",moment(invoiceData.invoiceCalcDueDate).format("MM/DD/YYYY"));
				 		}
				 		else
				 		{
				 			self.scope.attr("calduedate","");
				 		}

				 		self.scope.attr("tax", "");
				 		if(invoiceData.tax != null){
				 			self.scope.attr("tax", invoiceData.tax);
				 		}

						self.scope.attr("invoiceId",invoiceData.invId);

            this.scope.isRequired(); /*For breakdown required field*/

						var tempcommentObj = invoiceData.comments;
						$('#multipleCommentsInv').html(stache('<multiple-comments divid="usercommentsdivinv" options="{tempcommentObj}" divheight="100" isreadOnly="n"></multiple-comments>')({tempcommentObj}));
		                self.scope.changeTextOnInvType();
                    //Code to display server list of files on file upload rn-file-uploader-edit control starts
                    for(var j=0;j<invoiceData.invoiceDocuments.length;j++){
                        invoiceData.invoiceDocuments[j].isServer = true;
                        invoiceData.invoiceDocuments[j].filePath = invoiceData.invoiceDocuments[j].location;
                    }

		                if(invoiceData.invoiceDocuments.length > 0){
		                	self.scope.uploadedfileinfo.replace(invoiceData.invoiceDocuments);
		                } else {
		                	self.scope.uploadedfileinfo.replace([]);
		                }
                    //Code to display server list of files on file upload rn-file-uploader-edit control ends
                    self.scope.attr("invselectedbundle", invoiceData.bundleId);
		                var genObj = {
			                			regionId:invoiceData.regionId,
							  			      entityId:invoiceData.entityId,
							  			      currency:invoiceData.invoiceCcy
									        };

							Promise.all([Country.findCountriesForRegLicCurr(UserReq.formRequestDetails(genObj))
						     ]).then(function(values) {
						     	if(values[0].status == 'SUCCESS'){
			              			self.scope.attr("country").replace([]);
			                   		self.scope.attr("country").replace(values[0].data);
			                   		self.scope.ajaxRequestStatus.attr("countryLoaded", true);
			              		}else{
			              			self.scope.attr("country").replace([]);
			              			showMessages(values[0].responseText);
			              		}
							}).then(function(){

			         		prepareInvoiceLines(self.scope,invoiceData.invoiceLines,false,true);
                  self.scope.ajaxRequestStatus.attr("allDataLoaded", true);

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
	          self.scope.attr('newpaymentbundlenamereq', "undefined");

			if(pbval=="createB"){

	          	if(($("#inputMonth0").val() == "") && (self.scope.attr("invoicetypeSelect") != "2"))
	          		{
	          			$("#paymentBundleNames").val("");

                    	$("#paymentBundleNames").popover({"content":"Please select invoielines period", "placement":"top"});
                    	$("#paymentBundleNames").popover('show');

	                     setTimeout(function(){
	                      	$("#paymentBundleNames").popover('destroy');

	                   },2000);
		          	}
		          else
		          	{
	          		  var regId = self.scope.regionStore;
					  var newBundleNameRequest = {"paymentBundle":{}};
		              var bundleRequest = {};

		              bundleRequest["regionId"] = regId;

		              bundleRequest["periodFrom"] = getBundleDateRange().fromDate;

		              bundleRequest["periodTo"] = getBundleDateRange().toDate;

		              bundleRequest["periodType"] = getBundleDateRange().periodType;

		              bundleRequest["bundleType"] = $("#invoiceType option:selected").attr("name");

		              newBundleNameRequest["paymentBundle"] = bundleRequest;
		              //console.log(JSON.stringify(newBundleNameRequest));
		              self.scope.attr('newpaymentbundlenamereq', JSON.stringify(newBundleNameRequest));
		          	}


	          }
	      },
	      'rn-file-uploader-edit onSelected': function(ele, event){

	     	var self = this;

	     	var errObj=validateMandatory();
          	if(errObj.isFailed == false){
           	 	$("#addInvSubmit").attr("disabled", false);
          	}else{
          		$("#addInvSubmit").attr("disabled", true);
          	}

          	if(!self.scope.editpage){
				var requireField = (self.scope.attr("invoicetypeSelect") == "2")? mandatoryFieldAdhoc: (self.scope.attr("invoicetypeSelect") == "3") ? mandatoryFieldCA  : mandatoryField;

				for(var i= 0; i < requireField.length; i++){
					if(!$("#invoiceform").data('bootstrapValidator').isValidField(requireField[i])){
						 $("#invoiceform").data('bootstrapValidator').disableSubmitButtons(true);
						 if(requireField[i] == "receiveddate"){
						 	$('#invoiceform').bootstrapValidator('revalidateField', 'receiveddate'); /*revalidating this field. It initialized with currentdate*/
						 }
						 break;
					}

				}
			}
			if(self.scope.editpage){
				if(!$("#invoiceform").data('bootstrapValidator').isValid()){
					$("#invoiceform").data('bootstrapValidator').disableSubmitButtons(true);
				}
		   }

	      },

		"#addInvSubmit click":function(){

          var errObj=validateMandatory();
          if(errObj.isFailed == true){
            var msg =showErrorDetails(errObj.errorMsgs, "Error");
         		showMessages(msg);
            return;
          }

					var self = this;
					var invoiceValidatorObj = $("#invoiceform").data('bootstrapValidator');

					var invoiceData = self.scope.attr().invoiceContainer[0];

					/*Edit invoice onject creation start*/
					var editInvoiceData = {};
				   	editInvoiceData.invoices = [];

				   	var tempEditInvoiceData = {};
				  	tempEditInvoiceData["invId"] = invoicemap.attr("invoiceid");
				    tempEditInvoiceData["invoiceNumber"] = self.scope.invoicenumberStore;
				    tempEditInvoiceData["invoiceTypeId"] = self.scope.invoicetypeSelect;
				    tempEditInvoiceData["regionId"] = self.scope.regionStore;
				    tempEditInvoiceData["invoiceType"] = $("#invoiceType option:selected").attr("name");
				    tempEditInvoiceData["serviceTypeId"] = $("#inputContent0 option:selected").attr("servicetypeid");
				    tempEditInvoiceData["entityId"] = self.scope.licensorStore;
				    tempEditInvoiceData["entityName"] = $("#invoicelicensor option:selected").text();
				    tempEditInvoiceData["invoiceCcy"] = self.scope.currencyStore;
				    tempEditInvoiceData["fxRate"] = self.scope.fxrateStore;
				    tempEditInvoiceData["notes"] = self.scope.licnotesStore;
				    tempEditInvoiceData["docsId"] = invoiceData.docsId;
				    tempEditInvoiceData["commentsId"] = invoiceData.commentsId;
				    tempEditInvoiceData["invoiceAmount"] = self.scope.totalAmountVal;
				    tempEditInvoiceData["grossTotal"] = self.scope.grossTotalStore;
				    if(self.scope.attr("tax") != null && self.scope.attr("tax") != undefined &&  self.scope.attr("tax") >0) {
					   	tempEditInvoiceData["tax"] = self.scope.attr("tax");
					}
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
				    if(self.scope.calduedate){
				    	tempEditInvoiceData["invoiceCalcDueDate"] = dateFormatter(self.scope.calduedate, "mm/dd/yyyy");
				    }
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
					if($("#editableText").val() != null && $("#editableText").val() != undefined){
						tempComments.comments = $("#editableText").val();//self.scope.usercommentsStore;
					   	//tempComments.id = "";
					   	tempComments.createdBy = UserReq.formRequestDetails().prsId;
					   	tempComments.createdDate = moment().format("YYYY-MM-DD");
					   	tempEditInvoiceData["comments"].push(tempComments);
					}

				    /*comment end*/

                    /*document start*/

                    tempEditInvoiceData["invoiceDocuments"] = [];

                    //Sudesna
                    //Code to send the updated list of files on file upload rn-file-uploader-edit to backend starts

					/* adding new document */
                    // make sure that you remove all files from _d_uploadedFileInfo that have just the term ftype = 'selectedFromLocal' & isServer
                    var uploadedfiles = $('rn-file-uploader-edit').data('_d_uploadedFileInfo');

                    if(uploadedfiles != undefined){
	                    for(var i =0; i < uploadedfiles.length; i++){
	                        if (uploadedfiles[i].ftype === 'pushedToServer') {
	                            // This is the list of newly uploaded files.
	                            var tempDocument = {};
	                            tempDocument.fileName = uploadedfiles[i].fileName;
	                            tempDocument.location = uploadedfiles[i].filePath;
	                            tempDocument.status = "add";
	                            tempEditInvoiceData["invoiceDocuments"].push(tempDocument);
	                        // } else if (uploadedfiles[i].isServer) {
	                        //     // This is the existing server file list which will be send back as-is with no change.
	                        //     var tempDocument = {};
	                        //     tempDocument.fileName = uploadedfiles[i].fileName;
	                        //     tempDocument.location = uploadedfiles[i].location;
	                        //     tempDocument.docId = uploadedfiles[i].docId;
	                        //     tempDocument.id = uploadedfiles[i].id;
	                        //     tempDocument.status = uploadedfiles[i].status;
	                        //     tempEditInvoiceData["invoiceDocuments"].push(tempDocument);
	                        }
	                    }
                	}
                    /* deleting existing documents */
                    var deletedFiles = $('rn-file-uploader-edit').data('_d_deletedFileInfo');

                    if (typeof deletedFiles !== 'undefined') {
                        for (var i = 0; i < deletedFiles.length; i++) {
                            if (deletedFiles[i].isServer) {
                                var tempDocument = {};
                                tempDocument.fileName = deletedFiles[i].fileName;
                                tempDocument.location = deletedFiles[i].location;
                                tempDocument.docId = deletedFiles[i].docId;
                                tempDocument.status = "delete";
                                tempDocument.id = deletedFiles[i].id;
                                tempDocument.inboundFileId=deletedFiles[i].fileId;
                                tempEditInvoiceData["invoiceDocuments"].push(tempDocument);
                                //console.log(tempDocument);
                            }
                        }
                    }

            //Code to send the updated list of files on file upload rn-file-uploader-edit to backend ends


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
					   		//tempArry["contentGrpId"] = self.scope.contentTypeStore.attr("inputContent"+index);
					   		//tempArry["contentGrpName"] = $("#inputContent"+index+" option:selected").text();
							tempArry["lineAmount"] = self.scope.AmountStore.attr("amountText"+index);
					   		tempArry["lineType"] = invoiceData.invoiceLines[0].lineType;

					   		if(self.scope.attr("invoicetypeSelect") == "2"){

						   			//var ccidGL = "ccidGL"+index;

                    				//ccidGL = (index == 0 ? ccidGL : ccidGL+index);

                    					if($('#ccidGL'+index).val()!=undefined  && $('#ccidGL'+index).val().length>0){
					   						tempArry["glAccRefId"] = $("#ccidGL"+index).val();
					   					}else{
					   						tempArry["glAccNum"] = $("#ccidGLtxt"+index).val();
					   					}


									//tempArry["glAccRefId"] = self.scope.ccidGLStore.attr(ccidGL);
						  	 		tempArry["adhocTypeId"] = self.scope.contentTypeStore.attr("inputContent"+index);
						  	 	}
						  	 	else{
						  	 		tempArry["contentGrpId"] = self.scope.contentTypeStore.attr("inputContent"+index);
						  	 		//console.log(tempArry["contentGrpName"]);
						  	 		var tempContentGrpName = $("#inputContent"+index+" option:selected").text();
						  	 		tempArry["contentGrpName"] = tempContentGrpName;
						  	 		tempArry["ccidFileName"] = $("#ccidGL"+index).val();
						  	 	}



							tempEditInvoiceData["invoiceLines"].push(tempArry);

						}
					});
					$.merge(tempEditInvoiceData["invoiceLines"], self.scope.attr().DelInvoiceline); /*merging invoice line with deleted row*/
					editInvoiceData.invoices.push(tempEditInvoiceData);
					Promise.all([Invoice.update(UserReq.formRequestDetails(editInvoiceData))]).then(function(values) {
						if (values[0]["status"] == "SUCCESS") {
							//var msg = "Invoice number "+self.scope.invoicenumberStore+" was saved successfully.";
							var msg = values[0].responseText;

							prepareInvoiceLines(self.scope,values[0].invoices[0].invoiceLines,true,false);

							//commonUtils.displayUIMessageWithDiv("#invmessageDiv", values[0].status,values[0].responseText);
							commonUtils.showSuccessMessage(msg);

							// $("#invmessageDiv").html("<label class='successMessage'>"+msg+"</label>")
							// $("#invmessageDiv").show();
							// setTimeout(function(){
							//     $("#invmessageDiv").hide();
							// },5000)

							if (values[0].invoices[0].errors) {
								var errorMap = values[0].invoices[0].errors.errorMap;
							}

							if (errorMap) {
								var msg = showErrorDetails(errorMap, "Warning");
								//commonUtils.displayUIMessageWithDiv("#invWarningMsgDiv", "ERROR",msg);
								commonUtils.showErrorMessage(msg);
								/*$("#invmessageDiv").html("<label class='errorMessage'>"+msg+"</label>")
												             $("#invmessageDiv").show();
												             setTimeout(function(){
												                $("#invmessageDiv").hide();
												             },5000)*/
							}

							// reset data for uploaded fileinfo
							//   self.scope.uploadedfileinfo.replace([]); /*not needed for edit invoice*/
							self.scope.deletedFileInfo.replace([]);
						} else {
							if (values[0].invoices[0].errors != "undefined" && values[0].invoices[0].errors != null) {
								var errorMap = values[0].invoices[0].errors.errorMap;
								var msg = showErrorDetails(errorMap, "Error");
							} else {
								var msg = values[0].responseText;
							}

							//commonUtils.displayUIMessageWithDiv("#invmessageDiv", "ERROR",msg);
							commonUtils.showErrorMessage(msg);
							// $("#invmessageDiv").html("<label class='errorMessage'>"+msg+"</label>");
							//     $("#invmessageDiv").show();
							$("#addInvSubmit").attr("disabled", false);
						}
					});

				/*Edit invoice end*/
							},
							"#buttonCancel click":function(){
								commonUtils.navigateTo("invoices");
                                //Set these values to null:
//                               var previouslyUploaded = $('rn-file-uploader-edit').data('_d_uploadedFileInfo');
//                                previouslyUploaded.replace([]);//deletedFileInfo:[],

                                this.scope.uploadedfileinfo.replace([]);
                                this.scope.deletedFileInfo.replace([]);

							},
							'period-calendar onSelected': function (ele, event, val) {
			       					this.scope.attr('periodchoosen', val);
			       					$(ele).parent().find('input[type=text]').val(this.scope.periodchoosen).trigger('change');
			       					$(ele).closest('.calendarcls').find('.box-modal').hide();
			       					$(ele).blur();
			   				},
						   '.updateperoid focus':function(el){

							  var self = this;
						      $(el).closest('.calendarcls').find('.box-modal').show();
						      if(el[0].id == "inputMonth0"){
						     		self.scope.getFxrate();
							 	}
							},
							'.updateperoid blur':function(el){
						   	 	var self = this;
								$(".updateperoid").not(':hidden').each(function(index){
									if($(this).attr("id") != el[0].id){
										var strEl = el[0].id;
										var rowEl = strEl.replace(/[^0-9]/g, '');
										var inputContentEl = "inputContent"+rowEl;
										var inputCountryEl = "inputCountry"+rowEl;

										var strNow = $(this).attr("id");
										var rowNow = strNow.replace(/[^0-9]/g, '');
										var inputContentNow = "inputContent"+rowNow;
										var inputCountryNow = "inputCountry"+rowNow;

										var validContent = (($("#"+inputContentEl).val() != "")?($("#"+inputContentEl).val() == $("#"+inputContentNow).val()):false);
										var validCountry = (($("#"+inputCountryEl).val() != "")?($("#"+inputCountryEl).val() == $("#"+inputCountryNow).val()):false);



										if(($(this).val() == el[0].value) && (validContent ) && (validCountry)){
						        			$(el).val("");
						        			showError(el[0].id, "Two invoiceline can not have same period, content type and country");
						        			return false;
						        		}

						        	}
						        	else{
						        		removeError(el[0].id, "no");
						        	}
						        });
							},
						   '#inputContent0 change':function(el){  /*validation for servicetypeid*/
						   // 		$("[id^=breakrow]").each(function(index){  /*removing added row in break down when invoice type changes to adhoc.*/
									// if((this.id !="breakrow0") && (this.id !="breakrowTemplate")){
									// 		$("#"+this.id+' .inputContent').val("");

									// }
						  	// 	});

						  	// 	this.scope.contentTypeFilter.replace(this.scope.contentType);
						  		
						  		var self = this;
						  		if(self.scope.attr("invoicetypeSelect") != '2'){
						  			updateContentType(el);
						  		}
							},
						   '#inputMonth0 change':function(el){ /*validation for period*/
						  		var self = this;
						  		self.scope.attr("periodType", $(el).val().charAt(0));

						  	}

						},
					  	init: function () {
					   	 	var self = this;
					   	 	var i = 1;
					        this.scope.appstate.attr("renderGlobalSearch",false);
					   	 	var genObj = {};
					   	 	Promise.all([
									      	InvoiceType.findAll(UserReq.formRequestDetails(genObj)),
									     	ContentType.findAll(UserReq.formRequestDetails(genObj)),
											AdhocTypes.findAll(UserReq.formRequestDetails(genObj)),
									      	GLaccounts.findAll(UserReq.formRequestDetails(genObj)),
									      	Region.findAll(UserReq.formRequestDetails(genObj))
										]).then(function(values) {
							     		 	self.scope.attr("invoiceTypes").replace(values[0]["invoiceTypes"]);
							     			self.scope.attr("contentType").replace(values[1].contentTypes);
											self.scope.attr("adhocType").replace(values[2].adhocTypes);
							     		 	self.scope.attr("glaccounts").replace(values[3]);
							     		 	self.scope.attr("regions").replace(values[4]);

							     		 	console.log(self.scope.attr("adhocType"));


							    			if(invoicemap.attr("invoiceid")){
												var getByIDReq = {"searchRequest":{}};
								     			getByIDReq.searchRequest.ids = [invoicemap.attr("invoiceid")];

								     			console.log(JSON.stringify(UserReq.formRequestDetails(getByIDReq)));

												self.scope.attr("editpage", true);

												Invoice.findOne(UserReq.formRequestDetails(getByIDReq),function(data){
			                  		 self.scope.attr("invoiceContainer").replace(data["invoices"]);
			                  		 if(data.status === "FAILURE"){
							          					commonUtils.showErrorMessage(data.responseText);
							          					$("#addInvSubmit").attr("disabled", false);
			                  		 }
                           	},function(errmsg){
							                /*Error condition*/
					          					commonUtils.showErrorMessage(errmsg);
					          					$("#addInvSubmit").attr("disabled", false);
							        		});

												}
											});
							//self.scope.attr('invoicetypeSelect','1');
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
								  		var tax = 0;
								  		if((this.attr("tax").length>0) || (this.attr("tax") > 0)){
								  			tax = Number(this.attr("tax"));
								  		}
								  	 	this.attr("taxStore", tax);
								  	 	var percent = (tax/this.attr("totalAmountVal"))*100;
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
								  	 		this.isAdhocStrore.attr("ccidGL", "CCID Filename");
								  	 		return this.isAdhocStrore;
								  	 	}
								  	},
								  	grossTotal: function(){
								  		var tax = 0;
								  		if(this.attr("tax") > 0){
								  			tax = Number(this.attr("tax"));
								  		}
										var grossTotal = (parseFloat(tax) + parseFloat(this.attr("totalAmountVal")));
								  	 	this.attr("grossTotalStore", grossTotal);
								  	 	if(isNaN(grossTotal)){
								  	 		grossTotal = 0;
								  	 	}
										return CurrencyFormat(grossTotal);
								  	},
								  	setHeight: function(){
								  	 	var vph = $(window).height();
								  	 	return 'Style="height:'+vph+'px"';
									},
									setMinHeightBreak: function(){
								  	 	var vph = 282;
								  	 	return 'Style="height:'+vph+'px;overflow-y:auto;"';
									},
									calculateUSD:function(){
										var fxrate = this.attr("usdFxrateRatio");
										var calUSD = this.attr("grossTotalStore") * fxrate;

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

					function removeError(id, buttonState){
						$('#'+id).popover('destroy');
						$("#"+id+"-err").css("display", "none");
						$('#'+id).parent().removeClass("has-error");
						if(buttonState != "no"){
							$("#addInvSubmit").attr("disabled", false);
						}

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

          function validateMandatory(){
          	var isError=false;
            var errObj={isFailed:false,errorMsgs:[]};
            //Upload file Validation
            var uploadedfiles = $('rn-file-uploader-edit').data('_d_uploadedFileInfo');
            if(uploadedfiles == undefined || uploadedfiles.length == 0){
            	isError=true;
            }else if(uploadedfiles != undefined && uploadedfiles.length >0){
            	//check whether atleast one fiel is moved to server
            	isError=true;
            	for(var i=0;i<uploadedfiles.length;i++){
            		if((typeof uploadedfiles[i].ftype !== "undefined")?uploadedfiles[i].ftype.toUpperCase() == 'PUSHEDTOSERVER':false || uploadedfiles[i].isServer){
            			isError=false;
            			break;
            		}
            	}
            }

            if(isError){
            	errObj.isFailed=true;
              	errObj.errorMsgs.push('Please attach atleast one supporting document');
            }

            return errObj;
          }

          function showMessages(msg){
            // $("#invmessageDiv").html("<label class='errorMessage'>"+msg+"</label>")
            //  $("#invmessageDiv").show();
            //  setTimeout(function(){
            //     $("#invmessageDiv").hide();
            //  },5000)
            commonUtils.showErrorMessage(msg);
          }

          function prepareInvoiceLines(self,invoiceLines,reload,isLineItemRemoveNeeded) {
          	var $template = $('#breakrowTemplate');
          	for (var i = 0; i < invoiceLines.length; i++) {
          		self.attr("rowindex", i)
          		var rowindex = self.attr("rowindex");
          		if(!reload){
          			var $clone = $template.clone().removeClass('hide').removeAttr('id').attr("id", "breakrow" + rowindex).attr("rowid", rowindex).insertBefore($template);
          		}

          		if($("#breakrow" + rowindex).attr("data-invLineId") == undefined || ($("#breakrow" + rowindex).attr("data-invLineId") != undefined && $("#breakrow" + rowindex).attr("data-invLineId").length==0)){


          		$("#breakrow" + rowindex).attr("data-invLineId", invoiceLines[i].invLineId);

          		$("#breakrow" + rowindex).attr("data-lineStatus", invoiceLines[i].lineStatus);


          		$("#breakrow" + rowindex + " .amountText").attr("id", "amountText" + rowindex).val(invoiceLines[i].lineAmount);
          		self.AmountStore.attr("amountText" + rowindex, invoiceLines[i].lineAmount);

          		if (self.attr("invoicetypeSelect") == "2") {
          			$("#breakrow" + rowindex + " #inputContent").attr("id", "inputContent" + rowindex).val(invoiceLines[i].adhocTypeId);
          			self.contentTypeStore.attr("inputContent" + rowindex, invoiceLines[i].adhocTypeId);
          		} else {
          			$("#breakrow" + rowindex + " #inputContent").attr("id", "inputContent" + rowindex).val(invoiceLines[i].contentGrpId);
          			self.contentTypeStore.attr("inputContent" + rowindex, invoiceLines[i].contentGrpId);
          		}

          		var servictypeid = $("#inputContent0 option:selected").attr("servicetypeid");
          		if (typeof servictypeid !== "undefined" && rowindex > 0) {
          			$('#inputContent' + rowindex + ' option[ servicetypeid!=' + servictypeid + ' ]').remove();
          		}

          		var displayPeriod = "";
          		if (invoiceLines[i].fiscalPeriod != null && invoiceLines[i].periodType != null) {
          			var displayPeriod = periodWidgetHelper.getDisplayPeriod(invoiceLines[i].fiscalPeriod + '', invoiceLines[i].periodType);
          		}
          		$("#breakrow" + rowindex + " #inputMonth").attr("id", "inputMonth" + rowindex).val(displayPeriod).parent().append(stache('<period-calendar></period-calendar>'));

          		self.monthStore.attr("inputMonth" + rowindex, displayPeriod);

          		$("#breakrow" + rowindex + " #inputCountry").attr("id", "inputCountry" + rowindex).val(invoiceLines[i].country);
          		self.countryStore.attr("inputCountry" + rowindex, invoiceLines[i].country);



          		if (self.attr("invoicetypeSelect") == "2") {
          			$("#breakrow" + rowindex + " #ccidGL").attr("id", "ccidGL" + rowindex).val(invoiceLines[i].glAccRefId);
          			$("#breakrow" + rowindex + " #ccidGLtxt").attr("id", "ccidGLtxt" + rowindex).val(invoiceLines[i].glAccNum);

          			self.ccidGLStore.attr("ccidGL" + rowindex, invoiceLines[i].glAccount);
          		} else {
                    //Changed for ccidFileName
          			$("#breakrow" + rowindex + " #ccidGL").attr("id", "ccidGL" + rowindex).val(invoiceLines[i].ccidFileName);
//                    $("#breakrow" + rowindex + " #ccidGL").attr("title", "ccidGL" + rowindex).val(invoiceLines[i].ccidFileName);
          			self.ccidGLStore.attr("ccidGL" + rowindex, invoiceLines[i].ccidFileName);
          		}

          		if (rowindex != 0){
                $("#breakrow" + rowindex + " .removeRow").css("display", "block");
              }

              if($clone != undefined){
                var $option = $clone.find('[name="amount[]"], [name="inputMonth[]"], [name="inputCountry[]"], [name="inputContent[]"], [name="ccidGLtxt[]"]');

                if(isLineItemRemoveNeeded){
                  removeBreakLineEvent($option,self,invoiceLines);
                }

                $option.each(function(index) {
                  $('#invoiceform').bootstrapValidator('addField', $(this));
                });

              }
          	}
          	}
          }

          var removeBreakLineEvent = function(lineItem,self,invoiceLines){

            $(".removeRow").click(function(event){
              lineItem.each(function(index){
                $('#invoiceform').bootstrapValidator('removeField', $(this));
              });
              var rowindex = $(this).closest("tr").attr("rowid");
              var inputContent = "inputContent"+rowindex;
              var tempDelObj = {};
              tempDelObj["country"] = self.countryStore.attr("inputCountry"+rowindex);
              tempDelObj["invLineId"] = $(this).closest("tr").attr("data-invLineId");
              tempDelObj["fiscalPeriod"] =  periodWidgetHelper.getFiscalPeriod($("#inputMonth"+rowindex).val());
              tempDelObj["periodType"] = periodWidgetHelper.getPeriodType($("#inputMonth"+rowindex).val().charAt(0));
              tempDelObj["contentGrpId"] = self.contentTypeStore.attr("inputContent"+rowindex);
              tempDelObj["contentGrpName"] = $("#inputContent"+rowindex+" option:selected").text();
              tempDelObj["lineAmount"] = self.AmountStore.attr("amountText"+rowindex);
              tempDelObj["lineStatus"] = $(this).closest("tr").attr("data-lineStatus");
              tempDelObj["status"] = "DELETE";
              tempDelObj["lineType"] = invoiceLines[0].lineType;

              if(self.attr("invoicetypeSelect") == "2"){
                //var ccidGL = "ccidGL"+rowindex;
                if($('#ccidGL'+rowindex).val()!=undefined  && $('#ccidGL'+rowindex).val().length>0){
                  tempDelObj["glAccRefId"] = $("#ccidGL"+rowindex).val();
                }else{
                  tempDelObj["glAccNum"] = $("#ccidGLtxt"+rowindex).val();
                }
                tempDelObj["adhocTypeId"] = self.contentTypeStore.attr("inputContent"+rowindex);
              }
              else{
                tempDelObj["contentGrpId"] = self.contentTypeStore.attr("inputContent"+rowindex);
                var tempContentGrpName = $("#inputContent"+rowindex+" option:selected").text();
                tempDelObj["contentGrpName"] = tempContentGrpName;
              }
              self.DelInvoiceline.push(tempDelObj);
              $(this).closest("tr").remove();
              self.AmountStore.removeAttr("amountText"+rowindex);
              self.contentTypeStore.removeAttr("inputContent"+rowindex);
            });
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

						if ($("#inputMonth0").val().indexOf('Q') != "-1") {
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


					var updateContentType = function(element) {

						var currentElementID = $(element).attr("id");

						var _elementID = $("#inputContent0");
						var _listofselect = $("select[id^='inputContent']").not("select[id='inputContent0']").not(':hidden');
						if ($(_elementID).data('options') == undefined) {
							$(_elementID).data('options', $('#' + currentElementID + ' option').clone());
						}

						var serviceID = $("#inputContent0 option:selected").attr("servicetypeid");
						console.log(serviceID);
						if (typeof serviceID !== undefined) {
							var options = $(_elementID).data('options').filter('[servicetypeid=' + serviceID + ']');
						} else {
							var options = $(_elementID).data('options').filter('[servicetypeid >' + serviceID + ']');
						}
						for (var i = 0; i < _listofselect.length; i++) {
							var currentID = $(_listofselect)[i].id;
							$("#" + currentID).html(options.clone());
							$("#"+currentID).prepend("<option value>Select</option>").val('');
						}

					}

					var showErrorDetails = function(errormap, errortype){
						var errorStr = "";
			          	for(var key in errormap){
			          		errorStr += errormap[key]+", ";
			          		//console.log(key);
			          	}
			          	errorStr = errorStr.replace(/,\s*$/, "");
						var msg = errortype+": "+ errorStr;

			          	return msg;
					}

					var getBundleDateRange = function(){

						var FromToRange = {};

						FromToRange.periodType = periodWidgetHelper.getPeriodType($("#inputMonth0").val());

						var _listofDateRange = $("input[id^='inputMonth']").not(':hidden');
						var _listofDate = [];

						if(_listofDateRange.length > 0){

							for(var i=0; i < _listofDateRange.length; i++){

								var currentID = $(_listofDateRange)[i].id;
								var currentVal = $("#"+currentID).val();

								if(FromToRange.periodType === "Q"){
									var currentYear = currentVal.substring(2, currentVal.length);
									_listofDate.push(currentVal.charAt(1));
								}else{
									var currentYear = currentVal.substring(3, currentVal.length);
									_listofDate.push(currentVal.substring(1,3));
								}

							}

							_listofDate.sort(function(a, b){return b-a});

							FromToRange.fromDate = periodWidgetHelper.getFiscalPeriod(FromToRange.periodType + _listofDate[_listofDate.length - 1] + currentYear);
							FromToRange.toDate = periodWidgetHelper.getFiscalPeriod(FromToRange.periodType + _listofDate[0] + currentYear);

						}else{
							FromToRange.fromDate = periodWidgetHelper.getFiscalPeriod($("#inputMonth0").val());
							FromToRange.toDate = periodWidgetHelper.getFiscalPeriod($("#inputMonth0").val());
						}

						return FromToRange;
					}


export default page;
