import Model from 'can/model/';
import RinsCommon from 'utils/urls';

var newOnAccount = Model.extend({
  create: function(params){
 	return $.ajax({
  		url: RinsCommon.DOMAIN_SERVICE_URL+'onaccount/create',
  		type: 'POST',
      datatype:'json',
      contentType: 'application/json; charset=utf-8',
  		data: JSON.stringify(params)
  	})
  },
  findOne: function(params){
 	return $.ajax({
 		url: RinsCommon.DOMAIN_SERVICE_URL +'onaccount/get',
  		type: 'POST',
  		data: JSON.stringify(params),
  		dataType:'json',
  		contentType: 'application/json'
  	});
}
}, {});

// var newOnAccount = Model.extend({
//   // using finaAll instead of resource because I don't want to be able to save.
//   findOne: 'GET /copyOnAccount'
// }, {});

export default newOnAccount;
