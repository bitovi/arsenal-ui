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
import detailsColumns from './column-sets/details-columns';
import Recon from 'models/recon/';

import tokeninput from 'tokeninput';
import css_tokeninput from 'tokeninput.css!';
import css_tokeninput_theme from 'tokeninput_theme.css!';

import commonUtils from 'utils/commonUtils';
import FileManager from 'utils/fileManager/';


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
    detailGridColumns: detailsColumns,
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

    reconStatsDetailsSelected : [],

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
        commonUtils.triggerGlobalSearch();
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
          fetchReconIngest(this.scope);
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
    }
   }
});


var processRejectIngestRequest = function(scope,requestType){
    var ccidList ;
    var type ;
    var ccidSelected = [];

    if(scope.tabSelected == scope.tabName.ingest.attr("name")){
      ccidList = scope.attr("ingestCcidSelected");
      type =  scope.tabName.ingest.attr("type");
    }else{
      ccidList = scope.attr("incomingCcidSelected");
      type =  scope.tabName.incoming.attr("type");
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

      Promise.all(Recon.reject(rejectSearchRequestObj)).then(function(values) {

        //scope.reconStatsDetailsSelected = data.reconStatsDetails;

        findCCids(scope, ccidSelected);

        scope.ingestList.headerRows.replace(scope.reconStatsDetailsSelected);

        scope.attr("size_ingestCcidSelected", 0);

        if(values != null && values.length > 0) {
          if(data.responseCode == "0000"){
            $("#messageDiv").html("<label class='successMessage'>"+data.responseText+"</label>")
            $("#messageDiv").show();
            this.scope.reconRefresh[0].summaryStatsData.splice(0,1);
            $('.statsTable').hide();
            setTimeout(function(){
              $("#messageDiv").hide();
            },3000);
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
var fetchReconIngest = function(scope){
  var searchRequestObj = UserReq.formGlobalRequest(scope.appstate);
  searchRequestObj.searchRequest["type"] =  scope.tabName.ingest.attr("type");
  //TODO During pagination / scrolling, the below values has tobe chnaged.
  searchRequestObj.searchRequest["limit"] = "10";
  searchRequestObj.searchRequest["offset"] = "0";
  searchRequestObj.searchRequest["sortBy"] = "COUNTRY";
  searchRequestObj.searchRequest["sortOrder"] = "ASC";
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
      displayErrorMessage(data.responseText,"Failed to load the Recon Ingest Tab:");
    }else  {
      scope.ingestList.headerRows.replace(data.reconStatsDetails);

      scope.reconStatsDetailsSelected = data.reconStatsDetails

      scope.currencyScope.replace(data.currency);

      $("#currency").val(data.currency[0]);

      if(data.summary == undefined){
        console.error("Footer rows doesn't exists in the response");
      }

      var footerLine= {
        "__isChild": true,
        "ccy":"EUR",
        "pubfee":data.summary.totalPubFee,
        "reconAmt":data.summary.totalRecon,
        "liDispAmt":data.summary.totalLi,
        "copConAmt":data.summary.totalCopCon,
        "unMatchedAmt":data.summary.totalUnMatched,
        "badLines":data.summary.totalBadLines,
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

      scope.ingestList.footerRows.replace(footerLine);
    }

  },function(xhr){
    console.error("Error while loading: fetchReconIngest"+xhr);
  });
}



var fetchReconDetails = function(scope){

  var searchRequestObj = UserReq.formGlobalRequest(scope.appstate);
  searchRequestObj.searchRequest["type"] = scope.tabName.incoming.attr("type");;
  //TODO During pagination / scrolling, the below values has tobe chnaged.
  searchRequestObj.searchRequest["limit"] = "10";
  searchRequestObj.searchRequest["offset"] = "0";
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
      scope.incomingDetails.headerRows.replace(data.reconStatsDetails);

      var footerLine= {
        "__isChild": true,
        "ccy":"EUR",
        "pubfee":data.summary.totalPubFee,
        "reconAmt":data.summary.totalRecon,
        "liDispAmt":data.summary.totalLi,
        "copConAmt":data.summary.totalCopCon,
        "unMatchedAmt":data.summary.totalUnMatched,
        "badLines":data.summary.totalBadLines,
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
}

var findCCids =  function(scope, ccidSelected) {

  var found = false;
  for( var i=0; i< scope.reconStatsDetailsSelected.length ; i++) {

    //alert('Here');
    if(ccidSelected.indexOf(scope.reconStatsDetailsSelected[i].dtlHdrId) >= 0) {

      scope.reconStatsDetailsSelected.splice(i,1);
      found = true;
      break;

    }
  }

  if(found) {

    findCCids(scope, ccidSelected);

  }

}


export default page;
