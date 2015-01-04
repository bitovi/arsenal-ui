import _ from 'lodash';

import onAccountBalance from 'models/onAccount/onAccountBalance/';

import _less from './grid-onaccount-balance.less!';
import template from './template.stache!';
import Grid from 'components/grid/';



import stache from 'can/view/stache/';
import utils from 'components/page-on-account/utils';
import requestHelper from 'utils/request/';

var OnAccountBalance = Grid.extend({
  tag: 'rn-onaccount-balance-grid',
  template: template,
  scope: {
    columns: [
      {
        id: 'Licensor',
        title: 'Licensor',
        contents: function(row) { 
            if(row.attr('tfooter')){
            return  stache('{{#unless isChild}}<span class="open-toggle"></span>{{/unless}} {{Licensor}}')({Licensor: row.Licensor, isChild: row.__isChild});;
          }
          return row.attr('Licensor');
         }
      },
      {
        id: 'Currency',
        title: 'Currency'
      },
      {
        id: 'ContentType',
        title: 'Content Type'
      }
    ],
    request:{},
    emptyrows:"@",
    appstate:undefined
  },
  init: function(){

    

    },
  events: {
    'inserted': function(ev) {
       var self = this;
       //console.log("inserted "+JSON.stringify(self.scope.request.searchRequest.attr()));
       if(self.scope.request != null && self.scope.request != undefined && self.scope.request.quarters != null && self.scope.request.quarters != undefined){
         var quarters = self.scope.request.quarters;

         for(var i=0;i<quarters.length;i++){
          var column={
            id:quarters[i],
            title:quarters[i]
          };
          self.scope.columns.push(column);
         }

          var balanceColumn={
            id:'onAccountBalance',
            title:'onAccount Balance'
          };
          self.scope.columns.push(balanceColumn);

          var cashAdjustColumn={
            id:'cashAdjust',
            title:'Licensor Cash Adjustment'
          };
          self.scope.columns.push(cashAdjustColumn);
            onAccountBalance.findOne(createBalanceOnAccountRequest(this.scope.request.appstate),function(data){
                      if(data["status"]=="SUCCESS"){
                        if(data.onAccount != undefined && data.onAccount.onAccountDetails != undefined && data.onAccount.onAccountDetails.length==0){
                          self.scope.attr('emptyrows',true);
                        }else{
                          var detailRows = utils.prepareRowsForDisplay(data.onAccount.onAccountDetails);
                          var footerRows=[];
                          if(data.onAccount.onAccountFooter != undefined){
                            footerRows = utils.createFooterRow(data.onAccount.onAccountFooter);
                          }
                          if(detailRows != undefined && detailRows.length==0){
                            self.scope.attr('emptyrows',true);
                          }else{ 
                           self.scope.rows.replace(detailRows);
                           if(footerRows != undefined && footerRows.length>0){
                             self.scope.footerrows.replace(footerRows);
                           } 
                          }
                        }
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

// var getUiRowsFromResponse=function(quarters,data){
//   //console.log(JSON.stringify(data.onAccount.attr()));
//   var onAccountDetails = data.onAccount.onAccountDetails
//   var periodData = data.onAccount.fiscalPeriodAmtMap;
//   var rows=[];
//   for (var i=0;i<onAccountDetails.length;i++){
//     var row = {};
//     row['id']= onAccountDetails[i].id;
//     row['entityId']=onAccountDetails[i].entityId;
//     row['Licensor']=onAccountDetails[i].entityName;
//     row['Currency']=onAccountDetails[i].currencyCode;
//     row['ContentType']=onAccountDetails[i].contentGroupName;
//     row['contentGroupId']=onAccountDetails[i].contentGroupId;
//     row['serviceTypeId']=onAccountDetails[i].serviceTypeId;


//     for(var k=0;k<quarters.length;k++){
//       var period = utils.getPeriodForQuarter(quarters[k]);
//       var amtObject = periodData[period];

//       row[quarters[k]]=0;
//       if(amtObject != undefined){
//         var value = amtObject[onAccountDetails[i].id];
//         if(value == undefined){
//           value =0;
//         }
//         row[quarters[k]]=utils.currencyFormat(value);
//       }
//     }
//     row['onAccountBalance']= utils.currencyFormat(onAccountDetails[i].onAccountAmt);
//     row['cashAdjust']= utils.currencyFormat(onAccountDetails[i].entityCAAmt);
//     rows.push(row);
//   }
//   //console.log(rows);
//   return rows;
// }

var createBalanceOnAccountRequest=function(appstate){
  var balancedOnAccountRequest={};
  balancedOnAccountRequest.searchRequest=requestHelper.formGlobalRequest(appstate).searchRequest;
  balancedOnAccountRequest.searchRequest.type="BALANCE";
  return requestHelper.formRequestDetails(balancedOnAccountRequest);
};

export default OnAccountBalance;
