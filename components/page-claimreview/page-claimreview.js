import Component from 'can/component/';
import stache from 'can/view/stache/';

import template from './template.stache!';
import styles from './page-claimreview.less!';

import Grid from 'components/grid/';
import gridtemplate from './gridtemplate.stache!';


import UserReq from 'utils/request/';
import claimLicensorInvoices from 'models/claim/licensor/';
import claimCountryInvoices from 'models/claim/country/';

import tokeninput from 'rinsTokeninput';
import css_tokeninput from 'tokeninput.css!';
import css_tokeninput_theme from 'tokeninput_theme.css!';

import highchartpage from 'components/highchart/';

import exportToExcel from 'components/export-toexcel/';
import copy from 'components/copy-clipboard/';
import gridUtils from 'utils/gridUtil';
import periodWidgetHelper from 'utils/periodWidgetHelpers';

import commonUtils from 'utils/commonUtils';

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
        id: 'sorticon',
        title: '<span class="open-toggle-all"></span>',
        sortable: false,
        //contents: function(row) { return stache('{{#unless isChild}}<span class="open-toggle"></span>{{/unless}}')({isChild: row.__isChild}); }
        contents: function(row) {
          if (row.hasChild) {
            return stache('{{#unless isChild}}<span class="open-toggle"></span>{{/unless}}')({isChild: row.__isChild});
          } else {
            return stache('{{#unless isChild}}<span class="open-toggle" style="visibility: hidden;"></span>{{/unless}}')({isChild: row.__isChild});
          }
        }
      },
      {
        id: 'entityName',
        title: 'Licensor',
        sortable: true
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
        title: 'Period Range',
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
    ],
    strippedGrid:true
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
      var getTblBodyHght=getVisibleGridHeight();
      gridUtils.setElementHeight(tbody,getTblBodyHght,getTblBodyHght);
      var parentScopeVar = self.element.closest('page-claimreview').scope();
      var tableScrollTopVal = parentScopeVar.attr('tableScrollTop');
      $(tbody[0]).scrollTop(tableScrollTopVal);
        $(tbody).on('scroll', function(ev) {
          if(tbody[0].scrollTop + tbody[0].clientHeight >= tbody[0].scrollHeight && parentScopeVar.licensorRecordsAvailable) {
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

      //alignGrid('claimLicencorGrid');
    },
    /*'.open-toggle click': function(el, ev) {
      var row = el.closest('tr').data('row').row;
      row.attr('__isOpen', !row.attr('__isOpen'));
      //alignGrid('claimLicencorGrid');
    },
    '.open-toggle-all click': function(el, ev) {
      ev.stopPropagation();
      var allOpen = _.every(this.scope.rows, row => row.__isChild ? true : row.__isOpen);
      can.batch.start();
      // open parent rows if they are closed; close them if they are open
      this.scope.rows.each(row => row.__isChild || row.attr('__isOpen', !allOpen));
      this.scope.attr('allOpen', !allOpen);
      can.batch.stop();
      //alignGrid('claimLicencorGrid');
    },*/
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
        id: 'sorticon',
        title: '<span class="open-toggle-all"></span>',
        sortable: false,
        contents: function(row) {
          //changed for <rdar://problem/20018279> Claim Review: Triangles exist with no data underneath -start
          //return stache('{{#unless isChild}}<span class="open-toggle"></span>{{/unless}}')({isChild: row.__isChild});
          if (row.hasChild) {
            return stache('{{#unless isChild}}<span class="open-toggle"></span>{{/unless}}')({isChild: row.__isChild});
          } else {
            return stache('{{#unless isChild}}<span class="open-toggle" style="visibility: hidden;"></span>{{/unless}}')({isChild: row.__isChild});
          }
          //changed for <rdar://problem/20018279> Claim Review: Triangles exist with no data underneath -end
        }

      },
      {
        id: 'country',
        title: 'Country',
        sortable: true
      },
      {
        id: 'period',
        title: 'Period Range',
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
    ],
    strippedGrid:true
  },
  events:{
    'inserted': function(){
      var self= this;
      var tbody = self.element.find('tbody');
      var getTblBodyHght=getVisibleGridHeight();
      gridUtils.setElementHeight(tbody,getTblBodyHght,getTblBodyHght);
      var parentScopeVar = self.element.closest('page-claimreview').scope();
      var tableScrollTopVal = parentScopeVar.attr('tableScrollTop');
      $(tbody[0]).scrollTop(tableScrollTopVal);
        $(tbody).on('scroll', function(ev) {
          if(tbody[0].scrollTop + tbody[0].clientHeight >= tbody[0].scrollHeight && parentScopeVar.countryRecordsAvailable) {
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

      //alignGrid('claimCountryGrid', self.scope.is_aggregate);
    },
    '.open-toggle click': function(el, ev) {
      var self = this;
      //var row = el.closest('tr').data('row').row;
      //row.attr('__isOpen', !row.attr('__isOpen'));
      if($(el.closest('tr').parent()).is('tfoot')){
        $(el.closest('table').find('tfoot').find('tr')).not('.child').toggleClass('open');
        $(el.closest('table').find('tfoot').find('.child')).toggleClass('visible');
      }else{
        var index=el.closest('tr').data('row').index;
        var allRows=el.closest('table').find('tbody').find('tr'); // get all the rows from table.
        for(var k=index+1;k<allRows.length;k++){
          if(!$(allRows[k]).hasClass('child')){//if you encountered the next parent then break the loop and comeout
            break;
          }
          if($(allRows[k]).hasClass('child')){
            $(allRows[k]).toggleClass('visible');
          }
        }
        $(allRows[index]).toggleClass('open');
      }
      if(self.scope.is_aggregate == 1){
        $(".rn-grid .period").hide(); //chnagd for <rdar://problem/20018582> Date Widget Disappears
        $(".entityName").hide();
        $(".sorticon").hide(); //added for <rdar://problem/20018279> Claim Review: Triangles exist with no data underneath
      } else {
        $(".rn-grid .period").show(); //chnagd for <rdar://problem/20018582> Date Widget Disappears
        $(".entityName").show();
        $(".sorticon").show(); //added for <rdar://problem/20018279> Claim Review: Triangles exist with no data underneath
      }
      //alignGrid('claimCountryGrid', self.scope.is_aggregate);
    },
    '.open-toggle-all click': function(el, ev) {
      var self = this;
      /*ev.stopPropagation();
      var allOpen = _.every(this.scope.rows, row => row.__isChild ? true : row.__isOpen);
      can.batch.start();
      // open parent rows if they are closed; close them if they are open
      this.scope.rows.each(row => row.__isChild || row.attr('__isOpen', !allOpen));
      this.scope.attr('allOpen', !allOpen);
      can.batch.stop();*/
      var isOpend=el.closest('table').find('thead').find('tr').hasClass('open');
      if(!isOpend){
        el.closest('table').find('thead').find('tr').addClass('open');
        $(el.closest('table').find('tbody').find('tr')).not('.child').addClass('open');
        $(el.closest('table').find('tbody').find('.child')).addClass('visible');
      }else{
        el.closest('table').find('thead').find('tr').removeClass('open');
        $(el.closest('table').find('tbody').find('tr')).not('.child').removeClass('open');
        $(el.closest('table').find('tbody').find('.child')).removeClass('visible');
      }
      if(self.scope.is_aggregate == 1){
        $(".rn-grid .period").hide(); //chnagd for <rdar://problem/20018582> Date Widget Disappears
        $(".entityName").hide();
        $(".sorticon").hide(); //added for <rdar://problem/20018279> Claim Review: Triangles exist with no data underneath
      } else {
        $(".rn-grid .period").show(); //chnagd for <rdar://problem/20018582> Date Widget Disappears
        $(".entityName").show();
        $(".sorticon").show(); //added for <rdar://problem/20018279> Claim Review: Triangles exist with no data underneath
      }
      //alignGrid('claimCountryGrid', self.scope.is_aggregate);
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
    sortableColumns:[
                      { id:"period", sortID:"PERIOD"},
                      { id:"country", sortID:"COUNTRY"},
                      { id:"contentType", sortID:"CONTENT_TYPE"},
                      { id:"invoiceAmount", sortID:"TOTAL_INVOICE_AMOUNT"},
                      { id:"overrepAmount", sortID:"OVERREP_AMOUNT"},
                      { id:"lineDisputeAmount", sortID:"INVOICE_LINE_ITEM_AMOUNT"},
                      { id:"reconAmount", sortID:"RECON_AMOUNT"},
                      { id:"oaAllocated", sortID:"OA_ALLOCATED"},
                      { id:"caAllocated", sortID:"CA_ALLOCATED"},
                      { id:"priorPaid", sortID:"PRIOR_PAID"},
                      { id:"balance", sortID:"BALANCE"},
                      { id:"invPmtSaturation", sortID:"INV_PMT_SATURATION"},
                      { id:"pmtSaturation", sortID:"PMT_SATURATION"},
                      { id:"entityName", sortID:"LICENSOR"}
                      //{ id:"", sortID:""},
                       ],
    licensorTableScrollTop: 0,
    countryTableScrollTop: 0,
    licensorViewOffset: 0,
    countryViewOffset: 0,
    details:{},
    view:"licensor",
	  tokenInput: [],
    countryRecordsAvailable:'@',
    licensorRecordsAvailable:'@',
    // populateDefaultDataForCountry:'@',
    // populateDefaultDataForLicensor:'@',
    is_aggregate:0,
    isfromDashBoard:false,
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
	 var self = this;
    self.scope.appstate.attr("renderGlobalSearch",true);
    //self.scope.attr('populateDefaultDataForLicensor',true);
    self.scope.attr("licensorViewOffset",0);
    self.scope.attr("licensorTableScrollTop",0);
    self.scope.sortColumns.replace([]);
    self.scope.attr("sortDirection","asc");
    self.scope.attr("isfromDashBoard",self.scope.appstate.screenLookup.ispagelocal);
    },
    events: {
    	"inserted": function(){
    		var self = this;
        $("#tokenSearch").tokenInput(self.scope.appstate.filterSuggestion,
        {
            theme: "facebook",
            placeholder:"Search...",
            preventDuplicates: true,
            allowFreeTagging:true,
            tokenLimit:3,
            allowTabOut:false,
            onResult: function (item) {
              if($.isEmptyObject(item)){
                      var tempObj={id:$("#token-input-tokenSearch").val(),name: $("#token-input-tokenSearch").val()};
                      return [tempObj];
                }else{
                      return item;
                }
            },
            onAdd: function (item) {
                //add it to the exisitng search array, remove duplicate if any
                var isExists=false;
                for(var j=0;j<self.scope.appstate.filterSuggestion.length;j++){
                  if(self.scope.appstate.filterSuggestion[j].attr('name').toLowerCase() === item.name.toLowerCase()){
                    isExists=true;
                    break;
                  }
                }
                if(!isExists){
                  self.scope.appstate.filterSuggestion.push(item);
                }
                self.scope.refreshTokenInput(item,"Add");
            },
            onDelete: function (item) {
                 self.scope.refreshTokenInput(item,"Delete");
                 //after deleting call refresh method
                 refreshSearchOnfilter(self);
            },
            queryDB:function(items){
               //Call Db fetch for the filter conditions.
               //this call back function will be called when the last token is added.
               //if the limit of the token is 3 then when the user add the last token this method
               //get invoked
               refreshSearchOnfilter(self);
            }
        });

        $('#claimLicencorGrid').html(stache('<rn-claim-licensor-grid emptyrows="{emptyrows}"></rn-claim-licensor-grid>')({emptyrows:true}));
        getClaimReviewData('licensor',self.scope);
    	},
    	"#highChart click":function(){
        commonUtils.hideUIMessage();
        var rowData = null;
        //console.log($(".rn-grid > tbody > tr.selected").data('row'));
        if($('#licensorView').is(':visible')){ //take it from licensor view
          if($("#claimLicencorGrid .rn-grid > tbody > tr.selected").length > 0 ){
            rowData=$("#claimLicencorGrid .rn-grid > tbody > tr.selected").data('row').row;
          }
        }else if($('#countryView').is(':visible')){
          if($("#claimCountryGrid .rn-grid > tbody > tr.selected").length > 0 ){
            rowData=$("#claimCountryGrid .rn-grid > tbody > tr.selected").data('row').row;
          }
        }
        if(rowData !== null){
          var data = null;
          if(rowData.hasChild || rowData.__isChild){ //this row has child record. So enforce the user to select child record
            if(this.scope.details.isChild){
                data = this.scope.details;
            }else{
              commonUtils.showErrorMessage("Please select Invoice from child row to see Historical Trends.");
            }
          }else if(!rowData.hasChild || !rowData.__isChild){
            //if there is no child then we can take the data from the selected record
            var requestFrom='Licensor';
            if($("#couView").parent().hasClass("active")){
              requestFrom="Country";
            }
            var entityName=rowData['entityName']
            var licensor=rowData['entityId'];
            if(licensor == null || licensor == undefined){
              entityName=row.entityId.split(",")[1];
            }
            data={
              'countryId':rowData['country'],
              'licensorId':entityName,
              'requestFrom':requestFrom,
              'fiscalPeriod':rowData['periodNo'],
              'periodType':rowData['periodType'],
              'contentType':rowData['contentType'],
              'currency':rowData['currency']
            };
          }else{
           commonUtils.showErrorMessage("Please select Invoice from child row to see Historical Trends.");
         }
          if(data !== null && data['contentType'] !== 'TAX'){
            $("#highChartDetails").append(stache('<high-chart details={data}></high-chart>')({data}));
          }
        }else{
          commonUtils.showErrorMessage("Please select Invoice line to see Historical Trends.");
        }
      },
      "#highChartDetails mousedown": function(item, el, ev){
        if(el.toElement.id == 'close'){
          $("#highChartDetails").addClass("highcharts_Hide");
          $("#chartContainer").removeClass('highcharts_Overlay');
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
      ".switch-toggle click":function(el, ev){

          var chart = $('#highChartDetails').highcharts();

          var amountSeries1 = chart.series[0];
          var amountSeries2 = chart.series[1];
          var amountSeries3 = chart.series[2];

          var rateSeries1 = chart.series[3];
          var rateSeries2 = chart.series[4];

          if ($(".switch-toggle").hasClass('on')) {
            console.log("Amount");
            $(".switch-toggle").removeClass('on').addClass('off');
            chart.yAxis[0].axisTitle.element.textContent = 'Amount';

            (rateSeries1).hide();
            (rateSeries2).hide();

            rateSeries1.options.showInLegend = false;
            rateSeries1.legendItem = null;
            chart.legend.destroyItem(rateSeries1);
            chart.legend.render();

            rateSeries2.options.showInLegend = false;
            rateSeries2.legendItem = null;
            chart.legend.destroyItem(rateSeries2);
            chart.legend.render();

            (amountSeries1).show();

            amountSeries1.options.showInLegend = true;
            chart.legend.renderItem(amountSeries1);
            chart.legend.render();

            (amountSeries2).show();

            amountSeries2.options.showInLegend = true;
            chart.legend.renderItem(amountSeries2);
            chart.legend.render();

            (amountSeries3).show();

            amountSeries3.options.showInLegend = true;
            chart.legend.renderItem(amountSeries3);
            chart.legend.render();



          }else {
            console.log("Rate");
            $(".switch-toggle").removeClass('off').addClass('on');
            chart.yAxis[0].axisTitle.element.textContent = 'Rate';

            (rateSeries1).show();
            rateSeries1.options.showInLegend = true;
            chart.legend.renderItem(rateSeries1);
            chart.legend.render();

            (rateSeries2).show();
            rateSeries2.options.showInLegend = true;
            chart.legend.renderItem(rateSeries2);
            chart.legend.render();

            (amountSeries1).hide();
            (amountSeries2).hide();
            (amountSeries3).hide();
            amountSeries1.options.showInLegend = false;
            amountSeries1.legendItem = null;
            chart.legend.destroyItem(amountSeries1);
            chart.legend.render();

            amountSeries2.options.showInLegend = false;
            amountSeries2.legendItem = null;
            chart.legend.destroyItem(amountSeries2);
            chart.legend.render();

            amountSeries3.options.showInLegend = false;
            amountSeries3.legendItem = null;
            chart.legend.destroyItem(amountSeries3);
            chart.legend.render();
         }
      },
      "#licView click": function(el, ev){
        var self = this;
        $('#highChart').show(); //added for <rdar://problem/20018279> Claim Review: Triangles exist with no data underneath
          //$("#aggregate").css("display","none");
          $("#aggregate").addClass("hide");
          self.scope.attr('view',"licensor");
          //self.scope.attr('populateDefaultDataForLicensor',true);
          //$("li#aggregate").addClass("hide");

          ev.preventDefault();

          self.scope.attr("licensorViewOffset",0);
          self.scope.attr("licensorTableScrollTop",0);
          self.scope.sortColumns.replace([]);
          self.scope.attr("sortDirection","asc");
          getClaimReviewData('licensor',self.scope);
      },
      "#couView click": function(el, ev){
          var self = this;
          $('#highChart').show(); //added for <rdar://problem/20018279> Claim Review: Triangles exist with no data underneath
          $("#aggregate").removeClass("hide");
          self.scope.attr('view',"country");
          ev.preventDefault();
          $("#chkAggregate").prop('checked',false);
          //self.scope.attr("is_aggregate",false);
          //console.log("fdfsdfsdf "+self.scope.attr("allClaimCountryMap").length);
          //rdar://problem/20018279> -start
          if($("#chkAggregate").is(':visible') && $("#chkAggregate").is(":checked")){
            $('#highChart').hide();
          }
          //rdar://problem/20018279> -end
          var invoiceData = self.scope.attr("allClaimCountryMap").length;
          if(invoiceData == 0){
            var is_aggregate = self.scope.attr("is_aggregate");
            $('#claimCountryGrid').html(stache('<rn-claim-country-grid emptyrows="{emptyrows}" is_aggregate="{is_aggregate}"></rn-claim-country-grid>')({emptyrows:true, is_aggregate}));
          }


          self.scope.attr("countryViewOffset",0);
          self.scope.attr("countryTableScrollTop",0);
          self.scope.sortColumns.replace([]);
          self.scope.attr("sortDirection","asc");
          //self.scope.attr('populateDefaultDataForLicensor',true);
          getClaimReviewData('country',self.scope);
      },
      '#chkAggregate change': function(item, el, ev) {
        var self = this;
        //console.log("here");
        if($("#chkAggregate").is(":checked")){
            self.scope.attr("view","country-aggregate");
            self.scope.attr("is_aggregate", 1);
            $('#highChart').hide();
        } else {
            self.scope.attr('view',"country");
            self.scope.attr("is_aggregate", 0);
            $('#highChart').show();
          }
        /* The below code calls {scope.appstate} change event that gets the new data for grid*/
        /* All the neccessary parameters will be set in that event */
        self.scope.appstate.attr('globalSearchButtonClicked',true);
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
           if($("#couView").parent().hasClass("active")){
            this.scope.details["requestFrom"]="Country";
           }
           var licensor=row.entityName;
           if(licensor == null || licensor == undefined){
            licensor=row.entityId.split(",")[1];
           }
           this.scope.details["licensorId"]=licensor;
           this.scope.details["fiscalPeriod"]=row.period;
           this.scope.details["periodType"]=periodWidgetHelper.getPeriodType(row.period);
           this.scope.details["contentType"]=row.contentType;
           this.scope.details["currency"]=row.currency || "";
           this.scope.details["isChild"]=className;
      },
      ".rn-grid>thead>tr>th click": function(item, el, ev){
          var self=this;
           //console.log($(item[0]).attr("class"));
          var val = $(item[0]).attr("class").split(" ");
          if(val[0] !== 'sorticon'){
            var sortableColumnName = _.pluck(_.filter(self.scope.attr().sortableColumns, { 'id': val[0] }), "sortID");

            var existingSortColumns =self.scope.sortColumns.attr();
            var existingSortColumnsLen = existingSortColumns.length;
            var sortAttr=val[0];
            var existFlag = false;
            if(existingSortColumnsLen==0){
              //self.scope.attr('sortColumns').push(val[0]);
              self.scope.attr('sortColumns').push(sortAttr);
            } else {
              for(var i=0;i<existingSortColumnsLen;i++){
                /* The below condition is to selected column to be sorted in asc & dec way */
                //console.log(sortableColumnName+","+existingSortColumns[i] )
                //if(existingSortColumns[i] == val[0]){
                if(existingSortColumns[i] == sortAttr){
                  existFlag = true;
                }
              }
              if(existFlag==false){
                self.scope.attr('sortColumns').replace([]);
                //self.scope.attr('sortColumns').push(val[0]);
                self.scope.attr('sortColumns').push(sortAttr);
              } else {
                var sortDirection = (self.scope.attr('sortDirection') == 'asc') ? 'desc' : 'asc';
                self.scope.attr('sortDirection', sortDirection);
              }

            }

            //console.log("aaa "+self.scope.sortColumns.attr());
             /* The below code calls {scope.appstate} change event that gets the new data for grid*/
             /* All the neccessary parameters will be set in that event */
             self.scope.appstate.attr('globalSearchButtonClicked', false);
             if(self.scope.appstate.attr('globalSearch')){
                self.scope.appstate.attr('globalSearch', false);
              }else{
                self.scope.appstate.attr('globalSearch', true);
              }
          }

      },
      ".token-input-list-facebook keyup": function(e,ev){
      if(ev.keyCode === 13){ //trigger search when user press enter key. This is becase user can
          //select multiple search token and can trigger the search
          var self= this;
          //console.log(JSON.stringify(self.scope.tokenInput.attr()));
          refreshSearchOnfilter(self);
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
        //alignGrid('claimLicencorGrid'); //added for 19727470 UI : Wave - M2 - Claim Review - UI is not proper when navigating between Licensor and Country tab in Claim Review
      },
      "{allClaimLicensorMap} change": function() {
        var self = this;
        var invoiceData = self.scope.attr().allClaimLicensorMap[0].reviews;
        var footerData = self.scope.attr().allClaimLicensorMap[0].footer;
        //var currencyType = $("#currencyType").val();
        //console.log("invoice data is sss  "+JSON.stringify(invoiceData));
        if(invoiceData != undefined && invoiceData!="null" && invoiceData.length!=0){
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
        //alignGrid('claimLicencorGrid'); //added for 19727470 UI : Wave - M2 - Claim Review - UI is not proper when navigating between Licensor and Country tab in Claim Review
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
        if(invoiceData != undefined && invoiceData!=null && invoiceData.length!=0){
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
          $(".rn-grid .period").hide(); //chnagd for <rdar://problem/20018582> Date Widget Disappears
          $(".entityName").hide();
          $(".sorticon").hide(); //added for <rdar://problem/20018279> Claim Review: Triangles exist with no data underneath
        } else {
          $(".rn-grid .period").show(); //chnagd for <rdar://problem/20018582> Date Widget Disappears
          $(".entityName").show();
          $(".sorticon").show(); //added for <rdar://problem/20018279> Claim Review: Triangles exist with no data underneath
        }
        //alignGrid('claimCountryGrid', self.scope.is_aggregate); ////added for 19727470 UI : Wave - M2 - Claim Review - UI is not proper when navigating between Licensor and Country tab in Claim Review

      },


      '.exportToExcel click':function(el,ev){
          var self = this;
          var tableRowCount=$(".rn-grid > tbody > tr").length;

          if(tableRowCount > 0){
            if( this.scope.appstate.attr('excelOutput')==undefined || !this.scope.appstate.attr('excelOutput'))
            self.scope.appstate.attr("excelOutput",true);
          }else{
            $("#loading_img").hide();
                        // $("#messageDiv").html("<label class='errorMessage'>Data Not Available</label>");
                        // $("#messageDiv").show();
                        // setTimeout(function(){
                        //     $("#messageDiv").hide();
                        // },4000);
            commonUtils.showErrorMessage("Data Not Available");
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
                //console.log("User clicked on  search");
                this.scope.attr("isfromDashBoard",false);
                getClaimReviewData(tabView,self.scope);
            }
          } else {
            if(this.scope.appstate.attr('globalSearch')==undefined)
              this.scope.appstate.attr('globalSearch',true);
              this.scope.attr("isfromDashBoard",false);
            this.scope.attr("localGlobalSearch", this.scope.appstate.attr('globalSearch'));
          }
      }
    }
});


var getClaimReviewData = function(tabView, self) {
   commonUtils.hideUIMessage();
  var claimLicSearchRequest = getClaimReviewRequest(tabView,self);
  $("#loading_img").show();
  if (tabView == "licensor") {
    claimLicensorInvoices.findOne(UserReq.formRequestDetails(claimLicSearchRequest), function(values) {
      //console.log("data is "+JSON.stringify(values.attr()));
      if (values["status"] != "FAILURE") {

        if (self.appstate.attr('excelOutput')) {
          $("#loading_img").hide();
          $('#exportExcel').html(stache('<export-toexcel csv={values}></export-toexcel>')({
            values
          }));
          self.appstate.attr("excelOutput", false);
        } else {
          /*
          $("#messageDiv").html("<label class='successMessage'>"+values["responseText"]+"</label>");
          $("#messageDiv").show();
          setTimeout(function(){
              $("#messageDiv").hide();
          },4000);
          */
          if(values["responseText"].indexOf("No Data found") > -1 || values["responseCode"] == "IN1015"){
            commonUtils.showSuccessMessage(values["responseText"]);
          }
          self.attr('licensorRecordsAvailable', values.recordsAvailable);
          if (parseInt(claimLicSearchRequest["offset"]) == 0) {
            self.allClaimLicensorMap.replace(values);
          } else {
            $.merge(self.allClaimLicensorMap[0].reviews, values.reviews);
            self.allClaimLicensorMap.replace(self.allClaimLicensorMap);
          }
        }
      } else {

        //if(values["responseText"]=="No data found"){
            commonUtils.showSuccessMessage(values["responseText"]);
          //}
        $("#loading_img").hide();
        // $("#messageDiv").html("<label class='errorMessage'>" + values["responseText"] + "</label>");
        // $("#messageDiv").show();
        // setTimeout(function() {
        //   $("#messageDiv").hide();
        // }, 4000);
        commonUtils.showErrorMessage(values["responseText"]);
      }
    }, function(xhr) {
      $("#loading_img").hide();
      self.appstate.attr("excelOutput", false);
      console.error("Error while loading: " + xhr);
    });
    //self.attr('populateDefaultDataForLicensor', false);
  } else if (tabView == "country" || tabView == "country-aggregate") {
    claimCountryInvoices.findOne(UserReq.formRequestDetails(claimLicSearchRequest), function(values) {
      //console.log("data is "+JSON.stringify(values.attr()));
      if (values["status"] != "FAILURE") {
        if (self.appstate.attr('excelOutput')) {
          $("#loading_img").hide();
          $('#exportExcel').html(stache('<export-toexcel csv={values}></export-toexcel>')({
            values
          }));
          self.appstate.attr("excelOutput", false);
        } else {
          /*
          $("#messageDiv").html("<label class='successMessage'>"+values["responseText"]+"</label>");
          $("#messageDiv").show();
          setTimeout(function(){
              $("#messageDiv").hide();
          },4000);
          */
          if(values["responseText"].indexOf("No Data found") > -1){
            commonUtils.showSuccessMessage(values["responseText"]);
          }
          self.attr('countryRecordsAvailable', values.recordsAvailable);
          if (parseInt(claimLicSearchRequest["offset"]) == 0) {
            self.allClaimCountryMap.replace(values);
          } else {
            $.merge(self.allClaimCountryMap[0].reviews, values.reviews);
            self.allClaimCountryMap.replace(self.allClaimCountryMap);
          }
        }
      } else {


        $("#loading_img").hide();
        // $("#messageDiv").html("<label class='errorMessage'>" + values["responseText"] + "</label>");
        // $("#messageDiv").show();
        // setTimeout(function() {
        //   $("#messageDiv").hide();
        // }, 4000);
        commonUtils.showErrorMessage(values["responseText"]);
      }

    }, function(xhr) {
      $("#loading_img").hide();
      self.appstate.attr("excelOutput", false);
      console.error("Error while loading: " + xhr);
    });
    //self.attr('populateDefaultDataForCountry', false);
  }
}


var getClaimReviewRequest = function(tabView,self) {
var appstate = self.appstate;
  // if(self.populateDefaultData){
  //     appstate = commonUtils.getDefaultParameters(appstate);
  //   }
 var periodFrom = appstate.periodFrom;
  var periodTo = appstate.periodTo;
  var serTypeId = appstate.storeType;
  var regId = appstate.region;
  var countryId = appstate.country.attr();
  var licId = appstate.licensor.attr();
  var periodType=appstate.periodType;
  if(self.isfromDashBoard){
    //if it is different page  then set the parameters from appstate
    //var localObj=appstate.pageLocalParm.pop(); //always take the first element. This will remove the consumed element from array.
    var localObj=appstate.screenLookup.pageLocalParm[0];
    if(localObj.fromPage === "dashboard-Payment"){
      countryId=[localObj.contryName];
      licId=[localObj.entityId];
    }
    appstate.screenLookup.ispagelocal=false;
  }
  var contGrpId = appstate.contentType.attr();
  var periodType = appstate.periodType;

  var claimLicSearchRequest = {};
  //claimLicSearchRequest.searchRequest = {};
  if (typeof(periodFrom) == "undefined")
    claimLicSearchRequest["periodFrom"] = "";
  else
    claimLicSearchRequest["periodFrom"] = periodFrom;

  if (typeof(periodTo) == "undefined")
    claimLicSearchRequest["periodTo"] = "";
  else
    claimLicSearchRequest["periodTo"] = periodTo;

  if (typeof(serTypeId) == "undefined")
    claimLicSearchRequest["serviceTypeId"] = "";
  else
    claimLicSearchRequest["serviceTypeId"] = serTypeId['id'];

  if (typeof(regId) == "undefined")
    claimLicSearchRequest["regionId"] = "";
  else
    claimLicSearchRequest["regionId"] = regId['id'];

  claimLicSearchRequest["country"] = [];
  if (typeof(countryId) != "undefined")
  //claimLicSearchRequest.searchRequest["country"].push(countryId['value']);
    claimLicSearchRequest["country"] = countryId;

  claimLicSearchRequest["entityId"] = [];
  if (typeof(licId) != "undefined")
    claimLicSearchRequest["entityId"] = licId;

  claimLicSearchRequest["contentGrpId"] = [];
  if (typeof(contGrpId) != "undefined")
    claimLicSearchRequest["contentGrpId"] = contGrpId;

  if(periodType == undefined){
    periodType='P';
  }
  claimLicSearchRequest["periodType"] = periodType;

  claimLicSearchRequest["status"] = "";

  if (tabView == "licensor")
    claimLicSearchRequest["offset"] = self.licensorViewOffset;
  else
    claimLicSearchRequest["offset"] = self.countryViewOffset;

  claimLicSearchRequest["limit"] = self.appstate.attr("fetchSize");

  if (self.appstate.attr('excelOutput')) claimLicSearchRequest["excelOutput"] = true;

  claimLicSearchRequest["view"] = self.attr('view');
  claimLicSearchRequest["gridName"] = (tabView === "licensor") ? "CR_LICENSOR_VIEW" : "CR_COUNTRY_VIEW";

  var filterData = self.tokenInput.attr();
  var newFilterData = [];
  if (filterData.length > 0) {
    for (var p = 0; p < filterData.length; p++)
      newFilterData.push(filterData[p]["name"]);
  }
  claimLicSearchRequest["filter"] = newFilterData;

  claimLicSearchRequest["sortBy"] = self.sortColumns.attr().toString();
  claimLicSearchRequest["sortOrder"] = self.attr('sortDirection');
  return claimLicSearchRequest;

}

/* generateTableData - This function is used to convert the reponse json in to a format accepted by Grid */
/* This function calls 'generateFooterData' function to format the footer data accepted by grid */
/* Two parameters
   "invoiceData" - holds the data for Table body,
    "footerData" - holds the data for Table footer,
*/
var generateTableData = function(invoiceData,footerData){
  //console.log("invoiceData is "+JSON.stringify(invoiceData));
  var gridData = {"data":[], "footer":[]};
  var aggregateFlag=false;
  //rdar://problem/20018279> -start
  if($("#chkAggregate").is(':visible') && $("#chkAggregate").is(":checked")){
    aggregateFlag=true;
  }
  //rdar://problem/20018279> -end
        for(var i=0;i<invoiceData.length;i++){
            var invTemp = {};
            invTemp["entityId"] = invoiceData[i]["entityId"]+","+ invoiceData[i]["entityName"];
            invTemp["__isChild"] = false;
            invTemp["hasChild"] = true;
            invTemp["entityName"] = (invoiceData[i]["entityName"]==null)?"":invoiceData[i]["entityName"];
            invTemp["invoiceNumber"] = "";
            invTemp["currency"] = invoiceData[i]["currency"];

            invTemp["period"] = "";
            invTemp["country"] = "";
            invTemp["contentType"] = "";
            invTemp["invoiceAmount"] = CurrencyFormat(invoiceData[i]["invoiceAmount"]);
            invTemp["overrepAmount"] = (invoiceData[i]["overrepAmount"])==null?0.00:CurrencyFormat(invoiceData[i]["overrepAmount"]);
            invTemp["lineDisputeAmount"] = (invoiceData[i]["lineDisputeAmount"])==null?0.00:CurrencyFormat(invoiceData[i]["lineDisputeAmount"]);
            invTemp["reconAmount"] = CurrencyFormat(invoiceData[i]["reconAmount"]);
            invTemp["oaAllocated"] = CurrencyFormat(invoiceData[i]["oaAllocated"]);
            invTemp["caAllocated"] = CurrencyFormat(invoiceData[i]["caAllocated"]);
            invTemp["balance"] = "";
            invTemp["priorPaid"] = CurrencyFormat(invoiceData[i]["priorPaid"]);
            invTemp["invPmtSaturation"] = CurrencyFormat(invoiceData[i]["invPmtSaturation"]);
            invTemp["pmtSaturation"] = CurrencyFormat(invoiceData[i]["pmtSaturation"]);
            invTemp["overrepDispPer"] = CurrencyFormat(invoiceData[i]["overrepDispPer"]);
            invTemp["liDispPer"] = CurrencyFormat(invoiceData[i]["liDispPer"]);
            invTemp["status"] = "";

            gridData.data.push(invTemp);

            var insertedId = gridData.data.length-1;
            //console.log("jfsdhfjshj is "+invoiceData[i]["claimReviewLicDetails"]);
            var invoiceLineItems = invoiceData[i]["reviewDetails"];

            var contentTypeArr = [], countryArr = [] , invoiceNumberArr = [], licensorTypeArr = [];
             var lowestPeriod = 0;
              var highestPeriod = 0;
              var tmpPeriod = 0;
              var hasChild=true;

            if(invoiceLineItems.length > 0){
              if(invoiceLineItems.length > 1){
                for(var j=0;j<invoiceLineItems.length;j++){
                  var invLITemp={};
                  var periodType = invoiceLineItems[j]["periodType"];
                  if(periodType == null || periodType == undefined ||(periodType !=null && periodType.length ==0)){
                    periodType='P';
                  }

                  invLITemp["entityId"] = invTemp["entityId"]+","+  invTemp["entityName"] ;
                  invLITemp["__isChild"] = true;
                  invLITemp["entityName"] = "";
                  invLITemp["invoiceNumber"] = invoiceLineItems[j]["invoiceNumber"];
                  invLITemp["currency"] = invTemp["currency"];

                  var period = invoiceLineItems[j]["period"];

                  invLITemp["period"] = "";
                  invTemp["period"] = invoiceLineItems[j]["period"];

                  invLITemp["country"] = invoiceLineItems[j]["countryId"];
                  invLITemp["contentType"] = invoiceLineItems[j]["contentTypeName"];

                  invLITemp["invoiceAmount"] = CurrencyFormat(invoiceLineItems[j]["invoiceAmount"]);

                  invLITemp["overrepAmount"] = (invoiceLineItems[j]["overrepAmount"])==null?0.00:CurrencyFormat(invoiceLineItems[j]["overrepAmount"]);

                  invLITemp["lineDisputeAmount"] = (invoiceLineItems[j]["lineDisputeAmount"])==null?0.00:CurrencyFormat(invoiceLineItems[j]["lineDisputeAmount"]);

                  invLITemp["reconAmount"] = CurrencyFormat(invoiceLineItems[j]["reconAmount"]);

                  invLITemp["oaAllocated"] = CurrencyFormat(invoiceLineItems[j]["oaAllocated"]);

                  invLITemp["caAllocated"] = CurrencyFormat(invoiceLineItems[j]["caAllocated"]);

                  invLITemp["balance"] = (invoiceLineItems[j]["balance"]==null)?0:CurrencyFormat(invoiceLineItems[j]["balance"]);

                  invLITemp["priorPaid"] = CurrencyFormat(invoiceLineItems[j]["priorPaid"]);

                  invLITemp["invPmtSaturation"] = CurrencyFormat(invoiceLineItems[j]["invPmtSaturation"]);

                  invLITemp["pmtSaturation"] = CurrencyFormat(invoiceLineItems[j]["pmtSaturation"]);

                  invLITemp["overrepDispPer"] = (invoiceLineItems[j]["overrepDispPer"]==null)?0.00:CurrencyFormat(invoiceLineItems[j]["overrepDispPer"]);

                  invLITemp["liDispPer"] = (invoiceLineItems[j]["liDispPer"]==null)?0.00:CurrencyFormat(invoiceLineItems[j]["liDispPer"]);

                  invLITemp["status"] = getInvoiceStatus(invoiceLineItems[j]["status"]);
                  invTemp["status"] = invLITemp["status"];

                  //added for licensor
                  invLITemp["entityName"] = invoiceLineItems[j]["entityName"];
                  //end

                  if(period != undefined && period > 0){
                      invLITemp["period"] = periodWidgetHelper.getDisplayPeriod(period,periodType);
                      if(lowestPeriod==0 && highestPeriod == 0){
                        lowestPeriod=Number(period);
                        highestPeriod=Number(period);
                      }
                      tmpPeriod = Number(period);
                      if (tmpPeriod < lowestPeriod) lowestPeriod = tmpPeriod;
                      if (tmpPeriod > highestPeriod) highestPeriod = tmpPeriod;
                    }else if(period == 0){
                      invLITemp["period"] = '';
                    }

                  if(invLITemp["contentType"]!= undefined && invLITemp["contentType"].indexOf('TAX') == -1){
                      contentTypeArr.push(invLITemp["contentType"]);
                  }
                  if(invLITemp["country"] != undefined && typeof(invLITemp["country"]) != 'null'){
                    countryArr.push(invLITemp["country"]);
                  }

                  if(invLITemp["entityName"] != undefined && typeof(invLITemp["entityName"]) != 'null'){
                    licensorTypeArr.push(invLITemp["entityName"]);
                  }

                  invoiceNumberArr.push(invLITemp["invoiceNumber"]);
                  //rdar://problem/20018279> -start
                  if(!aggregateFlag){
                    gridData.data.push(invLITemp);
                  }
                  //rdar://problem/20018279> -end
                }
              }else{
                if(invoiceLineItems.length == 1){
                  hasChild=false;
                  var contentType=invoiceLineItems[0]["contentTypeName"];
                  var country=invoiceLineItems[0]["countryId"];
                  var entityName=invoiceLineItems[0]["entityName"];
                  if(contentType != undefined && contentType.indexOf('TAX') == -1){
                      contentTypeArr.push(contentType);
                  }
                  if(country != undefined && typeof(country) != 'null'){
                    countryArr.push(country);
                  }

                  if(entityName != undefined && typeof(entityName) != 'null'){
                    licensorTypeArr.push(entityName);
                  }

                  invoiceNumberArr.push(invoiceLineItems[0]["invoiceNumber"]);

                  var period = invoiceLineItems[0]["period"];
                  lowestPeriod=highestPeriod=period;
                  gridData.data[insertedId]["periodNo"]=period;
                  gridData.data[insertedId]["periodType"]=periodType;
                }
              }

            }
            //rdar://problem/20018279> -start
            if(aggregateFlag){
              hasChild=false;
            }
            //rdar://problem/20018279> -end
            //console.log("gridData is ffsdfs "+JSON.stringify(gridData));
            //console.log("countryArr is ffsdfs "+JSON.stringify(countryArr));

            /*Below function is to remove the duplicate content type and find the count */
            contentTypeArr = contentTypeArr.filter( function( item, index, inputArray ) {
                   return inputArray.indexOf(item) == index;
            });
            if(contentTypeArr.length>1){
              gridData.data[insertedId]["contentType"] = (contentTypeArr.indexOf('TAX')!== -1)?(contentTypeArr.length-1)+" content types":contentTypeArr.length+" content types";
            }
            else if(contentTypeArr.length==1)
              gridData.data[insertedId]["contentType"] = contentTypeArr[0];


              /*Below function is to remove the duplicate Licensor and find the count */
              licensorTypeArr = licensorTypeArr.filter( function( item, index, inputArray ) {
                     return inputArray.indexOf(item) == index;
              });

              if(licensorTypeArr.length>1){

                gridData.data[insertedId]["entityName"] = (licensorTypeArr.indexOf('TAX')!== -1)?(licensorTypeArr.length-1)+" Licensors":licensorTypeArr.length+" Licensors";
              }
              else if(licensorTypeArr.length==1)
                gridData.data[insertedId]["entityName"] = licensorTypeArr[0];
                //end

            /*Below function is to remove the duplicate country and find the count */
            countryArr = countryArr.filter( function( item, index, inputArray ) {
              return inputArray.indexOf(item) == index;
            });
            if(countryArr.length>1){
              gridData.data[insertedId]["country"] = (contentTypeArr.indexOf('TAX')!== -1)?(countryArr.length-1)+" Countries":countryArr.length+ " Countries";
            }
            else if(countryArr.length==1)
              gridData.data[insertedId]["country"] = countryArr[0];

            if(lowestPeriod != undefined && highestPeriod != undefined){
              gridData.data[insertedId]["period"] = periodWidgetHelper.getDisplayPeriod(lowestPeriod,periodType);
              if(lowestPeriod != highestPeriod){
                gridData.data[insertedId]["period"] = periodWidgetHelper.getDisplayPeriod(lowestPeriod,periodType)+' - '+periodWidgetHelper.getDisplayPeriod(highestPeriod,periodType);
              }
            }


            invoiceNumberArr = $.unique(invoiceNumberArr);
             if(invoiceNumberArr.length==1){
              gridData.data[insertedId]["invoiceNumber"] = invoiceNumberArr[0];
             }
             gridData.data[insertedId]["hasChild"] = hasChild;
          }
          var footerJson = {"entityId":"","__isChild":false,
          "entityName":"Total in Regional Currency (EUR)","invoiceNumber":"","currency":"","period":"","country":"","contentType":"","invoiceAmount":"350000","overrepAmount":"20000","lineDisputeAmount":"40000","reconAmount":"30000","oaAllocated":"2000","caAllocated":"2000","balance":"76",
          "priorPaid":"0","invPmtSaturation":"","pmtSaturation":"","overrepDispPer":"","liDispPer":"","status":""};
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
    footTemp["invoiceNumber"] = footerData["invoiceCount"]+ " Invoices";
    footTemp["currency"] = footerData["currency"];
    footTemp["period"] = "";
    footTemp["country"] = "";
    footTemp["contentType"] = "";
    footTemp["invoiceAmount"] = CurrencyFormat(Number(footerData["invoiceAmount"]));
    footTemp["overrepAmount"] = CurrencyFormat(Number(footerData["overrepAmount"]));
    footTemp["lineDisputeAmount"] = CurrencyFormat(Number(footerData["lineDisputeAmount"]));
    footTemp["reconAmount"] = CurrencyFormat(Number(footerData["reconAmount"]));
    footTemp["oaAllocated"] = CurrencyFormat(Number(footerData["oaAllocated"]));
    footTemp["caAllocated"] = CurrencyFormat(Number(footerData["caAllocated"]));
    footTemp["balance"] = 0;
    footTemp["priorPaid"] = CurrencyFormat(Number(footerData["priorPaid"]));
    footTemp["invPmtSaturation"] = 0.00;
    footTemp["pmtSaturation"] = 0.00;
    footTemp["overrepDispPer"] = "";
    footTemp["liDispPer"] = "";
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
      footLITemp["invoiceAmount"] = CurrencyFormat(Number(footerLineItems[i]["invoiceAmount"]));
      footLITemp["overrepAmount"] = CurrencyFormat(Number(footerLineItems[i]["overrepAmount"]));
      footLITemp["lineDisputeAmount"] = CurrencyFormat(Number(footerLineItems[i]["lineDisputeAmount"]));
      footLITemp["reconAmount"] = CurrencyFormat(Number(footerLineItems[i]["reconAmount"]));
      footLITemp["oaAllocated"] = CurrencyFormat(Number(footerLineItems[i]["oaAllocated"]));
      footLITemp["caAllocated"] = CurrencyFormat(Number(footerLineItems[i]["caAllocated"]));
      footLITemp["balance"] = 0.00;
      footLITemp["priorPaid"] = CurrencyFormat(Number(footerLineItems[i]["priorPaid"]));
      footLITemp["invPmtSaturation"] = 0.00;
      footLITemp["pmtSaturation"] = 0.00;
      footLITemp["overrepDispPer"] = "";
      footLITemp["liDispPer"] = "";
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
      return "0.00";
    }
}
function getInvoiceStatus(invStatus){
//     Invoice Status
// 0 - unpaid (payment amount is zero)
// 1 - partial
// 5 - paid (invoice completely paid out)
// 8 - temporarily inactive or invoice not yet available to RINS processes
// 9 - deleted ;
var status ="";
  if(invStatus != undefined && invStatus != null){
    status = (invStatus == 5) ? "Closed":"Open";
  }
  return status;
}
function alignGrid(divId, is_aggregate){
/*  console.log("&&&&&&&&&&&&&&Align Grid Called &&&&&&&&&&&");
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
  }*/
}

function getVisibleGridHeight(){
  if($('#licensorView').is(':visible')){
    return gridUtils.getTableBodyHeight('claimLicencorGrid',100);
  }else if($('#countryView').is(':visible')){
    return gridUtils.getTableBodyHeight('claimCountryGrid',100);
  }else{
    return 400; //default height
  }
}

function refreshSearchOnfilter(self){
  self.scope.attr("offset", 0);  /* Search criteria changes. So making offset 0 */
   if(self.scope.appstate.attr('globalSearch')){
      self.scope.appstate.attr('globalSearch', false);
    }else{
      self.scope.appstate.attr('globalSearch', true);
    }
}

export default page;
