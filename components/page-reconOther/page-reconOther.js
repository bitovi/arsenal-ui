import _ from 'lodash';
import Component from 'can/component/';
import template from './template.stache!';
import styles from './page-reconOther.less!';
import UserReq from 'utils/request/';

import reconGrid from  'components/recon-grid/';
import incomingOtherColumns from './column-sets/incomingOther-columns';
import Recon from 'models/recon/';


var page = Component.extend({
  tag: 'page-reconOther',
  template: template,
  scope: {
    appstate:undefined,
    incomingOtherGridColumns: incomingOtherColumns,
    incomingOtherList: new can.List(),
    isGlobalSearch:undefined
  },
  helpers: {
    //none
  },
  init: function(){
    this.scope.appstate.attr("renderGlobalSearch",true);
    this.scope.attr("isGlobalSearch",this.scope.appstate.attr("globalSearch"));

  },
  events:{
    ".downloadLink.fileName click": function(item, el, ev){
      var self=this.scope;
      var row = item.closest('tr').data('row').row;

    },
    '{scope.appstate} change': function() {
      if(this.scope.isGlobalSearch != this.scope.appstate.attr('globalSearch')){
        this.scope.attr("isGlobalSearch",this.scope.appstate.attr("globalSearch"));
        fetchReconIncoming(this.scope);
      }
    }
  }
});


var fetchReconIncoming = function(scope){



    var searchRequestObj = UserReq.formGlobalRequest(scope.appstate);

    console.log(UserReq.formGlobalRequest(scope.appstate));


    searchRequestObj.searchRequest["type"] = "OTHER";

   // console.log("Search Req:"+searchRequestObj);


    Recon.findOne(UserReq.formRequestDetails(searchRequestObj),function(data){

      scope.incomingOtherList.replace(data.reconStatsDetails);

    },function(xhr){

      console.error("Error while loading: fetchReconIncoming"+xhr);

    });

}

export default page;
