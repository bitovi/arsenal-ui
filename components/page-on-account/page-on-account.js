import Component from 'can/component/';
import stache from 'can/view/stache/';

import template from './template.stache!';
import gridtemplate from './gridtemplate.stache!';
import _less from './page-on-account.less!';

import stache from 'can/view/stache/';

import UserReq from 'models/rinsCommon/request/';

import OnAccountGrid from 'components/grid-onaccount-balance/';
import Grid from 'components/grid/';

var page = Component.extend({
  tag: 'page-on-account',
  template: template,
  scope: {
    localGlobalSearch:undefined,
    request:{},
    tabsClicked:"@"
  },
  init: function(){
	 //console.log('inside Claim Review');
	 
    },
    events: {
    	"inserted": function(){ 
       
    	},
      '{scope.appstate} change': function() {

        this.scope.attr("localGlobalSearch",this.scope.appstate.attr('globalSearch'));

        //&& this.scope.tabsClicked=="ON_ACC_BALANCE"

        if(this.scope.appstate.attr('globalSearch') && this.scope.tabsClicked=="ON_ACC_BALANCE"){
          //alert('inside');
             var request = frameRequest(this.scope.appstate); 
            //$('#onAccount').append(stache('<on-account-grid request={{request}}></on-account-grid>')({request}));
             $('#onAccountBalanceGrid').append(stache('<rn-onaccount-balance-grid request={request}></rn-onaccount-balance-grid>')({request}));
        }
      },
      "#onAccountBalance click":function(el, ev){
        ev.preventDefault();
        this.scope.tabsClicked="ON_ACC_BALANCE";
        $("#onAccountBalanceDiv").addClass('active');
         $("#onAccountBalanceDiv").removeClass('fade');

        $("#newonAccountDiv").removeClass('active');
        console.log(this.scope.tabsClicked);
      },
      "#newonAccount click":function(el, ev){
        ev.preventDefault();
        this.scope.tabsClicked="NEW_ON_ACC";
        $("#newonAccountDiv").addClass('active');
         $("#newonAccountDiv").removeClass('fade');

        $("#onAccountBalanceDiv").removeClass('active');
        $("#proposedonAccountDiv").removeClass('active');
        console.log(this.scope.tabsClicked);
      },
      "#proposedonAccount click":function(el, ev){
        ev.preventDefault();
        this.scope.tabsClicked="PROPOSED_ON_ACC";
        $("#proposedonAccountDiv").addClass('active');
         $("#proposedonAccountDiv").removeClass('fade');

        $("#newonAccountDiv").removeClass('active');
        $("#onAccountBalanceDiv").removeClass('active');
        console.log(this.scope.tabsClicked);
      }
    }
});

var frameRequest = function(appstate){
      var onAccountrequest = {};
      var periodFrom = appstate.attr('periodFrom');
      var periodTo = appstate.attr('periodTo');
      var serTypeId = appstate.attr('storeType');
      var regId = appstate.attr('region');
      var countryId = appstate.attr()['country'];
      var licId = appstate.attr()['licensor'];
      var contGrpId = appstate.attr()['contentType'];

      
      onAccountrequest.searchRequest = {};
      onAccountrequest.searchRequest["periodFrom"] = "";
      onAccountrequest.searchRequest["periodTo"] = "";
      onAccountrequest.searchRequest["serviceTypeId"] = "";
      onAccountrequest.searchRequest["regionId"] = "";
      onAccountrequest.searchRequest["country"] = [];
      onAccountrequest.searchRequest["entityId"] = [];
      onAccountrequest.searchRequest["contentGrpId"] = [];
      onAccountrequest.searchRequest["periodType"] = "Q";
      onAccountrequest.searchRequest["type"] = "BALANCE";

      if(typeof(periodFrom) != "undefined"){
        onAccountrequest.searchRequest["periodFrom"] = periodFrom;
      }

      if(typeof(periodTo)!="undefined"){
        onAccountrequest.searchRequest["periodTo"] = periodTo;
      }

      if(typeof(serTypeId)!="undefined"){
        onAccountrequest.searchRequest["serviceTypeId"] = serTypeId['id'];
      }

      if(typeof(regId)!="undefined"){
        onAccountrequest.searchRequest["regionId"] = regId['id'];
      }
      
      
      if(typeof(countryId)!="undefined"){
        onAccountrequest.searchRequest["country"]=countryId;
      }

      
      if(typeof(licId)!="undefined"){
        onAccountrequest.searchRequest["entityId"]=licId;
      }

      
      if(typeof(contGrpId)!="undefined"){
        onAccountrequest.searchRequest["contentGrpId"]=contGrpId;
      }

      console.log('The request is :'+JSON.stringify(onAccountrequest));
  return onAccountrequest;
} 

export default page;
