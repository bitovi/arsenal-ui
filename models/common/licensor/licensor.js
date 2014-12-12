import Model from 'can/model/';

import RinsCommon from 'utils/urls';

var Licensor = Model.extend({
    findAll: function(params){
     	return $.ajax({
      		url: RinsCommon.UI_SERVICE_URL +'getLicensors',
      		//url: 'http://17.149.230.135:10645/getLicensors',
      		type: 'POST',
      		data: JSON.stringify(params),
      		dataType:'json',
      		contentType: 'application/json'
      	});
    }
}, {});


/* able to get data in ajax done function*/

export default Licensor;
