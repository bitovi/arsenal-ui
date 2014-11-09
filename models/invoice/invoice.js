import Model from 'can/model/';
import RinsCommon from 'utils/';

var Invoice = Model.extend({
 //findOne: 'GET /getInvoiceById/1024',
 create: function(params){
 	return $.ajax({
  		url: RinsCommon.DOMAIN_SERVICE_URL+'invoice/create',
  		type: 'POST',
  		data: JSON.stringify(params),
  	    dataType: 'json'
  	})
  },
  findOne: function(params){
 	return $.ajax({
  		url: RinsCommon.DOMAIN_SERVICE_URL+'invoice/getByID',
  		type: 'POST',
  		data: JSON.stringify(params),
  	  	dataType: 'json'
  	})
  },
  update: function(data,type){
    if(type=="invoiceDelete"){
      console.log("here invoice delete")
        return $.ajax({
          url: RinsCommon.DOMAIN_SERVICE_URL+'invoice/delete',
          type: 'POST'
          //data: JSON.stringify(params)
        })
    } else {
      return $.ajax({
          url: RinsCommon.DOMAIN_SERVICE_URL+'invoice/update',
          type: 'POST'
          //data: params
        })
    }
  }
}, {});

export default Invoice;
