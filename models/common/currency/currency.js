import Model from 'can/model/';
import RinsCommon from 'utils/';

var Currency = Model.extend({
   findAll: function(params){
 	return $.ajax({
 		url: RinsCommon.UI_SERVICE_URL +'getCurrencies',
  		type: 'POST',
  		data: JSON.stringify(params),
  		dataType:'json',
  		contentType: 'application/json'
  	});
}
}, {});


export default Currency;