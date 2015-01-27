import _ from 'lodash';
import Component from 'can/component/';
import template from './template.stache!';
import styles from './page-reconOther.less!';
import UserReq from 'utils/request/';
import detailsColumns from './column-sets/details-columns';

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

//Navigation bar definitions
var tabNameObj = {
    incoming:{
      name:"Invoices",
      type: "INCOMING"
    },
    other:{
      name:"Other",
      type: "Other"
    }
}

var page = Component.extend({
  tag: 'page-reconOther',
  template: template,
  scope: {
    appstate:undefined,
    incomingOtherGridColumns: incomingOtherColumns,
    incomingOtherList: new can.List(),
    isGlobalSearch:undefined,
    tokenInput: [],

    incomingDetails: {
      headerRows: new can.List(),
      footerRows: new can.List()
    },
    detailGridColumns: detailsColumns,
    tabName:tabNameObj,
    incomingStatsDetailsSelected : [],
    incomingCcidSelected : [],
    tabSelected :tabNameObj.incoming.name,
    size_incomingCcidSelected : 0,
    incomingScrollTop: 0,
    incomingOffset: 0,
    recordsAvailable:'@',
    totalRecordCount:'@',
    sortColumns:[],
    sortDirection: "asc",
    scrollTop: 0,
    offset: 0,
    pagename : "reconOther",
    load : true,

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
      },

    setHeaderChkBox : function() {

      var checkBoxList = $('input.selectRow');

      if(checkBoxList != undefined && checkBoxList!= null && checkBoxList.length > 0) {

        $('input.headerChkBox').attr("checked", true);

        for(var i=0; i<checkBoxList.length; i++) {

          if (checkBoxList[i].checked != true) {

            $('input.headerChkBox').attr("checked", false);

          }

        }
      } else {

        $('input.headerChkBox').attr("checked", false);

      }

    }

  },
  helpers: {
    //none
    isTabSelectedAs:function(tabName){
      return 'style="display:' + ( this.attr("tabSelected") == tabName  ? 'block' : 'none') + '"';
    },
    isIncomingCcidsSelected:function(ref){
      //if the size of the list is greater than 0, enables the Reject button
      return ( this.attr("size_incomingCcidSelected") == ref ? 'disabled' : '' ) ;
    }
  },
  init: function(){
    this.scope.appstate.attr("renderGlobalSearch",true);
  },
  events:{

    'shown.bs.tab': function(el, ev) {
      this.scope.attr("tabSelected", $('.nav-tabs .active').text());
      this.scope.appstate.attr("renderGlobalSearch",true);
      //Load when the list is empty
      if(_.size(this.scope.ingestList.headerRows) == 0 || _.size(this.scope.incomingDetails.headerRows) == 0 ){
        commonUtils.triggerGlobalSearch();
      }
    },

    "inserted": function(){
        var self = this;
        var tbody = self.element.find('tbody');

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

      // var request = {
      //   "files":[
      //   {

      //   }
      //   ]
      // }
      // if(row.invFileId == 0 || row.invFileId == "" || row.invFileId == null){
      //   request.files[0]["filePath"] = row.filePath;
      //   request.files[0]["fileName"] = row.invFileName;
      // }else{
      //   request.files[0]["fileId"] = row.invFileId;
      //   request.files[0]["boundType"] = row.invFileType;
      // }
      // console.log(JSON.stringify(request));

      // FileManager.downloadFile(request);

      var file={};
      file.fileId= row.invFileId;
      file.boundType='INBOUND';

      //FileManager.findOne(request);

      FileManager.findOne(file,function(data){
          if(data["status"]=="SUCCESS"){

          }else{
            $("#messageDiv").html("<label class='errorMessage'>"+data["responseText"]+"</label>");
            $("#messageDiv").show();
            setTimeout(function(){
                $("#messageDiv").hide();
            },2000)
          }
    }, function(xhr) {
          console.error("Error while downloading the file with fileId: "+fileId+xhr);
    });


    },
    '#copyToClipboard click':function(){  
        $('#clonetable').empty().html($('#reconstatsOtherGrid').find('table:visible').clone(true).attr('id','dynamic'));
         $('copy-clipboard').slideDown(function(){
           $('body').css('overflow','hidden');
           $('#copyall').trigger('click');
        });       
      },
      ".rn-grid>thead>tr>th:gt(0) click": function(item, el, ev){
          var self=this;
           //console.log($(item[0]).attr("class"));
          var val = $(item[0]).attr("class").split(" ");
          var existingSortColumns =self.scope.sortColumns.attr();
          var existingSortColumnsLen = existingSortColumns.length;
          var existFlag = false;
          if(existingSortColumnsLen==0){
            self.scope.attr('sortColumns').push(val[0]);
          } else {
            for(var i=0;i<existingSortColumnsLen;i++){
              /* The below condition is to selected column to be sorted in asc & dec way */
              //console.log(val[0]+","+existingSortColumns[i] )
              if(existingSortColumns[i] == val[0]){
                existFlag = true;
              }
            }
            if(existFlag==false){
              self.scope.attr('sortColumns').replace([]);
              self.scope.attr('sortColumns').push(val[0]);
            } else {
              var sortDirection = (self.scope.attr('sortDirection') == 'asc') ? 'desc' : 'asc';
              self.scope.attr('sortDirection', sortDirection);
            }

          }

          console.log("aaa "+self.scope.sortColumns.attr());
           /* The below code calls {scope.appstate} change event that gets the new data for grid*/
           /* All the neccessary parameters will be set in that event */
           self.scope.appstate.attr('globalSearchButtonClicked', false);
           if(self.scope.appstate.attr('globalSearch')){
              self.scope.appstate.attr('globalSearch', false);
            }else{
              self.scope.appstate.attr('globalSearch', true);
            }

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
        if(this.scope.tabSelected == this.scope.tabName.other.attr("name")){
          $("#loading_img").show();
          fetchReconIncoming(this.scope);
        }else{
          this.scope.attr("size_incomingCcidSelected", 0);
          fetchReconDetailsOther(this.scope, this.scope.load);
        }
        
      }
    },
    '.btn-incoming-reject click': function() {

      $('#rejectModal').modal({
        "backdrop" : "static"
      });

    },

    '.btn-Ingest click': function() {
      processRejectIngestRequestOther(this.scope,"ingest");
    },

    '.btn-confirm-ok click': function(){
      $('#rejectModal').modal('hide');
      processRejectIngestRequestOther(this.scope,"reject");
    },

    '.toggle :checkbox change': function(el, ev) {
      if (el[0].getAttribute('class') != 'headerChkBox') {
        refreshChekboxSelection(el,this.scope);
      }
    },

    '.headerChkBox  click': function(el, ev){

      var checkBoxList = $('input.selectRow');

      if(el[0].checked == true) {

        for(var i=0; i<checkBoxList.length; i++) {

          if (checkBoxList[i].checked != true) {

            checkBoxList[i].click();

          }

        }

      } else {

        for(var i=0; i<checkBoxList.length; i++) {

          if (checkBoxList[i].checked != false) {

            checkBoxList[i].click();

          }

        }
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

    if(scope.appstate.attr('globalSearchButtonClicked')==true){
      scope.attr("offset",0);
      scope.attr("incomingScrollTop",0);
      scope.sortColumns.replace([]);
      scope.attr("sortDirection","asc");
    }
    searchRequestObj.searchRequest["type"] = "OTHER";
    //TODO During pagination / scrolling, the below values has tobe chnaged.
    searchRequestObj.searchRequest["limit"] = "10";
    searchRequestObj.searchRequest["offset"] = scope.offset;
    searchRequestObj.searchRequest["sortBy"] = scope.sortColumns.attr().toString();
    searchRequestObj.searchRequest["sortOrder"] = scope.sortDirection;

    var filterData = scope.tokenInput.attr();
    var newFilterData = [];
    if(filterData.length>0){
      for(var p=0;p<filterData.length;p++)
        newFilterData.push(filterData[p]["name"]);
    }

    searchRequestObj.searchRequest["filter"] = newFilterData;

    Recon.findOne((searchRequestObj),function(data){
      $("#loading_img").hide();
      if(data.status == "FAILURE"){
        $("#messageDiv").html("<label class='errorMessage'>"+data.responseText+"</label>");
        $("#messageDiv").show();
        setTimeout(function(){
          $("#messageDiv").hide();
        },4000);
        console.error("Failed to load the Recon incoming other :"+data.responseText);

      }else  {
        if(searchRequestObj.searchRequest["offset"]==0)
          scope.incomingOtherList.replace(data.reconStatsDetails);
        else {
          $.merge(scope.incomingOtherList, data.reconStatsDetails);
          scope.incomingOtherList.replace(scope.incomingOtherList);
        }
        scope.recordsAvailable = data.recordsAvailable;
        scope.totalRecordCount = data.totRecCnt;
      }

    },function(xhr){

      console.error("Error while loading: fetchReconIncoming"+xhr);

    });

};

var fetchReconDetailsOther = function(scope, load){

  var searchRequestObj = UserReq.formGlobalRequest(scope.appstate);
  searchRequestObj.searchRequest["type"] = scope.tabName.incoming.attr("type");


  //TODO During pagination / scrolling, the below values has tobe chnaged.
  if(scope.appstate.attr('globalSearchButtonClicked')==true){
    scope.attr("incomingOffset",0);
    scope.attr("incomingScrollTop",0);
    scope.sortColumns.replace([]);
    scope.attr("sortDirection","asc");
  }
  searchRequestObj.searchRequest["limit"] = "10";
  searchRequestObj.searchRequest["offset"] = scope.incomingOffset;
  searchRequestObj.searchRequest["sortBy"] = scope.sortColumns.attr().toString();
  searchRequestObj.searchRequest["sortOrder"] = scope.sortDirection;

  var filterData = scope.tokenInput.attr();
  var newFilterData = [];
  if(filterData.length>0){
    for(var p=0;p<filterData.length;p++)
      newFilterData.push(filterData[p]["name"]);
  }

  searchRequestObj.searchRequest["filter"] = newFilterData;

  Recon.findOne((searchRequestObj),function(data){
    if(data.status == "FAILURE"){
      displayErrorMessage(data.responseText,"Failed to load the Recondetails:");
    }else  {

      if(load) {
        scope.attr("incomingCcidSelected").splice(0, scope.attr("incomingCcidSelected").length);
      }
      if(data.reconStatsDetails == undefined || (data.reconStatsDetails != null && data.reconStatsDetails.length <= 0)) {

        scope.attr("emptyrows", true);

      } else {

        scope.attr("emptyrows", false);

      }   
      scope.incomingDetails.headerRows.replace(data.reconStatsDetails);

      scope.incomingStatsDetailsSelected = data.reconStatsDetails;

      scope.incomingDetails.footerRows.splice(0, scope.incomingDetails.footerRows.length);

      if (data.summary!== null) {
        var footerLine= {
          "__isChild": true,
          "ccy":"EUR",
          "pubfee": data.summary.totalPubFee,
          "reconAmt": data.summary.totalRecon,
          "liDispAmt": data.summary.totalLi ,
          "copConAmt":data.summary.totalCopCon,
          "unMatchedAmt": data.summary.totalUnMatched,
          "badLines": data.summary.totalBadLines,
          "ccidId":"",
          "entityName":"",
          "countryId":"",
          "contType":"",
          "fiscalPeriod":"",
          "rcvdDate":"",
          "invFileName":"",
          "status":"",
          "isFooterRow":true
        };
        scope.incomingDetails.footerRows.replace(footerLine);  
      }
      
    }
  },function(xhr){
    console.error("Error while loading: fetchReconDetailsOther"+xhr);
  }).then(function(values){

    if(load) {
      var ccidCheckbox = $("input.selectRow");

      for(var i=0; i<ccidCheckbox.length  ;i++) {

        ccidCheckbox[i].click();

      }

      var ccids = scope.incomingCcidSelected;
      scope.setHeaderChkBox();

    } else {

      scope.attr("load", true);

      var ccidCheckbox = $("input.selectRow");

      for(var i=0; i<ccidCheckbox.length  ;i++) {

        for(var j=0; j< scope.incomingCcidSelected.length; j++ ) {

          if (scope.incomingCcidSelected[j] == ccidCheckbox[i].getAttribute("value")) {

            ccidCheckbox[i].checked = true;

          }
        }

      }
      scope.setHeaderChkBox();

    }


  });
};

var processRejectIngestRequestOther = function(scope,requestType){
    var ccidList ;
    var type ;
    var ccidSelected = [];
    var tab = "";

    ccidList = scope.attr("incomingCcidSelected");
    type =  scope.tabName.incoming.attr("type");
    tab = "Incoming Other";


    can.each(ccidList,
      function( value, index ) {
        ccidSelected.push(value);
      }
    );

    if(requestType == "reject"){

        var rejectSearchRequestObj =   {
          "searchRequest": {
          "type" : type,
          "ids" : ccidSelected
          }
        }
        //console.log(JSON.stringify((rejectSearchRequestObj)));

      Promise.all([Recon.reject(rejectSearchRequestObj)]).then(function(values) {

        //scope.reconStatsDetailsSelected = data.reconStatsDetails;
        
        scope.attr("size_incomingCcidSelected", 0);

        if(values != null && values.length > 0) {
          var data = values[0];
          if(data.status == "SUCCESS"){
            $("#messageDiv").html("<label class='successMessage'>"+data.responseText+"</label>")
            $("#messageDiv").show();
            
            scope.attr("incomingCcidSelected").splice(0, scope.attr("incomingCcidSelected").length);
         
            $('.statsTable').hide();
            
            setTimeout(function(){
              $("#messageDiv").hide();
            },3000);

            fetchReconDetailsOther(scope, false);
          }
        } else{

            //error text has to be shared. TODO - not sure how service responds to it
            displayErrorMessage(data.responseText,"Failed to Ingest:");

          }
        });

    }else if(requestType == "ingest"){


      var rejectSearchRequestObj =   {
        "searchRequest": {
          "ids" : ccidSelected
        }
      }

      //console.log(JSON.stringify((rejectSearchRequestObj)));

      Recon.ingest((rejectSearchRequestObj)).done(function(data){
        if(data.responseCode == "0000"){
          $("#messageDiv").html("<label class='successMessage'>"+data.responseText+"</label>")
          $("#messageDiv").show();
          setTimeout(function(){
            $("#messageDiv").hide();
          },4000);
        }else{
          //error text has to be shared. TODO - not sure how service responds to it
          displayErrorMessage(data.responseText,"Failed to Ingest:");
        }
      });

    }
};

var displayErrorMessage = function(message,log){

  $("#messageDiv").html("<label class='errorMessage'>"+message+"</label>");
  $("#messageDiv").show();
  setTimeout(function(){
    $("#messageDiv").hide();
  },4000);
  console.error(log+message);

};

var refreshChekboxSelection = function(el,scope){
  var row = el.closest('tr').data('row').row;
  if(el[0].checked) {
      scope.incomingCcidSelected.push(row.dtlHdrId);
    } else {
      $('input.headerChkBox').attr("checked", false);
      var index = _.indexOf(scope.incomingCcidSelected, row.dtlHdrId);
      (index > -1) && scope.attr("incomingCcidSelected").splice(index, 1);
     }
    scope.attr("size_incomingCcidSelected" ,_.size(scope.attr("incomingCcidSelected")));

};


var createIncomingReconRequestForExportToExcel=function(appstate){
    var IncomingReconRequest={};
    IncomingReconRequest.searchRequest=UserReq.formGlobalRequest(appstate).searchRequest;
    IncomingReconRequest.searchRequest.type="INCOMING";
    IncomingReconRequest.excelOutput=true;
    console.log(JSON.stringify(IncomingReconRequest));
    return UserReq.formRequestDetails(IncomingReconRequest);
  };

export default page;
