import _ from 'lodash';
import Component from 'can/component/';
import template from './template.stache!';
import styles from './page-reconOther.less!';
import UserReq from 'utils/request/';

import reconGrid from  'components/recon-grid/';
import incomingOtherColumns from './column-sets/incomingOther-columns';
import Recon from 'models/recon/';

import tokeninput from 'tokeninput';
import css_tokeninput from 'tokeninput.css!';
import css_tokeninput_theme from 'tokeninput_theme.css!';
import commonUtils from 'utils/commonUtils';
import FileManager from 'utils/fileManager/';


import stache from 'can/view/stache/';
import exportToExcel from 'components/export-toexcel/';
import copy from 'components/copy-clipboard/';

var page = Component.extend({
  tag: 'page-reconOther',
  template: template,
  scope: {
    appstate:undefined,
    incomingOtherGridColumns: incomingOtherColumns,
    incomingOtherList: new can.List(),
    isGlobalSearch:undefined,
    tokenInput: [],
    scrollTop: 0,
    offset: 0,
    refreshTokenInput: function(val, type){
      var self = this;
      if(type=="Add")
        self.attr('tokenInput').push(val);
        else if(type=="Delete"){
          var flag=true;
          this.attr('tokenInput').each(function(value, key) {
            if(val.id == value.id){
              self.attr('tokenInput').splice(key,1);
            }
          });
        }
      }
  },
  helpers: {
    //none
  },
  init: function(){
    this.scope.appstate.attr("renderGlobalSearch",true);
  },
  events:{
    "inserted": function(){
        var self = this;

        $("#tokenSearch").tokenInput([
          {id: 1, name: "Search"} //This is needed
          ],
          {
            theme: "facebook",
            preventDuplicates: true,
            onResult: function (item) {
              if($.isEmptyObject(item)){
                return [{id:$("#token-input-tokenSearch").val(),name: $("#token-input-tokenSearch").val()}];
              }else{
                return item;
              }
            },
            onAdd: function (item) {
              self.scope.refreshTokenInput(item,"Add");
            },
            onDelete: function (item) {
              self.scope.refreshTokenInput(item,"Delete");
            }
          });
    },
    "{tokenInput} change": function(){
      var self= this;
      /* The below code calls {scope.appstate} change event that gets the new data for grid*/
      /* All the neccessary parameters will be set in that event */
      commonUtils.triggerGlobalSearch();
    },
    ".downloadLink.fileName click": function(item, el, ev){
      var self=this.scope;
      var row = item.closest('tr').data('row').row;

      var request = {
        "files":[
        {

        }
        ]
      }
      if(row.invFileId == 0 || row.invFileId == "" || row.invFileId == null){
        request.files[0]["filePath"] = row.filePath;
        request.files[0]["fileName"] = row.invFileName;
      }else{
        request.files[0]["fileId"] = row.invFileId;
        request.files[0]["boundType"] = row.invFileType;
      }
      console.log(JSON.stringify(request));

      FileManager.downloadFile(request);

    },
    '#copyToClipboard click':function(){  
        $('#clonetable').empty().html($('#reconstatsOtherGrid').find('table:visible').clone(true).attr('id','dynamic'));
         $('copy-clipboard').slideDown(function(){
           $('body').css('overflow','hidden');
           $('#copyall').trigger('click');
        });       
      },
    '.exportToExcel click':function(el,ev){
        var self = this;
        Recon.findOne(createReconOtherRequestForExportToExcel(self.scope.appstate),function(data){ 
              if (data["status"] == "SUCCESS" && data["exportExcelFileInfo"] != null) {
                if(data.exportExcelFileInfo["values"]!=null)
                  $('#exportExcel').html(stache('<export-toexcel csv={data}></export-toexcel>')({data}));
              }else{
                $("#messageDiv").html("<label class='errorMessage'>"+data["responseText"]+"</label>");
                $("#messageDiv").show();
                setTimeout(function(){
                    $("#messageDiv").hide();
                },2000)
                self.scope.attr('emptyrows',true);
              }
        }, function(xhr) {
              console.error("Error while loading: onAccount balance Details"+xhr);
        } );    
    },
    '{scope.appstate} change': function() {
      if(this.scope.isGlobalSearch != this.scope.appstate.attr('globalSearch')){
        this.scope.attr("isGlobalSearch",this.scope.appstate.attr("globalSearch"));
        fetchReconIncoming(this.scope);
      }
    }
  }
});

var createReconOtherRequestForExportToExcel = function(appstate){
  var reconOtherRequest={};
  reconOtherRequest.searchRequest=UserReq.formGlobalRequest(appstate).searchRequest;
  reconOtherRequest.searchRequest.type="OTHER";
  reconOtherRequest.excelOutput=true;
  return UserReq.formRequestDetails(reconOtherRequest);
};


var fetchReconIncoming = function(scope){

    var searchRequestObj = UserReq.formGlobalRequest(scope.appstate);

    searchRequestObj.searchRequest["type"] = "OTHER";
    //TODO During pagination / scrolling, the below values has tobe chnaged.
    searchRequestObj.searchRequest["limit"] = "10";
    searchRequestObj.searchRequest["offset"] = "0";
    searchRequestObj.searchRequest["sortBy"] = "COUNTRY";
    searchRequestObj.searchRequest["sortOrder"] = "ASC";

    Recon.findOne((searchRequestObj),function(data){
      if(data.status == "FAILURE"){
        $("#messageDiv").html("<label class='errorMessage'>"+data.responseText+"</label>");
        $("#messageDiv").show();
        setTimeout(function(){
          $("#messageDiv").hide();
        },4000);
        console.error("Failed to load the Recon incoming other :"+data.responseText);

      }else  {
        scope.incomingOtherList.replace(data.reconStatsDetails);
      }

    },function(xhr){

      console.error("Error while loading: fetchReconIncoming"+xhr);

    });

}

export default page;
