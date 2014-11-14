import Component from 'can/component/';
import template from './template.stache!';

import FileLoad from 'models/fileLoad/';

import RinsCommon from 'utils/';

Component.extend ({

 tag: 'file-load',
 template: template,

  scope: {
   isLoaded : false,
   fileList :[],

   removeUpload : function(file, ev, el){
        var idx = this.attr("fileList").indexOf(file);
        if(confirm('Are you sure?')){
          this.attr("fileList").splice(idx, 1);
        };

        var size = this.attr("fileList").length
        if(size ==0) {
            this.attr("isLoaded", false);
         }
      }

},



 init: function() {

},



helpers: {
        convertToKB: function (size) {
          return (Math.max(size/1024, 0.1).toFixed(1)  + 'KB')
        },
       
},


 events: {

             '#uploadFiles  click': function() {
                  $("#fileSelect").click();
              },

             '#fileSelect change' : function() {

                 var control = document.getElementById("fileSelect");
                 var count = this.scope.attr("fileList").length;
                 var files = control.files;
                    
                  var output = [];
                  for (var i = 0, f; f = files[i]; i++) {
                      this.scope.attr("fileList").push(f);

                  }
                     this.scope.attr("isLoaded", true);
             },

             '#submitFiles click': function() {

                  var count = this.scope.attr("fileList").length;
                  var dataToSend = '';
                  var boundary = RinsCommon.BOUNDARY 
                  $.each(this.scope.attr("fileList"), function(key, file) {
                      var text = '--' + boundary + '\r\n' + 'Content-Disposition: form-data; name="uploadedFile";';
                      var textReader = new FileReader();
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
                      textReader.readAsDataURL(file);
                      count  = count -1;
                     
                      if(count == 0) {
                          
                          textReader.onloadend = function(e) { 


                              FileLoad.findOne(dataToSend,function(data) {
                                 //document.write (dataToSend);
                               console.log(JSON.stringify(data));
                              },function(xhr){
                                console.error("Error while loading:"+xhr);
                            });

                          } 

                        }
                  });
                       
                },

                '#cancelUpload click': function() {

                    this.scope.attr("isLoaded", false);
                    var size = this.scope.attr("fileList").length
                    this.scope.attr("fileList").splice(0,size)
                },

                
     }
 
})






