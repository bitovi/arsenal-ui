import Model from 'can/model/';
import RinsCommon from 'models/rinsCommon/';

var Invoice = Model.extend({
 findOne: 'GET /getInvoiceById/1024',
 create: function(params){
 	return $.ajax({
  		url: RinsCommon.DOMAIN_SERVICE_URL+'invoice/create',
  		type: 'POST'
     	//data: params
  	})
  },
  /*findOne: function(params){
 	return $.ajax({
  		url: RinsCommon.DOMAIN_SERVICE_URL+'invoice/getByID',
  		type: 'POST'
     	//data: params
  	})
  },*/
  update: function(data){
 	return $.ajax({
  		url: RinsCommon.DOMAIN_SERVICE_URL+'invoice/update',
  		type: 'POST'
     	//data: params
  	})
  }
}, {});

export default Invoice;
