import Component from 'can/component/';
import stache from 'can/view/stache/';

import template from './template.stache!';

import stache from 'can/view/stache/';

import UserReq from 'models/rinsCommon/request/';



var page = Component.extend({
  tag: 'page-claimreview',
  template: template,
  scope: {
    localGlobalSearch:undefined
  },
  init: function(){
	 //console.log('inside Claim Review');
	 
    },
    events: {
    	"inserted": function(){
    	},
      '{scope.appstate} change': function() {

          console.log('changed');
          var self=this;
          console.log("appState set to "+JSON.stringify(this.scope.appstate.attr()));
          if(this.scope.attr("localGlobalSearch") != this.scope.appstate.attr('globalSearch') ){
              this.scope.attr("localGlobalSearch",this.scope.appstate.attr('globalSearch'));
              console.log("User clicked on  search");

              var periodFrom = this.scope.appstate.attr('periodFrom');
              var periodTo = this.scope.appstate.attr('periodTo');
              var serTypeId = this.scope.appstate.attr('storeType');
              var regId = this.scope.appstate.attr('region');
              var countryId = this.scope.appstate.attr()['country'];
              var licId = this.scope.appstate.attr()['licensor'];
              var contGrpId = this.scope.appstate.attr()['contentType'];

              var claimLicSearchRequest = {};
              claimLicSearchRequest.searchRequest = {};
              if(typeof(periodFrom)=="undefined")
                claimLicSearchRequest.searchRequest["periodFrom"] = "";
              else
                claimLicSearchRequest.searchRequest["periodFrom"] = periodFrom;

              if(typeof(periodTo)=="undefined")
                claimLicSearchRequest.searchRequest["periodTo"] = "";
              else
                claimLicSearchRequest.searchRequest["periodTo"] = periodTo;

              if(typeof(serTypeId)=="undefined")
                claimLicSearchRequest.searchRequest["serviceTypeId"] = "";
              else
                claimLicSearchRequest.searchRequest["serviceTypeId"] = serTypeId['id'];

              if(typeof(regId)=="undefined")
                claimLicSearchRequest.searchRequest["regionId"] = "";
              else
                claimLicSearchRequest.searchRequest["regionId"] = regId['id'];
              
              claimLicSearchRequest.searchRequest["country"] = [];
              if(typeof(countryId)!="undefined")
                //claimLicSearchRequest.searchRequest["country"].push(countryId['value']);
                claimLicSearchRequest.searchRequest["country"]=countryId;

              claimLicSearchRequest.searchRequest["entityId"] = [];
              if(typeof(licId)!="undefined")
                claimLicSearchRequest.searchRequest["entityId"] = licId;

              claimLicSearchRequest.searchRequest["contentGrpId"] = [];
              if(typeof(contGrpId)!="undefined")
                claimLicSearchRequest.searchRequest["contentGrpId"] = contGrpId;

              claimLicSearchRequest.searchRequest["periodType"] = "P";

              claimLicSearchRequest.searchRequest["status"] = $("#inputAnalyze").val();
              claimLicSearchRequest.searchRequest["offset"] = "0";
              claimLicSearchRequest.searchRequest["limit"] = "10";
              
              var filterData = self.scope.tokenInput.attr();
              var newFilterData = [];
              if(filterData.length>0){
                for(var p=0;p<filterData.length;p++)
                  newFilterData.push(filterData[p]["name"]);
              }
              claimLicSearchRequest.searchRequest["filter"] = newFilterData;

              claimLicSearchRequest.searchRequest["sortBy"] = self.scope.sortColumns.attr().toString();
              claimLicSearchRequest.searchRequest["sortOrder"] = "ASC";

              console.log("Request are "+JSON.stringify(UserReq.formRequestDetails(claimLicSearchRequest)));

              claimLicensorInvoices.findAll(UserReq.formRequestDetails(claimLicSearchRequest),function(values){
                  //console.log("data is "+JSON.stringify(values[0].attr()));
                  self.scope.allClaimLicensorMap.replace(values[0]);
              },function(xhr){
                console.error("Error while loading: "+xhr);
              });
          }
      }
    }
});
export default page;
