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



var page = Component.extend({
  tag: 'page-reconOther',
  template: template,
  scope: {
    appstate:undefined,
    incomingOtherGridColumns: incomingOtherColumns,
    incomingOtherList: new can.List(),
    isGlobalSearch:undefined,
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
      }
  },
  helpers: {
    //none
  },
  init: function(){
    this.scope.appstate.attr("renderGlobalSearch",true);
    this.scope.attr("isGlobalSearch",this.scope.appstate.attr("globalSearch"));

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
      //Download needs testing
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

    searchRequestObj.searchRequest["type"] = "OTHER";
    //TODO During pagination / scrolling, the below values has tobe chnaged.
    searchRequestObj.searchRequest["limit"] = "10";
    searchRequestObj.searchRequest["offset"] = "0";
    searchRequestObj.searchRequest["sortBy"] = "COUNTRY";
    searchRequestObj.searchRequest["sortOrder"] = "ASC";

    Recon.findOne(UserReq.formRequestDetails(searchRequestObj),function(data){
      if(data.status = "FAILURE"){
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
