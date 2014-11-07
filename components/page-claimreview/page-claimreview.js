import Component from 'can/component/';
import stache from 'can/view/stache/';

import template from './template.stache!';
import styles from './page-claimreview.less!';

import Grid from 'components/grid/';
import stache from 'can/view/stache/';

import UserReq from 'models/rinsCommon/request/';
import claimLicensorInvoices from 'models/claim/licensor/';

import tokeninput from 'tokeninput';
import css_tokeninput from 'tokeninput.css!';
import css_tokeninput_theme from 'tokeninput_theme.css!';

import highchartpage from 'components/highchart/';

/* Extend grid with the columns */
Grid.extend({
  tag: "rn-claim-licensor-grid",
  scope: {
    appstate:undefined,
    columns: [
      /*{
        id: 'entityId',
        title: '',
        contents: function(row) {
          return stache('{{#entityId}}<input type="checkbox" value="{{entityId}}"/>{{/entityId}}')({entityId: row.entityId});
        }
      },*/
      {
        id: 'entity',
        title: 'Entity',
        contents: function(row) { return stache('{{#unless isChild}}<span class="open-toggle"></span>{{/unless}} {{entity}}')({entity: row.entity, isChild: row.__isChild}); }
      },
      {
        id: 'invoiceNum',
        title: 'Invoice #'
      },
      {
        id: 'currency',
        title: 'CCY'
      },
      {
        id: 'period',
        title: 'Period'
      },
      {
        id: 'country',
        title: 'Country'
      },
      {
        id: 'contentType',
        title: 'Con Type'
      },
      {
        id: 'invoiceAmt',
        title: 'Inv Amt'
      },
      {
        id: 'orDispAmt',
        title: 'Over Rep'
      },
      {
        id: 'liDispAmt',
        title: 'LI Disp'
      },
      {
        id: 'reconDispAmt',
        title: 'Recon'
      },
      {
        id: 'qaAlloc',
        title: 'QA Alloc'
      },
      {
        id: 'cnAlloc',
        title: 'CN Alloc'
      },
      {
        id: 'balance',
        title: 'Balance'
      },
      {
        id: 'priorPaid',
        title: 'Total Paid'
      },
      {
        id: 'invPaySat',
        title: 'Inv Pymt Sat'
      },
      {
        id: 'paySat',
        title: 'Pymt Sat'
      },
      {
        id: 'orDispPerc',
        title: 'OR Disp %'
      },
      {
        id: 'liDispPerc',
        title: 'LI Disp %'
      },
      {
        id: 'status',
        title: 'Status'
      }
    ]
  }
});

var page = Component.extend({
  tag: 'page-claimreview',
  template: template,
  scope: {
    allClaimLicensorMap: [],
	  tokenInput: [],
    refreshTokenInput: function(val, type){
      //console.log("val is "+JSON.stringify(val));
      var self = this;
      //var prev = self.attr('refreshCount');

        if(type=="Add")
          self.attr('tokenInput').push(val);
        else if(type=="Delete"){
          //console.log(JSON.stringify(self.tokenInput.attr()));
          var flag=true;
          this.attr('tokenInput').each(function(value, key) {

            //console.log(key+" "+val.id+" "+value.id);
            if(val.id == value.id){
                self.attr('tokenInput').splice(key,1);
              //console.log("updated " +JSON.stringify(self.tokenInput.attr()));
            }

          });

        }
        //console.log(type+"&&"+JSON.stringify(this.attr('tokenInput')));
     }
  },
  init: function(){
	 //console.log('inside Claim Review');
	 
    },
    events: {
    	"inserted": function(){
    		var self = this;
        $("#tokenSearch").tokenInput([
            {id: 1, name: "Search"} //This is needed
          ],
          {
              theme: "facebook",
              preventDuplicates: true,
              onResult: function (item) {
                //alert(item);
                  if($.isEmptyObject(item)){
                        return [{id:$("#token-input-tokenSearch").val(),name: $("#token-input-tokenSearch").val()}];
                  }else{
                        return item;
                  }
              },
              onAdd: function (item) {
                //alert(JSON.stringify(item));
                  //doSearch(item,"add");
                  //self.scope.tokenInputData.replace(item);
                  self.scope.refreshTokenInput(item,"Add");
                  //var $subComp = $('data-grid', self.element);
                  //$subComp.scope().refreshTokenInput(item,"Add");

              },
              onDelete: function (item) {
                  //doSearch(item,"delete");
                   //self.scope.tokenInputData.replace(item);
                   self.scope.refreshTokenInput(item,"Delete");
                  //var $subComp = $('data-grid', self.element);
                  //$subComp.scope().refreshTokenInput(item,"Delete");
              }
        });

        Promise.all([
            claimLicensorInvoices.findAll()
        ]).then(function(values) {
          //console.log(JSON.stringify(values[0].attr()));
          self.scope.allClaimLicensorMap.replace(values[0]);
        });
        
    	},
    	"#highChart click":function(){
    		console.log("Click on high chart");
        var details = new can.List({"country":"AUT","society":"CELAS"});
        $("#highChartDetails").append(stache('<high-chart details={details}></high-chart>')({details}));
    		
    	},
      "#highChartDetails mousedown": function(item, el, ev){
        if(el.toElement.id == 'close'){
          $("#highChartDetails").addClass("hide")
        }else{
             $(item[0]).addClass("draggable").parents().on('mousemove', function(e) {
              $('.draggable').offset({
                  top: e.pageY - $('.draggable').outerHeight() / 2,
                  left: e.pageX - $('.draggable').outerWidth() / 2
              }).on('mouseup', function() {
                  $(this).removeClass('draggable');
              });
          });
        }
        e.preventDefault();
      },
      "#highChartDetails mouseup": function(item, el, ev){
        $(item[0]).removeClass("draggable")
      },
      "#claimLicencorGrid table>tbody>tr click":function(item, el, ev){
          $(item[0]).toggleClass("selected");
          //$(".clicked td:first-child").css("color","blue");

      },
      "{tokenInput} change": function(){
        var self = this;
          console.log(JSON.stringify(self.scope.tokenInput.attr()));
          console.log("appState set to "+JSON.stringify(self.scope.appstate.attr()));

          var claimLicSearchRequest = {};
          claimLicSearchRequest.searchRequest = {};
          claimLicSearchRequest.searchRequest["serviceTypeId"] = this.scope.appstate.attr('storeType');
          claimLicSearchRequest.searchRequest["regionId"] = this.scope.appstate.attr('region');
          claimLicSearchRequest.searchRequest["entityId"] = this.scope.appstate.attr('licensor');

          claimLicSearchRequest.searchRequest["periodType"] = "P";
          claimLicSearchRequest.searchRequest["periodFrom"] = "201304";
          claimLicSearchRequest.searchRequest["periodTo"] = "201307";

          claimLicSearchRequest.searchRequest["status"] = "";
          claimLicSearchRequest.searchRequest["offset"] = "0";
          claimLicSearchRequest.searchRequest["limit"] = "10";
          claimLicSearchRequest.searchRequest["filter"] = self.scope.tokenInput.attr();

          claimLicSearchRequest.searchRequest["sortBy"] = "invoiceNumber";
          claimLicSearchRequest.searchRequest["sortOrder"] = "ASC";

          claimLicensorInvoices.findAll(UserReq.formRequestDetails(claimLicSearchRequest),function(values){
              //console.log("data is "+JSON.stringify(values[0].attr()));
              self.scope.allClaimLicensorMap.replace(values[0]);
          },function(xhr){
            console.error("Error while loading: "+xhr);
          });
      },
      "#currencyType change": function(){
        var self=this;
        console.log("value changed");
        var invoiceData = self.scope.attr().allClaimLicensorMap[0].claimLicensor;
        var currencyType = $("#currencyType").val();

        var  gridData = generateTableData(invoiceData,currencyType);
        //console.log("grid data for "+currencyType+" currency is "+JSON.stringify(gridData));
        var rows = new can.List(gridData.data);
        $('#claimLicencorGrid').html(stache('<rn-claim-licensor-grid rows="{rows}"></rn-claim-licensor-grid>')({rows}));

      },
      "{allClaimLicensorMap} change": function() {
        var self = this;
        var invoiceData = self.scope.attr().allClaimLicensorMap[0].claimLicensor;
        var currencyType = $("#currencyType").val();

        var  gridData = generateTableData(invoiceData,currencyType);
        //console.log("grid data for "+currencyType+" currency is "+JSON.stringify(gridData));
        var rows = new can.List(gridData.data);
        $('#claimLicencorGrid').html(stache('<rn-claim-licensor-grid rows="{rows}"></rn-claim-licensor-grid>')({rows}));
      }
    }
});

var generateTableData = function(invoiceData,currencyType){
  var gridData = {"data":[]};

        for(var i=0;i<invoiceData.length;i++){
            var invTemp = {};
            invTemp["entityId"] = invoiceData[i]["entityId"];
            invTemp["__isChild"] = false;
            invTemp["entity"] = invoiceData[i]["entityName"];
            invTemp["invoiceNum"] = invoiceData[i]["invoiceNumber"];
            if(currencyType=="invoice")
              invTemp["currency"] = invoiceData[i]["paymentCurrency"];
            else if(currencyType=="accural"){
              invTemp["currency"] = invoiceData[i]["accuralCurrency"];
              invTemp["fxRate"] = invoiceData[i]["fxRate"];
            }
            
            invTemp["period"] = "";
            invTemp["country"] = "";
            invTemp["contentType"] = "";
            invTemp["invoiceAmt"] = 0;
            invTemp["orDispAmt"] = 0;
            invTemp["liDispAmt"] = 0;
            invTemp["reconDispAmt"] = 0;
            invTemp["qaAlloc"] = 0;
            invTemp["cnAlloc"] = 0;
            invTemp["balance"] = 0;
            invTemp["priorPaid"] = 0;
            invTemp["invPaySat"] = 0;
            invTemp["paySat"] = 0;
            invTemp["orDispPerc"] = 0;
            invTemp["liDispPerc"] = 0;
            invTemp["status"] = "";
            gridData.data.push(invTemp);
            var insertedId = gridData.data.length-1;

            var invoiceLineItems = invoiceData[i]["claimLicensorLines"];
            var contentTypeArr = [], countryArr = [];
            if(invoiceLineItems.length > 0){
              for(var j=0;j<invoiceLineItems.length;j++){
                var invLITemp={};

                invLITemp["entityId"] = "";
                invLITemp["__isChild"] = true;
                invLITemp["entity"] = "";
                invLITemp["invoiceNum"] = "";
                invLITemp["currency"] = invTemp["currency"];

                invLITemp["period"] = invoiceLineItems[j]["fiscalPeriod"];
                invLITemp["country"] = invoiceLineItems[j]["countryId"];
                invLITemp["contentType"] = invoiceLineItems[j]["contentType"];
                
                if(currencyType=="invoice"){
                  invLITemp["invoiceAmt"] = invoiceLineItems[j]["invoiceAmount"];
                  invTemp["invoiceAmt"] += parseInt(invoiceLineItems[j]["invoiceAmount"]);
                }
                else if(currencyType=="accural"){
                  invLITemp["invoiceAmt"] = (parseInt(invoiceLineItems[j]["invoiceAmount"])*parseFloat(invTemp["fxRate"]));
                  invTemp["invoiceAmt"] += (parseInt(invoiceLineItems[j]["invoiceAmount"])*parseFloat(invTemp["fxRate"]));
                }


                
                if(currencyType=="invoice"){
                  invLITemp["orDispAmt"] = invoiceLineItems[j]["overRepDisputeAmount"];
                  invTemp["orDispAmt"] += parseInt(invoiceLineItems[j]["overRepDisputeAmount"]);
                }
                else if(currencyType=="accural"){
                  invLITemp["orDispAmt"] = (parseInt(invoiceLineItems[j]["overRepDisputeAmount"])*parseFloat(invTemp["fxRate"]));
                  invTemp["orDispAmt"] += (parseInt(invoiceLineItems[j]["overRepDisputeAmount"])*parseFloat(invTemp["fxRate"]));
                }
                
                
                if(currencyType=="invoice"){
                  invLITemp["liDispAmt"] = invoiceLineItems[j]["lineItemDisputeAmount"];
                  invTemp["liDispAmt"] += parseInt(invoiceLineItems[j]["lineItemDisputeAmount"]); 
                }
                else if(currencyType=="accural"){
                  invLITemp["liDispAmt"] = (parseInt(invoiceLineItems[j]["lineItemDisputeAmount"])*parseFloat(invTemp["fxRate"]));
                  invTemp["liDispAmt"] += (parseInt(invoiceLineItems[j]["lineItemDisputeAmount"])*parseFloat(invTemp["fxRate"]));              
                }
                
                
                if(currencyType=="invoice"){
                  invLITemp["reconDispAmt"] = invoiceLineItems[j]["reconAmount"];
                  invTemp["reconDispAmt"] += parseInt(invoiceLineItems[j]["reconAmount"]);
                }
                else if(currencyType=="accural"){
                  invLITemp["reconDispAmt"] = (parseInt(invoiceLineItems[j]["reconAmount"])*parseFloat(invTemp["fxRate"]));
                  invTemp["reconDispAmt"] += (parseInt(invoiceLineItems[j]["reconAmount"])*parseFloat(invTemp["fxRate"]));
                }
                
                
                if(currencyType=="invoice"){
                  invLITemp["qaAlloc"] = invoiceLineItems[j]["onAccountAllocated"];
                  invTemp["qaAlloc"] += parseInt(invoiceLineItems[j]["onAccountAllocated"]);
                }
                else if(currencyType=="accural"){
                  invLITemp["qaAlloc"] = (parseInt(invoiceLineItems[j]["onAccountAllocated"])*parseFloat(invTemp["fxRate"]));
                  invTemp["qaAlloc"] += (parseInt(invoiceLineItems[j]["onAccountAllocated"])*parseFloat(invTemp["fxRate"]));
                }
                
                
                if(currencyType=="invoice"){
                  invLITemp["cnAlloc"] = invoiceLineItems[j]["cashAdjustmentAllocated"];
                  invTemp["cnAlloc"] += parseInt(invoiceLineItems[j]["cashAdjustmentAllocated"]);
                }
                else if(currencyType=="accural"){
                  invLITemp["cnAlloc"] = (parseInt(invoiceLineItems[j]["cashAdjustmentAllocated"])*parseFloat(invTemp["fxRate"]));
                  invTemp["cnAlloc"] += (parseInt(invoiceLineItems[j]["cashAdjustmentAllocated"])*parseFloat(invTemp["fxRate"]));
                }
                
                
                if(currencyType=="invoice"){
                  invLITemp["balance"] = invoiceLineItems[j]["balance"];
                  invTemp["balance"] += parseInt(invoiceLineItems[j]["balance"]);
                }
                else if(currencyType=="accural"){
                  invLITemp["balance"] = (parseInt(invoiceLineItems[j]["balance"])*parseFloat(invTemp["fxRate"]));
                  invTemp["balance"] += (parseInt(invoiceLineItems[j]["balance"])*parseFloat(invTemp["fxRate"]));
                }
                
                
                if(currencyType=="invoice"){
                  invLITemp["priorPaid"] = invoiceLineItems[j]["priorPaid"];
                  invTemp["priorPaid"] += parseInt(invoiceLineItems[j]["priorPaid"]);
                }
                else if(currencyType=="accural"){
                  invLITemp["priorPaid"] = (parseInt(invoiceLineItems[j]["priorPaid"])*parseFloat(invTemp["fxRate"]));
                  invTemp["priorPaid"] += (parseInt(invoiceLineItems[j]["priorPaid"])*parseFloat(invTemp["fxRate"]));
                }
                
                invLITemp["invPaySat"] = invoiceLineItems[j]["invPaymentSat"];
                invTemp["invPaySat"] = (invTemp["invPaySat"]+parseInt(invoiceLineItems[j]["invPaymentSat"]));
                
                invLITemp["paySat"] = invoiceLineItems[j]["paymentSat"];
                invTemp["paySat"] = (invTemp["paySat"]+parseInt(invoiceLineItems[j]["paymentSat"]));
                
                invLITemp["orDispPerc"] = invoiceLineItems[j]["overRepDispPercent"];
                invTemp["orDispPerc"] = (invTemp["orDispPerc"]+parseInt(invoiceLineItems[j]["overRepDispPercent"]));
                
                invLITemp["liDispPerc"] = invoiceLineItems[j]["liDispPercent"];
                invTemp["liDispPerc"] = (invTemp["liDispPerc"]+parseInt(invoiceLineItems[j]["liDispPercent"]));
                
                invLITemp["status"] = invoiceLineItems[j]["status"];
                contentTypeArr.push(invLITemp["contentType"]);
                countryArr.push(invLITemp["country"]);
                gridData.data.push(invLITemp);
              }

            }

            /*Below function is to remove the duplicate content type and find the count */
            contentTypeArr = contentTypeArr.filter( function( item, index, inputArray ) {
                   return inputArray.indexOf(item) == index;
            });
            if(contentTypeArr.length>1){
              gridData.data[insertedId]["contentType"] = contentTypeArr.length+" types of Content";
            }
            else if(contentTypeArr.length==1)
              gridData.data[insertedId]["contentType"] = contentTypeArr[0];

            /*Below function is to remove the duplicate country and find the count */
            countryArr = countryArr.filter( function( item, index, inputArray ) {
              return inputArray.indexOf(item) == index;
            });
            if(countryArr.length>1){
              gridData.data[insertedId]["country"] = countryArr.length+ " Countries";
            }
            else if(countryArr.length==1)
              gridData.data[insertedId]["country"] = countryArr[0];


          }
          return gridData;
}
export default page;
