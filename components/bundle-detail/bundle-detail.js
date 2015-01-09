import _ from 'lodash';
import Component from 'can/component/';
import List from 'can/list/';
import stache from 'can/view/stache/';

import PaymentBundleDetailGroup from 'models/payment-bundle/payment-bundle-detail-group';
import PaymentBundleDetail from 'models/payment-bundle/payment-bundle-detail';
import WorkflowStep from 'models/workflow-step/';
import PaymentBundle from 'models/payment-bundle/';

import BundleDetailGrid from 'components/bundle-detail-grid/';
import Switcher from 'components/switcher/';
import WorkflowDisplay from 'components/workflow-display/';
import PbrDeleteConfirmModal from 'components/pbr-delete-confirm-modal/';
import PbrRemoveGroupsModal from 'components/pbr-remove-groups-modal/';
import Alert from 'components/alert/';
import highchartpage from 'components/highchart/';
import Preview from 'components/pbr-preview/';

import columnSets from './column-sets';
import constants from 'utils/constants';
import formats from 'utils/formats';

import template from './template.stache!';
import _less from './bundle-detail.less!';

import tokeninput from 'tokeninput';
import css_tokeninput from 'tokeninput.css!';
import css_tokeninput_theme from 'tokeninput_theme.css!';
import commonUtils from 'utils/commonUtils';

import pdfjs from 'pdfjs';


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
  'ON_ACCOUNT': columnSets.onAccount,
  'ADHOC_INV': columnSets.adHoc,
};

var tokenInput = [];


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
    approvalComment: '',
    details:{},

    havePaymentTypeAndComment: function(scope) {
      return  (this.appstate.userInfo.roleIds.indexOf(constants.ROLES.BM) > -1 ? scope.paymentType : true) &&
      scope.approvalComment.trim().length;
    },

    gridColumns: [],
    selectedRows: [],


    workflowSteps: new WorkflowStep.List([]),

    selectedBundleChanged: function(scope) {
      var selectedBundle = scope.pageState.selectedBundle;
      if(!selectedBundle) {
        return;
      }

      resetSelectedBundle(scope);

      scope.getNewDetails(selectedBundle).then(function(bundle) {
        return WorkflowStep.findAll({
          workflowInstanceId: bundle.approvalId
        });
      }).then(function(steps) {
        scope.workflowSteps.replace(steps);
      });
    },

    gettingDetails: false,
    getNewDetails: function(bundle) {
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

      this.attr('gettingDetails', true);
      return bundle.getDetails(
        this.appstate,
        view,
        this.paymentType,
        tokenInput
      ).then(function(bundle) {
        scope.attr('gettingDetails', false);

        bundle.status === 'FAILURE' ? displayMessage("errorMessage",bundle.responseText) : scope.getNewValidations(bundle);;

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

      if(bundle.status != 1 && !this.appstate.userInfo.roleIds.indexOf(constants.ROLES.BM)){
        return;
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

      if(scope.pageState.selectedBundle === bundle) {
        return bundle.getValidations(view).then(function(bundle) {
          if(bundle.status == 1 && bundle.validationStatus !== 5) {
            setTimeout(function() {
              scope.getNewValidations(bundle);
            }, VALIDATION_CHECK_INTERVAL);
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
    validationStatus: function(options) {
      return this.pageState.selectedBundle && this.pageState.selectedBundle.attr('validationRulesTotal') > 0 ? options.fn(this.pageState.selectedBundle) : '';
    },
    canRemoveInvoice: function(options) {
      if(this.pageState.attr('selectedBundle.bundleType') === 'REGULAR_INV' &&
        this.selectedRows.attr('length') > 0
        && _.every(this.attr('selectedRows'), row => row instanceof PaymentBundleDetailGroup
      )) {
        return options.fn(this);
      } else {
        return '';
      }
    },
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
      return this.havePaymentTypeAndComment(this) ? 'action' : '';
    }
  },
  events: {
    '.remove-invoice click': function(el, ev) {
      PbrRemoveGroupsModal.displayModal(this.scope);

    },
    '.grid-container table>tbody>tr click':function(item, el, ev){

      var alreadySelRow = item.closest("tbody").find("tr.selected");
      alreadySelRow.toggleClass("selected");

      $(item[0]).toggleClass("selected");
      var row = item.closest('tr').data('row').row;

      var className = item.closest('tr').hasClass("child");

      this.scope.details["countryId"]=row.country;
      this.scope.details["requestFrom"]=$(".switcher li.selected").text();
      this.scope.details["licensorId"]=row.entityName;
      this.scope.details["fiscalPeriod"]=row.fiscalPeriod;
      this.scope.details["periodType"]=row.periodType;
      this.scope.details["contentType"]=row.contentGrpName;
      this.scope.details["isChild"]=className;
    },
    '.show-chart click': function(el, ev) {
      // show the chart
      //{"requestFrom":"Licensor","licensorId":"CELAS","countryId":"GBR","fiscalPeriod":201307,"periodType":"P","contentType":"Music"}
      if(this.scope.details.isChild){
        var data = this.scope.details;
        console.log("chart data");console.log(data);
        $("#highChartDetails").append(stache('<high-chart details={data}></high-chart>')({data}));
      }else{
        console.log('Data not set so not showing the chart');
      }
    },
    '#highChartDetails mousedown': function(item, el, ev){
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
    '#highChartDetails mouseup': function(item, el, ev){
      $(item[0]).removeClass("draggable")
    },
    '.excell click': function(el, ev) {
      // export data to Excel

      var self = this;
      self.scope.appstate = self.scope.pageState.selectedBundle;
      self.scope.appstate.attr('excelOutput', true);
      self.scope.appstate.attr('detail', true);
      if(this.scope.appstate.excelOutput ) {
        PaymentBundle.findOne({appstate: this.scope.appstate}).then(function(data) {
          console.log(data);
         if (data != undefined && data["status"] == "SUCCESS" && data["exportExcelFileInfo"] != null) {
            self.scope.appstate.attr("excelOutput",false);
            self.scope.appstate.attr('detail',false);
            $('#exportExcel').html(stache('<export-toexcel csv={data}></export-toexcel>')({data}));
          }
        },function(err){
          console.log(err);
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
    '.approval-comment .buttons .action click': function(el, ev) {
      var action = el.data('action'),
      selectedBundle = this.scope.pageState.selectedBundle,
      pageState = this.scope.pageState;

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
          approvalComment: this.scope.approvalComment,
          paymentOption: this.scope.paymentType
        });
      } else {
        selectedBundle.moveInWorkflow({
          action: action,
          approvalComment: this.scope.approvalComment,
          paymentOption: this.scope.paymentType
        }).then(function(response) {
          if(response.status === 'SUCCESS') {
            //Alert.displayAlert(response.responseText, 'success' );

            displayMessage("successMessage",response.responseText);

            // un-select the selected bundle (we're done here)
            pageState.attr('selectedBundle', null);
            // remove it from the list of bundles too, since the user can't act on it anymore
            var index = pageState.bundles.indexOf(selectedBundle);
            pageState.bundles.splice(index, 1);
          }
        });
      }
    },
    '{scope} selectedTab': function(scope, ev, newTab, oldTab) {
      if(newTab && oldTab) { // only when *changing* tabs
        this.scope.attr('gridColumns', newTab.columns);
        this.scope.resetToken();
        scope.pageState.selectedBundle && scope.getNewDetails(scope.pageState.selectedBundle);
      }
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
    '.preview click': function(el, ev) {
      var row = el.closest('tr').data('row').row;
      Preview.invoicePreview(row.invoiceId);
    }
  }
});



var resetSelectedBundle = function(scope){

  var selectedBundle = scope.pageState.selectedBundle;
  scope.resetToken();
  can.batch.start();
  // clear out selectedRows
  scope.selectedRows.splice(0, scope.selectedRows.length);

  // change the columns to be correct
  var tabs = [],
  columns;
  if(['REGULAR_INV'].indexOf(selectedBundle.bundleType) >= 0) {
    // tabs ahoy!
    tabs = bundleTypeColumnSets[selectedBundle.bundleType];
    columns = bundleTypeColumnSets[selectedBundle.bundleType][0].columns;
  } else {
    // no tabs
    columns = bundleTypeColumnSets[selectedBundle.bundleType];
  }
  scope.tabs.splice(0, scope.tabs.length, ...tabs);
  scope.attr('selectedTab', scope.tabs.length ? scope.tabs[0] : null);
  scope.gridColumns.splice(0, scope.gridColumns.length, ...columns);

  // clear out the workflow steps
  scope.workflowSteps.splice(0, scope.workflowSteps.length);
  can.batch.stop();

}

var displayMessage = function(className,message){
  $("#messageDiv").html("<label class='"+className+"' style='padding: 0px 15px;'>"+message+"</label>")
  $("#messageDiv").show();

  setTimeout(function(){
    $("#messageDiv").hide();
  },constants.MESSAGE_DISPLAY_TIME);

}

export default BundleDetailTabs;
