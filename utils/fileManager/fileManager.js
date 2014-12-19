import Model from 'can/model/';
import Urls from 'utils/urls';

var fileManager  = {
  downloadFile: function(params){
    //console.log(JSON.stringify(params));
    window.location.href = Urls.FILE_MANAGER_SERVICE_URL +'downloadFileUI/'+params.fileId+'/'+params.boundType;
    // return $.ajax({
    //   url:
    //   type: 'GET'
    //   // data: JSON.stringify(params),
    //   // dataType:'json',
    //   // contentType: 'application/json'
    //   // http://localhost:8082/api/v1/rinsfilemanager/downloadFileUI/607225/OUTBOUND
    // });
  }
};

export default fileManager;
