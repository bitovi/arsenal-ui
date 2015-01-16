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

import exportToExcel from 'components/export-toexcel/';
import copy from 'components/copy-clipboard/';

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
        id: 'entityName',
        title: '<span class="open-toggle-all"></span> Licensor',
        sortable: true,
        contents: function(row) { return stache('{{#unless isChild}}<span class="open-toggle"></span>{{/unless}} {{entityName}}')({entityName: row.entityName, isChild: row.__isChild}); }
      },
      {
        id: 'invoiceNumber',
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
        title: 'Content Type',
        sortable: true
      },
      {
        id: 'invoiceAmount',
        title: 'Invoice',
        sortable: true
      },
      {
        id: 'overrepAmount',
        title: 'OverRep',
        sortable: true
      },
      {
        id: 'lineDisputeAmount',
        title: 'Line Item',
        sortable: true
      },
      {
        id: 'reconAmount',
        title: 'Recon',
        sortable: true
      },
      {
        id: 'oaAllocated',
        title: 'OA Allocated',
        sortable: true
      },
      {
        id: 'caAllocated',
        title: 'CA Allocated',
        sortable: true
      },
      {
        id: 'priorPaid',
        title: 'Prior Paid',
        sortable: true
      },
      {
        id: 'invPmtSaturation',
        title: 'Inv Pymt Sat',
        sortable: true
      },
      {
        id: 'pmtSaturation',
        title: 'Pymt Sat',
        sortable: true
      },
      {
        id: 'balance',
        title: 'Balance',
        sortable: true
      },
      {
        id: 'overrepDispPer',
        title: 'OR Dispute %',
        sortable: true
      },
      {
        id: 'liDispPer',
        title: 'LI Dispute %',
        sortable: true
      },
      {
        id: 'status',
        title: 'Status',
        sortable: true
      }
    ]
  },
  helpers: {
    tableClass: function() {
      return 'scrolling';
    }
  },
  events: {
    'inserted': function(){
      var self= this;
      var tbody = self.element.find('tbody');
      var parentScopeVar = self.element.closest('page-claimreview').scope();
      var tableScrollTopVal = parentScopeVar.attr('tableScrollTop');
      $(tbody[0]).scrollTop(tableScrollTopVal);
        $(tbody).on('scroll', function(ev) {
          if(tbody[0].scrollTop + tbody[0].clientHeight >= tbody[0].scrollHeight) {
            //console.log(JSON.stringify(self.element.closest('page-invoices').scope().appstate.attr()));

            
            var offsetVal = parentScopeVar.attr('licensorViewOffset');
            //console.log(offsetVal);

            /* Reset the offset value and call the webservice to fetch next set of records */
            parentScopeVar.attr('licensorViewOffset', (parseInt(offsetVal)+1));
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

      alignGrid('claimLicencorGrid');
    },
    '.open-toggle click': function(el, ev) {
      var row = el.closest('tr').data('row').row;
      row.attr('__isOpen', !row.attr('__isOpen'));
      alignGrid('claimLicencorGrid');
    },
    '.open-toggle-all click': function(el, ev) {
      ev.stopPropagation();
      var allOpen = _.every(this.scope.rows, row => row.__isChild ? true : row.__isOpen);
      can.batch.start();
      // open parent rows if they are closed; close them if they are open
      this.scope.rows.each(row => row.__isChild || row.attr('__isOpen', !allOpen));
      this.scope.attr('allOpen', !allOpen);
      can.batch.stop();
      alignGrid('claimLicencorGrid');
    },
  }
});

Grid.extend({
  tag: "rn-claim-country-grid",
  template: gridtemplate,
  scope: {
    appstate:undefined,
    is_aggregate:2,
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
        contents: function(row) { return stache('{{#unless isChild}}<span class="open-toggle"></span>{{/unless}} {{entityName}}')({entityName: row.country, isChild: row.__isChild}); }
      },
      {
        id: 'period',
        title: 'Period',
        sortable: true
      },
      {
        id: 'entityName',
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
        id: 'invoiceAmount',
        title: 'Invoice',
        sortable: true
      },
      {
        id: 'overrepAmount',
        title: 'OverRep',
        sortable: true
      },
      {
        id: 'lineDisputeAmount',
        title: 'Line Item',
        sortable: true
      },
      {
        id: 'reconAmount',
        title: 'Recon',
        sortable: true
      },
      {
        id: 'oaAllocated',
        title: 'OA Allocated',
        sortable: true
      },
      {
        id: 'caAllocated',
        title: 'CA Allocated',
        sortable: true
      },
      {
        id: 'priorPaid',
        title: 'Total Paid',
        sortable: true
      },
      {
        id: 'invPmtSaturation',
        title: 'Inv Sat',
        sortable: true
      },
      {
        id: 'pmtSaturation',
        title: 'Pymt Sat',
        sortable: true
      },
      {
        id: 'balance',
        title: 'Balance',
        sortable: true
      },
      {
        id: 'overrepDispPer',
        title: 'OR Disp %',
        sortable: true
      },
      {
        id: 'liDispPer',
        title: 'LI Disp %',
        sortable: true
      }
    ]
  },
  events:{
    'inserted': function(){
      var self= this;
      var tbody = self.element.find('tbody');
      var parentScopeVar = self.element.closest('page-claimreview').scope();
      var tableScrollTopVal = parentScopeVar.attr('tableScrollTop');
      $(tbody[0]).scrollTop(tableScrollTopVal);
        $(tbody).on('scroll', function(ev) {
          if(tbody[0].scrollTop + tbody[0].clientHeight >= tbody[0].scrollHeight) {
            //console.log(JSON.stringify(self.element.closest('page-invoices').scope().appstate.attr()));

            
            var offsetVal = parentScopeVar.attr('countryViewOffset');
            //console.log(offsetVal);

            /* Reset the offset value and call the webservice to fetch next set of records */
            parentScopeVar.attr('countryViewOffset', (parseInt(offsetVal)+1));
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

      alignGrid('claimCountryGrid', self.scope.is_aggregate);
    },
    '.open-toggle click': function(el, ev) {
      var self = this;
      var row = el.closest('tr').data('row').row;
      row.attr('__isOpen', !row.attr('__isOpen'));
      if(self.scope.is_aggregate == 1){
        $(".period").hide();
        $(".entityName").hide();
      } else {
        $(".period").show();
        $(".entityName").show(); 
      }
      alignGrid('claimCountryGrid', self.scope.is_aggregate);
    },
    '.open-toggle-all click': function(el, ev) {
      var self = this;
      ev.stopPropagation();
      var allOpen = _.every(this.scope.rows, row => row.__isChild ? true : row.__isOpen);
      can.batch.start();
      // open parent rows if they are closed; close them if they are open
      this.scope.rows.each(row => row.__isChild || row.attr('__isOpen', !allOpen));
      this.scope.attr('allOpen', !allOpen);
      can.batch.stop();
      if(self.scope.is_aggregate == 1){
        $(".period").hide();
        $(".entityName").hide();
      } else {
        $(".period").show();
        $(".entityName").show();
      }
      alignGrid('claimCountryGrid', self.scope.is_aggregate);
    }
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
    licensorTableScrollTop: 0,
    countryTableScrollTop: 0,
    licensorViewOffset: 0,
    countryViewOffset: 0,
    details:{},
    view:"licensor",
	  tokenInput: [],
    is_aggregate:0,
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
          $("#messageDiv").html("<label class='errorMessage'>Please select Invoice from child row to see Historical Trends</label>");
          $("#messageDiv").show();
          setTimeout(function(){
              $("#messageDiv").hide();
          },4000);
        }
    	},
      "#highChartDetails mousedown": function(item, el, ev){
        if(el.toElement.id == 'close'){
          $("#highChartDetails").addClass("highcharts_Hide")
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
          if(invoiceData == 0){
            var is_aggregate = self.scope.attr("is_aggregate");
            $('#claimCountryGrid').html(stache('<rn-claim-country-grid emptyrows="{emptyrows}" is_aggregate="{is_aggregate}"></rn-claim-country-grid>')({emptyrows:true, is_aggregate}));
          }
      },
      '#chkAggregate change': function(item, el, ev) {
        var self = this;    
        //console.log("here");
        if($("#chkAggregate").is(":checked")){
            self.scope.attr("view","country-aggregate");
            self.scope.attr("is_aggregate", 1);

        } else {
            self.scope.attr('view',"country");
            self.scope.attr("is_aggregate", 0);

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
           console.log("row "+JSON.stringify(row.attr()));
           this.scope.details["countryId"]=row.country;
           this.scope.details["requestFrom"]="Licensor";
           this.scope.details["licensorId"]=row.entityId.split(",")[1];
           this.scope.details["fiscalPeriod"]=row.period;
           this.scope.details["periodType"]="P";
           this.scope.details["contentType"]=row.contentType;
           this.scope.details["isChild"]=className;
      },
      ".rn-grid>thead>tr>th click": function(item, el, ev){
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
            if(existFlag==false){
              self.scope.attr('sortColumns').replace([]);
              self.scope.attr('sortColumns').push(val[0]);
            } else {
              var sortDirection = (self.scope.attr('sortDirection') == 'asc') ? 'desc' : 'asc';
              self.scope.attr('sortDirection', sortDirection);
            }

          }
           
          console.log("aaa "+self.scope.sortColumns.attr());
           /* The below code calls {scope.appstate} change event that gets the new data for grid*/
           /* All the neccessary parameters will be set in that event */
           self.scope.appstate.attr('globalSearchButtonClicked', false);
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
          var is_aggregate = self.scope.attr("is_aggregate");
          
          $("#loading_img").hide();
          $('#claimCountryGrid').html(stache('<rn-claim-country-grid rows="{rows}" footerrows="{footerrows}" sortcolumnnames="{sortcolumnnames}" sortdir="{sortdir}" emptyrows="{emptyrows}" is_aggregate="{{is_aggregate}}"></rn-claim-country-grid>')({rows, footerrows, sortcolumnnames:sortedColumns, sortdir:sortDir, emptyrows:false, is_aggregate}));
        } else {
          $("#loading_img").hide();
          $('#claimCountryGrid').html(stache('<rn-claim-country-grid emptyrows="{emptyrows}" is_aggregate="{{is_aggregate}}"></rn-claim-country-grid>')({emptyrows:true, is_aggregate}));
        }
        if(self.scope.attr("view") == "country-aggregate"){
          $(".period").hide();
          $(".entityName").hide();
          
        } else {
          $(".period").show();
          $(".entityName").show();
        }
      },
     

      '.exportToExcel click':function(el,ev){
          var self = this;
          var tableRowCount=$(".rn-grid > tbody > tr").length;
          
          if(tableRowCount > 0){
            if( this.scope.appstate.attr('excelOutput')==undefined || !this.scope.appstate.attr('excelOutput'))
            self.scope.appstate.attr("excelOutput",true);
          }else{
            $("#loading_img").hide();
                        $("#messageDiv").html("<label class='errorMessage'>Data Not Available</label>");
                        $("#messageDiv").show();
                        setTimeout(function(){
                            $("#messageDiv").hide();
                        },4000);
          }
          
      },
      '#copyToClipboard click':function(){  console.log($('#myTabs').next('.tab-content').find('.tab-pane:visible table:visible').clone(true));
         $('#clonetable').empty().html($('#myTabs').next('.tab-content').find('.tab-pane:visible table:visible').clone(true).attr('id','dynamic'));
         $('copy-clipboard').slideDown(function(){
           $('body').css('overflow','hidden');
           $('#copyall').trigger('click');
        });       
      },
      '{scope.appstate} change': function() {
          var self=this;
          var tabView =  self.scope.attr('view');

          /* When fetch button is clicked the first set of records should be brought */
          /* Reset the offset to 0 only when global search Fetch button is clicked */
          /* In the case of scroll, globalSearchButtonClicked attr will be false */
          if(self.scope.appstate.attr('globalSearchButtonClicked')==true){
            if(tabView=="licensor"){
              self.scope.attr("licensorViewOffset",0);
              self.scope.attr("licensorTableScrollTop",0);
            } else {
              self.scope.attr("countryViewOffset",0);
              self.scope.attr("countryTableScrollTop",0);
            }
            self.scope.sortColumns.replace([]);
            self.scope.attr("sortDirection","asc");
          }
          /* Page is not allowed to do search by default when page is loaded */
          /* This can be checked using 'localGlobalSearch' parameter, it will be undefined when page loaded */
          if(this.scope.attr("localGlobalSearch") != undefined || self.scope.appstate.attr("excelOutput")){
            if(this.scope.attr("localGlobalSearch") != this.scope.appstate.attr('globalSearch') || self.scope.appstate.attr("excelOutput")){
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

                if(tabView=="licensor")
                  claimLicSearchRequest["offset"] = this.scope.licensorViewOffset;
                else 
                  claimLicSearchRequest["offset"] = this.scope.countryViewOffset;

                claimLicSearchRequest["limit"] = "10";

                if(self.scope.appstate.attr('excelOutput')) claimLicSearchRequest["excelOutput"] = true;

                claimLicSearchRequest["view"] = self.scope.attr('view');
                claimLicSearchRequest["gridName"] = (tabView === "licensor")? "CR_LICENSOR_VIEW":"CR_COUNTRY_VIEW";
                
                var filterData = self.scope.tokenInput.attr();
                var newFilterData = [];
                if(filterData.length>0){
                  for(var p=0;p<filterData.length;p++)
                    newFilterData.push(filterData[p]["name"]);
                }
                claimLicSearchRequest["filter"] = newFilterData;

                claimLicSearchRequest["sortBy"] = self.scope.sortColumns.attr().toString();
                claimLicSearchRequest["sortOrder"] = self.scope.attr('sortDirection');

                
                //console.log("Request are "+JSON.stringify(UserReq.formRequestDetails(claimLicSearchRequest)));
                console.log("Request are "+JSON.stringify(claimLicSearchRequest));
                if(tabView=="licensor"){
                  claimLicensorInvoices.findOne(UserReq.formRequestDetails(claimLicSearchRequest),function(values){
                      //console.log("data is "+JSON.stringify(values.attr()));
                      if(values["status"]!="FAILURE"){
                        if(self.scope.appstate.attr('excelOutput')){
                          $("#loading_img").hide();
                          $('#exportExcel').html(stache('<export-toexcel csv={values}></export-toexcel>')({values}));
                           self.scope.appstate.attr("excelOutput",false);
                        }else{
                          /*
                          $("#messageDiv").html("<label class='successMessage'>"+values["responseText"]+"</label>");
                          $("#messageDiv").show();
                          setTimeout(function(){
                              $("#messageDiv").hide();
                          },4000);
                          */
                          if(parseInt(claimLicSearchRequest["offset"])==0){
                            self.scope.allClaimLicensorMap.replace(values);
                          } else{
                            $.merge(self.scope.allClaimLicensorMap[0].reviews, values.reviews);
                            self.scope.allClaimLicensorMap.replace(self.scope.allClaimLicensorMap);
                          }
                        }
                      } else {
                        $("#loading_img").hide();
                        $("#messageDiv").html("<label class='errorMessage'>"+values["responseText"]+"</label>");
                        $("#messageDiv").show();
                        setTimeout(function(){
                            $("#messageDiv").hide();
                        },4000);
                      }
                  },function(xhr){
                     $("#loading_img").hide();
                     self.scope.appstate.attr("excelOutput",false);
                    console.error("Error while loading: "+xhr);
                  });
                } else if(tabView=="country" || tabView=="country-aggregate"){
                  claimCountryInvoices.findOne(UserReq.formRequestDetails(claimLicSearchRequest),function(values){
                      //console.log("data is "+JSON.stringify(values.attr()));
                      if(values["status"]!="FAILURE"){
                        if(self.scope.appstate.attr('excelOutput')){
                          $("#loading_img").hide();
                          $('#exportExcel').html(stache('<export-toexcel csv={values}></export-toexcel>')({values}));
                           self.scope.appstate.attr("excelOutput",false);
                        }else{
                          /*
                          $("#messageDiv").html("<label class='successMessage'>"+values["responseText"]+"</label>");
                          $("#messageDiv").show();
                          setTimeout(function(){
                              $("#messageDiv").hide();
                          },4000);
                          */
                          if(parseInt(claimLicSearchRequest["offset"])==0){
                            self.scope.allClaimCountryMap.replace(values);
                          } else{
                            $.merge(self.scope.allClaimCountryMap[0].reviews, values.reviews);
                            self.scope.allClaimCountryMap.replace(self.scope.allClaimCountryMap);
                          }
                        }
                      } else {
                        $("#loading_img").hide();
                        $("#messageDiv").html("<label class='errorMessage'>"+values["responseText"]+"</label>");
                        $("#messageDiv").show();
                        setTimeout(function(){
                            $("#messageDiv").hide();
                        },4000);
                      }

                  },function(xhr){
                    $("#loading_img").hide();
                    self.scope.appstate.attr("excelOutput",false);
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
            invTemp["entityId"] = invoiceData[i]["entityId"]+","+ invoiceData[i]["entityName"];
            invTemp["__isChild"] = false;
            invTemp["entityName"] = (invoiceData[i]["entityName"]==null)?"":invoiceData[i]["entityName"];
            invTemp["invoiceNumber"] = "";
            invTemp["currency"] = invoiceData[i]["currency"];
            
            invTemp["period"] = "";
            invTemp["country"] = "";
            invTemp["contentType"] = "";
            invTemp["invoiceAmount"] = CurrencyFormat(invoiceData[i]["invoiceAmount"]);
            invTemp["overrepAmount"] = (invoiceData[i]["overrepAmount"])==null?0:invoiceData[i]["overrepAmount"];
            invTemp["lineDisputeAmount"] = (invoiceData[i]["lineDisputeAmount"])==null?0:invoiceData[i]["lineDisputeAmount"];
            invTemp["reconAmount"] = CurrencyFormat(invoiceData[i]["reconAmount"]);
            invTemp["oaAllocated"] = CurrencyFormat(invoiceData[i]["oaAllocated"]);
            invTemp["caAllocated"] = CurrencyFormat(invoiceData[i]["caAllocated"]);
            invTemp["balance"] = "";
            invTemp["priorPaid"] = CurrencyFormat(invoiceData[i]["priorPaid"]);
            invTemp["invPmtSaturation"] = CurrencyFormat(invoiceData[i]["invPmtSaturation"]);
            invTemp["pmtSaturation"] = CurrencyFormat(invoiceData[i]["pmtSaturation"]);
            invTemp["overrepDispPer"] = CurrencyFormat(invoiceData[i]["invoiceAmount"]);
            invTemp["liDispPer"] = CurrencyFormat(invoiceData[i]["invoiceAmount"]);
            invTemp["status"] = "";

            gridData.data.push(invTemp);

            var insertedId = gridData.data.length-1;
            //console.log("jfsdhfjshj is "+invoiceData[i]["claimReviewLicDetails"]);
            var invoiceLineItems = invoiceData[i]["reviewDetails"];

            var contentTypeArr = [], countryArr = [];
            if(invoiceLineItems.length > 0){
              for(var j=0;j<invoiceLineItems.length;j++){
                var invLITemp={};

                invLITemp["entityId"] = invTemp["entityId"]+","+  invTemp["entityName"] ;
                invLITemp["__isChild"] = true;
                invLITemp["entityName"] = "";
                invLITemp["invoiceNumber"] = invoiceLineItems[j]["invoiceNumber"];
                invLITemp["currency"] = invTemp["currency"];

                invLITemp["period"] = invoiceLineItems[j]["period"];
                invTemp["period"] = invoiceLineItems[j]["period"];

                invLITemp["country"] = invoiceLineItems[j]["countryId"];
                invLITemp["contentType"] = invoiceLineItems[j]["contentTypeName"];

                invLITemp["invoiceAmount"] = CurrencyFormat(invoiceLineItems[j]["invoiceAmount"]);

                invLITemp["overrepAmount"] = (invoiceLineItems[j]["overrepAmount"])==null?0:CurrencyFormat(invoiceLineItems[j]["overrepAmount"]);
              
                invLITemp["lineDisputeAmount"] = (invoiceLineItems[j]["lineDisputeAmount"])==null?0:CurrencyFormat(invoiceLineItems[j]["lineDisputeAmount"]);

                invLITemp["reconAmount"] = CurrencyFormat(invoiceLineItems[j]["reconAmount"]);

                invLITemp["oaAllocated"] = CurrencyFormat(invoiceLineItems[j]["oaAllocated"]);

                invLITemp["caAllocated"] = CurrencyFormat(invoiceLineItems[j]["caAllocated"]);

                invLITemp["balance"] = (invoiceLineItems[j]["balance"]==null)?0:CurrencyFormat(invoiceLineItems[j]["balance"]);

                invLITemp["priorPaid"] = CurrencyFormat(invoiceLineItems[j]["priorPaid"]);

                invLITemp["invPmtSaturation"] = CurrencyFormat(invoiceLineItems[j]["invPmtSaturation"]);
                
                invLITemp["pmtSaturation"] = CurrencyFormat(invoiceLineItems[j]["pmtSaturation"]);
                
                invLITemp["overrepDispPer"] = (invoiceLineItems[j]["overrepDispPer"]==null)?0:CurrencyFormat(invoiceLineItems[j]["overrepDispPer"]);
                
                invLITemp["liDispPer"] = (invoiceLineItems[j]["liDispPer"]==null)?0:CurrencyFormat(invoiceLineItems[j]["liDispPer"]);
                
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
          var footerJson = {"entityId":"","__isChild":false,"entityName":"Total in Regional Currency (EUR)","invoiceNumber":"","currency":"","period":"","country":"","contentType":"","invoiceAmount":"350000","overrepAmount":"20000","lineDisputeAmount":"40000","reconAmount":"30000","oaAllocated":"2000","caAllocated":"2000","balance":"76","priorPaid":"0","invPmtSaturation":"","pmtSaturation":"","overrepDispPer":"","liDispPer":"","status":""};
          //gridData.footer.push(footerJson);
         
          //console.log("footerData is "+JSON.stringify(footerData));
          var formatFooterData = generateFooterData(footerData);
          gridData.footer = formatFooterData;
          //console.log("gridData is "+JSON.stringify(gridData));
          return gridData;
}

/* generateFooterData - This function is used to convert the reponse json in to a format accepted by Grid */
/* One parameter "footerData" - holds the footer data */
var generateFooterData = function(footerData){
    //console.log("footerData is "+JSON.stringify(footerData));
    var formatFooterData = []; 
    var footTemp ={};
    footTemp["entityId"] = "";
    footTemp["__isChild"] = false;
    footTemp["entityName"] = "Total in Regional Currency";
    footTemp["invoiceNumber"] = "";
    footTemp["currency"] = footerData["currency"];
    footTemp["period"] = "";
    footTemp["country"] = "";
    footTemp["contentType"] = "";
    footTemp["invoiceAmount"] = CurrencyFormat(parseInt(footerData["invoiceAmount"]));
    footTemp["overrepAmount"] = CurrencyFormat(parseInt(footerData["overrepAmount"]));
    footTemp["lineDisputeAmount"] = CurrencyFormat(parseInt(footerData["lineDisputeAmount"]));
    footTemp["reconAmount"] = CurrencyFormat(parseInt(footerData["reconAmount"]));
    footTemp["oaAllocated"] = CurrencyFormat(parseInt(footerData["oaAllocated"]));
    footTemp["caAllocated"] = CurrencyFormat(parseInt(footerData["caAllocated"]));
    footTemp["balance"] = 0;
    footTemp["priorPaid"] = CurrencyFormat(parseInt(footerData["priorPaid"]));
    footTemp["invPmtSaturation"] = 0;
    footTemp["pmtSaturation"] = 0;
    footTemp["overrepDispPer"] = 0;
    footTemp["liDispPer"] = 0;
    footTemp["status"] = "";

    formatFooterData.push(footTemp);

    var footerLineItems = footerData["footerDetails"];
    for(var i=0;i<footerLineItems.length;i++){
      var footLITemp={};
      footLITemp["entityId"] = "";
      footLITemp["__isChild"] = true;
      footLITemp["entityName"] = "";
      footLITemp["invoiceNumber"] = "";
      footLITemp["currency"] = footerLineItems[i]["currency"];
      footLITemp["period"] = "";
      footLITemp["country"] = "";
      footLITemp["contentType"] = "";
      footLITemp["invoiceAmount"] = CurrencyFormat(parseInt(footerLineItems[i]["invoiceAmount"]));
      footLITemp["overrepAmount"] = CurrencyFormat(parseInt(footerLineItems[i]["overrepAmount"]));
      footLITemp["lineDisputeAmount"] = CurrencyFormat(parseInt(footerLineItems[i]["lineDisputeAmount"]));
      footLITemp["reconAmount"] = CurrencyFormat(parseInt(footerLineItems[i]["reconAmount"]));
      footLITemp["oaAllocated"] = CurrencyFormat(parseInt(footerLineItems[i]["oaAllocated"]));
      footLITemp["caAllocated"] = CurrencyFormat(parseInt(footerLineItems[i]["caAllocated"]));
      footLITemp["balance"] = 0;
      footLITemp["priorPaid"] = CurrencyFormat(parseInt(footerLineItems[i]["priorPaid"]));
      footLITemp["invPmtSaturation"] = 0;
      footLITemp["pmtSaturation"] = 0;
      footLITemp["overrepDispPer"] = 0;
      footLITemp["liDispPer"] = 0;
      footLITemp["status"] = "";
      formatFooterData.push(footLITemp);
    }
    //console.log("Formated footer data "+JSON.stringify(formatFooterData));
    return formatFooterData;
}
// function CurrencyFormat(number)
// {
//   var n = number.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,");
//   return n;
// }
function CurrencyFormat(number) {
    if (number != undefined && $.isNumeric(number)) {
      var n = number.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,");
      return n;
    } else {
      return 0;
    }
}
function alignGrid(divId, is_aggregate){
  var colLength = $('#'+divId+' table>thead>tr>th').length;
  var rowLength = $('#'+divId+' table>tbody>tr').length;
  var divWidth = $('#'+divId).outerWidth();
  var tableWidth = 0;
  var tdWidth, cellWidthArr = [];
  if(rowLength>0){
    $('#'+divId+' table').css("width",divWidth-300);
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

        /* When aggregate period is checked, 'period' & 'entityName' will be hidden, so its width made 0 */
        if(is_aggregate==1){
          if(i==2 || i==3) 
            tdWidth = 0;
        }
        
        tableWidth += tdWidth;
        cellWidthArr.push(tdWidth);
      }

      if(tableWidth < divWidth){
        var moreWidth = (divWidth-tableWidth)/colLength;
        for(var j=1;j<=cellWidthArr.length;j++){
          var width = Math.round(cellWidthArr[j-1]+moreWidth);
          if(is_aggregate==1){
            if(j==2 || j==3) 
              width = 0;
          }
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
}
  
export default page;
