import Model from 'can/model/';
import RinsCommon from 'utils/';

var roles = Model.extend({

  findAll: function(){
      return $.ajax({
        url: RinsCommon.UI_SERVICE_URL +'getUserScreenFieldPermissions',
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json'
      })
  }

}, {});

export default roles;
