import Component from 'can/component/';
import stache from 'can/view/stache/';

import PaymentBundle from 'models/payment-bundle/';

import template from './template.stache!';
import './pbr-delete-confirm-modal.less!';

var PbrDeleteConfirmModal = can.Component.extend({
  tag: 'rn-pbr-delete-confirm-modal',
  template: template,
  scope: {
    bundle: null,
    params: {}
  },
  events: {
    init: function() {
      $('rn-pbr-delete-confirm-modal').remove();
    },
    inserted: function() {
      this.element.find('.modal').modal({keyboard: false, backdrop: false});
    },
    '.cancel click': function(el, ev) {
      this.element.find('.modal').modal('hide');
      this.element.remove();
    },
    '.submit click': function(el, ev) {
      var self = this;
      this.scope.bundle.moveInWorkflow(this.scope.params).then(function(result) {
        if(result.status === 'SUCCESS') {
          self.scope.bundle.destroy();
        }
      });
      this.element.find('.modal').modal('hide');
      this.element.remove();
    }
  }
});

PbrDeleteConfirmModal.displayModal = function(bundle, params) {
  $(document.body).append(stache('<rn-pbr-delete-confirm-modal bundle="{bundle}" params="{params}"></rn-pbr-delete-confirm-modal>')({
    bundle,
    params
  }));
};

export default PbrDeleteConfirmModal;
