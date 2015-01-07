import Model from 'can/model/';

import RinsCommon from 'utils/urls';
import getUtility from 'utils/getUtility' ;

var Region = Model.extend({
findAll: function(params){

  var getURL = getUtility.createGetURL(params);
  
  return $.ajax({
    url: RinsCommon.UI_SERVICE_URL +'getRegions' +"/?"+getURL,
  		type: 'GET',
  		contentType: 'application/json'
  	});
}
}, {});

export default Region;
