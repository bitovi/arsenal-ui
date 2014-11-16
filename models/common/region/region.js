import Model from 'can/model/';

import RinsCommon from 'utils/';
var Region = Model.extend({
findAll: function(params){
 	return $.ajax({
 		url: RinsCommon.UI_SERVICE_URL +'getRegions',
  		type: 'POST',
  		data: JSON.stringify(params),
  		dataType:'json',
  		contentType: 'application/json'
  	});
}
}, {});

export default Region;
