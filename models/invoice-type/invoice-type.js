import Model from 'can/model/';

var InvoiceType = Model.extend({

	findAll: function(){
		return $.ajax({
			url: 'http://ma-rinsd-lapp01.corp.apple.com:8090/rins/common/getInvoiceTypes',
			type: 'POST'
		})
	}
	//findAll: 'GET /invoiceType'
}, {});

/* able to get data in ajax done function*/

export default InvoiceType;
