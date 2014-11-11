import Model from 'can/model/';
import RinsCommon from 'utils/';

var Country = Model.extend({
    findAll: 'POST ' + RinsCommon.UI_SERVICE_URL + 'getCountries',
    //findOne: 'POST ' + RinsCommon.UI_SERVICE_URL + 'getCountriesRegion',
    findOne: function(params){
	 	return $.ajax({
	  		url: RinsCommon.UI_SERVICE_URL +'getCountriesRegion',
	  		type: 'POST',
	  		data: JSON.stringify(params),
	  	  	dataType: 'json'
	  	})
	}

}, {});

export default Country;
