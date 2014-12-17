import Model from 'can/model/';
import Urls from 'utils/urls';

var fileManager = Model.extend({
  downloadFile: function(params){
    return $.ajax({
      url: Urls.FILE_MANAGER_SERVICE_URL +'downloadFileUI/'+params.files.fileId+'/'+params.files.boundType,
      type: 'GET'
      // data: JSON.stringify(params),
      // dataType:'json',
      // contentType: 'application/json'
      // http://localhost:8082/api/v1/rinsfilemanager/downloadFileUI/607225/OUTBOUND
    });
  }
}, {});

export default fileManager;
