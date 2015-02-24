import Model from 'can/model/';
import RinsCommon from 'utils/urls';
import appstate from 'models/appstate/';

var counter = Model.extend({
  findOne: function(params){
    return $.ajax({
      url: RinsCommon.UI_SERVICE_URL+'getCounter',
      type: 'POST',
      data: JSON.stringify(params),
      dataType:'json',
      contentType: 'application/json'
    })
  }
}, {});

export default counter;
