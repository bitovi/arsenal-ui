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


var page = Component.extend({
  tag: 'page-recon',
  template: template,
  scope: {
    appstate:undefined,
    tabSelected :"",
    ingestGridColumns: ingestedColumns,
    detailGridColumns: detailsColumns,
    ingestList: new can.List(),
    ccidSelected:[],
    sizeCcidSelected:0

  },
  helpers: {
    isRejectBtn:function(ref){

      return (this.attr("sizeCcidSelected") == ref ? 'disabled' : '' ) ;

      //return 'style="display:' + (pageName === this.attr('tabSelected') ? 'block' : 'none') + '"';
    }
  },
  init: function(){
    console.log("Calling fetchReconDetails");

    fetchReconIngest(this.scope);

  },
  events:{
    'shown.bs.tab': function(el, ev) {
      this.scope.attr("tabSelected", $('.nav-tabs .active').text());
      console.log(this.scope.attr("tabSelected"));
    },
    ".downloadLink.badLines click": function(item, el, ev){
      var self=this.scope;
      var row = item.closest('tr').data('row').row;
      console.log(" row : "+row.ccidId);
      //TODO - Call Download
    },
    ".downloadLink.fileName click": function(item, el, ev){
      var self=this.scope;
      var row = item.closest('tr').data('row').row;
      console.log(" 2 row : "+row.ccidId);
      //TODO - Call Download
    },
    ".downloadLink.liDispAmt click": function(item, el, ev){
      var self=this.scope;
      var row = item.closest('tr').data('row').row;
      console.log(" 2 row : "+row.ccidId);
      //TODO - Call Download
    },
    '.toggle :checkbox change': function(el, ev) {
      var row = el.closest('tr').data('row').row;

      if(el[0].checked) {
        this.scope.ccidSelected.push(row.ccidId);
      } else {
        var index = _.indexOf(this.scope.ccidSelected, row.ccidId);
        (index > -1) && this.scope.ccidSelected.splice(index, 1);
      }

      this.scope.attr("sizeCcidSelected" ,_.size(this.scope.attr("ccidSelected")));


      //TODO - Call Download
    }
  }
});



var fetchReconIngest = function(scope){
  console.log("fetchReconIngest");
  var requestObj = {};
  // var periodFrom = appstate.attr('periodFrom');
  // var periodTo = appstate.attr('periodTo');
  // var serTypeId = appstate.attr('storeType');
  // var regId = appstate.attr('region');
  // var countryId = appstate.attr()['country'];
  // var licId = appstate.attr()['licensor'];
  // var contGrpId = appstate.attr()['contentType'];
  //
  //console.log('The request is :'+JSON.stringify(onAccountrequest));

  Recon.findOne(UserReq.formRequestDetails(requestObj),function(data){
    console.log("response is "+JSON.stringify(data.reconStatsDetails));
    scope.ingestList.replace(data.reconStatsDetails);
  },function(xhr){
    console.error("Error while loading: bundleNames"+xhr);
  });
}

var fetchReconDetails = function(scope){
  console.log("fetchReconDetails");
  var requestObj = {};
  // var periodFrom = appstate.attr('periodFrom');
  // var periodTo = appstate.attr('periodTo');
  // var serTypeId = appstate.attr('storeType');
  // var regId = appstate.attr('region');
  // var countryId = appstate.attr()['country'];
  // var licId = appstate.attr()['licensor'];
  // var contGrpId = appstate.attr()['contentType'];
  //
  //console.log('The request is :'+JSON.stringify(onAccountrequest));

  Recon.findOne(UserReq.formRequestDetails(requestObj),function(data){
    console.log("response is "+JSON.stringify(data.reconStatsDetails));
    scope.ingestList.replace(data.reconStatsDetails);
  },function(xhr){
    console.error("Error while loading: bundleNames"+xhr);
  });
}


export default page;
