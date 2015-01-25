import Model from 'can/model/';
import Urls from 'utils/urls';

var fileManager  = {
  findOne: function(params){
    //console.log(JSON.stringify(params));
    window.location.href = Urls.INTEGRATION_SERVICE_URL +'downloadFile/'+params.fileId+'/'+params.boundType;
    //window.location = 'http://ma-rinst-lap01.corp.apple.com:10645/api/v1/rinsui/integration/downloadFile/605115/INBOUND';
    //window.open('http://ma-rinst-lap01.corp.apple.com:10645/api/v1/rinsui/integration/downloadFile/605115/INBOUND');

    // return $.ajax({
    //   url: Urls.FILE_MANAGER_SERVICE_URL+"downloadFile",
    //   type: 'POST',
    //   data: JSON.stringify(params),
    //   dataType:'json',
    //   contentType: 'application/json'
    //   // http://localhost:8082/api/v1/rinsfilemanager/downloadFileUI/607225/OUTBOUND
    // });
  }
};

export default fileManager;
