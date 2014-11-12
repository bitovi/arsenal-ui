import Model from 'can/model/';
import RinsCommon from 'utils/';

var GLaccounts = Model.extend({
	findAll: function(params){
	 	return $.ajax({
	 		url: RinsCommon.UI_SERVICE_URL +'getGlAccounts',
	  		type: 'POST',
	  		data: JSON.stringify(params),
	  		dataType:'json',
	  		contentType: 'application/json'
	  	});
	}
	}, {});

export default GLaccounts;
