  import Component from 'can/component/';
  import template from './template.stache!';
  import FileUpLoader from 'models/fileuploader/';
  import compute from 'can/compute/';
  import _less from './file-uploader.less!';

  var FileUploader = Component.extend ({

        tag: 'rn-file-uploader',
        template: template,
        scope: {
                  fileList : new can.List(),
                  displayMessage:"display:none",
                  fileUpload:false,
                  uploadedfileinfo:[],
                  isAnyFileLoaded : can.compute(function() { return this.fileList.attr('length') > 0; })

              },
        helpers: {
                convertToKB: function (size) {
                  return (Math.max(size/1024, 0.1).toFixed(1)  + 'KB');
                }
        },
        events: {
                 '.uploadFiles click': function() {
                    this.element.find('input[type=file]').click();
                    this.scope.attr("fileUpload" , true);
                  },
                 '.fileSelect change' : function(el, ev) {
                    var files = el[0].files;
                    this.scope.fileList.push.apply(this.scope.fileList, files);
                  },
                 '.submitFiles click': function() {
                    var self = this;
                    var size = this.scope.attr("fileList").length;
                    FileUpLoader.create(this.scope.attr("fileList"),function(data) {
                    self.scope.attr("fileUpload" , true);
                    var response = data.filePropeties[0];
                    if(response.status=='SUCCESS'){
                      /*passing file length here to parent component*/
                       $('.success').empty().html(response.responseText);
                      $(self.element).trigger('onSelected', data);
                    }else{
                       $('.fileError').empty().html(response.responseText);
                    }
                    //console.log("Success")
                    },function(xhr) {
                      console.error("Error while loading:"+xhr);
                    });
                  },
                '.cancelUpload click': function() {
                    var size = this.scope.attr("fileList").length;
                    this.scope.attr("fileList").splice(0,size);
                     var uploadedfileinfoSize = this.scope.uploadedfileinfo.length;
                    this.scope.uploadedfileinfo.splice(0,uploadedfileinfoSize);
                },
                '.filelist li click': function(el, ev) {
                   var liText = el.text();
                    var index = liText.indexOf("(");
                    var name = '';
                    var selectedIndex = '';
                    if(index != -1) {
                      name = liText.substring(0,index);
                      this.scope.attr("fileList").forEach(function(file, index) {
                          if(file.name == name.trim()) {
                            selectedIndex = index;
                          }
                      });
                    }
                      this.scope.attr("fileList").splice(selectedIndex,1);
                }
            }
      })

  export default FileUploader;
