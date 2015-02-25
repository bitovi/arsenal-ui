import Component from 'can/component/';
import template from './template.stache!';
import FileUpLoader from 'models/fileuploader/';
import compute from 'can/compute/';
import _less from './file-uploader.less!';
import fileManager from 'utils/fileManager/'
import commonUtils from 'utils/commonUtils';
import stache from 'can/view/stache/';

var FileUploader = Component.extend ({

      tag: 'rn-file-uploader',
      template: template,
      scope: {
            fileList : new can.List(),
            appstate:undefined,
            displayMessage:"display:none",
            fileUpload:false,
            uploadedfileinfo:[],
            isAnyFileLoaded : can.compute(function() { return this.fileList.attr('length') > 0; }),
            isSuccess: false,
            required: false,
            deletedFileInfo:[],
          areAnyFilesToBeUploaded: false,
          isCancelToBeEnabled: false,
          isInValidFormat: false,
          fileDeletionRequired:true

      },
      init:function(){
         $("#progressouter").hide();
      },
      helpers: {
              convertToKB: function (size) {
                return (Math.max(size/1024, 0.1).toFixed(1)  + 'KB');
              },
             getFileName:function(val,data){
               var fileName=data.context.fileName;
                if(data.context.fileName ==undefined){
                  fileName=data.context.name;
                }
                var displayName="";
                if(fileName.indexOf(".zip")>-1){
                  fileName = fileName.substring(0,fileName.indexOf(".zip"));
                  //displayName = truncatedFileName(fileName);
                  //return stache('<div title="Please provide onAccount amount in [##########.########] format">{{name}}</div>')({name});
                }
                  displayName = truncatedFileName(fileName);
                  return stache('<span title="{{displayMessage}}">{{name}}</span>')({displayMessage:fileName,name:displayName});


              }

      },
      events: {
          '{fileList} change': function(){
              var _fileList = this.scope.fileList;
              var _toUpload = false, _toCancel = false;
              for (var i = 0, len = _fileList.length; i < len; i++) {
                  if (_fileList[i].ftype === 'selectedFromLocal') {
                      _toUpload = true;
                      _toCancel = true;
                  }
                  if (_fileList[i].ftype === 'pushedToServer') {
                      _toCancel = true;
                  }
              }
              this.scope.attr('areAnyFilesToBeUploaded', _toUpload);
              this.scope.attr('isCancelToBeEnabled', _toCancel);
          },

              '.browseFiles click': function() {
                    $(".success").empty();

                  this.element.find('input[type=file]').click();
                  this.scope.attr("fileUpload" , true);
                  //$(this.element).trigger('change');

              },
               '.fileSelect change' : function(el, ev) {
                 can.batch.start();
                  var files = el[0].files;

                   for (var i = 0; i < files.length; i++) {
                       files[i].ftype = 'selectedFromLocal';
                       files[i].guid = generateUUID();
                   }
                   this.scope.uploadedfileinfo.push.apply(this.scope.uploadedfileinfo, files);


                    this.element.find('input[type=file]').val(null);

                   function generateUUID(){
                       var d = new Date().getTime();
                       var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                           var r = (d + Math.random()*16)%16 | 0;
                           d = Math.floor(d/16);
                           return (c=='x' ? r : (r&0x3|0x8)).toString(16);
                       });
                       return uuid;
                   };
                   // clearing the input value.
                   var isValid=checkValidFormat(this.scope.attr("uploadedfileinfo"), this);
                   can.batch.stop();
                   showErrormessage(isValid,this);
                },
               '.submitFiles click': function() {
                  $(".success").empty();
                  var self = this;
                  var size = this.scope.attr('fileList').length;
                   // select all the local files (recently selected) and push them into the
                   // selectedFromLocal array so that only these files will be pushed
                   // to the server
                   var _fileList = this.scope.attr('fileList');
                   var _toBeUploaded = new can.List([]);
                   for (var i = 0; i < _fileList.length; i++) {
                       if (_fileList[i].ftype === 'selectedFromLocal') {
                          _toBeUploaded.push(_fileList[i]);
                       }
                   }
                  $("#progress").css('width','0');
                  $("#progress").html('');
                  $("#progressouter").show();
                  var uploadObj={"__fileToUpload":_toBeUploaded,"__progressCtr":"progress"};
                  FileUpLoader.create(uploadObj, function(data) {
                  self.scope.attr("fileUpload" , true);
                  var response = data.filePropeties[0];
                  if(response.status=='SUCCESS'){
                    /*passing file length here to parent component*/
                     self.scope.attr("isSuccess", true);
                     $('.success').empty().html(data.responseText);
                     setTimeout(function(){
                          $(".success").empty();
                      },2000)

                      // remove all selectedFromLocal files from uploadedfileinfo
                      var _uploadedFileInfo = self.scope.attr('uploadedfileinfo');
                      for (var i = _uploadedFileInfo.length - 1; i > -1; i--) {
                          if (_uploadedFileInfo[i].ftype === 'selectedFromLocal') {
                              _uploadedFileInfo.splice(i, 1);
                          }
                      }
                      for (var j = 0; j < data.filePropeties.length; j++) {
                          data.filePropeties[j].ftype = 'pushedToServer';
                      }
                      // todo: pushedToServer files currently do not have the fileSize attribute -- RETURN FROM SERVER
                     self.scope.attr('uploadedfileinfo').push.apply(self.scope.attr('uploadedfileinfo'), data.filePropeties);
                     $(self.element).trigger('onSelected', data);
                     $(self.element).trigger('filesUploaded');
                     $("#progressouter").hide();
                     $("#progressouter").removeClass("active");
                  }else{
                    self.scope.attr("isSuccess", false);
                     $('.fileError').empty().html(data.responseText);
                  }
                  },function(xhr) {
                    console.error("Error while loading:"+xhr);
                  });
                },
              '.cancelUpload click': function() {
                  $("#progressouter").hide();
                  // remove only those files which have a guid (selectedFromLocal)
                  var _uploadedFileInfo = this.scope.attr('uploadedfileinfo');
                  for (var i = _uploadedFileInfo.length - 1; i > -1; i--) {
                      if (!_uploadedFileInfo[i].isServer) {
                          _uploadedFileInfo.splice(i, 1);
                      }
                  }
              },
              '.action-link click': function(el, ev) {
                  var self = this;

                  /* start changes */
                  var _fileId = el[0].dataset.fileid;
                  var _fileList = this.scope.attr('fileList');
                  var _deletedFileInfo = this.scope.attr('deletedFileInfo');


                  function removeFileFromList(comparator) {
                      for (var i = 0, len = _fileList.length; i < len; i++) {
                          if ( comparator(_fileList[i]) ) {
                              _deletedFileInfo.push(_fileList[i]);
                              _uploadedFileInfo.splice(i, 1);
                              break;
                          }
                      }
                  }

                  var _uploadedFileInfo = this.scope.attr('uploadedfileinfo');
                  if (_fileId) {
                      // then the current file already existed on the server
                      removeFileFromList(function (iFile) {
                          return iFile.isServer && iFile.fileId == _fileId;
                      });
                  } else {
                      var _fileMeta = el[0].dataset.filemeta;
                      if (_fileMeta) {
                          // it is a pushedToServer file
                          removeFileFromList(function (iFile) {
                              return iFile.ftype === 'pushedToServer' && (iFile.fileName + iFile.filePath) == _fileMeta;
                          });
                      } else {
                          var guid = el[0].dataset.guid;
                          removeFileFromList(function (iFile) {
                              return iFile.ftype === 'selectedFromLocal' && iFile.guid === guid;
                          });
                      }
                  }

                  var isValid=checkValidFormat(_uploadedFileInfo, this);
                  showErrormessage(isValid,this);

              },
              '.downLoad-Link click': function(el, ev) {
                  var downLoadFile={};
                  var fileId = el[0].id;
                  downLoadFile.files=[];
                  var file={};
                  file.fileId= fileId;
                  file.boundType='INBOUND';
                  downLoadFile.files.push(file);
                  fileManager.findOne(file,function(data){
                      if(data["status"]=="SUCCESS"){

                      }else{
                        // $("#messageDiv").html("<label class='errorMessage'>"+data["responseText"]+"</label>");
                        // $("#messageDiv").show();
                        // setTimeout(function(){
                        //     $("#messageDiv").hide();
                        // },2000)
                        commonUtils.showErrorMessage(data["responseText"]);
                      }
                }, function(xhr) {
                      console.error("Error while downloading the file with fileId: "+fileId+xhr);
                });

              },
              "inserted":function(){
                //if(this.scope.clearFiles != undefined)
                $("#progressouter").hide();
              }
          }
    })

    function checkValidFormat(files, self){
      var canShowWarning=false;
      for (var i = 0; i < files.length; i++) {
             var validStatus = (/\.(tiff|jpeg|png|jpg|csv|pdf|txt)$/i).test(files[i].name);
             files[i].isInValid=false;
             if(!validStatus && (typeof(files[i].name) != "undefined")){
                canShowWarning=true;
                files[i].isInValid=true;
                continue;
            }
             var validName = (/^[a-zA-Z0-9-._ ]*$/.test(files[i].name) )
             if(!validName && (typeof(files[i].name) != "undefined")){
                canShowWarning=true;
                files[i].isInValid=true;
                continue;
             }
          }
          return canShowWarning;
    }

var showErrormessage=function(canShow,self){
  if(canShow){
    self.scope.attr("isInValidFormat", true);
    $('.validFormatError').empty().html("Invalid File name or file format. Please remove the files are marked in red (Allowed formats : tiff/jpeg/png/jpg/csv/pdf/txt)");
    $('.submitFiles').attr("disabled", true);
    $('.submitFiles').addClass('disabled-button');

  }else{
    self.scope.attr("isInValidFormat", false);
    $('.validFormatError').empty();
    $('.submitFiles').attr("disabled", false);
    $('.submitFiles').removeClass('disabled-button');
  }
}

var truncatedFileName = function(fileName){
  if(fileName != undefined && fileName.length>0 && fileName.length>45){
    return fileName.substring(0,45)+"...";
  }
  return fileName;
}



export default FileUploader;
