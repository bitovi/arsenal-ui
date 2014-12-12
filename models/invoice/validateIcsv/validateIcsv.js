import Model from 'can/model/';
import RinsCommon from 'utils/urls';


// var ValidateIcsv = Model.extend({
// 	findAll: 'GET /validateicsv'
// }, {});

/* Below is service call. Commenting due to unavailability of service*/
var ValidateIcsv = Model.extend({
 findOne: function(params){
	  	return $.ajax({
	  		url: RinsCommon.DOMAIN_SERVICE_URL +'invoice/icsv/validate',
	   		type: 'POST',
	   		data: JSON.stringify(params),
	   		dataType:'json',
	   		contentType: 'application/json'
	   	});
 	}
}, {});


export default ValidateIcsv;