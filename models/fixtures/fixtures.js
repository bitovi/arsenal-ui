import fixture from 'can/util/fixture/';

import fixture_allInvoices from './allInvoices';

fixture('GET /licensor', '/models/fixtures/licensor.json');

fixture('GET /country', '/models/fixtures/country.json');

fixture('GET /currency', '/models/fixtures/currency.json');

fixture('GET /invoiceType', '/models/fixtures/invoiceType.json');

fixture('GET /contentType', '/models/fixtures/contentType.json');

fixture('GET /getInvoiceById/1024', '/models/fixtures/getInvoiceById.json');

fixture('GET /fxrate', '/models/fixtures/fxrate.json');

