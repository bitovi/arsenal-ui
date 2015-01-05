import Model from 'can/model/';
import RinsCommon from 'utils/urls';

var roles = Model.extend({

  findAll: function(params){
    return $.ajax({
      url: RinsCommon.UI_SERVICE_URL +'getUserScreenFieldPermissions',
      type: 'POST',
      dataType: 'json',
      data: JSON.stringify(params),
      contentType: 'application/json'
    })
  }

}, {});

export default roles;
