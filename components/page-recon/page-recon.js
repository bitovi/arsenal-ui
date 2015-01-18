import _ from 'lodash';
import Component from 'can/component/';
import template from './template.stache!';
import styles from './page-recon.less!';
import Stats from 'models/refreshstats/refreshstats';
import ReconStats from 'components/recon-stats/';
import RinsCommon from 'utils/urls';
import UserReq from 'utils/request/';
import reconGrid from  'components/recon-grid/';
import ingestedColumns from './column-sets/ingest-columns';
//import detailsColumns from './column-sets/details-columns';
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
    ingest:{
      name:"Ingested",
      type: "INGESTED"
    },
    incoming:{
      name:"Incoming Details",
      type: "INCOMING"
    }
}

var page = Component.extend({
  tag: 'page-recon',
  template: template,
  scope: {
    appstate:undefined,
    tabSelected :tabNameObj.ingest.name,
    tabName:tabNameObj,
    ingestGridColumns: ingestedColumns,
    //detailGridColumns: detailsColumns,
    ingestList:{
      headerRows: new can.List(),
      footerRows: new can.List()
    },
    incomingDetails: {
      headerRows: new can.List(),
      footerRows: new can.List()
    },
    ingestCcidSelected:[],
    incomingCcidSelected:[],
    size_ingestCcidSelected:0,
    size_incomingCcidSelected:0,
    currencyScope:[],
    currencyList:[],
    reconRefresh : [],
    emptyrows : true,
    ingestedScrollTop: 0,
    incomingScrollTop: 0,
    ingestedOffset: 0,
    incomingOffset: 0,
    pagename : "recon",
    sortColumns:[],
    sortDirection: "asc",
    load : true,

    reconStatsDetailsSelected : [],

    incomingStatsDetailsSelected : [],

    //bottomgrid
    refreshStatsReq:undefined,
    isBottomGridRefresh:true,
    isGlobalSearchIngested:undefined,
    tokenInput: [],
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

    addRefresh : function(refresh){
      this.attr("reconRefresh").push(refresh);
    }

  },
  helpers: {

    isIngestCcidsSelected:function(ref){
      //if the size of the list is greater than 0, enables the Reject button
      return ( this.attr("size_ingestCcidSelected") == ref ? 'disabled' : '' ) ;
    },
    isIncomingCcidsSelected:function(ref){
      //if the size of the list is greater than 0, enables the Reject button
      return ( this.attr("size_incomingCcidSelected") == ref ? 'disabled' : '' ) ;
    },
    isTabSelectedAs:function(tabName){
      return 'style="display:' + ( this.attr("tabSelected") == tabName  ? 'block' : 'none') + '"';
    }
  },
  init: function(){
    this.scope.appstate.attr("renderGlobalSearch",true);
    this.scope.attr("emptyrows", false);
    this.scope.ingestList.headerRows.splice(0, this.scope.ingestList.headerRows.length);
    this.scope.ingestList.footerRows.splice(0,this.scope.ingestList.footerRows.length);
    this.scope.attr("ingestCcidSelected").splice(0, this.scope.attr("ingestCcidSelected").length);
    // this.scope.attr("isGlobalSearchIngested",this.scope.appstate.attr("globalSearch"));
    // console.log(" ")
    // fetchReconIngest(this.scope);
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

      $("#tokenSearch").tokenInput([
        {id: 1, name: "Search"} //This is needed
        ],
        {
          theme: "facebook",
          placeholder:"Search...",
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
        //console.log(this.scope.tokenInput);
        /* The below code calls {scope.appstate} change event that gets the new data for grid*/
        /* All the neccessary parameters will be set in that event */
        //commonUtils.triggerGlobalSearch();
        fetchReconIngest(self.scope, false);
      },
    ".downloadLink.badLines click": function(item, el, ev){
      var self=this.scope;
      var row = item.closest('tr').data('row').row;
      var request = {
          "fileId":row.badFileId,
          "boundType":row.badFileType
      }
      FileManager.downloadFile(request);
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
    ".downloadLink.liDispAmt click": function(item, el, ev){
      var self=this.scope;
      var row = item.closest('tr').data('row').row;
      var request = {

          "fileId":row.liDispFileId,
          "boundType":row.liDispFileType

      }

      FileManager.downloadFile(request);
    },
    '.toggle :checkbox change': function(el, ev) {
        refreshChekboxSelection(el,this.scope);
    },
    '.btn-Ingest click': function() {
      processRejectIngestRequest(this.scope,"ingest");
    },
    '.btn-ingested-reject click': function() {

      $('#rejectModal').modal({
        "backdrop" : "static"
      });

    },
    '.btn-incoming-reject click': function() {

      $('#rejectModal').modal({
        "backdrop" : "static"
      });

    },
    '.btn-holesReport click': function() {
      commonUtils.navigateTo("dashboard");
      this.scope.appstate.attr('DISPLAY_HOLES_REPORT',true);
      // this.scope.appstate.attr('page','dashboard');
    },
    '.btn-OverRep click': function() {
        window.open(RinsCommon.RINS_OLD_URL+'overRepConfig');
    },
    '.btn-confirm-cancel click': function(){
      //nothing to do
    },
    '.btn-confirm-ok click': function(){
      $('#rejectModal').modal('hide');
      processRejectIngestRequest(this.scope,"reject");
    },
    '{scope.appstate} change': function() {
      this.scope.appstate.attr("renderGlobalSearch",true);
      if(this.scope.isGlobalSearchIngested != this.scope.appstate.attr('globalSearch')){
        this.scope.attr("isGlobalSearchIngested",this.scope.appstate.attr("globalSearch"));
        if(this.scope.tabSelected == this.scope.tabName.ingest.attr("name")){
          fetchReconIngest(this.scope, this.scope.load);
        }else{
          fetchReconDetails(this.scope);
        }
      }
    },
    '{scope.currencyScope} change': function() {
      var list = [];
      can.each(this.scope.currencyScope,
        function( value, index ) {
          list.push( {
            "id":value
          });
        }
      );
      this.scope.currencyList.replace(list);
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
              console.log(val[0]+","+existingSortColumns[i] )
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
           if(self.scope.appstate.attr('globalSearch')){
              self.scope.appstate.attr('globalSearch', false);
            }else{
              self.scope.appstate.attr('globalSearch', true);
            }

    },
    '#copyToClipboard click':function(){  console.log($('#myTabs').next('.tab-content').find('.tab-pane:visible table:visible').clone(true));
         $('#clonetable').empty().html($('#ingested').find('table:visible').clone(true).attr('id','dynamic'));
         $('copy-clipboard').slideDown(function(){
           $('body').css('overflow','hidden');
           $('#copyall').trigger('click');
        });       
      },
   '.exportToExcel click':function(el,ev){
       
        var self = this;
        console.log(self.scope.tabSelected);
       if(self.scope.tabSelected=="Ingested"){
              Recon.findOne(createIngestedReconRequestForExportToExcel(self.scope.appstate),function(data){ 
                console.log(data);
                console.log(JSON.stringify(data));
                      if(data["status"]=="SUCCESS"){
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
         }else if(self.scope.tabSelected=="Incoming Details"){
              Recon.findOne(createIngestedReconRequestForExportToExcel(self.scope.appstate),function(data){ 
                console.log(data);
                      if(data["status"]=="SUCCESS"){
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
         }    
       }
   }
});


var createIngestedReconRequestForExportToExcel=function(appstate){
    var IngestedReconRequest={};
    IngestedReconRequest.searchRequest=UserReq.formGlobalRequest(appstate).searchRequest;
    IngestedReconRequest.searchRequest.type="INGESTED";
    IngestedReconRequest.excelOutput=true;
    console.log(JSON.stringify(IngestedReconRequest));
    return UserReq.formRequestDetails(IngestedReconRequest);
  };

var createIncomingReconRequestForExportToExcel=function(appstate){
    var IncomingReconRequest={};
    IncomingReconRequest.searchRequest=UserReq.formGlobalRequest(appstate).searchRequest;
    IncomingReconRequest.searchRequest.type="INCOMING";
    IncomingReconRequest.excelOutput=true;
    console.log(JSON.stringify(IncomingReconRequest));
    return UserReq.formRequestDetails(IncomingReconRequest);
  };

var processRejectIngestRequest = function(scope,requestType){
    var ccidList ;
    var type ;
    var ccidSelected = [];
    var tab = "";

    if(scope.tabSelected == scope.tabName.ingest.attr("name")){
      ccidList = scope.attr("ingestCcidSelected");
      type =  scope.tabName.ingest.attr("type");
      tab = "ingest";
    }else{
      ccidList = scope.attr("incomingCcidSelected");
      type =  scope.tabName.incoming.attr("type");
      tab = "incoming";
    }

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

        scope.attr("size_ingestCcidSelected", 0);

        if(values != null && values.length > 0) {
          var data = values[0];
          if(data.status == "SUCCESS"){
            $("#messageDiv").html("<label class='successMessage'>"+data.responseText+"</label>")
            $("#messageDiv").show();
            
            if(tab == "ingest") {
              scope.reconRefresh[0].summaryStatsData.splice(0,1);
              scope.attr("ingestCcidSelected").splice(0, scope.attr("ingestCcidSelected").length);
            } else {
              scope.attr("incomingCcidSelected").splice(0, scope.attr("incomingCcidSelected").length);
            }
            
            $('.statsTable').hide();
            
            setTimeout(function(){
              $("#messageDiv").hide();
            },3000);

            fetchReconIngest(scope, scope.load);
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
}


var displayErrorMessage = function(message,log){

  $("#messageDiv").html("<label class='errorMessage'>"+message+"</label>");
  $("#messageDiv").show();
  setTimeout(function(){
    $("#messageDiv").hide();
  },4000);
  console.error(log+message);

}

/**/
var fetchReconIngest = function(scope, load){
  var searchRequestObj = UserReq.formGlobalRequest(scope.appstate);
  searchRequestObj.searchRequest["type"] =  scope.tabName.ingest.attr("type");
  //TODO During pagination / scrolling, the below values has tobe chnaged.

  scope.attr("ingestCcidSelected").splice(0, scope.attr("ingestCcidSelected").length);

  if(scope.appstate.attr('globalSearchButtonClicked')==true){
      scope.attr("ingestedOffset",0);
      scope.attr("ingestedScrollTop",0);
  }
  searchRequestObj.searchRequest["limit"] = "10";
  searchRequestObj.searchRequest["offset"] = scope.ingestedOffset;
  searchRequestObj.searchRequest["sortBy"] = scope.sortColumns.attr().toString();
  searchRequestObj.searchRequest["sortOrder"] = scope.sortDirection;

  var filterData = scope.tokenInput.attr();
  var newFilterData = [];
  if(filterData.length>0){
    for(var p=0;p<filterData.length;p++)
      newFilterData.push(filterData[p]["name"]);
    }

  searchRequestObj.searchRequest["filter"] = newFilterData;

  var dataLowerGrid = {};

  Promise.all([Recon.findOne(searchRequestObj)]).then(function(values){
    if(values != undefined && values != null) {
      var data = values[0];
      dataLowerGrid = data;
      if(data.status == "FAILURE"){
        displayErrorMessage(data.responseText,"Failed to load the Recon Ingest Tab:");
      }else  {

        if(data.reconStatsDetails == undefined || (data.reconStatsDetails != null && data.reconStatsDetails.length <= 0)) {

          scope.attr("emptyrows", true);

        } else {

          scope.attr("emptyrows", false);

        } 
        if(searchRequestObj.searchRequest["offset"]==0)
          scope.ingestList.headerRows.replace(data.reconStatsDetails);
        else {
          $.merge(scope.ingestList.headerRows, data.reconStatsDetails);
          scope.ingestList.headerRows.replace(scope.ingestList.headerRows);
        }

        scope.reconStatsDetailsSelected = data.reconStatsDetails;

        scope.currencyScope.replace(data.currency);

        if(scope.reconRefresh[0] != undefined) {
          scope.reconRefresh[0].attr("currency", data.currency != null && data.currency.length > 0 ? data.currency[0] : "");
          $("#currency").val(scope.reconRefresh[0].attr("currency"));
        }

        

        if(data.summary == undefined){
          console.error("Footer rows doesn't exists in the response");
        }

      if (data.summary!== null) {
        var footerLine= {
          "__isChild": true,
          "ccy":"EUR",
          "pubfee": data.summary.totalPubFee,
          "reconAmt": data.summary.totalRecon,
          "liDispAmt": data.summary.totalLi,
          "copConAmt": data.summary.totalCopCon,
          "unMatchedAmt": data.summary.totalUnMatched,
          "badLines": data.summary.totalBadLines,
          "ccidId":"",
          "entityName":"",
          "countryId":"",
          "contType":"",
          "fiscalPeriod":"",
          "ingstdDate":"",
          "invFileName":"",
          "status":"",
          "isFooterRow":true
        };
      }

        scope.ingestList.footerRows.replace(footerLine);
      }
    }

  },function(xhr){
    console.error("Error while loading: fetchReconIngest"+xhr);
  }).then(function(values){

    if(load) {
      var ccidCheckbox = $("input.ccid")

      for(var i=0; i<ccidCheckbox.length  ;i++) {

        ccidCheckbox[i].click();

      }

      var ccids = scope.ingestCcidSelected;
      scope.reconRefresh[0].loadRefreshStats(dataLowerGrid, scope.reconRefresh[0]);
    } else {

      scope.attr("load", true);

      var ccidCheckbox = $("input.ccid")

      for(var i=0; i<ccidCheckbox.length  ;i++) {

        for(var j=0; j< scope.ingestCcidSelected.length; j++ ) {

          if (scope.ingestCcidSelected[j] == ccidCheckbox[i].getAttribute("value")) {

            ccidCheckbox[i].checked = true;

          }
        }

      }

    }


  });
}



var fetchReconDetails = function(scope){

  var searchRequestObj = UserReq.formGlobalRequest(scope.appstate);
  searchRequestObj.searchRequest["type"] = scope.tabName.incoming.attr("type");;
  //TODO During pagination / scrolling, the below values has tobe chnaged.

  if(scope.appstate.attr('globalSearchButtonClicked')==true){
      scope.attr("incomingOffset",0);
      scope.attr("incomingScrollTop",0);
  }
  searchRequestObj.searchRequest["limit"] = "10";
  searchRequestObj.searchRequest["offset"] = scope.incomingOffset;
  searchRequestObj.searchRequest["sortBy"] = "COUNTRY";
  searchRequestObj.searchRequest["sortOrder"] = "ASC";

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

      if(data.reconStatsDetails == undefined || (data.reconStatsDetails != null && data.reconStatsDetails.length <= 0)) {

        scope.attr("emptyrows", true);

      } else {

        scope.attr("emptyrows", false);

      }   
      if(searchRequestObj.searchRequest["offset"]==0)
        scope.incomingDetails.headerRows.replace(data.reconStatsDetails);
      else {
        $.merge(scope.incomingDetails.headerRows, data.reconStatsDetails);
        scope.incomingDetails.headerRows.replace(scope.incomingDetails.headerRows);
      }

      scope.incomingStatsDetailsSelected = data.reconStatsDetails;

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
    console.error("Error while loading: fetchReconDetails"+xhr);
  });
}





var refreshChekboxSelection = function(el,scope){
  var row = el.closest('tr').data('row').row;
  if(scope.tabSelected == scope.tabName.ingest.attr("name")){
    if(el[0].checked) {
      scope.ingestCcidSelected.push(row.dtlHdrId);
    } else {
      var index = _.indexOf(scope.ingestCcidSelected, row.dtlHdrId);
      (index > -1) && scope.ingestCcidSelected.splice(index, 1);
    }
    scope.attr("size_ingestCcidSelected" ,_.size(scope.attr("ingestCcidSelected")));
  }else{

    if(el[0].checked) {
      scope.incomingCcidSelected.push(row.dtlHdrId);
    } else {
      var index = _.indexOf(scope.incomingCcidSelected, row.dtlHdrId);
      (index > -1) && scope.incomingCcidSelected.splice(index, 1);
     }
    scope.attr("size_incomingCcidSelected" ,_.size(scope.attr("incomingCcidSelected")));

  }
};

var findCCids =  function(scope, ccidSelected, tab) {

  var found = false;

  var detailsList = [];

  detailsList = scope.incomingStatsDetailsSelected;

  for( var i=0; i< detailsList.length ; i++) {

    //alert('Here');
    if(ccidSelected.indexOf(detailsList[i].dtlHdrId) >= 0) {

      detailsList.splice(i,1);
      found = true;

      scope.incomingStatsDetailsSelected.replace(detailsList);
      break;

    }
  }

  if(found) {

    findCCids(scope, ccidSelected);

  }

}


export default page;
