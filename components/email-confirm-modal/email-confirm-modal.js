import Component from 'can/component/';

import ReminderEmail from 'models/reminder-email/';

import template from './template.stache!';
import './email-confirm-modal.less!';

var EmailConfirmModal = can.Component.extend({
  tag: 'rn-email-confirm-modal',
  template: template,
  scope: {
    approval: null
  },
  events: {
    init: function() {
      $('rn-email-confirm-modal').remove();
    },
    inserted: function(el, ev) {
      this.element.find('.modal').modal({keyboard: false, backdrop: false});
    },
    '.cancel click': function(el, ev) {
      this.element.find('.modal').modal('hide');
      this.element.remove();
    },
    '.submit click': function(el, ev) {
      ReminderEmail.create({
        approval: this.scope.approval
      })
      this.element.find('.modal').modal('hide');
      this.element.remove();
    }
  }
});

export default EmailConfirmModal;
