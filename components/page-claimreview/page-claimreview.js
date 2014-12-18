import Component from 'can/component/';
import stache from 'can/view/stache/';

import template from './template.stache!';
import styles from './page-claimreview.less!';

import Grid from 'components/grid/';
import gridtemplate from './gridtemplate.stache!';
import stache from 'can/view/stache/';

import UserReq from 'utils/request/';
import claimLicensorInvoices from 'models/claim/licensor/';
import claimCountryInvoices from 'models/claim/country/';

import tokeninput from 'tokeninput';
import css_tokeninput from 'tokeninput.css!';
import css_tokeninput_theme from 'tokeninput_theme.css!';

import highchartpage from 'components/highchart/';

/* Extend grid with the columns */
Grid.extend({
  tag: "rn-claim-licensor-grid",
  template: gridtemplate,
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
        title: '<span class="open-toggle-all"></span> Licensor',
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
        title: 'Currency',
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
        title: 'Content Type',
        sortable: true
      },
      {
        id: 'invoiceAmt',
        title: 'Invoice',
        sortable: true
      },
      {
        id: 'orDispAmt',
        title: 'OverRep',
        sortable: true
      },
      {
        id: 'liDispAmt',
        title: 'Line Item',
        sortable: true
      },
      {
        id: 'reconDispAmt',
        title: 'Recon',
        sortable: true
      },
      {
        id: 'qaAlloc',
        title: 'OA Allocated',
        sortable: true
      },
      {
        id: 'cnAlloc',
        title: 'CA Allocated',
        sortable: true
      },
      {
        id: 'priorPaid',
        title: 'Prior Paid',
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
        id: 'balance',
        title: 'Balance',
        sortable: true
      },
      {
        id: 'orDispPerc',
        title: 'OR Dispute %',
        sortable: true
      },
      {
        id: 'liDispPerc',
        title: 'LI Dispute %',
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
  template: gridtemplate,
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
        title: '<span class="open-toggle-all"></span> Country',
        sortable: true,
        contents: function(row) { return stache('{{#unless isChild}}<span class="open-toggle"></span>{{/unless}} {{entity}}')({entity: row.country, isChild: row.__isChild}); }
      },
      {
        id: 'period',
        title: 'Period',
        sortable: true
      },
      {
        id: 'entity',
        title: 'Licensor',
        sortable: true,
      },
      {
        id: 'currency',
        title: 'CCY',
        sortable: true
      },
      {
        id: 'contentType',
        title: 'Content Type',
        sortable: true
      },
      {
        id: 'invoiceAmt',
        title: 'Invoice',
        sortable: true
      },
      {
        id: 'orDispAmt',
        title: 'OverRep',
        sortable: true
      },
      {
        id: 'liDispAmt',
        title: 'Line Item',
        sortable: true
      },
      {
        id: 'reconDispAmt',
        title: 'Recon',
        sortable: true
      },
      {
        id: 'qaAlloc',
        title: 'OA Allocated',
        sortable: true
      },
      {
        id: 'cnAlloc',
        title: 'CA Allocated',
        sortable: true
      },
      {
        id: 'priorPaid',
        title: 'Total Paid',
        sortable: true
      },
      {
        id: 'invPaySat',
        title: 'Inv Sat',
        sortable: true
      },
      {
        id: 'paySat',
        title: 'Pymt Sat',
        sortable: true
      },
      {
        id: 'balance',
        title: 'Balance',
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
      }
    ]
  }
});

var page = Component.extend({
  tag: 'page-claimreview',
  template: template,
  scope: {
    localGlobalSearch:undefined,
    allowSearch: false,
    allClaimLicensorMap: [],
    allClaimCountryMap: [],
    sortColumns:[],
    sortDirection: "asc",
    details:{},
    view:"licensor",
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
   this.scope.appstate.attr("renderGlobalSearch",true);
	 
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
                  self.scope.refreshTokenInput(item,"Add");

              },
              onDelete: function (item) {
                   self.scope.refreshTokenInput(item,"Delete");
              }
        });

        $('#claimLicencorGrid').html(stache('<rn-claim-licensor-grid emptyrows="{emptyrows}"></rn-claim-licensor-grid>')({emptyrows:true}));
        
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
      "#licView click": function(el, ev){
        var self = this;
          //$("#aggregate").css("display","none");
          $("#aggregate").addClass("hide");
          self.scope.attr('view',"licensor");
          //$("li#aggregate").addClass("hide");

          ev.preventDefault();
      },
      "#couView click": function(el, ev){
          var self = this;

          $("#aggregate").removeClass("hide");
          self.scope.attr('view',"country");
          ev.preventDefault();
          console.log("fdfsdfsdf "+self.scope.attr("allClaimCountryMap").length);
          var invoiceData = self.scope.attr("allClaimCountryMap").length;
          if(invoiceData == 0)
            $('#claimCountryGrid').html(stache('<rn-claim-country-grid emptyrows="{emptyrows}"></rn-claim-country-grid>')({emptyrows:true}));
      },
      '#chkAggregate change': function(item, el, ev) {
        var self = this;    
        //console.log("here");
        if($("#chkAggregate").is(":checked")){
            self.scope.attr("view","country-aggregate");

        } else {
            self.scope.attr('view',"country");
        }
        /* The below code calls {scope.appstate} change event that gets the new data for grid*/
        /* All the neccessary parameters will be set in that event */
       if(self.scope.appstate.attr('globalSearch')){
          self.scope.appstate.attr('globalSearch', false);
        }else{
          self.scope.appstate.attr('globalSearch', true);
        }
        //console.log("Checked rows: "+JSON.stringify(self.scope.attr('checkedRows')));
      },
      ".claimReview table>tbody>tr click":function(item, el, ev){

          var alreadySelRow = item.closest("tbody").find("tr.selected");
          alreadySelRow.toggleClass("selected");
          //alreadySelRow.attr('__isSelected', false);

          $(item[0]).toggleClass("selected");
          var row = item.closest('tr').data('row').row;
          //row.attr('__isSelected', true)
          var className = item.closest('tr').hasClass("child");
           //console.log("row "+JSON.stringify(row.attr()));
           this.scope.details["countryId"]=row.country;
           this.scope.details["requestFrom"]="Licensor";
           this.scope.details["licensorId"]=row.entityId.split(",")[1];
           this.scope.details["fiscalPeriod"]=row.period;
           this.scope.details["periodType"]="P";
           this.scope.details["contentType"]=row.contentType;
           this.scope.details["isChild"]=className;
      },
      "#claimLicencorGrid .rn-grid>thead>tr>th click": function(item, el, ev){
          var self=this;
           //console.log($(item[0]).attr("class"));
          var val = $(item[0]).attr("class").split(" ");
          var existingSortColumns =self.scope.sortColumns.attr();
          var existingSortColumnsLen = existingSortColumns.length;
          var existFlag = false;
          if(existingSortColumnsLen==0){
            self.scope.attr('sortColumns').push(val[0]);
          } else {
            for(var i=0;i<existingSortColumnsLen;i++){
              /* The below condition is to selected column to be sorted in asc & dec way */ 
              console.log(val[0]+","+existingSortColumns[i] )
              if(existingSortColumns[i] == val[0]){
                existFlag = true;
              } 
            } 
            if(existFlag==false)
              self.scope.attr('sortColumns').push(val[0]);
            else {
              var sortDirection = (self.scope.attr('sortDirection') == 'asc') ? 'desc' : 'asc';
              self.scope.attr('sortDirection', sortDirection);
            }
              
          }
           
          console.log("aaa "+self.scope.sortColumns.attr());
           /* The below code calls {scope.appstate} change event that gets the new data for grid*/
           /* All the neccessary parameters will be set in that event */
           if(self.scope.appstate.attr('globalSearch')){
              self.scope.appstate.attr('globalSearch', false);
            }else{
              self.scope.appstate.attr('globalSearch', true);
            }   
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
        var invoiceData = self.scope.attr().allClaimLicensorMap[0].reviews;
        var footerData = self.scope.attr().allClaimLicensorMap[0].footer;
        //var currencyType = $("#currencyType").val();
        //console.log("invoice data is sss  "+JSON.stringify(invoiceData));
        if(invoiceData!="null" && invoiceData.length!=0){
          var  gridData = generateTableData(invoiceData,footerData);
          //console.log("grid data for "+currencyType+" currency is "+JSON.stringify(gridData));
          var rows = new can.List(gridData.data);
          var footerrows = new can.List(gridData.footer);
          var sortedColumns = self.scope.sortColumns.attr();
          var sortDir = self.scope.attr('sortDirection');

          $("#loading_img").hide();
          $('#claimLicencorGrid').html(stache('<rn-claim-licensor-grid rows="{rows}" footerrows="{footerrows}" sortcolumnnames="{sortcolumnnames}" sortdir="{sortdir}" emptyrows="{emptyrows}"></rn-claim-licensor-grid>')({rows, footerrows, sortcolumnnames:sortedColumns, sortdir:sortDir, emptyrows:false}));
        } else {
          $("#loading_img").hide();
          $('#claimLicencorGrid').html(stache('<rn-claim-licensor-grid emptyrows="{emptyrows}"></rn-claim-licensor-grid>')({emptyrows:true}));
        }
      },
      "{allClaimCountryMap} change": function() {
        var self = this;
        //var invoiceData = self.scope.attr().allClaimCountryMap[0].claimReviewLicensor;
        var invoiceData = self.scope.attr().allClaimCountryMap[0].reviews;
        var footerData = self.scope.attr().allClaimCountryMap[0].footer;
        var sortedColumns = self.scope.sortColumns.attr();
        var sortDir = self.scope.attr('sortDirection');
        //var currencyType = $("#currencyType").val();
        //console.log("invoice data is sss  "+JSON.stringify(invoiceData));
        if(invoiceData!=null && invoiceData.length!=0){
          var  gridData = generateTableData(invoiceData,footerData);
          //console.log("grid data for "+currencyType+" currency is "+JSON.stringify(gridData));
          var rows = new can.List(gridData.data); 
          var footerrows = new can.List(gridData.footer);
          
          $("#loading_img").hide();
          $('#claimCountryGrid').html(stache('<rn-claim-country-grid rows="{rows}" footerrows="{footerrows}" sortcolumnnames="{sortcolumnnames}" sortdir="{sortdir}" emptyrows="{emptyrows}"></rn-claim-country-grid>')({rows, footerrows, sortcolumnnames:sortedColumns, sortdir:sortDir, emptyrows:false}));
        } else {
          $("#loading_img").hide();
          $('#claimCountryGrid').html(stache('<rn-claim-country-grid emptyrows="{emptyrows}"></rn-claim-country-grid>')({emptyrows:true}));
        }
        if(self.scope.attr("view") == "country-aggregate"){
          $(".period").hide();
          $(".entity").hide();
        } else {
          $(".period").show();
          $(".entity").show();
        }
      },
      '{scope.appstate} change': function() {
          var self=this;
          console.log("appState set to "+JSON.stringify(this.scope.appstate.attr()));
          /* Page is not allowed to do search by default when page is loaded */
          /* This can be checked using 'localGlobalSearch' parameter, it will be undefined when page loaded */
          if(this.scope.attr("localGlobalSearch") != undefined){
            if(this.scope.attr("localGlobalSearch") != this.scope.appstate.attr('globalSearch') ){
                this.scope.attr("localGlobalSearch",this.scope.appstate.attr('globalSearch'));
                console.log("User clicked on  search");
                $("#loading_img").show();

                var periodFrom = this.scope.appstate.attr('periodFrom');
                var periodTo = this.scope.appstate.attr('periodTo');
                var serTypeId = this.scope.appstate.attr('storeType');
                var regId = this.scope.appstate.attr('region');
                var countryId = this.scope.appstate.attr()['country'];
                var licId = this.scope.appstate.attr()['licensor'];
                var contGrpId = this.scope.appstate.attr()['contentType'];

                var claimLicSearchRequest = {};
                //claimLicSearchRequest.searchRequest = {};
                if(typeof(periodFrom)=="undefined")
                  claimLicSearchRequest["periodFrom"] = "";
                else
                  claimLicSearchRequest["periodFrom"] = periodFrom;

                if(typeof(periodTo)=="undefined")
                  claimLicSearchRequest["periodTo"] = "";
                else
                  claimLicSearchRequest["periodTo"] = periodTo;

                if(typeof(serTypeId)=="undefined")
                  claimLicSearchRequest["serviceTypeId"] = "";
                else
                  claimLicSearchRequest["serviceTypeId"] = serTypeId['id'];

                if(typeof(regId)=="undefined")
                  claimLicSearchRequest["regionId"] = "";
                else
                  claimLicSearchRequest["regionId"] = regId['id'];
                
                claimLicSearchRequest["country"] = [];
                if(typeof(countryId)!="undefined")
                  //claimLicSearchRequest.searchRequest["country"].push(countryId['value']);
                  claimLicSearchRequest["country"]=countryId;

                claimLicSearchRequest["entityId"] = [];
                if(typeof(licId)!="undefined")
                  claimLicSearchRequest["entityId"] = licId;

                claimLicSearchRequest["contentGrpId"] = [];
                if(typeof(contGrpId)!="undefined")
                  claimLicSearchRequest["contentGrpId"] = contGrpId;

                claimLicSearchRequest["periodType"] = "P";

                claimLicSearchRequest["status"] = "";
                claimLicSearchRequest["offset"] = "0";
                claimLicSearchRequest["limit"] = "10";
                
                var tabView =  self.scope.attr('view');
                claimLicSearchRequest["view"] = self.scope.attr('view');
                
                var filterData = self.scope.tokenInput.attr();
                var newFilterData = [];
                if(filterData.length>0){
                  for(var p=0;p<filterData.length;p++)
                    newFilterData.push(filterData[p]["name"]);
                }
                claimLicSearchRequest["filter"] = newFilterData;

                claimLicSearchRequest["sortBy"] = self.scope.sortColumns.attr().toString();
                claimLicSearchRequest["sortOrder"] = "ASC";

                //console.log("Request are "+JSON.stringify(UserReq.formRequestDetails(claimLicSearchRequest)));
                console.log("Request are "+JSON.stringify(claimLicSearchRequest));
                if(tabView=="licensor"){
                  claimLicensorInvoices.findOne(UserReq.formRequestDetails(claimLicSearchRequest),function(values){
                      console.log("data is "+JSON.stringify(values.attr()));
                      self.scope.allClaimLicensorMap.replace(values);
                  },function(xhr){
                    console.error("Error while loading: "+xhr);
                  });
                } else if(tabView=="country" || tabView=="country-aggregate"){
                  claimCountryInvoices.findOne(UserReq.formRequestDetails(claimLicSearchRequest),function(values){
                      //console.log("datafsdf is "+JSON.stringify(values.attr()));
                      self.scope.allClaimCountryMap.replace(values);
                  },function(xhr){
                    console.error("Error while loading: "+xhr);
                  });
                }
            }
          } else {
            if(this.scope.appstate.attr('globalSearch')==undefined)
              this.scope.appstate.attr('globalSearch',true);
            
            this.scope.attr("localGlobalSearch", this.scope.appstate.attr('globalSearch'));
          }
      }
    }
});

/* generateTableData - This function is used to convert the reponse json in to a format accepted by Grid */
/* This function calls 'generateFooterData' function to format the footer data accepted by grid */
/* Two parameters 
   "invoiceData" - holds the data for Table body, 
    "footerData" - holds the data for Table footer, 
*/
var generateTableData = function(invoiceData,footerData){
  //console.log("invoiceData is "+JSON.stringify(invoiceData));
  var gridData = {"data":[], "footer":[]};
        
        for(var i=0;i<invoiceData.length;i++){
            var invTemp = {};
            invTemp["entityId"] = invoiceData[i]["entityId"];
            invTemp["__isChild"] = false;
            invTemp["entity"] = (invoiceData[i]["entityName"]==null)?"":invoiceData[i]["entityName"];
            invTemp["invoiceNum"] = "";
            invTemp["currency"] = invoiceData[i]["currency"];
            
            invTemp["period"] = "";
            invTemp["country"] = "";
            invTemp["contentType"] = "";
            invTemp["invoiceAmt"] = CurrencyFormat(invoiceData[i]["invoiceAmount"]);
            invTemp["orDispAmt"] = (invoiceData[i]["overrepAmount"])==null?0:invoiceData[i]["overrepAmount"];
            invTemp["liDispAmt"] = (invoiceData[i]["lineDisputeAmount"])==null?0:invoiceData[i]["lineDisputeAmount"];
            invTemp["reconDispAmt"] = CurrencyFormat(invoiceData[i]["reconAmount"]);
            invTemp["qaAlloc"] = CurrencyFormat(invoiceData[i]["oaAllocated"]);
            invTemp["cnAlloc"] = CurrencyFormat(invoiceData[i]["caAllocated"]);
            invTemp["balance"] = "";
            invTemp["priorPaid"] = CurrencyFormat(invoiceData[i]["priorPaid"]);
            invTemp["invPaySat"] = CurrencyFormat(invoiceData[i]["invPmtSaturation"]);
            invTemp["paySat"] = CurrencyFormat(invoiceData[i]["pmtSaturation"]);
            invTemp["orDispPerc"] = CurrencyFormat(invoiceData[i]["invoiceAmount"]);
            invTemp["liDispPerc"] = CurrencyFormat(invoiceData[i]["invoiceAmount"]);
            invTemp["status"] = "";

            gridData.data.push(invTemp);

            var insertedId = gridData.data.length-1;
            //console.log("jfsdhfjshj is "+invoiceData[i]["claimReviewLicDetails"]);
            var invoiceLineItems = invoiceData[i]["reviewDetails"];

            var contentTypeArr = [], countryArr = [];
            if(invoiceLineItems.length > 0){
              for(var j=0;j<invoiceLineItems.length;j++){
                var invLITemp={};

                invLITemp["entityId"] = invTemp["entityId"]+","+  invTemp["entity"] ;
                invLITemp["__isChild"] = true;
                invLITemp["entity"] = "";
                invLITemp["invoiceNum"] = invoiceLineItems[j]["invoiceNumber"];
                invLITemp["currency"] = invTemp["currency"];

                invLITemp["period"] = invoiceLineItems[j]["period"];
                invTemp["period"] = invoiceLineItems[j]["period"];

                invLITemp["country"] = invoiceLineItems[j]["countryId"];
                invLITemp["contentType"] = invoiceLineItems[j]["contentTypeName"];

                invLITemp["invoiceAmt"] = invoiceLineItems[j]["invoiceAmount"];

                invLITemp["orDispAmt"] = (invoiceLineItems[j]["overrepAmount"])==null?0:invoiceLineItems[j]["overrepAmount"];
              
                invLITemp["liDispAmt"] = (invoiceLineItems[j]["lineDisputeAmount"])==null?0:invoiceLineItems[j]["lineDisputeAmount"];

                invLITemp["reconDispAmt"] = invoiceLineItems[j]["reconAmount"];

                invLITemp["qaAlloc"] = invoiceLineItems[j]["oaAllocated"];

                invLITemp["cnAlloc"] = invoiceLineItems[j]["caAllocated"];

                invLITemp["balance"] = (invoiceLineItems[j]["balance"]==null)?0:invoiceLineItems[j]["balance"];

                invLITemp["priorPaid"] = invoiceLineItems[j]["priorPaid"];

                invLITemp["invPaySat"] = invoiceLineItems[j]["invPmtSaturation"];
                
                invLITemp["paySat"] = invoiceLineItems[j]["pmtSaturation"];
                
                invLITemp["orDispPerc"] = (invoiceLineItems[j]["overrepDispPer"]==null)?0:invoiceLineItems[j]["overrepDispPer"];
                
                invLITemp["liDispPerc"] = (invoiceLineItems[j]["liDispPer"]==null)?0:invoiceLineItems[j]["liDispPer"];;
                
                invLITemp["status"] = (invoiceLineItems[j]["status"] ==null)?"":invoiceLineItems[j]["status"];
                invTemp["status"] = invLITemp["status"];
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
          var footerJson = {"entityId":"","__isChild":false,"entity":"Total in Regional Currency (EUR)","invoiceNum":"","currency":"","period":"","country":"","contentType":"","invoiceAmt":"350000","orDispAmt":"20000","liDispAmt":"40000","reconDispAmt":"30000","qaAlloc":"2000","cnAlloc":"2000","balance":"76","priorPaid":"0","invPaySat":"","paySat":"","orDispPerc":"","liDispPerc":"","status":""};
          //gridData.footer.push(footerJson);
         
          //console.log("footerData is "+JSON.stringify(footerData));
          var formatFooterData = generateFooterData(footerData);
          gridData.footer = formatFooterData;
          console.log("gridData is "+JSON.stringify(gridData));
          return gridData;
}

/* generateFooterData - This function is used to convert the reponse json in to a format accepted by Grid */
/* One parameter "footerData" - holds the footer data */
var generateFooterData = function(footerData){
    console.log("footerData is "+JSON.stringify(footerData));
    var formatFooterData = []; 
    var footTemp ={};
    footTemp["entityId"] = "";
    footTemp["__isChild"] = false;
    footTemp["entity"] = "Total in Regional Currency";
    footTemp["invoiceNum"] = "";
    footTemp["currency"] = footerData["currency"];
    footTemp["period"] = "";
    footTemp["country"] = "";
    footTemp["contentType"] = "";
    footTemp["invoiceAmt"] = CurrencyFormat(parseInt(footerData["invoiceAmount"]));
    footTemp["orDispAmt"] = CurrencyFormat(parseInt(footerData["overrepAmount"]));
    footTemp["liDispAmt"] = CurrencyFormat(parseInt(footerData["lineDisputeAmount"]));
    footTemp["reconDispAmt"] = CurrencyFormat(parseInt(footerData["reconAmount"]));
    footTemp["qaAlloc"] = CurrencyFormat(parseInt(footerData["oaAllocated"]));
    footTemp["cnAlloc"] = CurrencyFormat(parseInt(footerData["caAllocated"]));
    footTemp["balance"] = 0;
    footTemp["priorPaid"] = CurrencyFormat(parseInt(footerData["priorPaid"]));
    footTemp["invPaySat"] = 0;
    footTemp["paySat"] = 0;
    footTemp["orDispPerc"] = 0;
    footTemp["liDispPerc"] = 0;
    footTemp["status"] = "";

    formatFooterData.push(footTemp);

    var footerLineItems = footerData["footerDetails"];
    for(var i=0;i<footerLineItems.length;i++){
      var footLITemp={};
      footLITemp["entityId"] = "";
      footLITemp["__isChild"] = true;
      footLITemp["entity"] = "";
      footLITemp["invoiceNum"] = "";
      footLITemp["currency"] = footerLineItems[i]["currency"];
      footLITemp["period"] = "";
      footLITemp["country"] = "";
      footLITemp["contentType"] = "";
      footLITemp["invoiceAmt"] = CurrencyFormat(parseInt(footerLineItems[i]["invoiceAmount"]));
      footLITemp["orDispAmt"] = CurrencyFormat(parseInt(footerLineItems[i]["overrepAmount"]));
      footLITemp["liDispAmt"] = CurrencyFormat(parseInt(footerLineItems[i]["lineDisputeAmount"]));
      footLITemp["reconDispAmt"] = CurrencyFormat(parseInt(footerLineItems[i]["reconAmount"]));
      footLITemp["qaAlloc"] = CurrencyFormat(parseInt(footerLineItems[i]["oaAllocated"]));
      footLITemp["cnAlloc"] = CurrencyFormat(parseInt(footerLineItems[i]["caAllocated"]));
      footLITemp["balance"] = 0;
      footLITemp["priorPaid"] = CurrencyFormat(parseInt(footerLineItems[i]["priorPaid"]));
      footLITemp["invPaySat"] = 0;
      footLITemp["paySat"] = 0;
      footLITemp["orDispPerc"] = 0;
      footLITemp["liDispPerc"] = 0;
      footLITemp["status"] = "";
      formatFooterData.push(footLITemp);
    }
    //console.log("Formated footer data "+JSON.stringify(formatFooterData));
    return formatFooterData;
}
function CurrencyFormat(number)
{
  var n = number.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,");
  return n;
}
export default page;
