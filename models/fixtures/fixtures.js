import fixture from 'can/util/fixture/';
import URLs from 'utils/urls';

/*
import fixture_allInvoices from './allInvoices';

import fixture_claimLicensorInvoices from './claimLicensorInvoices';
import recon_ingest_fetch from './recon_ingest_fetch';
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

// Payment Bundles
import fixture_paymentBundle from './payment-bundle';
var BUNDLES = _.times(6, fixture_paymentBundle.makeBundle);
var BUNDLES_WITH_DETAILS = {};

fixture('POST ' + URLs.DOMAIN_SERVICE_URL + 'paymentBundle/getAll', function(req, res, headers) {
  res(200, {
    responseCode: '0000',
    responseText: 'SUCCESS',
    paymentBundles: BUNDLES
  });
});

fixture('POST ' + URLs.DOMAIN_SERVICE_URL + 'paymentBundle/get', function(req, res, headers) {
  var withDetails = fixture_paymentBundle.makeBundleWithDetails(_.find(BUNDLES, {bundleId: req.data.paymentBundle.bundleID}));
  BUNDLES_WITH_DETAILS[req.data.paymentBundle.bundleID] = withDetails;
  return withDetails;
});

fixture('POST ' + URLs.DOMAIN_SERVICE_URL + 'paymentBundle/validationResult', function(req, res, headers) {
  if(! BUNDLES_WITH_DETAILS[req.data.paymentBundle.bundleId]) {
    BUNDLES_WITH_DETAILS[req.data.paymentBundle.bundleId] = fixture_paymentBundle.makeBundleWithDetails(_.find(BUNDLES, {bundleId: req.data.paymentBundle.bundleId}));
  }

  return fixture_paymentBundle.makeBundleValidations(BUNDLES_WITH_DETAILS[req.data.paymentBundle.bundleId]);
});

// Workflow Steps
fixture('POST ' + URLs.UI_SERVICE_URL + 'rinsworkflow/view', '/models/fixtures/workflow-step.json');

// Hole Reports
import fixture_holesreport from './holes-report';
fixture('POST ' + URLs.DOMAIN_SERVICE_URL + 'dashboard/holesreport', function(req, res, headers) {
  res(200, {
    responseCode: 'SUCCESS',
    responseText: 'Records returned successfully',
    holesReport: fixture_holesreport.makeHolesReport()
  });
});

fixture('POST ' + URLs.DOMAIN_SERVICE_URL + 'workflow/analytics/inbox', '/models/fixtures/inbox.json');
fixture('POST ' + URLs.DOMAIN_SERVICE_URL + 'workflow/analytics/outbox', '/models/fixtures/outbox.json');
*/
//Removed Fixture for dashboard payments
//fixture('POST ' + URLs.DOMAIN_SERVICE_URL + 'dashboard/payments', '/models/fixtures/payment-summary.json');
