import Model from 'can/model/';
import RinsCommon from 'utils/';

var Invoice = Model.extend({
 //findOne: 'GET /getInvoiceById/1024',
 create: function(params){
 	return $.ajax({
  		url: RinsCommon.DOMAIN_SERVICE_URL+'invoice/create',
  		type: 'POST',
      datatype:'json',
      contentType: 'application/json; charset=utf-8',
  		data: JSON.stringify(params)
  	})
  },
  findOne: function(params){
 	return $.ajax({
  		url: RinsCommon.DOMAIN_SERVICE_URL+'invoice/getByID',
  		type: 'POST',
      datatype:'json',
      contentType: 'application/json; charset=utf-8',
  		data: JSON.stringify(params)
  	})
  },
  update: function(params,type){
    if(type=="invoiceDelete"){
     return $.ajax({
          url: RinsCommon.DOMAIN_SERVICE_URL+'invoice/delete',
          type: 'POST',
          datatype:'json',
          contentType: 'application/json; charset=utf-8',
          data: JSON.stringify(params)
        })
    } else {
      return $.ajax({
          url: RinsCommon.DOMAIN_SERVICE_URL+'invoice/update',
          type: 'POST',
          datatype:'json',
          contentType: 'application/json; charset=utf-8',
          data: JSON.stringify(params)
        })
    }
  }
}, {});

export default Invoice;
