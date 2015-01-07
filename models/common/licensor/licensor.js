import Model from 'can/model/';

import RinsCommon from 'utils/urls';
import getUtility from 'utils/getUtility' ;

var Licensor = Model.extend({
    findAll: function(params){

      var getURL = getUtility.createGetURL(params);
      console.log(getURL);

     	return $.ajax({
      		url: RinsCommon.UI_SERVICE_URL +'getLicensors' +"/?"+getURL,
      		type: 'GET',
      		contentType: 'application/json'
      	});
    }
}, {});


/* able to get data in ajax done function*/

export default Licensor;
