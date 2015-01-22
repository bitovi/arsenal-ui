import Component from 'can/component/';
import stache from 'can/view/stache/';

import Alert from 'components/alert/';

import PaymentBundle from 'models/payment-bundle/';

import template from './template.stache!';
import './pbr-preview.less!';
import PaymentBundle from 'models/payment-bundle/';

var PbrPreview = can.Component.extend({
  tag: 'rn-pbr-preview',
  template: template,
  scope: {
    data:null
  },
  events: {
    init: function() {
      $('rn-pbr-preview').remove();
    },
    inserted: function() {
      this.element.find('.modal').modal({keyboard: true, backdrop: false});


    }
  }
});

PbrPreview.invoicePreview = function(invoiceId) {
  console.log("Preview :"+invoiceId)

  PaymentBundle.preview(invoiceId).done(function(data){
    $(document.body).append(stache('<rn-pbr-preview data="{data}"></rn-pbr-preview>')({
      data
    }));

  });

};

export default PbrPreview;
