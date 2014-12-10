import _ from 'lodash';

import fixture from 'can/util/fixture/';

var reconIngest = {
  "status" : "SUCCESS",
  "responseCode": "0000",
  "responseText": "Invoices scheduled for Ingestion"
}


fixture('POST detailInvoice/ingest', function(req, res, headers) {
  /*  res(
  200,
  _.filter(invoices, {region: req.data.region})
  );*/
  res(
    200, reconIngest
  );
});
