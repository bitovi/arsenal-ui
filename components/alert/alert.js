import $ from 'jquery';
import stache from 'can/view/stache/';
import Component from 'can/component/';

import _less from './alert.less!';
import template from './template.stache!';

var Alert = Component.extend({
  tag: 'rn-alert',
  template: template,
  scope: {
    message: 'Alert!',
    type: 'warning',
    timeout: 3000
  },
  events: {
    'inserted': function() {
      var self = this;

      self.element.hide().fadeIn(function() {
        setTimeout(function() {
          $(self.element).fadeOut(function() {
            self.element.remove();
          });
        }, self.scope.timeout);
      });
    }
  }
});

Alert.displayAlert = function(message, type) {
  type = ['success', 'info', 'warning', 'danger'].indexOf(type) < 0 ? 'info' : type;
  $(document.body).append(stache('<rn-alert message="' + message + '" type="' + type + '"></rn-alert>')({}));
};

export default Alert;
