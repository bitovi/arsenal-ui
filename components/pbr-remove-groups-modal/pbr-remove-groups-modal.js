import Component from 'can/component/';
import stache from 'can/view/stache/';

import Alert from 'components/alert/';

import PaymentBundle from 'models/payment-bundle/';

import template from './template.stache!';
import './pbr-remove-groups-modal.less!';

var PbrRemoveGroupsModal = can.Component.extend({
  tag: 'rn-pbr-remove-groups-modal',
  template: template,
  scope: {
    bundlescope: null
  },
  events: {
    init: function() {
      $('rn-pbr-remove-groups-modal').remove();
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
      this.scope.bundlescope.pageState.selectedBundle.removeBundleGroups(this.scope.bundlescope.selectedRows, this.scope.bundlescope.appstate).then(function(response) {
        if(response.status === 'SUCCESS') {
          Alert.displayAlert(response.responseText, 'success');
          self.scope.bundlescope.getNewDetails(self.scope.bundlescope.pageState.selectedBundle);
        }
      });
      this.element.find('.modal').modal('hide');
      this.element.remove();
    }
  }
});

PbrRemoveGroupsModal.displayModal = function(requestScope) {
  //this.scope.pageState.selectedBundle, this.scope.selectedRows, this.scope.appstate,
  $(document.body).append(stache('<rn-pbr-remove-groups-modal bundlescope="{requestScope}"></rn-pbr-remove-groups-modal>')({
    requestScope
  }));
};

export default PbrRemoveGroupsModal;
