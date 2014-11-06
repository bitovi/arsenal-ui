import Map from 'can/map/';
import can_define from 'can/map/define/';
import _ from 'lodash';
import Grid from 'components/grid/';

var icsvObj = {
    invoicedata:[
    {
        "responseCode": "SUCCESS",
        "responseText": "Records returned successfully.",
        "summary": {
            "fileCount": "5",
            "invoiceCount": "8",
            "pdfCount": "4",
            "licensorCount": "2",
            "rowCount": "10",
            "errorCount": "20",
            "invoiceTotalMap": {
                "EUR": 20000,
                "DKK": 10000
            }
        },
        "invoices": [
            {
                "serviceTypeId": "1",
                "invoiceNumber": "inv2509",
                "invoiceTypeId": "",
                "entityId": "",
                "entityName": "",
                "invoiceCcy": "DKK",
                "fxRate": 1,
                "notes": "Notes from licensors",
                "invoiceAmount": "2000",
                "tax": "56",
                "grossTotal": "",
                "receivedDate": "06/19/2014",
                "invoiceDate": "06/19/2014",
                "invoiceCalculatedDueDate": "",
                "invoiceDueDate": "09/19/2014",
                "comments": [
                    {
                        "comments": "This is a Regular Invoice comment",
                        "createdBy": "",
                        "createdDate": ""
                    }
                ],
                "documents": [
                    {
                        "fileName": "file.csv",
                        "location": "/path"
                    }
                ],
                "invoiceLines": [
                    {
                        "countryId": "DNK",
                        "fiscalPeriod": "201306",
                        "periodType": "Q",
                        "contentTypeId": "",
                        "contentType": "Music",
                        "lineAmount": "2000.00",
                        "ccidName": "detailFileNameFromIcsv.DAT",
                        "adhocTypeId": "",
                        "glAccRefId": "",
                        "errors": [
                            {
                                "status": "",
                                "errorMap": [
                                    {}
                                ]
                            }
                        ]
                    }
                ],
                "errors": [
                    {
                        "status": "",
                        "errorMap": [
                            {}
                        ]
                    }
                ]
            }
        ]
    }
 ],
uploadiCSV:{

}
},
icsvMap = new can.Map(icsvObj);

export default icsvMap; 