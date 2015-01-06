import Model from 'can/model/';

import RinsCommon from 'utils/urls';
var Region = Model.extend({
findAll: function(params){
 	return $.ajax({
 		url: RinsCommon.UI_SERVICE_URL +'getRegions',
  		type: 'GET',
  		//data: JSON.stringify(params),
  		//dataType:'json',
  		contentType: 'application/json'
  	});
}
}, {});

export default Region;
