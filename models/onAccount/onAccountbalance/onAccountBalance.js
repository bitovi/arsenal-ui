import Model from 'can/model/';
import RinsCommon from 'utils/';

// var onAccountBalance = Model.extend({
//   // using finaAll instead of resource because I don't want to be able to save.
//   findAll: 'GET /onAccountBalance'
// }, {});


var onAccountBalance = Model.extend({
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

export default onAccountBalance;
