import Model from 'can/model/';
import Urls from 'utils/urls';

var fileManager = Model.extend({
  downloadFile: function(params){
    return $.ajax({
      url: Urls.INTEGRATION_FILE_MANGER_URL +'downloadFile',
      type: 'POST',
      data: JSON.stringify(params),
      dataType:'json',
      contentType: 'application/json'
    });
  }
}, {});

export default fileManager;
