import Model from 'can/model/';
import RinsCommon from 'utils/';

var newOnAccount = Model.extend({
  create: function(params){
 	return $.ajax({
  		url: RinsCommon.DOMAIN_SERVICE_URL+'onaccount/create',
  		type: 'POST',
      datatype:'json',
      contentType: 'application/json; charset=utf-8',
  		data: JSON.stringify(params)
  	})
  }
}, {});

export default newOnAccount;
