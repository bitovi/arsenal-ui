import fixture from 'can/util/fixture/';

import fixture_allInvoices from './allInvoices';

import fixture_claimLicensorInvoices from './claimLicensorInvoices';

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

fixture('GET /highchart', '/models/fixtures/highchart.json');
