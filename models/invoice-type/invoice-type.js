import Model from 'can/model/';

var InvoiceType = Model.extend({
  // using finaAll instead of resource because I don't want to be able to save.
findAll: function(){
	  	return $.ajax({
	  		url: 'http://ma-rinsd-lapp01.corp.apple.com:8090/rins/common/getInvoiceTypes',
	  		type: 'POST',
	  		dataType: 'json'
	  	})
  } 
//findAll: 'GET /invoiceType'  /* To remove the error. Please commemnt above return statement and uncoment this line.

}, {});

/* able to get data in ajax done function*/

export default InvoiceType;