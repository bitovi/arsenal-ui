import Model from 'can/model/';
import RinsCommon from 'utils/urls';

var Currency = Model.extend({
   findAll: function(params){
 	   return $.ajax({
 		     url: RinsCommon.UI_SERVICE_URL +'getCurrencies',
		     type: 'POST',
  		   data: JSON.stringify(params),
  		   dataType:'json',
  		   contentType: 'application/json'
  	    });
      },
    getCurrByRegion: function(regionId){
        return $.ajax({
          url: RinsCommon.UI_SERVICE_URL +'getCurrenciesByRegionId?regionId='+regionId,
          type: 'GET',
          contentType: 'application/json'
        });
    }
}, {});


export default Currency;
