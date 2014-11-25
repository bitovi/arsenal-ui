import Model from 'can/model/';
import RinsCommon from 'utils/';

var pricingModels = Model.extend({
  // using findAll instead of resource because I don't want to be able to save.
// findAll: 'GET /pricingModels',
 findOne: function(params, type){
 		if(type == 'summary'){
	 			return $.ajax({
			 		url: RinsCommon.UI_SERVICE_URL +'getPricingModels',
			  		type: 'POST',
			  		data: JSON.stringify(params),
			  		dataType:'json',
			  		contentType: 'application/json'
		  		});
 		}
 		else if(type == 'details'){
 			return $.ajax({
			 		url: RinsCommon.UI_SERVICE_URL +'getPricingModelDetails',
			  		type: 'POST',
			  		data: JSON.stringify(params),
			  		dataType:'json',
			  		contentType: 'application/json'
		  		});
			}
		else if(type == 'modeltype'){
			return $.ajax({
		 		url: RinsCommon.UI_SERVICE_URL +'getPricingModelTypes',
		  		type: 'POST',
		  		data: JSON.stringify(params),
		  		dataType:'json',
		  		contentType: 'application/json'
	  		});
		}
	},
	create: function(params){
	 	return $.ajax({
	  		url: RinsCommon.UI_SERVICE_URL +'updatePricingModelDetails',
	  		type: 'POST',
	      	datatype:'json',
	      	contentType: 'application/json; charset=utf-8',
	  		data: JSON.stringify(params)
	  	});
   }
	
 
}, {});

export default pricingModels;


