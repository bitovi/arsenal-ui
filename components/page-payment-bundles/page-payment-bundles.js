import _ from 'lodash';
import Component from 'can/component/';
import Map from 'can/map/';
import can from 'can/';
import stache from 'can/view/stache/';

// Models
import PaymentBundle from 'models/payment-bundle/';


// Components
import PaymentBundleGrid from 'components/bundle-grid/';
import PaymentBundleDetail from 'components/bundle-detail/';
import PbrRemoveGroupsModal from 'components/pbr-remove-groups-modal/';

import commonUtils from 'utils/commonUtils';

import template from './template.stache!';
import styles from './page-payment-bundles.less!';


import exportToExcel from 'components/export-toexcel/';
import copy from 'components/copy-clipboard/';

var pageState = new Map({
  bundles: new PaymentBundle.List([]),
  selectedBundle: null,
  verboseGrid: false,
  validationGrid:false,
  isPaginateReq: false,//triggers the paginate Event from bundle-grid.js
  recordsAvailable:undefined,
  totRecCnt:0,
  refreshBottomGrid:false,
  loadedFromDetails:undefined
});

var page = Component.extend({
  tag: 'page-payment-bundles',
  template: template,
  scope: {
    appstate: null, // will be passed in
    pageState: pageState,
    isPageSearch: undefined,//To controll Gloable search
    invoiceRowsSelected: [],
    paginateAttr:{
      offset: 0,
      sortBy: [],
      sortDirection: "asc"
    },
    refreshBundles: _.debounce(function() {
      var self=this;


      if(pageState.attr("isPaginateReq")){

        this.scope.paginateAttr.attr('offset',  this.scope.paginateAttr.attr('offset')+1);

        this.scope.appstate.attr('excelOutput',false);

        PaymentBundle.loadAll({appstate: this.scope.appstate, paginate: this.scope.paginateAttr}).done(function(data) {

          if(data.status === 'SUCCESS'){

            can.batch.start();

            $.merge(pageState.bundles, data.paymentBundles);

            pageState.bundles.replace(pageState.bundles);

            pageState.attr("recordsAvailable",data.recordsAvailable);
            pageState.attr("totRecCnt",data.totRecCnt);


            can.batch.stop();
          }else{
            commonUtils.displayUIMessage( data.status, data.responseText);
          }

        });

        pageState.attr("isPaginateReq",false);



      }else{
        if(this.scope.isPageSearch != this.scope.appstate.globalSearch) {
          commonUtils.hideUIMessage();
          pageState.attr("totRecCnt",0);

          this.scope.appstate.attr('excelOutput',false);
          this.scope.paginateAttr.attr('offset',  0);

          var lookForBundle = undefined;
          if(this.scope.appstate.screenLookup.PBR != undefined){
            lookForBundle = this.scope.appstate.screenLookup.PBR.bundleId;
          }

          resetGrids(pageState);

          this.scope.isPageSearch  = this.scope.appstate.globalSearch;
          PaymentBundle.loadAll ({appstate: this.scope.appstate,paginate: this.scope.paginateAttr, lookForBundle : lookForBundle}).done(function(data) {

            if(data.status === 'SUCCESS'){
              var bundleLookupNeeded = false;
              can.batch.start();
              pageState.bundles.splice(0, pageState.bundles.length);
              pageState.bundles.replace(data.paymentBundles);
              pageState.attr("recordsAvailable",data.recordsAvailable);
              pageState.attr("totRecCnt",data.totRecCnt);
              bundleLookupNeeded = true;
              can.batch.stop();

              if(bundleLookupNeeded && lookForBundle != undefined){

                  self.scope.pageState.attr("loadedFromDetails",self.scope.appstate.screenLookup.PBR);
                  self.scope.appstate.screenLookup.attr("PBR",undefined);

                  $(".visible").click();
              }else{
                self.scope.pageState.attr("loadedFromDetails",undefined);
              }

            }else{
              commonUtils.displayUIMessage( data.status, data.responseText);
              self.scope.appstate.screenLookup.attr("PBR",undefined);
            }

          });


        }
        // else {
        //   if(!this.scope.appstate.excelOutput){
        //
        //     resetGrids(pageState);
        //
        //   }
        // }
      }

    }, 200)
  },
  helpers: {
    showPage: function(options) {
    //  return options.fn(this);
      // if(this.appstate.attr('globalSearch')) {
      //
      // } else {
      //   return '';
      // }
    },
     allowAddInvoices:function(){
      return this.pageState.attr("selectedBundle") !=null  && this.pageState.attr("selectedBundle.editable") ? '' : 'disabled';
    },
    allowRemoveInvoices:function(){
      return (this.invoiceRowsSelected.attr('length') > 0  && this.pageState.attr("selectedBundle.editable")   && this.pageState.attr("selectedBundle.bundleType") !== 'ON_ACCOUNT' ) ? '' : 'disabled';
    }
  },
  events: {
    'inserted': function(ev, el) {
      this.scope.appstate.attr('renderGlobalSearch', true);
      this.scope.appstate.attr('excelOutput',false);
    //  this.scope.refreshBundles.apply(this);
     commonUtils.triggerGlobalSearch();
    },
    '{scope} change': function(scope, ev, attr) {
      var self=this;

      if(self.scope.pageState.attr("isPaginateReq")){
        this.scope.refreshBundles.apply(this);
      }

      if(attr.substr(0, 8) === 'appstate') {

        this.scope.refreshBundles.apply(this);
      }
    },
    '.add-invoice click': function(el, ev) {
      if(this.scope.pageState.selectedBundle.bundleType === 'ON_ACCOUNT'){
        commonUtils.navigateTo("on-account");
      }else{
        commonUtils.navigateTo("invoices");
      }
    },
    '.remove-invoice click': function(el, ev) {
      PbrRemoveGroupsModal.displayModal(this.scope);
    },
    '.excel click': function(el, ev) {
      var self = this;

      // self.scope.appstate.attr('excelOutput', true);

      // if(this.scope.appstate.excelOutput ) {

      //    PaymentBundle.loadAll({appstate: this.scope.appstate}).then(function(data) {
      //       if(data["status"]=="0000"){
      //           $('#exportExcel').html(stache('<export-toexcel csv={data}></export-toexcel>')({data}));
      //      }
      //    },function(err){
      //       console.log(err);
      //   });
      //  }

    },
    '.clipboard click': function(el, ev) {
      // copy bundle list information to clipboard
       $('#clonetable').empty().html($('#payBundleGrid').find('table:visible').clone(true).attr('id','dynamic'));
         $('copy-clipboard').slideDown(function(){
           $('body').css('overflow','hidden');
           $('#copyall').trigger('click');
        });
    },
    '#highChartDetails mousedown': function(item, el, ev){
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
    '#highChartDetails mouseup': function(item, el, ev){
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
    '{scope.pageState} refreshBottomGrid': function() {
      //console.log("Own change event: "+this.scope.invoiceRowsSelected.attr('length'));
      this.scope.invoiceRowsSelected.attr('length') > 0 ? $('.remove-invoice').prop('disabled', true) : "";
    }

  }
});

var resetGrids = function(pageState){
  //Reset the grid
  can.batch.start();
  pageState.bundles.splice(0, pageState.bundles.length);
  pageState.attr('selectedBundle', null);
  can.batch.stop();
}


export default page;
