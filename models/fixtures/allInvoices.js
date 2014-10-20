import _ from 'lodash';

import fixture from 'can/util/fixture/';

var invoices = [
    {
      "responseHeader": {
        "errorCode": "0000",
        "responseText": "SUCCESS"
      }
    },
    {
      "invoice":  [{
          "id": "6788",
          "invoiceNumber": "inv2509",
          "invoiceTypeId": 500,
          "invoiceTypeName": "Invoice1",
          "entityId": "201",
          "entityName": "AKM",
          "invoiceCcy": "DKK",
          "fxRate": 1,
          "notes": "Notes from licensors",
          "periodType": "P",
          "invoiceAmount": "7000",
          "tax": "56",
          "grossTotal": "2056",
          "userAdjAmt": "",
          "bundleName": "EUROPE P07 FY14 INVOICES",
          "bundleId": "3456",
          "status": "Open",
          "paymentState": "",
          "receivedDate": "06/19/2014",
          "invoiceDate": "06/19/2014",
          "invoiceCalculatedDueDate": "09/24/2014", 
          "invoiceDueDate": "09/19/2014",
          "comments": [
          {
              "id": "",
              "commentId": "",
              "comments": "This is a Regular Invoice comment",
              "createdBy": "12345",
              "createdDate": "06/19/2014"
          }],
          "invoiceLines": [ 
            {
              "invoiceId": "",
              "countryId": "121",
              "countryName":"AUT",
              "invoiceCcy": "DKK",
              "fiscalPeriod": "201306",
              "periodType": "P",
              "contentType": "music",
              "lineAmount": "3000",
              "adhocTypeId": "",
              "glAccount": ""
            },
            {
              "invoiceId": "",
              "countryId": "121",
              "countryName":"AUT",
              "invoiceCcy": "DKK",
              "fiscalPeriod": "201306",
              "periodType": "P",
              "contentType": "video",
              "lineAmount": "4000",
              "adhocTypeId": "",
              "glAccount": ""
            }
          ]
      },
      {
          "id": "7188",
          "invoiceNumber": "inv3210",
          "invoiceTypeId": 501,
          "invoiceTypeName": "Invoice2",
          "entityId": "202",
          "entityName": "AEPI",
          "invoiceCcy": "DKK",
          "fxRate": 1,
          "notes": "Notes from licensors",
          "periodType": "P",
          "invoiceAmount": "5000",
          "tax": "56",
          "grossTotal": "2056",
          "userAdjAmt": "",
          "bundleName": "EUROPE P07 FY14 INVOICES",
          "bundleId": "3456",
          "status": "Open",
          "paymentState": "",
          "receivedDate": "06/19/2014",
          "invoiceDate": "06/19/2014",
          "invoiceCalculatedDueDate": "09/24/2014", 
          "invoiceDueDate": "09/19/2014",
          "comments": [
          {
              "id": "",
              "commentId": "",
              "comments": "This is a Regular Invoice comment",
              "createdBy": "12345",
              "createdDate": "06/19/2014"
          }],
          "invoiceLines": [ 
            {
              "invoiceId": "",
              "countryId": "202",
              "countryName":"AUT",
              "invoiceCcy": "DKK",
              "fiscalPeriod": "201306",
              "periodType": "P",
              "contentType": "music",
              "lineAmount": "3000",
              "adhocTypeId": "",
              "glAccount": ""
            },
            {
              "invoiceId": "",
              "countryId": "202",
              "countryName":"DNK",
              "invoiceCcy": "DKK",
              "fiscalPeriod": "201306",
              "periodType": "P",
              "contentType": "music",
              "lineAmount": "2000",
              "adhocTypeId": "",
              "glAccount": ""
            }
          ]
      },
      {
          "id": "8237",
          "invoiceNumber": "inv3210",
          "invoiceTypeId": 502,
          "invoiceTypeName": "Invoice3",
          "entityId": "202",
          "entityName": "UMPI",
          "invoiceCcy": "DKK",
          "fxRate": 1,
          "notes": "Notes from licensors",
          "periodType": "P",
          "invoiceAmount": "9000",
          "tax": "56",
          "grossTotal": "2056",
          "userAdjAmt": "",
          "bundleName": "EUROPE P07 FY14 INVOICES",
          "bundleId": "3456",
          "status": "Open",
          "paymentState": "",
          "receivedDate": "06/19/2014",
          "invoiceDate": "06/19/2014",
          "invoiceCalculatedDueDate": "09/24/2014", 
          "invoiceDueDate": "09/19/2014",
          "comments": [
          {
              "id": "",
              "commentId": "",
              "comments": "This is a Regular Invoice comment",
              "createdBy": "12345",
              "createdDate": "06/19/2014"
          }],
          "invoiceLines": [ 
            {
              "invoiceId": "",
              "countryId": "202",
              "countryName":"AUT",
              "invoiceCcy": "DKK",
              "fiscalPeriod": "201306",
              "periodType": "P",
              "contentType": "music",
              "lineAmount": "4000",
              "adhocTypeId": "",
              "glAccount": ""
            },
            {
              "invoiceId": "",
              "countryId": "202",
              "countryName":"AUT",
              "invoiceCcy": "DKK",
              "fiscalPeriod": "201306",
              "periodType": "P",
              "contentType": "music",
              "lineAmount": "5000",
              "adhocTypeId": "",
              "glAccount": ""
            }
          ]
      }]
    }
];


fixture('GET /allInvoices', function(req, res, headers) {
/*  res(
    200,
    _.filter(invoices, {region: req.data.region})
  );*/
  res(
    200, invoices
  );
});