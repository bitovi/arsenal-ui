import _ from 'lodash';
import fixture from 'can/util/fixture/';

var makeBundleDetails = function(bundle, invoice) {
  return _.times(3, function(i) {
    return {
      "bndlLineId": 170 + i,
      "bundleId": bundle.bundleId,
      "invoiceId": invoice.invoiceId,
      "invoiceNumber": invoice.invoiceNumber,
      "refLineId": 2405,
      "refLineType": "REGULAR_INV",
      "serviceTypeId": 1,
      "serviceTypeName": "iTunes Downloads",
      "entityId": 17,
      "entityName": "CELAS",
      "country": "BEL",
      "contentGrpId": 1,
      "contentGrpName": "Music",
      "fiscalPeriod": 201404,
      "periodType": "P",
      "paymentCcy": "EUR",
      "invoiceAmt": 2700.0,
      "reconAmt": 2700.0,
      "orDispAmt": 0.0,
      "liDispAmt": 0.0,
      "priorPaid": 0.0,
      "proposedAmt": 2700.0,
      "paymentAmt": 2700.0,
      "onaccountAllocatedAmt": 0.0,
      "cashadjAllocatedAmt": 0.0,
      "invoiceSaturation": 0.0,
      "paymentSaturation": 0.0,
      "paymentOption": 2,
      "glAccRefId": 5,
      "vldtnBatchId": 0,
      "createdBy": 2002005712,
      "modifiedBy": 2002005712,
      "createdDate": 1415864207000,
      "modifiedDate": 1415864207000,
      "onaccountDebits": {
        "balanceId": 0,
        "balanceBeforeTxn": 0.0,
        "txnAmt": 0.0,
        "balanceAfterTxn": 0.0
      },
      "cashAdjDebits": {
         "balanceId": 0,
         "balanceBeforeTxn": 0.0,
         "txnAmt": 0.0,
         "balanceAfterTxn": 0.0
      }
    };
  });
};

var makeInvoices = function(bundle) {
  return _.times(3, function(j) {
    var invoice = {
      "invoiceId": 2402 + j,
      "invoiceNumber": "#" + (2402 + j),
      "refLineId": 2405 + j,
      "refLineType": "REGULAR_INV",
      "entityId": 17,
      "entityName": "CELAS",
      "country": "BEL",
      "fiscalPeriod": 201404,
      "periodType": "P",
      "paymentCcy": "EUR",
      "invoiceAmt": 2700.0,
      "reconAmt": 2700.0,
      "orDispAmt": 0.0,
      "liDispAmt": 0.0,
      "priorPaid": 0.0,
      "proposedAmt": 2700.0,
      "paymentAmt": 2700.0,
      "onaccountAllocatedAmt": 0.0,
      "cashadjAllocatedAmt": 0.0,
      "paymentOption": 2,
      "onAccountBalance": 5400.0,
      "proposedOnAccount": 5400.0,
      "createdBy": 2002005712,
      "modifiedBy": 2002005712,
      "createdDate": 1415864207000,
      "modifiedDate": 1415864207000,
    };

    invoice.bundleDetails = makeBundleDetails(bundle, invoice);

    return invoice;
  });
};

var makeFooter = function(bundle) {
  return {
    currency: 'EUR',
    invoiceAmt: 54,
    lineAmt: 53,
    reconAmt: 52,
    orDispAmt: 51,
    liDispAmt: 50,
    priorPaid: 49,
    proposedAmt: 48,
    paymentAmt: 47,
    onaccountAllocatedAmt: 46,
    cashadjAllocatedAmt: 45,
    paymentSaturation: 44,
    balance: 43,
    bdlFooterDetails: _.map(['GBP', 'USD', 'JPY'], (currency) => ({
      currency: currency,
      invoiceAmt: 45,
      lineAmt: 44,
      reconAmt: 43,
      orDispAmt: 42,
      liDispAmt: 41,
      priorPaid: 40,
      proposedAmt: 39,
      paymentAmt: 38,
      onaccountAllocatedAmt: 37,
      cashadjAllocatedAmt: 36,
      paymentSaturation: 35,
      balance: 34,
      bdlFooterDetails: null
    }))
  };
};

var makeBundleValidations = function(bundle) {
  return {
    paymentBundle: {
      bundleId: bundle.bundleId,
      bundleName: bundle.bundleName,
      view: 'COUNTRY',
      vldtnStatus: null,
      bundleDetailsGroup: _.map(bundle.bundleDetailsGroup, function(invoice) {
        return {
          bundleId: bundle.bundleId,
          invoiceId: invoice.invoiceId,
          vldtnBatchResultColor: '#bada55',
          vldtnMessage: ['Frobnitz needs to be kibitz\'d.', 'Poiuyt is unstable.'],
          bundleDetails: _.map(invoice.bundleDetails, function(detail) {
            return {
              bundleId: bundle.bundleId,
              invoiceId: invoice.invoiceId,
              bndlLineId: detail.bndlLineId,
              vldtnBatchResultColor: '#a55bad',
              vldtnMessage: [['Frobnitz needs to be kibitz\'d.', 'Poiuyt is unstable.'][_.random(0, 1)]],
              vldtnRulesCompletedCnt: 1,
              vldtnRulesTotalCnt: 2
            };
          })
        };
      })
    }
  };
};

var makeBundleWithDetails = function(bundleId) {
  var bundle = {
    "bundleId": bundleId,
    "bundleName": "Europe Q1Fy14 UK Invoices " + bundleId,
    "bundleType": "REGULAR_INV",
    "periodFrom": 201401,
    "periodTo": 201404,
    "proposedAmt": 10800.0,
    "paymentAmt": 4800.0,
    "onaccountAllocated": 0.0,
    "cashadjAllocated": 0.0,
    "paymentCcy": "EUR",
    "invoiceSaturation": 0.0,
    "paymentSaturation": 0.0,
    "status": 1,
    "paymentOption": 0,
    "approvalId": 54321543,
    "totalPaymentAmount": 4800.0,
    "paymentType": 0,
    "lastModifiedBy": 2002005712,
    "createdBy": 2002005712,
    "vldtnStatus": 0,
    "view": "COUNTRY",
    "periodType": "P",
    "createdDate": "2014-11-13",
    "modifiedDate": "2014-11-13",
  };

  bundle.bundleDetailsGroup = makeInvoices(bundle);
  bundle.bdlFooter = makeFooter(bundle);

  return bundle;
};

var makeBundle = function() {
  var id = _.random(10000, 20000);
  return {
    "bundleId": id,
    "bundleName":"Europe Q1Fy14 UK Invoices " + id,
    "totalPaymentAmount": 122349.61,
    "paymentCurrency" : "EUR",
    "bundleType":"Regular",
    "periodType":"P",
    "periodFrom":"201303",
    "periodTo":"201303",
    "region":"Europe",
    "pendingWith":"Brina Collins",
    "state":"Proposed",
    "validationCode": "1",
    "pendingDays":10,
    "isHighPriority": "Y",
    "isEditable": false,
    "isRecallable": false,
    "isDeletable": true
  };
};

export default {
  makeBundle,
  makeBundleWithDetails,
  makeBundleValidations
};
