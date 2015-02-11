import _ from 'lodash';
import $ from 'jquery';
import Component from 'can/component/';
import UserReq from 'utils/request/';
import Approval from 'models/approval/';

import InboxGrid from 'components/inbox-grid/';
import OutboxGrid from 'components/outbox-grid/';

import template from './template.stache!';
import styles from './dashboard-approvals.less!';
import gridUtils from 'utils/gridUtil';
import commonUtils from 'utils/commonUtils';

var DashboardApprovals = Component.extend({
  tag: 'rn-dashboard-approvals',
  template: template,
  scope: {
    appstate:undefined,
    inboxRows: [],
    outboxRows: [],
    mailboxType: "@",
    inboxnumberofrows: "@",
    outboxnumberofrows: "@",
    inboxScrollTop: 0,
    inboxOffset: 0,
    outboxScrollTop: 0,
    outboxOffset: 0,
    recordsAvailable: false,
    sortColumns:[],
    sortDirection: "asc",
    populateDefaultData:'@'
  },
  helpers: {
    inboxItemCount: function() {
      return this.attr('inboxnumberofrows') > 0 ? '(' + this.inboxnumberofrows + ')' : '';
    },
    outboxItemCount: function() {
      return this.attr('outboxnumberofrows') > 0 ? '(' + this.outboxnumberofrows + ')' : '';
    }
  },
  events: {
    inserted: function() {
      var self = this;

      var tbody = self.element.find('tbody');
      //setting tbody height which determines the page height- start
      var getTblBodyHght=gridUtils.getTableBodyHeight('inboxGrid',42);
      gridUtils.setElementHeight(tbody[0],getTblBodyHght,getTblBodyHght);
      gridUtils.setElementHeight(tbody[1],getTblBodyHght,getTblBodyHght);

      self.scope.mailboxType = 'inbox';
      fetchInboxOutbox(this.scope);

      self.scope.mailboxType = 'outbox';
      fetchInboxOutbox(this.scope);
    },
    "tbody>tr td dblclick": function(item, el, ev){
        // var self = this;
        // var row = el.data('row').row;
        // var screenName =  "licensor";//el.closest('input .valueScreenName');
        // var tableId = 599;//el.closest('input .valueId');
        //
        // if(screenName!= undefined && screenName!= null && screenName != "") {
        //
        //   self.scope.appstate.attr("screenName", screenName);
        //
        // }
        //
        // if(tableId!= undefined && tableId!= null && tableId != "") {
        //
        //   //self.scope.appstate("tableId", tableId);
        //   self.scope.appstate.attr("tableId", 599);
        //
        // }

        //screenName = "licensor";
        //
        // if( screenName!= undefined && screenName!= null && tableId!= undefined && tableId!= null ) {
        //
        //   if(screenName == 'licensor') {
        //
        //     self.scope.appstate.attr('page','licensor');
        //
        //   } else if(screenName == 'licensorcountry') {
        //
        //     self.scope.appstate.attr('page','ref-licensorcountry');
        //
        //   } else if(screenName == 'country') {
        //
        //     self.scope.appstate.attr('page','ref-country');
        //
        //   } else if(screenName == 'pricing-models') {
        //
        //     self.scope.appstate.attr('page','pricing-models');
        //
        //   }
        //
        // } else {
        //
        //   self.scope.appstate.attr('page','payment-bundles');
        //
        // }
        //
        // self.scope.appstate.attr('page','payment-bundles');

        //if(el.data('row') == undefined) return false;




    },
    '{scope.appstate} change': function() {
      if(this.scope.isGlobalSearch != this.scope.appstate.attr('globalSearch')){
        fetchInboxOutbox(this.scope);
      }
    }
  }
});

var fetchInboxOutbox = function(scope){

    if(scope.appstate.attr('globalSearchButtonClicked')===true){
      scope.attr("inboxOffset",0);
      scope.attr("outboxOffset",0);
      scope.attr("inboxScrollTop",0);
      scope.attr("outboxScrollTop",0);
      scope.sortColumns.replace([]);
      scope.attr("sortDirection","asc");
    }

    if(scope.mailboxType == 'inbox'){
      Approval.findAll({
          mailbox: 'inbox',
          offset: scope.inboxOffset
        }).then(function(approvals) {
          $('#inboxGrid .loading_img').remove();
            if(approvals != undefined){
              if(approvals.status == "FAILURE"){
              $("#messageDiv").html("<label class='errorMessage'>"+data.responseText+"</label>");
              $("#messageDiv").show();
              setTimeout(function(){
                $("#messageDiv").hide();
              },4000);
              console.error("Failed to load the Inbox :"+data.responseText);

            }else{
                if(scope.inboxOffset===0){
                  scope.inboxRows.replace(approvals);
                }else {
                  $.merge(scope.inboxRows, approvals);
                  scope.inboxRows.replace(scope.inboxRows);
                }
                scope.inboxRows.attr('recordsAvailable', approvals.recordsAvailable);
                scope.attr('inboxnumberofrows', approvals.totalRecords);
            }
          }else{
             scope.inboxRows.replace([]);
          }

        },function(xhr){
          console.error("Error while loading: FetchInbox"+xhr);

        });
    }else{
        Approval.findAll({
            mailbox: 'outbox',
            offset: scope.outboxOffset
          }).then(function(approvals) {
            $('#outboxGrid .loading_img').remove();
            if(approvals != undefined){
                if(approvals.status == "FAILURE"){
                $("#messageDiv").html("<label class='errorMessage'>"+data.responseText+"</label>");
                $("#messageDiv").show();
                setTimeout(function(){
                  $("#messageDiv").hide();
                },4000);
                console.error("Failed to load the Outbox :"+data.responseText);

              }else{
                if(scope.outboxOffset===0){
                  scope.outboxRows.replace(approvals);
                }else {
                  $.merge(scope.outboxRows, approvals);
                  scope.outboxRows.replace(scope.outboxRows);
                }
                scope.outboxRows.attr('recordsAvailable', approvals.recordsAvailable);
                scope.attr('outboxnumberofrows', approvals.totalRecords);
              }
            }else{
              scope.outboxRows.replace([]);
            }

          },function(xhr){
            console.error("Error while loading: FetchOutbox"+xhr);

          });
    }
};



export default DashboardApprovals;
