import fixture from 'can/util/fixture/';
import URLs from 'utils/urls';


import fixture_allInvoices from './allInvoices';

import fixture_claimLicensorInvoices from './claimLicensorInvoices';
// import recon_ingest_fetch from './recon_ingest_fetch';
// import recon_ingest_reject from './recon_ingest_reject';
// import recon_ingest_reject from './recon_ingest_ingest';

fixture('GET /licensors', '/models/fixtures/licensor.json');

fixture('GET /licensor', '/models/fixtures/licensor.json');

fixture('GET /country', '/models/fixtures/country.json');

fixture('GET /currency', '/models/fixtures/currency.json');

fixture('GET /invoiceType', '/models/fixtures/invoiceType.json');

fixture('GET /contentType', '/models/fixtures/contentType.json');

fixture('GET /getInvoiceById/{id}', '/models/fixtures/getInvoiceById.json');

fixture('GET /getFXRate', '/models/fixtures/fxrate.json');
fixture('GET /global-licensors', '/models/fixtures/global-licensor.json');

fixture('GET /global-regions', '/models/fixtures/global-region.json');

import fixture_country from './global-country';

fixture('GET /global-storeTypes', '/models/fixtures/global-store-type.json');

fixture('GET /invoiceicsv', '/models/fixtures/icsv.json');

fixture('GET /highchart', '/models/fixtures/highchart.json');

fixture('GET /onAccountBalance', '/models/fixtures/onAccountBalance.json');

fixture('GET /proposedOnAccount', '/models/fixtures/proposedOnAccount.json');


fixture('GET /copyOnAccount', '/models/fixtures/newOnAccount.json');

fixture('GET /storeTypes', '/models/fixtures/store-type.json');

fixture('GET /pricingModels', '/models/fixtures/pricing-models.json');

fixture('GET /pricingModelsFindOne', '/models/fixtures/pricing-model-findone.json');

fixture('GET /highchart', '/models/fixtures/highchart.json');

fixture('GET /getPricingModels', '/models/fixtures/pricingmodel.json');

fixture('GET /getPricingModelVersion', '/models/fixtures/pricingModelVersion.json');

fixture('GET /getPricingMethods', '/models/fixtures/pricingMethods.json');

fixture('GET /validateicsv', '/models/fixtures/validateicsv.json');

/* Payment Bundles */
import fixture_paymentBundle from './payment-bundle';
var BUNDLES = _.times(4, fixture_paymentBundle.makeBundle);

fixture('POST ' + URLs.DOMAIN_SERVICE_URL + 'rins/paymentBundle/getAll', function(req, res, headers) {
  res(200, {
    responseCode: '0000',
    responseTest: 'SUCCESS',
    paymentBundle: BUNDLES
  });
});

fixture('POST ' + URLs.DOMAIN_SERVICE_URL + 'rins/paymentBundle/get', function(req, res, headers) {
  return fixture_paymentBundle.makeBundleWithDetails(req.data.bundleId);
});

/* Workflow Steps */
fixture('POST ' + URLs.UI_SERVICE_URL + 'rins/rinsworkflow/view', '/models/fixtures/workflow-step.json');
