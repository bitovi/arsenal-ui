import fixture from 'can/util/fixture/';

import fixture_allInvoices from './allInvoices';

fixture('GET /licensor', '/models/fixtures/licensor.json');

fixture('GET /country', '/models/fixtures/country.json');

fixture('GET /currency', '/models/fixtures/currency.json');

fixture('GET /invoiceType', '/models/fixtures/invoiceType.json');

fixture('GET /contentType', '/models/fixtures/contentType.json');

fixture('GET /getInvoiceById/1024', '/models/fixtures/getInvoiceById.json');

<<<<<<< HEAD
fixture('GET /fxrate', '/models/fixtures/fxrate.json');
=======
fixture('GET /global-licensors', '/models/fixtures/global-licensor.json');

fixture('GET /global-regions', '/models/fixtures/global-region.json');

import fixture_country from './global-country';

fixture('GET /global-storeTypes', '/models/fixtures/global-store-type.json');
>>>>>>> 49cb2f29b3a0d41f730f5baba112f2f9e675effe

