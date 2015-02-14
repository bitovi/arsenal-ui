import Model from 'can/model/';
import RinsCommon from 'utils/urls';
import appstate from 'models/appstate/';

var token = Model.extend({

  findAll: function(){
    //console.log("CALL TO CSRF TOKEN");
    return $.ajax({
      url: RinsCommon.UI_SERVICE_URL +'getCSRF',
      type: 'GET',
      dataType: 'json',
      //contentType: 'application/json',
      //async: false
    })
  }
}, {});



export default token;
