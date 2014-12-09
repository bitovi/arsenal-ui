import Model from 'can/model/';

import RinsCommon from 'utils/';

var FXRate = Model.extend({
findAll: function(params){
 	return $.ajax({
 		url: RinsCommon.UI_SERVICE_URL +'getFXRate',
  		type: 'POST',
  		data: JSON.stringify(params),
  		dataType:'json',
  		contentType: 'application/json'
  	});
}
}, {});

export default FXRate;

