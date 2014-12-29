import Component from 'can/component/';
import template from './template.stache!';
import styles from './export-toexcel.less!';

var exportToexcel = Component.extend({
  tag: 'export-toexcel',
  template: template,
  scope: {
    appstate: undefined,
    csv: undefined,
    //request:undefined,
    flag:false
   
 },
  init:function(){
      var self = this;

        console.log(self.scope.csv);
        var arrData = typeof self.scope.csv != 'object' ? JSON.parse(self.scope.csv.exportExcelFileInfo.value) : self.scope.csv.exportExcelFileInfo.value;
        var decodedData = window.atob(arrData);
        var ReportTitle = '';
        if (decodedData == '') {        
          alert("Invalid data");
          return;
        }   
        var fileName = self.scope.csv.exportExcelFileInfo.fileName!=null && self.scope.csv.exportExcelFileInfo.fileName!="" ? self.scope.csv.exportExcelFileInfo.fileName:"Right_Notes";
        fileName += ReportTitle.replace(/ /g,"_");
          
        function linkDownload(a, filename, content) {
          var contentType =  self.scope.csv.exportExcelFileInfo.mimeType!=null &&self.scope.csv.exportExcelFileInfo.mimeType!=""  ? 'data:'+self.scope.csv.exportExcelFileInfo.mimeType+';charset=utf-8,':'data:application/csv;charset=utf-8,';
          var uriContent = contentType + escape(content);
          a.setAttribute('href', uriContent);
          a.setAttribute('download', filename);
        }
        function download(filename, content) {
          var a = document.createElement('a');
          linkDownload(a, filename, content);
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
        download(fileName, decodedData);
   },
  events:{
    
   },
  helpers:function(){

  }
 
});
export default exportToexcel;
