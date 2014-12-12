import Component from 'can/component/';

import ReminderEmail from 'models/reminder-email';

import template from './template.stache!';

var EmailConfirmModal = can.Component.extend({
  tag: 'rn-email-confirm-modal',
  template: template,
  scope: {
    recipient: '',
    description: ''
  },
  events: {
    inserted: function(el, ev) {
      $(this.tag).modal({keyboard: false});
    },
    '.cancel click': function(el, ev) {
      $(this.tag).remove();
    },
    '.remind click': function(el, ev) {
      $(this.tag).remove();
    }
  }
})
