import Component from 'can/component/';
import stache from 'can/view/stache/';

import template from './template.stache!';
import gridtemplate from './gridtemplate.stache!';
//import _less from './page-on-account.less!';

import stache from 'can/view/stache/';

import UserReq from 'models/rinsCommon/request/';

import OnAccountGrid from 'components/on-account-balance/';
import Grid from 'components/grid/';

// Grid.extend({
//   tag: 'rn-grid-onaccount',
//   template: gridtemplate,
//   scope: {
//      columns: [
//       {
//         id: 'toggle',
//         title: '<span class="open-toggle-all"></span>',
//         contents: function(row) { return stache('{{#unless isChild}}<span class="open-toggle"></span>{{/unless}}')({isChild: row.__isChild}); }
//       },
//       {
//         id: 'licensor',
//         title: 'Licensor',
//         contents: function(row) { return stache('{{licensor}}')({licensor: row.licensor}); }
//       },
//       {
//         id: 'type',
//         title: 'Type',
//         contents: function(row) { return 'Payment'; }
//       },
//       {
//         id: 'description',
//         title: 'Description',
//         sortable: true,
//         compare: function(a, b) { return (a.description < b.description ? -1 : (a.description > b.description ? 1 : 0)); }
//       },
//       {
//         id: 'region',
//         title: 'Region',
//         sortable: true,
//         defaultSortDirection: 'desc'
//       }
//     ]
//   },
//   events: {
//     'inserted': function(ev) {
     
//     }
      
//   }
// });


var page = Component.extend({
  tag: 'page-on-account',
  template: template,
  scope: {
    localGlobalSearch:undefined
  },
  init: function(){
	 //console.log('inside Claim Review');
	 
    },
    events: {
    	"inserted": function(){
        // var rows = new can.List(_.times(10, i => {
        //   return {
        //     licensor: 'Licensor ' + (i + 1),
        //     type: 'Payment',
        //     description: 'Invoice #' + _.random(1, 1000),
        //     region: 'Europe ' + _.random(1, 9),
        //     '__isChild': (i % 3) !== 0
        //   };
        // }));
        // console.log(JSON.stringify(rows));
        //$('#onAccount').append(stache('<rn-grid-onaccount rows={rows}></rn-grid-onaccount>')({rows}));
       // $("#onAccount").append(stache('<rn-grid-onaccount details={rows}></rn-grid-onaccount>')({rows}));

        $('#onAccount').append(stache('<on-account-grid></on-account-grid>')());
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
