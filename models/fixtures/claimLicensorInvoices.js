import _ from 'lodash';

import fixture from 'can/util/fixture/';

var claimLicensorInvoices = [
    {
      "responseHeader": {
        "errorCode": "0000",
        "responseText": "SUCCESS"
      }
    },
    {
      "claimLicensor":  [{
          "entityId": "201",
          "entityName": "AKM",
          "invoiceNumber": "inv2509",
          "paymentCurrency": "DKK",
          "claimLicensorLines": [ 
            {
              "lineId": "",
              "countryId":"AUT",
              "contentType": "music",
              "fiscalPeriod": "201306",
              "periodType": "P",
              "invoiceAmount": "5000",
              "reconAmount": "3000",
              "overRepDisputeAmount": "200",
              "lineItemDisputeAmount": "400",
              "onAccountAllocated": "20",
              "cashAdjustmentAllocated": "20",
              "priorPaid": "0",
              "invPaymentSat": "150",
              "paymentSat": "76",
              "balance": "76",
              "overRepDispPercent": "76",
              "liDispPercent": "76",
              "status": "open"
            },
            {
              "lineId": "",
              "countryId":"AUT",
              "contentType": "video",
              "fiscalPeriod": "201306",
              "periodType": "P",
              "invoiceAmount": "5000",
              "reconAmount": "3000",
              "overRepDisputeAmount": "200",
              "lineItemDisputeAmount": "400",
              "onAccountAllocated": "20",
              "cashAdjustmentAllocated": "20",
              "priorPaid": "0",
              "invPaymentSat": "150",
              "paymentSat": "76",
              "balance": "76",
              "overRepDispPercent": "76",
              "liDispPercent": "76",
              "status": "open"
            }
          ]
      },
      {
          "entityId": "202",
          "entityName": "CELAS",
          "invoiceNumber": "inv2509",
          "paymentCurrency": "DKK",
          "claimLicensorLines": [ 
            {
              "lineId": "",
              "countryId":"AUT",
              "contentType": "music",
              "fiscalPeriod": "201306",
              "periodType": "P",
              "invoiceAmount": "5000",
              "reconAmount": "3000",
              "overRepDisputeAmount": "200",
              "lineItemDisputeAmount": "400",
              "onAccountAllocated": "20",
              "cashAdjustmentAllocated": "20",
              "priorPaid": "0",
              "invPaymentSat": "150",
              "paymentSat": "76",
              "balance": "76",
              "overRepDispPercent": "76",
              "liDispPercent": "76",
              "status": "open"
            },
            {
              "lineId": "",
              "countryId":"HUN",
              "contentType": "music",
              "fiscalPeriod": "201306",
              "periodType": "P",
              "invoiceAmount": "5000",
              "reconAmount": "3000",
              "overRepDisputeAmount": "200",
              "lineItemDisputeAmount": "400",
              "onAccountAllocated": "20",
              "cashAdjustmentAllocated": "20",
              "priorPaid": "0",
              "invPaymentSat": "150",
              "paymentSat": "76",
              "balance": "76",
              "overRepDispPercent": "76",
              "liDispPercent": "76",
              "status": "open"
            }
          ]
      },
      {
          "entityId": "203",
          "entityName": "UMPI",
          "invoiceNumber": "inv2509",
          "paymentCurrency": "DKK",
          "claimLicensorLines": [ 
            {
              "lineId": "",
              "countryId":"AUT",
              "contentType": "music",
              "fiscalPeriod": "201306",
              "periodType": "P",
              "invoiceAmount": "5000",
              "reconAmount": "3000",
              "overRepDisputeAmount": "200",
              "lineItemDisputeAmount": "400",
              "onAccountAllocated": "20",
              "cashAdjustmentAllocated": "20",
              "priorPaid": "0",
              "invPaymentSat": "150",
              "paymentSat": "76",
              "balance": "76",
              "overRepDispPercent": "76",
              "liDispPercent": "76",
              "status": "open"
            },
            {
              "lineId": "",
              "countryId":"AUT",
              "contentType": "music",
              "fiscalPeriod": "201306",
              "periodType": "P",
              "invoiceAmount": "5000",
              "reconAmount": "3000",
              "overRepDisputeAmount": "200",
              "lineItemDisputeAmount": "400",
              "onAccountAllocated": "20",
              "cashAdjustmentAllocated": "20",
              "priorPaid": "0",
              "invPaymentSat": "150",
              "paymentSat": "76",
              "balance": "76",
              "overRepDispPercent": "76",
              "liDispPercent": "76",
              "status": "open"
            }
          ]
      }]
    }
];


fixture('GET /GetClaimLicensor', function(req, res, headers) {
/*  res(
    200,
    _.filter(invoices, {region: req.data.region})
  );*/
  res(
    200, claimLicensorInvoices
  );
});