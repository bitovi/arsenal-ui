import Map from 'can/map/';
import can_define from 'can/map/define/';

var icsvObj = {invoiceid: '',
icsv: {"invoice": [
    {
        "serviceTypeId": "1",
        "invoiceNumber": "inv2510",
        "invoiceTypeId": "",
        "entityId": "40",
        "entityName": "NCB",
        "invoiceCcy": "DKK",
        "fxRate": 1,
        "notes": "Notes from licensors",
        "invoiceAmount": "2000",
        "tax": "56",
        "grossTotal": "2056",
        "receivedDate": "06/19/2014",
        "invoiceDate": "06/19/2014",
        "invoiceCalculatedDueDate": "",
        "invoiceDueDate": "09/19/2014",
        "comments": [
                {
                    "comments": "iCSVGeneratedInvoice",
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
                "countryId": "DKK",
                "fiscalPeriod": "201306",
                "periodType": "Q",
	            "contentTypeId": "1",
        		"contentType": "Music",
        		"lineAmount": "2000.00",
        		"ccidName": "detailFileNameFromIcsv.DAT",
        		"errors":[
                	{
                		"status":"",
                		"errorMap":[{}]
                	}	
                ]
            }
        ]       
   },
   {
        "serviceTypeId": "1",
        "invoiceNumber": "inv2509",
        "invoiceTypeId": "",
        "entityId": "40",
        "entityName": "NCB",
        "invoiceCcy": "DKK",
        "fxRate": 1,
        "notes": "Notes from licensors",
        "invoiceAmount": "2000",
        "tax": "56",
        "grossTotal": "2056",
        "receivedDate": "06/19/2014",
        "invoiceDate": "06/19/2014",
        "invoiceCalculatedDueDate": "",
        "invoiceDueDate": "09/19/2014",
        "comments": [
                {
                    "comments": "iCSVGeneratedInvoice",
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
                "countryId": "DKK",
                "fiscalPeriod": "201306",
                "periodType": "Q",
	            "contentTypeId": "1",
        		"contentType": "Music",
        		"lineAmount": "2000.00",
        		"ccidName": "detailFileNameFromIcsv.DAT",
        		"errors":[
                	{
                		"status":"",
                		"errorMap":[{}]
                	}	
                ]
            }
        ]       
   }
   
 ]
}


},
icsvMap = new can.Map(icsvObj);

export default icsvMap; 