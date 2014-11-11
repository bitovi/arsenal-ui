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

var mandatoryField = ["invoicenumber", "usercomments", "invoicedate", "invoiceduedate", "receiveddate", "amount[]"];

var page = Component.extend({
  tag: 'page-create-invoice',
  template: template,
  scope: {
    appstate:undefined,
  	rowindex:1,
  	invoiceTypes:[],
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
  	invoiceContainer:[],
  	showPBR:true,
  	DelInvoiceline:[],
  	currentdate:"",
    //invoiceid:"",
  	editpage:false,
  	formSuccessCount:1,
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

                                var $option   = $clone.find('[name="amount[]"]');
                                $('#invoiceform').bootstrapValidator('addField', $option);

                               $(".removeRow").click(function(event){
                               		$('#invoiceform').bootstrapValidator('removeField', $option);
						            $(this).closest("tr").remove();
						            self.AmountStore.removeAttr("amountText"+rowindex);
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
			                        message: 'The invoice number is required'
			                    },
			                    stringLength: {
			                        max:50,
			                        message: 'Only Maximum 50 characters allowed',
			                        utf8Bytes: true
			                    },
			                    regexp: {
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
		                        message: 'The comments is required'
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
		                    },
		                    numeric: {
		                        separator:',',
		                        message: 'Please provide numeric value for Fx Rate'
                			},
                			callback: {
		                            message: 'Please provide positive Fx Rate',
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
		            	}


			         }
			    }).on('error.field.bv', function(e, data) {
				    	if(data.field != "amount[]"){
				    		$("#"+data.field+"-err").css("display", "block");
				    	}
				    	$('*[data-bv-icon-for="'+data.field +'"]').popover('show');

				}).on('success.field.bv', function(e, data) {
        				$('*[data-bv-icon-for="'+data.field +'"]').popover('show');
        				if(data.field != "amount[]"){
				    		$("#"+data.field+"-err").css("display", "none");
				    	}

        				if(!self.scope.editpage){
	        				for(var i= 0; i < mandatoryField.length; i++){
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

                                 var $option   = $clone.find('[name="amount[]"]');
                                $('#invoiceform').bootstrapValidator('addField', $option);

                           	}


                      $(".removeRow").click(function(event){
                      	           $('#invoiceform').bootstrapValidator('removeField', $option);
						           	var rowindex = $(this).closest("tr").attr("rowid");

										var inputContent = "inputContent"+rowindex;
										var tempDelObj = {};
										tempDelObj["countryId"] = self.scope.countryStore.attr("inputCountry"+rowindex);
								   		tempDelObj["fiscalPeriod"] = "201306";
								   		tempDelObj["periodType"] = "P";
								   		tempDelObj["contentType"] = self.scope.contentTypeStore.attr("inputContent"+rowindex);
								   		tempDelObj["lineAmount"] = self.scope.AmountStore.attr("amountText"+rowindex);
								   		tempDelObj["lineStatus"] = "delete";
								   		tempDelObj["adhocTypeId"] = "";
								   		if(self.scope.attr("invoicetypeSelect") == "2"){

								  	 		tempDelObj["glAccount"] = self.scope.ccidGLStore.attr(inputContent);
								  	 		tempDelObj["ccidName"] = "";
								  	 	}
								  	 	else{
								  	 		tempDelObj["glAccount"] = "";
								  	 		tempDelObj["ccidName"] = self.scope.ccidGLStore.attr(inputContent);
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

		"#licensor change": function(event){
			var genObj = {licensorid:event[0].value};
			var self = this;
			Promise.all([Currency.findOne(UserReq.formRequestDetails(genObj))
			     ]).then(function(values) {
				    self.scope.attr("currency").replace(values[0][0]["data"]);
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

					if(!self.scope.editpage)
					{

						/*Add invoice object creation start*/

                     
                       var createInvoiceData = {};
					   createInvoiceData.invoices = [];

					   var tempInvoiceData = {};

					   tempInvoiceData["invoiceNumber"] = self.scope.invoicenumberStore;
					   tempInvoiceData["invoiceTypeId"] = self.scope.invoicetypeSelect;
					   tempInvoiceData["serviceTypeId"] = ""; 
					   tempInvoiceData["invoiceType"] = $("#invoiceType option:selected").text();
					   tempInvoiceData["entityId"] = self.scope.licensorStore;
					   tempInvoiceData["regionId"] = "";
					   tempInvoiceData["entityName"] = $("#licensor option:selected").text();
					   tempInvoiceData["invoiceCcy"] = self.scope.currencyStore;
					   tempInvoiceData["fxRate"] = self.scope.fxrateStore;
					   tempInvoiceData["notes"] = self.scope.licnotesStore;
					   tempInvoiceData["invoiceAmount"] = self.scope.totalAmountVal;
					   tempInvoiceData["grossTotal"] = self.scope.grossTotalStore;
					   tempInvoiceData["finalInvoiceAmount"] = self.scope.grossTotalStore;
					   tempInvoiceData["periodType"] = "P";
					   tempInvoiceData["netTotal"] = self.scope.totalAmountVal;
					   tempInvoiceData["userAdjAmt"] = "0";
					   tempInvoiceData["bundleId"] = $("#paymentBundleNames").val();
					   tempInvoiceData["bundleName"] = $("#paymentBundleNames").text();

					   if(typeof $("#paymentBundleNames").val() == "undefined"){
					   	 tempInvoiceData["bundleId"] = "";
					   	 tempInvoiceData["bundleName"] = $("#newPaymentBundle").val();
					   }else{
					   	 tempInvoiceData["bundleId"] = $("#paymentBundleNames").val();
					   	 tempInvoiceData["bundleName"] = $("#paymentBundleNames option:selected").text();
					   }


					   tempInvoiceData["receivedDate"] = $("#receiveddate input[type=text]").val();//"06/19/2014"//self.scope.receiveddate;
					   tempInvoiceData["invoiceDate"] = $("#invoicedate input[type=text]").val();//"06/19/2014"//self.scope.invoicedate;
					   tempInvoiceData["invoiceCalcDueDate"] = self.scope.calduedate;
					   tempInvoiceData["invoiceDueDate"] = $("#invoiceduedate input[type=text]").val(); //"06/19/2014"//self.scope.invoiceduedate;
					   tempInvoiceData["createdBy"] = "1000";  
					   tempInvoiceData["comments"] = [];
					   tempInvoiceData["comments"].comments = self.scope.usercommentsStore;
					   tempInvoiceData["invoiceDocuments"] = [];
					   tempInvoiceData["invoiceDocuments"].fileName = "pom.xml";  /* this will come from file upload plugin*/
					   tempInvoiceData["invoiceDocuments"].location = "/tmp"; /* this will come from file upload plugin*/

					   tempInvoiceData["invoiceLines"] = [];

					   var rowNumber = 0;
					   	$("[id^=breakrow]").each(function(i){
							if(this.id !="breakrowTemplate"){
								var index = $(this).attr("rowid");
							 	console.log(index);
					   			var inputContent = "inputContent"+index;

								var tempArry = {};

								tempArry["country"] = self.scope.countryStore.attr("inputCountry"+index);
						   		tempArry["fiscalPeriod"] = "201306"; /* this will come from period selector plugin*/
						   		tempArry["periodType"] = "P"; /* this will come from period selector plugin*/
						   		tempArry["contentGrpId"] = self.scope.contentTypeStore.attr("inputContent"+index);
						   		tempArry["contentGrpName"] = $("#inputContent"+index).text();
						   		tempArry["lineAmount"] = self.scope.AmountStore.attr("amountText"+index);
						   		tempArry["adhocTypeId"] = self.scope.contentTypeStore.attr("inputContent"+index);
						   		if(self.scope.attr("invoicetypeSelect") == "2"){

						  	 		tempArry["glAccRefId"] = self.scope.ccidGLStore.attr(inputContent);
						  	 		tempArry["ccidFileName"] = "";
						  	 	}
						  	 	else{
						  	 		tempArry["glAccRefId"] = "";
						  	 		tempArry["ccidFileName"] = self.scope.ccidGLStore.attr(inputContent);
						  	 	}


							   		tempInvoiceData["invoiceLines"].push(tempArry);


									}
								rowNumber++;
								});
									self.scope.errorMsg.attr("errorCode", "0000");
								/*	createInvoiceData.requestTimeStamp = "";
									createInvoiceData.validationStatus = "";
									createInvoiceData.prsId  = "";
									createInvoiceData.appId = "";
									createInvoiceData.secretKey = "";
									createInvoiceData.roleIds = [""];*/

									createInvoiceData.invoices.push(tempInvoiceData);


							   	 	console.log(createInvoiceData);

							   	 	Promise.all([
										      	Invoice.create(UserReq.formRequestDetails(createInvoiceData))
										     ]).then(function(values) {
									     		   self.scope.errorMsg.attr("responseText", values[0][0]["responseText"]);

									     		  if((values[0][0]["responseCode"] == "0000")){
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
												 		for(var i = 1; i <= rowNumber; i++){
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



												});

									 


								}else{

								/* Add invoice end*/

								/*Edit invoice onject creation start*/


								   var editInvoiceData = {};
								   editInvoiceData.invoices = [];

								   var tempEditInvoiceData = {};

								   tempEditInvoiceData["invid"] = invoicemap.attr("invoiceid");
								   tempEditInvoiceData["invoiceNumber"] = self.scope.invoicenumberStore;
								   tempEditInvoiceData["invoiceTypeId"] = self.scope.invoicetypeSelect;
								   tempEditInvoiceData["invoiceType"] = $("#invoiceType option:selected").text();
								   tempEditInvoiceData["entityId"] = self.scope.licensorStore;
								   tempEditInvoiceData["invoiceCcy"] = self.scope.currencyStore;
								   tempEditInvoiceData["fxRate"] = self.scope.fxrateStore;
								   tempEditInvoiceData["notes"] = self.scope.licnotesStore;
								   tempEditInvoiceData["docid"] = ""; //Not needed here, we have invoicedocument at 2nd level*/
								   tempEditInvoiceData["commentid"] = ""; ///Not needed here, we have invoicedocument at 2nd level*/
								   tempEditInvoiceData["invoiceAmount"] = self.scope.totalAmountVal;
								   tempEditInvoiceData["tax"] = self.scope.tax;
								   tempEditInvoiceData["grossTotal"] = self.scope.grossTotalStore;
								   tempEditInvoiceData["userAdjAmt"] = "";
								   tempEditInvoiceData["bundleId"] = $("#paymentBundleNames").val(); //self.scope.paymentBundleId;
								   if(typeof $("#paymentBundleNames").val() == "undefined"){
								   	 tempEditInvoiceData["bundleId"] = "";
								   	 tempEditInvoiceData["bundleName"] = $("#newPaymentBundle").val();
								   }else{
								   	tempEditInvoiceData["bundleId"] = $("#paymentBundleNames").val();
								   	tempEditInvoiceData["bundleName"] = $("#paymentBundleNames option:selected").text();
								   }

								   tempEditInvoiceData["receivedDate"] = self.scope.receiveddate; //$("#receiveddate").val();//"06/19/2014",//self.scope.receiveddate;
								   tempEditInvoiceData["invoiceDate"] = self.scope.invoicedate;
								   tempEditInvoiceData["invoiceCalculatedDueDate"] = self.scope.calduedate;
								   tempEditInvoiceData["invoiceDueDate"] = self.scope.invoiceduedate;

								  // console.log(self.scope.attr().invoiceContainer[0].comments.length+"test");
								  // alert("yes");


								  /*comment start*/
								   tempEditInvoiceData["comments"] = [];
								   for(var j=0;j<self.scope.attr().invoiceContainer[0].comments.length;j++){  /*old comments*/
								   		  var tempComments = {};
								   		  tempComments.comments = self.scope.attr().invoiceContainer[0].comments[j].comments;
								   		  tempComments.id = self.scope.attr().invoiceContainer[0].comments[j].id;
								   		  tempComments.createdBy = self.scope.attr().invoiceContainer[0].comments[j].createdBy;
								   		  tempComments.createdDate = self.scope.attr().invoiceContainer[0].comments[j].createdDate;
								   		  tempEditInvoiceData["comments"].push(tempComments);
									}
										var tempComments = {};  /*new comments*/
										tempComments.comments = self.scope.usercommentsStore;
									   	tempComments.id = "";
									   	tempComments.createdBy = "";
									   	tempComments.createdDate = self.scope.currentdate;
									   	tempEditInvoiceData["comments"].push(tempComments);
								    /*comment end*/

								   /*document start*/
								   tempEditInvoiceData["invoiceDocuments"] = [];
									for(var j=0;j<self.scope.attr().invoiceContainer[0].invoiceDocuments.length;j++){   /*old documents*/
										var tempDocuments = {};  /*Data populate from upload plugin*/
										tempDocuments.filename="";
										tempDocuments.location = "";
										tempDocuments.inboundField = "";
										tempDocuments.status = "";
										tempDocuments.id = "";
										tempEditInvoiceData["invoiceDocuments"].push(tempDocuments);
									}

										var tempDocuments = {};  /*new documents*/
										tempDocuments.filename="";  /*Data populate from upload plugin*/
										tempDocuments.location = "";
										tempDocuments.inboundField = "";
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


											   		tempArry["countryId"] = self.scope.countryStore.attr("inputCountry"+index);
											   		tempArry["fiscalPeriod"] = "201304"; /*Data populate from period selector plugin*/
											   		tempArry["periodType"] = "P";
											   		tempArry["contentType"] = self.scope.contentTypeStore.attr("inputContent"+index);
											   		tempArry["lineAmount"] = self.scope.AmountStore.attr("amountText"+index);
											   		tempArry["lineStatus"] = "";
											   		tempArry["adhocTypeId"] = self.scope.contentTypeStore.attr("inputContent"+index);
											   		if(self.scope.attr("invoicetypeSelect") == "2"){

											  	 		tempArry["glAccount"] = self.scope.ccidGLStore.attr(inputContent);
											  	 		tempArry["ccidName"] = "";
											  	 	}
											  	 	else{
											  	 		tempArry["glAccount"] = "";
											  	 		tempArry["ccidName"] = self.scope.ccidGLStore.attr(inputContent);
											  	 	}


												   		tempEditInvoiceData["invoiceLines"].push(tempArry);



												   			}
												});


									 $.merge(tempEditInvoiceData["invoiceLines"], self.scope.attr().DelInvoiceline); /*merging invoice line with deleted row*/

									  editInvoiceData.invoices.push(tempEditInvoiceData);



								 console.log(editInvoiceData);

								 Promise.all([Invoice.update(UserReq.formRequestDetails(editInvoiceData))
								     ]).then(function(values) {
									    self.scope.errorMsg.attr("responseText", values[0][0]["responseText"]);
									    $("#invoiceform").data('bootstrapValidator').resetForm();
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
			      	Fxrate.findAll(UserReq.formRequestDetails(genObj)),
			      	AdhocTypes.findAll(UserReq.formRequestDetails(genObj))
			    //  	GLaccounts.findAll()

			      	//  Currency.findAll()*/
				]).then(function(values) {
		     		 self.scope.attr("invoiceTypes").replace(values[0][0]["data"]);
		     		 self.scope.attr("licensor").replace(values[1][0]["data"]);
		     		 self.scope.attr("currency").replace(values[2][0]["data"]);
		     		 self.scope.attr("country").replace(values[4][0]["data"]);
		     		 self.scope.attr("fxrate").replace(values[5][0]["data"][0]["fxrate"]);
		     		 self.scope.attr("adhocType").replace(values[6][0]["data"]);
		     		 self.scope.attr("contentType").replace(values[3][0]["data"]);
		     	//	 self.scope.attr("glaccounts").replace(values[7][0]["data"]);




		     	//	 self.scope.attr("invoiceid", invoicemap.attr("invoiceid"));

		     		 if(invoicemap.attr("invoiceid")){

						//this.attr("editpage", true);

						//console.log(invoiceid+"dadajsd");

		     			var getByIDReq = {"searchRequest":{}};
		     			getByIDReq.searchRequest.ids = invoicemap.attr("invoiceid");


						self.scope.attr("editpage", true);
						Promise.all([
				      				Invoice.findOne(UserReq.formRequestDetails(getByIDReq))
				    			]).then(function(values) {
				    				//console.log(values);
						     		 self.scope.attr("invoiceContainer").replace(values[0][0]["invoices"]);
						    	});
						}




		     	});


	},
  	helpers: {
          createPBRequest:function(){
                  var requestObject = {
                      mode:"Create",
                      bundleSearch:{
                        region : "Europe",
                        type:"invoices"
                      },
                      paymentBundle:{
                        region:"Europe",
                        periodFrom:'201303',
                        periodTo:'201304',
                        bundleType:'Regular'
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
			  	 	return CurrencyFormat(grossTotal);
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
					return CurrencyFormat(this.attr("totalAmountVal")*fxrate);
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
					return CurrencyFormat(this.attr("totalAmountVal"));
				}

  	 	}
});

function CurrencyFormat(number)
{
  var decimalplaces = 2;
  var decimalcharacter = ".";
  var thousandseparater = ",";
  number = parseFloat(number);
  var sign = number < 0 ? "-" : "";
  var formatted = new String(number.toFixed(decimalplaces));
  if( decimalcharacter.length && decimalcharacter != "." ) { formatted = formatted.replace(/\./,decimalcharacter); }
  var integer = "";
  var fraction = "";
  var strnumber = new String(formatted);
  var dotpos = decimalcharacter.length ? strnumber.indexOf(decimalcharacter) : -1;
  if( dotpos > -1 )
  {
     if( dotpos ) { integer = strnumber.substr(0,dotpos); }
     fraction = strnumber.substr(dotpos+1);
  }
  else { integer = strnumber; }
  if( integer ) { integer = String(Math.abs(integer)); }
  while( fraction.length < decimalplaces ) { fraction += "0"; }
 var temparray = new Array();
  while( integer.length > 3 )
  {
     temparray.unshift(integer.substr(-3));
     integer = integer.substr(0,integer.length-3);
  }
  temparray.unshift(integer);
  integer = temparray.join(thousandseparater);
 if(isNaN(integer)){
 	integer = 0;
 }
  return sign + integer + decimalcharacter + fraction;
}

function showError(id, message){
	$('#'+id).popover({"content":message, "placement":"top"});
	$('#'+id).popover('show');
	$("#"+id+"-err").css("display", "block");
	$('#'+id).parent().addClass("has-error");
}

function removeError(id){
	$('#'+id).popover('destroy');
	$("#"+id+"-err").css("display", "none");
	$('#'+id).parent().removeClass("has-error");
}


export default page;
