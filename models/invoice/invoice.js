import Model from 'can/model/';

var Invoice = Model.extend({
 findOne: 'GET /getInvoiceById/1024',	
 create: function(params){
 	return $.ajax({
  		url: 'http://ma-rinsd-lapp01.corp.apple.com:8090/invoice/create',
  		type: 'POST'
     	//data: params 
  	})
  }
}, {});

export default Invoice;

