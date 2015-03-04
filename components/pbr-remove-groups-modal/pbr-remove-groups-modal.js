import Component from 'can/component/';
import stache from 'can/view/stache/';

import Alert from 'components/alert/';

import PaymentBundle from 'models/payment-bundle/';

import template from './template.stache!';
import './pbr-remove-groups-modal.less!';
import commonUtils from 'utils/commonUtils';

var PbrRemoveGroupsModal = can.Component.extend({
  tag: 'rn-pbr-remove-groups-modal',
  template: template,
  scope: {
    bundlescope: null,
    invoicelineId:null
  },
  events: {
    init: function() {
      $('rn-pbr-remove-groups-modal').remove();
    },
    inserted: function() {
      console.log(this.scope.bundlescope.invoiceRowsSelected[0].invoiceNumber);
      this.scope.attr("invoicelineId", this.scope.bundlescope.invoiceRowsSelected[0].invoiceNumber);
      this.element.find('.modal').modal({keyboard: false, backdrop: false});
    },
    '.cancel click': function(el, ev) {
      this.element.find('.modal').modal('hide');
      this.element.remove();
    },
    '.submit click': function(el, ev) {
      var self = this;
      this.scope.bundlescope.pageState.selectedBundle.removeBundleGroups(this.scope.bundlescope.invoiceRowsSelected, this.scope.bundlescope.appstate).then(function(response) {
        if(response.status === 'SUCCESS') {
          self.scope.bundlescope.pageState.attr("refreshBottomGrid",!self.scope.bundlescope.pageState.refreshBottomGrid);
        }
        commonUtils.displayUIMessage( response.status, response.responseText);
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
