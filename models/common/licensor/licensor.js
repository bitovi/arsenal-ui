import Model from 'can/model/';

import RinsCommon from 'utils/';

var Licensor = Model.extend({

    findAll: 'POST ' + RinsCommon.UI_SERVICE_URL + 'getLicensors',
    //findOne: 'POST ' + RinsCommon.UI_SERVICE_URL + 'getLicensorsRegion'
    findOne: function(params){
	 	return $.ajax({
	  		url: RinsCommon.UI_SERVICE_URL +'getLicensors',
	  		type: 'POST',
	  		data: JSON.stringify(params),
	  	  	dataType: 'json'
	  	})
	}

}, {});


/* able to get data in ajax done function*/

export default Licensor;
