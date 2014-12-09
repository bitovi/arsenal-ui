import Model from 'can/model/';
import RinsCommon from 'utils/';



var pricingMethods = Model.extend({

    findAll: 'GET /getPricingMethods'

    // findAll: function(params){
    //  	return $.ajax({
    //  		contentType: 'application/json; charset=utf-8',
    //   		url: RinsCommon.UI_SERVICE_URL +'getModelList',
    //   		type: 'POST',
    //   		data: JSON.stringify(params),
    //   		dataType:'json'
    //   	});
    // }
}, {});

export default pricingMethods;
