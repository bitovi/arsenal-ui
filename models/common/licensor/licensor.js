import Model from 'can/model/';

import RinsCommon from 'utils/';

var Licensor = Model.extend({
    findAll: function(params){
     	return $.ajax({
     		contentType: 'application/json; charset=utf-8',
      		url: RinsCommon.UI_SERVICE_URL +'getLicensors',
      		type: 'POST',
      		data: JSON.stringify(params),
      		dataType:'json'
      	});
    }
}, {});


/* able to get data in ajax done function*/

export default Licensor;
