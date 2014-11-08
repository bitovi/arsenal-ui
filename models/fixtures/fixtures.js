import fixture from 'can/util/fixture/';

fixture('GET /licensors', '/models/fixtures/licensor.json');

fixture('GET /regions', '/models/fixtures/region.json');

import fixture_country from './country';

fixture('GET /storeTypes', '/models/fixtures/store-type.json');

fixture('POST /rins/upLoad',function() {

   return  {

          "sucesss":"yes",
          "msg" :"File has been uploaded "
      }
  });


