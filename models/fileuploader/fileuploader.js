import Model from 'can/model/';
import RinsCommon from 'utils/urls';

var FileUpLoader = Model.extend({

    create: function(params,control) {
        var count = params.length;
        var noofItems = 0;
        var dataToSend = '';
        var form_data = new FormData();
        var fileArry=params.__fileToUpload;
        var progressCtrl=params.__progressCtr;
        console.log("File Test &&&&&&&&&&4444&&&&&&&&&&&& forming file array");
        fileArry.forEach(function(file, index) {
            form_data.append(file.name, file);
        });
        console.log("File Test &&&&&&&&&&55555&&&&&&&&&&&& after forming file array. Just before calling upload service");
        var uploadedDetails = $.ajax({
            /*xhr: function () {
                var xhr = new window.XMLHttpRequest();
                //Download progress
                xhr.upload.addEventListener("progress", function (evt) {
                    if(evt.lengthComputable){
                      var percent = Math.round((event.loaded / event.total) * 100);
                      $('#'+progressCtrl).css('width',percent+'%');
                      $('#'+progressCtrl).html(percent+'%');
                    }
                }, false);
                return xhr;
            },*/
            url:RinsCommon.UI_SERVICE_URL+'uploadFiles',
            contentType:false,
            processData: false,
            type: 'POST',
            data: form_data
        });
        return uploadedDetails;

    }
},{});


export default FileUpLoader;
