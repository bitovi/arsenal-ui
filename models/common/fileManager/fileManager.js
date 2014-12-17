import Model from 'can/model/';
import Urls from 'utils/urls';

var fileManager = Model.extend({
  downloadFile: function(params){
    return $.ajax({
      url: Urls.INTEGRATION_SERVICE_URL +'rinsfilemanager/downloadFile',
      type: 'POST',
      data: JSON.stringify(params),
      dataType:'json',
      contentType: 'application/json'
    });
  }
}, {});

export default fileManager;
