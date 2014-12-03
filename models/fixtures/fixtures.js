import fixture from 'can/util/fixture/';

import fixture_claimLicensorInvoices from './claimLicensorInvoices';

fixture('GET /licensors', '/models/fixtures/licensor.json');

fixture('GET /regions', '/models/fixtures/region.json');

import fixture_country from './country';

fixture('GET /storeTypes', '/models/fixtures/store-type.json');

fixture('GET /highchart', '/models/fixtures/highchart.json');

fixture('GET /onAccountBalance', '/models/fixtures/onAccountBalance.json');

fixture('GET /proposedOnAccount', '/models/fixtures/proposedOnAccount.json');

fixture('GET /copyOnAccount', '/models/fixtures/newOnAccount.json');
