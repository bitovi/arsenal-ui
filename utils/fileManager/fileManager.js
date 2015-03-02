import Model from 'can/model/';
import Urls from 'utils/urls';

var fileManager  = {
  findOne: function(params){
    window.location.href = Urls.INTEGRATION_SERVICE_URL +'downloadFile/'+params.fileId+'/'+params.boundType;
  },
  downloadFile:function(fileName){
    window.location.href = Urls.INTEGRATION_SERVICE_URL+'downloadrinsin/'+fileName;
  }
};

export default fileManager;
