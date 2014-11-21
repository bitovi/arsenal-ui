import Model from 'can/model/';
import RinsCommon from 'utils/';



var InvoiceType = Model.extend({
  /*  findAll: function(params){
     	return $.ajax({
     		contentType: 'application/json; charset=utf-8',
      		url: RinsCommon.UI_SERVICE_URL +'getInvoiceTypes',
      		type: 'POST',
      		data: JSON.stringify(params),
      		dataType:'json'
      	});
    }*/

findAll: "GET /invoiceType"

}, {});

export default InvoiceType;
