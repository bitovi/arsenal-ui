import Model from 'can/model/';
import RinsCommon from 'utils/';

var Country = Model.extend({
findAll: function(params){
 	return $.ajax({
 		url: RinsCommon.UI_SERVICE_URL +'getCountries',
  		type: 'POST',
  		data: JSON.stringify(params),
  		dataType:'json',
  		contentType: 'application/json'
  	});
}
}, {});

export default Country;
