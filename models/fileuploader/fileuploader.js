import Model from 'can/model/';
import RinsCommon from 'utils/';

var FileUpLoader = Model.extend({

  create: function(params) {
    var count = params.length;
    var noofItems = 0;
    var dataToSend = '';
    var boundary = "XXXXX";
    var form_data = new FormData();

    params.forEach(function(file, index) {
      form_data.append(file.name, file);
    });

    return $.ajax({
      url: RinsCommon.UI_SERVICE_URL + 'uploadFiles',
      contentType:false,
      processData: false,
      type: 'POST',
      data: form_data
    });

  }
},{});
export default FileUpLoader;
