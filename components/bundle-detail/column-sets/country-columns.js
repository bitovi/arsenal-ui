import stache from 'can/view/stache/';

export default [
  {
    id: 'toggle',
    title: '<span class="open-toggle-all"></span>',
    contents: function(row) { return stache('{{#unless isChild}}<span class="open-toggle"></span>{{/unless}}')({isChild: row.__isChild}); }
  }, {
    id: 'validations',
    title: '<img src="/resources/images/rn_WarningActive@2x.png"/>',
    contents: function(row) { return stache('{{#if validationMessages.length}}<img src="/resources/images/rn_WarningSelected@2x.png" {{data \'row\'}}/>{{/if}}')(row); },
    validationsOnly: true
  }, {
    id: 'country',
    title: 'Country'
  }, {
    id: 'fiscalPeriod',
    title: 'Period'
  }, {
    id: 'licensor',
    title: 'Licensor',
    contents: row => row.entityName
  }, {
    id: 'paymentCcy',
    title: 'Currency'
  }, {
    id: 'contentGrpName',
    title: 'Content Type'
  }, {
    id: 'invoiceAmt',
    title: 'Invoice'
  }, {
    id: 'orDispAmt',
    title: 'OverRep',
    verboseOnly: true
  }, {
    id: 'liDispAmt',
    title: 'Line Item',
    verboseOnly: true
  }, {
    id: 'reconAmt',
    title: 'Recon',
    verboseOnly: true
  }, {
    id: 'onaccountAllocatedAmt',
    title: 'OA Allocated',
    verboseOnly: true
  }, {
    id: 'cashadjAllocatedAmt',
    title: 'CA Allocated',
    verboseOnly: true
  }, {
    id: 'priorPaid',
    title: 'Prior Paid',
    verboseOnly: true
  }, {
    id: 'netPayment',
    title: 'Net Payment',
    contents: row => 0
  }, {
    id: 'invoiceSaturation',
    title: 'Invoice Sat'
  }, {
    id: 'paymentSaturation',
    title: 'Pymt Sat'
  }
];
