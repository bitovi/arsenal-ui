import Component from 'can/component/';
import template from './template.stache!';
import styles from './export-toexcel.less!';

var exportToexcel = Component.extend({
  tag: 'export-toexcel',
  template: template,
  scope: {
    appstate: undefined,
    csv:[]
   
 },
  init:function(){
   
   },
  events:{
    '{csv} change':function(){
        var self = this;
        if(self.scope.csv[0].responseCode==='0000'){

            console.log(self.scope.csv[0].exportExcelFileInfo);
            var arrData = typeof self.scope.csv[0] != 'object' ? JSON.parse(self.scope.csv[0].exportExcelFileInfo.value) : self.scope.csv[0].exportExcelFileInfo.value;
            var decodedData = window.atob(arrData);
            var ReportTitle = 'test';
            if (decodedData == '') {        
              alert("Invalid data");
              return;
            }   
            var fileName = self.scope.csv[0].exportExcelFileInfo.fileName!='' ? self.scope.csv[0].exportExcelFileInfo.fileName:"Right_Notes";
            fileName += ReportTitle.replace(/ /g,"_");   
            var uri = 'data:text/xls;charset=utf-8,' + escape(decodedData);
            var link = document.createElement("a");    
            link.href = uri;
            link.style = "visibility:hidden";
            link.download = fileName + ".xls";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
   },
  helpers:function(){

  }
 
});
export default exportToexcel;
