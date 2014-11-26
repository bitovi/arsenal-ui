import _ from 'lodash';
import stache from 'can/view/stache/';
import formats from 'utils/formats';

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
    title: 'Invoice',
    format: formats.currency
  }, {
    id: 'orDispAmt',
    title: 'OverRep',
    verboseOnly: true,
    format: formats.currency
  }, {
    id: 'liDispAmt',
    title: 'Line Item',
    verboseOnly: true,
    format: formats.currency
  }, {
    id: 'reconAmt',
    title: 'Recon',
    verboseOnly: true,
    format: formats.currency
  }, {
    id: 'onaccountAllocatedAmt',
    title: 'OA Allocated',
    verboseOnly: true,
    format: formats.currency
  }, {
    id: 'cashadjAllocatedAmt',
    title: 'CA Allocated',
    verboseOnly: true,
    format: formats.currency
  }, {
    id: 'priorPaid',
    title: 'Prior Paid',
    verboseOnly: true,
    format: formats.currency
  }, {
    id: 'paymentAmt',
    title: 'Net Payment',
    format: formats.currency
  }, {
    id: 'invoiceSaturation',
    title: 'Invoice Sat',
    format: formats.formatIf(isNaN, formats.percent, '')
  }, {
    id: 'paymentSaturation',
    title: 'Pymt Sat',
    format: formats.formatIf(isNaN, formats.percent, '')
  }
];
