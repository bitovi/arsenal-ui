import Component from 'can/component/';

import datePicker from 'components/date-picker/';

import css_bootstrapValidator from 'bootstrapValidator.css!';

import bootstrapValidator from 'bootstrapValidator';

import template from './template.stache!';
import styles from './page-add-invoice.less!';

import InvoiceType from 'models/invoice-type/';

var page = Component.extend({
  tag: 'page-add-invoice',
  template: template,
  scope: {
  	rowindex:1,
  	invoiceTypes: []
  //	amount: []
  },
  events: {
    	"inserted": function(){
    		
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
         },
         ".addRow click":function(){
         	
         	var self = this;
         	//console.log(self.scope.attr("rowindex"));
         	var rowindex = self.scope.attr("rowindex");
         	self.scope.attr("rowindex", rowindex + 1)
            

			//rowindex++;
			$("#breakrow0").after($("#breakrow0").clone().attr("id","breakrow" + rowindex));
			$("#breakrow" + rowindex + " .removeRow").attr("id","removeRow" + rowindex);
			
			$("#removeRow" + rowindex).click(function(){
		            $(this).closest("tr").remove();
		     }); 
		}
    
   },
   init: function(){
   	 	Promise.all([
		      InvoiceType.findAll()
		     	]).then(function(values) {
		      self.scope.invoiceTypes.replace(values[0]);
		 });
   },
  helpers: {

  }
});

export default page;
