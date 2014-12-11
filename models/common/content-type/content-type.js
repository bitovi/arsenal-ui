import Model from 'can/model/';
import RinsCommon from 'utils/urls';

var ContentType = Model.extend({
	findAll: function(params){
	 	return $.ajax({
	 		url: RinsCommon.UI_SERVICE_URL +'getContentTypes',
	  		type: 'POST',
	  		data: JSON.stringify(params),
	  		dataType:'json',
	  		contentType: 'application/json'
	  	});
	}
	}, {});


/* able to get data in ajax done function*/

export default ContentType;
