import Model from 'can/model/';
import RinsCommon from 'utils/urls';
import appstate from 'models/appstate/';

var token = Model.extend({

  findAll: function(){
    return $.ajax({
      url: RinsCommon.UI_SERVICE_URL +'getCSRF',
      type: 'GET',
      dataType: 'json',
      contentType: 'application/json',
      async: false
    })
  }
}, {});



export default token;
