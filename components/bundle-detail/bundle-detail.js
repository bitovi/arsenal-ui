import _ from 'lodash';
import jqueryui from 'jqueryui';
import jqueryuicorecss from 'jqueryui_core.css!';
import jqueryuidialogcss from 'jqueryui_dialog.css!';

import Component from 'can/component/';
import List from 'can/list/';
import Map from 'can/map/';
import stache from 'can/view/stache/';
import moment from 'moment';

import information_template from './pbr-information.stache!';
import PaymentBundleDetailGroup from 'models/payment-bundle/payment-bundle-detail-group';
import PaymentBundleDetail from 'models/payment-bundle/payment-bundle-detail';
import WorkflowStep from 'models/workflow-step/';
import PaymentBundle from 'models/payment-bundle/';

import BundleDetailGrid from 'components/bundle-detail-grid/';
import Switcher from 'components/switcher/';
import WorkflowDisplay from 'components/workflow-display/';
import PbrDeleteConfirmModal from 'components/pbr-delete-confirm-modal/';

import Alert from 'components/alert/';
import highchartpage from 'components/highchart/';
import Currency from 'models/common/currency/';

import columnSets from './column-sets';
import constants from 'utils/constants';
import formats from 'utils/formats';

import template from './template.stache!';
import _less from './bundle-detail.less!';

import tokeninput from 'tokeninput';
import css_tokeninput from 'tokeninput.css!';
import css_tokeninput_theme from 'tokeninput_theme.css!';
import commonUtils from 'utils/commonUtils';


var VALIDATION_CHECK_INTERVAL = 3000;

var bundleTypeColumnSets = {
  'REGULAR_INV': [
  {
    value: 'licensor',
    text: 'Licensor',
    columns: columnSets.regularLicensor
  },
  {
    value: 'country',
    text: 'Country',
    columns: columnSets.regularCountry
  }
  ],
  'ON_ACCOUNT': [
    {
      value: 'licensor',
      text: 'Licensor',
      columns: columnSets.onAccount
    }
  ],
  'ADHOC_INV': [
  {
    value: 'licensor',
    text: 'Licensor',
    columns: columnSets.adHoc
  }
  ]
};


var tokenInput = [];

var paginateAttr =   new Map({
  offset: 0,
  sortBy: [],
  sortDirection: "asc",
  recordsAvailable: false,
  paginateRequest:false,// to know the paginateRequest is needed.
  isInProgress:false//Local attr to track the Paginate is in progress
});

var BundleDetailTabs = Component.extend({
  tag: 'rn-bundle-detail',
  template: template,
  scope: {
    appstate: null, // passed in
    pageState: null, // passed in
    tabs: [],
    selectedTab: null,
    aggregatePeriod: false,
    paymentType: 2,
    preferredCurr:'',
    approvalComment: '',
    bottomGridPaginateAttr: paginateAttr,
    isBundlePrioritySet:false,
    sortColumns: [],
    sortDirection: 'asc',
    details:{},
    regionCurr:[],
    havePaymentTypeAndComment: function(scope) {
      return  (this.appstate.userInfo.roleIds.indexOf(constants.ROLES.BM) > -1 ? scope.paymentType : true) &&
      scope.approvalComment.trim().length;
    },
    renderInfor:function(){
      return information_template();
    },

    gridColumns: [],
    selectedRows: [],


    workflowSteps: new WorkflowStep.List([]),
    bundleProgress:{
      //To controll the multiple get calls when the tab changed
      isBundleSelectionChange: false,
      triggerValidation:false
    },
    selectedBundleChanged: function(scope) {

      scope.details ={};
      scope.bundleProgress.isBundleSelectionChange = true;
      scope.bundleProgress.triggerValidation = true;
      scope.appstate.excelOutput = false;

      var selectedBundle = scope.pageState.selectedBundle;
      if(!selectedBundle) {
        return;
      }

      resetSelectedBundle(scope);



      scope.getNewDetails(selectedBundle)
      .then(function(bundle) {
        return WorkflowStep.loadWorkFlowView({
          workflowInstanceId: bundle.approvalId
        });
      }).done(function(steps) {
        //console.log(JSON.stringify(steps.workflowView.nodes))
        scope.workflowSteps.splice(0, scope.workflowSteps.length);
        scope.workflowSteps.replace(steps.workflowView.nodes);
      });
      scope.bundleProgress.isBundleSelectionChange = false;
    },

    gettingDetails: false,
    getNewDetails: function(bundle) {

      if(this.bottomGridPaginateAttr.attr("paginateRequest")){
        //By setting the paginateRequest to false confirms the request is completed.
        this.bottomGridPaginateAttr.attr("paginateRequest",false);
        var offset = this.bottomGridPaginateAttr.attr("offset") + 1;
        this.bottomGridPaginateAttr.attr("offset",offset);
        this.bundleProgress.triggerValidation = false;
      }else{
        //first time request, by setting this, the grid details will not be shown.
        this.attr('gettingDetails', true);
        this.bottomGridPaginateAttr.attr("offset",0);
      }

      var scope = this;

      var view;
      if(bundle.bundleType === 'REGULAR_INV') {
        view = this.attr('selectedTab').value;
        if(view === 'country' && this.attr('aggregatePeriod')) {
          view = 'aggregated';
        }
      } else {
        view = 'licensor';
      }

      var params = {
        appstate: this.appstate,
        view: view,
        paymentType: this.paymentType,
        filterData: tokenInput,
        paginate: this.bottomGridPaginateAttr,
        preferredCcy: this.preferredCurr
      };

      return bundle.getDetails(params
      ).then(function(bundle) {

        scope.attr('gettingDetails', false);
        scope.bottomGridPaginateAttr.attr("isInProgress",false);

        if(bundle.status === 'FAILURE'){
          commonUtils.displayUIMessage( bundle.responseCode, bundle.responseText);
        }else{
          scope.bundleProgress.triggerValidation ? scope.getNewValidations(bundle) : "";
        }

        var commentsCollected = '';
        _.each(bundle.approvalComments, function(commentsObj) {

          var createdDateFormat = moment(commentsObj.createdDate).format("Do MMM, YYYY");

          commentsCollected = commentsCollected + "-- " + commentsObj.createdByName +" on "+createdDateFormat+" --"+"\n"+commentsObj.comments;
          commentsCollected = commentsCollected + "\n";

        });

        if(commentsCollected !== ''){
          $(".previousComments").val(commentsCollected);
          $(".previousComments").show();
        }


        //set the paymentOption which is shared by service
        bundle.paymentOption != undefined ? scope.attr('paymentType',bundle.paymentOption) : scope.attr('paymentType', 2);



        //<!--rdar://problem/19415830 UI-PBR: Approve/Reject/Recall/Delete should happen only from Licensor Tab-->
        if(bundle.view === 'LICENSOR'){
          $(".allowedClass").show();
        }else{
          $(".allowedClass").hide();
        }

        return bundle;
      });
    },
    getNewValidations: function(bundle) {
      var scope = this;
      scope.bundleProgress.triggerValidation = false;

      if(bundle.status != 1 && !this.appstate.userInfo.roleIds.indexOf(constants.ROLES.BM)){
        return;
      }


      var view;
      if(bundle.bundleType === 'REGULAR_INV') {
        view = this.attr('selectedTab').value;
        if(view === 'country' && this.attr('aggregatePeriod')) {
          view = 'aggregated';
        }
      } else {
        view = 'licensor';
      }

      if('payment-bundles' === scope.appstate.page &&  scope.pageState.selectedBundle === bundle) {
        return bundle.getValidations(view).then(function(bundle) {
          if(bundle.status == 1 && bundle.validationStatus !== 5) {
            setTimeout(function() {
              scope.getNewValidations(bundle);
            }, VALIDATION_CHECK_INTERVAL);
          }else{
            //console.log("validationGrid is true");
            scope.pageState.attr("validationGrid",true);
          }

          return bundle;
        });
      }
    },
    refreshTokenInput: function(val, type){
      var self = this;
      if(type=="Add")
        tokenInput.push(val);
        else if(type=="Delete"){
          var flag=true;
          _.each(tokenInput, function(obj) {
            if(obj != undefined && val.id == obj.id){
              tokenInput.splice(obj.key,1);
            }
          });
        }

      this.getNewDetails(this.pageState.selectedBundle);
    },
    resetToken:  function(){
      var self = this;
      _.each(tokenInput, function(obj) {
        tokenInput.splice(obj.key,1);
      });

      $("li").remove(".token-input-token-facebook");
      $("#token-input-tokenSearch").attr('placeholder', "Search...");

    }
  },
  helpers: {
    currencyFormat: function(val) {
      return formats.currencyFormat(val());
    },
    showAggregateControl: function(options) {
      return this.attr('selectedTab') && this.selectedTab.value === 'country' ? options.fn(this) : '';
    },
    // Info: validationRulesTotal is no more supported by the business service team. Removing the code
    // validationStatus: function(options) {
    //   return this.pageState.selectedBundle && this.pageState.selectedBundle.attr('validationRulesTotal') > 0 ? options.fn(this.pageState.selectedBundle) : '';
    // },
    canShowChart: function(options) {
      if(this.pageState.attr('selectedBundle.bundleType') === 'REGULAR_INV' &&
        this.selectedRows.attr('length') > 0 &&
        _.every(this.attr('selectedRows'), row => row instanceof PaymentBundleDetail)
      ) {
        return options.fn(this);
      } else {
        '';
      }
    },
    showVerboseToggle: function(options) {
      this.gridColumns.attr('length');
      if(_.some(this.attr('gridColumns'), column => column.verboseOnly)) {
        return options.fn(this);
      } else {
        return '';
      }
    },
    isBM: function(options) {
      return this.appstate.userInfo.roleIds.indexOf(constants.ROLES.BM) > -1 ? options.fn(this) : options.inverse(this);
    },
    canProceed: function() {
      this.attr('paymentType'); this.attr('approvalComment');
      return this.havePaymentTypeAndComment(this) ? '' : 'disabled';
    },
    paymentOptionEditable: function() {
      this.attr('paymentType');
      var bundle = this.pageState.selectedBundle;

      return (bundle != undefined && bundle.bundleType === 'REGULAR_INV' && bundle.status == 1 && bundle.editable) ? '' : 'disabled';
    }
  },
  events: {
    '.grid-container table>tbody>tr click':function(item, el, ev){

      var alreadySelRow = item.closest("tbody").find("tr.selected");
      alreadySelRow.toggleClass("selected");

      $(item[0]).toggleClass("selected");
      var row = item.closest('tr').data('row').row;

      var className = item.closest('tr').hasClass("child");

      this.scope.details["countryId"]=row.country || "";
      this.scope.details["requestFrom"]=$(".switcher li.selected").text();
      this.scope.details["licensorId"]=row.entityName || "";
      this.scope.details["fiscalPeriod"]=row.fiscalPeriod || "";
      this.scope.details["periodType"]=row.periodType || "";
      this.scope.details["contentType"]=row.contentGrpName || "";
      this.scope.details["isChild"]=className;
    },
    ".rn-grid>thead>tr>th:gt(0) click": function(item, el, ev){
      var self=this;
      var val = $(item[0]).attr("class").split(" ");
      var columns = columnSets.unsortable;

      if(_.contains(columns,val[0])){
        console.log("Not require to sort");
        return false;
      }

      var existingSortColumns =self.scope.bottomGridPaginateAttr.sortBy;
      var existingSortColumnsLen = existingSortColumns.length;
      var existFlag = false;
      if(existingSortColumnsLen==0){
        self.scope.bottomGridPaginateAttr.attr('sortBy').push(val[0]);
      } else {
        _.contains(existingSortColumns, val[0]) ? existFlag = true : existFlag = false;
        if(!existFlag){
          self.scope.bottomGridPaginateAttr.sortBy.splice(0, self.scope.bottomGridPaginateAttr.sortBy.length);
          self.scope.bottomGridPaginateAttr.attr('sortBy').push(val[0]);
          self.scope.bottomGridPaginateAttr.attr('sortDirection', "asc");
        } else {
          var sortDirection = (self.scope.bottomGridPaginateAttr.attr('sortDirection') == 'asc') ? 'desc' : 'asc';
          self.scope.bottomGridPaginateAttr.attr('sortDirection', sortDirection);
        }
      }
      console.log(self.scope.bottomGridPaginateAttr.sortBy);
      //commonUtils.triggerGlobalSearch();
      self.scope.getNewDetails(self.scope.pageState.selectedBundle);

      /* The below code calls {scope.appstate} change event that gets the new data for grid*/
      /* All the neccessary parameters will be set in that event */
      // self.scope.appstate.attr('globalSearchButtonClicked', true);
      // if(self.scope.appstate.attr('globalSearch')){
      //   self.scope.appstate.attr('globalSearch', false);
      // }else{
      //   self.scope.appstate.attr('globalSearch', true);
      // }

    },
    '.show-chart click': function(el, ev) {
      // show the chart
      //{"requestFrom":"Licensor","licensorId":"CELAS","countryId":"GBR","fiscalPeriod":201307,"periodType":"P","contentType":"Music"}
      if(this.scope.details.isChild && this.scope.details.contentType !== "TAX"){
        var data = this.scope.details;
        console.log("chart data");console.log(data);
        //$("#chartContainer").addClass("highcharts_Overlay");
        $("#highChartDetails").append(stache('<high-chart details={data}></high-chart>')({data}));
      }else{
        console.log('Data not set so not showing the chart');
        if (this.scope.details.contentType === "TAX") {
          commonUtils.displayUIMessage( '0001', "Reports not available for TAX");
        }else{
          commonUtils.displayUIMessage( '0001', "select child row in the details to see the report");
        }
      }
    },
    '.excell click': function(el, ev) {
      // export data to Excel

      var self = this;
      self.scope.appstate = self.scope.pageState.selectedBundle;
      self.scope.appstate.attr('excelOutput', true);
      self.scope.appstate.attr('detail', true);
      if(this.scope.appstate.excelOutput ) {
        var view;
        if(this.scope.pageState.selectedBundle.bundleType === 'REGULAR_INV') {
          view = this.scope.attr('selectedTab').value;
          if(view === 'country' && this.attr('aggregatePeriod')) {
            view = 'aggregated';
          }
        } else {
          view = 'licensor';
        }

        var params = {
          appstate: this.scope.appstate,
          view: view,
          paymentType: this.scope.paymentType,
          preferredCcy: this.scope.preferredCurr
        };
        PaymentBundle.findOne(params).then(function(data) {
          console.log(data);
         if (data != undefined && data["status"] == "SUCCESS" && data["exportExcelFileInfo"] != null) {
            $('#exportExcel').html(stache('<export-toexcel csv={data}></export-toexcel>')({data}));
          }
          self.scope.appstate.attr("excelOutput",false);
          self.scope.appstate.attr('detail',false);
        },function(err){
          console.log(err);
          self.scope.appstate.attr("excelOutput",false);
          self.scope.appstate.attr('detail',false);
        });
      }
    },
    '.clipboardd click': function(el, ev) {
      // copy data to the clipboard
       $('#clonetable').empty().html($('.grid-container').find('table:visible').clone(true).attr('id','dynamic'));
         $('copy-clipboard').slideDown(function(){
           $('body').css('overflow','hidden');
           $('#copyall').trigger('click');
        });
    },
    '.verbose-toggle click': function(el, ev) {
      this.scope.pageState.attr('verboseGrid', !this.scope.pageState.verboseGrid);
    },
    '.bundle-detail-actions img mouseover': function(el, ev) {
      $(".overlay").html("<label class='tooltipMessage'>"+el.data('tooltip')+"</label>");
      $(".overlay").show();
    },
    '.bundle-detail-actions img mouseout': function(el, ev) {
      $(".overlay").hide();
    },
    '.approval-comment .btn click': function(el, ev) {
      var action = el.data('action'),
      selectedBundle = this.scope.pageState.selectedBundle,
      pageState = this.scope.pageState;
      self = this.scope;


      if(!this.scope.havePaymentTypeAndComment(this.scope)) {
        return;
      }

      if(action ==='delete') {
        selectedBundle.bind('destroyed', function() {
          // un-select the selected bundle (we're done here)
          pageState.attr('selectedBundle', null);
        });

        PbrDeleteConfirmModal.displayModal(selectedBundle, {
          action: action,
          approvalComment: self.approvalComment,
          paymentOption: self.paymentType
        });
      } else {

        var bundlePriority = undefined;
        if(this.scope.appstate.userInfo.roleIds.indexOf(constants.ROLES.BM) > -1 ){
          this.scope.isBundlePrioritySet ? bundlePriority = "Y" : bundlePriority = "N";
        }


        selectedBundle.moveInWorkflow({
          action: action,
          approvalComment: this.scope.approvalComment,
          paymentOption: this.scope.paymentType,
          priority:bundlePriority,
          preferredCcy: this.preferredCurr

        }).then(function(response) {

          commonUtils.displayUIMessage( response.responseCode, response.responseText);

          if(response.status === 'SUCCESS') {
            //Alert.displayAlert(response.responseText, 'success' );

            //if the final approval ( 5)  or reject ( 9), remove the bundle
            if(response.paymentBundle.status === 5 || response.paymentBundle.status === 9 ){
              // un-select the selected bundle (we're done here)
              pageState.attr('selectedBundle', null);
              // remove it from the list of bundles too, since the user can't act on it anymore
              var index = pageState.bundles.indexOf(selectedBundle);
              pageState.bundles.splice(index, 1);
            }else{

              self.pageState.selectedBundle.attr("pendingWith",response.paymentBundle.pendingWith);
              self.pageState.selectedBundle.attr("paymentAmt",response.paymentBundle.paymentAmt);
              self.pageState.selectedBundle.attr("status",response.paymentBundle.status);
              self.pageState.selectedBundle.attr("vldtnStatus",response.paymentBundle.vldtnStatus);
              self.pageState.selectedBundle.attr("priority",response.paymentBundle.priority);
              self.pageState.selectedBundle.attr("isDraft",response.paymentBundle.isDraft);
              self.pageState.selectedBundle.attr("docId",response.paymentBundle.docId);
              self.pageState.selectedBundle.attr("generatedFiles",response.paymentBundle.generatedFiles);
              self.pageState.selectedBundle.attr("recallable",response.paymentBundle.recallable);
              self.pageState.selectedBundle.attr("editable",response.paymentBundle.editable);
              self.pageState.selectedBundle.attr("approvable",response.paymentBundle.approvable);

              //else the ROLE is not FC, reload the bottom grid
              self.selectedBundleChanged(self);
            }

          }
        });
      }
    },
    '{scope} selectedTab': function(scope, ev, newTab, oldTab) {
      if(newTab && oldTab && !scope.bundleProgress.isBundleSelectionChange) { // only when *changing* tabs
        this.scope.attr('gridColumns', newTab.columns);
        scope.bundleProgress.triggerValidation = true;
        scope.pageState.attr("validationGrid",false);
        this.scope.resetToken();
        scope.pageState.selectedBundle && scope.getNewDetails(scope.pageState.selectedBundle);
      }
    },
    '{scope} preferredCurr': function(){
      this.scope.getNewDetails(this.scope.pageState.selectedBundle);
    },
    '.btn-download click': function(el, ev) {
      PaymentBundle.downloadFile(el.data('action'),this.scope.pageState.selectedBundle.bundleId);
    },
    'inserted': function() {
      this.scope.selectedBundleChanged(this.scope);
      var self = this;


      $("#tokenSearch").tokenInput([
        {id: 1, name: "Search"} //This is needed
        ],
        {
          theme: "facebook",
          placeholder:"Search...",
          preventDuplicates: true,
          onResult: function (item) {
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


    },
    '{scope} pageState.selectedBundle': function(scope) {
      this.scope.selectedBundleChanged(this.scope);
    },
    '{scope} aggregatePeriod': function(scope) {
      scope.getNewDetails(scope.pageState.selectedBundle);
    },
    '{scope} paymentType': function(scope) {
      scope.getNewDetails(scope.pageState.selectedBundle);
    },
    '.previewInv click': function(el, ev) {
       PaymentBundle.preview(el.data('invoiceid'));
    },
    '{scope.bottomGridPaginateAttr} change': function() {
      //console.log("change event: "+this.scope.bottomGridPaginateAttr.paginateRequest+", othje:"+this.scope.bottomGridPaginateAttr.recordsAvailable);
      if(!this.scope.bottomGridPaginateAttr.attr("isInProgress") && this.scope.bottomGridPaginateAttr.paginateRequest){
        //console.log("change event: "+this.scope.bottomGridPaginateAttr.recordsAvailable);
        this.scope.bottomGridPaginateAttr.attr("isInProgress",true);
        this.scope.getNewDetails(this.scope.pageState.selectedBundle);
      }
    },
    '{scope.pageState} refreshBottomGrid': function() {
      //console.log("refreshBottomGrid chnge event: ");
      this.scope.getNewDetails(this.scope.pageState.selectedBundle);
    },
    // '.information mouseover': function(el, ev) {
    //   var row = el.data('row');
    //   var data = $('<div>').append(information_template())[0].innerHTML;
    //   el.popover({
    //     content: "Information",
    //     html : true,
    //     trigger: 'manual',
    //     placement: 'bottom'
    //   });
    //   el.popover('show');
    // },
    // '.information mouseout': function(el, ev) {
    //   el.popover('hide');
    // },
    '.information click': function(el, ev) {
      var row = el.data('row');
      var data = $('<div>').append(information_template())[0].innerHTML;
      var opt = {
                  dialogClass: 'modalSelectLocation',
                  width: 'auto',
                  autoOpen: false,
                  height: 350,
                  minWidth: 400,
                  open: function(event, ui) {
                    $("#showTableInfo").dialog("widget").position({
                      my: "right top",
                      at: "right top",
                      of: "#payBundleDetailGrid",
                      collision: "flip none"
                    });
                  }
                };
      $(data).dialog(opt).dialog("open");
    },

  }
});




var resetSelectedBundle = function(scope){

  var selectedBundle = scope.pageState.selectedBundle;
  scope.resetToken();
  can.batch.start();
  // clear out selectedRows
  scope.selectedRows.splice(0, scope.selectedRows.length);
  scope.attr("isBundlePrioritySet", false);
  $("#messageDiv").hide();
  $(".previousComments").val();
  $(".previousComments").hide();
  scope.attr("approvalComment", '');
  scope.attr("preferredCurr", '');
  scope.pageState.attr('validationGrid',false);

  canRemoveInvoice(scope.pageState);

  var region = scope.appstate.attr('region') != undefined ? scope.appstate.attr('region').id : "";

  Currency.getCurrByRegion(region).done(function(curr) {


    scope.regionCurr.splice(0, scope.regionCurr.length, ...curr.data);

  });


  // change the columns to be correct
  var tabs = [],
  columns;
  if(['REGULAR_INV'].indexOf(selectedBundle.bundleType) >= 0) {
    // tabs ahoy!
    tabs = bundleTypeColumnSets[selectedBundle.bundleType];
    columns = bundleTypeColumnSets[selectedBundle.bundleType][0].columns;
  } else {
    tabs = bundleTypeColumnSets[selectedBundle.bundleType];
    // no tabs
    columns = bundleTypeColumnSets[selectedBundle.bundleType][0].columns;
  }
  scope.tabs.splice(0, scope.tabs.length, ...tabs);
  scope.attr('selectedTab', scope.tabs.length ? scope.tabs[0] : null);
  scope.gridColumns.splice(0, scope.gridColumns.length);
  scope.gridColumns.attr(columns);

  // clear out the workflow steps
  scope.workflowSteps.splice(0, scope.workflowSteps.length);
  can.batch.stop();

}


var canRemoveInvoice = function(pageState){
  if(pageState.selectedBundle != null && pageState.selectedBundle.editable &&  pageState.attr('selectedBundle.bundleType') === 'REGULAR_INV')
    {
      $(".vertical-line").show();
      $(".remove-invoice").show();
    } else {
      $(".vertical-line").hide();
      $(".remove-invoice").hide();
    }
  }


export default BundleDetailTabs;
