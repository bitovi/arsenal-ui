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
    bundle: null,
    groups: [],
    appstate: null
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
      this.scope.bundle.removeBundleGroups(this.scope.groups, this.scope.appstate).then(function(response) {
        if(response.status === 'SUCCESS') {
          Alert.displayAlert(response.responseText, 'success');
        }
      });
      this.element.find('.modal').modal('hide');
      this.element.remove();
    }
  }
});

PbrRemoveGroupsModal.displayModal = function(bundle, groups, appstate) {
  $(document.body).append(stache('<rn-pbr-remove-groups-modal bundle="{bundle}" groups="{groups}" appstate="{appstate}"></rn-pbr-remove-groups-modal>')({
    bundle,
    groups,
    appstate
  }));
};

export default PbrRemoveGroupsModal;
