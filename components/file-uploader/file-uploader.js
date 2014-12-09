  import Component from 'can/component/';
  import template from './template.stache!';
  import FileUpLoader from 'models/fileuploader/';
  import RinsCommon from 'utils/';
  import compute from 'can/compute/';
  import _less from './file-uploader.less!';

  var FileUploader = Component.extend ({

        tag: 'rn-file-uploader',
        template: template,

        scope: {
                  fileList : new can.List(),
                  isAnyFileLoaded : can.compute(function() { return this.fileList.attr('length') > 0; }),

                  removeSelectedFile : function(file, ev, el) {
                      var idx = this.attr("fileList").indexOf(file);
                      this.attr("fileList").splice(idx, 1);
                   },
                   uploadedfileinfo:[]
              },
        init: function() {

        },
        helpers: {
                convertToKB: function (size) {
                  return (Math.max(size/1024, 0.1).toFixed(1)  + 'KB');
                },
        },
        events: {

                 '#uploadFiles  click': function() {
                    console.log('Inside upload');
                    this.element.find('input[type=file]').click();
                  },

                 '#fileSelect change' : function(el, ev) {
                   console.log('Inside fileSelect');
                    var files = el[0].files;
                    this.scope.fileList.push.apply(this.scope.fileList, files);
                   },

                 '#submitFiles click': function() {
                    var self =this;
                    var count = this.scope.attr("fileList").length;
                    var totalfile = count;
                    var dataToSend = '';
                    var boundary = RinsCommon.BOUNDARY
                    var fileArr = [];
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
                        
                        textReader.onloadend = function(e) {
                        if(count == 0) {
                           var fileObj = {};
                            FileUpLoader.create(dataToSend,function(data) {
                               fileObj = {filepath:data.filePropeties[0].filePath, filename:data.filePropeties[0].fileName};
                               
                               var response = data.filePropeties[0].status; 
                                 successeve(response);
                                 },function(xhr) {
                                console.error("Error while loading:"+xhr);
                                }).then(function(values){
                                fileArr.push(fileObj);
                                if(fileArr.length == totalfile){
                                     self.scope.uploadedfileinfo.replace(fileArr);
                                }
                              });
                            }
                          }
                        
                        function successeve(response){
                          if(response=='SUCCESS'){
                            /*passing file length here to parent component*/
                            $(self.element).trigger('onSelected', response);
                          }
                        }
                        textReader.readAsDataURL(file);
                        count  = count - 1;

                      });
                //console.log(fileArr);
              
  
                },

                '#cancelUpload click': function() {
                    var size = this.scope.attr("fileList").length;
                    this.scope.attr("fileList").splice(0,size);
                    var uploadedfileinfoSize = this.scope.uploadedfileinfo.length;
                    this.scope.uploadedfileinfo.splice(0,uploadedfileinfoSize);

                },

            }
      })

  export default FileUploader;
