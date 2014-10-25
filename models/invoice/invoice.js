import Model from 'can/model/';

var Invoice = Model.extend({
 findOne: 'GET /getInvoiceById/1024',	
 create: function(params){
  /*	$.ajax({
  		url: 'http://ma-rinsd-lapp01.corp.apple.com:8090/rins/invoice/create',
  		type: 'POST',
     	data: params 
  	}).always(function() {
     	return {"errorCode": "0000", "responseText": "Invoice created successfully."}
	});*/
	return "Invoice created successfully."
  }
}, {});

export default Invoice;

