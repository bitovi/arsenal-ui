import Model from 'can/model/';

import RinsCommon from 'utils/urls';
var StoreType = Model.extend({
	findAll: function(params){
	 	return $.ajax({
	 		url: RinsCommon.UI_SERVICE_URL +'getStoreTypes',
	  		type: 'POST',
	  		data: JSON.stringify(params),
	  		dataType:'json',
	  		contentType: 'application/json'
	  	});
	}
}, {});

export default StoreType;
