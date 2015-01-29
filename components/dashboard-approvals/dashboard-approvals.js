import _ from 'lodash';
import $ from 'jquery';
import Component from 'can/component/';

import Approval from 'models/approval/';

import InboxGrid from 'components/inbox-grid/';
import OutboxGrid from 'components/outbox-grid/';

import template from './template.stache!';
import styles from './dashboard-approvals.less!';

var DashboardApprovals = Component.extend({
  tag: 'rn-dashboard-approvals',
  template: template,
  scope: {
    inboxRows: [],
    outboxRows: [],
    inboxnumberofrows: "@",
    outboxnumberofrows: "@",
  },
  helpers: {
    inboxItemCount: function() {
      return this.inboxRows.attr('length') > 0 ? '(' + this.inboxRows.length + ')' : '';
    }
  },
  events: {
    inserted: function() {
      var self = this;

      Approval.findAll({
        mailbox: 'inbox'
      }).then(function(approvals) {
        self.scope.inboxRows.replace(approvals);
        self.scope.attr('inboxnumberofrows',self.scope.inboxRows.length);
      });

      Approval.findAll({
        mailbox: 'outbox'
      }).then(function(approvals) {
        self.scope.outboxRows.replace(approvals);
        self.scope.attr('outboxnumberofrows',self.scope.outboxRows.length);
      });

    },
    "tbody>tr td dblclick": function(item, el, ev){
        var self = this;
        self.scope.appstate.attr('page','payment-bundles');
    }
  }
});

export default DashboardApprovals;
