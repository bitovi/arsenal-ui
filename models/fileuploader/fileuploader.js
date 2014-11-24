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
                //Retained below code snippet for future reference if needed.
                /* var boundary = "XXXXX"
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
                 contentType: 'multipart/form-data;boundary=' + boundary +';' ,
                 processData: false,
                 data: dataToSend
                 });
                 }
                 }*/
            });

            return $.ajax({
                url: RinsCommon.UPLOAD_SERVICE_URL,
                // contentType: 'multipart/form-data;boundary=-------------gc0p4Jq0M2Yt08jU534c0p',
                contentType:false,
                processData: false,
                type: 'POST',
                data: form_data
            });

        }
    },{});
    export default FileUpLoader;