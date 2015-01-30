import Model from 'can/model/';
import RinsCommon from 'utils/urls';

var logout = Model.extend({

  find: function(){

    return $.ajax({
      url: RinsCommon.UI_SERVICE_URL_CONTEXT +'logout',
      type: 'GET',
      dataType: 'json',
      contentType: 'application/json',
      async: false
    })
  }
}, {});



export default logout;
