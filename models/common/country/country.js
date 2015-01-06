import Model from 'can/model/';
import RinsCommon from 'utils/urls';

var Country = Model.extend({
findAll: function(params){

 	return $.ajax({
     url: RinsCommon.UI_SERVICE_URL +'getCountries'+'/'+params.entityId+"/"+params.regionId,
  		type: 'GET',
  		//data: JSON.stringify(params),
  		//dataType:'json',
  		contentType: 'application/json'
  	});
}
}, {});

export default Country;
