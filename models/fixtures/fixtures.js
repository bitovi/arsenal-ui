import fixture from 'can/util/fixture/';

import recon_ingest_fetch from './recon_ingest_fetch';
import recon_ingest_reject from './recon_ingest_reject';
import recon_ingest_reject from './recon_ingest_ingest';


fixture('GET /licensors', '/models/fixtures/licensor.json');

fixture('GET /regions', '/models/fixtures/region.json');

import fixture_country from './country';

fixture('GET /storeTypes', '/models/fixtures/store-type.json');
