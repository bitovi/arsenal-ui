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
  	totalAmount:[],
  	totAmount:function(){
  		//return this.attr("totalAmount");
  		this.totalAmount.attr().length;
  		var total = 0;
        for(var i =0; i < this.totalAmount.attr().length; i++){
        		total += parseInt(this.totalAmount.attr(i));
        }
       return total;
     //  console.log(this.attr("totalAmount")+"edqwdeqwe");
  	},
  	totalAms:2

  //	amount: []
  },
  events: {
    	"inserted": function(){
           var self = this;  
  
    		//alert(amountMapInstance.totalAmount);
	    		$('#invoiceform').bootstrapValidator({
	    			container: 'tooltip',
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
			                    } 
			                }
			            },
			            fxrate: {
			                validators: {
			                    notEmpty: {
			                        message: 'The licensor notes is required'
			                    }
			                }
			            },
			            licnotes: {
			                validators: {
			                    notEmpty: {
			                        message: 'The licensor notes is required'
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
			                validators: {
			                    notEmpty: {
			                        message: 'The invoicedate is required'
			                    }
			                }
			            },
			            invoiceduedate :{
			                validators: {
			                    notEmpty: {
			                        message: 'The invoiceduedate is required'
			                    }
			                }
			            },
			            receiveddate :{
			                validators: {
			                    notEmpty: {
			                        message: 'The receiveddate is required'
			                    }
			                }
			            }

			         }
			    }).on('error.field.bv', function(e, data) {
			    	$("#"+data.field+"-err").css("display", "block");
			    	
			    	
           
        		}).on('success.field.bv', function(e, data) {
        			$("#"+data.field+"-err").css("display", "none");
        			
			          
			  	}).on('success.form.bv', function(e) {
			  			var res = $('#invoiceform').serializeArray();
                        console.log(res);
                        return false;

       		 });
         /*Total amount code*/

         /*$("input[id^='amountText']").blur(function(event){
         	self.scope.totalAmount.push(event.currentTarget.value);
         	console.log(event.currentTarget.value);
         	alert("yes");
         })*/

		//console.log($("input[id^='amountText']").val());


         },
         ".classAmtTotal blur": function(event){
         	this.scope.totalAmount.push(event[0].value);
         	//this.scope.attr().totalAms = 30;
         	console.log(this.scope.totalAmount.attr());
         },
         ".addRow click":function(){
         	
         	var self = this;
         	//console.log(self.scope.attr("rowindex"));
         	var rowindex = self.scope.attr("rowindex");
         	self.scope.attr("rowindex", rowindex + 1)
            

			//rowindex++;
			$("#breakrow0").after($("#breakrow0").clone().attr("id","breakrow" + rowindex));
			$("#breakrow" + rowindex + " .removeRow").attr("id","removeRow" + rowindex);
			$("#breakrow" + rowindex + " .amountText").attr("id","amountText" + rowindex);

			
			$("#removeRow" + rowindex).click(function(){
		            $(this).closest("tr").remove();
		     }); 
			
		

		}
    
   },
   init: function(){
   	 	var self = this;
   	 	Promise.all([
			      	InvoiceType.findAll(),
			       	ContentType.findAll(),
			        Licensor.findAll(),
			        Country.findAll(),
			        Currency.findAll()
				]).then(function(values) {
		     		 self.scope.attr("invoiceTypes").replace(values[0][0]["invoiceTypes"]);
		     		 self.scope.attr("contentType").replace(values[0][0]["contentTypes"]);
		     		 self.scope.attr("licensor").replace(values[0][0]["licensors"]);
		     		 self.scope.attr("country").replace(values[0][0]["countries"]);
		     		 self.scope.attr("currency").replace(values[0][0]["currencies"]);

				});

    /*     var amountMap = can.Map({
         			amount:0,
         			totalAmount:function(){
						return this.attr('amount');
         			}
         });*/

  /* var amountMap = new can.Map({
   			amount0:null,
   			totalamount:function(){
					console.log(this.attr());
			}
					
   })*/

       

       // console.log(amountMap);
       // console.log(amountMapInst);
	},
  helpers: {
  	 totalAmountCal: function(){
  	 	var tot = this.attr("totalAmount");
  	 	return tot.length;
  	 }

  }
});

export default page;
