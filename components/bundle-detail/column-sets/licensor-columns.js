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
    contents: function(row) { return stache('{{#if validationMessages.length}}<img src="/resources/images/rn_WarningSelected@2x.png"/>{{/if}}')(row); },
    validationsOnly: true
  }, {
    id: 'licensor',
    title: 'Licensor',
    contents: row => row.__isChild ? '' : row.entityName
  }, {
    id: 'invoiceNumber',
    title: 'Invoice #',
    contents: row => row.__isChild ? '' : row.invoiceNumber
  }, {
    id: 'paymentCcy',
    title: 'Currency'
  }, {
    id: 'fiscalPeriod',
    title: 'Period'
  }, {
    id: 'country',
    title: 'Country',
  }, {
    id: 'contentGrpName',
    title: 'ContentType'
  }, {
    id: 'invoiceAmt',
    title: 'Invoice',
    format: formats.currency
  }, {
    id: 'orDispAm',
    title: 'OverRep',
    verboseOnly: true,
    format: formats.currency
  }, {
    id: 'liDispAmt',
    title: 'Line Item',
    verboseOnly: true,
    format: formats.currency
  }, {
    id: 'reconAmount',
    title: 'Recon',
    verboseOnly: true,
    format: formats.currency
  }, {
    id: 'onaccountAllocatedAmt',
    title: 'OA Allocated',
    verboseOnly: true,
    format: formats.currency
  }, {
    id: 'cashAdjAllocatedAmt',
    title: 'CA Allocated',
    verboseOnly: true,
    format: formats.currency
  }, {
    id: 'priorPaid',
    title: 'Prior Paid',
    verboseOnly: true,
    format: formats.currency
  }, {
    id: 'netPayment',
    title: 'Net Payment',
    contents: row => 0
  }, {
    id: 'invoiceSaturation',
    title: 'Invoice Sat',
    format: formats.formatIf(_.isNumber, formats.percent, '0%')
  }, {
    id: 'paymentSaturation',
    title: 'Pymt Sat',
    format: formats.formatIf(_.isNumber, formats.percent, '0%')
  }
];
