import Model from 'can/model/';

var roles = Model.extend({

  findAll: function(){
      return $.ajax({

        //url: 'https://ankur.apple.com:8448/api/v1/rinsui/getUserScreenFieldPermissions',
        url: RinsCommon.UI_SERVICE_URL +'getUserScreenFieldPermissions',
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json'
      })
  }

}, {});

export default roles;
