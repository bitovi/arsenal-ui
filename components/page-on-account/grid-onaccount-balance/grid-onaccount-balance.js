import _ from 'lodash';

import onAccountBalance from 'models/onAccount/onAccountBalance/';

import _less from './grid-onaccount-balance.less!';
import template from './template.stache!';
import Grid from 'components/grid/';



import stache from 'can/view/stache/';
import utils from 'components/page-on-account/utils';
import requestHelper from 'utils/request/';
import periodWidgetHelper from 'utils/periodWidgetHelpers';
import gridUtils from 'utils/gridUtil';

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
  helpers: {
    columnClass: function(column) {
      if(column.id == 'Licensor' || column.id == 'Currency' || column.id == 'ContentType' || column.id == 'onAccountBalance' || column.id == 'cashAdjust'){
        return column.id;
     }else {
        return column.id+" others";
      }
    }
  },
  init: function(){



    },
  events: {
    'inserted': function(ev) {
       var self = this;
       var recordsAvailable=false;
       //console.log("inserted "+JSON.stringify(self.scope.request.searchRequest.attr()));
       var parentScopeVar = self.element.closest('page-on-account').scope();
       var tbody = self.element.find('tbody');
       //setting tbody height which determines the page height- start
       var getTblBodyHght=gridUtils.getTableBodyHeight('onAccountBalanceGrid',97);
       gridUtils.setElementHeight(tbody,getTblBodyHght,getTblBodyHght);
       //setting tbody height - end
       if(self.scope.request != null && self.scope.request != undefined
        && self.scope.request.quarters != null && self.scope.request.quarters != undefined){
         var quarters = self.scope.request.quarters;

         for(var i=0;i<quarters.length;i++){
          var column={
            //id:quarters[i],
            id:periodWidgetHelper.getFiscalPeriod(quarters[i]),
            title:quarters[i]
          };
          self.scope.columns.push(column);
         }

          var balanceColumn={
            id:'onAccountBalance',
            title:'OnAccount Balance'
          };
          self.scope.columns.push(balanceColumn);

          var cashAdjustColumn={
            id:'cashAdjust',
            title:'Licensor Cash Adjustment'
          };

          self.scope.columns.push(cashAdjustColumn);
          parentScopeVar.attr('showLoadingImage',true);
            onAccountBalance.findOne(createBalanceOnAccountRequest(this.scope.request.appstate),function(data){
              parentScopeVar.attr('showLoadingImage',false);
                      if(data["status"]=="SUCCESS"){
                        if(data.onAccount != undefined && data.onAccount.onAccountDetails != undefined && data.onAccount.onAccountDetails.length==0){
                          self.scope.attr('emptyrows',true);
                          recordsAvailable=data.recordsAvailable;
                        }else{
                          var detailRows = utils.prepareRowsForDisplay(data.onAccount.onAccountDetails,quarters);
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


      var tableScrollTopVal = parentScopeVar.attr('tableScrollTop');
      $(tbody[0]).scrollTop(tableScrollTopVal);
        $(tbody).on('scroll', function(ev) {
          if(tbody[0].scrollTop + tbody[0].clientHeight >= tbody[0].scrollHeight && recordsAvailable) {
            //console.log(JSON.stringify(self.element.closest('page-invoices').scope().appstate.attr()));


            var offsetVal = parentScopeVar.attr('balanceOnAccOffset');
            //console.log(offsetVal);

            /* Reset the offset value and call the webservice to fetch next set of records */
            parentScopeVar.attr('balanceOnAccOffset', (parseInt(offsetVal)+1));
            parentScopeVar.attr('tableScrollTop', (tbody[0].scrollHeight-200));
            parentScopeVar.appstate.attr('globalSearchButtonClicked', false);

            /* The below code calls {scope.appstate} change event that gets the new data for grid*/
            /* All the neccessary parameters will be set in that event */
           if(parentScopeVar.appstate.attr('globalSearch')){
              parentScopeVar.appstate.attr('globalSearch', false);
            }else{
              parentScopeVar.appstate.attr('globalSearch', true);
            }
          }
        });
    //  setTimeout(function(){
      //  alignGrid('onAccountBalanceGrid');
      //},2000);

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
  var sortByAttr="";
  var sort=appstate.attr("sortBy");
  var sortByMap=utils.getSortByAttr();
  var balancedOnAccountRequest={};
  balancedOnAccountRequest.searchRequest=requestHelper.formGlobalRequest(appstate).searchRequest;
  balancedOnAccountRequest.searchRequest.type="BALANCE";
  balancedOnAccountRequest.searchRequest.offset=appstate.attr("offset");
  balancedOnAccountRequest.searchRequest.limit=appstate.attr("fetchSize");
  
  if(sort != undefined && sortByMap[sort] != undefined){
    sortByAttr = sortByMap[sort];
  }else if(sort!= undefined && sort.length >0){
    sortByAttr = 'onAccountAmt';
  }

  balancedOnAccountRequest.searchRequest.sortBy=sortByAttr;
  balancedOnAccountRequest.searchRequest.sortOrder=appstate.attr("sortOrder");
  return requestHelper.formRequestDetails(balancedOnAccountRequest);
};


/*function alignGrid(divId){
  var colLength = $('#'+divId+' table>thead>tr>th').length;
  var rowLength = $('#'+divId+' table>tbody>tr').length;
  var divWidth = $('#'+divId).outerWidth();
  var tableWidth = 0;
  var tdWidth, cellWidthArr = [];
  if(rowLength>0){
    $('#'+divId+' table').css("width",divWidth-400);
      for(var i=1;i<=colLength;i++){
        var theadTdWidth = $('#'+divId+' table>thead>tr>th:nth-child('+i+')').outerWidth();
        var tbodyTdWidth = $('#'+divId+' table>tbody>tr>td:nth-child('+i+')').outerWidth();
        var tfootTdWidth = $('#'+divId+' table>tfoot>tr>td:nth-child('+i+')').outerWidth();

        if(theadTdWidth >= tbodyTdWidth && theadTdWidth >= tfootTdWidth)
          tdWidth = theadTdWidth;
        else if(tfootTdWidth >= tbodyTdWidth && tfootTdWidth >= theadTdWidth)
          tdWidth = tfootTdWidth;
        else
          tdWidth = tbodyTdWidth;

        if(i==1)
           tdWidth = 225;
        tableWidth += tdWidth;
        cellWidthArr.push(tdWidth);
      }

      if(tableWidth < divWidth){
        var moreWidth = (divWidth-tableWidth)/colLength;
        for(var j=1;j<=cellWidthArr.length;j++){
          var width = Math.round(cellWidthArr[j-1]+moreWidth);
          $('#'+divId+' table>thead>tr>th:nth-child('+j+')').css("width",width);
          $('#'+divId+' table>tbody>tr>td:nth-child('+j+')').css("width",width);
          $('#'+divId+' table>tfoot>tr>td:nth-child('+j+')').css("width",width);
        }
        $('#'+divId+' table').css("width",divWidth);
      } else {
        for(var j=1;j<=cellWidthArr.length;j++){
          var width = cellWidthArr[j-1];
          $('#'+divId+' table>thead>tr>th:nth-child('+j+')').css("width",width);
          $('#'+divId+' table>tbody>tr>td:nth-child('+j+')').css("width",width);
          $('#'+divId+' table>tfoot>tr>td:nth-child('+j+')').css("width",width);
        }
        $('#'+divId+' table').css("width",tableWidth);
      }
  }
}*/

export default OnAccountBalance;
