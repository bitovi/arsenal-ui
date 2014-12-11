import _ from 'lodash';

import fixture from 'can/util/fixture/';

var reconIngest = {
  "status" : "SUCCESS",
  "responseCode": "0000",
  "responseText": "Invoice(s) deleted successfully"
}


fixture('POST detailInvoice/delete', function(req, res, headers) {
  /*  res(
  200,
  _.filter(invoices, {region: req.data.region})
  );*/
  res(
    200, reconIngest
  );
});
