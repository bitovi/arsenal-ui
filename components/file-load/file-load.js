import Component from 'can/component/';
import template from './template.stache!';

import FileLoad from 'models/fileLoad/';

Component.extend ({

 tag: 'file-load',
 template: template,

  scope: {
   isLoaded : false,
   fileList :new can.List(),
 },

 init: function() {

},

helpers: {
        convertToKB: function (size) {
               return ((size/1000) + 'KB')

        }
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
                    $("#cancelUpload").removeAttr("disabled");
             },

             '#submitFiles click': function() {

                  
                  var  fileInfoArray = [];
                  var count = this.scope.attr("fileList").length;
                  $.each(this.scope.attr("fileList"), function(key, file) {
                    
                      var textReader = new FileReader();
                      textReader.onload = function(e) { 
                          var contents = e.target.result;
                          //alert("Name of the file with Contents: " + file.name + contents);
                          var fileInfo = {}
                          fileInfo['fileName'] = file.name;
                          fileInfo['contents'] = contents;
                          fileInfoArray.push(fileInfo)
                      }
                      textReader.readAsText(file);
                      count  = count -1;

                      if(count == 0) {
                          textReader.onloadend = function(e) { 
                              FileLoad.update(fileInfoArray,function(data){
                                alert("Return data:"+JSON.stringify(data));
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

                'li click': function(el, ev) {
                 
                    this.scope.attr("fileList").splice(0,1)
                    var size = this.scope.attr("fileList").length
                    if(size ==0) {
                      this.scope.attr("isLoaded", false);
                    }

                },

               

     }
 
})


