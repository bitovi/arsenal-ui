import Model from 'can/model/';
import RinsCommon from 'utils/';

var FileUpLoader = Model.extend({

    create: function(params) {
      var count = params.length;
      var noofItems = 0;
      var dataToSend = '';
      params.forEach(function(file, index) {

           var boundary = RinsCommon.BOUNDARY
           var text = '--' + boundary + '\r\n' + 'Content-Disposition: form-data; name="uploadedFile";';
           var textReader = new FileReader();

           textReader.readAsDataURL(file);
           textReader.onload = function(e) {
                var contents = e.target.result;
                text +="filename="
                text += file.name;
                text += '\r\n';
                text +='Content-Type:'
                text += file.type
                text += '\r\n\r\n';
                var matches = contents.match(/^data:.+\/(.+);base64,(.*)$/);
                text += matches[2];
                text += '\r\n'
                dataToSend += text;
                dataToSend += "\r\n";
            }
            textReader.onloadend = function(e) {
               noofItems = noofItems + 1
               if(count == noofItems) {
                return $.ajax({
                        url: RinsCommon.UPLOAD_SERVICE_URL,
                        type: 'POST',
                        contentType: 'multipart/form-data;boundary=' + RinsCommon.BOUNDARY +';' ,
                        processData: false,
                        data: dataToSend
                      });
                }
          }

      });
    }
   } ,{});
export default FileUpLoader;
