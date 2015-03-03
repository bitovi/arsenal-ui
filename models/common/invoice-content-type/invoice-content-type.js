import Model from 'can/model/';
import RinsCommon from 'utils/urls';

var InvoiceContentType = Model.extend({
	findAll: function(params){
	 	return $.ajax({
	 		url: RinsCommon.UI_SERVICE_URL +'getInvoiceContentTypes',
	  		type: 'GET',
	  		//data: JSON.stringify(params),
	  		//dataType:'json',
	  		contentType: 'application/json'
	  	});
	}
	}, {});


/* able to get data in ajax done function*/

export default InvoiceContentType;
