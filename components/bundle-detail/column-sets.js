import _ from 'lodash';
import stache from 'can/view/stache/';
import formats from 'utils/formats';

var columns = {
  'toggle': {
    id: 'toggle',
    title: '<span class="open-toggle-all"></span>',
    contents: function(row) { return stache('{{#unless isChild}}<span class="open-toggle"></span>{{/unless}}')({isChild: row.__isChild}); }
  },
  'validations': {
    id: 'validations',
    title: '<img src="/resources/images/rn_WarningActive@2x.png"/>',
    contents: function(row) {
      return stache('{{#if validationMessages.length}}<img src="/resources/images/rn_WarningSelected@2x.png" {{data \'row\'}}/>{{/if}}')(row);
    },
    validationsOnly: true
  },
  'licensor': {
    id: 'licensor',
    title: 'Licensor',
    contents: row => row.__isChild ? '' : row.entityName
  },
  'invoiceNumber': {
    id: 'invoiceNumber',
    title: 'Invoice #',
    contents: row => row.__isChild ? '' : row.invoiceNumber
  },
  'paymentCcy': {
    id: 'paymentCcy',
    title: 'Currency'
  },
  'fiscalPeriod': {
    id: 'fiscalPeriod',
    title: 'Period'
  },
  'country': {
    id: 'country',
    title: 'Country',
  },
  'contentGrpName': {
    id: 'contentGrpName',
    title: 'Content Type'
  },
  'invoiceAmt': {
    id: 'invoiceAmt',
    title: 'Invoice',
    format: formats.currency
  },
  'orDispAmt': {
    id: 'orDispAmt',
    title: 'OverRep',
    verboseOnly: true,
    format: formats.currency
  },
  'liDispAmt': {
    id: 'liDispAmt',
    title: 'Line Item',
    verboseOnly: true,
    format: formats.currency
  },
  'reconAmt': {
    id: 'reconAmt',
    title: 'Recon',
    verboseOnly: true,
    format: formats.currency
  },
  'onaccountAllocatedAmt': {
    id: 'onaccountAllocatedAmt',
    title: 'OA Allocated',
    verboseOnly: true,
    format: formats.currency
  },
  'cashadjAllocatedAmt': {
    id: 'cashadjAllocatedAmt',
    title: 'CA Allocated',
    verboseOnly: true,
    format: formats.currency
  },
  'priorPaid': {
    id: 'priorPaid',
    title: 'Prior Paid',
    verboseOnly: true,
    format: formats.currency
  },
  'paymentAmt': {
    id: 'paymentAmt',
    title: 'Net Payment',
    format: formats.currency
  },
  'invoiceSaturation': {
    id: 'invoiceSaturation',
    title: 'Invoice Sat',
    format: formats.formatIf(_.isNumber, formats.percent, '0%')
  },
  'paymentSaturation': {
    id: 'paymentSaturation',
    title: 'Pymt Sat',
    format: formats.formatIf(_.isNumber, formats.percent, '0%')
  },
  'adhocTypeId': {
    id: 'adhocTypeId',
    title: 'AdHoc Type',
    format: formats.formatIf(_.isNumber, formats.int, '')
  }
};

var sets = {
  regularLicensor: _.map(['toggle', 'validations', 'licensor', 'invoiceNumber', 'paymentCcy', 'fiscalPeriod', 'country', 'contentGrpName', 'invoiceAmt', 'orDispAmt', 'liDispAmt', 'reconAmt', 'onaccountAllocatedAmt', 'cashadjAllocatedAmt', 'priorPaid', 'paymentAmt', 'invoiceSaturation', 'paymentSaturation'], colID => columns[colID]),
  regularCountry: _.map(['toggle', 'validations', 'country', 'fiscalPeriod', 'licensor', 'paymentCcy','contentGrpName', 'invoiceAmt', 'orDispAmt', 'liDispAmt', 'reconAmt', 'onaccountAllocatedAmt', 'cashadjAllocatedAmt', 'priorPaid', 'paymentAmt', 'invoiceSaturation', 'paymentSaturation'], colID => columns[colID]),
  onAccount: _.map(['toggle', 'validations', 'licensor', 'paymentCcy', 'fiscalPeriod', 'country', 'contentGrpName', 'paymentAmt'], colID => columns[colID]),
  adHoc: _.map(['toggle', 'validations', 'licensor', 'invoiceNumber', 'paymentCcy', 'fiscalPeriod', 'country', 'adhocTypeId', 'invoiceAmt', 'paymentAmt'], colID => columns[colID])
}

export default sets;
export {columns as columns};
