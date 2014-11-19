import Component from 'can/component/';
import stache from 'can/view/stache/';

import template from './template.stache!';
import styles from './page-claimreview.less!';

import Grid from 'components/grid/';
import stache from 'can/view/stache/';

import UserReq from 'models/rinsCommon/request/';
import claimLicensorInvoices from 'models/claim/licensor/';
import claimCountryInvoices from 'models/claim/country/';

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
        sortable: true,
        contents: function(row) { return stache('{{#unless isChild}}<span class="open-toggle"></span>{{/unless}} {{entity}}')({entity: row.entity, isChild: row.__isChild}); }
      },
      {
        id: 'invoiceNum',
        title: 'Invoice #',
        sortable: true
      },
      {
        id: 'currency',
        title: 'CCY',
        sortable: true
      },
      {
        id: 'period',
        title: 'Period',
        sortable: true
      },
      {
        id: 'country',
        title: 'Country',
        sortable: true
      },
      {
        id: 'contentType',
        title: 'Con Type',
        sortable: true
      },
      {
        id: 'invoiceAmt',
        title: 'Inv Amt',
        sortable: true
      },
      {
        id: 'orDispAmt',
        title: 'Over Rep',
        sortable: true
      },
      {
        id: 'liDispAmt',
        title: 'LI Disp',
        sortable: true
      },
      {
        id: 'reconDispAmt',
        title: 'Recon',
        sortable: true
      },
      {
        id: 'qaAlloc',
        title: 'QA Alloc',
        sortable: true
      },
      {
        id: 'cnAlloc',
        title: 'CN Alloc',
        sortable: true
      },
      {
        id: 'balance',
        title: 'Balance',
        sortable: true
      },
      {
        id: 'priorPaid',
        title: 'Total Paid',
        sortable: true
      },
      {
        id: 'invPaySat',
        title: 'Inv Pymt Sat',
        sortable: true
      },
      {
        id: 'paySat',
        title: 'Pymt Sat',
        sortable: true
      },
      {
        id: 'orDispPerc',
        title: 'OR Disp %',
        sortable: true
      },
      {
        id: 'liDispPerc',
        title: 'LI Disp %',
        sortable: true
      },
      {
        id: 'status',
        title: 'Status',
        sortable: true
      }
    ]
  }
});

Grid.extend({
  tag: "rn-claim-country-grid",
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
        id: 'country',
        title: 'Country',
        sortable: true,
        contents: function(row) { return stache('{{#unless isChild}}<span class="open-toggle"></span>{{/unless}} {{entity}}')({entity: row.country, isChild: row.__isChild}); }
      },
      {
        id: 'invoiceNum',
        title: 'Invoice #',
        sortable: true
      },
      {
        id: 'currency',
        title: 'CCY',
        sortable: true
      },
      {
        id: 'period',
        title: 'Period',
        sortable: true
      },
      {
        id: 'entity',
        title: 'Entity',
        sortable: true,
      },
      {
        id: 'contentType',
        title: 'Con Type',
        sortable: true
      },
      {
        id: 'invoiceAmt',
        title: 'Inv Amt',
        sortable: true
      },
      {
        id: 'orDispAmt',
        title: 'Over Rep',
        sortable: true
      },
      {
        id: 'liDispAmt',
        title: 'LI Disp',
        sortable: true
      },
      {
        id: 'reconDispAmt',
        title: 'Recon',
        sortable: true
      },
      {
        id: 'qaAlloc',
        title: 'QA Alloc',
        sortable: true
      },
      {
        id: 'cnAlloc',
        title: 'CN Alloc',
        sortable: true
      },
      {
        id: 'balance',
        title: 'Balance',
        sortable: true
      },
      {
        id: 'priorPaid',
        title: 'Total Paid',
        sortable: true
      },
      {
        id: 'invPaySat',
        title: 'Inv Pymt Sat',
        sortable: true
      },
      {
        id: 'paySat',
        title: 'Pymt Sat',
        sortable: true
      },
      {
        id: 'orDispPerc',
        title: 'OR Disp %',
        sortable: true
      },
      {
        id: 'liDispPerc',
        title: 'LI Disp %',
        sortable: true
      },
      {
        id: 'status',
        title: 'Status',
        sortable: true
      }
    ]
  }
});

var page = Component.extend({
  tag: 'page-claimreview',
  template: template,
  scope: {
    localGlobalSearch:undefined,
    allClaimLicensorMap: [],
    allClaimCountryMap: [],
    sortColumns:[],
    details:{},
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
            claimLicensorInvoices.findAll(),
            claimCountryInvoices.findAll()
        ]).then(function(values) {
          //console.log(JSON.stringify(values[0].attr()));
          //console.log("Country values are "+JSON.stringify(values[1].attr()));
          self.scope.allClaimLicensorMap.replace(values[0]);
          self.scope.allClaimCountryMap.replace(values[1]);
        });
        
    	},
    	"#highChart click":function(){
        if(this.scope.details.isChild){
          var data = this.scope.details;
             $("#highChartDetails").append(stache('<high-chart details={data}></high-chart>')({data}));
        }else{
          console.log('Data not set so not showing the chart');
        }
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
          var row = item.closest('tr').data('row').row;
          var className = item.closest('tr').hasClass("child");
           console.log("row "+JSON.stringify(row.attr()));
           this.scope.details["countryId"]=row.country;
           this.scope.details["requestFrom"]="Licensor";
           this.scope.details["licensorId"]=row.entityId.split(",")[1];
           this.scope.details["fiscalPeriod"]=row.period;
           this.scope.details["periodType"]="P";
           this.scope.details["contentType"]=row.contentType;
           this.scope.details["isChild"]=className;
      },
      "#claimLicencorGrid .rn-grid>thead>tr>th click": function(item, el, ev){
          /*var self=this;
           //console.log($(item[0]).attr("class"));
          var val = $(item[0]).attr("class");
           self.scope.attr('sortColumns').push(val);
        */
           /* The below code calls {scope.appstate} change event that gets the new data for grid*/
           /* All the neccessary parameters will be set in that event */
          /* if(self.scope.appstate.attr('globalSearch')){
              self.scope.appstate.attr('globalSearch', false);
            }else{
              self.scope.appstate.attr('globalSearch', true);
            }   
          */

      },
      "{tokenInput} change": function(){
        var self = this;
          console.log(JSON.stringify(self.scope.tokenInput.attr()));
          console.log("appState set to "+JSON.stringify(self.scope.appstate.attr()));

          /* The below code calls {scope.appstate} change event that gets the new data for grid*/
          /* All the neccessary parameters will be set in that event */
         if(self.scope.appstate.attr('globalSearch')){
            self.scope.appstate.attr('globalSearch', false);
          }else{
            self.scope.appstate.attr('globalSearch', true);
          }
      },
      "#currencyType change": function(){
        var self=this;
        console.log("value changed");
        var invoiceData = self.scope.attr().allClaimLicensorMap[0].claimReviewLicensor;
        var currencyType = $("#currencyType").val();

        if(invoiceData!=null){
          var  gridData = generateTableData(invoiceData,currencyType);
          //console.log("grid data for "+currencyType+" currency is "+JSON.stringify(gridData));
          var rows = new can.List(gridData.data);
          $('#claimLicencorGrid').html(stache('<rn-claim-licensor-grid rows="{rows}"></rn-claim-licensor-grid>')({rows}));
        } else {
          $('#claimLicencorGrid').html(stache('<rn-claim-licensor-grid emptyrows="{emptyrows}"></rn-claim-licensor-grid>')({emptyrows:true}));
        }
      },
      "{allClaimLicensorMap} change": function() {
        var self = this;
        var invoiceData = self.scope.attr().allClaimLicensorMap[0].claimReviewLicensor;
        var currencyType = $("#currencyType").val();
        //console.log("invoice data is sss  "+JSON.stringify(invoiceData));
        if(invoiceData!=null){
          var  gridData = generateTableData(invoiceData,currencyType);
          //console.log("grid data for "+currencyType+" currency is "+JSON.stringify(gridData));
          var rows = new can.List(gridData.data);
          $('#claimLicencorGrid').html(stache('<rn-claim-licensor-grid rows="{rows}"></rn-claim-licensor-grid>')({rows}));
        } else {
          $('#claimLicencorGrid').html(stache('<rn-claim-licensor-grid emptyrows="{emptyrows}"></rn-claim-licensor-grid>')({emptyrows:true}));
        }
      },
      "{allClaimCountryMap} change": function() {
        var self = this;
        var invoiceData = self.scope.attr().allClaimCountryMap[0].claimReviewLicensor;
        var currencyType = $("#currencyType").val();
        //console.log("invoice data is sss  "+JSON.stringify(invoiceData));
        if(invoiceData!=null){
          var  gridData = generateTableData(invoiceData,currencyType);
          //console.log("grid data for "+currencyType+" currency is "+JSON.stringify(gridData));
          var rows = new can.List(gridData.data);
          $('#claimCountryGrid').html(stache('<rn-claim-country-grid rows="{rows}"></rn-claim-country-grid>')({rows}));
        } else {
          $('#claimCountryGrid').html(stache('<rn-claim-country-grid emptyrows="{emptyrows}"></rn-claim-country-grid>')({emptyrows:true}));
        }
      },
      '{scope.appstate} change': function() {
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

var generateTableData = function(invoiceData,currencyType){
  //console.log("invoiceData is "+JSON.stringify(invoiceData));
  var gridData = {"data":[]};
        
        for(var i=0;i<invoiceData.length;i++){
            var invTemp = {};
            invTemp["entityId"] = invoiceData[i]["entityId"];
            invTemp["__isChild"] = false;
            invTemp["entity"] = invoiceData[i]["entityName"];
            invTemp["invoiceNum"] = invoiceData[i]["invoiceNumber"];
            invTemp["currency"] = invoiceData[i]["currency"];
            
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
            

            var invoiceLineItems = invoiceData[i]["claimReviewLicDetails"];
            var contentTypeArr = [], countryArr = [];
            if(invoiceLineItems.length > 0){
              for(var j=0;j<invoiceLineItems.length;j++){
                var invLITemp={};

                invLITemp["entityId"] = invTemp["entityId"]+","+  invTemp["entity"] ;
                invLITemp["__isChild"] = true;
                invLITemp["entity"] = "";
                invLITemp["invoiceNum"] = "";
                invLITemp["currency"] = invTemp["currency"];

                invLITemp["period"] = invoiceLineItems[j]["period"];
                invLITemp["country"] = invoiceLineItems[j]["country_id"];
                invLITemp["contentType"] = invoiceLineItems[j]["contentTypeName"];

                  invLITemp["invoiceAmt"] = invoiceLineItems[j]["invoiceLineItemAmount"];
                  invTemp["invoiceAmt"] += parseInt(invoiceLineItems[j]["invoiceLineItemAmount"]);

                  invLITemp["orDispAmt"] = invoiceLineItems[j]["overrepAmount"];
                  invTemp["orDispAmt"] += parseInt(invoiceLineItems[j]["overrepAmount"]);
                
                  invLITemp["liDispAmt"] = invoiceLineItems[j]["liDispAmount"];
                  invTemp["liDispAmt"] += parseInt(invoiceLineItems[j]["liDispAmount"]); 
                
                  invLITemp["reconDispAmt"] = invoiceLineItems[j]["reconAmount"];
                  invTemp["reconDispAmt"] += parseInt(invoiceLineItems[j]["reconAmount"]);

                  invLITemp["qaAlloc"] = invoiceLineItems[j]["oaAllocated"];
                  invTemp["qaAlloc"] += parseInt(invoiceLineItems[j]["oaAllocated"]);

                  invLITemp["cnAlloc"] = invoiceLineItems[j]["caAllocated"];
                  invTemp["cnAlloc"] += parseInt(invoiceLineItems[j]["caAllocated"]);
                
                  invLITemp["balance"] = invoiceLineItems[j]["balance"];
                  invTemp["balance"] += parseInt(invoiceLineItems[j]["balance"]);
                
                  invLITemp["priorPaid"] = invoiceLineItems[j]["priorPaid"];
                  invTemp["priorPaid"] += parseInt(invoiceLineItems[j]["priorPaid"]);
                
                invLITemp["invPaySat"] = invoiceLineItems[j]["invPmtSaturation"];
                invTemp["invPaySat"] = (invTemp["invPaySat"]+parseInt(invoiceLineItems[j]["invPmtSaturation"]));
                
                invLITemp["paySat"] = invoiceLineItems[j]["pmtSaturation"];
                invTemp["paySat"] = (invTemp["paySat"]+parseInt(invoiceLineItems[j]["pmtSaturation"]));
                
                invLITemp["orDispPerc"] = invoiceLineItems[j]["overrepDispPer"];
                invTemp["orDispPerc"] = (invTemp["orDispPerc"]+parseInt(invoiceLineItems[j]["overrepDispPer"]));
                
                invLITemp["liDispPerc"] = invoiceLineItems[j]["liDispPer"];
                invTemp["liDispPerc"] = (invTemp["liDispPerc"]+parseInt(invoiceLineItems[j]["liDispPer"]));
                
                invLITemp["status"] = invoiceLineItems[j]["status"];
                contentTypeArr.push(invLITemp["contentType"]);
                countryArr.push(invLITemp["country"]);
                gridData.data.push(invLITemp);
              }

            }

            //console.log("gridData is ffsdfs "+JSON.stringify(gridData));
            //console.log("countryArr is ffsdfs "+JSON.stringify(countryArr));
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
          console.log("gridData is "+JSON.stringify(gridData));
          
          return gridData;
}
export default page;
