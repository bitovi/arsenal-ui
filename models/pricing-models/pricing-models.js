import Model from 'can/model/';
import RinsCommon from 'utils/urls';

var pricingModels = Model.extend({
 findOne: function(params){

 		if(params.reqType === 'summary'){
 				delete params.reqType;
	 			return $.ajax({
			 		url: RinsCommon.UI_SERVICE_URL +'getPricingModels',
			  		type: 'POST',
			  		data: JSON.stringify(params),
			  		dataType:'json',
			  		contentType: 'application/json'
		  		});
 		}
 		else if(params.reqType === 'details'){
 				delete params.reqType;
 				return $.ajax({
					url: RinsCommon.UI_SERVICE_URL +'getPricingModelParameterDetails',
		 			type: 'POST',
		  			data: JSON.stringify(params),
		  			dataType:'json',
		  			contentType: 'application/json'
		  		});
			}
		else if(params.reqType === 'modeltype'){
			delete params.reqType;
			return $.ajax({
		 		url: RinsCommon.UI_SERVICE_URL +'getPricingModelTypes',
		  		type: 'POST',
		  		data: JSON.stringify(params),
		  		dataType:'json',
		  		contentType: 'application/json'
	  		});
		}
		else if(params.reqType === 'pmVersion'){
			delete params.reqType;
			return $.ajax({
		 		url: RinsCommon.UI_SERVICE_URL +'getPricingModelsForModelDescription',
		  		type: 'POST',
		  		data: JSON.stringify(params),
		  		dataType:'json',
		  		contentType: 'application/json'
	  		});
		}
	},
	create: function(params){
		//var RinsCommon.UI_SERVICE_URL = "http://localhost:10645/api/v1/rinsui/";
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
