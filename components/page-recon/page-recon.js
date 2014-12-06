import _ from 'lodash';
import Component from 'can/component/';
import template from './template.stache!';
import styles from './page-recon.less!';
import Stats from 'models/refreshstats/refreshstats';
import ReconStats from 'components/recon-stats/';
import RinsCommon from 'utils/';
import UserReq from 'utils/request/';

import reconGrid from  'components/recon-grid/';
import ingestedColumns from './column-sets/ingest-columns';
import detailsColumns from './column-sets/details-columns';

import route from 'can/route/';

import Recon from 'models/recon/';



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
    ingestList: new can.List(),
    incomingDetails: new can.List(),
    ingestCcidSelected:[],
    incomingCcidSelected:[],
    size_ingestCcidSelected:0,
    size_incomingCcidSelected:0,

    //bottomgrid
    refreshStatsReq:undefined,
    isBottomGridRefresh:true

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
    console.log("Appstat: "+JSON.stringify(this.scope.attr("appstate")));
    fetchReconIngest(this.scope);
    fetchReconDetails(this.scope);
  },
  events:{
    'shown.bs.tab': function(el, ev) {
      this.scope.attr("tabSelected", $('.nav-tabs .active').text());
    },
    ".downloadLink.badLines click": function(item, el, ev){
      var self=this.scope;
      var row = item.closest('tr').data('row').row;
      //TODO - Call Download
    },
    ".downloadLink.fileName click": function(item, el, ev){
      var self=this.scope;
      var row = item.closest('tr').data('row').row;

      //TODO - Call Download
    },
    ".downloadLink.liDispAmt click": function(item, el, ev){
      var self=this.scope;
      var row = item.closest('tr').data('row').row;
      //TODO - Call Download
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
      this.scope.appstate.attr('page','dashboard');
    },
    '.btn-OverRep click': function() {
        window.open(RinsCommon.RINS_OLD_URL);
    },
    '.btn-confirm-cancel click': function(){
      //nothing to do
    },
    '.btn-confirm-ok click': function(){

      $('#rejectModal').modal('hide');
      processRejectIngestRequest(this.scope,"reject");

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
        console.log(JSON.stringify(UserReq.formRequestDetails(rejectSearchRequestObj)));

        Recon.reject(UserReq.formRequestDetails(rejectSearchRequestObj)).done(function(data){
          if(data.responseCode == "0000"){
            $("#messageDiv").html("<label class='successMessage'>"+data.responseText+"</label>")
            $("#messageDiv").show();
            setTimeout(function(){
              $("#messageDiv").hide();
            },3000);
          }else{
            //error text has to be shared. TODO - not sure how service responds to it
            console.log("Error") ;
          }
        });

    }else if(requestType == "ingest"){


      var rejectSearchRequestObj =   {
        "searchRequest": {
          "ids" : ccidSelected
        }
      }
      console.log(JSON.stringify(UserReq.formRequestDetails(rejectSearchRequestObj)));

      Recon.ingest(UserReq.formRequestDetails(rejectSearchRequestObj)).done(function(data){
        if(data.responseCode == "0000"){
          $("#messageDiv").html("<label class='successMessage'>"+data.responseText+"</label>")
          $("#messageDiv").show();
          setTimeout(function(){
            $("#messageDiv").hide();
          },3000);
        }else{
          //error text has to be shared. TODO - not sure how service responds to it
          console.log("Error") ;
        }
      });

    }
}

var fetchReconIngest = function(scope){

  var searchRequestObj = {
    "searchRequest":{
      type:"INGESTED"
    }
  };

  // var periodFrom = appstate.attr('periodFrom');
  // var periodTo = appstate.attr('periodTo');
  // var serTypeId = appstate.attr('storeType');
  // var regId = appstate.attr('region');
  // var countryId = appstate.attr()['country'];
  // var licId = appstate.attr()['licensor'];
  // var contGrpId = appstate.attr()['contentType'];

//  scope.attr("refreshStatsReq",searchRequestObj);

  Recon.findOne(UserReq.formRequestDetails(searchRequestObj),function(data){
    scope.ingestList.replace(data.reconStatsDetails);
  },function(xhr){
    console.error("Error while loading: fetchReconIngest"+xhr);
  });
}

var fetchReconDetails = function(scope){

  var searchRequestObj = {
    "searchRequest":{
      type:"INCOMING"
    }
  };
  // var periodFrom = appstate.attr('periodFrom');
  // var periodTo = appstate.attr('periodTo');
  // var serTypeId = appstate.attr('storeType');
  // var regId = appstate.attr('region');
  // var countryId = appstate.attr()['country'];
  // var licId = appstate.attr()['licensor'];
  // var contGrpId = appstate.attr()['contentType'];
  //
  //console.log('The request is :'+JSON.stringify(onAccountrequest));

  Recon.findOne(UserReq.formRequestDetails(searchRequestObj),function(data){
    scope.incomingDetails.replace(data.reconStatsDetails);
  },function(xhr){
    console.error("Error while loading: fetchReconDetails"+xhr);
  });
}

var refreshChekboxSelection = function(el,scope){
  var row = el.closest('tr').data('row').row;

  if(scope.tabSelected == scope.tabName.ingest.attr("name")){
    if(el[0].checked) {
      scope.ingestCcidSelected.push(row.ccidId);
    } else {
      var index = _.indexOf(scope.ingestCcidSelected, row.ccidId);
      (index > -1) && scope.ingestCcidSelected.splice(index, 1);
    }
    scope.attr("size_ingestCcidSelected" ,_.size(scope.attr("ingestCcidSelected")));
  }else{

    if(el[0].checked) {
      scope.incomingCcidSelected.push(row.ccidId);
    } else {
      var index = _.indexOf(scope.incomingCcidSelected, row.ccidId);
      (index > -1) && scope.incomingCcidSelected.splice(index, 1);
     }
    scope.attr("size_incomingCcidSelected" ,_.size(scope.attr("incomingCcidSelected")));

  }
}

export default page;
