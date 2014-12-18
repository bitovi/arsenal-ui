import Model from 'can/model/';
import RinsCommon from 'utils/urls';



var PricingModelVersion = Model.extend({

    // findAll: 'GET /getPricingModelVersion'

    findOne: function(params){
     	return $.ajax({
     		  contentType: 'application/json; charset=utf-8',
      		url: RinsCommon.UI_SERVICE_URL +'getPricingModelVersions',
      		type: 'POST',
      		data: JSON.stringify(params),
      		dataType:'json'
      	});
    }
}, {});

export default PricingModelVersion;
