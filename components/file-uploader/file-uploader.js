import Component from 'can/component/';
import template from './template.stache!';
import FileUpLoader from 'models/fileuploader/';
import RinsCommon from 'utils/';
import compute from 'can/compute/';
import _less from './file-uploader.less!';

var FileUploader = Component.extend({
  tag: 'rn-file-uploader',
  template: template,
  scope: {
    fileList: [],
    fileUpload: false,
    isAnyFileLoaded : can.compute(function() { return this.fileList.attr('length') > 0; })
  },
  helpers: {
    convertToKB: function (size) {
      return (Math.max(size/1024, 0.1).toFixed(1) + 'KB');
    }
  },
  events: {
    '.uploadFiles click': function() {
      this.element.find('input[type=file]').click();
      this.scope.attr("fileUpload", true);
    },
    '.fileSelect change' : function(el, ev) {
      var files = el[0].files;
      this.scope.fileList.push.apply(this.scope.fileList, files);
    },
    '.submitFiles click': function() {
      var self = this.scope;
      var size = this.scope.attr("fileList").length;
      FileUpLoader.create(this.scope.attr("fileList"),function(data) {
        self.attr("fileUpload", true);
        self.attr("fileList").splice(0, size);
      },function(xhr) {
        console.error("Error while loading:"+xhr);
      });
    },
    '.cancelUpload click': function() {
      var size = this.scope.attr("fileList").length;
      this.scope.attr("fileList").splice(0, size);
    },
    '.filelist li click': function(el, ev) {
      var selectedIndex = this.scope.attr('fileList').indexOf(el.data('file'));
      this.scope.attr("fileList").splice(selectedIndex, 1);
    }
  }
});

export default FileUploader;
