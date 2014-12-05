import _ from 'lodash';
import Component from 'can/component/';
import template from './template.stache!';
import styles from './page-recon.less!';
import Stats from 'models/refreshstats/refreshstats';
import ReconStats from 'components/recon-stats/';
import UserReq from 'utils/request/';

import reconGrid from  'components/recon-grid/';
import ingestedColumns from './column-sets/ingest-columns';
import detailsColumns from './column-sets/details-columns';

import route from 'can/route/';

import Recon from 'models/recon/';

var tabNameObj = {
    ingest:"Ingested",
    incoming:"Incoming Details",
}

var page = Component.extend({
  tag: 'page-recon',
  template: template,
  scope: {
    appstate:undefined,
    tabSelected :tabNameObj.ingest,
    tabName:tabNameObj,
    ingestGridColumns: ingestedColumns,
    detailGridColumns: detailsColumns,
    ingestList: new can.List(),
    ingestCcidSelected:[],
    incomingCcidSelected:[],
    size_ingestCcidSelected:0,
    size_incomingCcidSelected:0

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




      //TODO - Call Download
    }
  }
});



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

  Recon.findOne(UserReq.formRequestDetails(searchRequestObj),function(data){
    scope.ingestList.replace(data.reconStatsDetails);
  },function(xhr){
    console.error("Error while loading: bundleNames"+xhr);
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
    scope.ingestList.replace(data.reconStatsDetails);
  },function(xhr){
    console.error("Error while loading: bundleNames"+xhr);
  });
}

var refreshChekboxSelection = function(el,scope){
  var row = el.closest('tr').data('row').row;

  if(scope.tabSelected == scope.tabName.attr("ingest")){
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
